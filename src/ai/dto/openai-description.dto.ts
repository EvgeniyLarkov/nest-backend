import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

import { Expose } from 'class-transformer';

export class OpenaiDescriptionResponseDto {
  @Expose()
  @ApiProperty()
  @IsNotEmpty()
  hash: string;

  @Expose()
  @ApiProperty()
  @IsNotEmpty()
  id: string;

  @Expose()
  'object': string;

  @Expose()
  'created': number;

  @Expose()
  'model': string;

  @Expose()
  choices: {
    text: string;
    index: number;
    logprobs: null;
    finish_reason: string;
  }[];

  @Expose()
  'usage': {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
