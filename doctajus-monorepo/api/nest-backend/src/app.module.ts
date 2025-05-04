import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { ExpedientesModule } from './modules/expedientes/expedientes.module';
import { TareasModule } from './modules/tareas/tareas.module';
import { AuthModule } from './modules/auth/auth.module';
import { DocumentosModule } from './modules/documentos/documentos.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST', 'postgres'),
        port: +configService.get('DATABASE_PORT', 5432),
        username: configService.get('DATABASE_USERNAME', 'doctajus'),
        password: configService.get('DATABASE_PASSWORD', 'doctajuspass'),
        database: configService.get('DATABASE_NAME', 'doctajus'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('NODE_ENV') !== 'production',
        logging: configService.get('NODE_ENV') !== 'production',
      }),
    }),
    UsersModule,
    ExpedientesModule,
    TareasModule,
    AuthModule,
    DocumentosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
