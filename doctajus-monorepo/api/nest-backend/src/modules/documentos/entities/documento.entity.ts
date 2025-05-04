import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Expediente } from '../../expedientes/entities/expediente.entity';
import { Cliente } from '../../clientes/entities/cliente.entity';
import { DocumentoVersion } from './documento-version.entity';
import { DocumentoPermiso } from './documento-permiso.entity';
import { DocumentoHistorial } from './documento-historial.entity';

export type TipoDocumento =
  | 'contrato'
  | 'demanda'
  | 'contestacion'
  | 'apelacion'
  | 'recurso'
  | 'poder'
  | 'sentencia'
  | 'resolucion'
  | 'pericia'
  | 'factura'
  | 'otro';

export type EstadoDocumento =
  | 'borrador'
  | 'finalizado'
  | 'archivado'
  | 'pendiente_revision'
  | 'aprobado';

@Entity('documentos')
export class Documento {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({
    type: 'enum',
    enum: [
      'contrato',
      'demanda',
      'contestacion',
      'apelacion',
      'recurso',
      'poder',
      'sentencia',
      'resolucion',
      'pericia',
      'factura',
      'otro'
    ],
    default: 'otro'
  })
  tipo: TipoDocumento;

  @Column({
    type: 'enum',
    enum: [
      'borrador',
      'finalizado',
      'archivado',
      'pendiente_revision',
      'aprobado'
    ],
    default: 'borrador'
  })
  estado: EstadoDocumento;

  @ManyToOne(() => Expediente, { nullable: true })
  @JoinColumn({ name: 'expediente_id' })
  expediente: Expediente;

  @Column({ nullable: true, name: 'expediente_id' })
  expedienteId: string;

  @ManyToOne(() => Cliente, { nullable: true })
  @JoinColumn({ name: 'cliente_id' })
  cliente: Cliente;

  @Column({ nullable: true, name: 'cliente_id' })
  clienteId: string;

  @Column({ type: 'varchar', length: 255 })
  archivoUrl: string;

  @Column({ type: 'varchar', length: 50 })
  archivoNombre: string;

  @Column({ type: 'int' })
  archivoTamanio: number;

  @Column({ type: 'varchar', length: 50 })
  archivoFormato: string;

  @Column({ type: 'simple-array', nullable: true })
  etiquetas: string[];

  @Column({ type: 'boolean', default: false })
  destacado: boolean;

  @Column({ type: 'boolean', default: false })
  esPublico: boolean;

  @Column({ type: 'int', default: 1 })
  versionActual: number;

  @Column({ type: 'boolean', default: false })
  indexadoParaBusqueda: boolean;

  @Column({ type: 'text', nullable: true })
  contenidoIndexado: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'creado_por_id' })
  creadoPor: User;

  @Column({ name: 'creado_por_id' })
  creadoPorId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'modificado_por_id' })
  modificadoPor: User;

  @Column({ nullable: true, name: 'modificado_por_id' })
  modificadoPorId: string;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion' })
  fechaModificacion: Date;

  // Relaciones
  @OneToMany(() => DocumentoVersion, version => version.documento)
  versiones: DocumentoVersion[];

  @OneToMany(() => DocumentoPermiso, permiso => permiso.documento)
  permisos: DocumentoPermiso[];

  @OneToMany(() => DocumentoHistorial, historial => historial.documento)
  historial: DocumentoHistorial[];
}
