import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class SocketStateService {
  private socketState = new Map<string, Socket[]>();
  private socketIdToUserHash = new Map<string, string>();

  add(userHash: string, socket: Socket): boolean {
    const existingSockets = this.socketState.get(userHash) || [];

    const sockets = [...existingSockets, socket];

    this.socketState.set(userHash, sockets);
    this.socketIdToUserHash.set(socket.id, userHash);

    return true;
  }

  remove(userHash: string, socket: Socket): boolean {
    const existingSockets = this.socketState.get(userHash);

    if (!existingSockets) {
      return true;
    }

    const sockets = existingSockets.filter((s) => s.id !== socket.id);

    this.socketIdToUserHash.delete(socket.id);

    if (!sockets.length) {
      this.socketState.delete(userHash);
    } else {
      this.socketState.set(userHash, sockets);
    }

    return true;
  }

  get(userHash: string): Socket[] {
    return this.socketState.get(userHash) || [];
  }

  getUserBySocketId(socketId: string): User['hash'] {
    return this.socketIdToUserHash.get(socketId);
  }

  getAll(): Socket[] {
    const all = [];

    this.socketState.forEach((sockets) => all.push(sockets));

    return all;
  }
}
