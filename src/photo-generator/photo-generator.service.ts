import { Inject, CACHE_MANAGER } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Processor,
  Process,
  OnQueueCompleted,
  OnQueueStalled,
  InjectQueue,
  OnQueueError,
  OnQueueFailed,
} from '@nestjs/bull';
import { Cache } from 'cache-manager';
import puppeteer, {
  Browser,
  Page,
  Protocol,
  PuppeteerLaunchOptions,
} from 'puppeteer';
import { AppLogger } from 'src/logger/app-logger.service';
import { getRandomNumber } from 'src/utils/getRandomNumber';
import {
  AppQueues,
  photoBaseJobData,
  photoImageCreateJobData,
  PhotoJobNames,
  PhotoJobTimeouts,
} from 'src/queues/queue.type';
import { setBrowserMetadata } from './helpers/set-metainfo';
import { typeWithDelay } from './helpers/type-with-delay';
import { waitFor } from './helpers/wait-for';
import { makeLogin } from './strategies/not-logined.strategy';
import { Job, Queue } from 'bull';
import { getPrefixedHash } from 'src/utils/get-prefixed-hash';

@Processor(AppQueues.photo)
export class PhotoGeneratorService {
  private browserData: Promise<readonly [Browser, Page]>;
  public isLogined = false;

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectQueue(AppQueues.photo) private photoQueue: Queue,
    private readonly configService: ConfigService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext('PhotoGeneratorService');
    this.browserData = this.start();
  }

  async start(): Promise<readonly [Browser, Page]> {
    try {
      const timestamp1 = performance.now();

      const launchOptions: PuppeteerLaunchOptions = {
        headless: false,
        product: 'chrome',
        channel: 'chrome',
        defaultViewport: {
          width: 1920,
          height: 1080,
        },
      };

      const browser = await puppeteer.launch(launchOptions);
      const page = await browser.newPage();

      const pageLink = this.configService.get<string>('discord.link');

      const [storageCookies, , storageLocal] = await this.getMetadata();

      if (storageCookies && storageLocal) {
        await setBrowserMetadata(browser, pageLink, {
          local: JSON.parse(storageLocal),
          cookies: JSON.parse(storageCookies) as Protocol.Network.CookieParam[],
        });
      }

      await page.goto(pageLink, {
        waitUntil: 'networkidle0',
      });

      const screenshot = (await page.screenshot({
        encoding: 'binary',
      })) as Buffer;
      void this.logger.pipePhoto(screenshot);

      const timestamp2 = performance.now();
      const totalTime = timestamp2 - timestamp1;
      void this.logger.logTg(`Puppeteer launched in ${totalTime} ms`);

      const notLoginedScreen = await page.$x(
        "//div[contains(text(), 'Продолжить в браузере')]",
      );
      const notLogined = notLoginedScreen.length !== 0;

      if (notLogined) {
        void this.logger.logTg(
          `Authorization via localparams failed, attemp to login`,
        );

        const password = this.configService.get<string>('discord.password');
        const login = this.configService.get<string>('discord.login');

        await makeLogin(page, login, password);

        const [cookies, sessionStorage, localStorage] =
          await this.collectMetaData(page);

        await this.saveMetaData({
          cookies,
          sessionStorage,
          localStorage,
        });
      }

      this.isLogined = true;

      const timestamp3 = performance.now();
      const loginedTime = timestamp3 - timestamp2;
      void this.logger.logTg(`Logined in discord in ${loginedTime} ms`);

      const loginedScreenshot = (await page.screenshot({
        encoding: 'binary',
      })) as Buffer;
      void this.logger.pipePhoto(loginedScreenshot);

      await this.photoQueue.clean(1000, 'completed');
      await this.photoQueue.clean(1000, 'failed');

      return [browser, page] as const;
    } catch (err) {
      this.logger.error(err);
    }
  }

  @Process(PhotoJobNames.base)
  async initDiscordPhotoCreation(job: Job<photoBaseJobData>) {
    try {
      void this.logger.logTg(`Started job "${PhotoJobNames.base}"`);

      const [, page] = await this.browserData;

      const mainTextbox = 'div[role="textbox"][data-slate-editor="true"]';
      await page.waitForSelector(mainTextbox, {
        visible: true,
      });

      const promptText = `/imagine ${job.data.prompt}`;

      await typeWithDelay(page, mainTextbox, promptText);
      const waitBeforeEnter = getRandomNumber(100, 300);

      await waitFor(waitBeforeEnter);
      await page.keyboard.press('Enter');

      void this.logger.logTg(`Ended job "${PhotoJobNames.base}"`);

      await job.progress(100);
      return job.data;
    } catch (err) {
      await job.moveToFailed({
        message: err.toString(),
      });

      void this.logger.error(
        `Failed job "${PhotoJobNames.base}", reason: ${err.toString()}`,
      );
    }
  }

  @Process(PhotoJobNames.test)
  async processTestJob() {
    await waitFor(1000);

    return true;
  }

  @Process(PhotoJobNames.image)
  async processImageGeneration(job: Job) {
    this.logger.log(`Processing image generation ${job.id}`);

    const data = await job.finished();

    return data;
  }

  @OnQueueCompleted({ name: PhotoJobNames.base })
  async onPhotoJobBaseCompleted(job: Job, result: photoBaseJobData) {
    const jobData = {
      jobId: getPrefixedHash(PhotoJobNames.image, result.prompt),
      timeout: PhotoJobTimeouts.image,
    };

    this.logger.log(`Adding job ${job.name} id: ${jobData.jobId}`);

    await this.photoQueue.add(PhotoJobNames.image, result, jobData);
  }

  @OnQueueCompleted({ name: PhotoJobNames.image })
  onPhotoJobImageCompleted(job: Job, result: photoImageCreateJobData) {
    const { content } = result;

    content.first().url;
  }

  @OnQueueError()
  showQueueError(err: Error) {
    this.logger.error(err.toString());
  }

  @OnQueueFailed()
  showFailedInfo(job: Job, err: unknown) {
    this.logger.warn(
      `Job ${job.name} id ${job.id} failed with reason: ${
        job.failedReason
      } err: ${err.toString()}`,
    );
  }

  @OnQueueStalled()
  showStalledJobInfo(job: Job) {
    this.logger.warn(
      `Job ${job.name} id ${job.id} stalled on progress ${job.progress}`,
    );
  }
  async collectMetaData(page: Page) {
    const cookies = JSON.stringify(await page.cookies());
    const [localStorage, sessionStorage] = await page.evaluate(() => {
      const iframe = document.createElement('iframe');
      document.body.appendChild(iframe);
      return [
        Object.assign({}, iframe.contentWindow.localStorage),
        Object.assign({}, iframe.contentWindow.sessionStorage),
      ];
    });

    return [
      cookies,
      JSON.stringify(sessionStorage),
      JSON.stringify(localStorage),
    ] as const;
  }

  async saveMetaData({
    cookies,
    sessionStorage,
    localStorage,
  }: {
    cookies: string;
    sessionStorage: string;
    localStorage: string;
  }) {
    return await Promise.all([
      this.cacheManager.set('photogen.cookies', cookies),
      this.cacheManager.set('photogen.sessionStorage', sessionStorage),
      this.cacheManager.set('photogen.localStorage', localStorage),
    ]);
  }

  async getMetadata() {
    return await Promise.all([
      this.cacheManager.get<string>('photogen.cookies'),
      this.cacheManager.get<string>('photogen.sessionStorage'),
      this.cacheManager.get<string>('photogen.localStorage'),
    ]);
  }

  async onModuleDestroy() {
    if (this.isLogined) {
      const [browser, page] = await this.browserData;

      const [cookies, sessionStorage, localStorage] =
        await this.collectMetaData(page);

      const screenshot = (await page.screenshot({
        encoding: 'binary',
      })) as Buffer;
      await this.logger.pipePhoto(screenshot);

      await this.saveMetaData({
        cookies,
        sessionStorage,
        localStorage,
      });

      await browser.close();
    }
  }
}
