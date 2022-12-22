import { Page } from 'puppeteer';
import { getRandomNumber } from 'src/utils/getRandomNumber';

export async function typeWithDelay(
  page: Page,
  selector: string,
  text: string,
  { min, max }: { min: number; max: number } = { min: 30, max: 60 },
) {
  await page.focus(selector);
  for (const character of text) {
    const delay = getRandomNumber(min, max);

    await page.keyboard.type(character, {
      delay,
    });
  }

  return true;
}
