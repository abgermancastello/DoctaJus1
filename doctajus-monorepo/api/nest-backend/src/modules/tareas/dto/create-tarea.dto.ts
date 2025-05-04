import { IsString, IsEnum, IsOptional, IsUUID, IsDate, IsNumber, IsBoolean, MinLength, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { PrioridadTarea, EstadoTarea } from '../entities/tarea.entity';

export class CreateTareaDto {
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  titulo: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsDate()
  @Type(() => Date)
  fechaVencimiento: Date;

  @IsEnum(PrioridadTarea)
  @IsOptional()
  prioridad?: PrioridadTarea;

  @IsEnum(EstadoTarea)
  @IsOptional()
  estado?: EstadoTarea;

  @IsNumber()
  @IsOptional()
  horasEstimadas?: number;

  @IsBoolean()
  @IsOptional()
  esRecurrente?: boolean;

  @IsString()
  @IsOptional()
  recurrenciaPattern?: string;

  @IsString()
  @IsOptional()
  notificaciones?: string;

  @IsUUID()
  @IsOptional()
  asignadoAId?: string;

  @IsUUID()
  @IsOptional()
  creadoPorId?: string;

  @IsUUID()
  @IsOptional()
  expedienteId?: string;
} 