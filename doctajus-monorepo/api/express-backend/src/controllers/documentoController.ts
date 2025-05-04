import { Request, Response } from 'express';
import { Documento } from '../models/Documento';
import { DocumentoVersion } from '../models/DocumentoVersion';
import { DocumentoPermiso, TipoPermiso } from '../models/DocumentoPermiso';
import { DocumentoHistorial, TipoAccion } from '../models/DocumentoHistorial';
import { asyncHandler } from '../middleware/asyncHandler';
import { ErrorResponse } from '../utils/errorResponse';
import { uploadFileService } from '../services/uploadFileService';
import { textExtractorService } from '../services/textExtractorService';
import mongoose from 'mongoose';
import { Expediente } from '../models/Expediente';
import { Cliente } from '../models/Cliente';

// Extender el tipo Request para incluir el campo file de Multer
interface RequestWithFile extends Request {
  file?: Express.Multer.File;
}

// @desc    Obtener todos los documentos
// @route   GET /api/documentos
// @access  Private
export const getDocumentos = asyncHandler(async (req: Request, res: Response) => {
  const {
    busqueda,
    tipo,
    estado,
    expedienteId,
    clienteId,
    fechaDesde,
    fechaHasta,
    etiquetas,
    destacados
  } = req.query;

  // Construir condiciones de búsqueda
  const query: any = {};

  // Filtros básicos
  if (tipo) query.tipo = tipo;
  if (estado) query.estado = estado;
  if (expedienteId) query.expedienteId = expedienteId;
  if (clienteId) query.clienteId = clienteId;
  if (destacados === 'true') query.destacado = true;

  // Filtro por fecha
  if (fechaDesde || fechaHasta) {
    query.fechaCreacion = {};
    if (fechaDesde) query.fechaCreacion.$gte = new Date(fechaDesde as string);
    if (fechaHasta) query.fechaCreacion.$lte = new Date(fechaHasta as string);
  }

  // Filtro por etiquetas
  if (etiquetas) {
    const etiquetasArray = Array.isArray(etiquetas)
      ? etiquetas
      : (etiquetas as string).split(',');
    query.etiquetas = { $in: etiquetasArray };
  }

  // Filtro por texto (búsqueda en nombre, descripción y contenido indexado)
  if (busqueda) {
    query.$text = { $search: busqueda as string };
  }

  // Ejecutar consulta
  const documentos = await Documento.find(query)
    .sort({ fechaModificacion: -1 })
    .populate('clienteId', 'nombre')
    .populate('expedienteId', 'numero titulo')
    .populate('creadoPorId', 'nombre email');

  // Verificar permisos si el usuario no es admin
  const userId = (req as any).user.id;
  const isAdmin = (req as any).user.rol === 'admin';

  let documentosAccesibles = documentos;

  if (!isAdmin) {
    // Obtener documentos públicos o con permiso específico para el usuario
    const documentosIds = documentos.map(doc => doc._id);

    // Buscar permisos del usuario actual
    const permisos = await DocumentoPermiso.find({
      documentoId: { $in: documentosIds },
      usuarioId: userId
    });

    const idsConPermiso = new Set(permisos.map(p => p.documentoId.toString()));

    // Filtrar documentos accesibles (públicos o con permiso)
    documentosAccesibles = documentos.filter(doc =>
      doc.esPublico || idsConPermiso.has((doc._id as unknown as mongoose.Types.ObjectId).toString())
    );
  }

  res.status(200).json(documentosAccesibles);
});

// @desc    Obtener un documento por ID
// @route   GET /api/documentos/:id
// @access  Private
export const getDocumentoById = asyncHandler(async (req: Request, res: Response) => {
  const documento = await Documento.findById(req.params.id)
    .populate('clienteId', 'nombre')
    .populate('expedienteId', 'numero titulo')
    .populate('creadoPorId', 'nombre email')
    .populate('modificadoPorId', 'nombre email');

  if (!documento) {
    return res.status(404).json({ success: false, error: 'Documento no encontrado' });
  }

  // Verificar permisos
  const userId = (req as any).user.id;
  const isAdmin = (req as any).user.rol === 'admin';

  if (!isAdmin && !documento.esPublico) {
    const permiso = await DocumentoPermiso.findOne({
      documentoId: documento._id,
      usuarioId: userId
    });

    if (!permiso) {
      return res.status(403).json({
        success: false,
        error: 'No tienes permiso para acceder a este documento'
      });
    }
  }

  // Registrar visualización en historial
  await DocumentoHistorial.create({
    documentoId: documento._id,
    usuarioId: userId,
    tipoAccion: TipoAccion.VISUALIZACION,
    detalles: 'Documento visualizado',
    ipCliente: req.ip,
    userAgent: req.headers['user-agent']
  });

  res.status(200).json(documento);
});

