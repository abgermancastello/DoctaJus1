import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Tooltip, Badge, Typography, Avatar, Divider } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  DashboardOutlined,
  FileTextOutlined,
  CalendarOutlined,
  DollarOutlined,
  FolderOutlined,
  TeamOutlined,
  UserOutlined,
  CheckSquareOutlined,
  FileOutlined,
  BankOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  StarOutlined,
  StarFilled,
  AppstoreOutlined,
  RightOutlined,
  LeftOutlined,
  FileSearchOutlined,
  LockOutlined,
  GlobalOutlined,
  NotificationOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useSidebar } from '../../contexts/SidebarContext';
import theme from '../../styles/theme';
import './Sidebar.css';

const { Sider } = Layout;
const { Text } = Typography;

// Interfaces
interface MenuItem {
  key: string;
  icon: React.ReactNode;
  label: string;
  path: string;
  badge?: number;
}

interface Category {
  key: string;
  label: string;
  icon: React.ReactNode;
}

interface MenuItems {
  [key: string]: MenuItem[];
}

// Definir categorías
const categories: Category[] = [
  { key: 'main', label: 'Principal', icon: <AppstoreOutlined /> },
  { key: 'finance', label: 'Finanzas', icon: <DollarOutlined /> },
  { key: 'documents', label: 'Documentos', icon: <FolderOutlined /> },
  { key: 'admin', label: 'Administración', icon: <SettingOutlined /> },
];

