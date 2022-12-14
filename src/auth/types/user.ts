import { Request } from 'express';
import { User } from 'src/users/entities/user.entity';

export type IRequestUser = Request & {
  user: User;
};
