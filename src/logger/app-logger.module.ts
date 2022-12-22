import { Module, Global } from '@nestjs/common';
import { TgBotModule } from 'src/tg-bot/tg-bot.module';
import { AppLogger } from './app-logger.service';

@Global()
@Module({
  imports: [TgBotModule],
  providers: [AppLogger],
  exports: [AppLogger],
})
export class LoggerModule {}

// import { Global, DynamicModule } from '@nestjs/common';
// import { TgBotModule } from 'src/tg-bot/tg-bot.module';
// import { AppLogger } from './app-logger.service';
// import { createLoggerProviders } from './logger.provider';

// export class LoggerModule {
//   static forRoot(): DynamicModule {
//     const prefixedLoggerProviders = createLoggerProviders();
//     return {
//       module: LoggerModule,
//       imports: [TgBotModule],
//       providers: [AppLogger, ...prefixedLoggerProviders],
//       exports: [AppLogger, ...prefixedLoggerProviders],
//     };
//   }
// }
