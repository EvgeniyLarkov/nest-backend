import { IProbability } from './probability';

export const AIPhotoLocations: {
  [key: string]: IProbability;
} = {
  Beach: IProbability['high'],
  Park: IProbability['high'],
  Cityscape: IProbability['low'],
  Mountain: IProbability['low'],
  Party: IProbability['standart'],
  Bar: IProbability['standart'],
  Gym: IProbability['very-low'],
  Bedroom: IProbability['very-low'],
  Bathroom: IProbability['very-low'],
  Forest: IProbability['very-low'],
  Lake: IProbability['very-low'],
  River: IProbability['very-low'],
  Ocean: IProbability['very-low'],
  Pool: IProbability['very-low'],
  Garden: IProbability['very-low'],
  Zoo: IProbability['very-low'],
};
