import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExpedienteStore } from '../stores/expedienteStore';
import { useUIStore } from '../stores/uiStore';
import { EstadoExpediente } from '../types';
import ExpedienteForm from '../components/forms/ExpedienteForm';
import {
  Tag,
  Button,
  Space,
  Tooltip,
  Input,
  Select,
  Skeleton,
  Empty,
  Divider,
  Card,
  Avatar,
  Typography,
  Badge,
  Row,
  Col,
  Alert
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  EyeOutlined,
  SortAscendingOutlined,
  CalendarOutlined,
  UserOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  SyncOutlined,
  CheckOutlined,
  AppstoreOutlined,
  UnorderedListOutlined
} from '@ant-design/icons';
import { useAccessibility } from '../components/ui/AccessibilityProvider';
import LoadingOverlay from '../components/ui/LoadingOverlay';
import moment from 'moment';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const Expedientes = () => {
  const navigate = useNavigate();
  const { highContrast, largeText } = useAccessibility();

  const {
    expedientes,
    isLoading,
    error,
    fetchExpedientes,
    filterByEstado,
    searchExpedientes,
    deleteExpediente
  } = useExpedienteStore();

  const { openModal, closeModal, confirmModal, openConfirmModal, addNotification } = useUIStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<EstadoExpediente | 'TODOS'>('TODOS');
  const [sortBy, setSortBy] = useState<'fecha' | 'titulo' | 'urgencia'>('fecha');
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [vista, setVista] = useState<'tarjetas' | 'lista'>('tarjetas');

  useEffect(() => {
    fetchExpedientes();
  }, [fetchExpedientes]);

  // Filtrar expedientes según los criterios
  const expedientesFiltrados = React.useMemo(() => {
    let resultado = expedientes;

    if (filtroEstado !== 'TODOS') {
      resultado = filterByEstado(filtroEstado);
    }

    if (searchTerm.trim()) {
      resultado = searchExpedientes(searchTerm);
    }

    // Ordenar expedientes
    return [...resultado].sort((a, b) => {
      if (sortBy === 'fecha') {
        return new Date(b.fechaInicio).getTime() - new Date(a.fechaInicio).getTime();
      } else if (sortBy === 'titulo') {
        return a.titulo.localeCompare(b.titulo);
      } else if (sortBy === 'urgencia') {
        // Prioridad basada en estado (ejemplo: EN_PROCESO más urgente que ARCHIVADO)
        const prioridad = {
          [EstadoExpediente.EN_PROCESO]: 0,
          [EstadoExpediente.ABIERTO]: 1,
          [EstadoExpediente.CERRADO]: 2,
          [EstadoExpediente.ARCHIVADO]: 3,
        };
        return prioridad[a.estado] - prioridad[b.estado];
      }
      return 0;
    });
  }, [expedientes, filtroEstado, searchTerm, filterByEstado, searchExpedientes, sortBy]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleFiltroEstado = (value: EstadoExpediente | 'TODOS') => {
    setFiltroEstado(value);
  };

  const handleSortChange = (value: 'fecha' | 'titulo' | 'urgencia') => {
    setSortBy(value);
  };

  const handleNuevoExpediente = () => {
    openModal({
      title: 'Nuevo Expediente',
      content: <ExpedienteForm
                isModal={true}
                onSuccess={() => {
                  closeModal();
                  fetchExpedientes();
                }}
              />,
      confirmText: 'Cerrar',
      onConfirm: () => {
        closeModal();
      }
    });
  };

  const handleVerDetalle = (expedienteId: string) => {
    navigate(`/expedientes/${expedienteId}`);
  };

  const handleEliminarExpediente = (expedienteId: string) => {
    openConfirmModal({
      title: '¿Eliminar expediente?',
      content: 'Esta acción no se puede deshacer. ¿Estás seguro de eliminar este expediente?',
      confirmText: 'Sí, eliminar',
      cancelText: 'Cancelar',
      type: 'danger',
      onConfirm: async () => {
        try {
          await deleteExpediente(expedienteId);
          addNotification({
            type: 'success',
            message: 'Expediente eliminado correctamente'
          });
        } catch (error) {
          addNotification({
            type: 'error',
            message: 'Error al eliminar el expediente',
            description: error instanceof Error ? error.message : 'Error desconocido'
          });
        }
      }
    });
  };

  // Obtener el color según el estado del expediente
  const getTagColor = (estado: EstadoExpediente) => {
    if (highContrast) {
      switch (estado) {
        case EstadoExpediente.ABIERTO:
          return 'darkgreen';
        case EstadoExpediente.EN_PROCESO:
          return 'darkblue';
        case EstadoExpediente.CERRADO:
          return 'darkred';
        case EstadoExpediente.ARCHIVADO:
          return 'black';
        default:
          return 'gray';
      }
    } else {
      switch (estado) {
        case EstadoExpediente.ABIERTO:
          return 'success';
        case EstadoExpediente.EN_PROCESO:
          return 'processing';
        case EstadoExpediente.CERRADO:
          return 'error';
        case EstadoExpediente.ARCHIVADO:
          return 'default';
        default:
          return 'default';
      }
    }
  };

  const renderEstadisticas = () => {
    const totalExpedientes = expedientes.length;
    const expedientesAbiertos = expedientes.filter(exp => exp.estado === EstadoExpediente.ABIERTO).length;
    const expedientesEnProceso = expedientes.filter(exp => exp.estado === EstadoExpediente.EN_PROCESO).length;
    const expedientesCerrados = expedientes.filter(exp => exp.estado === EstadoExpediente.CERRADO).length;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center mr-4">
              <FileTextOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
            </div>
            <div>
              <Text type="secondary">Total de expedientes</Text>
              <Title level={3} style={{ margin: 0 }}>{totalExpedientes}</Title>
            </div>
          </div>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-success-50 flex items-center justify-center mr-4">
              <PlusOutlined style={{ fontSize: '24px', color: '#52c41a' }} />
            </div>
            <div>
              <Text type="secondary">Expedientes abiertos</Text>
              <Title level={3} style={{ margin: 0 }}>{expedientesAbiertos}</Title>
            </div>
          </div>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-processing-50 flex items-center justify-center mr-4">
              <SyncOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
            </div>
            <div>
              <Text type="secondary">En proceso</Text>
              <Title level={3} style={{ margin: 0 }}>{expedientesEnProceso}</Title>
            </div>
          </div>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-error-50 flex items-center justify-center mr-4">
              <CheckOutlined style={{ fontSize: '24px', color: '#f5222d' }} />
            </div>
            <div>
              <Text type="secondary">Cerrados</Text>
              <Title level={3} style={{ margin: 0 }}>{expedientesCerrados}</Title>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const renderVistaSelector = () => (
    <div className="flex items-center">
      <Button.Group>
        <Button
          type={vista === 'tarjetas' ? 'primary' : 'default'}
          icon={<AppstoreOutlined />}
          onClick={() => setVista('tarjetas')}
          aria-label="Ver como tarjetas"
        />
        <Button
          type={vista === 'lista' ? 'primary' : 'default'}
          icon={<UnorderedListOutlined />}
          onClick={() => setVista('lista')}
          aria-label="Ver como lista"
        />
      </Button.Group>
    </div>
  );

  if (error && expedientes.length === 0) {
    return (
      <div className="page bg-background-default p-lg rounded-lg">
        <h1 className="text-2xl font-bold text-text-primary mb-6">Expedientes</h1>
        <div className="bg-white p-lg rounded-lg shadow-sm border border-border-light">
          <div className="flex flex-col items-center justify-center py-10">
            <ExclamationCircleOutlined style={{ fontSize: 48, color: '#f5222d' }} />
            <p className="mt-4 text-text-secondary">Error al cargar los expedientes: {error}</p>
            <Button
              type="primary"
              onClick={() => fetchExpedientes()}
              className="mt-4"
            >
              Reintentar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page bg-background-default min-h-screen pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <Title level={2} className="!m-0">Expedientes</Title>
            <Text type="secondary">Gestiona tus casos y expedientes</Text>
          </div>
          <div className="flex gap-2">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleNuevoExpediente}
              className={`${largeText ? 'text-lg h-auto py-2' : ''}`}
            >
              Nuevo Expediente
            </Button>
          </div>
        </div>

        {renderEstadisticas()}

        <Card className="mb-6 shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="relative">
              <Input
                prefix={<SearchOutlined className="text-gray-400" />}
                placeholder="Buscar expedientes..."
                value={searchTerm}
                onChange={handleSearch}
                size={largeText ? 'large' : 'middle'}
                allowClear
                className="w-full"
              />
            </div>

            <div className="flex items-center">
              <Select
                placeholder="Filtrar por estado"
                style={{ width: '100%' }}
                value={filtroEstado}
                onChange={handleFiltroEstado}
                size={largeText ? 'large' : 'middle'}
              >
                <Option value="TODOS">Todos los estados</Option>
                <Option value={EstadoExpediente.ABIERTO}>Abierto</Option>
                <Option value={EstadoExpediente.EN_PROCESO}>En proceso</Option>
                <Option value={EstadoExpediente.CERRADO}>Cerrado</Option>
                <Option value={EstadoExpediente.ARCHIVADO}>Archivado</Option>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Select
                placeholder="Ordenar por"
                style={{ width: 'calc(100% - 50px)' }}
                value={sortBy}
                onChange={handleSortChange}
                size={largeText ? 'large' : 'middle'}
              >
                <Option value="fecha">Fecha de creación</Option>
                <Option value="titulo">Título (A-Z)</Option>
                <Option value="urgencia">Urgencia</Option>
              </Select>
              <div className="ml-2">
                {renderVistaSelector()}
              </div>
            </div>
          </div>
        </Card>

        {isLoading && expedientes.length === 0 ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <Card key={i} className="w-full">
                <Skeleton active avatar paragraph={{ rows: 2 }} />
              </Card>
            ))}
          </div>
        ) : expedientesFiltrados.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span className="text-text-secondary">
                No se encontraron expedientes que coincidan con los criterios de búsqueda
              </span>
            }
          >
            <Button type="primary" onClick={handleNuevoExpediente} icon={<PlusOutlined />}>
              Crear nuevo expediente
            </Button>
          </Empty>
        ) : vista === 'tarjetas' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {expedientesFiltrados.map(expediente => (
              <Card
                key={expediente.id}
                className={`h-full shadow-sm hover:shadow-md transition-shadow ${highContrast ? 'high-contrast' : ''}`}
                bodyStyle={{ padding: largeText ? '24px' : '16px' }}
                actions={[
                  <Tooltip title="Ver detalles">
                    <Button
                      type="text"
                      icon={<EyeOutlined />}
                      onClick={() => handleVerDetalle(expediente.id)}
                      aria-label={`Ver detalles del expediente ${expediente.numero}`}
                    />
                  </Tooltip>,
                  <Tooltip title="Editar">
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      onClick={() => navigate(`/expedientes/${expediente.id}/editar`)}
                      aria-label={`Editar expediente ${expediente.numero}`}
                    />
                  </Tooltip>,
                  <Tooltip title="Eliminar">
                    <Button
                      type="text"
                      icon={<DeleteOutlined />}
                      danger
                      loading={deleteLoading === expediente.id}
                      onClick={() => handleEliminarExpediente(expediente.id)}
                      aria-label={`Eliminar expediente ${expediente.numero}`}
                    />
                  </Tooltip>
                ]}
              >
                <div className="flex flex-col h-full">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <Title level={5} className="m-0 text-primary-600">{expediente.numero}</Title>
                      <Text
                        className={`block font-medium ${largeText ? 'text-lg' : ''}`}
                        style={{ maxWidth: '230px' }}
                        ellipsis={{ tooltip: expediente.titulo }}
                      >
                        {expediente.titulo}
                      </Text>
                    </div>
                    <Tag color={getTagColor(expediente.estado)}>
                      {expediente.estado}
                    </Tag>
                  </div>

                  <Paragraph
                    ellipsis={{ rows: 2, expandable: false, tooltip: expediente.descripcion }}
                    className="text-text-secondary mb-4"
                  >
                    {expediente.descripcion}
                  </Paragraph>

                  <div className="mt-auto">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center">
                        <CalendarOutlined className="mr-1 text-text-secondary" />
                        <Text type="secondary">
                          {moment(expediente.fechaInicio).format('DD/MM/YYYY')}
                        </Text>
                      </div>

                      <div className="flex items-center">
                        <UserOutlined className="mr-1 text-text-secondary" />
                        <Text type="secondary" ellipsis>
                          {expediente.abogadoNombre || 'Sin asignar'}
                        </Text>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {expedientesFiltrados.map(expediente => (
              <Card
                key={expediente.id}
                className={`shadow-sm hover:shadow-md transition-shadow ${highContrast ? 'high-contrast' : ''}`}
                bodyStyle={{ padding: '12px 16px' }}
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                  <div className="flex-grow">
                    <div className="flex items-center mb-2">
                      <Title level={5} className="m-0 mr-2">{expediente.numero}</Title>
                      <Tag color={getTagColor(expediente.estado)}>
                        {expediente.estado}
                      </Tag>
                    </div>
                    <Text
                      className={`block font-medium ${largeText ? 'text-lg' : ''}`}
                    >
                      {expediente.titulo}
                    </Text>
                    <div className="flex items-center text-text-secondary mt-1">
                      <ClockCircleOutlined className="mr-1" />
                      <Text type="secondary">
                        Creado: {moment(expediente.fechaInicio).format('DD/MM/YYYY')}
                      </Text>
                      <Divider type="vertical" />
                      <UserOutlined className="mr-1" />
                      <Text type="secondary">
                        {expediente.abogadoNombre || 'Sin asignar'}
                      </Text>
                    </div>
                  </div>

                  <div className="mt-3 md:mt-0 flex gap-2">
                    <Button
                      type="primary"
                      icon={<EyeOutlined />}
                      onClick={() => handleVerDetalle(expediente.id)}
                    >
                      Ver detalles
                    </Button>
                    <Button
                      icon={<EditOutlined />}
                      onClick={() => navigate(`/expedientes/${expediente.id}/editar`)}
                    >
                      Editar
                    </Button>
                    <Button
                      icon={<DeleteOutlined />}
                      danger
                      loading={deleteLoading === expediente.id}
                      onClick={() => handleEliminarExpediente(expediente.id)}
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Expedientes;
