import { EntityHelper } from 'src/utils/entity-helper';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ChatMessageEntity } from './chat-message.entity';
import { User } from 'src/users/entities/user.entity';
import getShortId from 'src/utils/short-id-generator';
import { ChatLastEntity } from './chat-last.entity';
import { Exclude } from 'class-transformer';

@Entity({ name: 'chat-dialog' })
export class ChatDialogEntity extends EntityHelper {
  @Exclude({ toPlainOnly: true })
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: getShortId() })
  @Index()
  uuid: string;

  @Column({ default: 'New dialog' })
  name: string;

  @ManyToMany(() => User, (user) => user.dialogs, {
    eager: true,
  })
  @JoinTable()
  participants: User[];

  @OneToMany(() => ChatMessageEntity, (message) => message.dialog)
  messages: ChatMessageEntity[];

  @OneToOne(() => ChatLastEntity, (last) => last.dialog)
  last: Promise<ChatLastEntity | null>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @BeforeInsert()
  uuidUpdater() {
    this.uuid = getShortId();
  }
}
