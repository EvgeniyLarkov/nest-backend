import * as bcrypt from 'bcryptjs';
import { Exclude } from 'class-transformer';
import { AuthProvidersEnum } from 'src/auth/auth-providers.enum';
import { ChatDialogEntity } from 'src/chat/entities/chat-dialog.entity';
import { EntityHelper } from 'src/utils/entity-helper';
import getShortId from 'src/utils/short-id-generator';
import {
  AfterLoad,
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { FileEntity } from '../../files/entities/file.entity';
import { Role } from '../../roles/entities/role.entity';
import { Status } from '../../statuses/entities/status.entity';

@Entity('user')
export class User extends EntityHelper {
  @Exclude({ toPlainOnly: true })
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: true })
  email: string | null;

  @Column({ nullable: true })
  @Exclude({ toPlainOnly: true })
  password: string;

  public previousPassword: string;

  @Exclude()
  @AfterLoad()
  public loadPreviousPassword(): void {
    this.previousPassword = this.password;
  }

  @Exclude()
  @BeforeInsert()
  @BeforeUpdate()
  async setPassword() {
    if (this.previousPassword !== this.password && this.password) {
      const salt = await bcrypt.genSalt();
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  @Column({ default: AuthProvidersEnum.email })
  provider: string;

  @Index()
  @Column({ nullable: true })
  socialId: string | null;

  @Index()
  @Column({ nullable: true })
  firstName: string | null;

  @Index()
  @Column({ nullable: true })
  lastName: string | null;

  @Column({ nullable: true, type: 'text' })
  description: string | null;

  @ManyToOne(() => FileEntity, {
    eager: true,
  })
  photo?: FileEntity | null;

  @ManyToOne(() => Role, {
    eager: true,
  })
  role?: Role | null;

  @ManyToOne(() => Status, {
    eager: true,
  })
  status?: Status;

  @ManyToMany(() => ChatDialogEntity, (dialog) => dialog.participants)
  dialogs: ChatDialogEntity[];

  @Column()
  @Index()
  hash: string;

  @Exclude({ toPlainOnly: true })
  @Column({ nullable: true })
  @Index()
  mailHash: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @Exclude()
  @BeforeInsert()
  uuidUpdater() {
    this.hash = getShortId();
  }
}
