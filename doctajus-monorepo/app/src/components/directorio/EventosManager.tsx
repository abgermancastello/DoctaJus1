import React, { useState, useEffect } from 'react';
import { Evento, TipoEvento } from '../../types';
import { eventoService } from '../../services/api';
import { useUIStore } from '../../stores/uiStore';

interface EventosManagerProps {
  contactoId: string;
  isOpen: boolean;
  onClose: () => void;
}

const EventosManager: React.FC<EventosManagerProps> = ({
  contactoId,
  isOpen,
  onClose
}) => {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingEvento, setEditingEvento] = useState<Evento | null>(null);

  // Campos para el formulario
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [tipo, setTipo] = useState<TipoEvento>(TipoEvento.REUNION);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [completado, setCompletado] = useState(false);

  const { addNotification } = useUIStore();

  // Cargar eventos del contacto
  useEffect(() => {
    if (isOpen && contactoId) {
      fetchEventos();
    }
  }, [isOpen, contactoId]);

  const fetchEventos = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await eventoService.getEventos({ contactoId });
      setEventos(data.eventos);
      setIsLoading(false);
    } catch (err) {
      console.error('Error cargando eventos:', err);
      setError('No se pudieron cargar los eventos');
      setIsLoading(false);
    }
  };

  // Formatear fecha para mostrar
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Formatear fecha para input date-time
  const toDateTimeInput = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16); // Format: yyyy-MM-ddThh:mm
  };

  // Obtener texto legible para el tipo de evento
  const getTipoEventoTexto = (tipo: TipoEvento) => {
    switch (tipo) {
      case TipoEvento.REUNION:
        return 'Reunión';
      case TipoEvento.LLAMADA:
        return 'Llamada';
      case TipoEvento.AUDIENCIA:
        return 'Audiencia';
      case TipoEvento.VENCIMIENTO:
        return 'Vencimiento';
      case TipoEvento.OTRO:
        return 'Otro';
      default:
        return tipo;
    }
  };

  // Obtener color según tipo de evento
  const getTipoEventoClases = (tipo: TipoEvento) => {
    switch (tipo) {
      case TipoEvento.REUNION:
        return 'bg-blue-100 text-blue-800';
      case TipoEvento.LLAMADA:
        return 'bg-green-100 text-green-800';
      case TipoEvento.AUDIENCIA:
        return 'bg-purple-100 text-purple-800';
      case TipoEvento.VENCIMIENTO:
        return 'bg-red-100 text-red-800';
      case TipoEvento.OTRO:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Abrir formulario para nuevo evento
  const handleNewEvento = () => {
    const now = new Date();
    // Sumar una hora para la fecha de fin por defecto
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

    setTitulo('');
    setDescripcion('');
    setTipo(TipoEvento.REUNION);
    setFechaInicio(now.toISOString().slice(0, 16));
    setFechaFin(oneHourLater.toISOString().slice(0, 16));
    setCompletado(false);
    setEditingEvento(null);
    setShowForm(true);
  };

  // Abrir formulario para editar evento
  const handleEditEvento = (evento: Evento) => {
    setTitulo(evento.titulo);
    setDescripcion(evento.descripcion || '');
    setTipo(evento.tipo);
    setFechaInicio(toDateTimeInput(evento.fechaInicio.toString()));
    setFechaFin(evento.fechaFin ? toDateTimeInput(evento.fechaFin.toString()) : '');
    setCompletado(evento.completado);
    setEditingEvento(evento);
    setShowForm(true);
  };

  // Marcar evento como completado/pendiente
  const handleToggleCompletado = async (evento: Evento) => {
    try {
      const updated = await eventoService.updateEvento(evento.id, {
        ...evento,
        completado: !evento.completado
      });

      // Actualizar la lista local
      setEventos(prevEventos =>
        prevEventos.map(e => e.id === evento.id ? updated.evento : e)
      );

      addNotification({
        type: 'success',
        message: `Evento marcado como ${!evento.completado ? 'completado' : 'pendiente'}`
      });
    } catch (error) {
      console.error('Error actualizando evento:', error);
      addNotification({
        type: 'error',
        message: 'No se pudo actualizar el estado del evento'
      });
    }
  };

  // Eliminar evento
  const handleDeleteEvento = async (id: string) => {
    if (window.confirm('¿Está seguro que desea eliminar este evento?')) {
      try {
        await eventoService.deleteEvento(id);

        // Actualizar la lista local
        setEventos(prevEventos => prevEventos.filter(e => e.id !== id));

        addNotification({
          type: 'success',
          message: 'Evento eliminado correctamente'
        });
      } catch (error) {
        console.error('Error eliminando evento:', error);
        addNotification({
          type: 'error',
          message: 'No se pudo eliminar el evento'
        });
      }
    }
  };

  // Validar formulario
  const validateForm = () => {
    if (!titulo.trim()) {
      addNotification({
        type: 'error',
        message: 'El título del evento es obligatorio'
      });
      return false;
    }

    if (!fechaInicio) {
      addNotification({
        type: 'error',
        message: 'La fecha de inicio es obligatoria'
      });
      return false;
    }

    // Si hay fecha de fin, verificar que sea posterior a la de inicio
    if (fechaFin && new Date(fechaFin) <= new Date(fechaInicio)) {
      addNotification({
        type: 'error',
        message: 'La fecha de fin debe ser posterior a la fecha de inicio'
      });
      return false;
    }

    return true;
  };

  // Guardar nuevo evento o actualizar existente
  const handleSaveEvento = async () => {
    if (!validateForm()) return;

    try {
      const eventoData = {
        titulo,
        descripcion,
        tipo,
        fechaInicio: new Date(fechaInicio).toISOString(),
        fechaFin: fechaFin ? new Date(fechaFin).toISOString() : undefined,
        completado,
        contactoId
      };

      let result: { evento: Evento };

      if (editingEvento) {
        // Actualizar evento existente
        result = await eventoService.updateEvento(editingEvento.id, eventoData);

        // Actualizar la lista local
        setEventos(prevEventos =>
          prevEventos.map(e => e.id === editingEvento.id ? result.evento : e)
        );

        addNotification({
          type: 'success',
          message: 'Evento actualizado correctamente'
        });
      } else {
        // Crear nuevo evento
        result = await eventoService.createEvento(eventoData);

        // Añadir a la lista local
        setEventos(prevEventos => [...prevEventos, result.evento]);

        addNotification({
          type: 'success',
          message: 'Evento creado correctamente'
        });
      }

      // Limpiar formulario y cerrar
      setShowForm(false);
    } catch (error) {
      console.error('Error guardando evento:', error);
      addNotification({
        type: 'error',
        message: 'No se pudo guardar el evento'
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="border-b px-6 py-4 flex justify-between items-center bg-gray-50 rounded-t-lg">
          <h2 className="text-xl font-bold text-gray-800">Agenda del Contacto</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-4">{error}</div>
          ) : (
            <>
              {showForm ? (
                <div className="mb-6 bg-gray-50 p-4 rounded-md">
                  <h3 className="text-lg font-medium mb-3">
                    {editingEvento ? 'Editar Evento' : 'Nuevo Evento'}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Título <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={titulo}
                        onChange={(e) => setTitulo(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de Evento
                      </label>
                      <select
                        value={tipo}
                        onChange={(e) => setTipo(e.target.value as TipoEvento)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value={TipoEvento.REUNION}>Reunión</option>
                        <option value={TipoEvento.LLAMADA}>Llamada</option>
                        <option value={TipoEvento.AUDIENCIA}>Audiencia</option>
                        <option value={TipoEvento.VENCIMIENTO}>Vencimiento</option>
                        <option value={TipoEvento.OTRO}>Otro</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Fecha y Hora de Inicio <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="datetime-local"
                          value={fechaInicio}
                          onChange={(e) => setFechaInicio(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Fecha y Hora de Fin
                        </label>
                        <input
                          type="datetime-local"
                          value={fechaFin}
                          onChange={(e) => setFechaFin(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descripción
                      </label>
                      <textarea
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        rows={3}
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="completado"
                        checked={completado}
                        onChange={(e) => setCompletado(e.target.checked)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor="completado" className="ml-2 block text-sm text-gray-900">
                        Marcar como completado
                      </label>
                    </div>
                    <div className="flex space-x-2 justify-end">
                      <button
                        type="button"
                        onClick={() => setShowForm(false)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveEvento}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                      >
                        Guardar
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleNewEvento}
                  className="mb-4 flex items-center px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Nuevo Evento
                </button>
              )}

              <div className="space-y-3">
                {eventos.length === 0 ? (
                  <p className="text-gray-500 text-center p-4">No hay eventos programados para este contacto.</p>
                ) : (
                  eventos.map(evento => (
                    <div key={evento.id} className={`p-4 border rounded-md ${evento.completado ? 'bg-gray-50 opacity-70' : 'bg-white'}`}>
                      <div className="flex justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getTipoEventoClases(evento.tipo)}`}>
                              {getTipoEventoTexto(evento.tipo)}
                            </span>
                            {evento.completado && (
                              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                Completado
                              </span>
                            )}
                          </div>
                          <h3 className={`font-medium text-lg ${evento.completado ? 'line-through text-gray-500' : ''}`}>
                            {evento.titulo}
                          </h3>
                          <p className="text-gray-600 text-sm mt-1">
                            {formatDate(evento.fechaInicio.toString())}
                            {evento.fechaFin && ` - ${formatDate(evento.fechaFin.toString())}`}
                          </p>
                          {evento.descripcion && (
                            <p className="text-gray-700 mt-2">{evento.descripcion}</p>
                          )}
                        </div>
                        <div className="flex flex-col space-y-1">
                          <button
                            onClick={() => handleToggleCompletado(evento)}
                            className={`p-1 ${evento.completado ? 'text-green-600 hover:text-green-800' : 'text-gray-500 hover:text-green-600'}`}
                            title={evento.completado ? 'Marcar como pendiente' : 'Marcar como completado'}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleEditEvento(evento)}
                            className="p-1 text-gray-500 hover:text-indigo-600"
                            title="Editar evento"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteEvento(evento.id)}
                            className="p-1 text-gray-500 hover:text-red-600"
                            title="Eliminar evento"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        <div className="border-t px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventosManager;
