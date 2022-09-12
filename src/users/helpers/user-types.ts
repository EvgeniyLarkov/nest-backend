import { User } from '../entities/user.entity';

export type UserHash = Record<'userHash', Pick<User, 'hash'>>;

export type UserId = Pick<User, 'id'>;
