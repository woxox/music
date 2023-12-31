import { MiddlewareConsumer, Module, NestModule, ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigurationModule } from './libs/config/config.module';
import { DatabaseModule } from './libs/database/database.module';
import { HttpLoggerMiddleware } from './libs/logging/http-logger.middleware';
import { AuthModule } from './modules/auth/auth.module';
import { JwtMiddleware } from './modules/auth/middleware/jwt.middleware';
import { ImageModule } from './modules/image/image.module';
import { MusicModule } from './modules/music/music.module';
import { ObjectStorageModule } from './modules/object-storage/object-storage.module';
import { PlayHistoryModule } from './modules/play-history/play-history.module';
import { PlaylistModule } from './modules/playlist/playlist.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    ConfigurationModule,
    DatabaseModule,
    UserModule,
    AuthModule,
    MusicModule,
    PlaylistModule,
    ObjectStorageModule,
    ImageModule,
    PlayHistoryModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtMiddleware).forRoutes('*');
    consumer.apply(HttpLoggerMiddleware).forRoutes('*');
  }
}
