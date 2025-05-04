import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExpedienteStore } from '../../stores/expedienteStore';
import { useClienteStore } from '../../stores/clienteStore';
import { useUsuarioStore } from '../../stores/usuarioStore';
import { notification } from 'antd';
import { Expediente, EstadoExpediente } from '../../types';

interface ExpedienteFormProps {
  expedienteId?: string;
  onSuccess?: () => void;
  isModal?: boolean;
}

const ExpedienteForm: React.FC<ExpedienteFormProps> = ({
  expedienteId,
  onSuccess,
  isModal = false
}) => {
  const navigate = useNavigate();
  const { createExpediente, updateExpediente, getExpediente } = useExpedienteStore();
  const { clientes, fetchClientes } = useClienteStore();
  const { usuarios, fetchUsuarios } = useUsuarioStore();

  const [formData, setFormData] = useState({
    numero: '',
    titulo: '',
    descripcion: '',
    clienteId: '',
    abogadoId: '',
    estado: EstadoExpediente.ABIERTO,
    fechaInicio: new Date().toISOString().split('T')[0],
    fechaFin: '',
    observaciones: '',
    fechaActualizacion: new Date().toISOString()
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Cargar clientes y abogados
    const loadData = async () => {
      try {
        await Promise.all([fetchClientes(), fetchUsuarios()]);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        notification.error({
          message: 'Error',
          description: 'No se pudieron cargar los datos necesarios. Por favor, intente de nuevo.'
        });
      }
    };

    loadData();

    // Si hay un ID, cargar el expediente
    if (expedienteId) {
      const loadExpediente = async () => {
        try {
          const expediente = await getExpediente(expedienteId);
          if (expediente) {
            setFormData({
              numero: expediente.numero,
              titulo: expediente.titulo,
              descripcion: expediente.descripcion,
              clienteId: expediente.clienteId,
              abogadoId: expediente.abogadoId,
              estado: expediente.estado,
              fechaInicio: expediente.fechaInicio.toISOString().split('T')[0],
              fechaFin: expediente.fechaFin?.toISOString().split('T')[0] || '',
              observaciones: expediente.observaciones || '',
              fechaActualizacion: expediente.fechaActualizacion.toISOString()
            });
          }
        } catch (error) {
          console.error('Error al cargar expediente:', error);
          notification.error({
            message: 'Error',
            description: 'No se pudo cargar el expediente seleccionado.'
          });
        }
      };
      loadExpediente();
    }
  }, [expedienteId, getExpediente, fetchClientes, fetchUsuarios]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.numero) newErrors.numero = 'El número de expediente es requerido';
    if (!formData.titulo) newErrors.titulo = 'El título es requerido';
    if (!formData.descripcion) newErrors.descripcion = 'La descripción es requerida';
    if (!formData.clienteId) newErrors.clienteId = 'El cliente es requerido';
    if (!formData.abogadoId) newErrors.abogadoId = 'El abogado responsable es requerido';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const expedienteData: Omit<Expediente, 'id'> = {
        numero: formData.numero,
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        clienteId: formData.clienteId,
        abogadoId: formData.abogadoId,
        estado: formData.estado,
        fechaInicio: new Date(formData.fechaInicio),
        fechaFin: formData.fechaFin ? new Date(formData.fechaFin) : undefined,
        fechaActualizacion: new Date(),
        observaciones: formData.observaciones || undefined
      };

      if (expedienteId) {
        await updateExpediente(expedienteId, expedienteData);
        notification.success({
          message: 'Expediente actualizado',
          description: 'El expediente se ha actualizado correctamente'
        });
      } else {
        await createExpediente(expedienteData);
        notification.success({
          message: 'Expediente creado',
          description: 'El expediente se ha creado correctamente'
        });
      }

      // Si se proporciona onSuccess, llamar a esa función en lugar de navegar
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/expedientes');
      }
    } catch (error: any) {
      notification.error({
        message: 'Error',
        description: error.message || 'Ha ocurrido un error al guardar el expediente'
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
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Número de Expediente *
          </label>
          <input
            type="text"
            name="numero"
            value={formData.numero}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
              errors.numero ? 'border-red-500' : ''
            }`}
          />
          {errors.numero && (
            <p className="mt-1 text-sm text-red-600">{errors.numero}</p>
          )}
        </div>

        <div>
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
            Descripción *
          </label>
          <textarea
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            rows={3}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
              errors.descripcion ? 'border-red-500' : ''
            }`}
          />
          {errors.descripcion && (
            <p className="mt-1 text-sm text-red-600">{errors.descripcion}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Cliente *
          </label>
          <select
            name="clienteId"
            value={formData.clienteId}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
              errors.clienteId ? 'border-red-500' : ''
            }`}
          >
            <option value="">Seleccione un cliente</option>
            {clientes.map(cliente => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.tipo === 'persona'
                  ? `${cliente.nombre} ${cliente.apellido || ''}`
                  : cliente.nombre}
              </option>
            ))}
          </select>
          {errors.clienteId && (
            <p className="mt-1 text-sm text-red-600">{errors.clienteId}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Abogado Responsable *
          </label>
          <select
            name="abogadoId"
            value={formData.abogadoId}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
              errors.abogadoId ? 'border-red-500' : ''
            }`}
          >
            <option value="">Seleccione un abogado</option>
            {usuarios
              .filter(usuario => usuario.rol === 'abogado')
              .map(abogado => (
                <option key={abogado.id} value={abogado.id}>
                  {`${abogado.nombre} ${abogado.apellido}`}
                </option>
              ))}
          </select>
          {errors.abogadoId && (
            <p className="mt-1 text-sm text-red-600">{errors.abogadoId}</p>
          )}
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
            <option value={EstadoExpediente.ABIERTO}>Abierto</option>
            <option value={EstadoExpediente.EN_PROCESO}>En proceso</option>
            <option value={EstadoExpediente.CERRADO}>Cerrado</option>
            <option value={EstadoExpediente.ARCHIVADO}>Archivado</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Fecha de Inicio
          </label>
          <input
            type="date"
            name="fechaInicio"
            value={formData.fechaInicio}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Fecha de Fin
          </label>
          <input
            type="date"
            name="fechaFin"
            value={formData.fechaFin}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Observaciones
          </label>
          <textarea
            name="observaciones"
            value={formData.observaciones}
            onChange={handleChange}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => {
            if (isModal && onSuccess) {
              onSuccess();
            } else {
              navigate('/expedientes');
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
          {loading ? 'Guardando...' : expedienteId ? 'Actualizar' : 'Crear'}
        </button>
      </div>
    </form>
  );
};

export default ExpedienteForm;
