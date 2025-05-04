import { IsString, IsEnum, IsOptional, IsUUID, IsDate, IsNumber, IsBoolean, MinLength, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { EstadoExpediente, TipoExpediente } from '../entities/expediente.entity';

export class UpdateExpedienteDto {
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  @IsOptional()
  numero?: string;

  @IsString()
  @MinLength(5)
  @MaxLength(200)
  @IsOptional()
  titulo?: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsEnum(EstadoExpediente)
  @IsOptional()
  estado?: EstadoExpediente;

  @IsEnum(TipoExpediente)
  @IsOptional()
  tipo?: TipoExpediente;

  @IsString()
  @IsOptional()
  tribunal?: string;

  @IsString()
  @IsOptional()
  numeroJuzgado?: string;

  @IsString()
  @IsOptional()
  jurisdiccion?: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  fechaInicio?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  fechaVencimiento?: Date;

  @IsString()
  @IsOptional()
  contraparte?: string;

  @IsNumber()
  @IsOptional()
  valorPretension?: number;

  @IsNumber()
  @IsOptional()
  honorarios?: number;

  @IsBoolean()
  @IsOptional()
  esPrivado?: boolean;

  @IsUUID()
  @IsOptional()
  abogadoId?: string;

  @IsUUID()
  @IsOptional()
  clienteId?: string;
} 