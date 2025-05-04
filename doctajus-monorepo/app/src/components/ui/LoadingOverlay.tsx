import React from 'react';
import { Spin, Typography } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useAccessibility } from './AccessibilityProvider';

const { Text } = Typography;

interface LoadingOverlayProps {
  mensaje?: string;
  fullScreen?: boolean;
  transparent?: boolean;
  size?: 'small' | 'default' | 'large';
}

/**
 * Componente que muestra un indicador de carga con una superposición opcional
 */
const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  mensaje = 'Cargando...',
  fullScreen = false,
  transparent = false,
  size = 'default'
}) => {
  const { highContrast } = useAccessibility();

  // Determinar el tamaño del ícono
  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 24;
      case 'large':
        return 48;
      case 'default':
      default:
        return 36;
    }
  };

  // Estilos condicionales basados en las props
  const containerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: fullScreen ? 0 : '2rem',
    height: fullScreen ? '100vh' : '100%',
    width: fullScreen ? '100vw' : '100%',
    position: fullScreen ? 'fixed' : 'relative',
    top: fullScreen ? 0 : undefined,
    left: fullScreen ? 0 : undefined,
    zIndex: fullScreen ? 1000 : 1,
    backgroundColor: transparent
      ? 'rgba(255, 255, 255, 0.7)'
      : (highContrast ? '#f0f0f0' : 'white')
  };

  // Color del icono según el modo de alto contraste
  const spinColor = highContrast ? '#000000' : '#1890ff';

  return (
    <div
      style={containerStyles}
      role="alert"
      aria-busy="true"
      aria-live="polite"
    >
      <Spin
        indicator={
          <LoadingOutlined
            style={{
              fontSize: getIconSize(),
              color: spinColor
            }}
            spin
          />
        }
      />
      {mensaje && (
        <Text
          style={{
            marginTop: '1rem',
            color: highContrast ? '#000000' : undefined
          }}
          aria-live="polite"
        >
          {mensaje}
        </Text>
      )}
    </div>
  );
};

export default LoadingOverlay;
