import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tarea } from './entities/tarea.entity';
import { TareasService } from './services/tareas.service';
import { TareasController } from './controllers/tareas.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tarea]),
  ],
  controllers: [TareasController],
  providers: [TareasService],
  exports: [TypeOrmModule, TareasService],
})
export class TareasModule {} 