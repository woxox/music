import { HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';

import { Model } from '@music/types';
import { Profile, Strategy } from 'passport-google-oauth20';

import { CustomStrategy, GoogleUserInfo } from '../auth.interface';

@Injectable()
export class GoogleStrategy
  extends PassportStrategy(Strategy, 'google')
  implements CustomStrategy<GoogleUserInfo>
{
  params: Record<string, any>;

  constructor(private readonly configService: ConfigService) {
    const params = {
      authorizationURL: 'https://accounts.google.com/o/oauth2/v2/auth',
      clientID: configService.getOrThrow('GOOGLE_OAUTH_CLIENT_ID'),
      clientSecret: configService.getOrThrow('GOOGLE_OAUTH_CLIENT_SECRET'),
      scope: ['email', 'profile'],
    };

    super(params);
    this.params = params;
  }

  getParameter() {
    return {
      client_id: this.params.clientID,
      scope: this.params.scope,
      response_type: 'code',
    };
  }

  getAuthorizationURL() {
    return this.params.authorizationURL;
  }

  parseErrorResponse(body: any, status: number): Error {
    console.log(body, status);
    return super.parseErrorResponse(body, status);
  }

  async getProfile(code: string, redirect_uri: string): Promise<GoogleUserInfo> {
    const { accessToken } = await this.getOAuthAccessToken(code, { redirect_uri });
    const profile = await this.getUserProfile(accessToken);
    return {
      provider: Model.Provider.GOOGLE,
      providerId: profile.id,
      name: [profile.name.familyName, profile.name.givenName].filter((v) => !!v).join(' '),
      email: profile?.emails?.[0]?.value ?? null,
      profileImage: profile?.photos?.[0]?.value ?? null,
    };
  }

  private async getOAuthAccessToken(
    code: string,
    options?: Record<string, any>,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    return new Promise((resolve, reject) => {
      const params = {
        grant_type: 'authorization_code',
        ...options,
      };
      this._oauth2.getOAuthAccessToken(code, params, (err, accessToken, refreshToken) => {
        if (err) {
          return reject(
            new HttpException(
              `Fail to get GoogleOAuth AccessToken, response: ${err.data}`,
              err.statusCode,
            ),
          );
        }
        resolve({ accessToken, refreshToken });
      });
    });
  }

  private async getUserProfile(accessToken: string): Promise<Profile> {
    return new Promise((resolve, reject) => {
      this.userProfile(accessToken, (err, profile) => {
        if (err)
          return reject(
            new InternalServerErrorException(`Fail to get Profile, ${err.name} ${err.message}`),
          );
        resolve(profile);
      });
    });
  }
}
