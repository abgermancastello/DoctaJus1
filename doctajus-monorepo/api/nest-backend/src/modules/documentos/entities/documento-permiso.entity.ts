import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Documento } from './documento.entity';

export type TipoPermiso = 'lectura' | 'escritura' | 'administrador';

@Entity('documento_permisos')
export class DocumentoPermiso {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Documento, documento => documento.permisos)
  @JoinColumn({ name: 'documento_id' })
  documento: Documento;

  @Column({ name: 'documento_id' })
  documentoId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'usuario_id' })
  usuario: User;

  @Column({ name: 'usuario_id' })
  usuarioId: string;

  @Column({
    type: 'enum',
    enum: ['lectura', 'escritura', 'administrador'],
    default: 'lectura'
  })
  tipoPermiso: TipoPermiso;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'otorgado_por_id' })
  otorgadoPor: User;

  @Column({ name: 'otorgado_por_id' })
  otorgadoPorId: string;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion' })
  fechaModificacion: Date;
}
