import { IsString, IsEnum, IsOptional, IsArray, IsBoolean, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipoDocumento, EstadoDocumento } from '../entities/documento.entity';

export class CreateDocumentoDto {
  @ApiProperty({ description: 'Nombre del documento' })
  @IsString()
  nombre: string;

  @ApiPropertyOptional({ description: 'Descripción del documento' })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiProperty({
    description: 'Tipo de documento',
    enum: ['contrato', 'demanda', 'contestacion', 'apelacion', 'recurso', 'poder', 'sentencia', 'resolucion', 'pericia', 'factura', 'otro'],
    default: 'otro'
  })
  @IsEnum(['contrato', 'demanda', 'contestacion', 'apelacion', 'recurso', 'poder', 'sentencia', 'resolucion', 'pericia', 'factura', 'otro'])
  tipo: TipoDocumento;

  @ApiProperty({
    description: 'Estado del documento',
    enum: ['borrador', 'finalizado', 'archivado', 'pendiente_revision', 'aprobado'],
    default: 'borrador'
  })
  @IsEnum(['borrador', 'finalizado', 'archivado', 'pendiente_revision', 'aprobado'])
  estado: EstadoDocumento;

  @ApiPropertyOptional({ description: 'ID del expediente relacionado' })
  @IsUUID()
  @IsOptional()
  expedienteId?: string;

  @ApiPropertyOptional({ description: 'ID del cliente relacionado' })
  @IsUUID()
  @IsOptional()
  clienteId?: string;

  @ApiPropertyOptional({ description: 'Etiquetas para categorizar el documento' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  etiquetas?: string[];

  @ApiPropertyOptional({ description: 'Indica si el documento es público', default: false })
  @IsBoolean()
  @IsOptional()
  esPublico?: boolean;

  @ApiPropertyOptional({ description: 'Indica si el documento está destacado', default: false })
  @IsBoolean()
  @IsOptional()
  destacado?: boolean;

  // Nota: El archivo se manejará a través de la carga de archivos en el controlador
  // y no directamente en este DTO. Los campos relacionados con el archivo se
  // completarán en el servicio después de procesar la carga.
}
