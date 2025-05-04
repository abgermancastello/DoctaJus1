import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Expediente } from './entities/expediente.entity';
import { ExpedientesService } from './services/expedientes.service';
import { ExpedientesController } from './controllers/expedientes.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Expediente]),
  ],
  controllers: [ExpedientesController],
  providers: [ExpedientesService],
  exports: [TypeOrmModule, ExpedientesService],
})
export class ExpedientesModule {} 