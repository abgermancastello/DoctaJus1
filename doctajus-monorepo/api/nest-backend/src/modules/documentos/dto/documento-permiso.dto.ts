import { IsEnum, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TipoPermiso } from '../entities/documento-permiso.entity';

export class DocumentoPermisoDto {
  @ApiProperty({ description: 'ID del usuario al que se le otorga el permiso' })
  @IsUUID()
  usuarioId: string;

  @ApiProperty({
    description: 'Tipo de permiso a otorgar',
    enum: ['lectura', 'escritura', 'administrador'],
    default: 'lectura'
  })
  @IsEnum(['lectura', 'escritura', 'administrador'])
  tipoPermiso: TipoPermiso;
}
