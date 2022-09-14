import { Exclude } from 'class-transformer';
import { User } from 'src/users/entities/user.entity';
import { EntityHelper } from 'src/utils/entity-helper';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ChatDialogEntity } from './chat-dialog.entity';
import { ChatMessageEntity } from './chat-message.entity';

@Entity({ name: 'chat-last' })
export class ChatLastEntity extends EntityHelper {
  @Exclude({ toPlainOnly: true })
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => ChatDialogEntity, (dialog) => dialog.last)
  @JoinColumn()
  dialog: ChatDialogEntity;

  @Column()
  @Index({ unique: true })
  dialogUuid: string;

  @Exclude({ toPlainOnly: true })
  @Column()
  @Index({ unique: true })
  dialogId: number;

  @ManyToOne(() => User)
  user: User;

  @Column({ nullable: false })
  @Index()
  userHash: string;

  @Exclude({ toPlainOnly: true })
  @Column({ nullable: false })
  @Index()
  userId: number;

  @ManyToOne(() => ChatMessageEntity)
  message: ChatMessageEntity;

  @Column()
  userMessage: string;

  @Column()
  @Index({ unique: true })
  messageUuid: string;

  @Exclude({ toPlainOnly: true })
  @Column()
  @Index({ unique: true })
  messageId: number;

  @Column({ default: false })
  messageReaded: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
