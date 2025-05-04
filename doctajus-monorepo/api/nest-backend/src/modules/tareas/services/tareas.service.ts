import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Tarea, EstadoTarea } from '../entities/tarea.entity';
import { CreateTareaDto } from '../dto/create-tarea.dto';
import { UpdateTareaDto } from '../dto/update-tarea.dto';

@Injectable()
export class TareasService {
  constructor(
    @InjectRepository(Tarea)
    private tareasRepository: Repository<Tarea>,
  ) {}

  async create(createTareaDto: CreateTareaDto): Promise<Tarea> {
    const tarea = this.tareasRepository.create(createTareaDto);
    return this.tareasRepository.save(tarea);
  }

  async findAll(): Promise<Tarea[]> {
    return this.tareasRepository.find({
      relations: ['asignadoA', 'creadoPor', 'expediente']
    });
  }

  async findByAsignadoA(asignadoAId: string): Promise<Tarea[]> {
    return this.tareasRepository.find({
      where: { asignadoAId },
      relations: ['asignadoA', 'creadoPor', 'expediente']
    });
  }

  async findByExpediente(expedienteId: string): Promise<Tarea[]> {
    return this.tareasRepository.find({
      where: { expedienteId },
      relations: ['asignadoA', 'creadoPor', 'expediente']
    });
  }

  async findVencidas(): Promise<Tarea[]> {
    const hoy = new Date();
    return this.tareasRepository.find({
      where: {
        fechaVencimiento: LessThanOrEqual(hoy),
        estado: EstadoTarea.PENDIENTE
      },
      relations: ['asignadoA', 'creadoPor', 'expediente']
    });
  }

  async findProximasAVencer(dias: number = 7): Promise<Tarea[]> {
    const hoy = new Date();
    const limitDate = new Date();
    limitDate.setDate(hoy.getDate() + dias);
    
    return this.tareasRepository.find({
      where: {
        fechaVencimiento: Between(hoy, limitDate),
        estado: EstadoTarea.PENDIENTE
      },
      relations: ['asignadoA', 'creadoPor', 'expediente']
    });
  }

  async findOne(id: string): Promise<Tarea> {
    const tarea = await this.tareasRepository.findOne({
      where: { id },
      relations: ['asignadoA', 'creadoPor', 'expediente']
    });
    
    if (!tarea) {
      throw new NotFoundException(`Tarea with ID "${id}" not found`);
    }
    
    return tarea;
  }

  async update(id: string, updateTareaDto: UpdateTareaDto): Promise<Tarea> {
    const tarea = await this.findOne(id);
    Object.assign(tarea, updateTareaDto);
    return this.tareasRepository.save(tarea);
  }

  async completarTarea(id: string): Promise<Tarea> {
    const tarea = await this.findOne(id);
    tarea.estado = EstadoTarea.COMPLETADA;
    return this.tareasRepository.save(tarea);
  }

  async remove(id: string): Promise<void> {
    const result = await this.tareasRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Tarea with ID "${id}" not found`);
    }
  }
} 