import { ConsoleLogger, Injectable, Scope } from '@nestjs/common';
import { FileEntity } from 'src/files/entities/file.entity';
import { TgBotService } from 'src/tg-bot/tg-bot.service';

@Injectable({ scope: Scope.TRANSIENT })
export class AppLogger extends ConsoleLogger {
  private prefix?: string = '';

  constructor(private readonly tgService: TgBotService) {
    super();
  }

  error(message: string, stack?: string) {
    void this.tgService.send(this.styleTgOutput(message, 'error'));
    super.error(message, stack);
  }

  log(message: unknown) {
    super.log(message, this.context || 'Unknown');
  }

  logTg(message: string) {
    const styledMessage = this.styleTgOutput(message);

    this.log(message);
    void this.tgService.send(styledMessage);
  }

  sendPhoto(photo: FileEntity) {
    void this.tgService.sendPhoto(photo);
  }

  async pipePhoto(photo: Buffer) {
    await this.tgService.pipePhoto(photo);
  }

  styleTgOutput(message: string, type: 'log' | 'warn' | 'error' = 'log') {
    const thisContext = this.context;

    const typesToIcons = {
      log: '✅',
      warn: '⚠',
      error: '🆘',
    };

    return `${
      typesToIcons[type]
    } [${new Date().toLocaleString()}] <b>${thisContext}</b>: ${message}`;
  }
}
