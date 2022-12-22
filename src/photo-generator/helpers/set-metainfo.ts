import { Browser, Protocol } from 'puppeteer';

export const setBrowserMetadata = async (
  browser: Browser,
  url: string,
  {
    local,
    cookies,
  }: {
    local: Record<string, string>;
    cookies: Protocol.Network.CookieParam[];
  },
) => {
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  page.on('request', async (r) => {
    await r.respond({
      status: 200,
      contentType: 'text/plain',
      body: 'Error',
    });
  });
  await page.goto(url);

  await page.setCookie(...cookies);

  await page.evaluate((local) => {
    for (const key in local) {
      localStorage.setItem(key, local[key]);
    }
  }, local);
  await page.close();

  return true;
};
