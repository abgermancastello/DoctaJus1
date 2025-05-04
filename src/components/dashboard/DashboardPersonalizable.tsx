import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Checkbox, Space, Typography, Row, Col, Tabs, Badge, Tooltip } from 'antd';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { SettingOutlined, DragOutlined, StarOutlined, StarFilled, InfoCircleOutlined } from '@ant-design/icons';
import { useExpedienteStore } from '../../stores/expedienteStore';
import { useTareaStore } from '../../stores/tareaStore';
import { useDocumentoStore } from '../../stores/documentoStore';
import { useTesoreriaStore } from '../../stores/tesoreriaStore';
import DashboardCard from '../ui/DashboardCard';
import ThemeToggle from '../ui/ThemeToggle';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface Widget {
  id: string;
  title: string;
  enabled: boolean;
  order: number;
  category: 'urgente' | 'importante' | 'general';
  starred: boolean;
  description: string;
}

const DashboardPersonalizable: React.FC = () => {
  const [widgets, setWidgets] = useState<Widget[]>([
    {
      id: 'plazos',
      title: 'Plazos Próximos',
      enabled: true,
      order: 0,
      category: 'urgente',
      starred: true,
      description: 'Expedientes con plazos próximos a vencer'
    },
    {
      id: 'tareas',
      title: 'Tareas Pendientes',
      enabled: true,
      order: 1,
      category: 'urgente',
      starred: true,
      description: 'Tareas pendientes que requieren atención inmediata'
    },
    {
      id: 'audiencias',
      title: 'Audiencias Programadas',
      enabled: true,
      order: 2,
      category: 'urgente',
      starred: false,
      description: 'Próximas audiencias y vistas programadas'
    },
    {
      id: 'expedientes',
      title: 'Expedientes Activos',
      enabled: true,
      order: 3,
      category: 'importante',
      starred: false,
      description: 'Resumen de expedientes en curso'
    },
    {
      id: 'finanzas',
      title: 'Resumen Financiero',
      enabled: true,
      order: 4,
      category: 'importante',
      starred: false,
      description: 'Estado financiero y cobros pendientes'
    },
    {
      id: 'documentos',
      title: 'Documentos Recientes',
      enabled: true,
      order: 5,
      category: 'general',
      starred: false,
      description: 'Últimos documentos agregados al sistema'
    },
  ]);

  const [isConfigModalVisible, setIsConfigModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('urgente');
  const { expedientes } = useExpedienteStore();
  const { tareas } = useTareaStore();
  const { documentos } = useDocumentoStore();
  const { movimientos } = useTesoreriaStore();

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(widgets);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index,
    }));

    setWidgets(updatedItems);
  };

  const toggleWidget = (widgetId: string) => {
    setWidgets(widgets.map(widget =>
      widget.id === widgetId ? { ...widget, enabled: !widget.enabled } : widget
    ));
  };

  const toggleStar = (widgetId: string) => {
    setWidgets(widgets.map(widget =>
      widget.id === widgetId ? { ...widget, starred: !widget.starred } : widget
    ));
  };

  const renderWidget = (widget: Widget) => {
    const commonProps = {
      title: (
        <div className="flex items-center justify-between">
          <span>{widget.title}</span>
          <Space>
            <Tooltip title={widget.description}>
              <InfoCircleOutlined className="text-gray-400" />
            </Tooltip>
            <Button
              type="text"
              icon={widget.starred ? <StarFilled className="text-yellow-400" /> : <StarOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                toggleStar(widget.id);
              }}
            />
          </Space>
        </div>
      ),
    };

    switch (widget.id) {
      case 'expedientes':
        return (
          <DashboardCard
            {...commonProps}
            value={expedientes.filter(e => e.estado === 'activo').length}
            color="primary"
            trend={{
              value: 12,
              label: "último mes",
              isPositive: true
            }}
          />
        );
      case 'tareas':
        return (
          <DashboardCard
            {...commonProps}
            value={tareas.filter(t => t.estado === 'pendiente').length}
            color="warning"
            trend={{
              value: 5,
              label: "último mes",
              isPositive: false
            }}
          />
        );
      case 'documentos':
        return (
          <DashboardCard
            {...commonProps}
            value={documentos.length}
            color="accent"
            trend={{
              value: 8,
              label: "último mes",
              isPositive: true
            }}
          />
        );
      case 'finanzas':
        return (
          <DashboardCard
            {...commonProps}
            value={`$${movimientos
              .filter(m => m.tipo === 'ingreso')
              .reduce((sum, m) => sum + m.monto, 0)
              .toLocaleString()}`}
            color="success"
            trend={{
              value: 15,
              label: "mes anterior",
              isPositive: true
            }}
          />
        );
      case 'plazos':
        return (
          <DashboardCard
            {...commonProps}
            value={expedientes.filter(e => {
              const plazo = new Date(e.plazo);
              const hoy = new Date();
              const diffTime = plazo.getTime() - hoy.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              return diffDays <= 7 && diffDays > 0;
            }).length}
            color="danger"
          />
        );
      case 'audiencias':
        return (
          <DashboardCard
            {...commonProps}
            value={expedientes.filter(e => e.audiencia && new Date(e.audiencia) > new Date()).length}
            color="secondary"
          />
        );
      default:
        return null;
    }
  };

  const renderWidgetsByCategory = (category: string) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {widgets
          .filter(widget => widget.enabled && widget.category === category)
          .sort((a, b) => {
            if (a.starred !== b.starred) return a.starred ? -1 : 1;
            return a.order - b.order;
          })
          .map((widget, index) => (
            <div key={widget.id} className="widget-container">
              {renderWidget(widget)}
            </div>
          ))}
      </div>
    );
  };

  return (
    <div className="dashboard-content" style={{ width: '100%' }}>
      <div className="dashboard-personalizable">
        <div className="dashboard-header">
          <Row align="middle" justify="space-between">
            <Col>
              <Title level={2}>Dashboard personalizable</Title>
              <Text type="secondary">Personaliza tu panel de control según tus necesidades</Text>
            </Col>
            <Col>
              <Space>
                <Button
                  type="primary"
                  className="config-button"
                  icon={<SettingOutlined />}
                  onClick={() => setIsConfigModalVisible(true)}
                >
                  Configurar widgets
                </Button>
                <ThemeToggle />
              </Space>
            </Col>
          </Row>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          className="dashboard-tabs"
        >
          <TabPane
            tab={
              <span>
                Urgente
                <Badge
                  count={widgets.filter(w => w.category === 'urgente' && w.enabled).length}
                  style={{ marginLeft: '8px' }}
                />
              </span>
            }
            key="urgente"
          >
            <div className="dashboard-grid">
              {renderWidgetsByCategory('urgente')}
            </div>
          </TabPane>
          <TabPane
            tab={
              <span>
                Importante
                <Badge
                  count={widgets.filter(w => w.category === 'importante' && w.enabled).length}
                  style={{ marginLeft: '8px' }}
                />
              </span>
            }
            key="importante"
          >
            <div className="dashboard-grid">
              {renderWidgetsByCategory('importante')}
            </div>
          </TabPane>
          <TabPane
            tab={
              <span>
                General
                <Badge
                  count={widgets.filter(w => w.category === 'general' && w.enabled).length}
                  style={{ marginLeft: '8px' }}
                />
              </span>
            }
            key="general"
          >
            <div className="dashboard-grid">
              {renderWidgetsByCategory('general')}
            </div>
          </TabPane>
        </Tabs>
      </div>

      <Modal
        title="Personalizar Panel de Control"
        open={isConfigModalVisible}
        onCancel={() => setIsConfigModalVisible(false)}
        width={600}
        className="widget-config-modal"
        footer={[
          <Button key="cancel" onClick={() => setIsConfigModalVisible(false)}>
            Cancelar
          </Button>,
          <Button key="save" type="primary" onClick={() => setIsConfigModalVisible(false)}>
            Guardar Cambios
          </Button>,
        ]}
      >
        <div className="mb-4">
          <Text type="secondary">
            Arrastra los widgets para reordenarlos y marca/desmarca para mostrar/ocultar
          </Text>
        </div>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="widgets-config">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {widgets.map((widget, index) => (
                  <Draggable key={widget.id} draggableId={widget.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="widget-config-item mb-4 p-4 border rounded-lg flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          <DragOutlined className="mr-4 text-gray-400" {...provided.dragHandleProps} />
                          <Checkbox
                            checked={widget.enabled}
                            onChange={() => toggleWidget(widget.id)}
                          >
                            <div className="flex flex-col">
                              <span>{widget.title}</span>
                              <Text type="secondary" className="text-xs">
                                {widget.description}
                              </Text>
                            </div>
                          </Checkbox>
                        </div>
                        <Badge
                          count={widget.category}
                          style={{
                            backgroundColor: widget.category === 'urgente' ? '#ff4d4f' :
                              widget.category === 'importante' ? '#faad14' : '#1890ff'
                          }}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </Modal>
    </div>
  );
};

export default DashboardPersonalizable;
