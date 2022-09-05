import { EntityHelper } from 'src/utils/entity-helper';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Generated,
  Index,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ApiProperty } from '@nestjs/swagger';
import { ChatMessageEntity } from './chat-message.entity';
import { User } from 'src/users/entities/user.entity';

@Entity({ name: 'chat-dialog' })
export class ChatDialogEntity extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'cbcfa8b8-3a25-4adb-a9c6-e325f0d0f3ae' })
  @Column('uuid')
  @Generated('uuid')
  @Index({ unique: true })
  uuid: string;

  @ManyToMany(() => User, (user) => user.dialogs, {
    eager: true,
  })
  @JoinTable()
  participants: User[];

  @OneToMany(() => ChatMessageEntity, (message) => message.dialog)
  messages: ChatMessageEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
