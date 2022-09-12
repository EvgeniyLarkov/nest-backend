import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class MessageUpdateDto {
  @ApiProperty({ example: 'Hello honey' })
  @IsNotEmpty()
  message: string;
}
