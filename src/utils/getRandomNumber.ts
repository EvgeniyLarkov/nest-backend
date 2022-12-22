export function getRandomNumber(min: number, max: number): number {
  const range = max - min;
  return Math.floor(Math.random() * (range + 1)) + min;
}
