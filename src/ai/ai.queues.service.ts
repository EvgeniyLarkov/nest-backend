import { Injectable, HttpStatus } from '@nestjs/common';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import {
  AppQueues,
  photoBaseJobData,
  PhotoJobNames,
  PhotoJobTimeouts,
} from 'src/queues/queue.type';
import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { getProbabilityBasedKey } from 'src/characteristics-engine/helpers';
import { AiService } from './ai.service';
import { getPrefixedHash } from 'src/utils/get-prefixed-hash';
import { AppLogger } from 'src/logger/app-logger.service';

@Injectable()
export class AiQueuesService {
  constructor(
    @InjectQueue(AppQueues.photo) private photoQueue: Queue,
    private aiService: AiService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext('PhotoGenerationObserver');
  }

  async createPhoto(characterHash: string) {
    const character = await this.aiService.findOne({ hash: characterHash });

    if (!character) {
      throw new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            email: 'notFound',
          },
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const photoPrompt = this.aiService.engine.getPhotoPrompt(
      {
        name: character.firstName,
        surname: character.lastName,
        gender: 'female',
        ...character,
      },
      {
        location: getProbabilityBasedKey(this.aiService.engine.photoLocations),
        type: getProbabilityBasedKey(this.aiService.engine.photoTypes),
      },
    );

    const jobData: photoBaseJobData = {
      characterHash: character.hash,
      prompt: photoPrompt,
      hash: getPrefixedHash(PhotoJobNames.base, photoPrompt),
    };

    const existingJob = await this.photoQueue.getJob(jobData.hash);

    if (existingJob) {
      this.logger.log(
        `Find existing job with same id ${jobData.hash}, removing from query`,
      );

      await existingJob.remove();
    }

    await this.photoQueue.add(PhotoJobNames.base, jobData, {
      jobId: jobData.hash,
      timeout: PhotoJobTimeouts.base,
    });

    return jobData;
  }

  async createTestJob() {
    // await this.photoQueue.add(PhotoJobNames.test, 'test', {
    //   timeout: PhotoJobTimeouts.base,
    // });
    // return true;

    return await this.aiService.addPhotoToCharacter(
      'xXxRPpP0nu',
      'https://cdn.discordapp.com/attachments/1052256214119104552/1054666041994776616/Server_Admin_realistic_in_full_growth_photo_of_charming_23_year_75986cfe-7741-457b-9e44-9d95f18712ae.png',
    );
  }
}
