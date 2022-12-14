import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserHash } from 'src/users/helpers/user-types';
import { UsersService } from 'src/users/users.service';
import { IPaginationOptions } from 'src/utils/types/pagination-options';
import { Repository, UpdateResult } from 'typeorm';
import { DialogCreateDto } from './dto/dialog-create.dto';
import { MessagesGetDto } from './dto/messages-get.dto';
import { MessagePostDto } from './dto/message-post.dto';
import { ChatDialogEntity } from './entities/chat-dialog.entity';
import { ChatMessageEntity } from './entities/chat-message.entity';
import { MessageGetDto } from './dto/message-get.dto';
import { MessageUpdateDto } from './dto/message-update.dto';
import { ChatLastEntity } from './entities/chat-last.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatDialogEntity)
    private chatDialogsRepository: Repository<ChatDialogEntity>,
    @InjectRepository(ChatMessageEntity)
    private chatMessagesRepository: Repository<ChatMessageEntity>,
    @InjectRepository(ChatLastEntity)
    private chatLastRepository: Repository<ChatLastEntity>,
    private usersService: UsersService,
  ) {}

  async getDialog(data: { uuid: ChatDialogEntity['uuid'] }) {
    const { uuid } = data;

    const dialog = await this.chatDialogsRepository.findOne({
      where: { uuid },
    });

    return dialog;
  }

  async getDialogById(data: { id: ChatDialogEntity['id'] }) {
    const { id } = data;

    const dialog = await this.chatDialogsRepository.findOne({ where: { id } });

    return dialog;
  }

  async createDialog(data: DialogCreateDto & UserHash) {
    const { reciever, userHash } = data;

    const initiator = userHash;

    const recieverEntity = await this.usersService.findOne({
      hash: reciever,
    });
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
        name: `${recieverEntity.firstName} ${recieverEntity.lastName}`,
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

  async getLastDialogsWithPagination(data: IPaginationOptions & UserHash) {
    //Надо придумать что-то получше
    const { page, limit, userHash } = data;

    const dialogs = await this.chatDialogsRepository
      .createQueryBuilder('cd')
      .leftJoinAndSelect('cd.participants', 'p')
      .where('p.hash = :userHash', { userHash })
      .offset((page - 1) * limit)
      .limit(limit)
      .getMany();

    const dialogIds = dialogs.map((dialog) => dialog.id);

    if (dialogIds.length === 0) {
      return [];
    }

    return await this.chatDialogsRepository
      .createQueryBuilder('cd')
      .leftJoinAndSelect('cd.participants', 'p')
      .leftJoinAndSelect('cd.last', 'last')
      .where('cd.id IN (:...ids)', { ids: dialogIds })
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
        dialog: {
          id: dialog.id,
        },
      },
      relations: {
        sender: true,
        dialog: true,
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

    const message = await this.chatMessagesRepository.findOne({
      where: { uuid },
      relations: ['sender', 'dialog'],
    });

    // const message = await this.chatMessagesRepository
    //   .createQueryBuilder('cm')
    //   .innerJoin('cm.dialog', 'dialog')
    //   .innerJoin('dialog.participants', 'dp')
    //   .where('cm.uuid=:uuid', { uuid })
    //   .andWhere('dp.hash = :userHash', { userHash })
    //   .getOne();

    if (message && message.sender?.hash === userHash) {
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

    if (!user) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          errors: {
            dialog: 'userNotExist',
          },
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const messageEntity = await this.chatMessagesRepository.save(
      this.chatMessagesRepository.create({
        dialog: dialogEntity,
        message,
        sender: user,
      }),
    );

    const lastData = {
      dialogId: dialogEntity.id,
      dialogUuid: dialogEntity.uuid,
      userHash: user.hash,
      userId: user.id,
      userMessage: messageEntity.message,
      messageUuid: messageEntity.uuid,
      messageId: messageEntity.id,
      messageReaded: true,
    };

    await this.chatLastRepository
      .createQueryBuilder()
      .insert()
      .into(ChatLastEntity)
      .values(lastData)
      .orUpdate(
        [
          'dialogId',
          'dialogUuid',
          'userId',
          'userHash',
          'messageUuid',
          'messageId',
          'userMessage',
          'messageReaded',
        ],
        ['dialogId'],
      )
      .execute();

    // await this.chatLastRepository.save(
    //   this.chatLastRepository.create({
    //     dialogId: dialogEntity.id,
    //     dialogUUID: dialogEntity.uuid,
    //     userId: user.id,
    //     userHash: user.hash,
    //     userLastName: user.lastName,
    //     userFirstName: user.firstName,
    //     userLogo: user.photo?.path || null,
    //     userMessage: messageEntity.message,
    //     messageReaded: false,
    //   }),
    // );

    return [messageEntity, dialogEntity] as const;
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

  async makeChatMessageReaded(data: MessageGetDto & UserHash) {
    const { uuid, userHash } = data;

    const message = await this.chatMessagesRepository
      .createQueryBuilder('cm')
      .innerJoin('cm.dialog', 'dialog')
      .innerJoin('cm.sender', 'sender')
      .innerJoin('dialog.participants', 'dp')
      .where('cm.uuid=:uuid', { uuid })
      .andWhere('dp.hash = :userHash', { userHash })
      // .andWhere('cm.readed = :readed', { readed: false })
      .andWhere('sender.hash != :hash', { hash: userHash })
      .getOne();

    if (!message) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    return (await this.chatMessagesRepository
      .createQueryBuilder()
      .relation('dialog')
      .update({
        readed: true,
      })
      .where({
        id: message.id,
      })
      .returning('*')
      .execute()) as UpdateResult & { dialogId: number };
  }
}
