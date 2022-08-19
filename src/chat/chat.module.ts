import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { ChatDialogEntity } from './entities/chat-dialog.entity';
import { ChatMessageEntity } from './entities/chat-message.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatMessageEntity, ChatDialogEntity]),
    UsersModule,
    ConfigModule,
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
  providers: [ChatGateway, ChatService],
})
export class ChatModule {}