import React from 'react';
import { Switch } from 'antd';
import { BulbOutlined, BulbFilled } from '@ant-design/icons';
import { useTheme } from './ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === 'dark';

  return (
    <div className="theme-toggle">
      <Switch
        checked={isDarkMode}
        onChange={toggleTheme}
        checkedChildren={<BulbOutlined />}
        unCheckedChildren={<BulbFilled />}
      />
      <style jsx>{`
        .theme-toggle {
          margin-left: 16px;
        }
      `}</style>
    </div>
  );
};

export default ThemeToggle;
