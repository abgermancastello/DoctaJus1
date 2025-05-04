import { Exclude, Expose, Type } from 'class-transformer';
import { PrioridadTarea, EstadoTarea } from '../entities/tarea.entity';
import { UserResponseDto } from '../../users/dto/user-response.dto';
import { ExpedienteResponseDto } from '../../expedientes/dto/expediente-response.dto';

@Exclude()
export class TareaResponseDto {
  @Expose()
  id: string;

  @Expose()
  titulo: string;

  @Expose()
  descripcion: string;

  @Expose()
  fechaVencimiento: Date;

  @Expose()
  prioridad: PrioridadTarea;

  @Expose()
  estado: EstadoTarea;

  @Expose()
  horasEstimadas: number;

  @Expose()
  horasReales: number;

  @Expose()
  esRecurrente: boolean;

  @Expose()
  recurrenciaPattern: string;

  @Expose()
  notificaciones: string;

  @Expose()
  asignadoAId: string;

  @Expose()
  creadoPorId: string;

  @Expose()
  expedienteId: string;

  @Expose()
  @Type(() => UserResponseDto)
  asignadoA: UserResponseDto;

  @Expose()
  @Type(() => UserResponseDto)
  creadoPor: UserResponseDto;

  @Expose()
  @Type(() => ExpedienteResponseDto)
  expediente: ExpedienteResponseDto;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
} 