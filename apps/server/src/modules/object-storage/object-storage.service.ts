import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';

import { Region, SimpleAuthenticationDetailsProvider } from 'oci-common';
import { ObjectStorageClient } from 'oci-objectstorage';
import { CreatePreauthenticatedRequestDetails } from 'oci-objectstorage/lib/model';
import { PutObjectRequest } from 'oci-objectstorage/lib/request';
import { Readable } from 'stream';
import { Repository } from 'typeorm';

import { ObjectMeta } from './entity/objectMeta.entity';

@Injectable()
export class ObjectStorageService {
  private logger = new Logger(ObjectStorageService.name);
  private oracleAuthProvider: SimpleAuthenticationDetailsProvider;
  private oracleObjectStorageClient: ObjectStorageClient;

  constructor(
    @InjectRepository(ObjectMeta)
    private readonly objectMetaRepository: Repository<ObjectMeta>,
    private readonly configService: ConfigService,
  ) {
    this.oracleAuthProvider = new SimpleAuthenticationDetailsProvider(
      configService.getOrThrow('OCI_TENANCY'),
      configService.getOrThrow('OCI_USER'),
      configService.getOrThrow('OCI_FINGERPRINT'),
      configService.getOrThrow('OCI_PRIVATEKEY'),
      null,
      Region.fromRegionId(configService.getOrThrow('OCI_REGION')),
    );

    this.oracleObjectStorageClient = new ObjectStorageClient({
      authenticationDetailsProvider: this.oracleAuthProvider,
    });
  }

  async save(dataStream: Readable, name: string, type: string) {
    const putObjectRequest: PutObjectRequest = {
      namespaceName: this.configService.getOrThrow('OCI_STORAGE_NAMESPACE'),
      bucketName: this.configService.getOrThrow('OCI_STORAGE_BUCKET'),
      objectName: name,
      contentType: type,
      putObjectBody: dataStream,
    };
    const putObjectResponse = await this.oracleObjectStorageClient.putObject(putObjectRequest);
    this.logger.debug('put finish', putObjectResponse);

    const existObject = await this.objectMetaRepository.findOneBy({ name });
    if (existObject) {
      const mergedObjcet = this.objectMetaRepository.merge(existObject, { name, type });
      return this.objectMetaRepository.save(mergedObjcet);
    }

    const object = this.objectMetaRepository.create({ name, type });
    return this.objectMetaRepository.save(object);
  }

  async getPreAuthedUrl(name: string, expiresInSec: number) {
    const objectMeta = await this.objectMetaRepository.findOneBy({ name });
    if (!objectMeta) throw new NotFoundException('object를 찾을 수 없습니다.');

    const expires = new Date(Date.now() + expiresInSec * 1000);
    const uniqueRequestId = Date.now();
    const createPreauthedRequest =
      await this.oracleObjectStorageClient.createPreauthenticatedRequest({
        createPreauthenticatedRequestDetails: {
          name: uniqueRequestId.toString(),
          objectName: name,
          accessType: CreatePreauthenticatedRequestDetails.AccessType.ObjectRead,
          timeExpires: expires,
        },
        bucketName: this.configService.getOrThrow('OCI_STORAGE_BUCKET'),
        namespaceName: this.configService.getOrThrow('OCI_STORAGE_NAMESPACE'),
      });

    const baseUrl =
      'https://' +
      [
        this.configService.getOrThrow('OCI_STORAGE_NAMESPACE'),
        'objectstorage',
        this.configService.getOrThrow('OCI_REGION'),
        'oci.customer-oci.com',
      ].join('.');
    return baseUrl + createPreauthedRequest.preauthenticatedRequest.accessUri;
  }
}
