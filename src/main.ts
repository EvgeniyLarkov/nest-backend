import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { useContainer } from 'class-validator';
import { AppModule } from './app.module';
import { AppLogger } from './logger/app-logger.service';
import { SharedModule } from './shared/shared.module';
import { SerializerInterceptor } from './utils/serializer.interceptor';
import validationOptions from './utils/validation-options';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });
  const configService = app.get(ConfigService);

  app.enableShutdownHooks();
  app.setGlobalPrefix(configService.get('app.apiPrefix'), {
    exclude: ['/'],
  });
  app.enableVersioning({
    type: VersioningType.URI,
  });
  app.useGlobalInterceptors(new SerializerInterceptor());
  app.useGlobalPipes(new ValidationPipe(validationOptions));
  app.enableShutdownHooks();

  const options = new DocumentBuilder()
    .setTitle('API')
    .setDescription('API docs')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('docs', app, document);

  useContainer(app.select(SharedModule), { fallbackOnErrors: true });

  app.useLogger(await app.resolve(AppLogger));
  await app.listen(configService.get('app.port'));
}

void bootstrap();
