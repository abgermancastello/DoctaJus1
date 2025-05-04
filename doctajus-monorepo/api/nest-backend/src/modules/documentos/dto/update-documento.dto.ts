import { PartialType } from '@nestjs/mapped-types';
import { CreateDocumentoDto } from './create-documento.dto';
import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateDocumentoDto extends PartialType(CreateDocumentoDto) {
  @ApiPropertyOptional({ description: 'Descripción de los cambios realizados en esta actualización' })
  @IsString()
  @IsOptional()
  descripcionCambios?: string;
}
