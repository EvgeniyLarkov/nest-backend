import { FindOperator } from 'typeorm';
import { DeepPartial } from './deep-partial.type';

export type OldFindOptionsWhere<T> = {
  [key in keyof DeepPartial<T>]: T[key] | FindOperator<T[key]>;
};
