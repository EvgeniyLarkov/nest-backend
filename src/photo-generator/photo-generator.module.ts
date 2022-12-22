import { DiscordModule } from '@discord-nestjs/core';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GatewayIntentBits } from 'discord.js';
import { QueueModule } from 'src/queues/queue.module';
import { PhotoGeneratorGateway } from './photo-generation.gateway';
import { PhotoGenerationObserver } from './photo-generator.observer';
import { PhotoGeneratorService } from './photo-generator.service';

@Module({
  imports: [
    ConfigModule,
    DiscordModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        token: configService.get('discord.key'),
        discordClientOptions: {
          intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
          ],
        },
      }),
      inject: [ConfigService],
    }),
    BullModule,
    QueueModule,
  ],
  providers: [
    PhotoGeneratorGateway,
    PhotoGeneratorService,
    PhotoGenerationObserver,
  ],
})
export class PhotoGeneratorModule {}
