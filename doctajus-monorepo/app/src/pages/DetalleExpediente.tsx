import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useExpedienteStore } from '../stores/expedienteStore';
import { useTareaStore } from '../stores/tareaStore';
import { useClienteStore } from '../stores/clienteStore';
import { useUsuarioStore } from '../stores/usuarioStore';
import { useCalendarStore, CalendarEvent } from '../stores/calendarStore';
import { useUIStore } from '../stores/uiStore';
import { Expediente, Tarea, EstadoTarea, PrioridadTarea } from '../types';
import { Tabs, Button, Tag, Alert, Spin, Modal, Badge, Table, Space, Tooltip } from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  CheckOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  FileOutlined,
  TeamOutlined,
  CalendarOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import moment from 'moment';
import 'moment/locale/es';
import TareaForm from '../components/forms/TareaForm';
import ExpedienteForm from '../components/forms/ExpedienteForm';
import EventModal from '../components/calendar/EventModal';

const { TabPane } = Tabs;
const { confirm } = Modal;

moment.locale('es');

const DetalleExpediente: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Stores
  const {
    getExpediente,
    expedienteSeleccionado,
    isLoading: loadingExpediente,
    error: errorExpediente,
    updateExpediente,
    deleteExpediente
  } = useExpedienteStore();

  const {
    tareas,
    isLoading: loadingTareas,
    error: errorTareas,
    getTareasByExpediente,
    updateTarea,
    deleteTarea
  } = useTareaStore();

  const {
    fetchEventsByExpediente,
    addEvent,
    updateEvent,
    deleteEvent,
    loading: loadingEvents,
    error: errorEvents
  } = useCalendarStore();

  const { getCliente, clientes } = useClienteStore();
  const { getUsuario, usuarios } = useUsuarioStore();
  const { openModal, closeModal } = useUIStore();

  // Estados locales
  const [cliente, setCliente] = useState<any>(null);
  const [abogado, setAbogado] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('informacion');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Cargar datos del expediente
  useEffect(() => {
    if (id) {
      const fetchData = async () => {
        const expediente = await getExpediente(id);
        await getTareasByExpediente(id);

        // Cargar eventos del expediente
        const expedienteEvents = await fetchEventsByExpediente(id);
        setEvents(expedienteEvents);

        if (expediente) {
          // Cargar cliente y abogado relacionados
          const clienteData = await getCliente(expediente.clienteId);
          const abogadoData = await getUsuario(expediente.abogadoId);

          setCliente(clienteData);
          setAbogado(abogadoData);
        }
      };

      fetchData();
    }
  }, [id, getExpediente, getTareasByExpediente, getCliente, getUsuario, fetchEventsByExpediente]);

  // Función para navegar a vista completa del calendario
  const handleVerCalendario = () => {
    navigate('/calendario');
  };

  // Manejadores para eventos del calendario
  const handleNuevoEvento = () => {
    // Crear un evento temporal con fechas por defecto
    setSelectedEvent({
      id: 0,
      title: '',
      start: new Date(),
      end: moment().add(1, 'hour').toDate(),
      tipo: 'audiencia',
      descripcion: '',
      expedienteId: id // Asignar automáticamente el ID del expediente actual
    });
    setShowEventModal(true);
  };

  const handleEditarEvento = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const handleGuardarEvento = async (eventData: Omit<CalendarEvent, 'id'> | CalendarEvent) => {
    if ('id' in eventData && eventData.id !== 0) {
      // Actualizar evento existente
      await updateEvent(eventData.id, eventData);
    } else {
      // Crear nuevo evento
      await addEvent(eventData);
    }

    // Recargar eventos
    const updatedEvents = await fetchEventsByExpediente(id!);
    setEvents(updatedEvents);
    setShowEventModal(false);
    setSelectedEvent(null);
  };

  const handleEliminarEvento = async (eventId: number) => {
    await deleteEvent(eventId);
    // Recargar eventos
    const updatedEvents = await fetchEventsByExpediente(id!);
    setEvents(updatedEvents);
  };

  const handleCloseEventModal = () => {
    setShowEventModal(false);
    setSelectedEvent(null);
  };

  // Obtener estadísticas de las tareas
  const tareasStats = {
    total: tareas.length,
    pendientes: tareas.filter(t => t.estado === EstadoTarea.PENDIENTE).length,
    enProgreso: tareas.filter(t => t.estado === EstadoTarea.EN_PROGRESO).length,
    completadas: tareas.filter(t => t.estado === EstadoTarea.COMPLETADA).length,
    vencidas: tareas.filter(t => {
      const fechaVencimiento = new Date(t.fechaVencimiento);
      return fechaVencimiento < new Date() && t.estado !== EstadoTarea.COMPLETADA;
    }).length
  };

  // Obtener estadísticas de eventos
  const eventsStats = {
    total: events.length,
    audiencias: events.filter(e => e.tipo === 'audiencia').length,
    vencimientos: events.filter(e => e.tipo === 'vencimiento').length,
    reuniones: events.filter(e => e.tipo === 'reunion').length,
    proximos: events.filter(e => moment(e.start).isAfter(moment())).length,
    pasados: events.filter(e => moment(e.end).isBefore(moment())).length
  };

  // Columnas para la tabla de tareas
  const tareasColumns = [
    {
      title: 'Título',
      dataIndex: 'titulo',
      key: 'titulo',
      render: (text: string, tarea: Tarea) => (
        <span className="font-medium">
          {tarea.estado === EstadoTarea.COMPLETADA ? (
            <span className="line-through text-gray-500">{text}</span>
          ) : (
            text
          )}
        </span>
      )
    },
    {
      title: 'Vencimiento',
      dataIndex: 'fechaVencimiento',
      key: 'fechaVencimiento',
      render: (date: string, tarea: Tarea) => {
        const fechaVencimiento = moment(date);
        const hoy = moment();
        const vencida = fechaVencimiento.isBefore(hoy) && tarea.estado !== EstadoTarea.COMPLETADA;

        return (
          <span className={vencida ? 'text-red-600 font-medium' : ''}>
            {fechaVencimiento.format('DD/MM/YYYY')}
            {vencida && (
              <Tooltip title="Vencida">
                <ExclamationCircleOutlined className="ml-1 text-red-600" />
              </Tooltip>
            )}
          </span>
        );
      }
    },
    {
      title: 'Prioridad',
      dataIndex: 'prioridad',
      key: 'prioridad',
      render: (prioridad: PrioridadTarea) => {
        let color = 'green';
        if (prioridad === PrioridadTarea.ALTA) color = 'red';
        if (prioridad === PrioridadTarea.MEDIA) color = 'orange';

        return <Tag color={color}>{prioridad.toUpperCase()}</Tag>;
      }
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
      render: (estado: EstadoTarea) => {
        let color = 'blue';
        let icon = <ClockCircleOutlined />;

        if (estado === EstadoTarea.PENDIENTE) {
          color = 'default';
          icon = <ClockCircleOutlined />;
        } else if (estado === EstadoTarea.EN_PROGRESO) {
          color = 'processing';
          icon = <ClockCircleOutlined />;
        } else if (estado === EstadoTarea.COMPLETADA) {
          color = 'success';
          icon = <CheckOutlined />;
        } else if (estado === EstadoTarea.CANCELADA) {
          color = 'error';
          icon = <DeleteOutlined />;
        }

        return (
          <Tag icon={icon} color={color}>
            {estado === EstadoTarea.PENDIENTE ? 'PENDIENTE' :
             estado === EstadoTarea.EN_PROGRESO ? 'EN PROGRESO' :
             estado === EstadoTarea.COMPLETADA ? 'COMPLETADA' :
             estado === EstadoTarea.CANCELADA ? 'CANCELADA' : estado}
          </Tag>
        );
      }
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_: any, tarea: Tarea) => (
        <Space size="small">
          {tarea.estado !== EstadoTarea.COMPLETADA && (
            <Tooltip title="Marcar como completada">
              <Button
                type="text"
                icon={<CheckOutlined />}
                onClick={() => handleCompletarTarea(tarea)}
                size="small"
                className="text-green-600 hover:text-green-800"
              />
            </Tooltip>
          )}
          <Tooltip title="Editar">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditarTarea(tarea)}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Eliminar">
            <Button
              type="text"
              icon={<DeleteOutlined />}
              onClick={() => handleEliminarTarea(tarea.id)}
              size="small"
              danger
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  // Manejo de tareas
  const handleNuevaTarea = () => {
    openModal({
      title: 'Nueva Tarea',
      content: (
        <TareaForm
          isModal={true}
          expedientePreseleccionado={id}
          onSuccess={() => {
            closeModal();
            getTareasByExpediente(id!);
            getExpediente(id!);
          }}
        />
      ),
      confirmText: 'Cerrar',
      cancelText: 'Cancelar',
      showCancel: false
    });
  };

  const handleEditarTarea = (tarea: Tarea) => {
    openModal({
      title: 'Editar Tarea',
      content: (
        <TareaForm
          tareaId={tarea.id}
          isModal={true}
          onSuccess={() => {
            closeModal();
            getTareasByExpediente(id!);
            getExpediente(id!);
          }}
        />
      ),
      confirmText: 'Cerrar',
      cancelText: 'Cancelar',
      showCancel: false
    });
  };

  const handleCompletarTarea = async (tarea: Tarea) => {
    try {
      await updateTarea(tarea.id, {
        estado: EstadoTarea.COMPLETADA,
        fechaCompletada: new Date().toISOString()
      });

      await getTareasByExpediente(id!);
      await getExpediente(id!);
    } catch (error) {
      console.error('Error al completar tarea:', error);
    }
  };

  // Manejar eliminación de tarea
  const handleEliminarTarea = async (tareaId: string) => {
    confirm({
      title: '¿Está seguro de eliminar esta tarea?',
      icon: <ExclamationCircleOutlined />,
      content: 'Esta acción no se puede deshacer',
      okText: 'Sí, eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          await deleteTarea(tareaId);
          await getTareasByExpediente(id!);
        } catch (error) {
          console.error('Error al eliminar tarea:', error);
        }
      }
    });
  };

  // Manejo del expediente
  const handleEditarExpediente = () => {
    openModal({
      title: 'Editar Expediente',
      content: (
        <ExpedienteForm
          expedienteId={id}
          isModal={true}
          onSuccess={() => {
            closeModal();
            getExpediente(id!);
          }}
        />
      ),
      confirmText: 'Cerrar',
      cancelText: 'Cancelar',
      showCancel: false
    });
  };

  const handleEliminarExpediente = () => {
    confirm({
      title: '¿Está seguro de eliminar este expediente?',
      icon: <ExclamationCircleOutlined />,
      content: 'Esta acción eliminará permanentemente el expediente y todos los datos relacionados. No se puede deshacer.',
      okText: 'Sí, eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        setDeleteLoading(true);
        try {
          await deleteExpediente(id!);
          navigate('/expedientes');
        } catch (error) {
          console.error('Error al eliminar expediente:', error);
        } finally {
          setDeleteLoading(false);
        }
      }
    });
  };

  // Manejar el botón de volver atrás
  const handleVolver = () => {
    navigate('/expedientes');
  };

  // Columnas para la tabla de eventos
  const eventosColumns = [
    {
      title: 'Título',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Tipo',
      dataIndex: 'tipo',
      key: 'tipo',
      render: (tipo: string) => {
        let color = '';
        switch (tipo) {
          case 'audiencia': color = 'red'; break;
          case 'vencimiento': color = 'orange'; break;
          case 'reunion': color = 'green'; break;
          case 'otro': color = 'purple'; break;
        }
        return <Tag color={color}>{tipo.toUpperCase()}</Tag>;
      }
    },
    {
      title: 'Fecha',
      dataIndex: 'start',
      key: 'start',
      render: (start: Date, record: CalendarEvent) => {
        const fecha = moment(start).format('DD/MM/YYYY');
        const horaInicio = moment(start).format('HH:mm');

        if (record.allDay) {
          return <span>{fecha} (Todo el día)</span>;
        }

        const horaFin = moment(record.end).format('HH:mm');
        return <span>{fecha} {horaInicio} - {horaFin}</span>;
      }
    },
    {
      title: 'Ubicación',
      dataIndex: 'ubicacion',
      key: 'ubicacion',
      render: (ubicacion: string) => ubicacion || '-'
    },
    {
      title: 'Acciones',
      key: 'action',
      render: (_: any, record: CalendarEvent) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEditarEvento(record)}
          />
        </Space>
      ),
    },
  ];

  // Mostrar cargando o error
  if (loadingExpediente && !expedienteSeleccionado) {
    return (
      <div className="flex justify-center items-center h-full py-20">
        <Spin size="large" tip="Cargando expediente..." />
      </div>
    );
  }

  if (errorExpediente && !expedienteSeleccionado) {
    return (
      <div className="p-6">
        <Alert
          message="Error al cargar el expediente"
          description={errorExpediente}
          type="error"
          showIcon
          action={
            <Button onClick={() => getExpediente(id!)} type="primary">
              Reintentar
            </Button>
          }
        />
      </div>
    );
  }

  if (!expedienteSeleccionado) {
    return (
      <div className="p-6">
        <Alert
          message="Expediente no encontrado"
          description="El expediente que busca no existe o ha sido eliminado"
          type="warning"
          showIcon
          action={
            <Button onClick={() => navigate('/expedientes')} type="primary">
              Volver a Expedientes
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="page">
      <div className="flex items-center mb-4">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={handleVolver}
          className="mr-2"
          type="link"
          size="middle"
        >
          Volver a expedientes
        </Button>
      </div>

      <div className="page-header flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">
            {expedienteSeleccionado.numero}: {expedienteSeleccionado.titulo}
          </h1>
          <div className="text-gray-600 flex items-center gap-4">
            <span className="flex items-center">
              <FileOutlined className="mr-1" /> Expediente
            </span>
            <Tag color={
              expedienteSeleccionado.estado === 'ABIERTO' ? 'green' :
              expedienteSeleccionado.estado === 'EN_PROCESO' ? 'blue' :
              expedienteSeleccionado.estado === 'CERRADO' ? 'red' :
              expedienteSeleccionado.estado === 'ARCHIVADO' ? 'gray' : 'default'
            }>
              {expedienteSeleccionado.estado}
            </Tag>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleEditarExpediente}
            icon={<EditOutlined />}
          >
            Editar
          </Button>
          <Button
            onClick={handleEliminarExpediente}
            danger
            icon={<DeleteOutlined />}
            loading={deleteLoading}
          >
            Eliminar
          </Button>
        </div>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Información general" key="informacion">
          <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Detalles del expediente</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-500">Número:</span>
                    <span className="ml-2 font-medium">{expedienteSeleccionado.numero}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Título:</span>
                    <span className="ml-2 font-medium">{expedienteSeleccionado.titulo}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Descripción:</span>
                    <p className="mt-1">{expedienteSeleccionado.descripcion}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Estado:</span>
                    <Tag className="ml-2" color={
                      expedienteSeleccionado.estado === 'ABIERTO' ? 'green' :
                      expedienteSeleccionado.estado === 'EN_PROCESO' ? 'blue' :
                      expedienteSeleccionado.estado === 'CERRADO' ? 'red' :
                      expedienteSeleccionado.estado === 'ARCHIVADO' ? 'gray' : 'default'
                    }>
                      {expedienteSeleccionado.estado}
                    </Tag>
                  </div>
                  <div>
                    <span className="text-gray-500">Fecha de inicio:</span>
                    <span className="ml-2">
                      {moment(expedienteSeleccionado.fechaInicio).format('DD/MM/YYYY')}
                    </span>
                  </div>
                  {expedienteSeleccionado.fechaFin && (
                    <div>
                      <span className="text-gray-500">Fecha de fin:</span>
                      <span className="ml-2">
                        {moment(expedienteSeleccionado.fechaFin).format('DD/MM/YYYY')}
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-500">Última actualización:</span>
                    <span className="ml-2">
                      {moment(expedienteSeleccionado.fechaActualizacion).format('DD/MM/YYYY')}
                    </span>
                  </div>
                  {expedienteSeleccionado.observaciones && (
                    <div>
                      <span className="text-gray-500">Observaciones:</span>
                      <p className="mt-1">{expedienteSeleccionado.observaciones}</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Partes involucradas</h3>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center mb-2">
                      <TeamOutlined className="mr-2 text-blue-600" />
                      <h4 className="font-medium">Cliente</h4>
                    </div>
                    {cliente ? (
                      <div>
                        <p className="font-medium">{cliente.nombre} {cliente.apellido || ''}</p>
                        <p className="text-sm text-gray-600">{cliente.email}</p>
                        <p className="text-sm text-gray-600">{cliente.telefono}</p>
                      </div>
                    ) : (
                      <p className="text-gray-500">Cargando información del cliente...</p>
                    )}
                  </div>

                  <div className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center mb-2">
                      <TeamOutlined className="mr-2 text-green-600" />
                      <h4 className="font-medium">Abogado responsable</h4>
                    </div>
                    {abogado ? (
                      <div>
                        <p className="font-medium">{abogado.nombre} {abogado.apellido}</p>
                        <p className="text-sm text-gray-600">{abogado.email}</p>
                      </div>
                    ) : (
                      <p className="text-gray-500">Cargando información del abogado...</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabPane>

        <TabPane
          tab={
            <span>
              Tareas
              <Badge
                count={tareasStats.pendientes + tareasStats.enProgreso}
                style={{ marginLeft: 8 }}
                color={tareasStats.vencidas > 0 ? 'red' : 'blue'}
              />
            </span>
          }
          key="tareas"
        >
          <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Tareas del expediente</h3>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleNuevaTarea}
              >
                Nueva tarea
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold">{tareasStats.total}</div>
                <div className="text-sm text-gray-500">Total</div>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{tareasStats.pendientes}</div>
                <div className="text-sm text-blue-600">Pendientes</div>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-orange-600">{tareasStats.enProgreso}</div>
                <div className="text-sm text-orange-600">En progreso</div>
              </div>
              <div className={tareasStats.vencidas > 0 ? "bg-red-50 p-3 rounded-lg text-center" : "bg-gray-50 p-3 rounded-lg text-center"}>
                <div className={`text-2xl font-bold ${tareasStats.vencidas > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                  {tareasStats.vencidas}
                </div>
                <div className={`text-sm ${tareasStats.vencidas > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                  Vencidas
                </div>
              </div>
            </div>

            {loadingTareas ? (
              <div className="text-center py-10">
                <Spin tip="Cargando tareas..." />
              </div>
            ) : errorTareas ? (
              <Alert
                message="Error al cargar las tareas"
                description={errorTareas}
                type="error"
                showIcon
                action={
                  <Button onClick={() => getTareasByExpediente(id!)} type="primary">
                    Reintentar
                  </Button>
                }
              />
            ) : tareas.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500 mb-4">No hay tareas asociadas a este expediente</p>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleNuevaTarea}
                >
                  Crear primera tarea
                </Button>
              </div>
            ) : (
              <Table
                columns={tareasColumns}
                dataSource={tareas.map(tarea => ({ ...tarea, key: tarea.id }))}
                rowClassName={(record) => {
                  const fechaVencimiento = moment(record.fechaVencimiento);
                  const hoy = moment();
                  const vencida = fechaVencimiento.isBefore(hoy) && record.estado !== EstadoTarea.COMPLETADA;

                  return vencida ? 'bg-red-50' : '';
                }}
                pagination={{ pageSize: 10 }}
              />
            )}
          </div>
        </TabPane>

        <TabPane
          tab={
            <span>
              Audiencias y Vencimientos
              <CalendarOutlined style={{ marginLeft: 8 }} />
              <Badge
                count={eventsStats.proximos}
                style={{ marginLeft: 5 }}
              />
            </span>
          }
          key="audiencias"
        >
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Calendario del expediente</h3>
              <div className="space-x-2">
                <Button
                  icon={<CalendarOutlined />}
                  onClick={handleVerCalendario}
                >
                  Ver calendario completo
                </Button>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleNuevoEvento}
                >
                  Nuevo evento
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="stat-card">
                <div className="stat-value">{eventsStats.total}</div>
                <div className="stat-label">Total eventos</div>
              </div>
              <div className="stat-card bg-red-50">
                <div className="stat-value text-red-500">{eventsStats.audiencias}</div>
                <div className="stat-label">Audiencias</div>
              </div>
              <div className="stat-card bg-orange-50">
                <div className="stat-value text-orange-500">{eventsStats.vencimientos}</div>
                <div className="stat-label">Vencimientos</div>
              </div>
              <div className="stat-card bg-green-50">
                <div className="stat-value text-green-500">{eventsStats.reuniones}</div>
                <div className="stat-label">Reuniones</div>
              </div>
            </div>

            {loadingEvents ? (
              <div className="text-center p-4">
                <Spin />
                <p className="mt-2">Cargando eventos...</p>
              </div>
            ) : errorEvents ? (
              <Alert
                message="Error"
                description={errorEvents}
                type="error"
                showIcon
              />
            ) : events.length === 0 ? (
              <Alert
                message="Sin eventos"
                description="No hay eventos programados para este expediente."
                type="info"
                showIcon
                action={
                  <Button type="primary" size="small" onClick={handleNuevoEvento}>
                    Crear evento
                  </Button>
                }
              />
            ) : (
              <Table
                dataSource={events}
                columns={eventosColumns}
                rowKey="id"
                pagination={false}
              />
            )}
          </div>
        </TabPane>

        <TabPane
          tab={
            <span>
              Documentos
              <FileOutlined style={{ marginLeft: 8 }} />
            </span>
          }
          key="documentos"
        >
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <Alert
              message="Próximamente"
              description="El módulo de documentos estará disponible próximamente"
              type="info"
              showIcon
            />
          </div>
        </TabPane>

        <TabPane
          tab={
            <span>
              Pagos y Gastos
              <CalendarOutlined style={{ marginLeft: 8 }} />
            </span>
          }
          key="tesoreria"
        >
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <Alert
              message="Próximamente"
              description="El módulo de pagos y gastos estará disponible próximamente"
              type="info"
              showIcon
            />
          </div>
        </TabPane>
      </Tabs>

      {/* Modal para crear/editar eventos */}
      <EventModal
        isOpen={showEventModal}
        onClose={handleCloseEventModal}
        event={selectedEvent}
        onSave={handleGuardarEvento}
        onDelete={handleEliminarEvento}
      />
    </div>
  );
};

export default DetalleExpediente;
