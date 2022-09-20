import { IsNotEmpty, MaxLength } from 'class-validator';
import { EntityHelper } from 'src/utils/entity-helper';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ApiProperty } from '@nestjs/swagger';
import { ChatDialogEntity } from './chat-dialog.entity';
import { BeforeInsert } from 'typeorm';
import getShortId from 'src/utils/short-id-generator';
import { User } from 'src/users/entities/user.entity';
import { Exclude } from 'class-transformer';

@Entity({ name: 'chat-message' })
export class ChatMessageEntity extends EntityHelper {
  @Exclude({ toPlainOnly: true })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'cbcfa8b8-3a25-4adb-a9c6-e325f0d0f3ae' })
  @Column()
  @Index({ unique: true })
  uuid: string;

  @ApiProperty({ example: 'Hello world!' })
  @MaxLength(256)
  @Column()
  message: string;

  @ManyToOne(() => User) // TO-DO
  @JoinColumn()
  @IsNotEmpty()
  @Index()
  sender: User;

  @ManyToOne(() => ChatDialogEntity, (dialog) => dialog.messages)
  @JoinColumn()
  @IsNotEmpty()
  @Index()
  dialog: ChatDialogEntity;

  @Column({ default: false })
  readed: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @BeforeInsert()
  uuidUpdater() {
    this.uuid = getShortId(16);
  }
}
