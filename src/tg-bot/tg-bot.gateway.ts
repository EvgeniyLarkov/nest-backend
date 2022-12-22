import { Update, Ctx, Start, Help, On, Hears } from 'nestjs-telegraf';
import { TgContext } from './types/tg-context';

@Update()
export class TgBotGateway {
  // constructor(private readonly logger: AppLogger) {}

  @Start()
  async start(@Ctx() ctx: TgContext) {
    await ctx.reply('Welcome');
  }

  @Help()
  async help(@Ctx() ctx: TgContext) {
    await ctx.reply('Send me a sticker');
  }

  @On('sticker')
  async on(@Ctx() ctx: TgContext) {
    await ctx.reply('👍');
  }

  @Hears('hi')
  async hears(@Ctx() ctx: TgContext) {
    await ctx.reply('Hey there');
  }

  @Hears('ctx')
  async ctx(@Ctx() ctx: TgContext) {
    await ctx.reply(
      `Chat: ${ctx.chat.id} \n Update: ${JSON.stringify(ctx.update)}`,
    );
  }

  // @Hears('test')
  // test(@Ctx() ctx: TgContext) {
  //   this.logger.log(ctx);
  // }
}
