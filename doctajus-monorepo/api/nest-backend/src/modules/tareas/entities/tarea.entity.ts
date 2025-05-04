import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Expediente } from '../../expedientes/entities/expediente.entity';

export enum PrioridadTarea {
  BAJA = 'baja',
  MEDIA = 'media',
  ALTA = 'alta',
  URGENTE = 'urgente',
}

export enum EstadoTarea {
  PENDIENTE = 'pendiente',
  EN_PROGRESO = 'en_progreso',
  COMPLETADA = 'completada',
  CANCELADA = 'cancelada',
}

@Entity('tareas')
export class Tarea {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  titulo: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ type: 'date' })
  fechaVencimiento: Date;

  @Column({
    type: 'enum',
    enum: PrioridadTarea,
    default: PrioridadTarea.MEDIA
  })
  prioridad: PrioridadTarea;

  @Column({
    type: 'enum',
    enum: EstadoTarea,
    default: EstadoTarea.PENDIENTE
  })
  estado: EstadoTarea;

  @Column({ nullable: true, type: 'int' })
  horasEstimadas: number;

  @Column({ nullable: true, type: 'int' })
  horasReales: number;

  @Column({ default: false })
  esRecurrente: boolean;

  @Column({ nullable: true })
  recurrenciaPattern: string;

  @Column({ nullable: true })
  notificaciones: string;

  @ManyToOne(() => User, user => user.tareasAsignadas)
  @JoinColumn({ name: 'asignadoAId' })
  asignadoA: User;

  @Column({ nullable: true })
  asignadoAId: string;

  @ManyToOne(() => User, user => user.tareasCreadas)
  @JoinColumn({ name: 'creadoPorId' })
  creadoPor: User;

  @Column({ nullable: true })
  creadoPorId: string;

  @ManyToOne(() => Expediente, expediente => expediente.tareas)
  @JoinColumn({ name: 'expedienteId' })
  expediente: Expediente;

  @Column({ nullable: true })
  expedienteId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 