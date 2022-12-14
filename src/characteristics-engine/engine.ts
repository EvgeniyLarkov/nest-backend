import { CreateCharacterDto } from 'src/ai/dto/create-character.dto';
import { AIAges } from './characteristicts/age';
import { AICharacteristics } from './characteristicts/characteristics';
import { AIconstitution } from './characteristicts/constitution';
import { AIEyeColor } from './characteristicts/eye-color';
import { AIHairColor } from './characteristicts/hair-color';
import { AIJobs } from './characteristicts/job';
import { AIphenotype } from './characteristicts/phenotype';
import { AIPhotoLocations } from './characteristicts/photo-location';
import { AIPhotoType } from './characteristicts/photo-type';
import { AITemperament } from './characteristicts/temperament';
import { AIWomenNames } from './characteristicts/woman-name';
import { AIWomenLastNames } from './characteristicts/woman-surname';
import { getProbabilityBasedKey, getProbabilityBasedKeys } from './helpers';

export type AICharacter = {
  eyeColor: keyof typeof AIEyeColor | string;
  hairColor: keyof typeof AIHairColor | string;
  constitution: keyof typeof AIconstitution | string;
  characteristic: keyof typeof AICharacteristics | string;
  job: keyof typeof AIJobs | string;
  phenotype: keyof typeof AIphenotype | string;
  temperament: Array<keyof typeof AITemperament> | string[];
  age: keyof typeof AIAges | number;
  name: keyof typeof AIWomenNames | string;
  surname: keyof typeof AIWomenLastNames | string;
  gender: 'female' | 'male' | 'other' | string;
};

export type AIPhotoOptions = {
  location: keyof typeof AIPhotoLocations;
  type: keyof typeof AIPhotoType;
};

export class CharacteristicsEngine {
  eyeColors: typeof AIEyeColor = AIEyeColor;
  hairColors = AIHairColor;
  constitutions = AIconstitution;
  characteristics = AICharacteristics;
  jobs = AIJobs;
  phenotypes = AIphenotype;
  photoLocations = AIPhotoLocations;
  photoTypes = AIPhotoType;
  temperaments = AITemperament;
  names = AIWomenNames;
  surnames = AIWomenLastNames;
  ages = AIAges;
  photoType = AIPhotoType;

  generateCharacter(options: CreateCharacterDto = {}): AICharacter {
    return {
      eyeColor: options.eyeColor || getProbabilityBasedKey(this.eyeColors),
      hairColor: options.hairColor || getProbabilityBasedKey(this.hairColors),
      constitution:
        options.constitution || getProbabilityBasedKey(this.constitutions),
      characteristic:
        options.characteristic || getProbabilityBasedKey(this.characteristics),
      job: options.job || getProbabilityBasedKey(this.jobs),
      phenotype: options.phenotype || getProbabilityBasedKey(this.phenotypes),
      temperament:
        options.temperament || getProbabilityBasedKeys(this.temperaments),
      age: options.age || getProbabilityBasedKey(this.ages),
      name: options.firstName || getProbabilityBasedKey(this.names),
      surname: options.lastName || getProbabilityBasedKey(this.surnames),
      gender: options.gender || 'female',
    };
  }

  getPhotoPrompt(character: AICharacter, photoOptions: AIPhotoOptions): string {
    const {
      gender,
      eyeColor,
      hairColor,
      constitution,
      characteristic,
      job,
      phenotype,
      temperament,
      age,
    } = character;

    const { location, type } = photoOptions;

    return `Generate a realistic ${type} photo of ${characteristic} ${age} years old ${phenotype} ${gender} at ${location} with ${eyeColor} eyes,
    ${hairColor} hair, ${constitution} constitution, who can described as 
    ${temperament.join(', ')}, and works as ${job}`;
  }

  getDescriptionPromptOpenAI(character: AICharacter): string {
    const {
      gender,
      eyeColor,
      hairColor,
      constitution,
      characteristic,
      job,
      phenotype,
      temperament,
      age,
    } = character;

    return `I am a ${characteristic} ${age} years old ${phenotype} ${gender} with ${eyeColor} eyes,
    ${hairColor} hair, ${constitution} constitution, and i am  
    ${temperament.join(
      ', ',
    )} working as ${job}. Create long sarcastic and funny tinder description for me, but dont mention my age and appearence:`.replace(
      '\n',
      '',
    );
  }

  generateAndGetPhotoPrompt() {
    const char = this.generateCharacter();
    const photoOptions: AIPhotoOptions = {
      type: getProbabilityBasedKey(this.photoTypes),
      location: getProbabilityBasedKey(this.photoLocations),
    };

    return this.getPhotoPrompt(char, photoOptions);
  }

  generateAndDescriptionPrompt() {
    const char = this.generateCharacter();

    return this.getDescriptionPromptOpenAI(char);
  }
}
