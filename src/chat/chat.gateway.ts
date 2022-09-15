import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { SocketsGateway } from 'src/sockets/sockets.gateway';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'chat',
})
export class ChatGateway extends SocketsGateway {
  @SubscribeMessage('message')
  handleNewMessage(data) {
    console.log(data);
  }
}
