import React from 'react';
import { Button, Tooltip } from 'antd';
import { BulbOutlined, BulbFilled } from '@ant-design/icons';
import { useTheme } from '../../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === 'dark';

  return (
    <Tooltip
      title={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      color={isDarkMode ? "#1f1f1f" : undefined}
    >
      <Button
        type="text"
        icon={
          isDarkMode ? (
            <BulbOutlined className="text-yellow-400" style={{ fontSize: '18px' }} />
          ) : (
            <BulbFilled className="text-yellow-500" style={{ fontSize: '18px' }} />
          )
        }
        onClick={toggleTheme}
        className="theme-toggle-btn"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          padding: 0,
          background: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.03)',
          boxShadow: 'none',
          transition: 'all 0.3s ease'
        }}
      />
    </Tooltip>
  );
};

export default ThemeToggle;
