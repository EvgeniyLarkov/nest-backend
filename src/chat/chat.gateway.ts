import { Server, Socket } from 'socket.io';

import {
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { MessagePostDto } from './dto/message-post.dto';

enum ResponseEvents {
  chatMessage = 'chat-message',
}

interface IWsResponseData<T> {
  message: T;
  connection: string; // TO-DO string[]
  event: ResponseEvents;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  connectionsHandler: Record<string, string[]>;

  constructor(public service: ChatService) {
    this.connectionsHandler = {};
  }

  @SubscribeMessage('message')
  async createChatMessage(@MessageBody() data: MessagePostDto) {
    const response = await this.service.createMessage(data);

    const dialogParticipantsHashes = response.dialog.participants.map(
      (user) => user.hash,
    );

    dialogParticipantsHashes.forEach((participantHash) => {
      this.sendMessage({
        event: ResponseEvents.chatMessage,
        message: response,
        connection: participantHash,
      });
    });
  }

  private sendMessage<T>(data: IWsResponseData<T>) {
    const { message, connection, event } = data;

    const connections = this.connectionsHandler[connection];

    if (!connections) {
      return null;
    }

    connections.forEach((socket) => {
      const socketConnection = this.server.sockets.sockets.get(socket);

      if (socketConnection) {
        socketConnection.emit(event, message);
      }
    });
  }

  async handleConnection(client: Socket) {
    try {
      const user = await this.service.handleConnection(client);

      const connections = this.connectionsHandler[user.hash];

      if (connections) {
        this.connectionsHandler[user.hash] = [...connections, client.id];
      } else {
        this.connectionsHandler[user.hash] = [client.id];
      }
    } catch (err) {
      console.log(err);

      client.emit('unathorized', {
        error: err,
      });
      client.disconnect();
    }
  }
}
