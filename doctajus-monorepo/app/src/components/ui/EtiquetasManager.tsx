import React, { useState, useEffect } from 'react';
import {
  Modal,
  Tag,
  Input,
  Button,
  ColorPicker,
  Space,
  Typography,
  Divider,
  Tooltip,
  Empty
} from 'antd';
import * as Icons from '@ant-design/icons';
import type { Etiqueta } from '../../types';
import { useAccessibility } from './AccessibilityProvider';

const { Text, Title } = Typography;

interface EtiquetasManagerProps {
  tareaId: string;
  etiquetas: Etiqueta[];
  etiquetasTarea: string[];
  onAddEtiqueta: (tareaId: string, etiquetaId: string) => Promise<void>;
  onRemoveEtiqueta: (tareaId: string, etiquetaId: string) => Promise<void>;
  onClose: () => void;
}

const EtiquetasManager: React.FC<EtiquetasManagerProps> = ({
  tareaId,
  etiquetas,
  etiquetasTarea,
  onAddEtiqueta,
  onRemoveEtiqueta,
  onClose
}) => {
  const { highContrast, largeText } = useAccessibility();
  const [loading, setLoading] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [adding, setAdding] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Etiquetas filtradas según el término de búsqueda
  const etiquetasFiltradas = etiquetas.filter(
    etiqueta => etiqueta.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Etiquetas asignadas a la tarea
  const etiquetasAsignadas = etiquetas.filter(
    etiqueta => etiquetasTarea.includes(etiqueta.id)
  );

  // Etiquetas disponibles (no asignadas)
  const etiquetasDisponibles = etiquetas.filter(
    etiqueta => !etiquetasTarea.includes(etiqueta.id)
  );

  // Filtrar etiquetas disponibles por término de búsqueda
  const etiquetasDisponiblesFiltradas = etiquetasDisponibles.filter(
    etiqueta => etiqueta.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Asignar una etiqueta a la tarea
  const handleAsignarEtiqueta = async (etiquetaId: string) => {
    try {
      setAdding(etiquetaId);
      await onAddEtiqueta(tareaId, etiquetaId);
    } catch (error) {
      console.error('Error al asignar etiqueta:', error);
    } finally {
      setAdding(null);
    }
  };

  // Eliminar una etiqueta de la tarea
  const handleQuitarEtiqueta = async (etiquetaId: string) => {
    try {
      setRemoving(etiquetaId);
      await onRemoveEtiqueta(tareaId, etiquetaId);
    } catch (error) {
      console.error('Error al quitar etiqueta:', error);
    } finally {
      setRemoving(null);
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center">
          <Icons.TagOutlined className="mr-2" />
          <span>Gestionar Etiquetas</span>
        </div>
      }
      open={true}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Cerrar
        </Button>
      ]}
      width={500}
    >
      <div className="mb-4">
        <Input
          placeholder="Buscar etiquetas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          prefix={<Icons.SearchOutlined className="text-gray-400" />}
          allowClear
          className="w-full"
        />
      </div>

      <div className={`p-4 border border-gray-200 rounded-md mb-4 ${highContrast ? 'border-black' : ''}`}>
        <Title level={5} className="mt-0 mb-3">Etiquetas asignadas</Title>

        {etiquetasAsignadas.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No hay etiquetas asignadas"
            className="my-4"
          />
        ) : (
          <div className="flex flex-wrap gap-2">
            {etiquetasAsignadas.map(etiqueta => (
              <Tag
                key={etiqueta.id}
                color={highContrast ? undefined : etiqueta.color}
                style={highContrast ? {
                  backgroundColor: '#fff',
                  color: '#000',
                  borderColor: '#000',
                  borderWidth: '2px'
                } : undefined}
                className={`mb-2 ${largeText ? 'text-base py-1 px-3' : ''}`}
                closable
                onClose={() => handleQuitarEtiqueta(etiqueta.id)}
              >
                {highContrast && (
                  <div
                    className="inline-block w-3 h-3 mr-1 rounded-full"
                    style={{ backgroundColor: etiqueta.color }}
                  />
                )}
                {etiqueta.nombre}
              </Tag>
            ))}
          </div>
        )}
      </div>

      <Divider className="my-4" />

      <div className={`p-4 border border-gray-200 rounded-md ${highContrast ? 'border-black' : ''}`}>
        <Title level={5} className="mt-0 mb-3">Etiquetas disponibles</Title>

        {etiquetasDisponiblesFiltradas.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              searchTerm
                ? "No se encontraron etiquetas que coincidan con la búsqueda"
                : "No hay más etiquetas disponibles"
            }
            className="my-4"
          />
        ) : (
          <div className="flex flex-wrap gap-2">
            {etiquetasDisponiblesFiltradas.map(etiqueta => (
              <Tag
                key={etiqueta.id}
                color={highContrast ? undefined : etiqueta.color}
                style={highContrast ? {
                  backgroundColor: '#fff',
                  color: '#000',
                  borderColor: '#000',
                  borderWidth: '2px'
                } : undefined}
                className={`mb-2 cursor-pointer hover:opacity-80 ${largeText ? 'text-base py-1 px-3' : ''}`}
                onClick={() => handleAsignarEtiqueta(etiqueta.id)}
              >
                {highContrast && (
                  <div
                    className="inline-block w-3 h-3 mr-1 rounded-full"
                    style={{ backgroundColor: etiqueta.color }}
                  />
                )}
                {etiqueta.nombre}
                <Icons.PlusOutlined className="ml-1" />
              </Tag>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default EtiquetasManager;
