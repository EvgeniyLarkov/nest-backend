import { Exclude } from 'class-transformer';
import { User } from 'src/users/entities/user.entity';
import { EntityHelper } from 'src/utils/entity-helper';
import getShortId from 'src/utils/short-id-generator';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  Index,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('character')
export class Character extends EntityHelper {
  @Exclude({ toPlainOnly: true })
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ nullable: true })
  firstName: string | null;

  @Index()
  @Column({ nullable: true })
  lastName: string | null;

  @OneToOne(() => User, {
    eager: true,
  })
  @JoinColumn()
  user: User | null;

  @Column({ nullable: true, type: 'text' })
  description: string | null;

  @Column({ nullable: true, type: 'text' })
  descriptionPrompt: string | null;

  @Column({ nullable: true, type: 'text' })
  photoPrompt: string | null;

  @Column({ nullable: true })
  age: number | null;

  @Column({ nullable: true })
  hairColor: string | null;

  @Column({ nullable: true })
  eyeColor: string | null;

  @Column({ nullable: true })
  characteristic: string | null;

  @Column({ nullable: true })
  constitution: string | null;

  @Column('text', { nullable: true, array: true })
  temperament: string[] | null;

  @Column({ nullable: true })
  phenotype: string | null;

  @Column({ nullable: true })
  job: string | null;

  @Column()
  @Index()
  hash: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @BeforeInsert()
  uuidUpdater() {
    this.hash = getShortId();
  }
}
