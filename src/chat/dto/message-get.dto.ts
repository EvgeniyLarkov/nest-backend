import { ApiProperty } from '@nestjs/swagger';
import { ChatMessageEntity } from '../entities/chat-message.entity';

export class MessageGetDto {
  @ApiProperty({
    example: 'fe86a328333d118b2281593bdd',
  })
  uuid: ChatMessageEntity['uuid'];
}
