import React from 'react';
import { Badge, Button, Space, Tag, Tooltip } from 'antd';
import { CalendarEvent } from '../../stores/calendarStore';
import { Expediente } from '../../types';
import { LinkOutlined, EyeOutlined, BellOutlined } from '@ant-design/icons';
import { useAccessibility } from '../ui/AccessibilityProvider';

interface EventProps {
  event: CalendarEvent;
  expediente?: Expediente | null;
  onClick: () => void;
  onNavigateToExpediente: (id: string) => void;
}

const EventComponent: React.FC<EventProps> = ({
  event,
  expediente,
  onClick,
  onNavigateToExpediente
}) => {
  const { highContrast, largeText } = useAccessibility();

  const handleExpedienteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (expediente) {
      onNavigateToExpediente(expediente.id);
    }
  };

  const getColorByTipo = (tipo: string) => {
    if (highContrast) {
      // Colores de alto contraste para accesibilidad
      switch (tipo) {
        case 'audiencia': return 'black';
        case 'vencimiento': return 'darkblue';
        case 'reunion': return 'darkgreen';
        case 'otro': return 'purple';
        default: return 'gray';
      }
    } else {
      // Colores normales
      switch (tipo) {
        case 'audiencia': return 'error';
        case 'vencimiento': return 'warning';
        case 'reunion': return 'success';
        case 'otro': return 'processing';
        default: return 'default';
      }
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
      className={`evento-container ${expediente ? 'evento-with-expediente' : ''} ${highContrast ? 'high-contrast' : ''} ${largeText ? 'large-text' : ''}`}
      role="button"
      aria-label={`Evento: ${event.title}${expediente ? ` relacionado con expediente ${expediente.numero}` : ''}, tipo: ${getTipoLabel(event.tipo)}${event.ubicacion ? `, ubicación: ${event.ubicacion}` : ''}`}
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick();
        }
      }}
    >
      <div className="evento-header">
        <Space size="small">
          <span className="evento-titulo">{event.title}</span>
          {event.recordatorio && (
            <Tooltip title="Tiene recordatorio">
              <Badge dot>
                <BellOutlined style={{ color: 'rgba(0,0,0,0.45)' }} />
              </Badge>
            </Tooltip>
          )}
        </Space>
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
          <Tooltip title={`Expediente: ${expediente.numero} - ${expediente.titulo}`}>
            <Tag
              icon={<LinkOutlined />}
              color="blue"
              className="evento-expediente-tag"
              onClick={handleExpedienteClick}
            >
              Exp: {expediente.numero}
            </Tag>
          </Tooltip>
        )}
      </div>
    </div>
  );
};

export default EventComponent;
