import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { User, UserRole } from '../models/User';
import { Cliente } from '../models/Cliente';
import { Expediente, EstadoExpediente } from '../models/Expediente';
import { Tarea } from '../models/Tarea';
import { Documento } from '../models/Documento';
import mongoose from 'mongoose';

// @desc    Obtener clientes para seleccionar en el formulario de expedientes
// @route   GET /api/expediente-data/clientes
// @access  Private
export const getClientes = asyncHandler(async (req: Request, res: Response) => {
  const clientes = await Cliente.find({}, 'nombre apellido razonSocial tipo documento');

  // Formatear los datos para el frontend
  const clientesFormateados = clientes.map(cliente => ({
    id: cliente._id,
    nombre: cliente.razonSocial || `${cliente.nombre} ${cliente.apellido}`,
    documento: cliente.documento,
    tipo: cliente.tipo
  }));

  res.status(200).json(clientesFormateados);
});

// @desc    Obtener abogados para seleccionar en el formulario de expedientes
// @route   GET /api/expediente-data/abogados
// @access  Private
export const getAbogados = asyncHandler(async (req: Request, res: Response) => {
  const abogados = await User.find({ role: UserRole.ABOGADO, activo: true }, 'nombre apellido email');

  // Formatear los datos para el frontend
  const abogadosFormateados = abogados.map(abogado => ({
    id: abogado._id,
    nombre: `${abogado.nombre} ${abogado.apellido}`,
    email: abogado.email
  }));

  res.status(200).json(abogadosFormateados);
});

// @desc    Obtener estadísticas de expedientes
// @route   GET /api/expediente-data/estadisticas
// @access  Private
export const getEstadisticasExpedientes = asyncHandler(async (req: Request, res: Response) => {
  // Obtener estadísticas por estado
  const estadisticasPorEstado = await Expediente.aggregate([
    { $group: { _id: '$estado', total: { $sum: 1 } } },
    { $sort: { total: -1 } }
  ]);

  // Formatear para incluir todos los estados posibles
  const estadosPosibles = Object.values(EstadoExpediente);
  const estadosCounts = estadosPosibles.reduce((acc, estado) => {
    const encontrado = estadisticasPorEstado.find(item => item._id === estado);
    acc[estado] = encontrado ? encontrado.total : 0;
    return acc;
  }, {} as Record<string, number>);

  // Obtener estadísticas por abogado
  const estadisticasPorAbogado = await Expediente.aggregate([
    {
      $group: {
        _id: '$abogadoId',
        total: { $sum: 1 },
        finalizados: {
          $sum: {
            $cond: [
              { $or: [
                { $eq: ['$estado', EstadoExpediente.FINALIZADO] },
                { $eq: ['$estado', EstadoExpediente.ARCHIVADO] }
              ]},
              1,
              0
            ]
          }
        },
        enProceso: {
          $sum: {
            $cond: [
              { $or: [
                { $eq: ['$estado', EstadoExpediente.EN_TRAMITE] },
                { $eq: ['$estado', EstadoExpediente.EN_ESPERA] }
              ]},
              1,
              0
            ]
          }
        }
      }
    },
    { $sort: { total: -1 } },
    { $limit: 10 }
  ]);

  // Obtener información de los abogados para los resultados
  const abogadosIds = estadisticasPorAbogado.map(item =>
    new mongoose.Types.ObjectId(item._id)
  );

  const abogados = await User.find(
    { _id: { $in: abogadosIds } },
    'nombre apellido'
  );

  // Mapear para incluir nombres de abogados
  const estadisticasAbogados = estadisticasPorAbogado.map(item => {
    const abogado = abogados.find(a => a._id.toString() === item._id.toString());
    return {
      abogadoId: item._id,
      nombreAbogado: abogado ? `${abogado.nombre} ${abogado.apellido}` : 'Desconocido',
      total: item.total,
      finalizados: item.finalizados,
      enProceso: item.enProceso
    };
  });

  // Obtener totales generales
  const totalExpedientes = await Expediente.countDocuments();
  const expedientesFinalizados = await Expediente.countDocuments({
    estado: { $in: [EstadoExpediente.FINALIZADO, EstadoExpediente.ARCHIVADO] }
  });
  const expedientesActivos = await Expediente.countDocuments({
    estado: { $in: [EstadoExpediente.NUEVO, EstadoExpediente.EN_TRAMITE, EstadoExpediente.EN_ESPERA] }
  });

  // Estadísticas de documentos y tareas
  const totalDocumentos = await Documento.countDocuments();
  const totalTareas = await Tarea.countDocuments();
  const tareasPendientes = await Tarea.countDocuments({ estado: 'pendiente' });

  res.status(200).json({
    totalExpedientes,
    expedientesFinalizados,
    expedientesActivos,
    totalDocumentos,
    totalTareas,
    tareasPendientes,
    porEstado: estadosCounts,
    porAbogado: estadisticasAbogados
  });
});
