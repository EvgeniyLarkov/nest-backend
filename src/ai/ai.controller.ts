import {
  Controller,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  Get,
  Post,
  Patch,
  Body,
  HttpCode,
  HttpStatus,
  Query,
  Param,
} from '@nestjs/common';
import { DefaultValuePipe, ParseIntPipe } from '@nestjs/common/pipes';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/roles/roles.decorator';
import { RoleEnum } from 'src/roles/roles.enum';
import { RolesGuard } from 'src/roles/roles.guard';
import { infinityPagination } from 'src/utils/infinity-pagination';
import { AiQueuesService } from './ai.queues.service';
import { AiService } from './ai.service';
import { CreateCharacterDto } from './dto/create-character.dto';
import { UpdateCharacterDto } from './dto/update-character.dto';

@ApiBearerAuth()
@Roles(RoleEnum.admin)
@UseGuards(AuthGuard('jwt'), RolesGuard)
@UseInterceptors(ClassSerializerInterceptor)
@ApiTags('Ai')
@Controller({
  path: 'ai',
  version: '1',
})
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly aiQueueService: AiQueuesService,
  ) {}

  @Get()
  @HttpCode(HttpStatus.ACCEPTED)
  generate() {
    return this.aiService.generateCharacteristics();
  }

  @Post('character')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() data: CreateCharacterDto) {
    return this.aiService.create(data);
  }

  @Patch('character/:hash')
  @HttpCode(HttpStatus.OK)
  update(@Param('hash') hash: string, @Body() data: UpdateCharacterDto) {
    return this.aiService.update(hash, data);
  }

  @Get('character/:hash')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('hash') hash: string) {
    return this.aiService.findOne({ hash });
  }

  @Post('character/photo/:hash')
  @HttpCode(HttpStatus.OK)
  createPhoto(@Param('hash') hash: string) {
    return this.aiQueueService.createPhoto(hash);
  }

  @Get('character')
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    if (limit > 50) {
      limit = 50;
    }

    return infinityPagination(
      await this.aiService.findManyWithPagination({
        page,
        limit,
      }),
      { page, limit },
    );
  }

  @Post('test')
  @HttpCode(HttpStatus.CREATED)
  async createTestJob() {
    return await this.aiQueueService.createTestJob();
  }
}
