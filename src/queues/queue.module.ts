import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppQueues } from 'src/queues/queue.type';

function redisOptions(configService: ConfigService) {
  return {
    host: configService.get('redis.host'),
    port: configService.get('redis.port'),
  };
}

const BullQueueModule = BullModule.registerQueueAsync({
  name: AppQueues.photo,
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => {
    return {
      name: AppQueues.photo,
      options: {
        redis: redisOptions(configService),
        maxStalledCount: 0,
      },
    };
  },
  inject: [ConfigService],
});

@Module({
  imports: [BullQueueModule],
  exports: [BullQueueModule],
})
export class QueueModule {}
