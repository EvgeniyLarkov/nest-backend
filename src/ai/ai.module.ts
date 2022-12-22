import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { Character } from './entities/character.entity';
import { HttpModule } from '@nestjs/axios';
import { AIRequestService } from './ai-request.service';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { AiQueuesService } from './ai.queues.service';
import { QueueModule } from 'src/queues/queue.module';
import { FilesModule } from 'src/files/files.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Character]),
    UsersModule,
    ConfigModule,
    BullModule,
    QueueModule,
    FilesModule,
    HttpModule.register({
      timeout: 15000,
      maxRedirects: 5,
    }),
  ],
  controllers: [AiController],
  providers: [AiService, AIRequestService, AiQueuesService],
})
export class AiModule {}
