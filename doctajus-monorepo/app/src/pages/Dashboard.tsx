import React, { useEffect, useState } from 'react';
import { useExpedienteStore } from '../stores/expedienteStore';
import { useTareaStore } from '../stores/tareaStore';
import { useDocumentoStore } from '../stores/documentoStore';
import { useTesoreriaStore } from '../stores/tesoreriaStore';
import { EstadoExpediente, EstadoTarea } from '../types';
import { Link } from 'react-router-dom';
import {
  Row,
  Col,
  Progress,
  List,
  Button,
  Avatar,
  Tabs,
  Space,
  Badge,
  Tooltip,
  Card,
  Typography,
  Select,
  Empty,
  Tag
} from 'antd';
import {
  FileTextOutlined,
  CheckOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  CalendarOutlined,
  DollarOutlined,
  FolderOutlined,
  TeamOutlined,
  ArrowRightOutlined,
  AreaChartOutlined,
  PieChartOutlined,
  BarsOutlined,
  CaretUpOutlined,
  CaretDownOutlined,
  EllipsisOutlined,
  FileSearchOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  FileExclamationOutlined,
  AlertOutlined,
} from '@ant-design/icons';
import DashboardCard from '../components/ui/DashboardCard';
import { Documento } from '../stores/documentoStore';
import { Movimiento as Pago } from '../stores/tesoreriaStore';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

interface EstadisticasExpedientes {
  total: number;
  abiertos: number;
  enProgreso: number;
  cerrados: number;
  archivados: number;
}

interface EstadisticasTareas {
  total: number;
  pendientes: number;
  enProgreso: number;
  completadas: number;
  vencidas: number;
  proximas: number; // Tareas que vencen en los próximos 7 días
}

interface ActividadReciente {
  id: string;
  tipo: 'expediente' | 'tarea' | 'documento' | 'pago';
  titulo: string;
  descripcion: string;
  fecha: Date;
  enlace: string;
}

