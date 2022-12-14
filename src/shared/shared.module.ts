import { Module } from '@nestjs/common';
import { IsExist } from './validators/is-exists.validator';
import { IsNotExist } from './validators/is-not-exists.validator';

@Module({
  providers: [IsExist, IsNotExist],
  exports: [IsExist, IsNotExist],
})
export class SharedModule {}
