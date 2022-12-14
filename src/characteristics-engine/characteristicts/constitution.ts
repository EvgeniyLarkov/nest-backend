import { IProbability } from './probability';

export const AIconstitution = {
  Strong: IProbability.low,
  Weak: IProbability.low,
  Healthy: IProbability.high,
  Unhealthy: IProbability.low,
  Fit: IProbability['very-high'],
  Unfit: IProbability.standart,
  Robust: IProbability.standart,
  Fragile: IProbability.standart,
  Sturdy: IProbability.low,
  Delicate: IProbability['very-high'],
  Athletic: IProbability.standart,
  Sedentary: IProbability.low,
  Muscular: IProbability['very-low'],
  Skinny: IProbability.standart,
  Overweight: IProbability.low,
  Obese: IProbability['very-low'],
  Thin: IProbability.standart,
  Plump: IProbability.standart,
  Lean: IProbability.high,
  Heavy: IProbability.low,
  Light: IProbability.high,
};