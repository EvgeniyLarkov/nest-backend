import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import { TgBotGateway } from './tg-bot.gateway';
import { TgBotService } from './tg-bot.service';

@Module({
  imports: [
    TelegrafModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        token: configService.get('telegram.key'),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [TgBotGateway, TgBotService],
  exports: [TgBotService],
})
export class TgBotModule {}
