import { User } from 'src/users/entities/user.entity';
import userResponseSerializer from 'src/users/user-response.serializer';
import deepMapObject from './deep-map-object';

const serializeResponse = <T>(data: T): T => {
  const response = deepMapObject(data, (value) => {
    if (value.__entity === 'User') {
      userResponseSerializer(value as User);
    }

    return value;
  }) as T;

  return response;
};

export default serializeResponse;
