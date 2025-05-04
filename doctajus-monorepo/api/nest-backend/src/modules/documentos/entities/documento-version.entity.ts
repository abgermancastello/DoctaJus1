import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Documento } from './documento.entity';

@Entity('documento_versiones')
export class DocumentoVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Documento, documento => documento.versiones)
  @JoinColumn({ name: 'documento_id' })
  documento: Documento;

  @Column({ name: 'documento_id' })
  documentoId: string;

  @Column({ type: 'int' })
  numeroVersion: number;

  @Column({ type: 'varchar', length: 255 })
  archivoUrl: string;

  @Column({ type: 'varchar', length: 50 })
  archivoNombre: string;

  @Column({ type: 'int' })
  archivoTamanio: number;

  @Column({ type: 'varchar', length: 50 })
  archivoFormato: string;

  @Column({ type: 'text', nullable: true })
  descripcionCambios: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'creado_por_id' })
  creadoPor: User;

  @Column({ name: 'creado_por_id' })
  creadoPorId: string;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;
}
