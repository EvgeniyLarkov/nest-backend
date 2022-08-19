import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: this.configService.get('chat-db.type'),
      url: this.configService.get('chat-db.url'),
      host: this.configService.get('chat-db.host'),
      port: this.configService.get('chat-db.port'),
      username: this.configService.get('chat-db.username'),
      password: this.configService.get('chat-db.password'),
      database: this.configService.get('chat-db.name'),
      synchronize: this.configService.get('chat-db.synchronize'),
      dropSchema: false,
      keepConnectionAlive: true,
      logging: this.configService.get('app.nodeEnv') !== 'production',
      entities: [__dirname + '/../chat/*.entity{.ts,.js}'],
      extra: {
        // Udalit
        max: this.configService.get('chat-db.maxConnections'),
        ssl: this.configService.get('chat-db.sslEnabled')
          ? {
              rejectUnauthorized: this.configService.get(
                'database.rejectUnauthorized',
              ),
              ca: this.configService.get('database.ca')
                ? this.configService.get('database.ca')
                : undefined,
              key: this.configService.get('database.key')
                ? this.configService.get('database.key')
                : undefined,
              cert: this.configService.get('database.cert')
                ? this.configService.get('database.cert')
                : undefined,
            }
          : undefined,
      },
    } as TypeOrmModuleOptions;
  }
}
