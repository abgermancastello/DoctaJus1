import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Like, In } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Documento, EstadoDocumento } from '../entities/documento.entity';
import { DocumentoVersion } from '../entities/documento-version.entity';
import { DocumentoPermiso, TipoPermiso } from '../entities/documento-permiso.entity';
import { DocumentoHistorial } from '../entities/documento-historial.entity';
import { CreateDocumentoDto } from '../dto/create-documento.dto';
import { UpdateDocumentoDto } from '../dto/update-documento.dto';
import { DocumentoPermisoDto } from '../dto/documento-permiso.dto';
import { StorageService } from '../../storage/services/storage.service';
import { TextExtractorService } from '../../ia-service/services/text-extractor.service';
import { Request } from 'express';

@Injectable()
export class DocumentosService {
  constructor(
    @InjectRepository(Documento)
    private documentoRepository: Repository<Documento>,
    @InjectRepository(DocumentoVersion)
    private versionRepository: Repository<DocumentoVersion>,
    @InjectRepository(DocumentoPermiso)
    private permisoRepository: Repository<DocumentoPermiso>,
    @InjectRepository(DocumentoHistorial)
    private historialRepository: Repository<DocumentoHistorial>,
    private configService: ConfigService,
    private storageService: StorageService,
    private textExtractorService: TextExtractorService
  ) {}

  async findAll(
    filters: {
      busqueda?: string;
      tipo?: string;
      estado?: EstadoDocumento;
      expedienteId?: string;
      clienteId?: string;
      fechaDesde?: Date;
      fechaHasta?: Date;
      etiquetas?: string[];
      destacados?: boolean;
    },
    userId?: string
  ) {
    try {
      console.log('DocumentosService.findAll - Iniciando búsqueda con filtros:', filters);

      // Construir condiciones de búsqueda
      const where: FindOptionsWhere<Documento> = {};

      // Filtro por texto (busca en nombre, descripción)
      if (filters.busqueda) {
        where.nombre = Like(`%${filters.busqueda}%`);
        // También podemos buscar en contenido indexado si está disponible
      }

      // Otros filtros
      if (filters.tipo) where.tipo = filters.tipo as any;
      if (filters.estado) where.estado = filters.estado;
      if (filters.expedienteId) where.expedienteId = filters.expedienteId;
      if (filters.clienteId) where.clienteId = filters.clienteId;
      if (filters.destacados) where.destacado = true;

      console.log('DocumentosService.findAll - Condiciones de búsqueda:', where);

      // Simplificar la búsqueda inicialmente para depuración
      const documentos = await this.documentoRepository.find({
        where,
        order: {
          fechaModificacion: 'DESC'
        }
      });

      console.log(`DocumentosService.findAll - Se encontraron ${documentos.length} documentos`);

      // Si no se requiere filtrado por permisos o no hay userId, devolver todos los documentos
      if (!userId) {
        return documentos;
      }

      // Filtrar por permisos (solo documentos públicos o a los que el usuario tiene acceso)
      const documentosConAcceso = await Promise.all(
        documentos.map(async doc => {
          const tieneAcceso = await this.verificarAccesoDocumento(doc.id, userId);
          return tieneAcceso ? doc : null;
        })
      );

      const resultado = documentosConAcceso.filter(doc => doc !== null);
      console.log(`DocumentosService.findAll - Después de filtrar por permisos, quedan ${resultado.length} documentos`);

      return resultado;
    } catch (error) {
      console.error('DocumentosService.findAll - Error:', error);
      throw error;
    }
  }

  async findOne(id: string, userId: string) {
    const documento = await this.documentoRepository.findOne({
      where: { id },
      relations: ['expediente', 'cliente', 'creadoPor', 'modificadoPor'],
    });

    if (!documento) {
      throw new NotFoundException(`Documento con ID ${id} no encontrado`);
    }

    // Verificar permisos de acceso
    const tieneAcceso = await this.verificarAccesoDocumento(id, userId);
    if (!tieneAcceso) {
      throw new ForbiddenException('No tienes permiso para acceder a este documento');
    }

    // Registrar visualización en el historial
    await this.registrarAccionHistorial(id, userId, 'visualizacion', 'Documento visualizado');

    return documento;
  }