const Dashboard = () => {
  const { expedientes, fetchExpedientes, isLoading: isLoadingExpedientes } = useExpedienteStore();
  const { tareas, fetchTareas, isLoading: isLoadingTareas } = useTareaStore();
  const { documentos, fetchDocumentos, loading: isLoadingDocumentos } = useDocumentoStore();
  const { movimientos: pagos, fetchMovimientos: fetchPagos, loading: isLoadingPagos } = useTesoreriaStore();
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('mes');

  const [estadisticasExpedientes, setEstadisticasExpedientes] = useState<EstadisticasExpedientes>({
    total: 0,
    abiertos: 0,
    enProgreso: 0,
    cerrados: 0,
    archivados: 0
  });

  const [estadisticasTareas, setEstadisticasTareas] = useState<EstadisticasTareas>({
    total: 0,
    pendientes: 0,
    enProgreso: 0,
    completadas: 0,
    vencidas: 0,
    proximas: 0
  });

  const [actividadReciente, setActividadReciente] = useState<ActividadReciente[]>([]);

  useEffect(() => {
    // Cargar datos iniciales
    fetchExpedientes();
    fetchTareas();
    fetchDocumentos();
    fetchPagos();
  }, [fetchExpedientes, fetchTareas, fetchDocumentos, fetchPagos]);

  useEffect(() => {
    // Calcular estadísticas de expedientes
    if (expedientes.length > 0) {
      const abiertos = expedientes.filter(exp => exp.estado === EstadoExpediente.ABIERTO).length;
      const enProgreso = expedientes.filter(exp => exp.estado === EstadoExpediente.EN_PROCESO).length;
      const cerrados = expedientes.filter(exp => exp.estado === EstadoExpediente.CERRADO).length;
      const archivados = expedientes.filter(exp => exp.estado === EstadoExpediente.ARCHIVADO).length;

      setEstadisticasExpedientes({
        total: expedientes.length,
        abiertos,
        enProgreso,
        cerrados,
        archivados
      });
    }
  }, [expedientes]);

  useEffect(() => {
    // Calcular estadísticas de tareas
    if (tareas.length > 0) {
      const pendientes = tareas.filter(t => t.estado === EstadoTarea.PENDIENTE).length;
      const enProgreso = tareas.filter(t => t.estado === EstadoTarea.EN_PROGRESO).length;
      const completadas = tareas.filter(t => t.estado === EstadoTarea.COMPLETADA).length;

      // Tareas vencidas (fecha de vencimiento anterior a hoy y pendientes)
      const hoy = new Date();
      const vencidas = tareas.filter(t =>
        new Date(t.fechaVencimiento) < hoy &&
        t.estado === EstadoTarea.PENDIENTE
      ).length;

      // Tareas que vencen en los próximos 7 días
      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() + 7);
      const proximas = tareas.filter(t =>
        new Date(t.fechaVencimiento) > hoy &&
        new Date(t.fechaVencimiento) <= fechaLimite &&
        t.estado === EstadoTarea.PENDIENTE
      ).length;

      setEstadisticasTareas({
        total: tareas.length,
        pendientes,
        enProgreso,
        completadas,
        vencidas,
        proximas
      });
    }
  }, [tareas]);

  useEffect(() => {
    // Generar actividad reciente combinando datos de diferentes fuentes
    const actividad: ActividadReciente[] = [];

    // Expedientes recientes (últimos 5 actualizados)
    const expedientesRecientes = [...expedientes]
      .sort((a, b) => new Date(b.fechaActualizacion).getTime() - new Date(a.fechaActualizacion).getTime())
      .slice(0, 5)
      .map(exp => ({
        id: exp.id,
        tipo: 'expediente' as const,
        titulo: `Expediente: ${exp.numero}`,
        descripcion: `${exp.titulo} - ${exp.estado}`,
        fecha: new Date(exp.fechaActualizacion),
        enlace: `/expedientes/${exp.id}`
      }));

    // Tareas recientes (últimas 5)
    const tareasRecientes = [...tareas]
      .sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime())
      .slice(0, 5)
      .map(tarea => ({
        id: tarea.id,
        tipo: 'tarea' as const,
        titulo: `Tarea: ${tarea.titulo}`,
        descripcion: `${tarea.descripcion.substring(0, 50)}... - ${tarea.estado}`,
        fecha: new Date(tarea.fechaCreacion),
        enlace: `/tareas?id=${tarea.id}`
      }));

    // Documentos recientes (últimos 5)
    const documentosRecientes = [...documentos]
      .sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime())
      .slice(0, 5)
      .map(doc => ({
        id: doc.id.toString(),
        tipo: 'documento' as const,
        titulo: `Documento: ${doc.nombre}`,
        descripcion: `${doc.descripcion?.substring(0, 50) || "Sin descripción"}`,
        fecha: new Date(doc.fechaCreacion),
        enlace: `/documentos?id=${doc.id}`
      }));

    // Pagos recientes (últimos 5)
    const pagosRecientes = [...pagos]
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      .slice(0, 5)
      .map(pago => ({
        id: pago.id.toString(),
        tipo: 'pago' as const,
        titulo: `Pago: ${pago.descripcion}`,
        descripcion: `$${pago.monto} - ${pago.estado}`,
        fecha: new Date(pago.fecha),
        enlace: `/tesoreria?id=${pago.id}`
      }));

    // Combinar todas las actividades y ordenar por fecha
    actividad.push(...expedientesRecientes, ...tareasRecientes, ...documentosRecientes, ...pagosRecientes);
    actividad.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());

    setActividadReciente(actividad.slice(0, 10)); // Mostrar las 10 actividades más recientes
  }, [expedientes, tareas, documentos, pagos]);

  // Mostrar indicador de carga si aún no hay datos
  if ((isLoadingExpedientes && expedientes.length === 0) ||
      (isLoadingTareas && tareas.length === 0)) {
    return (
      <div className="dashboard-loading flex items-center justify-center h-full">
        <div className="loading-container text-center">
          <div className="loading-spinner mb-4 mx-auto w-12 h-12 border-4 border-primary-light rounded-full border-t-primary-DEFAULT animate-spin"></div>
          <Title level={4} className="text-text-secondary">Cargando estadísticas...</Title>
        </div>
      </div>
    );
  }

  // Obtener el icono adecuado para cada tipo de actividad
  const getIconForActivity = (tipo: string) => {
    switch (tipo) {
      case 'expediente':
        return <FileTextOutlined style={{ color: '#1890ff' }} />;
      case 'tarea':
        return <CheckOutlined style={{ color: '#52c41a' }} />;
      case 'documento':
        return <FileSearchOutlined style={{ color: '#722ed1' }} />;
      case 'pago':
        return <DollarOutlined style={{ color: '#faad14' }} />;
      default:
        return <FileTextOutlined />;
    }
  };

  // Obtener color según el estado
  const getColorByEstado = (estado: string) => {
    if (estado.includes('ABIERTO') || estado.includes('PENDIENTE'))
      return 'blue';
    if (estado.includes('PROCESO') || estado.includes('PROGRESO'))
      return 'orange';
    if (estado.includes('CERRADO') || estado.includes('COMPLETADA'))
      return 'green';
    if (estado.includes('ARCHIVADO'))
      return 'gray';
    if (estado.includes('VENCIDA'))
      return 'red';
    return 'default';
  };

  // Formatear fecha para mostrar
  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Hoy, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Ayer, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  return (
    <div className="dashboard-container">
      {/* Header del Dashboard con selector de periodo */}
      <div className="dashboard-header flex items-center justify-between mb-6">
        <div>
          <Title className="dashboard-title" level={2}>Dashboard</Title>
          <Text className="dashboard-subtitle">Resumen de actividad y estadísticas</Text>
        </div>
        <div className="dashboard-filters">
          <Select
            value={periodoSeleccionado}
            onChange={setPeriodoSeleccionado}
            popupMatchSelectWidth={false}
          >
            <Option value="hoy">Hoy</Option>
            <Option value="semana">Esta semana</Option>
            <Option value="mes">Este mes</Option>
            <Option value="trimestre">Este trimestre</Option>
            <Option value="año">Este año</Option>
          </Select>
        </div>
      </div>

      {/* Tarjetas de resumen */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          <DashboardCard
            title="Expedientes Activos"
            value={estadisticasExpedientes.abiertos + estadisticasExpedientes.enProgreso}
            icon={<FileTextOutlined />}
            color="primary"
            trend={{
              value: 12,
              label: "último mes",
              isPositive: true
            }}
            footer={<Link to="/expedientes">Ver todos los expedientes <ArrowRightOutlined /></Link>}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <DashboardCard
            title="Tareas Pendientes"
            value={estadisticasTareas.pendientes}
            icon={<ClockCircleOutlined />}
            color="warning"
            trend={{
              value: 5,
              label: "último mes",
              isPositive: false
            }}
            footer={
              <>
                <Badge color="red" text={`${estadisticasTareas.vencidas} vencidas`} />
                <span className="mx-2">•</span>
                <Badge color="orange" text={`${estadisticasTareas.proximas} próximas`} />
              </>
            }
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <DashboardCard
            title="Documentos"
            value={documentos.length}
            icon={<FolderOutlined />}
            color="accent"
            trend={{
              value: 8,
              label: "último mes",
              isPositive: true
            }}
            footer={<Link to="/documentos">Gestionar documentos <ArrowRightOutlined /></Link>}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <DashboardCard
            title="Ingresos Mes Actual"
            value={pagos.filter(p => p.tipo === 'ingreso').reduce((sum, p) => sum + p.monto, 0).toLocaleString()}
            icon={<DollarOutlined />}
            color="success"
            trend={{
              value: 15,
              label: "mes anterior",
              isPositive: true
            }}
            footer={<Link to="/tesoreria">Ver finanzas <ArrowRightOutlined /></Link>}
          />
        </Col>
      </Row>

      {/* Gráficos y Estadísticas */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={12}>
          <Card
            title={
              <div className="flex items-center">
                <PieChartOutlined className="mr-2 text-primary-DEFAULT" />
                <span>Distribución de Expedientes</span>
              </div>
            }
            className="h-full shadow-sm"
            extra={
              <Tooltip title="Más opciones">
                <Button type="text" icon={<EllipsisOutlined />} />
              </Tooltip>
            }
          >
            <div className="flex h-64 items-center justify-center">
              {/* Aquí iría un gráfico de pastel real */}
              <div className="chart-placeholder w-full h-full flex flex-col items-center justify-center">
                <div className="flex mb-4">
                  {Object.entries({
                    'Abiertos': { color: '#1890ff', value: estadisticasExpedientes.abiertos },
                    'En Proceso': { color: '#faad14', value: estadisticasExpedientes.enProgreso },
                    'Cerrados': { color: '#52c41a', value: estadisticasExpedientes.cerrados },
                    'Archivados': { color: '#8c8c8c', value: estadisticasExpedientes.archivados }
                  }).map(([key, {color, value}]) => (
                    <div key={key} className="mx-2 text-center">
                      <Tooltip title={key}>
                        <Progress
                          type="circle"
                          percent={Math.round((value / estadisticasExpedientes.total) * 100) || 0}
                          size={80}
                          strokeColor={color}
                          format={() => `${value}`}
                        />
                      </Tooltip>
                      <div className="mt-2 text-xs">{key}</div>
                    </div>
                  ))}
                </div>
                <div className="text-center text-text-secondary">
                  <Text strong>{estadisticasExpedientes.total}</Text> expedientes totales
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title={
              <div className="flex items-center">
                <AreaChartOutlined className="mr-2 text-primary-DEFAULT" />
                <span>Progreso de Tareas</span>
              </div>
            }
            className="h-full shadow-sm"
            extra={
              <Tooltip title="Más opciones">
                <Button type="text" icon={<EllipsisOutlined />} />
              </Tooltip>
            }
          >
            <div className="flex flex-col h-64 justify-between">
              <Row gutter={[16, 16]} className="mb-4">
                <Col span={8}>
                  <div className="text-center">
                    <div className="text-3xl font-semibold text-success-DEFAULT">
                      {estadisticasTareas.completadas}
                    </div>
                    <div className="text-xs text-text-secondary">Completadas</div>
                  </div>
                </Col>
                <Col span={8}>
                  <div className="text-center">
                    <div className="text-3xl font-semibold text-warning-DEFAULT">
                      {estadisticasTareas.enProgreso}
                    </div>
                    <div className="text-xs text-text-secondary">En Progreso</div>
                  </div>
                </Col>
                <Col span={8}>
                  <div className="text-center">
                    <div className="text-3xl font-semibold text-danger-DEFAULT">
                      {estadisticasTareas.vencidas}
                    </div>
                    <div className="text-xs text-text-secondary">Vencidas</div>
                  </div>
                </Col>
              </Row>

              <div className="progress-section">
                <div className="flex justify-between mb-2">
                  <Text strong>Tareas completadas</Text>
                  <Text type="secondary">
                    {estadisticasTareas.completadas}/{estadisticasTareas.total}
                  </Text>
                </div>
                <Progress
                  percent={Math.round((estadisticasTareas.completadas / estadisticasTareas.total) * 100) || 0}
                  strokeColor="#52c41a"
                  trailColor="#f0f0f0"
                  size={10}
                />
              </div>

              <div className="progress-section mb-2">
                <div className="flex justify-between mb-2">
                  <Text strong>Tareas en progreso</Text>
                  <Text type="secondary">
                    {estadisticasTareas.enProgreso}/{estadisticasTareas.total}
                  </Text>
                </div>
                <Progress
                  percent={Math.round((estadisticasTareas.enProgreso / estadisticasTareas.total) * 100) || 0}
                  strokeColor="#faad14"
                  trailColor="#f0f0f0"
                  size={10}
                />
              </div>

              <div className="progress-section">
                <div className="flex justify-between mb-2">
                  <Text strong>Tareas pendientes</Text>
                  <Text type="secondary">
                    {estadisticasTareas.pendientes}/{estadisticasTareas.total}
                  </Text>
                </div>
                <Progress
                  percent={Math.round((estadisticasTareas.pendientes / estadisticasTareas.total) * 100) || 0}
                  strokeColor="#1890ff"
                  trailColor="#f0f0f0"
                  size={10}
                />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Actividad Reciente y Próximas Tareas */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card
            title={
              <div className="flex items-center">
                <BarsOutlined className="mr-2 text-primary-DEFAULT" />
                <span>Actividad Reciente</span>
              </div>
            }
            className="h-full shadow-sm"
          >
            {actividadReciente.length > 0 ? (
              <List
                itemLayout="horizontal"
                dataSource={actividadReciente}
                renderItem={item => (
                  <List.Item
                    className="hover:bg-background-light rounded-md px-2 transition-colors duration-fast"
                    actions={[
                      <Link to={item.enlace} key="ver">
                        <Button type="link" size="small">Ver</Button>
                      </Link>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          icon={getIconForActivity(item.tipo)}
                          className="bg-background-light"
                        />
                      }
                      title={
                        <Link to={item.enlace} className="text-text-primary hover:text-primary-DEFAULT">
                          {item.titulo}
                        </Link>
                      }
                      description={
                        <div>
                          <div className="text-text-secondary">{item.descripcion}</div>
                          <div className="text-xs text-text-disabled mt-1">
                            {formatDate(item.fecha)}
                          </div>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="No hay actividad reciente" />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card
            title={
              <div className="flex items-center">
                <AlertOutlined className="mr-2 text-danger-DEFAULT" />
                <span>Tareas Urgentes</span>
              </div>
            }
            className="h-full shadow-sm"
          >
            {tareas.filter(t =>
              t.estado === EstadoTarea.PENDIENTE &&
              new Date(t.fechaVencimiento) < new Date()
            ).length > 0 ? (
              <List
                dataSource={tareas
                  .filter(t => t.estado === EstadoTarea.PENDIENTE)
                  .sort((a, b) => new Date(a.fechaVencimiento).getTime() - new Date(b.fechaVencimiento).getTime())
                  .slice(0, 5)
                }
                renderItem={tarea => {
                  const isVencida = new Date(tarea.fechaVencimiento) < new Date();
                  const diasRestantes = Math.round((new Date(tarea.fechaVencimiento).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

                  return (
                    <List.Item
                      className="hover:bg-background-light rounded-md px-2 transition-colors duration-fast"
                    >
                      <List.Item.Meta
                        avatar={
                          isVencida ? (
                            <ExclamationCircleOutlined style={{ fontSize: '24px', color: '#f5222d' }} />
                          ) : (
                            <FileExclamationOutlined style={{ fontSize: '24px', color: '#faad14' }} />
                          )
                        }
                        title={
                          <Link to={`/tareas?id=${tarea.id}`} className="text-text-primary hover:text-primary-DEFAULT">
                            {tarea.titulo}
                          </Link>
                        }
                        description={
                          <div>
                            <Tag color={isVencida ? 'error' : 'warning'}>
                              {isVencida
                                ? `Vencida hace ${Math.abs(diasRestantes)} días`
                                : `Vence en ${diasRestantes} días`}
                            </Tag>
                            <div className="text-xs text-text-disabled mt-1">
                              Exp: {tarea.expedienteId}
                            </div>
                          </div>
                        }
                      />
                    </List.Item>
                  );
                }}
              />
            ) : (
              <Empty
                image={<CheckCircleOutlined style={{ fontSize: '48px', color: '#52c41a' }} />}
                description="¡Genial! No hay tareas vencidas"
                className="my-8"
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
