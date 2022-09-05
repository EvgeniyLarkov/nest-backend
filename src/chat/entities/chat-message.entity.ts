import { IsNotEmpty, MaxLength } from 'class-validator';
import { EntityHelper } from 'src/utils/entity-helper';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Generated,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
  UpdateDateColumn,
} from 'typeorm';

import { ApiProperty } from '@nestjs/swagger';
import { ChatDialogEntity } from './chat-dialog.entity';

@Entity({ name: 'chat-message' })
export class ChatMessageEntity extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'cbcfa8b8-3a25-4adb-a9c6-e325f0d0f3ae' })
  @Column('uuid')
  @Generated('uuid')
  @Index({ unique: true })
  uuid: string;

  @ApiProperty({ example: 'Hello world!' })
  @MaxLength(256)
  @Column()
  message: string;

  @ApiProperty({ example: 12, name: 'User id' })
  @IsNotEmpty()
  @Column()
  sender: number;

  @ManyToOne(() => ChatDialogEntity, (dialog) => dialog.messages)
  @JoinColumn({ name: 'dialogId' })
  @IsNotEmpty()
  @Index()
  dialog: ChatDialogEntity;

  @Column({ nullable: true })
  @IsNotEmpty()
  dialogId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
