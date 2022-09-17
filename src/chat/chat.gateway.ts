import { ClassSerializerInterceptor, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WsResponse,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { SocketCoreService } from 'src/sockets/sockets-core.service';
import { SocketStateService } from 'src/sockets/sockets-state.service';
import { SocketsGateway } from 'src/sockets/sockets.gateway';
import { ChatService } from './chat.service';
import { MessagePostDto } from './dto/message-post.dto';
import { ChatDialogEntity } from './entities/chat-dialog.entity';
import { ChatMessageEntity } from './entities/chat-message.entity';

@ApiTags('Chat-ws')
@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'chat',
})
export class ChatGateway extends SocketsGateway {
  constructor(
    readonly chatService: ChatService,
    readonly socketService: SocketStateService,
    readonly socketCoreService: SocketCoreService,
  ) {
    super(socketService, socketCoreService);

    this.socketCoreService;
    this.socketService;
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @SubscribeMessage('message')
  async handleNewMessage(
    @MessageBody() data: MessagePostDto & Pick<ChatDialogEntity, 'uuid'>,
    @ConnectedSocket() client: Socket,
  ): Promise<WsResponse<ChatMessageEntity>> {
    const userHash = this.socketService.getUserBySocketId(client.id);

    const msg = await this.chatService.createMessage({
      userHash,
      ...data,
    });

    return { event: 'message', data: msg };
  }
}
