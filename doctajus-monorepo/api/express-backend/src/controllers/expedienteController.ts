import { Request, Response } from 'express';
import { Expediente, EstadoExpediente, TipoExpediente } from '../models/Expediente';
import { Tarea } from '../models/Tarea';
import { Documento } from '../models/Documento';
import { asyncHandler } from '../middleware/asyncHandler';
import mongoose from 'mongoose';
import { buscarExpedientes, obtenerResumenExpediente, validarEliminacionExpediente } from '../utils/expedienteUtils';

// @desc    Obtener todos los expedientes
// @route   GET /api/expedientes
// @access  Private
export const getExpedientes = asyncHandler(async (req: Request, res: Response) => {
  const {
    search,
    estado,
    tipo,
    clienteId,
    abogadoId,
    destacados,
    etiquetas,
    fechaDesde,
    fechaHasta,
    limit = 100,
    page = 1
  } = req.query;

  // Construir condiciones de búsqueda
  const query: any = {};

  // Filtros básicos
  if (estado && Object.values(EstadoExpediente).includes(estado as EstadoExpediente)) {
    query.estado = estado;
  }

  if (tipo && Object.values(TipoExpediente).includes(tipo as TipoExpediente)) {
    query.tipo = tipo;
  }

  if (clienteId) {
    query.clienteId = clienteId;
  }

  if (abogadoId) {
    query.abogadoId = abogadoId;
  }

  if (destacados === 'true') {
    query.destacado = true;
  }

  // Filtro por etiquetas
  if (etiquetas) {
    const etiquetasArray = Array.isArray(etiquetas)
      ? etiquetas
      : (etiquetas as string).split(',');
    query.etiquetas = { $in: etiquetasArray };
  }

  // Filtro por fecha de creación
  if (fechaDesde || fechaHasta) {
    query.fechaCreacion = {};
    if (fechaDesde) query.fechaCreacion.$gte = new Date(fechaDesde as string);
    if (fechaHasta) query.fechaCreacion.$lte = new Date(fechaHasta as string);
  }

  // Búsqueda por texto
  if (search) {
    query.$text = { $search: search as string };
  }

  // Configurar paginación
  const options = {
    limit: parseInt(limit as string, 10) || 100,
    page: parseInt(page as string, 10) || 1,
    sort: { fechaActualizacion: -1 },
    populate: [
      { path: 'clienteId', select: 'nombre apellido razonSocial tipo documento' },
      { path: 'abogadoId', select: 'nombre apellido email' }
    ]
  };

  try {
    // Obtener los expedientes
    const expedientes = await Expediente.find(query)
      .populate('clienteId', 'nombre apellido razonSocial tipo documento')
      .populate('abogadoId', 'nombre apellido email')
      .sort({ fechaActualizacion: -1 })
      .limit(options.limit)
      .skip((options.page - 1) * options.limit);

    // Obtener el total para la paginación
    const total = await Expediente.countDocuments(query);

    // Cargar contador de tareas y documentos
    const expedientesIds = expedientes.map(exp => exp._id as unknown as mongoose.Types.ObjectId);

    // Obtener contadores de tareas
    const tareasPorExpediente = await Tarea.aggregate([
      { $match: { expedienteId: { $in: expedientesIds } } },
      { $group: { _id: '$expedienteId', count: { $sum: 1 } } }
    ]);

    // Obtener contadores de documentos
    const documentosPorExpediente = await Documento.aggregate([
      { $match: { expedienteId: { $in: expedientesIds } } },
      { $group: { _id: '$expedienteId', count: { $sum: 1 } } }
    ]);

    // Crear mapas para búsqueda rápida
    const tareasMap = new Map(tareasPorExpediente.map(item => [item._id.toString(), item.count]));
    const documentosMap = new Map(documentosPorExpediente.map(item => [item._id.toString(), item.count]));

    // Añadir contadores a los expedientes
    const expedientesConContadores = expedientes.map(exp => {
      const expObj = exp.toObject();
      const expedienteId = (exp._id as unknown as mongoose.Types.ObjectId).toString();
      expObj.tareasCount = tareasMap.get(expedienteId) || 0;
      expObj.documentosCount = documentosMap.get(expedienteId) || 0;
      return expObj;
    });

    res.status(200).json({
      success: true,
      count: expedientesConContadores.length,
      total,
      totalPages: Math.ceil(total / options.limit),
      page: options.page,
      data: expedientesConContadores
    });
  } catch (error) {
    console.error('Error al obtener expedientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener expedientes'
    });
  }
});

// @desc    Buscar expedientes por término de búsqueda
// @route   GET /api/expedientes/buscar
// @access  Private
export const buscarExpedientesPorTermino = asyncHandler(async (req: Request, res: Response) => {
  const { termino, limit = 10 } = req.query;

  if (!termino || typeof termino !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Se requiere un término de búsqueda'
    });
  }

  const expedientesEncontrados = await buscarExpedientes(termino, parseInt(limit as string, 10) || 10);

  res.status(200).json({
    success: true,
    count: expedientesEncontrados.length,
    data: expedientesEncontrados
  });
});

// @desc    Obtener un expediente por ID
// @route   GET /api/expedientes/:id
// @access  Private
export const getExpedienteById = asyncHandler(async (req: Request, res: Response) => {
  try {
    const expedienteId = req.params.id;
    const expedienteData = await obtenerResumenExpediente(expedienteId);

    if (!expedienteData) {
      return res.status(404).json({
        success: false,
        message: 'Expediente no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: expedienteData
    });
  } catch (error) {
    console.error('Error al obtener expediente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener expediente'
    });
  }
});

