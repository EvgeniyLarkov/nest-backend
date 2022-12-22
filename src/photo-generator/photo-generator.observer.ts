import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { Message } from 'discord.js';
import { AppLogger } from 'src/logger/app-logger.service';
import { getPrefixedHash } from 'src/utils/get-prefixed-hash';
import { AppQueues, PhotoJobNames } from 'src/queues/queue.type';

@Injectable()
export class PhotoGenerationObserver {
  private readonly internalProgress = new Map<string, number>();

  constructor(
    private readonly logger: AppLogger,
    @InjectQueue(AppQueues.photo) private photoQueue: Queue,
  ) {
    this.logger.setContext('PhotoGenerationObserver');
  }

  async handleUpdateMessage(message: Message) {
    const { content, attachments, author, reactions } = message;

    if (author.id !== '936929561302675456') {
      return;
    }

    const thisContent = reactions.message ? reactions.message.content : content;
    const thisAttachments = reactions.message
      ? reactions.message.attachments
      : attachments;

    const regexPureText = /\*\*(.+?)\*\*/.exec(thisContent);

    if (!regexPureText[1]) {
      this.logger.error(
        `Failed to parse message from discord, message: "${thisContent}"`,
      );
      return null;
    }
    const pureText = regexPureText[1].replace(' --v 4', '').trim();

    const hash = getPrefixedHash(PhotoJobNames.image, pureText);
    const rawProgress = /\(([0-9]{1,3}%)\)/.exec(thisContent);

    const cachedProgress = this.internalProgress.get(hash);

    if ((!rawProgress || !rawProgress[1]) && !cachedProgress) {
      this.logger.log('Image generation started');
      this.internalProgress.set(hash, 0);
      return null;
    }

    const job = await this.photoQueue.getJob(hash);

    if (!job) {
      this.logger.error(
        `Cant find job (hash = ${hash}) for message: ${pureText}`,
      );
      return null;
    }

    let progress = rawProgress[1];

    if (!rawProgress[1] && cachedProgress > 50) {
      progress = `100%`;
    }

    const progressToNum = parseInt(progress.slice(0, -1));
    this.internalProgress.set(hash, progressToNum);

    if (progressToNum < 0 || progressToNum > 100) {
      this.logger.error(
        `An unexpected error occured during progress decoding, progress: ${progress}, progress to num: ${progressToNum}`,
      );
      await job.moveToFailed({
        message: 'Failed to parse progress',
      });
      return null;
    }

    if (progressToNum !== 100) {
      this.logger.log(`Progress for job ${hash} - ${progressToNum}%`);
      await job.progress(progressToNum);
      return null;
    } else {
      this.logger.log(`Job completed ${hash}`);
      await job.moveToCompleted({
        ...job.data,
        content: thisAttachments,
      });
    }
  }
}
