import { ApiProperty } from '@nestjs/swagger';

export class DialogCreateDto {
  @ApiProperty({
    example: 'fe86a328333d118b2281593bddd813a031af0bfa3ebf65be3fef264ec7288c5d',
  })
  reciever: string;
}
