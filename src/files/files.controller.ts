import {
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  Response,
  Request,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FilesService } from './files.service';
import { Response as ThisResponse } from 'express';
import { FileUploadReq } from './types/file';
import { IRequestUser } from 'src/auth/types/user';
import { UsersService } from 'src/users/users.service';

@ApiTags('Files')
@Controller({
  path: 'files',
  version: '1',
})
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly usersService: UsersService,
  ) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: FileUploadReq,
    @Request() request: IRequestUser,
  ) {
    const result = await this.filesService.uploadFile(file, request.user);

    return result;
  }

  @Get(':path')
  download(@Param('path') path: string, @Response() response: ThisResponse) {
    return response.sendFile(path, { root: './files' });
  }
}
