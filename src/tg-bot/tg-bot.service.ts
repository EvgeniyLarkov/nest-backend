import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectBot } from 'nestjs-telegraf';
import { FileEntity } from 'src/files/entities/file.entity';
import { Telegraf } from 'telegraf';
import { TgContext } from './types/tg-context';

@Injectable()
export class TgBotService {
  private chatId: string;

  constructor(
    private readonly configService: ConfigService,
    // private readonly logger: AppLogger,
    @InjectBot() private bot: Telegraf<TgContext>,
  ) {
    this.chatId = configService.get('telegram.chat');
  }

  async send(message: string): Promise<void> {
    try {
      await this.bot.telegram.sendMessage(this.chatId, message, {
        parse_mode: 'HTML',
      });
    } catch (err) {
      // this.logger.error(
      //   `Error sending message "${message}" to chat. Error ${err}`,
      // );
    }
  }

  async sendPhoto(photo: FileEntity): Promise<void> {
    try {
      await this.bot.telegram.sendPhoto(this.chatId, { url: photo.path });
    } catch (err) {
      // this.logger.error(
      //   `Error sending photo "${photo.uuid}" to chat. Error ${err}`,
      // );
    }
  }

  async pipePhoto(source: Buffer): Promise<void> {
    try {
      await this.bot.telegram.sendPhoto(this.chatId, { source });
    } catch (err) {
      // this.logger.error(`Error sending buffer photo to chat. Error ${err}`);
    }
  }
}
