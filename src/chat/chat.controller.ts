import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Delete,
  UseGuards,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
  UseInterceptors,
  ClassSerializerInterceptor,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { infinityPagination } from 'src/utils/infinity-pagination';
import { DialogCreateDto } from './dto/dialog-create.dto';
import { ChatService } from './chat.service';
import { ChatDialogEntity } from './entities/chat-dialog.entity';
import { UserHash } from 'src/users/helpers/user-types';
import { MessagePostDto } from './dto/message-post.dto';
import { ChatMessageEntity } from './entities/chat-message.entity';
import { MessageUpdateDto } from './dto/message-update.dto';

@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@UseInterceptors(ClassSerializerInterceptor)
@ApiTags('Chat')
@Controller({
  path: 'chat',
  version: '1',
})
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createDialog(
    @Request() req,
    @Body() createDialogDto: { reciever: DialogCreateDto['reciever'] },
  ) {
    const userHash = req.user.hash;
    const { reciever } = createDialogDto;

    const data = <DialogCreateDto & UserHash>{
      reciever,
      userHash,
    };

    return this.chatService.createDialog(data);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  getDialogs(
    @Request() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    const user = req.user.hash;

    return this.chatService.getLastDialogsWithPagination({
      page,
      limit,
      userHash: user,
    });
  }

  @Get(':uuid')
  @HttpCode(HttpStatus.OK)
  getDialog(@Request() req, @Param('uuid') uuid: ChatDialogEntity['uuid']) {
    // const userHash = req.user.hash;

    return this.chatService.getDialog({
      uuid,
    });
  }

  @Post(':uuid')
  @HttpCode(HttpStatus.CREATED)
  async postMessage(
    @Request() req,
    @Param('uuid') uuid: ChatDialogEntity['uuid'],
    @Body() data: MessagePostDto,
  ) {
    const userHash = req.user.hash;

    const [message] = await this.chatService.createMessage({
      userHash,
      uuid,
      ...data,
    });

    return message;
  }

  @Get(':uuid/messages')
  @HttpCode(HttpStatus.OK)
  async getDialogMessages(
    @Request() req,
    @Param('uuid') uuid: ChatDialogEntity['uuid'],
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    const userHash = req.user.hash;

    if (limit > 50) {
      limit = 50;
    }

    return infinityPagination(
      await this.chatService.getDialogMessages({
        page,
        limit,
        uuid,
        userHash,
      }),
      { page, limit },
    );
  }

  @Get('message/:uuid')
  @HttpCode(HttpStatus.OK)
  async getDialogMessage(
    @Request() req,
    @Param('uuid') uuid: ChatMessageEntity['uuid'],
  ) {
    const userHash = req.user.hash;

    return await this.chatService.getDialogMessage({
      uuid,
      userHash,
    });
  }

  @Patch('message/:uuid')
  @HttpCode(HttpStatus.OK)
  async updateDialogMessage(
    @Request() req,
    @Param('uuid') uuid: ChatMessageEntity['uuid'],
    @Body() data: MessageUpdateDto,
  ) {
    const userHash = req.user.hash;

    return await this.chatService.updateDialogMessage({
      uuid,
      userHash,
      ...data,
    });
  }

  @Delete('message/:uuid')
  @HttpCode(HttpStatus.OK)
  async dropDialogMessage(
    @Request() req,
    @Param('uuid') uuid: ChatMessageEntity['uuid'],
  ) {
    const userHash = req.user.hash;

    return await this.chatService.dropDialogMessage({
      uuid,
      userHash,
    });
  }
}
