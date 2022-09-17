import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SocketModule } from 'src/sockets/sockets.module';
import { UsersModule } from 'src/users/users.module';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { ChatDialogEntity } from './entities/chat-dialog.entity';
import { ChatLastEntity } from './entities/chat-last.entity';
import { ChatMessageEntity } from './entities/chat-message.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChatMessageEntity,
      ChatDialogEntity,
      ChatLastEntity,
    ]),
    UsersModule,
    ConfigModule,
    SocketModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('auth.secret'),
        signOptions: {
          expiresIn: configService.get('auth.expires'),
        },
      }),
    }),
  ],
  providers: [ChatService, ChatGateway],
  controllers: [ChatController],
})
export class ChatModule {}
