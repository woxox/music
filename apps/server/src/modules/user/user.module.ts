import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';
import { User } from './entity/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User]), forwardRef(() => AuthModule)],
  providers: [UserService],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
