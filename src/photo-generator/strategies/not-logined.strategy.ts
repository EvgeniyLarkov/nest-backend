import { Page, ElementHandle } from 'puppeteer';
import { getRandomNumber } from 'src/utils/getRandomNumber';
import { typeWithDelay } from '../helpers/type-with-delay';
import { waitFor } from '../helpers/wait-for';

export const makeLogin = async (
  page: Page,
  login: string,
  password: string,
) => {
  const [div] = await page.$x(
    "//div[contains(text(), 'Продолжить в браузере')]",
  );

  if (!div) return false;

  await (div as ElementHandle<HTMLElement>).click({
    offset: {
      x: getRandomNumber(3, 100),
      y: getRandomNumber(2, 10),
    },
    delay: getRandomNumber(87, 321),
  });

  const emailSelector = 'input[name="email"]';
  await page.waitForSelector(emailSelector, {
    visible: true,
  });

  const passwordSelector = 'input[name="password"]';
  await page.waitForSelector(passwordSelector, {
    visible: true,
  });

  await typeWithDelay(page, emailSelector, login);

  const delayBetweenEmailToPassword = getRandomNumber(30, 120);
  await waitFor(delayBetweenEmailToPassword);

  await typeWithDelay(page, passwordSelector, password);

  const delayBetweenPasswordToSubmit = getRandomNumber(30, 120);
  await waitFor(delayBetweenPasswordToSubmit);

  const submitSelector = 'button[type="submit"]';
  const submitEl = await page.waitForSelector(submitSelector, {
    visible: true,
  });

  await submitEl.click({
    offset: {
      x: getRandomNumber(3, 100),
      y: getRandomNumber(2, 10),
    },
    delay: getRandomNumber(40, 345),
  });

  const mainTextbox = 'div[role="textbox"][data-slate-editor="true"]';
  await page.waitForSelector(mainTextbox, {
    visible: true,
  });

  return true;
};
