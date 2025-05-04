import React, { useState, useEffect } from 'react';
import { CalendarEvent } from '../../stores/calendarStore';
import { useExpedienteStore } from '../../stores/expedienteStore';
import { Expediente } from '../../types';
import moment from 'moment';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event?: CalendarEvent | null;
  onSave: (event: Omit<CalendarEvent, 'id'> | CalendarEvent) => void;
  onDelete?: (id: number) => void;
}

const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  event,
  onSave,
  onDelete,
}) => {
  const isEdit = !!event;

  // Obtener la lista de expedientes
  const { expedientes, fetchExpedientes } = useExpedienteStore();

  // Estados para los campos del formulario
  const [title, setTitle] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [tipo, setTipo] = useState<CalendarEvent['tipo']>('reunion');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [allDay, setAllDay] = useState(false);
  const [ubicacion, setUbicacion] = useState('');
  const [expedienteId, setExpedienteId] = useState<string | undefined>(undefined);
  const [expedienteSeleccionado, setExpedienteSeleccionado] = useState<Expediente | null>(null);

  // Cargar expedientes al montar el componente
  useEffect(() => {
    fetchExpedientes();
  }, [fetchExpedientes]);

  // Inicializar el formulario con los datos del evento si estamos editando
  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescripcion(event.descripcion || '');
      setTipo(event.tipo);
      setStartDate(moment(event.start).format('YYYY-MM-DD'));
      setStartTime(moment(event.start).format('HH:mm'));
      setEndDate(moment(event.end).format('YYYY-MM-DD'));
      setEndTime(moment(event.end).format('HH:mm'));
      setAllDay(!!event.allDay);
      setUbicacion(event.ubicacion || '');
      setExpedienteId(event.expedienteId);

      // Buscar el expediente seleccionado si hay un ID
      if (event.expedienteId) {
        const expediente = expedientes.find(exp => exp.id === event.expedienteId);
        setExpedienteSeleccionado(expediente || null);
      }
    } else {
      // Si no hay evento, inicializar con valores default
      const now = moment();
      setTitle('');
      setDescripcion('');
      setTipo('reunion');
      setStartDate(now.format('YYYY-MM-DD'));
      setStartTime(now.format('HH:mm'));
      setEndDate(now.format('YYYY-MM-DD'));
      setEndTime(now.add(1, 'hour').format('HH:mm'));
      setAllDay(false);
      setUbicacion('');
      setExpedienteId(undefined);
      setExpedienteSeleccionado(null);
    }
  }, [event, expedientes]);

  // Manejar el envío del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Crear fechas de inicio y fin
    const start = moment(`${startDate} ${allDay ? '00:00' : startTime}`).toDate();
    const end = moment(`${endDate} ${allDay ? '23:59' : endTime}`).toDate();

    // Crear el objeto evento
    const eventData: Omit<CalendarEvent, 'id'> = {
      title,
      descripcion,
      tipo,
      start,
      end,
      allDay,
      ubicacion: ubicacion || undefined,
      expedienteId: expedienteId,
    };

    // Si estamos editando, incluir el id
    if (isEdit && event) {
      onSave({ ...eventData, id: event.id });
    } else {
      onSave(eventData);
    }

    onClose();
  };

  // Manejar cambio de expediente
  const handleExpedienteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    setExpedienteId(selectedId || undefined);

    if (selectedId) {
      const expediente = expedientes.find(exp => exp.id === selectedId);
      setExpedienteSeleccionado(expediente || null);
    } else {
      setExpedienteSeleccionado(null);
    }
  };

  // Manejar la eliminación del evento
  const handleDelete = () => {
    if (isEdit && event && onDelete) {
      onDelete(event.id);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {isEdit ? 'Editar Evento' : 'Nuevo Evento'}
          </h2>
          <button className="modal-close-button" onClick={onClose}>×</button>
        </div>

        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">Título*</label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="tipo">Tipo*</label>
              <select
                id="tipo"
                value={tipo}
                onChange={(e) => setTipo(e.target.value as CalendarEvent['tipo'])}
                required
                className="form-control"
              >
                <option value="audiencia">Audiencia</option>
                <option value="vencimiento">Vencimiento</option>
                <option value="reunion">Reunión</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={allDay}
                  onChange={(e) => setAllDay(e.target.checked)}
                />
                Todo el día
              </label>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="startDate">Fecha de inicio*</label>
                <input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="form-control"
                />
              </div>

              {!allDay && (
                <div className="form-group">
                  <label htmlFor="startTime">Hora de inicio*</label>
                  <input
                    id="startTime"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                    className="form-control"
                  />
                </div>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="endDate">Fecha de fin*</label>
                <input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  className="form-control"
                />
              </div>

              {!allDay && (
                <div className="form-group">
                  <label htmlFor="endTime">Hora de fin*</label>
                  <input
                    id="endTime"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                    className="form-control"
                  />
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="descripcion">Descripción</label>
              <textarea
                id="descripcion"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className="form-control"
                rows={3}
              />
            </div>

            <div className="form-group">
              <label htmlFor="ubicacion">Ubicación</label>
              <input
                id="ubicacion"
                type="text"
                value={ubicacion}
                onChange={(e) => setUbicacion(e.target.value)}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="expedienteId">Expediente</label>
              <select
                id="expedienteId"
                value={expedienteId || ''}
                onChange={handleExpedienteChange}
                className="form-control"
              >
                <option value="">Sin expediente asociado</option>
                {expedientes.map(expediente => (
                  <option key={expediente.id} value={expediente.id}>
                    {expediente.numero} - {expediente.titulo}
                  </option>
                ))}
              </select>
            </div>

            {expedienteSeleccionado && (
              <div className="form-group expediente-info">
                <div className="expediente-badge">
                  <span className="estado-tag" style={{
                    backgroundColor: expedienteSeleccionado.estado === 'ABIERTO' ? '#389e0d' :
                      expedienteSeleccionado.estado === 'EN_PROCESO' ? '#1890ff' :
                      expedienteSeleccionado.estado === 'CERRADO' ? '#f5222d' :
                      expedienteSeleccionado.estado === 'ARCHIVADO' ? '#8c8c8c' : '#8c8c8c'
                  }}>
                    {expedienteSeleccionado.estado}
                  </span>
                  <p className="expediente-details">
                    <strong>Cliente:</strong> {expedienteSeleccionado.clienteId}<br />
                    <strong>Inicio:</strong> {moment(expedienteSeleccionado.fechaInicio).format('DD/MM/YYYY')}
                  </p>
                </div>
              </div>
            )}
          </form>
        </div>

        <div className="modal-footer">
          {isEdit && onDelete && (
            <button
              type="button"
              className="modal-delete-button"
              onClick={handleDelete}
            >
              Eliminar
            </button>
          )}
          <button
            type="button"
            className="modal-cancel-button"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="modal-confirm-button"
            onClick={handleSubmit}
          >
            {isEdit ? 'Actualizar' : 'Crear'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventModal;
