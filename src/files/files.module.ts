import { HttpException, HttpStatus, Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { diskStorage } from 'multer';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import * as AWS from 'aws-sdk';
import * as multerS3 from 'multer-s3';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileEntity } from './entities/file.entity';
import { FilesService } from './files.service';
import { ConfigurationOptions } from 'aws-sdk';
import { ConfigurationServicePlaceholders } from 'aws-sdk/lib/config_service_placeholders';
import { APIVersions } from 'aws-sdk/lib/config';
import { UsersModule } from 'src/users/users.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([FileEntity]),
    HttpModule.register({
      timeout: 15000,
      maxRedirects: 5,
    }),
    MulterModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const storages = {
          local: () =>
            diskStorage({
              destination: './files',
              filename: (request, file, callback) => {
                callback(
                  null,
                  `${randomStringGenerator()}.${file.originalname
                    .split('.')
                    .pop()
                    .toLowerCase()}`,
                );
              },
            }),
          s3: () => {
            const AWSconfig: ConfigurationOptions &
              ConfigurationServicePlaceholders &
              APIVersions = {
              credentials: {
                accessKeyId: configService.get('file.accessKeyId'),
                secretAccessKey: configService.get('file.secretAccessKey'),
              },
              apiVersion: 'latest',
              region: configService.get('file.awsS3Region'),
            };

            // AWS.config.update(AWSconfig);

            const s3 = new AWS.S3(AWSconfig);

            return multerS3({
              s3: s3,
              bucket: configService.get('file.awsDefaultS3Bucket'),
              acl: 'public-read',
              contentType: multerS3.AUTO_CONTENT_TYPE,
              key: (request, file, callback) => {
                callback(
                  null,
                  `${randomStringGenerator()}.${file.originalname
                    .split('.')
                    .pop()
                    .toLowerCase()}`,
                );
              },
            });
          },
        };

        return {
          fileFilter: (request, file, callback) => {
            if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
              return callback(
                new HttpException(
                  {
                    status: HttpStatus.UNPROCESSABLE_ENTITY,
                    errors: {
                      file: `cantUploadFileType`,
                    },
                  },
                  HttpStatus.UNPROCESSABLE_ENTITY,
                ),
                false,
              );
            }

            callback(null, true);
          },
          storage: storages[configService.get('file.driver')](),
          limits: {
            fileSize: configService.get('file.maxFileSize'),
          },
        };
      },
    }),
  ],
  controllers: [FilesController],
  providers: [ConfigModule, ConfigService, FilesService],
  exports: [FilesService],
})
export class FilesModule {}
