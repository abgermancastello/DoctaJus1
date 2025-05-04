import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Tarea } from '../../tareas/entities/tarea.entity';

export enum EstadoExpediente {
  NUEVO = 'nuevo',
  EN_PROCESO = 'en_proceso',
  EN_REVISION = 'en_revision',
  CERRADO = 'cerrado',
  ARCHIVADO = 'archivado',
}

export enum TipoExpediente {
  CIVIL = 'civil',
  PENAL = 'penal',
  LABORAL = 'laboral',
  COMERCIAL = 'comercial',
  FAMILIAR = 'familiar',
  ADMINISTRATIVO = 'administrativo',
  OTRO = 'otro',
}

@Entity('expedientes')
export class Expediente {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  numero: string;

  @Column({ length: 200 })
  titulo: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({
    type: 'enum',
    enum: EstadoExpediente,
    default: EstadoExpediente.NUEVO
  })
  estado: EstadoExpediente;

  @Column({
    type: 'enum',
    enum: TipoExpediente,
    default: TipoExpediente.OTRO
  })
  tipo: TipoExpediente;

  @Column({ nullable: true })
  tribunal: string;

  @Column({ nullable: true })
  numeroJuzgado: string;

  @Column({ nullable: true })
  jurisdiccion: string;

  @Column({ type: 'date', nullable: true })
  fechaInicio: Date;

  @Column({ type: 'date', nullable: true })
  fechaVencimiento: Date;

  @Column({ nullable: true })
  contraparte: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  valorPretension: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  honorarios: number;

  @Column({ type: 'boolean', default: false })
  esPrivado: boolean;

  @ManyToOne(() => User, user => user.expedientesAsignados)
  @JoinColumn({ name: 'abogadoId' })
  abogado: User;

  @Column({ nullable: true })
  abogadoId: string;

  @ManyToOne(() => User, user => user.expedientesCliente)
  @JoinColumn({ name: 'clienteId' })
  cliente: User;

  @Column({ nullable: true })
  clienteId: string;

  @OneToMany(() => Tarea, tarea => tarea.expediente)
  tareas: Tarea[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 