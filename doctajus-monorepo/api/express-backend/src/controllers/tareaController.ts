import { Request, Response } from 'express';
import { Tarea, EstadoTarea, PrioridadTarea } from '../models/Tarea';
import { UserRole } from '../models/User';

// Obtener todas las tareas con filtros
export const getTareas = async (req: Request, res: Response) => {
  try {
    const {
      search,
      estado,
      prioridad,
      expedienteId,
      responsableId,
      vencimientoDesde,
      vencimientoHasta,
      soloVencidas
    } = req.query;

    let query: any = {};

    // Filtros por parámetros
    if (estado && Object.values(EstadoTarea).includes(estado as EstadoTarea)) {
      query.estado = estado;
    }

    if (prioridad && Object.values(PrioridadTarea).includes(prioridad as PrioridadTarea)) {
      query.prioridad = prioridad;
    }

    if (expedienteId) {
      query.expedienteId = expedienteId;
    }

    if (responsableId) {
      query.responsableId = responsableId;
    } else if (req.query.misAsignadas && req.user) {
      // Filtrar por tareas asignadas al usuario actual
      query.responsableId = req.user.id;
    }

    if (req.query.misPendientes && req.user) {
      // Filtrar por tareas pendientes asignadas al usuario actual
      query.responsableId = req.user.id;
      query.estado = EstadoTarea.PENDIENTE;
    }

    // Filtros de fecha
    if (vencimientoDesde || vencimientoHasta || soloVencidas) {
      query.fechaVencimiento = {};

      if (vencimientoDesde) {
        query.fechaVencimiento.$gte = new Date(vencimientoDesde as string);
      }

      if (vencimientoHasta) {
        query.fechaVencimiento.$lte = new Date(vencimientoHasta as string);
      }

      if (soloVencidas === 'true') {
        query.fechaVencimiento.$lt = new Date();
        query.estado = EstadoTarea.PENDIENTE;
      }
    }

    // Búsqueda por texto
    if (search) {
      const searchRegex = new RegExp(search as string, 'i');
      query = {
        ...query,
        $or: [
          { titulo: searchRegex },
          { descripcion: searchRegex }
        ]
      };
    }

    // Ejecutar la consulta
    const tareas = await Tarea.find(query)
      .populate('expedienteId', 'numero titulo')
      .populate('responsableId', 'nombre apellido')
      .populate('creadorId', 'nombre apellido')
      .sort({ fechaVencimiento: 1 });

    res.status(200).json({
      success: true,
      count: tareas.length,
      data: tareas
    });
  } catch (error) {
    console.error('Error al obtener tareas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener tareas'
    });
  }
};

// Obtener una tarea por ID
export const getTareaById = async (req: Request, res: Response) => {
  try {
    const tarea = await Tarea.findById(req.params.id)
      .populate('expedienteId', 'numero titulo clienteId')
      .populate('responsableId', 'nombre apellido email')
      .populate('creadorId', 'nombre apellido email');

    if (!tarea) {
      return res.status(404).json({
        success: false,
        message: 'Tarea no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      data: tarea
    });
  } catch (error) {
    console.error('Error al obtener tarea:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener tarea'
    });
  }
};

// Crear una nueva tarea
export const createTarea = async (req: Request, res: Response) => {
  try {
    // Asignar el usuario actual como creador si no se especifica
    if (!req.body.creadorId && req.user) {
      req.body.creadorId = req.user.id;
    }

    // Crear la nueva tarea
    const tarea = await Tarea.create(req.body);

    // Populate para devolver los datos completos
    const populatedTarea = await Tarea.findById(tarea._id)
      .populate('expedienteId', 'numero titulo')
      .populate('responsableId', 'nombre apellido')
      .populate('creadorId', 'nombre apellido');

    res.status(201).json({
      success: true,
      data: populatedTarea
    });
  } catch (error) {
    console.error('Error al crear tarea:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear tarea'
    });
  }
};

// Actualizar una tarea
export const updateTarea = async (req: Request, res: Response) => {
  try {
    // Si se actualiza el estado a completado, agregar la fecha de completado
    if (req.body.estado === EstadoTarea.COMPLETADA) {
      req.body.fechaCompletada = new Date();
    } else if (req.body.estado && req.body.estado !== EstadoTarea.COMPLETADA) {
      req.body.fechaCompletada = undefined;
    }

    const tarea = await Tarea.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    )
    .populate('expedienteId', 'numero titulo')
    .populate('responsableId', 'nombre apellido')
    .populate('creadorId', 'nombre apellido');

    if (!tarea) {
      return res.status(404).json({
        success: false,
        message: 'Tarea no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      data: tarea
    });
  } catch (error) {
    console.error('Error al actualizar tarea:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar tarea'
    });
  }
};

// Eliminar una tarea
export const deleteTarea = async (req: Request, res: Response) => {
  try {
    const tarea = await Tarea.findByIdAndDelete(req.params.id);

    if (!tarea) {
      return res.status(404).json({
        success: false,
        message: 'Tarea no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Tarea eliminada correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar tarea:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar tarea'
    });
  }
};
