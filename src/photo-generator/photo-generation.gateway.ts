import { On, Once } from '@discord-nestjs/core';
import { Injectable } from '@nestjs/common';
import { Message } from 'discord.js';
import { AppLogger } from 'src/logger/app-logger.service';
import { PhotoGenerationObserver } from './photo-generator.observer';

@Injectable()
export class PhotoGeneratorGateway {
  constructor(
    private readonly logger: AppLogger,
    private readonly observerService: PhotoGenerationObserver,
  ) {
    this.logger.setContext('PhotoGenerationGateway');
  }

  @Once('ready')
  onReady(): void {
    this.logger.log('Photo generation service started');
  }

  @On('messageCreate')
  async onMessage(message: Message) {
    await this.observerService.handleUpdateMessage(message);
  }

  @On('messageUpdate')
  async onMessageUpdate(message: Message) {
    await this.observerService.handleUpdateMessage(message);
  }
}
