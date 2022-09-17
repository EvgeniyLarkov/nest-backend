import { HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { SocketStateService } from './sockets-state.service';

interface IWsResponseData<T> {
  message: T;
  event: string;
  userHash: User['hash'];
}

@Injectable()
export class SocketCoreService {
  constructor(
    private readonly socketService: SocketStateService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  public sendMessage<T>(data: IWsResponseData<T>) {
    const { message, userHash, event } = data;

    const connections = this.socketService.get(userHash);

    if (!connections) {
      return null;
    }

    connections.forEach((socket) => {
      console.log(event, message);
      socket.emit(event, message);
    });
  }

  async handleConnection(client: Socket) {
    try {
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
        new WsException({
          status: HttpStatus.UNAUTHORIZED,
        });
      }

      return this.socketService.add(user.hash, client);
    } catch (err) {
      client.emit('unathorized', {
        error: err,
      });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    try {
      const token = client.handshake.headers.authorization;

      if (!token) {
        throw new WsException({
          status: HttpStatus.UNAUTHORIZED,
        });
      }

      const payload = this.jwtService.verify(
        client.handshake.headers.authorization,
      );

      this.socketService.remove(payload.hash, client);
    } catch (err) {
      client.emit('unathorized', {
        error: err,
      });
      client.disconnect();
    }
  }
}
