import { Server, Socket } from 'socket.io';

import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { SocketStateService } from './sockets-state.service';
import { IWsResponseData, SocketCoreService } from './sockets-core.service';
// import { HttpToWsInterceptor } from './http-to-ws-exception.interceptor';
import { UseFilters } from '@nestjs/common';
import { WebsocketExceptionsFilter } from './ws-exceptions.filter';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@UseFilters(WebsocketExceptionsFilter)
export class SocketsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    readonly socketService: SocketStateService,
    readonly socketCoreService: SocketCoreService,
  ) {}

  public sendMessage<T>(data: IWsResponseData<T>) {
    return this.socketCoreService.sendMessage(data);
  }

  async handleConnection(client: Socket) {
    return await this.socketCoreService.handleConnection(client);
  }

  handleDisconnect(client: Socket) {
    return this.socketCoreService.handleDisconnect(client);
  }
}