// Definir todos los items del menú organizados por categoría
const menuItemsByCategory: MenuItems = {
  main: [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      path: '/',
    },
    {
      key: '/expedientes',
      icon: <FileTextOutlined />,
      label: 'Expedientes',
      path: '/expedientes',
      badge: 3,
    },
    {
      key: '/tareas',
      icon: <CheckSquareOutlined />,
      label: 'Tareas',
      path: '/tareas',
      badge: 5,
    },
    {
      key: '/calendario',
      icon: <CalendarOutlined />,
      label: 'Calendario',
      path: '/calendario',
    },
  ],
  finance: [
    {
      key: '/tesoreria',
      icon: <BankOutlined />,
      label: 'Tesorería',
      path: '/tesoreria',
    },
    {
      key: '/facturas',
      icon: <FileOutlined />,
      label: 'Facturación',
      path: '/facturas',
      badge: 2,
    },
    {
      key: '/config-finanzas',
      icon: <SettingOutlined />,
      label: 'Configuración',
      path: '/config-finanzas',
    },
  ],
  documents: [
    {
      key: '/documentos',
      icon: <FolderOutlined />,
      label: 'Documentos',
      path: '/documentos',
    },
    {
      key: '/plantillas',
      icon: <FileSearchOutlined />,
      label: 'Plantillas',
      path: '/plantillas',
    },
    {
      key: '/directorio',
      icon: <TeamOutlined />,
      label: 'Directorio',
      path: '/directorio',
    },
  ],
  admin: [
    {
      key: '/perfil',
      icon: <UserOutlined />,
      label: 'Perfil',
      path: '/perfil',
    },
    {
      key: '/configuracion',
      icon: <SettingOutlined />,
      label: 'Configuración',
      path: '/configuracion',
    },
    {
      key: '/permisos',
      icon: <LockOutlined />,
      label: 'Permisos',
      path: '/permisos',
    },
  ],
};

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    collapsed,
    setCollapsed,
    toggleCollapsed,
    favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    activeCategory,
    setActiveCategory
  } = useSidebar();

  // Determinar la categoría activa basada en la ruta
  useEffect(() => {
    const path = location.pathname;
    const category = categories.find(cat =>
      menuItemsByCategory[cat.key].some(item =>
        path === item.path || path.startsWith(item.path + '/')
      )
    );
    if (category) {
      setActiveCategory(category.key);
    }
  }, [location.pathname, setActiveCategory]);

  // Renderizar un ítem del menú
  const createMenuItem = (item: MenuItem) => {
    const isActive = location.pathname === item.path;
    const isFav = isFavorite(item.key);

    return {
      key: item.key,
      onClick: () => navigate(item.path),
      className: `menu-item ${isActive ? 'menu-item-active' : ''}`,
      label: (
        <Tooltip title={collapsed ? item.label : ''} placement="right" mouseEnterDelay={0.5}>
          <div className="menu-item-content">
            <div className="menu-item-text">
              <span className={`menu-icon ${isActive ? 'menu-icon-active' : ''}`}>
                {item.icon}
              </span>
              {!collapsed && (
                item.badge ? (
                  <Badge count={item.badge} size="small" className="pulse-badge">
                    <span>{item.label}</span>
                  </Badge>
                ) : (
                  <span>{item.label}</span>
                )
              )}
            </div>
            {!collapsed && (
              <Tooltip title={isFav ? 'Quitar de favoritos' : 'Añadir a favoritos'}>
                <Button
                  type="text"
                  size="small"
                  className={`favorite-btn ${isFav ? 'favorite-active' : ''}`}
                  icon={isFav ? <StarFilled style={{ color: theme.colors.warning }} /> : <StarOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    isFav ? removeFromFavorites(item.key) : addToFavorites(item);
                  }}
                />
              </Tooltip>
            )}
          </div>
        </Tooltip>
      )
    };
  };

  // Renderizar favoritos
  const getFavoriteItems = () => {
    if (!favorites.length || collapsed) return [];
    return favorites.map(item => createMenuItem(item));
  };

  // Renderizar items del menú principal
  const getCategoryItems = (categoryKey: string) => {
    return menuItemsByCategory[categoryKey].map(item => createMenuItem(item));
  };

  // Renderizar el perfil de usuario
  const renderUserProfile = () => (
    <div className="user-profile">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Avatar icon={<UserOutlined />} />
        {!collapsed && (
          <div>
            <Text strong>Dr. Martínez</Text>
            <Text type="secondary" style={{ display: 'block', fontSize: '12px' }}>
              Administrador
            </Text>
          </div>
        )}
      </div>
    </div>
  );

  // Renderizar el logo para el estado colapsado
  const renderCollapsedLogo = () => (
    <div className="collapsed-logo-container">
      <div className="logo-circle">
        <img
          src="/logo.png"
          alt="DoctaJus"
          width="32"
          height="32"
        />
      </div>
    </div>
  );

  return (
    <div className="app-sidebar">
      <div className={`sidebar-header ${collapsed ? 'sidebar-header-collapsed' : ''}`}>
        {!collapsed ? (
          <div className="logo-container">
            <img
              src="/logo.png"
              alt="DoctaJus"
              height="36"
              width="36"
              className="logo-image"
            />
            <Typography.Title
              level={4}
              className="logo-text"
            >
              DoctaJus
            </Typography.Title>
          </div>
        ) : (
          renderCollapsedLogo()
        )}
        <Button
          type="text"
          icon={collapsed ? <RightOutlined /> : <LeftOutlined />}
          onClick={toggleCollapsed}
          className={`collapse-button ${collapsed ? 'collapse-button-collapsed' : ''}`}
        />
      </div>
      <div className="sidebar-content">
        {favorites.length > 0 && !collapsed && (
          <>
            <div className="category-header">
              <StarOutlined /> Favoritos
            </div>
            <Menu
              className="custom-menu"
              selectedKeys={[location.pathname]}
              items={getFavoriteItems()}
            />
            <Divider style={{ margin: '8px 0' }} />
          </>
        )}

        {categories.map(category => (
          <React.Fragment key={category.key}>
            {!collapsed ? (
              <div className="category-header">
                {category.icon} {category.label}
              </div>
            ) : (
              <Tooltip title={category.label} placement="right">
                <div className="collapsed-category">
                  <div className="collapsed-category-icon">
                    {category.icon}
                  </div>
                </div>
              </Tooltip>
            )}
            <Menu
              className={`custom-menu ${collapsed ? 'custom-menu-collapsed' : ''}`}
              selectedKeys={[location.pathname]}
              items={getCategoryItems(category.key)}
            />
          </React.Fragment>
        ))}
      </div>
      {renderUserProfile()}
    </div>
  );
};

export default Sidebar;
