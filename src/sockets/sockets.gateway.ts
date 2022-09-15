import { Server, Socket } from 'socket.io';

import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { SocketStateService } from './sockets-state.service';
import { SocketCoreService } from './sockets-core.service';

enum ResponseEvents {
  chatMessage = 'chat-message',
}

interface IWsResponseData<T> {
  message: T;
  event: ResponseEvents;
  userHash: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SocketsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly socketService: SocketStateService,
    private readonly socketCoreService: SocketCoreService,
  ) {}

  public sendMessage<T>(data: IWsResponseData<T>) {
    this.socketCoreService.sendMessage(data);
  }

  async handleConnection(client: Socket) {
    await this.socketCoreService.handleConnection(client);
  }

  handleDisconnect(client: Socket) {
    this.socketCoreService.handleDisconnect(client);
  }
}
