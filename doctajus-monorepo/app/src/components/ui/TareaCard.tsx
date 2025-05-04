import React, { useState } from 'react';
import {
  Card,
  Tag,
  Button,
  Dropdown,
  Menu,
  Space,
  Popover,
  message
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  CalendarOutlined,
  CommentOutlined,
  ShareAltOutlined,
  TagOutlined
} from '@ant-design/icons';
import { EstadoTarea, PrioridadTarea, Tarea, Etiqueta } from '../../types';
import ComentariosTarea from './ComentariosTarea';

// Componentes React.lazy para carga perezosa
const LazyEtiquetasManager = React.lazy(() =>
  import('./EtiquetasManager').then(module => ({
    default: module.default
  }))
);

interface TareaCardProps {
  tarea: Tarea;
  onEdit: (id: string) => void;
  onDelete: (id: string, titulo: string) => void;
  onCambioEstado: (id: string, estado: EstadoTarea) => void;
  onCompartir: (tarea: Tarea) => void;
  onGestionarEtiquetas: (id: string) => void;
  onAddEtiqueta?: (tareaId: string, etiquetaId: string) => Promise<void>;
  onRemoveEtiqueta?: (tareaId: string, etiquetaId: string) => Promise<void>;
  etiquetas?: Etiqueta[];
  usuarioActualId: string;
  usuarioActualNombre: string;
  estadoIcon: (estado: EstadoTarea) => React.ReactNode;
  prioridadClass: (prioridad: PrioridadTarea) => string;
  formatDate: (date: string | Date) => string;
  gestionandoEtiquetas: string | null;
  setGestionandoEtiquetas: (id: string | null) => void;
}

const TareaCard: React.FC<TareaCardProps> = ({
  tarea,
  onEdit,
  onDelete,
  onCambioEstado,
  onCompartir,
  onGestionarEtiquetas,
  onAddEtiqueta,
  onRemoveEtiqueta,
  etiquetas = [],
  usuarioActualId,
  usuarioActualNombre,
  estadoIcon,
  prioridadClass,
  formatDate,
  gestionandoEtiquetas,
  setGestionandoEtiquetas
}) => {
  const [mostrarComentarios, setMostrarComentarios] = useState<boolean>(false);
  const [loadingAction, setLoadingAction] = useState<boolean>(false);

  const handleToggleComentarios = () => {
    setMostrarComentarios(prev => !prev);
  };

  const renderEtiquetasPopover = () => {
    // Evitar renderizar si no hay manejadores de eventos
    if (!onAddEtiqueta || !onRemoveEtiqueta) {
      return <div>No se pueden gestionar etiquetas en este momento</div>;
    }

    return (
      <React.Suspense fallback={<div>Cargando...</div>}>
        <LazyEtiquetasManager
          tareaId={tarea.id}
          etiquetas={etiquetas}
          etiquetasTarea={tarea.etiquetas?.map(e => e.id) || []}
          onAddEtiqueta={async (tareaId: string, etiquetaId: string) => {
            try {
              setLoadingAction(true);
              await onAddEtiqueta(tareaId, etiquetaId);
              message.success('Etiqueta añadida correctamente');
            } catch (error) {
              message.error('Error al añadir la etiqueta');
              console.error(error);
            } finally {
              setLoadingAction(false);
            }
          }}
          onRemoveEtiqueta={async (tareaId: string, etiquetaId: string) => {
            try {
              setLoadingAction(true);
              await onRemoveEtiqueta(tareaId, etiquetaId);
              message.success('Etiqueta eliminada correctamente');
            } catch (error) {
              message.error('Error al eliminar la etiqueta');
              console.error(error);
            } finally {
              setLoadingAction(false);
            }
          }}
          onClose={() => setGestionandoEtiquetas(null)}
        />
      </React.Suspense>
    );
  };

  return (
    <Card
      className="w-full hover:shadow-md transition-shadow duration-normal"
      bodyStyle={{ padding: '16px' }}
    >
      <div className="flex flex-col md:flex-row md:items-center">
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              {estadoIcon(tarea.estado)}
              <h3 className="text-lg font-medium ml-2">{tarea.titulo}</h3>
            </div>
            <Tag color={prioridadClass(tarea.prioridad)}>
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
                content={renderEtiquetasPopover}
                title="Gestionar etiquetas"
                trigger="click"
                visible={gestionandoEtiquetas === tarea.id}
                onVisibleChange={(visible) => !visible && setGestionandoEtiquetas(null)}
              >
                <Tag
                  className="cursor-pointer"
                  onClick={() => onGestionarEtiquetas(tarea.id)}
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
              onClick={() => onEdit(tarea.id)}
            >
              Editar
            </Button>
            {tarea.estado !== EstadoTarea.COMPLETADA && (
              <Button
                type="text"
                icon={<CheckOutlined />}
                onClick={() => onCambioEstado(tarea.id, EstadoTarea.COMPLETADA)}
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
                    onClick={handleToggleComentarios}
                  >
                    Comentarios
                  </Menu.Item>
                  <Menu.Item
                    icon={<ShareAltOutlined />}
                    onClick={() => onCompartir(tarea)}
                  >
                    Compartir
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => onDelete(tarea.id, tarea.titulo)}
                  >
                    Eliminar
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
      {mostrarComentarios && (
        <div className="mt-4 pt-4 border-t border-border-light">
          <ComentariosTarea
            tareaId={tarea.id}
            usuarioActualId={usuarioActualId}
            usuarioActualNombre={usuarioActualNombre}
          />
        </div>
      )}
    </Card>
  );
};

export default React.memo(TareaCard);
