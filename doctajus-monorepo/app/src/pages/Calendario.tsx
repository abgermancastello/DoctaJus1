import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, momentLocalizer, Views, View } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useCalendarStore, CalendarEvent, DateRangeType } from '../stores/calendarStore';
import { useExpedienteStore } from '../stores/expedienteStore';
import { Expediente } from '../types';
import { useNavigate } from 'react-router-dom';
import EventModal from '../components/calendar/EventModal';
import {
  Button,
  Card,
  Tooltip,
  Select,
  Tag,
  Switch,
  Input,
  Space,
  DatePicker,
  Divider,
  Badge,
  Skeleton,
  Popover,
  Radio,
  Alert,
  Drawer,
  Row,
  Col,
  Typography,
  Empty
} from 'antd';
import {
  PlusOutlined,
  FilterOutlined,
  LeftOutlined,
  RightOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  SearchOutlined,
  TagOutlined,
  SettingOutlined,
  InfoCircleOutlined,
  UnorderedListOutlined,
  FileTextOutlined,
  LoadingOutlined,
  BellOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useAccessibility } from '../components/ui/AccessibilityProvider';
import LoadingOverlay from '../components/ui/LoadingOverlay';

// Configuración de localización para español
moment.locale('es');
const localizer = momentLocalizer(moment);
const { RangePicker } = DatePicker;
const { Option } = Select;
const { Title, Text } = Typography;

// Mensajes en español para el calendario
const messages = {
  allDay: 'Todo el día',
  previous: 'Anterior',
  next: 'Siguiente',
  today: 'Hoy',
  month: 'Mes',
  week: 'Semana',
  day: 'Día',
  agenda: 'Agenda',
  date: 'Fecha',
  time: 'Hora',
  event: 'Evento',
  showMore: (total: number) => `+ Ver más (${total})`
};

// Actualizar el tipo DateRangeType para incluir 'personalizado'
type ExtendedDateRangeType = DateRangeType | 'personalizado';

// Componente personalizado para renderizar eventos
interface EventProps {
  event: CalendarEvent;
  expediente?: Expediente | null;
  onClick: () => void;
  onNavigateToExpediente: (id: string) => void;
}

const EventComponent: React.FC<EventProps> = ({ event, expediente, onClick, onNavigateToExpediente }) => {
  const handleExpedienteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (expediente) {
      onNavigateToExpediente(expediente.id);
    }
  };

  const getColorByTipo = (tipo: string) => {
    switch (tipo) {
      case 'audiencia': return 'error';
      case 'vencimiento': return 'warning';
      case 'reunion': return 'success';
      case 'otro': return 'processing';
      default: return 'default';
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'audiencia': return 'Audiencia';
      case 'vencimiento': return 'Vencimiento';
      case 'reunion': return 'Reunión';
      case 'otro': return 'Otro';
      default: return tipo;
    }
  };

  return (
    <div
      onClick={onClick}
      className={`evento-container ${expediente ? 'evento-with-expediente' : ''}`}
      role="button"
      aria-label={`Evento: ${event.title}${expediente ? ` relacionado con expediente ${expediente.numero}` : ''}`}
    >
      <div className="evento-titulo">
        <span>{event.title}</span>
      </div>
      {event.ubicacion && (
        <div className="evento-ubicacion">
          <small>📍 {event.ubicacion}</small>
        </div>
      )}
      <div className="evento-meta">
        <Tag color={getColorByTipo(event.tipo)} className="evento-tipo">
          {getTipoLabel(event.tipo)}
        </Tag>
        {expediente && (
          <Tooltip title={`Ver expediente: ${expediente.titulo}`}>
            <Tag
              color="blue"
              className="expediente-badge"
              onClick={handleExpedienteClick}
              icon={<FileTextOutlined />}
            >
              Exp. {expediente.numero}
            </Tag>
          </Tooltip>
        )}
      </div>
    </div>
  );
};

