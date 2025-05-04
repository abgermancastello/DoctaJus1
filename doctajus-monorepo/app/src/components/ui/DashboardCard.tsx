import React, { ReactNode } from 'react';
import { Card, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  footer?: ReactNode;
  tooltip?: string;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'secondary' | 'accent' | 'default';
  loading?: boolean;
  className?: string;
  onClick?: () => void;
  trend?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  icon,
  footer,
  tooltip,
  color = 'default',
  loading = false,
  className = '',
  onClick,
  trend,
}) => {
  // Mapeo de colores según el sistema de diseño
  const colorMap = {
    primary: {
      base: '#1890ff',
      gradient: 'linear-gradient(135deg, #1890ff 0%, #69c0ff 100%)',
      light: 'rgba(24, 144, 255, 0.1)',
    },
    secondary: {
      base: '#13c2c2',
      gradient: 'linear-gradient(135deg, #13c2c2 0%, #5cdbd3 100%)',
      light: 'rgba(19, 194, 194, 0.1)',
    },
    success: {
      base: '#52c41a',
      gradient: 'linear-gradient(135deg, #52c41a 0%, #85eab9 100%)',
      light: 'rgba(82, 196, 26, 0.1)',
    },
    warning: {
      base: '#faad14',
      gradient: 'linear-gradient(135deg, #faad14 0%, #fdd64b 100%)',
      light: 'rgba(250, 173, 20, 0.1)',
    },
    danger: {
      base: '#f5222d',
      gradient: 'linear-gradient(135deg, #f5222d 0%, #fba5a5 100%)',
      light: 'rgba(245, 34, 45, 0.1)',
    },
    accent: {
      base: '#9287ce',
      gradient: 'linear-gradient(135deg, #7c6abd 0%, #c5c3e8 100%)',
      light: 'rgba(146, 135, 206, 0.1)',
    },
    default: {
      base: 'transparent',
      gradient: 'linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%)',
      light: 'rgba(0, 0, 0, 0.02)',
    },
  };

  const selectedColor = colorMap[color];
  const borderColor = color !== 'default' ? selectedColor.base : undefined;
  const iconColor = color !== 'default' ? selectedColor.base : 'rgba(0, 0, 0, 0.45)';

  const renderTrend = () => {
    if (!trend) return null;

    return (
      <div className="flex items-center mt-1">
        <span
          className={`inline-flex items-center text-sm font-medium ${trend.isPositive ? 'text-success-DEFAULT' : 'text-danger-DEFAULT'} mr-1`}
        >
          {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
        </span>
        <span className="text-xs text-text-secondary">{trend.label}</span>
      </div>
    );
  };

  return (
    <Card
      loading={loading}
      className={`dashboard-card transform transition-all duration-normal hover:shadow-card hover:-translate-y-1 ${className}`}
      style={{
        borderRadius: '12px',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        border: '1px solid rgba(0, 0, 0, 0.06)',
      }}
      styles={{
        body: {
          padding: '20px',
          position: 'relative',
          zIndex: 1,
          height: '100%',
          background: color !== 'default' ? `${selectedColor.light}` : '#fff',
        }
      }}
      onClick={onClick}
    >
      {color !== 'default' && (
        <div
          className="absolute top-0 left-0 w-2 h-full"
          style={{ background: selectedColor.gradient }}
        />
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-lg font-medium text-text-secondary">{title}</span>
          {tooltip && (
            <Tooltip title={tooltip} placement="top">
              <InfoCircleOutlined className="ml-2 text-text-disabled" />
            </Tooltip>
          )}
        </div>
        {icon && (
          <div
            className="text-2xl flex items-center justify-center rounded-full p-2 transition-all duration-normal"
            style={{
              color: iconColor,
              background: color !== 'default' ? selectedColor.light : 'rgba(0, 0, 0, 0.02)',
            }}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="text-3xl font-semibold mt-2 mb-2">{value}</div>

      {renderTrend()}

      {footer && (
        <div className="mt-4 text-sm text-text-secondary border-t border-border-light pt-3">
          {footer}
        </div>
      )}
    </Card>
  );
};

export default DashboardCard;
