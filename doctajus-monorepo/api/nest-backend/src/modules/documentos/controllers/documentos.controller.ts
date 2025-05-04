import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, Query, Req, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { User } from '../../auth/decorators/user.decorator';
import { DocumentosService } from '../services/documentos.service';
import { CreateDocumentoDto } from '../dto/create-documento.dto';
import { UpdateDocumentoDto } from '../dto/update-documento.dto';
import { DocumentoPermisoDto } from '../dto/documento-permiso.dto';
import { Request } from 'express';
import { EstadoDocumento } from '../entities/documento.entity';
import { diskStorage } from 'multer';
import { extname } from 'path';

@ApiTags('documentos')
@ApiBearerAuth()
// Temporalmente comentamos el guard para pruebas
// @UseGuards(JwtAuthGuard)
@Controller('documentos')
export class DocumentosController {
  constructor(private readonly documentosService: DocumentosService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los documentos' })
  @ApiQuery({ name: 'estado', required: false, enum: EstadoDocumento })
  @ApiQuery({ name: 'tipo', required: false })
  @ApiQuery({ name: 'clienteId', required: false })
  @ApiQuery({ name: 'expedienteId', required: false })
  @ApiQuery({ name: 'busqueda', required: false })
  findAll(
    @Query('estado') estado?: EstadoDocumento,
    @Query('tipo') tipo?: string,
    @Query('clienteId') clienteId?: string,
    @Query('expedienteId') expedienteId?: string,
    @Query('busqueda') busqueda?: string,
    @User('id') userId?: string,
  ) {
    console.log('GET /documentos - Obteniendo documentos con filtros:', { estado, tipo, clienteId, expedienteId, busqueda });
    return this.documentosService.findAll(
      {
        estado,
        tipo,
        clienteId,
        expedienteId,
        busqueda,
      },
      userId,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un documento por ID' })
  @ApiParam({ name: 'id', description: 'ID del documento' })
  findOne(@Param('id') id: string, @User('id') userId: string) {
    console.log(`GET /documentos/${id} - Obteniendo documento con ID: ${id}`);
    return this.documentosService.findOne(id, userId);
  }

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo documento' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        documento: { type: 'object' },
        archivo: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('archivo', {
      storage: diskStorage({
        destination: './uploads/temp',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  create(
    @Body() createDocumentoDto: CreateDocumentoDto,
    @UploadedFile() archivo: Express.Multer.File,
    @User('id') userId: string = 'user-test-1', // Valor por defecto para pruebas
    @Req() req: Request,
  ) {
    console.log('POST /documentos - Creando nuevo documento:', { createDocumentoDto, archivo: archivo?.originalname });
    return this.documentosService.create(createDocumentoDto, archivo, userId, req);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un documento existente' })
  @ApiParam({ name: 'id', description: 'ID del documento' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        documento: { type: 'object' },
        archivo: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('archivo', {
      storage: diskStorage({
        destination: './uploads/temp',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  update(
    @Param('id') id: string,
    @Body() updateDocumentoDto: UpdateDocumentoDto,
    @UploadedFile() archivo: Express.Multer.File,
    @User('id') userId: string,
    @Req() req: Request,
  ) {
    return this.documentosService.update(id, updateDocumentoDto, archivo, userId, req);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un documento' })
  @ApiParam({ name: 'id', description: 'ID del documento' })
  remove(@Param('id') id: string, @User('id') userId: string, @Req() req: Request) {
    return this.documentosService.remove(id, userId, req);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Descargar un documento' })
  @ApiParam({ name: 'id', description: 'ID del documento' })
  downloadFile(@Param('id') id: string, @User('id') userId: string, @Req() req: Request) {
    return this.documentosService.downloadFile(id, userId, req);
  }

  @Get(':id/versions')
  @ApiOperation({ summary: 'Obtener todas las versiones de un documento' })
  @ApiParam({ name: 'id', description: 'ID del documento' })
  getVersions(@Param('id') id: string, @User('id') userId: string) {
    return this.documentosService.getVersions(id, userId);
  }

  @Get(':id/versions/:versionId')
  @ApiOperation({ summary: 'Descargar una versión específica de un documento' })
  @ApiParam({ name: 'id', description: 'ID del documento' })
  @ApiParam({ name: 'versionId', description: 'ID de la versión' })
  getVersionFile(
    @Param('id') id: string,
    @Param('versionId') versionId: string,
    @User('id') userId: string,
    @Req() req: Request,
  ) {
    return this.documentosService.getVersionFile(id, versionId, userId, req);
  }

  @Get(':id/permissions')
  @ApiOperation({ summary: 'Obtener los permisos de un documento' })
  @ApiParam({ name: 'id', description: 'ID del documento' })
  getPermissions(@Param('id') id: string, @User('id') userId: string) {
    return this.documentosService.getPermissions(id, userId);
  }

  @Post(':id/permissions')
  @ApiOperation({ summary: 'Añadir permiso a un documento' })
  @ApiParam({ name: 'id', description: 'ID del documento' })
  addPermission(
    @Param('id') id: string,
    @Body() permisoDto: DocumentoPermisoDto,
    @User('id') userId: string,
    @Req() req: Request,
  ) {
    return this.documentosService.addPermission(id, permisoDto, userId, req);
  }

  @Delete(':id/permissions/:usuarioId')
  @ApiOperation({ summary: 'Eliminar permiso de un documento' })
  @ApiParam({ name: 'id', description: 'ID del documento' })
  @ApiParam({ name: 'usuarioId', description: 'ID del usuario cuyo permiso se eliminará' })
  removePermission(
    @Param('id') id: string,
    @Param('usuarioId') usuarioId: string,
    @User('id') userId: string,
    @Req() req: Request,
  ) {
    return this.documentosService.removePermission(id, usuarioId, userId, req);
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'Obtener historial de acciones de un documento' })
  @ApiParam({ name: 'id', description: 'ID del documento' })
  getHistory(@Param('id') id: string, @User('id') userId: string) {
    return this.documentosService.getHistory(id, userId);
  }

  @Patch(':id/estado')
  @ApiOperation({ summary: 'Cambiar el estado de un documento' })
  @ApiParam({ name: 'id', description: 'ID del documento' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        estado: {
          type: 'string',
          enum: ['borrador', 'finalizado', 'archivado', 'pendiente_revision', 'aprobado'],
        },
      },
      required: ['estado'],
    },
  })
  cambiarEstado(
    @Param('id') id: string,
    @Body('estado') estado: EstadoDocumento,
    @User('id') userId: string,
    @Req() req: Request,
  ) {
    return this.documentosService.cambiarEstado(id, estado, userId, req);
  }

  @Patch(':id/destacar')
  @ApiOperation({ summary: 'Marcar/desmarcar un documento como destacado' })
  @ApiParam({ name: 'id', description: 'ID del documento' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        destacado: {
          type: 'boolean',
        },
      },
      required: ['destacado'],
    },
  })
  toggleDestacado(
    @Param('id') id: string,
    @Body('destacado') destacado: boolean,
    @User('id') userId: string,
  ) {
    return this.documentosService.toggleDestacado(id, destacado, userId);
  }
}
