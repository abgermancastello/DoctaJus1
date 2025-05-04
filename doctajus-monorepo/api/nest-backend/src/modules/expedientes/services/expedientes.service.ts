import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expediente } from '../entities/expediente.entity';
import { CreateExpedienteDto } from '../dto/create-expediente.dto';
import { UpdateExpedienteDto } from '../dto/update-expediente.dto';

@Injectable()
export class ExpedientesService {
  constructor(
    @InjectRepository(Expediente)
    private expedientesRepository: Repository<Expediente>,
  ) {}

  async create(createExpedienteDto: CreateExpedienteDto): Promise<Expediente> {
    const expediente = this.expedientesRepository.create(createExpedienteDto);
    return this.expedientesRepository.save(expediente);
  }

  async findAll(): Promise<Expediente[]> {
    return this.expedientesRepository.find({
      relations: ['abogado', 'cliente']
    });
  }

  async findByAbogado(abogadoId: string): Promise<Expediente[]> {
    return this.expedientesRepository.find({
      where: { abogadoId },
      relations: ['abogado', 'cliente']
    });
  }

  async findByCliente(clienteId: string): Promise<Expediente[]> {
    return this.expedientesRepository.find({
      where: { clienteId },
      relations: ['abogado', 'cliente']
    });
  }

  async findOne(id: string): Promise<Expediente> {
    const expediente = await this.expedientesRepository.findOne({
      where: { id },
      relations: ['abogado', 'cliente', 'tareas']
    });
    
    if (!expediente) {
      throw new NotFoundException(`Expediente with ID "${id}" not found`);
    }
    
    return expediente;
  }

  async update(id: string, updateExpedienteDto: UpdateExpedienteDto): Promise<Expediente> {
    const expediente = await this.findOne(id);
    Object.assign(expediente, updateExpedienteDto);
    return this.expedientesRepository.save(expediente);
  }

  async remove(id: string): Promise<void> {
    const result = await this.expedientesRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Expediente with ID "${id}" not found`);
    }
  }
} 