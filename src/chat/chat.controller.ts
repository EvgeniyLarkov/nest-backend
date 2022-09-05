import {
  Controller,
  Get,
  Post,
  Body,
  Param,
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
  createDialog(@Body() createDialogDto: DialogCreateDto) {
    return this.chatService.createDialog(createDialogDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  getDialogs(
    @Request() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    const user = req.user.id as number;

    console.log(user);

    return this.chatService.getDialogs({ page, limit, userId: user });
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  getDialog(@Param('id') id: string) {
    return this.chatService.getDialog(id);
  }

  @Get(':id/messages')
  @HttpCode(HttpStatus.OK)
  async findDialogMessages(
    @Param('id') id: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    if (limit > 50) {
      limit = 50;
    }

    return infinityPagination(
      await this.chatService.getDialogMessages({
        page,
        limit,
        dialog: id,
      }),
      { page, limit },
    );
  }
}
