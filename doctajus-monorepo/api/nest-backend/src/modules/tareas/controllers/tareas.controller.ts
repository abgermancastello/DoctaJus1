import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { TareasService } from '../services/tareas.service';
import { CreateTareaDto } from '../dto/create-tarea.dto';
import { UpdateTareaDto } from '../dto/update-tarea.dto';
import { TareaResponseDto } from '../dto/tarea-response.dto';
import { plainToClass } from 'class-transformer';
// import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
// import { RolesGuard } from '../../auth/guards/roles.guard';
// import { Roles } from '../../auth/decorators/roles.decorator';
// import { UserRole } from '../../users/entities/user.entity';

@Controller('tareas')
export class TareasController {
  constructor(private readonly tareasService: TareasService) {}

  @Post()
  // @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createTareaDto: CreateTareaDto): Promise<TareaResponseDto> {
    const tarea = await this.tareasService.create(createTareaDto);
    return plainToClass(TareaResponseDto, tarea, { excludeExtraneousValues: true });
  }

  @Get()
  // @UseGuards(JwtAuthGuard)
  async findAll(
    @Query('asignadoAId') asignadoAId?: string, 
    @Query('expedienteId') expedienteId?: string,
    @Query('vencidas') vencidas?: string,
    @Query('proximasAVencer') proximasAVencer?: string,
    @Query('dias') dias?: string,
  ): Promise<TareaResponseDto[]> {
    let tareas: any[];

    if (asignadoAId) {
      tareas = await this.tareasService.findByAsignadoA(asignadoAId);
    } else if (expedienteId) {
      tareas = await this.tareasService.findByExpediente(expedienteId);
    } else if (vencidas === 'true') {
      tareas = await this.tareasService.findVencidas();
    } else if (proximasAVencer === 'true') {
      const diasNum = dias ? parseInt(dias, 10) : 7;
      tareas = await this.tareasService.findProximasAVencer(diasNum);
    } else {
      tareas = await this.tareasService.findAll();
    }

    return tareas.map(tarea => 
      plainToClass(TareaResponseDto, tarea, { excludeExtraneousValues: true })
    );
  }

  @Get(':id')
  // @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string): Promise<TareaResponseDto> {
    const tarea = await this.tareasService.findOne(id);
    return plainToClass(TareaResponseDto, tarea, { excludeExtraneousValues: true });
  }

  @Patch(':id')
  // @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() updateTareaDto: UpdateTareaDto): Promise<TareaResponseDto> {
    const tarea = await this.tareasService.update(id, updateTareaDto);
    return plainToClass(TareaResponseDto, tarea, { excludeExtraneousValues: true });
  }

  @Patch(':id/completar')
  // @UseGuards(JwtAuthGuard)
  async completar(@Param('id') id: string): Promise<TareaResponseDto> {
    const tarea = await this.tareasService.completarTarea(id);
    return plainToClass(TareaResponseDto, tarea, { excludeExtraneousValues: true });
  }

  @Delete(':id')
  // @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.tareasService.remove(id);
  }
} 