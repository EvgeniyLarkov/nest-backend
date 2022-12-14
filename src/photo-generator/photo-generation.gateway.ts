import { On, Once } from '@discord-nestjs/core';
import { Injectable, Logger } from '@nestjs/common';
import { Message } from 'discord.js';

@Injectable()
export class PhotoGeneratorGateway {
  private readonly logger = new Logger('Photo gen service');

  @Once('ready')
  onReady(): void {
    this.logger.log('Photo generation service started');
  }

  @On('messageCreate')
  onMessage(message: Message): void {
    this.logger.log(message.content, message.attachments);
  }

  @On('messageUpdate')
  onMessageUpdate(message: Message): void {
    this.logger.log(message.content, message.attachments);
  }
}
