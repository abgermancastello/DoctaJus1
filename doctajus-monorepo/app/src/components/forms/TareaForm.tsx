import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTareaStore } from '../../stores/tareaStore';
import { useExpedienteStore } from '../../stores/expedienteStore';
import { useUsuarioStore } from '../../stores/usuarioStore';
import { notification } from 'antd';
import { Tarea, EstadoTarea, PrioridadTarea } from '../../types';

interface TareaFormProps {
  tareaId?: string;
  expedientePreseleccionado?: string;
  onSuccess?: () => void;
  isModal?: boolean;
}

const TareaForm: React.FC<TareaFormProps> = ({
  tareaId,
  expedientePreseleccionado,
  onSuccess,
  isModal = false
}) => {
  const navigate = useNavigate();
  const { createTarea, updateTarea, getTarea } = useTareaStore();
  const { expedientes, fetchExpedientes } = useExpedienteStore();
  const { usuarios, fetchUsuarios } = useUsuarioStore();

  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    fechaVencimiento: new Date().toISOString().split('T')[0],
    estado: EstadoTarea.PENDIENTE,
    prioridad: PrioridadTarea.MEDIA,
    responsableId: '',
    expedienteId: expedientePreseleccionado || '',
    creadorId: '201' // Usuario actual hardcodeado por ahora
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Cargar expedientes y usuarios
    const loadData = async () => {
      try {
        await Promise.all([fetchExpedientes(), fetchUsuarios()]);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        notification.error({
          message: 'Error',
          description: 'No se pudieron cargar los datos necesarios. Por favor, intente de nuevo.'
        });
      }
    };

    loadData();

    // Si hay un ID, cargar la tarea
    if (tareaId) {
      const loadTarea = async () => {
        try {
          console.log('Cargando tarea para edición, ID:', tareaId);
          const tarea = await getTarea(tareaId);
          if (tarea) {
            console.log('Tarea cargada exitosamente:', tarea);
            setFormData({
              titulo: tarea.titulo,
              descripcion: tarea.descripcion || '',
              fechaVencimiento: new Date(tarea.fechaVencimiento).toISOString().split('T')[0],
              estado: tarea.estado,
              prioridad: tarea.prioridad,
              responsableId: tarea.responsableId,
              expedienteId: tarea.expedienteId || '',
              creadorId: tarea.creadorId
            });
            console.log('Formulario actualizado con datos de la tarea');
          } else {
            console.error('La tarea solicitada no existe o no se pudo obtener');
          }
        } catch (error) {
          console.error('Error al cargar tarea:', error);
          notification.error({
            message: 'Error',
            description: 'No se pudo cargar la tarea seleccionada.'
          });
        }
      };
      loadTarea();
    }
  }, [tareaId, getTarea, fetchExpedientes, fetchUsuarios, expedientePreseleccionado]);

  // Actualizar el expediente preseleccionado si cambia
  useEffect(() => {
    if (expedientePreseleccionado && !tareaId) {
      setFormData(prev => ({
        ...prev,
        expedienteId: expedientePreseleccionado
      }));
    }
  }, [expedientePreseleccionado, tareaId]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.titulo) newErrors.titulo = 'El título de la tarea es requerido';
    if (!formData.fechaVencimiento) newErrors.fechaVencimiento = 'La fecha de vencimiento es requerida';
    if (!formData.responsableId) newErrors.responsableId = 'El responsable es requerido';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Enviando formulario, modo:', tareaId ? 'actualización' : 'creación');

    if (!validateForm()) {
      console.log('Validación fallida, errores:', errors);
      return;
    }

    setLoading(true);
    try {
      const tareaData: Omit<Tarea, 'id' | 'fechaCreacion'> = {
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        fechaVencimiento: new Date(formData.fechaVencimiento).toISOString(),
        estado: formData.estado,
        prioridad: formData.prioridad,
        responsableId: formData.responsableId,
        creadorId: formData.creadorId,
        expedienteId: formData.expedienteId || undefined
      };

      console.log('Datos del formulario procesados:', tareaData);

      if (tareaId) {
        console.log('Actualizando tarea existente, ID:', tareaId);
        await updateTarea(tareaId, tareaData);
        console.log('Tarea actualizada correctamente');
        notification.success({
          message: 'Tarea actualizada',
          description: 'La tarea ha sido actualizada correctamente'
        });
      } else {
        console.log('Creando nueva tarea');
        const nuevaTarea = await createTarea({
          ...tareaData,
          fechaCreacion: new Date().toISOString()
        });
        console.log('Tarea creada correctamente, ID:', nuevaTarea?.id);
        notification.success({
          message: 'Tarea creada',
          description: 'La tarea ha sido creada correctamente'
        });
      }

      // Si se proporciona onSuccess, llamar a esa función en lugar de navegar
      if (onSuccess) {
        console.log('Llamando a callback onSuccess');
        onSuccess();
      } else {
        console.log('Redirigiendo a la lista de tareas');
        navigate('/tareas');
      }
    } catch (error: any) {
      console.error('Error al guardar la tarea:', error);
      notification.error({
        message: 'Error',
        description: error.message || 'Ha ocurrido un error al guardar la tarea'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${isModal ? 'modal-form' : ''}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Título *
          </label>
          <input
            type="text"
            name="titulo"
            value={formData.titulo}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
              errors.titulo ? 'border-red-500' : ''
            }`}
          />
          {errors.titulo && (
            <p className="mt-1 text-sm text-red-600">{errors.titulo}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Descripción
          </label>
          <textarea
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Fecha de Vencimiento *
          </label>
          <input
            type="date"
            name="fechaVencimiento"
            value={formData.fechaVencimiento}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
              errors.fechaVencimiento ? 'border-red-500' : ''
            }`}
          />
          {errors.fechaVencimiento && (
            <p className="mt-1 text-sm text-red-600">{errors.fechaVencimiento}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Prioridad
          </label>
          <select
            name="prioridad"
            value={formData.prioridad}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value={PrioridadTarea.ALTA}>Alta</option>
            <option value={PrioridadTarea.MEDIA}>Media</option>
            <option value={PrioridadTarea.BAJA}>Baja</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Estado
          </label>
          <select
            name="estado"
            value={formData.estado}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value={EstadoTarea.PENDIENTE}>Pendiente</option>
            <option value={EstadoTarea.EN_PROGRESO}>En progreso</option>
            <option value={EstadoTarea.COMPLETADA}>Completada</option>
            <option value={EstadoTarea.CANCELADA}>Cancelada</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Responsable *
          </label>
          <select
            name="responsableId"
            value={formData.responsableId}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
              errors.responsableId ? 'border-red-500' : ''
            }`}
          >
            <option value="">Seleccione un responsable</option>
            {usuarios.map(usuario => (
              <option key={usuario.id} value={usuario.id}>
                {`${usuario.nombre} ${usuario.apellido}`}
              </option>
            ))}
          </select>
          {errors.responsableId && (
            <p className="mt-1 text-sm text-red-600">{errors.responsableId}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Expediente relacionado
          </label>
          <select
            name="expedienteId"
            value={formData.expedienteId}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            disabled={!!expedientePreseleccionado}
          >
            <option value="">Ninguno</option>
            {expedientes.map(expediente => (
              <option key={expediente.id} value={expediente.id}>
                {expediente.numero}: {expediente.titulo}
              </option>
            ))}
          </select>
          {expedientePreseleccionado && (
            <p className="mt-1 text-xs text-gray-500">El expediente ha sido preseleccionado</p>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => {
            if (isModal && onSuccess) {
              onSuccess();
            } else {
              navigate('/tareas');
            }
          }}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Guardando...' : tareaId ? 'Actualizar' : 'Crear'}
        </button>
      </div>
    </form>
  );
};

export default TareaForm;
