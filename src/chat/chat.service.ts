import { HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { UsersService } from 'src/users/users.service';
import { IPaginationOptions } from 'src/utils/types/pagination-options';
import { Repository } from 'typeorm';
import { DialogCreateDto } from './dto/dialog-create.dto';
import { MessageGetDto } from './dto/message-get.dto';
import { MessagePostDto } from './dto/message-post.dto';
import { ChatDialogEntity } from './entities/chat-dialog.entity';
import { ChatMessageEntity } from './entities/chat-message.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatDialogEntity)
    private chatDialogsRepository: Repository<ChatDialogEntity>,
    @InjectRepository(ChatMessageEntity)
    private chatMessagesRepository: Repository<ChatMessageEntity>,
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  getDialog(id: string) {
    const dialog = id;

    return this.chatDialogsRepository.findOne(dialog);
  }

  getDialogMessages(data: IPaginationOptions & MessageGetDto) {
    const dialog = data.dialog;

    return this.chatDialogsRepository.find({
      where: dialog,
      skip: (data.page - 1) * data.limit,
      take: data.limit,
    });
  }

  getDialogs(data: IPaginationOptions & { userId: number }) {
    return this.usersService.findUserDialogsWithPagination(data);
  }

  async createMessage(data: MessagePostDto) {
    const { dialog, message, sender } = data;

    const dialogEntity = await this.chatDialogsRepository.findOne({
      uuid: dialog,
    });

    if (!dialogEntity) {
      throw new WsException({
        status: HttpStatus.BAD_REQUEST,
      });
    }

    return this.chatMessagesRepository.save(
      this.chatMessagesRepository.create({
        dialog: dialogEntity,
        message,
        sender,
      }),
    );
  }

  async createDialog(data: DialogCreateDto) {
    const { reciever, initiator } = data;

    const recieverEntity = await this.usersService.findOne({ hash: reciever });
    const initiatorEntity = await this.usersService.findOne({
      hash: initiator,
    });

    if (!recieverEntity || !initiatorEntity) {
      throw new WsException({
        status: HttpStatus.BAD_REQUEST,
      });
    }

    return this.chatDialogsRepository.save(
      this.chatDialogsRepository.create({
        participants: [recieverEntity, initiatorEntity],
        messages: [],
      }),
    );
  }

  async handleConnection(client: Socket) {
    const token = client.handshake.headers.authorization;

    if (!token) {
      throw new WsException({
        status: HttpStatus.UNAUTHORIZED,
      });
    }

    const payload = this.jwtService.verify(
      client.handshake.headers.authorization,
    );

    const user = await this.usersService.findOne({ id: payload.id });

    if (!user) {
      throw new WsException({
        status: HttpStatus.UNAUTHORIZED,
      });
    }

    return user;
  }
}