const Calendario = () => {
  // Accesibilidad
  const { reducedMotion } = useAccessibility();

  // Navegación
  const navigate = useNavigate();

  // Usando los stores
  const {
    events,
    filteredEvents,
    filtros,
    loading,
    error,
    updateFilters,
    setDateRange,
    setSearchText,
    resetFilters,
    fetchEvents,
    addEvent,
    updateEvent,
    deleteEvent
  } = useCalendarStore();

  const {
    expedientes,
    isLoading: loadingExpedientes,
    fetchExpedientes
  } = useExpedienteStore();

  // Estado para el modal de nuevo evento
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Estados para controlar el calendario
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<string>(Views.MONTH);
  const [selectedDateRange, setSelectedDateRange] = useState<ExtendedDateRangeType>('all');
  const [customDateRange, setCustomDateRange] = useState<[Date, Date] | null>(null);

  // Cargar eventos y expedientes cuando el componente se monte
  useEffect(() => {
    fetchEvents();
    fetchExpedientes();
  }, [fetchEvents, fetchExpedientes]);

  // Funciones para manejar eventos
  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    // Crear un evento temporal para el modal
    setSelectedEvent({
      id: 0, // ID temporal
      title: '',
      start,
      end,
      tipo: 'reunion',
      descripcion: '',
    });
    setShowModal(true);
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowModal(true);
  };

  // Función para navegar a un expediente
  const handleNavigateToExpediente = (expedienteId: string) => {
    navigate(`/expedientes/${expedienteId}`);
  };

  // Manejar cambios en los filtros
  const handleFilterChange = (tipo: keyof typeof filtros) => {
    updateFilters({ [tipo]: !filtros[tipo] });
  };

  // Manejar guardado de evento
  const handleSaveEvent = (eventData: Omit<CalendarEvent, 'id'> | CalendarEvent) => {
    if ('id' in eventData && eventData.id !== 0) {
      // Es una actualización
      updateEvent(eventData.id, eventData);
    } else {
      // Es un nuevo evento
      addEvent(eventData);
    }
    setShowModal(false);
    setSelectedEvent(null);
  };

  // Manejar cierre del modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedEvent(null);
  };

  // Manejar eliminación de evento
  const handleDeleteEvent = (id: number) => {
    deleteEvent(id);
  };

  // Cambiar el rango de fechas
  const handleDateRangeChange = (value: ExtendedDateRangeType) => {
    setSelectedDateRange(value);
    if (value === 'personalizado') {
      // No hacer nada aquí, se maneja en el RangePicker
      return;
    }
    setDateRange(value as DateRangeType);
  };

  // Cambiar el expediente seleccionado
  const handleExpedienteFilterChange = (value: string | null) => {
    updateFilters({ expedienteId: value });
  };

  // Personalizar estilos según el tipo de evento
  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = '#1890ff'; // Color primario por defecto

    switch (event.tipo) {
      case 'audiencia':
        backgroundColor = '#f5222d'; // Rojo para audiencias
        break;
      case 'vencimiento':
        backgroundColor = '#faad14'; // Naranja para vencimientos
        break;
      case 'reunion':
        backgroundColor = '#52c41a'; // Verde para reuniones
        break;
      case 'otro':
        backgroundColor = '#722ed1'; // Morado para otros
        break;
      default:
        break;
    }

    const style = {
      backgroundColor,
      borderRadius: '4px',
      opacity: 0.9,
      color: 'white',
      border: '0px',
      display: 'block',
      overflow: 'hidden'
    };

    // Si tiene expediente asociado, agregar estilo especial
    if (event.expedienteId) {
      return {
        style,
        className: 'evento-with-expediente'
      };
    }

    return { style };
  };

  // Componente para renderizar eventos personalizados
  const eventComponent = ({ event }: { event: CalendarEvent }) => {
    // Buscar el expediente asociado, si existe
    const expediente = event.expedienteId
      ? expedientes.find(exp => exp.id === event.expedienteId?.toString())
      : null;

    return (
      <EventComponent
        event={event}
        expediente={expediente}
        onClick={() => handleSelectEvent(event)}
        onNavigateToExpediente={handleNavigateToExpediente}
      />
    );
  };

  // Opciones de visualización
  const views = [Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA];

  // Funciones para navegar por el calendario manualmente
  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const goToPrevious = useCallback(() => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);

      if (currentView === Views.MONTH) {
        newDate.setMonth(newDate.getMonth() - 1);
      } else if (currentView === Views.WEEK) {
        newDate.setDate(newDate.getDate() - 7);
      } else if (currentView === Views.DAY) {
        newDate.setDate(newDate.getDate() - 1);
      } else if (currentView === Views.AGENDA) {
        newDate.setDate(newDate.getDate() - 30);
      }

      return newDate;
    });
  }, [currentView]);

  const goToNext = useCallback(() => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);

      if (currentView === Views.MONTH) {
        newDate.setMonth(newDate.getMonth() + 1);
      } else if (currentView === Views.WEEK) {
        newDate.setDate(newDate.getDate() + 7);
      } else if (currentView === Views.DAY) {
        newDate.setDate(newDate.getDate() + 1);
      } else if (currentView === Views.AGENDA) {
        newDate.setDate(newDate.getDate() + 30);
      }

      return newDate;
    });
  }, [currentView]);

  const changeView = (view: string) => {
    setCurrentView(view);
  };

  // Estadísticas de eventos
  const eventStats = {
    audiencias: events.filter(e => e.tipo === 'audiencia').length,
    vencimientos: events.filter(e => e.tipo === 'vencimiento').length,
    reuniones: events.filter(e => e.tipo === 'reunion').length,
    otros: events.filter(e => e.tipo === 'otro').length,
    hoy: events.filter(e => moment(e.start).isSame(new Date(), 'day')).length,
    proximos: events.filter(e =>
      moment(e.start).isAfter(new Date()) &&
      moment(e.start).isBefore(moment().add(7, 'days'))
    ).length
  };

  // Eventos destacados para hoy y próximos días
  const eventosHoy = events.filter(e => moment(e.start).isSame(new Date(), 'day'))
    .sort((a, b) => moment(a.start).diff(moment(b.start)));

  const eventosProximos = events.filter(e =>
    moment(e.start).isAfter(new Date()) &&
    moment(e.start).isBefore(moment().add(7, 'days'))
  ).sort((a, b) => moment(a.start).diff(moment(b.start)));

  // Componente para la navegación del calendario mejorada
  const renderCalendarNavigation = () => (
    <div className="flex flex-wrap items-center gap-3 mb-4">
      <div className="flex items-center">
        <Button
          type="default"
          icon={<LeftOutlined />}
          onClick={goToPrevious}
          aria-label="Periodo anterior"
          className="hover:bg-primary-50"
        />
        <Button
          type="primary"
          onClick={goToToday}
          className="mx-2"
          aria-label="Ir a hoy"
        >
          Hoy
        </Button>
        <Button
          type="default"
          icon={<RightOutlined />}
          onClick={goToNext}
          aria-label="Periodo siguiente"
          className="hover:bg-primary-50"
        />
      </div>

      <div className="text-lg font-medium text-primary-800 mx-4">
        {currentRange}
      </div>

      <div className="ml-auto">
        <Radio.Group
          value={currentView}
          onChange={(e) => changeView(e.target.value)}
          optionType="button"
          buttonStyle="solid"
        >
          <Radio.Button value={Views.MONTH}>
            <CalendarOutlined className="mr-1" /> Mes
          </Radio.Button>
          <Radio.Button value={Views.WEEK}>
            <UnorderedListOutlined className="mr-1" /> Semana
          </Radio.Button>
          <Radio.Button value={Views.DAY}>
            <ClockCircleOutlined className="mr-1" /> Día
          </Radio.Button>
          <Radio.Button value={Views.AGENDA}>
            <FileTextOutlined className="mr-1" /> Agenda
          </Radio.Button>
        </Radio.Group>
      </div>
    </div>
  );

  // Calculando el rango de fechas formateado para mostrar
  const currentRange = (() => {
    if (currentView === Views.MONTH) {
      return moment(currentDate).format('MMMM YYYY');
    } else if (currentView === Views.WEEK) {
      const start = moment(currentDate).startOf('week').format('D MMM');
      const end = moment(currentDate).endOf('week').format('D MMM YYYY');
      return `${start} - ${end}`;
    } else if (currentView === Views.DAY) {
      return moment(currentDate).format('D [de] MMMM YYYY');
    } else {
      return moment(currentDate).format('MMMM YYYY');
    }
  })();

  // Renderizar EventModal solo cuando showModal es true
  const renderEventModal = () => {
    if (!showModal) return null;

    return (
      <EventModal
        isOpen={showModal}
        onClose={handleCloseModal}
        event={selectedEvent}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
      />
    );
  };

  // Componente para el panel de estadísticas de eventos
  const renderEstadisticasPanel = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card className="shadow-sm hover:shadow transition-shadow duration-200">
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center text-primary-500 mr-4">
            <CalendarOutlined style={{ fontSize: '20px' }} />
          </div>
          <div>
            <Text type="secondary">Total de eventos</Text>
            <Title level={3} className="!m-0">{events.length}</Title>
          </div>
        </div>
      </Card>

      <Card className="shadow-sm hover:shadow transition-shadow duration-200">
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-full bg-warning-50 flex items-center justify-center text-warning-500 mr-4">
            <ClockCircleOutlined style={{ fontSize: '20px' }} />
          </div>
          <div>
            <Text type="secondary">Eventos para hoy</Text>
            <Title level={3} className="!m-0">{eventStats.hoy}</Title>
          </div>
        </div>
      </Card>

      <Card className="shadow-sm hover:shadow transition-shadow duration-200">
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-full bg-success-50 flex items-center justify-center text-success-500 mr-4">
            <BellOutlined style={{ fontSize: '20px' }} />
          </div>
          <div>
            <Text type="secondary">Próximos 7 días</Text>
            <Title level={3} className="!m-0">{eventStats.proximos}</Title>
          </div>
        </div>
      </Card>
    </div>
  );

  // Componente para mostrar eventos del día
  const renderEventosDelDia = () => {
    const hoy = new Date();
    const eventosHoy = events.filter(e =>
      moment(e.start).isSame(hoy, 'day')
    ).sort((a, b) =>
      moment(a.start).diff(moment(b.start))
    );

    return (
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <Title level={5} className="!m-0 mr-2">
            Eventos para hoy
          </Title>
          <Tag color="processing">{eventosHoy.length} eventos</Tag>
        </div>

        {eventosHoy.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No hay eventos programados para hoy"
          />
        ) : (
          <div className="space-y-3">
            {eventosHoy.map(evento => {
              // Buscar expediente asociado
              const expediente = evento.expedienteId
                ? expedientes.find(exp => exp.id === evento.expedienteId?.toString())
                : null;

              return (
                <Card
                  key={evento.id}
                  size="small"
                  className="shadow-sm hover:shadow-md transition-shadow"
                  style={{ borderLeft: `4px solid ${eventStyleGetter(evento).style.backgroundColor}` }}
                >
                  <div className="flex justify-between">
                    <div>
                      <div className="font-medium">{evento.title}</div>
                      <div className="text-xs text-gray-500">
                        {moment(evento.start).format('HH:mm')} - {moment(evento.end).format('HH:mm')}
                      </div>
                      {evento.ubicacion && (
                        <div className="text-xs mt-1">
                          <Tag>📍 {evento.ubicacion}</Tag>
                        </div>
                      )}
                    </div>
                    <div>
                      <Button
                        type="text"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => handleSelectEvent(evento)}
                      />
                    </div>
                  </div>
                  {expediente && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <Text type="secondary" className="text-xs">
                        Expediente:
                        <Button
                          type="link"
                          size="small"
                          className="p-0 ml-1"
                          onClick={() => handleNavigateToExpediente(expediente.id)}
                        >
                          {expediente.numero}: {expediente.titulo}
                        </Button>
                      </Text>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="page bg-background-default min-h-screen pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderEventModal()}

        <Drawer
          title={
            <div className="flex items-center">
              <FilterOutlined className="mr-2" />
              <span>Filtros del Calendario</span>
            </div>
          }
          placement="right"
          closable={true}
          onClose={() => setShowFilters(false)}
          open={showFilters}
          width={320}
        >
          <div className="space-y-6">
            <div>
              <Title level={5} className="mb-2">Tipos de eventos</Title>
              <Space direction="vertical" className="w-full">
                <div className="flex items-center justify-between">
                  <Space>
                    <Badge color="#f5222d" />
                    <span>Audiencias</span>
                  </Space>
                  <Switch
                    checked={filtros.audiencias}
                    onChange={() => handleFilterChange('audiencias')}
                    aria-label="Mostrar audiencias"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Space>
                    <Badge color="#faad14" />
                    <span>Vencimientos</span>
                  </Space>
                  <Switch
                    checked={filtros.vencimientos}
                    onChange={() => handleFilterChange('vencimientos')}
                    aria-label="Mostrar vencimientos"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Space>
                    <Badge color="#52c41a" />
                    <span>Reuniones</span>
                  </Space>
                  <Switch
                    checked={filtros.reuniones}
                    onChange={() => handleFilterChange('reuniones')}
                    aria-label="Mostrar reuniones"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Space>
                    <Badge color="#722ed1" />
                    <span>Otros</span>
                  </Space>
                  <Switch
                    checked={filtros.otros}
                    onChange={() => handleFilterChange('otros')}
                    aria-label="Mostrar otros eventos"
                  />
                </div>
              </Space>
            </div>

            <Divider />

            <div>
              <Title level={5} className="mb-2">Filtro por Expediente</Title>
              <Select
                placeholder="Seleccionar expediente"
                style={{ width: '100%' }}
                allowClear
                showSearch
                optionFilterProp="children"
                value={filtros.expedienteId || undefined}
                onChange={handleExpedienteFilterChange}
                loading={loadingExpedientes}
              >
                {expedientes.map(exp => (
                  <Option key={exp.id} value={exp.id}>
                    {exp.numero}: {exp.titulo}
                  </Option>
                ))}
              </Select>
            </div>

            <Divider />

            <div>
              <Title level={5} className="mb-2">Rango de fechas</Title>
              <Space direction="vertical" className="w-full">
                <Radio.Group
                  value={selectedDateRange}
                  onChange={(e) => handleDateRangeChange(e.target.value as ExtendedDateRangeType)}
                  buttonStyle="solid"
                  className="w-full"
                >
                  <Space direction="vertical" className="w-full">
                    <Radio.Button value="semana" className="w-full text-center">Esta semana</Radio.Button>
                    <Radio.Button value="mes" className="w-full text-center">Este mes</Radio.Button>
                    <Radio.Button value="trimestre" className="w-full text-center">Este trimestre</Radio.Button>
                    <Radio.Button value="año" className="w-full text-center">Este año</Radio.Button>
                    <Radio.Button value="personalizado" className="w-full text-center">Personalizado</Radio.Button>
                  </Space>
                </Radio.Group>

                {selectedDateRange === 'personalizado' && (
                  <div className="mt-3">
                    <RangePicker
                      style={{ width: '100%' }}
                      onChange={(dates) => {
                        if (dates && dates[0] && dates[1]) {
                          setCustomDateRange([dates[0].toDate(), dates[1].toDate()]);
                          setDateRange('custom', dates[0].toDate(), dates[1].toDate());
                        }
                      }}
                    />
                  </div>
                )}
              </Space>
            </div>

            <Divider />

            <div>
              <Title level={5} className="mb-2">Opciones de visualización</Title>
              <Space direction="vertical" className="w-full">
                <div className="flex items-center justify-between">
                  <span>Eventos pasados</span>
                  <Switch
                    checked={filtros.dateRange.type === 'all'}
                    onChange={(checked) => updateFilters({
                      dateRange: {
                        ...filtros.dateRange,
                        type: checked ? 'all' : 'today'
                      }
                    })}
                    aria-label="Mostrar eventos pasados"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span>Solo eventos con recordatorio</span>
                  <Switch
                    checked={filtros.searchText?.includes('recordatorio')}
                    onChange={(checked) => updateFilters({
                      searchText: checked ? 'recordatorio' : ''
                    })}
                    aria-label="Mostrar solo eventos con recordatorio"
                  />
                </div>
              </Space>
            </div>

            <Divider />

            <div className="flex justify-end space-x-2">
              <Button onClick={() => resetFilters()}>
                Restablecer
              </Button>
              <Button type="primary" onClick={() => setShowFilters(false)}>
                Aplicar
              </Button>
            </div>
          </div>
        </Drawer>

        <Card className="shadow-md rounded-lg overflow-hidden mb-6">
          <div className="flex justify-between items-center flex-wrap gap-4 mb-4">
            <div>
              <Title level={4} className="!mb-1 text-primary-700">Calendario de Eventos</Title>
              <Text type="secondary">Gestiona tus audiencias, vencimientos y reuniones</Text>
            </div>
            <div className="flex gap-2">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setSelectedEvent(null);
                  setShowModal(true);
                }}
                aria-label="Añadir nuevo evento"
              >
                Nuevo Evento
              </Button>
              <Button
                icon={<FilterOutlined />}
                onClick={() => setShowFilters(true)}
                aria-label="Mostrar filtros"
              >
                Filtros
              </Button>
            </div>
          </div>

          {renderEstadisticasPanel()}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="md:col-span-2">
              {renderCalendarNavigation()}
            </div>
            <div>
              {renderEventosDelDia()}
            </div>
          </div>

          {/* Resto del componente calendario */}
          <div className="calendario-content">
            {loading ? (
              <LoadingOverlay mensaje="Cargando eventos..." />
            ) : error ? (
              <Alert
                message="Error al cargar eventos"
                description={error}
                type="error"
                showIcon
                action={
                  <Button onClick={fetchEvents} type="primary">
                    Reintentar
                  </Button>
                }
              />
            ) : (
              <Calendar
                localizer={localizer}
                events={filteredEvents}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 600 }}
                views={views}
                view={currentView}
                date={currentDate}
                messages={messages}
                onNavigate={setCurrentDate}
                onView={setCurrentView}
                eventPropGetter={eventStyleGetter}
                onSelectEvent={(event: any) => handleSelectEvent(event as CalendarEvent)}
                onSelectSlot={handleSelectSlot}
                selectable
                popup
                components={{
                  event: eventComponent
                }}
                className={`custom-calendar ${reducedMotion ? 'reduce-motion' : ''}`}
              />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

// Función auxiliar para obtener el color según el tipo de evento
function getBadgeColor(tipo: string): string {
  switch (tipo) {
    case 'audiencia': return '#f5222d';
    case 'vencimiento': return '#faad14';
    case 'reunion': return '#52c41a';
    case 'otro': return '#722ed1';
    default: return '#1890ff';
  }
}

export default Calendario;
