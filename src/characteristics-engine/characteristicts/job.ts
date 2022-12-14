import { IProbability } from './probability';

export const AIJobs = {
  Teacher: IProbability['high'],
  Nurse: IProbability['high'],
  Salesperson: IProbability['low'],
  Engineer: IProbability['low'],
  Manager: IProbability['standart'],
  Lawyer: IProbability['standart'],
  Doctor: IProbability['standart'],
  Janitor: IProbability['very-low'],
  Waiter: IProbability['very-low'],
  Artist: IProbability['very-low'],
  Writer: IProbability['very-low'],
  Actor: IProbability['very-low'],
  Musician: IProbability['very-low'],
  Dancer: IProbability['very-low'],
  Designer: IProbability['very-low'],
  Model: IProbability['very-low'],
  ['Webcam-model']: IProbability['very-low'],
  ['Sex-job']: IProbability['very-low'],
  Athlete: IProbability['very-low'],
};
