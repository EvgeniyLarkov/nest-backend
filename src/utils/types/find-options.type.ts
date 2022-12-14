import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';

export type FindOptions<T> = {
  where: FindOptionsWhere<T>;
};
