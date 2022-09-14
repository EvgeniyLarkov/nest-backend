import { User } from '../users/entities/user.entity';

const userResponseSerializer = (user: User) => {
  delete user.password;
  delete user.mailHash;
  delete user.previousPassword;
};

export default userResponseSerializer;
