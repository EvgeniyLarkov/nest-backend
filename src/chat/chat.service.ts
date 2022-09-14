import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { UserHash } from 'src/users/helpers/user-types';
import { UsersService } from 'src/users/users.service';
import { IPaginationOptions } from 'src/utils/types/pagination-options';
import { Repository } from 'typeorm';
import { DialogCreateDto } from './dto/dialog-create.dto';
import { MessagesGetDto } from './dto/messages-get.dto';
import { MessagePostDto } from './dto/message-post.dto';
import { ChatDialogEntity } from './entities/chat-dialog.entity';
import { ChatMessageEntity } from './entities/chat-message.entity';
import { MessageGetDto } from './dto/message-get.dto';
import { MessageUpdateDto } from './dto/message-update.dto';

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

  getDialog(data: { uuid: ChatDialogEntity['uuid'] } & UserHash) {
    const { uuid, userHash } = data;

    return this.chatDialogsRepository
      .createQueryBuilder('ct')
      .innerJoin('ct.participants', 'p')
      .where('p.hash = :userHash', { userHash })
      .andWhere('ct.uuid = :uuid', { uuid })
      .getOne();
  }

  async createDialog(data: DialogCreateDto & UserHash) {
    const { reciever, userHash } = data;

    const initiator = userHash;

    const recieverEntity = await this.usersService.findOne({ hash: reciever });
    const initiatorEntity = await this.usersService.findOne({
      hash: initiator,
    });

    if (!recieverEntity || !initiatorEntity) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          errors: {
            dialog: 'dialogNotFound',
          },
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.chatDialogsRepository.save(
      this.chatDialogsRepository.create({
        participants: [recieverEntity, initiatorEntity],
        messages: [],
      }),
    );
  }

  async getDialogs(data: IPaginationOptions & UserHash) {
    const { page, limit, userHash } = data;

    return this.chatDialogsRepository
      .createQueryBuilder('chat-dialog')
      .innerJoin('chat-dialog.participants', 'p')
      .where('p.hash = :userHash', { userHash })
      .offset((page - 1) * limit)
      .limit(limit)
      .getMany();
  }

  async getDialogMessages(
    data: IPaginationOptions & MessagesGetDto & UserHash,
  ) {
    const { uuid, page, limit, userHash } = data;

    const dialog = await this.chatDialogsRepository
      .createQueryBuilder('cd')
      .innerJoin('cd.participants', 'p')
      .where('p.hash = :userHash', { userHash })
      .andWhere('cd.uuid = :uuid', { uuid })
      .getOne();

    // TO-DO not found and unathorized
    if (!dialog) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          errors: {
            dialog: 'dialogNotFound',
          },
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.chatMessagesRepository.find({
      where: {
        dialog: dialog.id,
      },
      skip: (page - 1) * limit,
      take: limit,
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async getDialogMessage(data: MessageGetDto & UserHash) {
    // Need To Check
    const { uuid, userHash } = data;

    const message = await this.chatMessagesRepository
      .createQueryBuilder('cm')
      .innerJoin('cm.dialog', 'dialog')
      .innerJoin('dialog.participants', 'dp')
      .where('cm.uuid=:uuid', { uuid })
      .andWhere('dp.hash = :userHash', { userHash })
      .getOne();

    if (message) {
      return message;
    } else {
      throw new HttpException(
        {
          status: HttpStatus.UNAUTHORIZED,
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  async createMessage(
    data: MessagePostDto & Pick<ChatDialogEntity, 'uuid'> & UserHash,
  ) {
    const { uuid, message, userHash } = data;

    const dialogEntity = await this.getDialog({
      uuid,
      userHash,
    });

    if (!dialogEntity) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          errors: {
            dialog: 'dialogNotFound',
          },
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = await this.usersService.findOne({
      hash: userHash,
    });

    return this.chatMessagesRepository.save(
      this.chatMessagesRepository.create({
        dialog: dialogEntity,
        message,
        sender: user,
      }),
    );
  }

  async updateDialogMessage(
    data: MessageUpdateDto & Pick<ChatMessageEntity, 'uuid'> & UserHash,
  ) {
    const { uuid, message, userHash } = data;

    const messageEntity = await this.chatMessagesRepository.findOne({
      where: {
        uuid,
      },
      relations: ['sender'],
    });

    if (
      !messageEntity ||
      messageEntity.sender.hash !== (userHash as unknown as string)
    ) {
      throw new HttpException(
        {
          status: HttpStatus.UNAUTHORIZED,
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    return await this.chatMessagesRepository
      .createQueryBuilder()
      .update(ChatMessageEntity)
      .set({ message })
      .where('uuid = :uuid', { uuid })
      .execute();
  }

  async dropDialogMessage(data: Pick<ChatMessageEntity, 'uuid'> & UserHash) {
    const { uuid, userHash } = data;

    const messageEntity = await this.chatMessagesRepository.findOne({
      where: {
        uuid,
      },
      relations: ['sender'],
    });

    if (
      !messageEntity ||
      messageEntity.sender.hash !== (userHash as unknown as string)
    ) {
      throw new HttpException(
        {
          status: HttpStatus.UNAUTHORIZED,
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    return await this.chatMessagesRepository.softDelete({ uuid }); // TO-DO Response
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
      new HttpException(
        {
          status: HttpStatus.UNAUTHORIZED,
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    return user;
  }
}
