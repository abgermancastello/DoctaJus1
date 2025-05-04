import React from 'react';
import {
  Drawer,
  Switch,
  Typography,
  Divider,
  Button,
  Tooltip,
  Space
} from 'antd';
import {
  EyeOutlined,
  FontSizeOutlined,
  SoundOutlined,
  ThunderboltOutlined,
  KeyOutlined,
  UndoOutlined
} from '@ant-design/icons';
import { useAccessibility } from './AccessibilityProvider';

const { Title, Text, Paragraph } = Typography;

interface AccessibilityPanelProps {
  visible: boolean;
  onClose: () => void;
}

const AccessibilityPanel: React.FC<AccessibilityPanelProps> = ({ visible, onClose }) => {
  const {
    highContrast,
    largeText,
    readAloud,
    reducedMotion,
    keyboardNavigation,
    toggleHighContrast,
    toggleLargeText,
    toggleReadAloud,
    toggleReducedMotion,
    toggleKeyboardNavigation,
    resetSettings
  } = useAccessibility();

  return (
    <Drawer
      title={
        <div className="flex items-center">
          <ThunderboltOutlined className="mr-2" />
          <span>Opciones de Accesibilidad</span>
        </div>
      }
      placement="right"
      onClose={onClose}
      open={visible}
      width={320}
      footer={
        <div className="flex justify-end">
          <Button
            onClick={resetSettings}
            icon={<UndoOutlined />}
          >
            Restablecer
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <Paragraph className="text-text-secondary">
          Personaliza la interfaz para adaptarla a tus necesidades de accesibilidad.
        </Paragraph>

        <Divider />

        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <Space>
              <EyeOutlined className="text-primary-500" />
              <div>
                <Text strong>Contraste Alto</Text>
                <div className="text-xs text-text-secondary">
                  Mejora la legibilidad con colores de alto contraste
                </div>
              </div>
            </Space>
            <Switch checked={highContrast} onChange={toggleHighContrast} />
          </div>

          <div className="flex justify-between items-center">
            <Space>
              <FontSizeOutlined className="text-primary-500" />
              <div>
                <Text strong>Texto Grande</Text>
                <div className="text-xs text-text-secondary">
                  Aumenta el tamaño del texto en toda la aplicación
                </div>
              </div>
            </Space>
            <Switch checked={largeText} onChange={toggleLargeText} />
          </div>

          <div className="flex justify-between items-center">
            <Space>
              <SoundOutlined className="text-primary-500" />
              <div>
                <Text strong>Lector de Pantalla</Text>
                <div className="text-xs text-text-secondary">
                  Mejora la compatibilidad con lectores de pantalla
                </div>
              </div>
            </Space>
            <Switch checked={readAloud} onChange={toggleReadAloud} />
          </div>

          <div className="flex justify-between items-center">
            <Space>
              <ThunderboltOutlined className="text-primary-500" />
              <div>
                <Text strong>Reducir Animaciones</Text>
                <div className="text-xs text-text-secondary">
                  Disminuye o elimina efectos animados
                </div>
              </div>
            </Space>
            <Switch checked={reducedMotion} onChange={toggleReducedMotion} />
          </div>

          <div className="flex justify-between items-center">
            <Space>
              <KeyOutlined className="text-primary-500" />
              <div>
                <Text strong>Navegación por Teclado</Text>
                <div className="text-xs text-text-secondary">
                  Mejora el enfoque de elementos para uso con teclado
                </div>
              </div>
            </Space>
            <Switch checked={keyboardNavigation} onChange={toggleKeyboardNavigation} />
          </div>
        </div>

        <Divider />

        <div className="bg-primary-50 p-3 rounded-md">
          <Title level={5} className="!mt-0 !mb-2">Información</Title>
          <Text className="text-sm">
            Estas opciones se guardarán automáticamente y se aplicarán cada vez
            que uses DoctaJus. Para obtener ayuda adicional, contacta a soporte.
          </Text>
        </div>
      </div>
    </Drawer>
  );
};

export default AccessibilityPanel;