  async create(createDocumentoDto: CreateDocumentoDto, archivo: Express.Multer.File, userId: string, req: Request) {
    // Subir archivo al almacenamiento
    const archivoSubido = await this.storageService.uploadFile(archivo, 'documentos');

    // Crear nuevo documento
    const nuevoDocumento = this.documentoRepository.create({
      ...createDocumentoDto,
      archivoUrl: archivoSubido.url,
      archivoNombre: archivo.originalname,
      archivoTamanio: archivo.size,
      archivoFormato: archivo.mimetype.split('/').pop() || archivo.originalname.split('.').pop() || '',
      creadoPorId: userId,
      modificadoPorId: userId,
      versionActual: 1,
      etiquetas: createDocumentoDto.etiquetas || []
    });

    // Guardar documento
    const documentoGuardado = await this.documentoRepository.save(nuevoDocumento);

    // Crear primera versión
    await this.versionRepository.save({
      documentoId: documentoGuardado.id,
      numeroVersion: 1,
      archivoUrl: archivoSubido.url,
      archivoNombre: archivo.originalname,
      archivoTamanio: archivo.size,
      archivoFormato: nuevoDocumento.archivoFormato,
      creadoPorId: userId,
      descripcionCambios: 'Versión inicial'
    });

    // Asignar permiso de administrador al creador
    await this.permisoRepository.save({
      documentoId: documentoGuardado.id,
      usuarioId: userId,
      otorgadoPorId: userId,
      tipoPermiso: 'administrador'
    });

    // Registrar en historial
    await this.registrarAccionHistorial(documentoGuardado.id, userId, 'creacion', 'Documento creado', {
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    // Procesar el contenido del documento para búsqueda de texto completo
    this.procesarContenidoDocumento(documentoGuardado.id, archivo);

    return documentoGuardado;
  }

  async update(id: string, updateDocumentoDto: UpdateDocumentoDto, archivo: Express.Multer.File | undefined, userId: string, req: Request) {
    // Verificar existencia del documento
    const documento = await this.documentoRepository.findOne({ where: { id } });
    if (!documento) {
      throw new NotFoundException(`Documento con ID ${id} no encontrado`);
    }

    // Verificar permisos de escritura
    const tienePermisoEscritura = await this.verificarPermisoEscritura(id, userId);
    if (!tienePermisoEscritura) {
      throw new ForbiddenException('No tienes permiso para modificar este documento');
    }

    // Preparar datos para la actualización
    const datosActualizacion: Partial<Documento> = {
      ...updateDocumentoDto,
      modificadoPorId: userId
    };

    // Si hay un nuevo archivo, procesarlo
    if (archivo) {
      // Subir nuevo archivo
      const archivoSubido = await this.storageService.uploadFile(archivo, 'documentos');

      // Aumentar versión
      const nuevaVersion = documento.versionActual + 1;

      // Actualizar información del archivo en el documento
      datosActualizacion.archivoUrl = archivoSubido.url;
      datosActualizacion.archivoNombre = archivo.originalname;
      datosActualizacion.archivoTamanio = archivo.size;
      datosActualizacion.archivoFormato = archivo.mimetype.split('/').pop() || archivo.originalname.split('.').pop() || '';
      datosActualizacion.versionActual = nuevaVersion;
      datosActualizacion.indexadoParaBusqueda = false; // Resetear para re-indexar

      // Crear nueva versión
      await this.versionRepository.save({
        documentoId: id,
        numeroVersion: nuevaVersion,
        archivoUrl: archivoSubido.url,
        archivoNombre: archivo.originalname,
        archivoTamanio: archivo.size,
        archivoFormato: datosActualizacion.archivoFormato,
        creadoPorId: userId,
        descripcionCambios: updateDocumentoDto.descripcionCambios || 'Actualización de documento'
      });

      // Registrar en historial
      await this.registrarAccionHistorial(id, userId, 'nueva_version', `Nueva versión ${nuevaVersion} creada`, {
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        versionAnterior: documento.versionActual,
        nuevaVersion: nuevaVersion
      });

      // Procesar el contenido del documento para búsqueda de texto completo
      this.procesarContenidoDocumento(id, archivo);
    } else {
      // Si no hay nuevo archivo, solo registrar la modificación
      await this.registrarAccionHistorial(id, userId, 'modificacion', 'Documento modificado', {
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        cambios: Object.keys(updateDocumentoDto)
      });
    }

    // Actualizar documento
    await this.documentoRepository.update(id, datosActualizacion);

    // Retornar documento actualizado
    return this.documentoRepository.findOne({
      where: { id },
      relations: ['expediente', 'cliente', 'creadoPor', 'modificadoPor'],
    });
  }

  async remove(id: string, userId: string, req: Request) {
    // Verificar existencia del documento
    const documento = await this.documentoRepository.findOne({ where: { id } });
    if (!documento) {
      throw new NotFoundException(`Documento con ID ${id} no encontrado`);
    }

    // Verificar permisos de administrador
    const tienePermisoAdmin = await this.verificarPermisoAdministrador(id, userId);
    if (!tienePermisoAdmin) {
      throw new ForbiddenException('No tienes permiso para eliminar este documento');
    }

    // Registrar eliminación en historial
    await this.registrarAccionHistorial(id, userId, 'eliminacion', 'Documento eliminado', {
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    // Eliminar documento (en un entorno real, considerar soft delete)
    await this.documentoRepository.delete(id);

    return { id, eliminado: true };
  }

  async downloadFile(id: string, userId: string, req: Request) {
    // Verificar existencia del documento
    const documento = await this.documentoRepository.findOne({ where: { id } });
    if (!documento) {
      throw new NotFoundException(`Documento con ID ${id} no encontrado`);
    }

    // Verificar permisos de lectura
    const tieneAcceso = await this.verificarAccesoDocumento(id, userId);
    if (!tieneAcceso) {
      throw new ForbiddenException('No tienes permiso para descargar este documento');
    }

    // Registrar descarga en historial
    await this.registrarAccionHistorial(id, userId, 'descarga', 'Documento descargado', {
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    // Generar URL firmada para descarga temporal (si aplica en tu sistema de almacenamiento)
    const urlDescarga = await this.storageService.getSignedUrl(documento.archivoUrl, 60 * 5); // 5 minutos

    return {
      url: urlDescarga,
      nombre: documento.archivoNombre,
      tamano: documento.archivoTamanio,
      formato: documento.archivoFormato
    };
  }

  async getVersions(id: string, userId: string) {
    // Verificar existencia del documento
    const documento = await this.documentoRepository.findOne({ where: { id } });
    if (!documento) {
      throw new NotFoundException(`Documento con ID ${id} no encontrado`);
    }

    // Verificar permisos de lectura
    const tieneAcceso = await this.verificarAccesoDocumento(id, userId);
    if (!tieneAcceso) {
      throw new ForbiddenException('No tienes permiso para ver las versiones de este documento');
    }

    // Obtener todas las versiones
    const versiones = await this.versionRepository.find({
      where: { documentoId: id },
      relations: ['creadoPor'],
      order: { numeroVersion: 'DESC' }
    });

    return versiones;
  }

  async getVersionFile(id: string, versionId: string, userId: string, req: Request) {
    // Verificar existencia del documento
    const documento = await this.documentoRepository.findOne({ where: { id } });
    if (!documento) {
      throw new NotFoundException(`Documento con ID ${id} no encontrado`);
    }

    // Verificar existencia de la versión
    const version = await this.versionRepository.findOne({
      where: { id: versionId, documentoId: id }
    });
    if (!version) {
      throw new NotFoundException(`Versión con ID ${versionId} no encontrada`);
    }

    // Verificar permisos de lectura
    const tieneAcceso = await this.verificarAccesoDocumento(id, userId);
    if (!tieneAcceso) {
      throw new ForbiddenException('No tienes permiso para descargar esta versión');
    }

    // Registrar descarga en historial
    await this.registrarAccionHistorial(id, userId, 'descarga', `Versión ${version.numeroVersion} descargada`, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      versionId: versionId
    });

    // Generar URL firmada para descarga temporal
    const urlDescarga = await this.storageService.getSignedUrl(version.archivoUrl, 60 * 5); // 5 minutos

    return {
      url: urlDescarga,
      nombre: version.archivoNombre,
      tamano: version.archivoTamanio,
      formato: version.archivoFormato,
      version: version.numeroVersion
    };
  }

  async getPermissions(id: string, userId: string) {
    // Verificar existencia del documento
    const documento = await this.documentoRepository.findOne({ where: { id } });
    if (!documento) {
      throw new NotFoundException(`Documento con ID ${id} no encontrado`);
    }

    // Verificar permisos de administrador (solo admins pueden ver todos los permisos)
    const tienePermisoAdmin = await this.verificarPermisoAdministrador(id, userId);
    if (!tienePermisoAdmin) {
      throw new ForbiddenException('No tienes permiso para ver los permisos de este documento');
    }

    // Obtener todos los permisos
    const permisos = await this.permisoRepository.find({
      where: { documentoId: id },
      relations: ['usuario', 'otorgadoPor'],
    });

    return permisos;
  }

  async addPermission(id: string, permisoDto: DocumentoPermisoDto, userId: string, req: Request) {
    // Verificar existencia del documento
    const documento = await this.documentoRepository.findOne({ where: { id } });
    if (!documento) {
      throw new NotFoundException(`Documento con ID ${id} no encontrado`);
    }

    // Verificar permisos de administrador
    const tienePermisoAdmin = await this.verificarPermisoAdministrador(id, userId);
    if (!tienePermisoAdmin) {
      throw new ForbiddenException('No tienes permiso para modificar los permisos de este documento');
    }

    // Verificar si ya existe un permiso para este usuario
    const permisoExistente = await this.permisoRepository.findOne({
      where: { documentoId: id, usuarioId: permisoDto.usuarioId }
    });

    let resultado;
    if (permisoExistente) {
      // Actualizar permiso existente
      permisoExistente.tipoPermiso = permisoDto.tipoPermiso;
      permisoExistente.otorgadoPorId = userId;
      resultado = await this.permisoRepository.save(permisoExistente);
    } else {
      // Crear nuevo permiso
      resultado = await this.permisoRepository.save({
        documentoId: id,
        usuarioId: permisoDto.usuarioId,
        tipoPermiso: permisoDto.tipoPermiso,
        otorgadoPorId: userId
      });
    }

    // Registrar cambio en historial
    await this.registrarAccionHistorial(id, userId, 'cambio_permisos', `Permiso ${permisoDto.tipoPermiso} otorgado a usuario ${permisoDto.usuarioId}`, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      usuarioId: permisoDto.usuarioId,
      tipoPermiso: permisoDto.tipoPermiso
    });

    return resultado;
  }

  async removePermission(id: string, usuarioId: string, userId: string, req: Request) {
    // Verificar existencia del documento
    const documento = await this.documentoRepository.findOne({ where: { id } });
    if (!documento) {
      throw new NotFoundException(`Documento con ID ${id} no encontrado`);
    }

    // Verificar permisos de administrador
    const tienePermisoAdmin = await this.verificarPermisoAdministrador(id, userId);
    if (!tienePermisoAdmin) {
      throw new ForbiddenException('No tienes permiso para modificar los permisos de este documento');
    }

    // No permitir eliminar el permiso del creador/propietario
    if (documento.creadoPorId === usuarioId) {
      throw new BadRequestException('No se puede eliminar el permiso del propietario del documento');
    }

    // Verificar si existe el permiso
    const permiso = await this.permisoRepository.findOne({
      where: { documentoId: id, usuarioId }
    });
    if (!permiso) {
      throw new NotFoundException(`No existe permiso para el usuario con ID ${usuarioId}`);
    }

    // Eliminar permiso
    await this.permisoRepository.delete(permiso.id);

    // Registrar cambio en historial
    await this.registrarAccionHistorial(id, userId, 'cambio_permisos', `Permiso eliminado para usuario ${usuarioId}`, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      usuarioId: usuarioId
    });

    return { eliminado: true };
  }

  async getHistory(id: string, userId: string) {
    // Verificar existencia del documento
    const documento = await this.documentoRepository.findOne({ where: { id } });
    if (!documento) {
      throw new NotFoundException(`Documento con ID ${id} no encontrado`);
    }

    // Verificar permisos de lectura
    const tieneAcceso = await this.verificarAccesoDocumento(id, userId);
    if (!tieneAcceso) {
      throw new ForbiddenException('No tienes permiso para ver el historial de este documento');
    }

    // Obtener historial de acciones
    const historial = await this.historialRepository.find({
      where: { documentoId: id },
      relations: ['usuario'],
      order: { fechaAccion: 'DESC' }
    });

    return historial;
  }

  async cambiarEstado(id: string, estado: EstadoDocumento, userId: string, req: Request) {
    // Verificar existencia del documento
    const documento = await this.documentoRepository.findOne({ where: { id } });
    if (!documento) {
      throw new NotFoundException(`Documento con ID ${id} no encontrado`);
    }

    // Verificar permisos de escritura
    const tienePermisoEscritura = await this.verificarPermisoEscritura(id, userId);
    if (!tienePermisoEscritura) {
      throw new ForbiddenException('No tienes permiso para cambiar el estado de este documento');
    }

    // Actualizar estado
    await this.documentoRepository.update(id, {
      estado,
      modificadoPorId: userId
    });

    // Registrar cambio en historial
    await this.registrarAccionHistorial(id, userId, 'cambio_estado', `Estado cambiado a: ${estado}`, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      estadoAnterior: documento.estado,
      nuevoEstado: estado
    });

    // Retornar documento actualizado
    return this.documentoRepository.findOne({
      where: { id },
      relations: ['expediente', 'cliente', 'creadoPor', 'modificadoPor'],
    });
  }

  async toggleDestacado(id: string, destacado: boolean, userId: string) {
    // Verificar existencia del documento
    const documento = await this.documentoRepository.findOne({ where: { id } });
    if (!documento) {
      throw new NotFoundException(`Documento con ID ${id} no encontrado`);
    }

    // Verificar permisos de lectura (solo necesita acceso básico)
    const tieneAcceso = await this.verificarAccesoDocumento(id, userId);
    if (!tieneAcceso) {
      throw new ForbiddenException('No tienes permiso para acceder a este documento');
    }

    // Actualizar estado destacado
    await this.documentoRepository.update(id, { destacado });

    // Retornar documento actualizado
    return this.documentoRepository.findOne({
      where: { id },
      relations: ['expediente', 'cliente', 'creadoPor', 'modificadoPor'],
    });
  }

  // Métodos privados auxiliares

  private async verificarAccesoDocumento(documentoId: string, userId: string): Promise<boolean> {
    // Si el documento es público, cualquiera puede verlo
    const documento = await this.documentoRepository.findOne({ where: { id: documentoId } });
    if (documento?.esPublico) {
      return true;
    }

    // Verificar si el usuario tiene algún permiso en el documento
    const permiso = await this.permisoRepository.findOne({
      where: { documentoId, usuarioId: userId }
    });

    return !!permiso; // true si existe algún permiso, false en caso contrario
  }

  private async verificarPermisoEscritura(documentoId: string, userId: string): Promise<boolean> {
    // Verificar si el usuario tiene permiso de escritura o superior
    const permiso = await this.permisoRepository.findOne({
      where: { documentoId, usuarioId: userId }
    });

    return !!permiso && (permiso.tipoPermiso === 'escritura' || permiso.tipoPermiso === 'administrador');
  }

  private async verificarPermisoAdministrador(documentoId: string, userId: string): Promise<boolean> {
    // Verificar si el usuario tiene permiso de administrador
    const permiso = await this.permisoRepository.findOne({
      where: { documentoId, usuarioId: userId, tipoPermiso: 'administrador' }
    });

    return !!permiso;
  }

  private async registrarAccionHistorial(
    documentoId: string,
    userId: string,
    tipoAccion: 'creacion' | 'modificacion' | 'cambio_estado' | 'nueva_version' | 'descarga' | 'cambio_permisos' | 'eliminacion' | 'restauracion' | 'visualizacion',
    detalles: string,
    metadatos?: Record<string, any>
  ) {
    const historial = this.historialRepository.create({
      documentoId,
      usuarioId: userId,
      tipoAccion,
      detalles,
      metadatos,
      ipCliente: metadatos?.ip,
      userAgent: metadatos?.userAgent
    });

    return this.historialRepository.save(historial);
  }

  private async procesarContenidoDocumento(documentoId: string, archivo: Express.Multer.File) {
    try {
      // Extraer texto del archivo
      const textoExtraido = await this.textExtractorService.extractText(archivo.buffer, archivo.mimetype);

      // Actualizar documento con el texto indexado
      if (textoExtraido) {
        await this.documentoRepository.update(documentoId, {
          indexadoParaBusqueda: true,
          contenidoIndexado: textoExtraido
        });
      }
    } catch (error) {
      console.error(`Error al procesar el contenido del documento ${documentoId}:`, error);
      // No fallamos toda la operación, solo el indexado
    }
  }
}
