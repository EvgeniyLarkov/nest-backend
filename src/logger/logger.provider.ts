import { prefixesForLoggers } from './logger.decorator';
import { Provider } from '@nestjs/common';
import { AppLogger } from './app-logger.service';

function loggerFactory(logger: AppLogger, prefix: string) {
  if (prefix) {
    logger.setContext(prefix);
  }
  return logger;
}

function createLoggerProvider(prefix: string): Provider<AppLogger> {
  return {
    provide: `AppLogger${prefix}`,
    useFactory: (logger) => loggerFactory(logger, prefix),
    inject: [AppLogger],
  };
}

export function createLoggerProviders(): Array<Provider<AppLogger>> {
  return prefixesForLoggers.map((prefix) => createLoggerProvider(prefix));
}