// @desc    Crear un nuevo documento
// @route   POST /api/documentos
// @access  Private
export const createDocumento = asyncHandler(async (req: RequestWithFile, res: Response) => {
  // Verificar que se haya subido un archivo
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'Debes subir un archivo' });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = (req as any).user.id;

    // Validar referencias si se proporcionan
    if (req.body.expedienteId) {
      const expediente = await Expediente.findById(req.body.expedienteId);
      if (!expediente) {
        return res.status(400).json({
          success: false,
          error: 'El expediente especificado no existe'
        });
      }

      // Si el expediente tiene un cliente, asociarlo automáticamente al documento
      if (!req.body.clienteId && expediente.clienteId) {
        req.body.clienteId = expediente.clienteId;
      }
    }

    if (req.body.clienteId) {
      const cliente = await Cliente.findById(req.body.clienteId);
      if (!cliente) {
        return res.status(400).json({
          success: false,
          error: 'El cliente especificado no existe'
        });
      }
    }

    // Subir archivo al almacenamiento
    const archivo = req.file;
    const archivoSubido = await uploadFileService.uploadFile(archivo, 'documentos');

    // Crear documento
    const documentoData = {
      ...req.body,
      archivoUrl: archivoSubido.url,
      archivoNombre: archivo.originalname,
      archivoTamanio: archivo.size,
      archivoFormato: archivo.mimetype.split('/').pop() || archivo.originalname.split('.').pop() || '',
      creadoPorId: userId,
      modificadoPorId: userId,
      versionActual: 1,
      etiquetas: req.body.etiquetas ? req.body.etiquetas.split(',').map((tag: string) => tag.trim()) : []
    };

    const documento = await Documento.create([documentoData], { session });

    // Crear primera versión
    await DocumentoVersion.create([{
      documentoId: documento[0]._id,
      numeroVersion: 1,
      archivoUrl: archivoSubido.url,
      archivoNombre: archivo.originalname,
      archivoTamanio: archivo.size,
      archivoFormato: documentoData.archivoFormato,
      creadoPorId: userId,
      descripcionCambios: 'Versión inicial'
    }], { session });

    // Asignar permiso de administrador al creador
    await DocumentoPermiso.create([{
      documentoId: documento[0]._id,
      usuarioId: userId,
      otorgadoPorId: userId,
      tipoPermiso: TipoPermiso.ADMINISTRADOR
    }], { session });

    // Si el documento está asociado a un expediente, dar permisos al abogado responsable
    if (req.body.expedienteId) {
      const expediente = await Expediente.findById(req.body.expedienteId);
      if (expediente && expediente.abogadoId.toString() !== userId) {
        await DocumentoPermiso.create([{
          documentoId: documento[0]._id,
          usuarioId: expediente.abogadoId,
          otorgadoPorId: userId,
          tipoPermiso: TipoPermiso.ESCRITURA
        }], { session });
      }
    }

    // Registrar en historial
    await DocumentoHistorial.create([{
      documentoId: documento[0]._id,
      usuarioId: userId,
      tipoAccion: TipoAccion.CREACION,
      detalles: 'Documento creado',
      ipCliente: req.ip,
      userAgent: req.headers['user-agent']
    }], { session });

    // Procesar contenido del documento para búsqueda de texto
    textExtractorService.extractText(archivo.buffer, archivo.mimetype)
      .then(async (texto) => {
        if (texto) {
          await Documento.findByIdAndUpdate(documento[0]._id, {
            indexadoParaBusqueda: true,
            contenidoIndexado: texto
          });
        }
      })
      .catch(err => console.error('Error al extraer texto del documento:', err));

    await session.commitTransaction();
    session.endSession();

    // Obtener documento con referencias pobladas
    const documentoFinal = await Documento.findById(documento[0]._id)
      .populate('clienteId', 'nombre apellido razonSocial')
      .populate('expedienteId', 'numero titulo')
      .populate('creadoPorId', 'nombre apellido');

    res.status(201).json({
      success: true,
      data: documentoFinal
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
});

// Implementaremos más adelante:
// - updateDocumento
// - deleteDocumento
// - downloadDocumento
// - getVersiones
// - getPermisos
// - addPermiso
// - removePermiso
// - getHistorial
// - cambiarEstado
// - toggleDestacado
