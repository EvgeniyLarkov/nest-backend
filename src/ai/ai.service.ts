import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CharacteristicsEngine } from 'src/characteristics-engine/engine';
import { Character } from './entities/character.entity';
import { Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import getShortId from 'src/utils/short-id-generator';
import { AIRequestService } from './ai-request.service';
import { RoleEnum } from 'src/roles/roles.enum';
import { Role } from 'src/roles/entities/role.entity';
import { Status } from 'src/statuses/entities/status.entity';
import { StatusEnum } from 'src/statuses/statuses.enum';
import { IPaginationOptions } from 'src/utils/types/pagination-options';
import { CreateCharacterDto } from './dto/create-character.dto';
import { UpdateCharacterDto } from './dto/update-character.dto';
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';
import { AppLogger } from 'src/logger/app-logger.service';
import { FilesService } from 'src/files/files.service';

@Injectable()
export class AiService {
  readonly engine = new CharacteristicsEngine();

  constructor(
    @InjectRepository(Character)
    private characterRepository: Repository<Character>,
    private usersService: UsersService,
    private aiRequestService: AIRequestService,
    private filesService: FilesService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext('AiService');
  }

  async create(characterData: CreateCharacterDto = {}) {
    const character = this.engine.generateCharacter(characterData);

    const {
      age,
      name,
      surname,
      hairColor,
      eyeColor,
      temperament,
      characteristic,
      constitution,
      job,
      phenotype,
    } = character;

    const descriptionPrompt = this.engine.getDescriptionPromptOpenAI(character);

    const mail = `${name}${surname}${getShortId()}@example.com`;

    const description = await this.aiRequestService.getDescription(
      descriptionPrompt,
    );

    const user = await this.usersService.create({
      email: mail,
      firstName: name,
      lastName: surname,
      description: description,
      role: {
        id: RoleEnum.character,
      } as Role,
      status: {
        id: StatusEnum.active,
      } as Status,
    });

    const newEntity = {
      age,
      firstName: name,
      lastName: surname,
      hairColor,
      eyeColor,
      temperament: temperament,
      characteristic,
      constitution,
      job,
      phenotype,
      user,
      descriptionPrompt,
      description,
    };

    const characterEntity = this.characterRepository.save(
      this.characterRepository.create(newEntity),
    );

    return characterEntity;
  }

  async update(hash: string, updateCharacterDto: UpdateCharacterDto) {
    await this.characterRepository.update({ hash }, updateCharacterDto);

    return this.findOne({ hash });
  }

  async addPhotoToCharacter(hash: string, src: string) {
    const character = await this.findOne({ hash });

    if (!character || !character.user) {
      this.logger.error(
        `Can't find character with hash ${hash} or related user`,
      );

      return null;
    }

    const userEntity = character.user;

    return await this.filesService.getAndUpload(src, userEntity);
  }

  findOne(fields: FindOptionsWhere<Character>) {
    return this.characterRepository.findOne({
      where: fields,
    });
  }

  findManyWithPagination(paginationOptions: IPaginationOptions) {
    return this.characterRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });
  }

  generateCharacteristics() {
    return this.engine.generateAndDescriptionPrompt();
  }
}
