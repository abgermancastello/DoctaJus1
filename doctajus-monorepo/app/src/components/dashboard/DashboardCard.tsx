import React from 'react';
import { Card, Statistic, Typography, Space } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { StatisticProps } from 'antd/lib/statistic/Statistic';

const { Text } = Typography;

interface TrendData {
  value: number;
  label?: string;
  isPositive: boolean;
}

interface DashboardCardProps {
  title: React.ReactNode;
  value: string | number;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'secondary' | 'accent';
  trend?: TrendData;
  suffix?: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  footer?: React.ReactNode;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  color = 'primary',
  trend,
  suffix,
  className,
  icon,
  footer
}) => {
  const colorMap = {
    primary: 'var(--primary-color)',
    success: 'var(--success-color)',
    warning: 'var(--warning-color)',
    danger: 'var(--danger-color)',
    secondary: '#13c2c2',
    accent: '#9287ce',
  };

  return (
    <Card
      className={`dashboard-card ${className || ''}`}
      bordered={false}
      style={{
        borderLeft: `4px solid ${colorMap[color]}`,
        height: '100%',
      }}
    >
      <Statistic
        title={<div className="dashboard-card-title">{title}</div>}
        value={value}
        valueStyle={{
          fontSize: 28,
          fontWeight: 600,
          color: 'var(--text-primary)'
        }}
        suffix={suffix}
        prefix={icon}
      />

      {trend && (
        <Space align="center" style={{ marginTop: 8 }}>
          {trend.isPositive ? (
            <ArrowUpOutlined style={{ color: 'var(--success-color)' }} />
          ) : (
            <ArrowDownOutlined style={{ color: 'var(--danger-color)' }} />
          )}
          <Text
            style={{
              fontSize: '14px',
              color: trend.isPositive ? 'var(--success-color)' : 'var(--danger-color)'
            }}
          >
            {trend.value}% {trend.label && <span style={{ color: 'var(--text-secondary)' }}>{trend.label}</span>}
          </Text>
        </Space>
      )}

      {footer && (
        <div className="dashboard-card-footer" style={{ marginTop: 16 }}>
          {footer}
        </div>
      )}
    </Card>
  );
};

export default DashboardCard;
