import {
  CACHE_MANAGER,
  ClassSerializerInterceptor,
  Inject,
  UseInterceptors,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import { ApiTags } from '@nestjs/swagger';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { SocketCoreService } from 'src/sockets/sockets-core.service';
import { SocketStateService } from 'src/sockets/sockets-state.service';
import { SocketsGateway } from 'src/sockets/sockets.gateway';
import extractRecievers from 'src/utils/extractRecievers';
import { ChatService } from './chat.service';
import { MessageGetDto } from './dto/message-get.dto';
import { MessagePostDto } from './dto/message-post.dto';
import { ChatDialogEntity } from './entities/chat-dialog.entity';

@ApiTags('Chat-ws')
@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'chat',
})
@UseInterceptors(ClassSerializerInterceptor)
export class ChatGateway extends SocketsGateway {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    readonly chatService: ChatService,
    readonly socketService: SocketStateService,
    readonly socketCoreService: SocketCoreService,
  ) {
    super(socketService, socketCoreService);

    this.socketCoreService;
    this.socketService;
  }

  @SubscribeMessage('message')
  async handleNewMessage(
    @MessageBody() data: MessagePostDto & Pick<ChatDialogEntity, 'uuid'>,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const userHash = this.socketService.getUserBySocketId(client.id);

    const [message, dialog] = await this.chatService.createMessage({
      userHash,
      ...data,
    });

    //TO-DO sanitize sending data
    this.sendMessage({
      message,
      event: 'message',
      userHash: extractRecievers(dialog.participants),
    });
  }

  @SubscribeMessage('read-message')
  async readMessage(
    @MessageBody() data: MessageGetDto,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const userHash = this.socketService.getUserBySocketId(client.id);

    const result = await this.chatService.makeChatMessageReaded({
      userHash,
      ...data,
    });

    const message = result.raw[0];

    const dialog = await this.chatService.getDialogById({
      id: message.dialogId,
    });

    this.sendMessage({
      message,
      event: 'read-message',
      userHash: extractRecievers(dialog.participants),
    });
  }

  @SubscribeMessage('dialog-metadata')
  async getDialogMetadata(
    @MessageBody() data: { onlineUsers: string[] },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const clientHash = this.socketService.getUserBySocketId(client.id);

    const { onlineUsers } = data;

    const getOnlineUsers = async () => {
      const result = [];
      for (let i = 0; i < onlineUsers.length; i++) {
        const userHash = onlineUsers[i];
        const isOnline = await this.cacheManager.get(`online.${userHash}`);

        result.push({
          hash: userHash,
          isOnline: !!isOnline,
        });
      }

      return result;
    };

    const result = {
      onlineUsers: await getOnlineUsers(),
    };

    this.sendMessage({
      message: result,
      event: 'dialog-metadata',
      userHash: clientHash,
    });
  }

  @SubscribeMessage('user-typing')
  async handleUserTyping(
    @MessageBody() data: { dialogUUID: string },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const clientHash = this.socketService.getUserBySocketId(client.id);

    const { dialogUUID } = data;

    const dialog = await this.chatService.getDialog({
      uuid: dialogUUID,
    });

    const result = {
      dialogUUID: dialog.uuid,
      userHash: clientHash,
    };

    this.sendMessage({
      message: result,
      event: 'user-typing',
      userHash: extractRecievers(dialog.participants, clientHash),
    });
  }
}
