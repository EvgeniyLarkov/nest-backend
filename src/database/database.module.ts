import { Module, Global } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { Role } from 'src/roles/entities/role.entity';
import { Status } from 'src/statuses/entities/status.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const config: TypeOrmModuleOptions = {
          type: configService.get('database.type'),
          url: configService.get('database.url'),
          host: configService.get('database.host'),
          port: configService.get('database.port'),
          username: configService.get('database.username'),
          password: configService.get('database.password') as string,
          database: configService.get('database.name'),
          synchronize: configService.get('database.synchronize'),
          dropSchema: false,
          keepConnectionAlive: true,
          logging: false, // configService.get('app.nodeEnv') !== 'production',
          autoLoadEntities: true,
          entities: [Role, Status],
          //   cli: {
          //     entitiesDir: 'src',
          //     migrationsDir: 'src/database/migrations',
          //     subscribersDir: 'subscriber',
          //   },
          extra: {
            max: configService.get('database.maxConnections'),
            ssl: configService.get('database.sslEnabled')
              ? {
                  rejectUnauthorized: configService.get(
                    'database.rejectUnauthorized',
                  ),
                  ca: configService.get('database.ca')
                    ? configService.get('database.ca')
                    : undefined,
                  key: configService.get('database.key')
                    ? configService.get('database.key')
                    : undefined,
                  cert: configService.get('database.cert')
                    ? configService.get('database.cert')
                    : undefined,
                }
              : undefined,
          },
        } as TypeOrmModuleOptions;

        return config;
      },
      dataSourceFactory: async (options) => {
        const dataSource = await new DataSource(options).initialize();
        return dataSource;
      },
    }),
  ],
})
export class DatabaseModule {}
