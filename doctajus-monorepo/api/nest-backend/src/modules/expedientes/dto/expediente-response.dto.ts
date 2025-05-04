import { Exclude, Expose, Type } from 'class-transformer';
import { EstadoExpediente, TipoExpediente } from '../entities/expediente.entity';
import { UserResponseDto } from '../../users/dto/user-response.dto';

@Exclude()
export class ExpedienteResponseDto {
  @Expose()
  id: string;

  @Expose()
  numero: string;

  @Expose()
  titulo: string;

  @Expose()
  descripcion: string;

  @Expose()
  estado: EstadoExpediente;

  @Expose()
  tipo: TipoExpediente;

  @Expose()
  tribunal: string;

  @Expose()
  numeroJuzgado: string;

  @Expose()
  jurisdiccion: string;

  @Expose()
  fechaInicio: Date;

  @Expose()
  fechaVencimiento: Date;

  @Expose()
  contraparte: string;

  @Expose()
  valorPretension: number;

  @Expose()
  honorarios: number;

  @Expose()
  esPrivado: boolean;

  @Expose()
  abogadoId: string;

  @Expose()
  clienteId: string;

  @Expose()
  @Type(() => UserResponseDto)
  abogado: UserResponseDto;

  @Expose()
  @Type(() => UserResponseDto)
  cliente: UserResponseDto;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
} 