// @desc    Crear un nuevo expediente
// @route   POST /api/expedientes
// @access  Private
export const createExpediente = asyncHandler(async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Verificar si el número de expediente ya existe
    const numeroExists = await Expediente.findOne({ numero: req.body.numero });
    if (numeroExists) {
      return res.status(400).json({
        success: false,
        message: 'El número de expediente ya está registrado'
      });
    }

    // Convertir etiquetas si vienen como string
    if (req.body.etiquetas && typeof req.body.etiquetas === 'string') {
      req.body.etiquetas = req.body.etiquetas.split(',').map((tag: string) => tag.trim());
    }

    // Crear el nuevo expediente
    const expediente = await Expediente.create([req.body], { session });

    // Si el cliente proporcionó una tarea inicial, crearla
    if (req.body.tareainicial && req.body.tareainicial.titulo) {
      await Tarea.create([{
        titulo: req.body.tareainicial.titulo,
        descripcion: req.body.tareainicial.descripcion || `Tarea inicial para el expediente ${req.body.numero}`,
        fechaVencimiento: req.body.tareainicial.fechaVencimiento || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días por defecto
        prioridad: req.body.tareainicial.prioridad || 'media',
        estado: 'pendiente',
        expedienteId: expediente[0]._id,
        responsableId: req.body.abogadoId, // Asignar al abogado del expediente
        creadorId: (req as any).user.id // Usuario actual
      }], { session });
    }

    await session.commitTransaction();
    session.endSession();

    // Populate para devolver los datos completos
    const populatedExpediente = await Expediente.findById(expediente[0]._id)
      .populate('clienteId', 'nombre apellido razonSocial tipo documento')
      .populate('abogadoId', 'nombre apellido email');

    res.status(201).json({
      success: true,
      data: populatedExpediente
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error('Error al crear expediente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear expediente'
    });
  }
});

// @desc    Actualizar un expediente
// @route   PUT /api/expedientes/:id
// @access  Private
export const updateExpediente = asyncHandler(async (req: Request, res: Response) => {
  try {
    // Si intentan cambiar el número, verificar que no exista
    if (req.body.numero) {
      const expedienteActual = await Expediente.findById(req.params.id);
      if (expedienteActual && expedienteActual.numero !== req.body.numero) {
        const numeroExists = await Expediente.findOne({ numero: req.body.numero });
        if (numeroExists) {
          return res.status(400).json({
            success: false,
            message: 'El número de expediente ya está registrado'
          });
        }
      }
    }

    // Convertir etiquetas si vienen como string
    if (req.body.etiquetas && typeof req.body.etiquetas === 'string') {
      req.body.etiquetas = req.body.etiquetas.split(',').map((tag: string) => tag.trim());
    }

    const expediente = await Expediente.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    )
    .populate('clienteId', 'nombre apellido razonSocial tipo documento')
    .populate('abogadoId', 'nombre apellido email');

    if (!expediente) {
      return res.status(404).json({
        success: false,
        message: 'Expediente no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: expediente
    });
  } catch (error) {
    console.error('Error al actualizar expediente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar expediente'
    });
  }
});

// @desc    Eliminar un expediente
// @route   DELETE /api/expedientes/:id
// @access  Private
export const deleteExpediente = asyncHandler(async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Validar si se puede eliminar
    const validacion = await validarEliminacionExpediente(req.params.id);

    if (!validacion.puedeEliminar) {
      return res.status(400).json({
        success: false,
        message: `No se puede eliminar el expediente porque tiene ${validacion.elementosRelacionados?.tareas || 0} tareas y ${validacion.elementosRelacionados?.documentos || 0} documentos asociados`
      });
    }

    // Eliminar el expediente
    const expediente = await Expediente.findByIdAndDelete(req.params.id);

    if (!expediente) {
      return res.status(404).json({
        success: false,
        message: 'Expediente no encontrado'
      });
    }

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: 'Expediente eliminado correctamente'
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error('Error al eliminar expediente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar expediente'
    });
  }
});

// @desc    Cambiar estado de un expediente
// @route   PATCH /api/expedientes/:id/estado
// @access  Private
export const cambiarEstadoExpediente = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { estado } = req.body;

    // Validar que el estado sea válido
    if (!estado || !Object.values(EstadoExpediente).includes(estado as EstadoExpediente)) {
      return res.status(400).json({
        success: false,
        message: 'Estado no válido'
      });
    }

    const expediente = await Expediente.findByIdAndUpdate(
      req.params.id,
      {
        estado,
        fechaFin: estado === EstadoExpediente.FINALIZADO || estado === EstadoExpediente.ARCHIVADO
          ? new Date()
          : undefined
      },
      { new: true }
    );

    if (!expediente) {
      return res.status(404).json({
        success: false,
        message: 'Expediente no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: expediente
    });
  } catch (error) {
    console.error('Error al cambiar estado del expediente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar estado del expediente'
    });
  }
});

// @desc    Destacar/Quitar destacado de un expediente
// @route   PATCH /api/expedientes/:id/destacar
// @access  Private
export const toggleDestacadoExpediente = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { destacado } = req.body;

    if (typeof destacado !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'El valor de destacado debe ser un booleano'
      });
    }

    const expediente = await Expediente.findByIdAndUpdate(
      req.params.id,
      { destacado },
      { new: true }
    );

    if (!expediente) {
      return res.status(404).json({
        success: false,
        message: 'Expediente no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: expediente
    });
  } catch (error) {
    console.error('Error al modificar estado destacado:', error);
    res.status(500).json({
      success: false,
      message: 'Error al modificar estado destacado'
    });
  }
});
