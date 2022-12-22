import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { FileEntity } from './entities/file.entity';
import { Repository } from 'typeorm';
import { FileUploadReq } from './types/file';
import { User } from 'src/users/entities/user.entity';
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';
import { S3 } from 'aws-sdk';
import { AppLogger } from 'src/logger/app-logger.service';
import { HttpService } from '@nestjs/axios';
import getShortId from 'src/utils/short-id-generator';
import { PassThrough } from 'stream';

@Injectable()
export class FilesService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(FileEntity)
    private fileRepository: Repository<FileEntity>,
    private readonly httpService: HttpService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext('FilesService');
  }

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

    const result = await this.fileRepository.save(
      this.fileRepository.create({
        path: path[this.configService.get('file.driver')],
        user,
      }),
    );

    return result;
  }

  async getAndUpload(src: string, user: User = null) {
    const stream = await this.getFileStream(src);

    const passThrough = new PassThrough();
    const fileName = `${getShortId(10)}.png`; //TO-DO

    const s3FileEntity = this.uploadS3(passThrough, fileName);

    stream.data.pipe(passThrough);

    const { Location } = await s3FileEntity;

    const appFileEntity: FileUploadReq = {
      location: Location,
    };

    return await this.uploadFile(appFileEntity, user);
  }

  getFileStream(url: string) {
    return this.httpService.axiosRef.get(url, {
      responseType: 'stream',
    });
    // return await this.httpService.axiosRef
    //   .get(url, {
    //     responseType: 'arraybuffer',
    //   })
    //   .then((response) => {
    //     const extensionRaw = response.headers['content-type'];
    //     const extension = extensionRaw.replace('image/', '');
    //     return {
    //       file: Buffer.from(response.data, 'binary').toString('base64'),
    //       extension,
    //     };
    //   });
  }

  async uploadS3(fileStream: PassThrough, name: string) {
    const s3 = this.getS3();

    const params: S3.PutObjectRequest = {
      Bucket: this.configService.get('file.awsDefaultS3Bucket'),
      Key: String(name),
      Body: fileStream,
    };

    return new Promise<S3.ManagedUpload.SendData>((resolve, reject) => {
      s3.upload(params, (err: Error, data: S3.ManagedUpload.SendData) => {
        if (err) {
          this.logger.error(err.toString());
          reject(err.message);
        }
        resolve(data);
      });
    });
  }

  getS3() {
    return new S3({
      credentials: {
        accessKeyId: this.configService.get('file.accessKeyId'),
        secretAccessKey: this.configService.get('file.secretAccessKey'),
      },
      apiVersion: 'latest',
      region: this.configService.get('file.awsS3Region'),
    });
  }
}
