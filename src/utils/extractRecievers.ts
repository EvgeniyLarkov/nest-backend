import { User } from 'src/users/entities/user.entity';

const extractRecievers = (
  recievers: User[],
  omit: User['hash'] | null = null,
): User['hash'][] => {
  return recievers
    .filter((user) => {
      return user.hash !== omit;
    })
    .map((user) => user.hash);
};

export default extractRecievers;
