import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Documento } from './documento.entity';

export type TipoAccion =
  | 'creacion'
  | 'modificacion'
  | 'cambio_estado'
  | 'nueva_version'
  | 'descarga'
  | 'cambio_permisos'
  | 'eliminacion'
  | 'restauracion'
  | 'visualizacion';

@Entity('documento_historial')
export class DocumentoHistorial {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Documento, documento => documento.historial)
  @JoinColumn({ name: 'documento_id' })
  documento: Documento;

  @Column({ name: 'documento_id' })
  documentoId: string;

  @Column({
    type: 'enum',
    enum: [
      'creacion',
      'modificacion',
      'cambio_estado',
      'nueva_version',
      'descarga',
      'cambio_permisos',
      'eliminacion',
      'restauracion',
      'visualizacion'
    ]
  })
  tipoAccion: TipoAccion;

  @Column({ type: 'text', nullable: true })
  detalles: string;

  @Column({ type: 'json', nullable: true })
  metadatos: Record<string, any>;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'usuario_id' })
  usuario: User;

  @Column({ name: 'usuario_id' })
  usuarioId: string;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipCliente: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  userAgent: string;

  @CreateDateColumn({ name: 'fecha_accion' })
  fechaAccion: Date;
}
