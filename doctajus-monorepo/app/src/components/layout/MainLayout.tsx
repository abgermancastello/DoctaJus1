import React, { useState } from 'react';
import { Layout, Button, Avatar, Badge, Typography, Input, Tooltip, Dropdown, Menu } from 'antd';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import {
  BellOutlined,
  SearchOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
  UserOutlined,
  DownOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  FileOutlined,
  CalendarOutlined,
  LogoutOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import Sidebar from './Sidebar';
import theme from '../../styles/theme';
import type { MenuProps } from 'antd';
import AccessibilityPanel from '../ui/AccessibilityPanel';
import { useAuthStore } from '../../stores/authStore';
import { useSidebar } from '../../contexts/SidebarContext';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

const userMenuItems: MenuProps['items'] = [
  {
    key: 'profile',
    label: 'Mi Perfil',
    icon: <UserOutlined />,
  },
  {
    key: 'settings',
    label: 'Configuración',
    icon: <SettingOutlined />,
  },
  {
    type: 'divider',
  },
  {
    key: 'logout',
    label: 'Cerrar Sesión',
    danger: true,
  },
];

const MainLayout: React.FC = () => {
  const [showAccessibilityPanel, setShowAccessibilityPanel] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { collapsed } = useSidebar(); // Usar el estado de collapsed desde el contexto

  const handleUserMenuClick = ({ key }: { key: string }) => {
    // Manejar acciones del menú de usuario
    console.log('User menu clicked:', key);
  };

  const handleLogoClick = () => {
    navigate('/dashboard');
  };

  // Menu de usuario desplegable
  const userMenu = (
    <Menu
      items={userMenuItems}
      onClick={handleUserMenuClick}
      className="user-dropdown-menu"
    />
  );

  // Agregar un skip link para navegación por teclado
  const skipLink = (
    <a href="#main-content" className="skip-link">
      Saltar al contenido principal
    </a>
  );

  return (
    <div className="app-root-container" style={{
      position: 'relative',
      width: '100%',
      minHeight: '100vh',
      overflow: 'hidden'
    }}>
      {/* CAPA 1: SIDEBAR */}
      <aside
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: collapsed ? '80px' : '260px',
          zIndex: 1,
          transition: 'width 0.3s ease',
          overflow: 'hidden'
        }}
      >
        <Sidebar />
      </aside>

      {/* CAPA 2: CONTENIDO PRINCIPAL */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: collapsed ? '80px' : '260px',
          transition: 'left 0.3s ease',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <header
          style={{
            padding: '0 24px',
            background: '#fff',
            boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 10
          }}
        >
          <div className="header-left">
            <Title level={4} style={{ margin: 0 }}>DoctaJus</Title>
          </div>
          <div className="header-right">
            <Input
              prefix={<SearchOutlined className="text-text-disabled" />}
              placeholder="Buscar..."
              style={{
                width: 250,
                borderRadius: '8px',
                background: theme.colors.background.light,
                border: '1px solid transparent',
              }}
            />

            <Tooltip title="Ayuda">
              <Button
                type="text"
                icon={<QuestionCircleOutlined style={{ fontSize: '20px' }} />}
                shape="circle"
                className="hover:bg-background-light transition-colors duration-fast"
              />
            </Tooltip>

            <Tooltip title="Notificaciones">
              <Badge count={5} size="small">
                <Button
                  type="text"
                  icon={<BellOutlined style={{ fontSize: '20px' }} />}
                  shape="circle"
                  className="hover:bg-background-light transition-colors duration-fast"
                />
              </Badge>
            </Tooltip>

            <Tooltip title="Opciones de accesibilidad">
              <Button
                type="text"
                icon={<ThunderboltOutlined />}
                onClick={() => setShowAccessibilityPanel(true)}
                aria-label="Abrir panel de accesibilidad"
                className="accessibility-button"
              />
            </Tooltip>

            <Dropdown
              overlay={userMenu}
              trigger={['click']}
              placement="bottomRight"
            >
              <div className="user-profile flex items-center cursor-pointer hover:bg-background-light px-2 py-1 rounded-lg transition-colors duration-fast">
                <Avatar
                  size="small"
                  src="https://i.pravatar.cc/300"
                  className="mr-2 border border-solid border-gray-200"
                />
                <Text strong className="mr-1">Dr. Martínez</Text>
                <DownOutlined style={{ fontSize: '12px', color: theme.colors.text.secondary }} />
              </div>
            </Dropdown>
          </div>
        </header>

        <main style={{
          padding: '24px',
          flex: '1 1 auto',
          overflow: 'auto',
          background: '#f0f2f5'
        }}>
          <Outlet />
        </main>
      </div>

      {/* CAPA 3: PANEL DE ACCESIBILIDAD (siempre por encima) */}
      <AccessibilityPanel
        visible={showAccessibilityPanel}
        onClose={() => setShowAccessibilityPanel(false)}
      />
    </div>
  );
};

export default MainLayout;
