import { PipeTransform } from '@nestjs/common/interfaces/features/pipe-transform.interface';
import { mixin, Inject, HttpStatus } from '@nestjs/common';
import { HttpException } from '@nestjs/common/exceptions';
import { FilesService } from 'src/files/files.service';
import { forwardRef } from '@nestjs/common/utils';
import { FileEntity } from 'src/files/entities/file.entity';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const memoize = require('fast-memoize');

export const FileEntityPipe = memoize(
  createFileExistPipe,
) as typeof createFileExistPipe;

function createFileExistPipe<
  T extends Record<string, unknown>,
  R extends string,
>(field: R) {
  class MixinFileExistPipe
    implements
      PipeTransform<
        T,
        Promise<T | (T & Partial<{ [field: string]: FileEntity }>)>
      >
  {
    constructor(
      @Inject(forwardRef(() => FilesService)) private service: FilesService,
    ) {}

    async transform(request: T) {
      if (typeof request[field] === 'undefined' || request[field] === null) {
        return request;
      }

      const entity = await this.service.findOne({
        uuid: request[field] as unknown as string,
      });

      if (!entity) {
        throw new HttpException(
          {
            status: HttpStatus.UNPROCESSABLE_ENTITY,
            errors: {
              file: 'fileNotFound',
            },
          },
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }

      return {
        ...request,
        [field]: entity,
      };
    }
  }

  return mixin(MixinFileExistPipe) as unknown as PipeTransform<
    T,
    Promise<T | (T & Partial<{ [field: string]: FileEntity }>)>
  >;
}
