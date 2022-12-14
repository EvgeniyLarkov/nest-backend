import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { OpenaiDescriptionResponseDto } from './dto/openai-description.dto';
import { map } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';

export enum AIEngines {
  openai = 'openai',
}

@Injectable()
export class AIRequestService {
  private readonly logger = new Logger('AI Request service');

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  getDescription(prompt: string, engine: AIEngines = AIEngines.openai) {
    const endpoint = {
      [AIEngines.openai]: 'https://api.openai.com/v1/completions',
    };

    const configuration = {
      [AIEngines.openai]: {
        headers: {
          Authorization: `Bearer ${this.configService.get('ai.openaiKey')}`,
          'Content-Type': 'application/json',
        },
      },
    };

    const params = {
      [AIEngines.openai]: {
        prompt,
        model: 'text-davinci-003',
        max_tokens: 512,
        temperature: 1,
        n: 1,
        stream: false,
        logprobs: null,
      },
    };

    const response = this.httpService
      .post<OpenaiDescriptionResponseDto>(
        endpoint[engine],
        params[engine],
        configuration[engine],
      )
      .pipe(
        map((response) => {
          this.logger.log(response.data);
          return response.data.choices[0].text;
        }),
      );

    return firstValueFrom(response);
  }
}
