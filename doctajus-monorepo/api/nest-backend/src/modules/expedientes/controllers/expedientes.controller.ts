import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ExpedientesService } from '../services/expedientes.service';
import { CreateExpedienteDto } from '../dto/create-expediente.dto';
import { UpdateExpedienteDto } from '../dto/update-expediente.dto';
import { ExpedienteResponseDto } from '../dto/expediente-response.dto';
import { plainToClass } from 'class-transformer';
// import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
// import { RolesGuard } from '../../auth/guards/roles.guard';
// import { Roles } from '../../auth/decorators/roles.decorator';
// import { UserRole } from '../../users/entities/user.entity';

@Controller('expedientes')
export class ExpedientesController {
  constructor(private readonly expedientesService: ExpedientesService) {}

  @Post()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(UserRole.ADMIN, UserRole.ABOGADO)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createExpedienteDto: CreateExpedienteDto): Promise<ExpedienteResponseDto> {
    const expediente = await this.expedientesService.create(createExpedienteDto);
    return plainToClass(ExpedienteResponseDto, expediente, { excludeExtraneousValues: true });
  }

  @Get()
  // @UseGuards(JwtAuthGuard)
  async findAll(@Query('abogadoId') abogadoId?: string, @Query('clienteId') clienteId?: string): Promise<ExpedienteResponseDto[]> {
    let expedientes: any[];

    if (abogadoId) {
      expedientes = await this.expedientesService.findByAbogado(abogadoId);
    } else if (clienteId) {
      expedientes = await this.expedientesService.findByCliente(clienteId);
    } else {
      expedientes = await this.expedientesService.findAll();
    }

    return expedientes.map(expediente => 
      plainToClass(ExpedienteResponseDto, expediente, { excludeExtraneousValues: true })
    );
  }

  @Get(':id')
  // @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string): Promise<ExpedienteResponseDto> {
    const expediente = await this.expedientesService.findOne(id);
    return plainToClass(ExpedienteResponseDto, expediente, { excludeExtraneousValues: true });
  }

  @Patch(':id')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(UserRole.ADMIN, UserRole.ABOGADO)
  async update(@Param('id') id: string, @Body() updateExpedienteDto: UpdateExpedienteDto): Promise<ExpedienteResponseDto> {
    const expediente = await this.expedientesService.update(id, updateExpedienteDto);
    return plainToClass(ExpedienteResponseDto, expediente, { excludeExtraneousValues: true });
  }

  @Delete(':id')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.expedientesService.remove(id);
  }
} 