import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { FileEntity } from './entities/file.entity';
import { Repository } from 'typeorm';
import { FileUploadReq } from './types/file';
import { User } from 'src/users/entities/user.entity';
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';

@Injectable()
export class FilesService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(FileEntity)
    private fileRepository: Repository<FileEntity>,
  ) {}

  findOne(fields: FindOptionsWhere<FileEntity>) {
    return this.fileRepository.findOne({
      where: fields,
      relations: ['user'],
    });
  }

  async uploadFile(
    file: FileUploadReq,
    user: User = null,
  ): Promise<FileEntity> {
    if (!file) {
      throw new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            file: 'selectFile',
          },
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const path = {
      local: `/${this.configService.get('app.apiPrefix')}/v1/${file.path}`,
      s3: file.location,
    };

    return this.fileRepository.save(
      this.fileRepository.create({
        path: path[this.configService.get('file.driver')],
        user,
      }),
    );
  }
}
