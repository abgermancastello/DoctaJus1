import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTareaStore } from '../stores/tareaStore';
import { useUIStore } from '../stores/uiStore';
import { EstadoTarea, PrioridadTarea, Tarea, Etiqueta } from '../types';
import TareaForm from '../components/forms/TareaForm';
import {
  DeleteOutlined,
  ExclamationCircleOutlined,
  EditOutlined,
  CheckOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  StopOutlined,
  TagOutlined,
  PlusOutlined,
  CloseOutlined,
  BellOutlined,
  ShareAltOutlined,
  CommentOutlined,
  CalendarOutlined,
  FilterOutlined,
  SearchOutlined,
  InfoCircleOutlined,
  UnorderedListOutlined,
  AppstoreOutlined,
  SettingOutlined,
  EllipsisOutlined,
  EyeOutlined,
  SortAscendingOutlined,
  UserOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import {
  Button,
  Popconfirm,
  Tooltip,
  Modal,
  notification,
  Select,
  Dropdown,
  Menu,
  Tag,
  Popover,
  Input,
  Skeleton,
  Empty,
  Switch,
  Badge,
  Tabs,
  Divider,
  Space,
  Card,
  Avatar,
  Typography
} from 'antd';
import { useAccessibility } from '../components/ui/AccessibilityProvider';
import NotificacionesConfig, { NotificacionesConfig as NotificacionesConfigType, defaultNotificacionesConfig } from '../components/ui/NotificacionesConfig';
import CompartirTareaModal from '../components/ui/CompartirTareaModal';
import ComentariosTarea from '../components/ui/ComentariosTarea';
import EtiquetasManager from '../components/ui/EtiquetasManager';
import LoadingOverlay from '../components/ui/LoadingOverlay';

const { confirm } = Modal;
const { Option } = Select;
const { TabPane } = Tabs;
const { Text, Paragraph, Title } = Typography;

const Tareas = () => {
  const {
    tareas,
    isLoading,
    error,
    fetchTareas,
    filterByEstado,
    filterByPrioridad,
    filterByEtiqueta,
    searchTareas,
    getTareasPendientes,
    getTareasVencidas,
    deleteTarea,
    getTarea,
    updateTarea,
    etiquetas,
    fetchEtiquetas,
    addEtiquetaToTarea,
    removeEtiquetaFromTarea,
    getTareasProximasAVencer,
    verificarNotificacionesPendientes
  } = useTareaStore();

  const { openModal, closeModal } = useUIStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<EstadoTarea | 'TODOS'>('TODOS');
  const [filtroPrioridad, setFiltroPrioridad] = useState<PrioridadTarea | 'TODOS'>('TODOS');
  const [filtroEtiqueta, setFiltroEtiqueta] = useState<string | 'TODOS'>('TODOS');
  const [mostrarVencidas, setMostrarVencidas] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [eliminandoTarea, setEliminandoTarea] = useState<string | null>(null);
  const [editandoTarea, setEditandoTarea] = useState<string | null>(null);
  const [gestionandoEtiquetas, setGestionandoEtiquetas] = useState<string | null>(null);
  const [tareasProximasAVencer, setTareasProximasAVencer] = useState<Tarea[]>([]);
  const [verificandoRecordatorios, setVerificandoRecordatorios] = useState(false);
  const [mostrarConfigNotificaciones, setMostrarConfigNotificaciones] = useState(false);
  const [configuracionNotificaciones, setConfiguracionNotificaciones] = useState<NotificacionesConfigType>(
    // Si existe configuración en localStorage, utilizarla; si no, usar valores por defecto
    JSON.parse(localStorage.getItem('notificacionesConfig') || JSON.stringify(defaultNotificacionesConfig))
  );
  const [compartirTareaId, setCompartirTareaId] = useState<string | null>(null);
  const [compartirTareaTitulo, setCompartirTareaTitulo] = useState('');
  const [mostrarComentarios, setMostrarComentarios] = useState<string | null>(null);
  const [usuarioActualId, setUsuarioActualId] = useState('1'); // ID de usuario actual simulado
  const [usuarioActualNombre, setUsuarioActualNombre] = useState('Carlos Rodríguez'); // Nombre simulado

  const navigate = useNavigate();
  const { highContrast, largeText } = useAccessibility();

  useEffect(() => {
    fetchTareas();
    fetchEtiquetas();
  }, [fetchTareas, fetchEtiquetas]);

  // Verificar tareas próximas a vencer al cargar la página
  useEffect(() => {
    const verificarTareasPorVencer = async () => {
      try {
        setVerificandoRecordatorios(true);
        // Verificar notificaciones de tareas que vencen usando la configuración guardada
        await verificarNotificacionesPendientes(configuracionNotificaciones.diasAntelacion);

        // Obtener tareas próximas a vencer para mostrar en el panel de recordatorios
        const tareasPorVencer = await getTareasProximasAVencer(7); // Mostrar tareas que vencen en la próxima semana
        setTareasProximasAVencer(tareasPorVencer);
      } catch (error) {
        console.error('Error al verificar tareas por vencer:', error);
      } finally {
        setVerificandoRecordatorios(false);
      }
    };

    // Solo ejecutar si las notificaciones están activadas
    if (configuracionNotificaciones.recibirNotificaciones) {
      verificarTareasPorVencer();

      // Verificar periódicamente (cada 30 minutos)
      const intervaloVerificacion = setInterval(() => {
        verificarTareasPorVencer();
      }, 30 * 60 * 1000);

      // Limpiar el intervalo al desmontar
      return () => clearInterval(intervaloVerificacion);
    }
  }, [verificarNotificacionesPendientes, getTareasProximasAVencer, configuracionNotificaciones]);

  // Filtrar tareas según los criterios
  const tareasFiltradas = React.useMemo(() => {
    let resultado = tareas;

    // Aplicar filtro por estado
    if (filtroEstado !== 'TODOS') {
      resultado = filterByEstado(filtroEstado);
    }

    // Aplicar filtro por prioridad
    if (filtroPrioridad !== 'TODOS') {
      resultado = filterByPrioridad(filtroPrioridad);
    }

    // Aplicar filtro por etiqueta
    if (filtroEtiqueta !== 'TODOS') {
      resultado = filterByEtiqueta(filtroEtiqueta);
    }

    // No aplicamos el filtro de vencidas aquí, lo manejamos en un useEffect

    // Aplicar búsqueda
    if (searchTerm.trim()) {
      resultado = searchTareas(searchTerm);
    }

    return resultado;
  }, [
    tareas,
    filtroEstado,
    filtroPrioridad,
    filtroEtiqueta,
    searchTerm,
    filterByEstado,
    filterByPrioridad,
    filterByEtiqueta,
    searchTareas
  ]);

  // Manejar el cambio en mostrarVencidas con un efecto
  React.useEffect(() => {
    if (mostrarVencidas) {
      // Cargamos las tareas vencidas desde la API
      getTareasVencidas();
    } else {
      // Si se desmarca, volvemos a cargar todas las tareas
      fetchTareas();
    }
  }, [mostrarVencidas, getTareasVencidas, fetchTareas]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleFiltroEstado = (value: EstadoTarea | 'TODOS') => {
    setFiltroEstado(value);
  };

  const handleFiltroPrioridad = (value: PrioridadTarea | 'TODOS') => {
    setFiltroPrioridad(value);
  };

  const handleFiltroEtiqueta = (value: string) => {
    setFiltroEtiqueta(value);
  };

  const handleMostrarVencidas = (checked: boolean) => {
    setMostrarVencidas(checked);
  };

  const handleNuevaTarea = () => {
    openModal({
      title: 'Nueva Tarea',
      content: <TareaForm
                isModal={true}
                onSuccess={() => {
                  // Cerrar el modal y refrescar la lista de tareas
                  closeModal();
                  fetchTareas();
                }}
              />,
      confirmText: 'Cerrar',
      onConfirm: () => {
        // Solo cerrar el modal, la acción de guardar está en el formulario
        closeModal();
      }
    });
  };

  // Función para gestionar las etiquetas de una tarea
  const handleGestionarEtiquetas = (tareaId: string) => {
    setGestionandoEtiquetas(tareaId);
  };

  // Función para añadir una etiqueta a una tarea
  const handleAddEtiqueta = async (tareaId: string, etiquetaId: string) => {
    const etiqueta = etiquetas.find(e => e.id === etiquetaId);
    if (!etiqueta) {
      notification.error({
        message: 'Error',
        description: 'Etiqueta no encontrada'
      });
      return;
    }

    const resultado = await addEtiquetaToTarea(tareaId, etiqueta);
    if (resultado) {
      notification.success({
        message: 'Etiqueta añadida',
        description: `Se ha añadido la etiqueta "${etiqueta.nombre}" a la tarea`
      });
      fetchTareas();
    } else {
      notification.error({
        message: 'Error',
        description: 'No se pudo añadir la etiqueta a la tarea'
      });
    }
  };

  // Función para eliminar una etiqueta de una tarea
  const handleRemoveEtiqueta = async (tareaId: string, etiquetaId: string) => {
    const resultado = await removeEtiquetaFromTarea(tareaId, etiquetaId);
    if (resultado) {
      notification.success({
        message: 'Etiqueta eliminada',
        description: 'Se ha eliminado la etiqueta de la tarea'
      });
      fetchTareas();
    } else {
      notification.error({
        message: 'Error',
        description: 'No se pudo eliminar la etiqueta de la tarea'
      });
    }
  };

  // Manejar la edición de una tarea
  const handleEditarTarea = async (id: string) => {
    try {
      console.log('Iniciando edición de tarea:', id);
      setEditandoTarea(id);

      // Obtener los datos actuales de la tarea
      const tarea = await getTarea(id);

      if (!tarea) {
        notification.error({
          message: 'Error',
          description: 'No se pudo obtener la información de la tarea'
        });
        setEditandoTarea(null);
        return;
      }

      console.log('Tarea obtenida para edición:', tarea);

      // Abrir modal con el formulario de edición
      openModal({
        title: 'Editar Tarea',
        content: <TareaForm
                  tareaId={id}
                  isModal={true}
                  onSuccess={() => {
                    // Cerrar el modal y refrescar la lista de tareas
                    closeModal();
                    fetchTareas();
                    notification.success({
                      message: 'Tarea actualizada',
                      description: 'La tarea se ha actualizado correctamente'
                    });
                  }}
                />,
        confirmText: 'Cerrar',
        onConfirm: () => {
          // Solo cerrar el modal, la acción de guardar está en el formulario
          closeModal();
        }
      });
    } catch (error) {
      console.error('Error al iniciar edición:', error);
      notification.error({
        message: 'Error',
        description: 'Ocurrió un error al intentar editar la tarea'
      });
    } finally {
      setEditandoTarea(null);
    }
  };

  // Obtener clases CSS según prioridad
  const getPrioridadClass = (prioridad: PrioridadTarea) => {
    switch (prioridad) {
      case PrioridadTarea.ALTA:
        return 'prioridad-alta';
      case PrioridadTarea.MEDIA:
        return 'prioridad-media';
      case PrioridadTarea.BAJA:
        return 'prioridad-baja';
      default:
        return '';
    }
  };

  // Eliminar una tarea individual
  const handleDeleteTarea = async (id: string, titulo: string) => {
    try {
      console.log('Iniciando eliminación de tarea:', id, titulo);
      setEliminandoTarea(id);

      // Esperar un momento para asegurar que el estado se actualiza
      await new Promise(resolve => setTimeout(resolve, 100));

      console.log('Llamando a deleteTarea en el store');
      const resultado = await deleteTarea(id);
      console.log('Resultado de deleteTarea:', resultado);

      if (resultado) {
        notification.success({
          message: 'Tarea eliminada',
          description: `La tarea "${titulo}" ha sido eliminada correctamente.`
        });

        console.log('Actualizando lista de tareas tras eliminación exitosa');
        // Forzar actualización de la lista de tareas
        setTimeout(() => {
          fetchTareas();
        }, 300);
      } else {
        console.error('Error al eliminar tarea, resultado falso:', id);
        notification.error({
          message: 'Error',
          description: `No se pudo eliminar la tarea "${titulo}".`
        });
      }
    } catch (error) {
      console.error('Error al eliminar tarea:', error);
      notification.error({
        message: 'Error',
        description: `Ocurrió un error al eliminar la tarea "${titulo}".`
      });
    } finally {
      console.log('Completando operación de eliminación, reseteando estado');
      setEliminandoTarea(null);
    }
  };

  // Eliminar todas las tareas vencidas
  const eliminarTareasVencidas = async () => {
    confirm({
      title: '¿Estás seguro de que quieres eliminar todas las tareas vencidas?',
      icon: <ExclamationCircleOutlined />,
      content: 'Todas las tareas cuya fecha de vencimiento ya ha pasado serán eliminadas permanentemente.',
      okText: 'Sí, eliminar todas',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        setDeleteLoading(true);
        try {
          const tareasVencidas = await getTareasVencidas();
          await Promise.all(
            tareasVencidas.map(tarea => deleteTarea(tarea.id))
          );
          notification.success({
            message: 'Tareas eliminadas',
            description: 'Las tareas vencidas han sido eliminadas correctamente.'
          });
          await fetchTareas();
        } catch (error) {
          console.error('Error al eliminar tareas vencidas:', error);
          notification.error({
            message: 'Error',
            description: 'No se pudieron eliminar todas las tareas vencidas.'
          });
        } finally {
          setDeleteLoading(false);
        }
      }
    });
  };

  // Función para cambiar rápidamente el estado de una tarea
  const handleCambioEstado = async (tareaId: string, nuevoEstado: EstadoTarea) => {
    try {
      console.log(`Cambiando estado de tarea ${tareaId} a ${nuevoEstado}`);

      // Obtener los datos actuales de la tarea
      const tarea = await getTarea(tareaId);

      if (!tarea) {
        notification.error({
          message: 'Error',
          description: 'No se pudo obtener la información de la tarea'
        });
        return;
      }

      // Preparar los datos de actualización
      let actualizacion: Partial<Tarea> = {
        estado: nuevoEstado
      };

      // Manejar la fecha de completado según el estado
      if (nuevoEstado === EstadoTarea.COMPLETADA) {
        // Si se marca como completada, agregar la fecha actual
        actualizacion.fechaCompletada = new Date().toISOString();
      } else if (tarea.fechaCompletada) {
        // Si tenía fecha de completado pero ya no está completada, eliminar la fecha
        actualizacion.fechaCompletada = undefined;
      }

      // Actualizar la tarea
      const tareaActualizada = await updateTarea(tareaId, actualizacion);

      if (tareaActualizada) {
        notification.success({
          message: 'Estado actualizado',
          description: `La tarea ahora está ${nuevoEstado}`
        });

        // Recargar la lista de tareas
        fetchTareas();
      } else {
        notification.error({
          message: 'Error',
          description: 'No se pudo actualizar el estado de la tarea'
        });
      }
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      notification.error({
        message: 'Error',
        description: 'Ocurrió un error al cambiar el estado de la tarea'
      });
    }
  };

  // Función para obtener el ícono correspondiente al estado
  const getEstadoIcon = (estado: EstadoTarea) => {
    switch (estado) {
      case EstadoTarea.PENDIENTE:
        return <ClockCircleOutlined style={{ color: '#f57c00' }} />;
      case EstadoTarea.EN_PROGRESO:
        return <SyncOutlined spin style={{ color: '#1976d2' }} />;
      case EstadoTarea.COMPLETADA:
        return <CheckOutlined style={{ color: '#388e3c' }} />;
      case EstadoTarea.CANCELADA:
        return <StopOutlined style={{ color: '#757575' }} />;
      default:
        return null;
    }
  };

  // Función para obtener el color según el estado
  const getEstadoColor = (estado: EstadoTarea) => {
    switch (estado) {
      case EstadoTarea.PENDIENTE:
        return 'warning';
      case EstadoTarea.EN_PROGRESO:
        return 'processing';
      case EstadoTarea.COMPLETADA:
        return 'success';
      case EstadoTarea.CANCELADA:
        return 'error';
      default:
        return 'default';
    }
  };

  // Formatear fecha para mostrar
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Renderizar el contenido del popover de etiquetas
  const renderEtiquetasPopover = (tarea: Tarea) => {
    // Obtener las etiquetas ya asignadas a la tarea
    const etiquetasAsignadas = tarea.etiquetas || [];
    const etiquetasDisponibles = etiquetas.filter(
      etiqueta => !etiquetasAsignadas.some(e => e.id === etiqueta.id)
    );

    return (
      <div className="etiquetas-popover">
        <h4>Etiquetas asignadas</h4>
        <div className="etiquetas-asignadas">
          {etiquetasAsignadas.length === 0 ? (
            <p className="no-etiquetas">No hay etiquetas asignadas</p>
          ) : (
            <div className="etiquetas-lista">
              {etiquetasAsignadas.map(etiqueta => (
                <Tag
                  key={etiqueta.id}
                  color={etiqueta.color}
                  closable
                  onClose={() => handleRemoveEtiqueta(tarea.id, etiqueta.id)}
                >
                  {etiqueta.nombre}
                </Tag>
              ))}
            </div>
          )}
        </div>
        <h4>Añadir etiqueta</h4>
        {etiquetasDisponibles.length === 0 ? (
          <p className="no-etiquetas">No hay más etiquetas disponibles</p>
        ) : (
          <div className="etiquetas-disponibles">
            {etiquetasDisponibles.map(etiqueta => (
              <Tag
                key={etiqueta.id}
                color={etiqueta.color}
                onClick={() => handleAddEtiqueta(tarea.id, etiqueta.id)}
                className="etiqueta-añadible"
              >
                <PlusOutlined /> {etiqueta.nombre}
              </Tag>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Abrir configuración de notificaciones
  const handleAbrirConfigNotificaciones = () => {
    setMostrarConfigNotificaciones(true);
  };

  // Cerrar configuración de notificaciones
  const handleCerrarConfigNotificaciones = () => {
    setMostrarConfigNotificaciones(false);
  };

  // Guardar configuración de notificaciones
  const handleGuardarConfigNotificaciones = (config: NotificacionesConfigType) => {
    console.log('Guardando configuración de notificaciones:', config);

    // Guardar en localStorage
    localStorage.setItem('notificacionesConfig', JSON.stringify(config));

    // Actualizar estado
    setConfiguracionNotificaciones(config);

    // Verificar notificaciones con la nueva configuración
    verificarNotificacionesPendientes(config.diasAntelacion);

    // Mostrar notificación de confirmación
    notification.success({
      message: 'Configuración guardada',
      description: 'La configuración de notificaciones se ha guardado correctamente'
    });
  };

  // Abrir el modal para compartir tarea
  const handleCompartirTarea = (tarea: Tarea) => {
    setCompartirTareaId(tarea.id);
    setCompartirTareaTitulo(tarea.titulo);
  };

  // Cerrar el modal de compartir tarea
  const handleCerrarCompartirModal = () => {
    setCompartirTareaId(null);
  };

  // Alternar la visualización de comentarios
  const handleToggleComentarios = (tareaId: string) => {
    setMostrarComentarios(mostrarComentarios === tareaId ? null : tareaId);
  };

  // Renderizar panel de recordatorios
  const renderRecordatoriosPanel = () => {
    return (
      <Card
        className="mb-6 shadow-md"
        title={
          <div className="flex items-center">
            <BellOutlined className="mr-2 text-warning-500" />
            <span className="text-lg font-medium">Recordatorios y próximos vencimientos</span>
          </div>
        }
        extra={
          <Button
            type="link"
            onClick={handleAbrirConfigNotificaciones}
            icon={<SettingOutlined />}
          >
            Configurar
          </Button>
        }
      >
        {verificandoRecordatorios ? (
          <div className="py-4">
            <LoadingOverlay mensaje="Verificando recordatorios..." />
          </div>
        ) : tareasProximasAVencer.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No hay tareas próximas a vencer"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {tareasProximasAVencer.slice(0, 3).map(tarea => (
              <Card
                key={tarea.id}
                className="border border-warning-100 shadow-sm hover:shadow-md transition-shadow"
                size="small"
              >
                <div className="flex justify-between">
                  <div className="flex-grow">
                    <div className="font-medium">{tarea.titulo}</div>
                    <div className="text-sm text-text-secondary mt-1">
                      <ClockCircleOutlined className="mr-1" />
                      Vence: {formatDate(tarea.fechaVencimiento)}
                    </div>
                  </div>
                  <Tag color={getPrioridadClass(tarea.prioridad)} className="ml-2 self-start">
                    {tarea.prioridad}
                  </Tag>
                </div>

                <div className="mt-2 pt-2 border-t border-divider-light">
                  <div className="flex justify-between">
                    <Tag color={getEstadoColor(tarea.estado)}>
                      {tarea.estado}
                    </Tag>
                    <Button
                      type="link"
                      size="small"
                      className="p-0"
                      onClick={() => handleVerDetalle(tarea.id)}
                    >
                      Ver detalles
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
            {tareasProximasAVencer.length > 3 && (
              <div className="bg-white p-3 rounded border border-warning-100 shadow-sm flex items-center justify-center">
                <Button
                  type="link"
                  onClick={() => {
                    setFiltroEstado('TODOS');
                    setFiltroPrioridad('TODOS');
                    setFiltroEtiqueta('TODOS');
                    setMostrarVencidas(true);
                  }}
                >
                  Ver {tareasProximasAVencer.length - 3} más
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>
    );
  };

  // Renderizar filtros avanzados
  const renderFiltrosAvanzados = () => (
    <Card className="mb-6 shadow-md">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Búsqueda */}
        <div>
          <Input
            placeholder="Buscar tareas..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            prefix={<SearchOutlined className="text-gray-400" />}
            allowClear
            size="large"
            className="w-full"
          />
        </div>

        {/* Filtro por Estado */}
        <div>
          <Select
            placeholder="Estado"
            value={filtroEstado}
            onChange={handleFiltroEstado}
            style={{ width: '100%' }}
            size="large"
          >
            <Option value="TODOS">Todos los estados</Option>
            <Option value={EstadoTarea.PENDIENTE}>Pendiente</Option>
            <Option value={EstadoTarea.EN_PROGRESO}>En progreso</Option>
            <Option value={EstadoTarea.COMPLETADA}>Completada</Option>
            <Option value={EstadoTarea.CANCELADA}>Cancelada</Option>
          </Select>
        </div>

        {/* Filtro por Prioridad */}
        <div>
          <Select
            placeholder="Prioridad"
            value={filtroPrioridad}
            onChange={handleFiltroPrioridad}
            style={{ width: '100%' }}
            size="large"
          >
            <Option value="TODOS">Todas las prioridades</Option>
            <Option value={PrioridadTarea.ALTA}>Alta</Option>
            <Option value={PrioridadTarea.MEDIA}>Media</Option>
            <Option value={PrioridadTarea.BAJA}>Baja</Option>
          </Select>
        </div>

        {/* Filtro por Etiqueta */}
        <div>
          <Select
            placeholder="Filtrar por etiqueta"
            value={filtroEtiqueta}
            onChange={handleFiltroEtiqueta}
            style={{ width: '100%' }}
            size="large"
            allowClear
            loading={isLoading}
          >
            <Option value="TODOS">Todas las etiquetas</Option>
            {etiquetas.map(etiqueta => (
              <Option key={etiqueta.id} value={etiqueta.id}>
                <div className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: etiqueta.color }}
                  ></div>
                  {etiqueta.nombre}
                </div>
              </Option>
            ))}
          </Select>
        </div>
      </div>

      <div className="flex justify-between mt-4">
        <div className="flex items-center">
          <Switch
            checked={mostrarVencidas}
            onChange={setMostrarVencidas}
            className="mr-2"
          />
          <span>Mostrar solo tareas vencidas</span>
        </div>
        <Button
          onClick={() => {
            setSearchTerm('');
            setFiltroEstado('TODOS');
            setFiltroPrioridad('TODOS');
            setFiltroEtiqueta('TODOS');
            setMostrarVencidas(false);
          }}
        >
          Limpiar filtros
        </Button>
      </div>
    </Card>
  );

  // Función para renderizar la lista de tareas
  const renderTareas = () => {
    if (isLoading && tareas.length === 0) {
      return (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="w-full">
              <Skeleton active avatar paragraph={{ rows: 2 }} />
            </Card>
          ))}
        </div>
      );
    }

    if (tareasFiltradas.length === 0) {
      return (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <span className="text-text-secondary">
              No se encontraron tareas que coincidan con los criterios de búsqueda
            </span>
          }
        >
          <Button type="primary" onClick={handleNuevaTarea} icon={<PlusOutlined />}>
            Crear nueva tarea
          </Button>
        </Empty>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tareasFiltradas.map(tarea => (
          <Card
            key={tarea.id}
            className={`shadow-sm hover:shadow-md transition-shadow ${
              tarea.fechaVencimiento && new Date(tarea.fechaVencimiento) < new Date() && tarea.estado !== EstadoTarea.COMPLETADA
                ? 'border-warning-400'
                : ''
            }`}
            actions={[
              <Tooltip title="Completar tarea">
                <Button
                  type="text"
                  icon={<CheckOutlined />}
                  onClick={() => handleCambioEstado(tarea.id, EstadoTarea.COMPLETADA)}
                  disabled={tarea.estado === EstadoTarea.COMPLETADA || tarea.estado === EstadoTarea.CANCELADA}
                />
              </Tooltip>,
              <Tooltip title="Editar tarea">
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => handleEditarTarea(tarea.id)}
                  loading={editandoTarea === tarea.id}
                />
              </Tooltip>,
              <Tooltip title="Gestionar etiquetas">
                <Button
                  type="text"
                  icon={<TagOutlined />}
                  onClick={() => handleGestionarEtiquetas(tarea.id)}
                />
              </Tooltip>,
              <Dropdown
                overlay={
                  <Menu>
                    <Menu.Item
                      key="1"
                      icon={<ShareAltOutlined />}
                      onClick={() => handleCompartirTarea(tarea)}
                    >
                      Compartir
                    </Menu.Item>
                    <Menu.Item
                      key="2"
                      icon={<CommentOutlined />}
                      onClick={() => handleToggleComentarios(tarea.id)}
                    >
                      Comentarios
                    </Menu.Item>
                    <Menu.Item
                      key="delete"
                      icon={<DeleteOutlined />}
                      danger
                      onClick={() => handleDeleteTarea(tarea.id, tarea.titulo)}
                    >
                      {eliminandoTarea === tarea.id ? 'Eliminando...' : 'Eliminar'}
                    </Menu.Item>
                  </Menu>
                }
                trigger={['click']}
              >
                <Button type="text">
                  Más <span className="ml-1">▾</span>
                </Button>
              </Dropdown>
            ]}
          >
            <div className="flex flex-col md:flex-row md:items-center">
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    {getEstadoIcon(tarea.estado)}
                    <h3 className="text-lg font-medium ml-2">{tarea.titulo}</h3>
                  </div>
                  <Tag color={getPrioridadClass(tarea.prioridad)}>
                    {tarea.prioridad}
                  </Tag>
                </div>

                <p className="mt-2 text-text-secondary text-sm">{tarea.descripcion}</p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {tarea.etiquetas && tarea.etiquetas.length > 0 ? (
                    tarea.etiquetas.map(etiqueta => (
                      <Tag key={etiqueta.id} color="blue">
                        {etiqueta.nombre}
                      </Tag>
                    ))
                  ) : (
                    <Popover
                      content={renderEtiquetasPopover(tarea)}
                      title="Gestionar etiquetas"
                      trigger="click"
                      visible={gestionandoEtiquetas === tarea.id}
                      onVisibleChange={(visible) => !visible && setGestionandoEtiquetas(null)}
                    >
                      <Tag
                        className="cursor-pointer"
                        onClick={() => handleGestionarEtiquetas(tarea.id)}
                        icon={<TagOutlined />}
                      >
                        Añadir etiquetas
                      </Tag>
                    </Popover>
                  )}
                </div>
              </div>

              <div className="flex flex-col mt-4 md:mt-0 md:ml-4 md:flex-none min-w-[200px]">
                <div className="flex items-center text-text-secondary mb-2">
                  <CalendarOutlined className="mr-2" />
                  <span>Vence: {formatDate(tarea.fechaVencimiento)}</span>
                </div>

                <Space className="mt-auto">
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => handleEditarTarea(tarea.id)}
                  >
                    Editar
                  </Button>
                  {tarea.estado !== EstadoTarea.COMPLETADA && (
                    <Button
                      type="text"
                      icon={<CheckOutlined />}
                      onClick={() => handleCambioEstado(tarea.id, EstadoTarea.COMPLETADA)}
                      className="text-success-DEFAULT"
                    >
                      Completar
                    </Button>
                  )}
                  <Dropdown
                    overlay={
                      <Menu>
                        <Menu.Item
                          icon={<CommentOutlined />}
                          onClick={() => handleToggleComentarios(tarea.id)}
                        >
                          Comentarios
                        </Menu.Item>
                        <Menu.Item
                          icon={<ShareAltOutlined />}
                          onClick={() => handleCompartirTarea(tarea)}
                        >
                          Compartir
                        </Menu.Item>
                        <Menu.Divider />
                        <Menu.Item
                          key="delete"
                          icon={<DeleteOutlined />}
                          danger
                          onClick={() => handleDeleteTarea(tarea.id, tarea.titulo)}
                        >
                          {eliminandoTarea === tarea.id ? 'Eliminando...' : 'Eliminar'}
                        </Menu.Item>
                      </Menu>
                    }
                    trigger={['click']}
                  >
                    <Button type="text">
                      Más <span className="ml-1">▾</span>
                    </Button>
                  </Dropdown>
                </Space>
              </div>
            </div>

            {/* Comentarios si están abiertos */}
            {mostrarComentarios === tarea.id && (
              <div className="mt-4 pt-4 border-t border-border-light">
                <ComentariosTarea
                  tareaId={tarea.id}
                  usuarioActualId={usuarioActualId}
                  usuarioActualNombre={usuarioActualNombre}
                />
              </div>
            )}
          </Card>
        ))}
      </div>
    );
  };

  const handleVerDetalle = useCallback((tareaId: string) => {
    navigate(`/tareas/${tareaId}`);
  }, [navigate]);

  // Mostrar estado de carga o error
  if (isLoading && tareas.length === 0) {
    return (
      <div className="page">
        <h1>Tareas</h1>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando tareas...</p>
        </div>
      </div>
    );
  }

  if (error && tareas.length === 0) {
    return (
      <div className="page">
        <h1>Tareas</h1>
        <div className="error-container">
          <p>Error al cargar las tareas: {error}</p>
          <button
            className="btn-retry"
            onClick={() => fetchTareas()}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page bg-background-default min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Modal de Compartir Tarea */}
        {compartirTareaId && (
          <CompartirTareaModal
            isOpen={!!compartirTareaId}
            tareaId={compartirTareaId}
            tareaTitulo={compartirTareaTitulo}
            onClose={handleCerrarCompartirModal}
          />
        )}

        {/* Modal de Configuración de Notificaciones */}
        <Modal
          title="Configuración de Notificaciones"
          open={mostrarConfigNotificaciones}
          footer={null}
          onCancel={handleCerrarConfigNotificaciones}
        >
          <NotificacionesConfig
            isOpen={mostrarConfigNotificaciones}
            onClose={handleCerrarConfigNotificaciones}
            onSave={handleGuardarConfigNotificaciones}
            configuracionActual={configuracionNotificaciones}
          />
        </Modal>

        {/* Contenido Principal */}
        <div className="bg-white p-6 rounded-lg shadow-card">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-text-primary">Tareas</h1>
              <p className="text-text-secondary mt-1">Gestiona tus tareas y actividades</p>
            </div>
            <div className="flex space-x-3">
              <Button
                type="default"
                icon={<BellOutlined />}
                onClick={handleAbrirConfigNotificaciones}
                className="shadow-sm"
              >
                Notificaciones
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleNuevaTarea}
                className="shadow-sm"
              >
                Nueva Tarea
              </Button>
            </div>
          </div>

          {/* Panel de Filtros y Búsqueda */}
          <div className="bg-background-light p-4 rounded-lg mb-6 border border-border-light">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Búsqueda */}
              <div>
                <Input
                  placeholder="Buscar tareas..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  prefix={<SearchOutlined className="text-gray-400" />}
                  allowClear
                  size="large"
                />
              </div>

              {/* Filtro por Estado */}
              <div>
                <Select
                  placeholder="Estado"
                  value={filtroEstado}
                  onChange={handleFiltroEstado}
                  style={{ width: '100%' }}
                  size="large"
                >
                  <Option value="TODOS">Todos los estados</Option>
                  <Option value={EstadoTarea.PENDIENTE}>Pendiente</Option>
                  <Option value={EstadoTarea.EN_PROGRESO}>En progreso</Option>
                  <Option value={EstadoTarea.COMPLETADA}>Completada</Option>
                  <Option value={EstadoTarea.CANCELADA}>Cancelada</Option>
                </Select>
              </div>

              {/* Filtro por Prioridad */}
              <div>
                <Select
                  placeholder="Prioridad"
                  value={filtroPrioridad}
                  onChange={handleFiltroPrioridad}
                  style={{ width: '100%' }}
                  size="large"
                >
                  <Option value="TODOS">Todas las prioridades</Option>
                  <Option value={PrioridadTarea.ALTA}>Alta</Option>
                  <Option value={PrioridadTarea.MEDIA}>Media</Option>
                  <Option value={PrioridadTarea.BAJA}>Baja</Option>
                </Select>
              </div>

              {/* Filtro por Etiqueta */}
              <div>
                <Select
                  placeholder="Etiqueta"
                  value={filtroEtiqueta}
                  onChange={handleFiltroEtiqueta}
                  style={{ width: '100%' }}
                  size="large"
                >
                  <Option value="TODOS">Todas las etiquetas</Option>
                  {etiquetas.map(etiqueta => (
                    <Option key={etiqueta.id} value={etiqueta.id}>
                      {etiqueta.nombre}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>

            <Divider className="my-3" />

            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Switch
                  checked={mostrarVencidas}
                  onChange={setMostrarVencidas}
                  size="small"
                />
                <span className="ml-2 text-text-secondary">Mostrar solo tareas vencidas</span>
              </div>

              {mostrarVencidas && (
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={eliminarTareasVencidas}
                  loading={deleteLoading}
                >
                  Eliminar tareas vencidas
                </Button>
              )}

              <Tabs defaultActiveKey="lista" className="ml-auto">
                <TabPane
                  tab={
                    <span>
                      <UnorderedListOutlined />
                      Lista
                    </span>
                  }
                  key="lista"
                />
                <TabPane
                  tab={
                    <span>
                      <AppstoreOutlined />
                      Tarjetas
                    </span>
                  }
                  key="tarjetas"
                />
              </Tabs>
            </div>
          </div>

          {/* Panel de Recordatorios */}
          {tareasProximasAVencer.length > 0 && (
            <div className="mb-6 bg-warning-50 p-4 rounded-lg border border-warning-200">
              <div className="flex items-center mb-2">
                <BellOutlined className="text-warning-DEFAULT mr-2" />
                <h3 className="text-lg font-medium text-text-primary">Recordatorios</h3>
              </div>
              <p className="text-text-secondary mb-3">
                Tienes {tareasProximasAVencer.length} {tareasProximasAVencer.length === 1 ? 'tarea' : 'tareas'} que vencen próximamente
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {tareasProximasAVencer.slice(0, 3).map(tarea => (
                  <div key={tarea.id} className="bg-white p-3 rounded border border-warning-100 shadow-sm">
                    <div className="flex justify-between">
                      <h4 className="font-medium text-text-primary">{tarea.titulo}</h4>
                      <Tag color={getPrioridadClass(tarea.prioridad)}>{tarea.prioridad}</Tag>
                    </div>
                    <p className="text-text-secondary text-sm mt-1">
                      <CalendarOutlined className="mr-1" />
                      Vence: {formatDate(tarea.fechaVencimiento)}
                    </p>
                  </div>
                ))}
                {tareasProximasAVencer.length > 3 && (
                  <div className="bg-white p-3 rounded border border-warning-100 shadow-sm flex items-center justify-center">
                    <Button type="link">Ver {tareasProximasAVencer.length - 3} más</Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Lista de Tareas */}
          {isLoading && tareas.length === 0 ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Card key={i} className="w-full">
                  <Skeleton active avatar paragraph={{ rows: 2 }} />
                </Card>
              ))}
            </div>
          ) : (
            <div>
              {tareasFiltradas.length === 0 ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <span className="text-text-secondary">
                      No se encontraron tareas que coincidan con los criterios de búsqueda
                    </span>
                  }
                >
                  <Button type="primary" onClick={handleNuevaTarea} icon={<PlusOutlined />}>
                    Crear nueva tarea
                  </Button>
                </Empty>
              ) : (
                <div className="space-y-4">
                  {tareasFiltradas.map(tarea => (
                    <Card
                      key={tarea.id}
                      className="w-full hover:shadow-md transition-shadow duration-normal"
                      bodyStyle={{ padding: '16px' }}
                    >
                      <div className="flex flex-col md:flex-row md:items-center">
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center">
                              {getEstadoIcon(tarea.estado)}
                              <h3 className="text-lg font-medium ml-2">{tarea.titulo}</h3>
                            </div>
                            <Tag color={getPrioridadClass(tarea.prioridad)}>
                              {tarea.prioridad}
                            </Tag>
                          </div>

                          <p className="mt-2 text-text-secondary text-sm">{tarea.descripcion}</p>

                          <div className="mt-3 flex flex-wrap gap-2">
                            {tarea.etiquetas && tarea.etiquetas.length > 0 ? (
                              tarea.etiquetas.map(etiqueta => (
                                <Tag key={etiqueta.id} color="blue">
                                  {etiqueta.nombre}
                                </Tag>
                              ))
                            ) : (
                              <Popover
                                content={renderEtiquetasPopover(tarea)}
                                title="Gestionar etiquetas"
                                trigger="click"
                                visible={gestionandoEtiquetas === tarea.id}
                                onVisibleChange={(visible) => !visible && setGestionandoEtiquetas(null)}
                              >
                                <Tag
                                  className="cursor-pointer"
                                  onClick={() => handleGestionarEtiquetas(tarea.id)}
                                  icon={<TagOutlined />}
                                >
                                  Añadir etiquetas
                                </Tag>
                              </Popover>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col mt-4 md:mt-0 md:ml-4 md:flex-none min-w-[200px]">
                          <div className="flex items-center text-text-secondary mb-2">
                            <CalendarOutlined className="mr-2" />
                            <span>Vence: {formatDate(tarea.fechaVencimiento)}</span>
                          </div>

                          <Space className="mt-auto">
                            <Button
                              type="text"
                              icon={<EditOutlined />}
                              onClick={() => handleEditarTarea(tarea.id)}
                            >
                              Editar
                            </Button>
                            {tarea.estado !== EstadoTarea.COMPLETADA && (
                              <Button
                                type="text"
                                icon={<CheckOutlined />}
                                onClick={() => handleCambioEstado(tarea.id, EstadoTarea.COMPLETADA)}
                                className="text-success-DEFAULT"
                              >
                                Completar
                              </Button>
                            )}
                            <Dropdown
                              overlay={
                                <Menu>
                                  <Menu.Item
                                    icon={<CommentOutlined />}
                                    onClick={() => handleToggleComentarios(tarea.id)}
                                  >
                                    Comentarios
                                  </Menu.Item>
                                  <Menu.Item
                                    icon={<ShareAltOutlined />}
                                    onClick={() => handleCompartirTarea(tarea)}
                                  >
                                    Compartir
                                  </Menu.Item>
                                  <Menu.Divider />
                                  <Menu.Item
                                    key="delete"
                                    icon={<DeleteOutlined />}
                                    danger
                                    onClick={() => handleDeleteTarea(tarea.id, tarea.titulo)}
                                  >
                                    {eliminandoTarea === tarea.id ? 'Eliminando...' : 'Eliminar'}
                                  </Menu.Item>
                                </Menu>
                              }
                              trigger={['click']}
                            >
                              <Button type="text">
                                Más <span className="ml-1">▾</span>
                              </Button>
                            </Dropdown>
                          </Space>
                        </div>
                      </div>

                      {/* Comentarios si están abiertos */}
                      {mostrarComentarios === tarea.id && (
                        <div className="mt-4 pt-4 border-t border-border-light">
                          <ComentariosTarea
                            tareaId={tarea.id}
                            usuarioActualId={usuarioActualId}
                            usuarioActualNombre={usuarioActualNombre}
                          />
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {isLoading && tareas.length > 0 && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-DEFAULT mx-auto"></div>
                <p className="mt-4 text-center text-text-secondary">Actualizando tareas...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tareas;
