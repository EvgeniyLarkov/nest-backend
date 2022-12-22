import { Module, CacheModule } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import databaseConfig from './config/database.config';
import authConfig from './config/auth.config';
import appConfig from './config/app.config';
import mailConfig from './config/mail.config';
import fileConfig from './config/file.config';
import facebookConfig from './config/facebook.config';
import googleConfig from './config/google.config';
import twitterConfig from './config/twitter.config';
import appleConfig from './config/apple.config';
import * as path from 'path';
import { redisStore } from 'cache-manager-redis-store';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthAppleModule } from './auth-apple/auth-apple.module';
import { AuthFacebookModule } from './auth-facebook/auth-facebook.module';
import { AuthGoogleModule } from './auth-google/auth-google.module';
import { AuthTwitterModule } from './auth-twitter/auth-twitter.module';
import { I18nModule } from 'nestjs-i18n/dist/i18n.module';
import { I18nJsonParser } from 'nestjs-i18n/dist/parsers/i18n.json.parser';
import { HeaderResolver } from 'nestjs-i18n';
import { MailConfigService } from './mail/mail-config.service';
import { ForgotModule } from './forgot/forgot.module';
import { MailModule } from './mail/mail.module';
import { HomeModule } from './home/home.module';
import { ChatModule } from './chat/chat.module';
import { FilesModule } from './files/files.module';
import { AiModule } from './ai/ai.module';
import aiConfig from './config/ai.config';
import discordConfig from './config/discord.config';
import { PhotoGeneratorModule } from './photo-generator/photo-generator.module';
import { DatabaseModule } from './database/database.module';
import { IsExist } from './shared/validators/is-exists.validator';
import { SharedModule } from './shared/shared.module';
import { TgBotModule } from './tg-bot/tg-bot.module';
import telegramConfig from './config/telegram.config';
import { LoggerModule } from './logger/app-logger.module';
import { BullModule } from '@nestjs/bull';
import redisConfig from './config/redis.config';
import { QueueModule } from './queues/queue.module';

@Module({
  imports: [
    LoggerModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        databaseConfig,
        authConfig,
        appConfig,
        mailConfig,
        fileConfig,
        facebookConfig,
        googleConfig,
        twitterConfig,
        appleConfig,
        aiConfig,
        discordConfig,
        telegramConfig,
        redisConfig,
      ],
      envFilePath: ['.env'],
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    CacheModule.registerAsync<any>({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const store = await redisStore({
          socket: {
            host: configService.get('redis.host'),
            port: configService.get('redis.port'),
          },
          // password: configService.get('redis.password'),
        });
        return {
          store: () => store,
        };
      },
      inject: [ConfigService],
    }),
    MailerModule.forRootAsync({
      useClass: MailConfigService,
    }),
    I18nModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        fallbackLanguage: configService.get('app.fallbackLanguage'),
        parserOptions: {
          path: path.join(
            configService.get('app.workingDirectory'),
            'src',
            'i18n',
            'translations',
          ),
        },
      }),
      parser: I18nJsonParser,
      inject: [ConfigService],
      resolvers: [new HeaderResolver(['x-custom-lang'])],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('redis.host'),
          port: configService.get('redis.port'),
          // password: configService.get('redis.password'),
        },
      }),
      inject: [ConfigService],
    }),
    QueueModule,
    SharedModule,
    DatabaseModule,
    UsersModule,
    FilesModule,
    AuthModule,
    AuthFacebookModule,
    AuthGoogleModule,
    AuthTwitterModule,
    AuthAppleModule,
    ForgotModule,
    MailModule,
    HomeModule,
    ChatModule,
    AiModule,
    PhotoGeneratorModule,
    TgBotModule,
  ],
  providers: [IsExist],
  exports: [BullModule],
})
export class AppModule {}
