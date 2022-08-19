import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class MessagePostDto {
  @ApiProperty({ example: 'Hello honey' })
  message: string;

  @ApiProperty({
    example: 'fe86a328333d118b2281593bddd813a031af0bfa3ebf65be3fef264ec7288c5d',
  })
  @IsUUID()
  dialog: string;

  @IsNotEmpty()
  sender: number;
}
