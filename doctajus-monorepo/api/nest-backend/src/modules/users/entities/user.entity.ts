import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, BeforeInsert, BeforeUpdate } from 'typeorm';
import { Exclude } from 'class-transformer';
import * as bcrypt from 'bcrypt';
import { Expediente } from '../../expedientes/entities/expediente.entity';
import { Tarea } from '../../tareas/entities/tarea.entity';

export enum UserRole {
  ADMIN = 'admin',
  ABOGADO = 'abogado',
  ASISTENTE = 'asistente',
  CLIENTE = 'cliente',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  firstName: string;

  @Column({ length: 100 })
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude({ toPlainOnly: true })
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CLIENTE
  })
  role: UserRole;

  @Column({ nullable: true })
  profilePicture: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  lastLogin: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Expediente, expediente => expediente.abogado)
  expedientesAsignados: Expediente[];

  @OneToMany(() => Expediente, expediente => expediente.cliente)
  expedientesCliente: Expediente[];

  @OneToMany(() => Tarea, tarea => tarea.asignadoA)
  tareasAsignadas: Tarea[];

  @OneToMany(() => Tarea, tarea => tarea.creadoPor)
  tareasCreadas: Tarea[];

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
} 