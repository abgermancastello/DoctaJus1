import React, { useState } from 'react';
import { Layout, Menu, Button, Space, Avatar, Dropdown, Badge, Input, Modal, Tooltip, notification } from 'antd';
import {
  UserOutlined,
  BellOutlined,
  SettingOutlined,
  LogoutOutlined,
  SearchOutlined,
  QuestionCircleOutlined,
  InfoCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import type { MenuProps } from 'antd';
import ThemeToggle from '../ui/ThemeToggle';

const { Header: AntHeader } = Layout;
const { Search } = Input;

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchVisible, setSearchVisible] = useState(false);
  const [notificacionesVisible, setNotificacionesVisible] = useState(false);
  const [ayudaVisible, setAyudaVisible] = useState(false);

  const handleMenuClick = ({ key }: { key: string }) => {
    switch (key) {
      case 'profile':
        navigate('/perfil');
        break;
      case 'settings':
        navigate('/configuracion');
        break;
      case 'logout':
        logout();
        navigate('/login');
        break;
    }
  };

  const menuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Perfil',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Configuración',
    },
    {
      key: 'divider',
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Cerrar Sesión',
    },
  ];

  // Obtener iniciales del usuario para avatar
  const getInitials = () => {
    if (!user) return '?';

    const nombre = user.nombre || '';
    const apellido = user.apellido || '';

    return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
  };

  // Obtener nombre completo del usuario
  const getNombreCompleto = () => {
    if (!user) return 'Usuario';

    return `${user.nombre || ''} ${user.apellido || ''}`.trim() || 'Usuario';
  };

  const toggleSearch = () => {
    setSearchVisible(!searchVisible);
  };

  // Mostrar modal de notificaciones
  const handleNotificacionesClick = () => {
    setNotificacionesVisible(true);
  };

  // Mostrar modal de ayuda
  const handleAyudaClick = () => {
    setAyudaVisible(true);
  };

  // Ejemplo de notificaciones para mostrar
  const notificaciones = [
    {
      id: 1,
      titulo: 'Tarea vencida',
      mensaje: 'La tarea "Preparar documentación" ha vencido',
      fecha: '2023-10-15T14:30:00',
      leida: false
    },
    {
      id: 2,
      titulo: 'Nuevo documento',
      mensaje: 'Se ha compartido un nuevo documento contigo',
      fecha: '2023-10-14T09:15:00',
      leida: false
    },
    {
      id: 3,
      titulo: 'Recordatorio',
      mensaje: 'Tienes una reunión mañana a las 10:00',
      fecha: '2023-10-13T18:00:00',
      leida: false
    },
    {
      id: 4,
      titulo: 'Expediente actualizado',
      mensaje: 'El expediente #1234 ha sido actualizado',
      fecha: '2023-10-12T11:45:00',
      leida: false
    },
    {
      id: 5,
      titulo: 'Nuevo cliente',
      mensaje: 'Se ha registrado un nuevo cliente en el sistema',
      fecha: '2023-10-11T16:20:00',
      leida: false
    }
  ];

  // Marcar notificación como leída
  const marcarComoLeida = (id: number) => {
    notification.success({
      message: 'Notificación marcada como leída',
      description: 'La notificación ha sido marcada como leída correctamente'
    });
  };

  // Marcar todas como leídas
  const marcarTodasLeidas = () => {
    notification.success({
      message: 'Notificaciones leídas',
      description: 'Todas las notificaciones han sido marcadas como leídas'
    });
  };

  return (
    <AntHeader style={{
      background: 'var(--bg-white)',
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: 'var(--shadow-sm)',
      position: 'sticky',
      top: 0,
      zIndex: 1,
      width: '100%',
      height: '60px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {searchVisible ? (
          <Search
            placeholder="Buscar..."
            onSearch={value => console.log(value)}
            style={{ width: 250 }}
            allowClear
            autoFocus
            onBlur={() => setSearchVisible(false)}
          />
        ) : (
          <Button
            type="text"
            icon={<SearchOutlined />}
            onClick={toggleSearch}
            style={{ fontSize: '16px' }}
          />
        )}
      </div>

      <Space size="large">
        <Tooltip title="Centro de ayuda">
          <Button
            type="text"
            icon={<QuestionCircleOutlined style={{ color: 'var(--text-secondary)' }} />}
            onClick={handleAyudaClick}
          />
        </Tooltip>
        <ThemeToggle />
        <Tooltip title="Notificaciones">
          <Badge count={5} size="small">
            <Button
              type="text"
              icon={<BellOutlined style={{ color: 'var(--text-secondary)' }} />}
              onClick={handleNotificacionesClick}
            />
          </Badge>
        </Tooltip>
        <Dropdown
          menu={{
            items: menuItems,
            onClick: handleMenuClick
          }}
          placement="bottomRight"
          trigger={['click']}
        >
          <Space style={{ cursor: 'pointer' }}>
            <Avatar style={{
              backgroundColor: 'var(--primary-color)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>{getInitials()}</Avatar>
            <span style={{
              fontWeight: 500,
              fontSize: '14px',
              color: 'var(--text-primary)'
            }}>{getNombreCompleto()}</span>
          </Space>
        </Dropdown>
      </Space>

      {/* Modal de Notificaciones */}
      <Modal
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span><BellOutlined /> Notificaciones</span>
            <Button type="link" onClick={marcarTodasLeidas}>Marcar todas como leídas</Button>
          </div>
        }
        open={notificacionesVisible}
        onCancel={() => setNotificacionesVisible(false)}
        footer={null}
        width={400}
      >
        <div style={{ maxHeight: '400px', overflow: 'auto' }}>
          {notificaciones.length > 0 ? notificaciones.map(notif => (
            <div key={notif.id} style={{
              padding: '10px',
              borderBottom: '1px solid #f0f0f0',
              backgroundColor: notif.leida ? 'transparent' : '#f6f6f6'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h4 style={{ margin: '0 0 5px 0' }}>{notif.titulo}</h4>
                <Button
                  type="text"
                  size="small"
                  icon={<CloseCircleOutlined />}
                  onClick={() => marcarComoLeida(notif.id)}
                />
              </div>
              <p style={{ margin: '0 0 5px 0' }}>{notif.mensaje}</p>
              <small style={{ color: '#999' }}>
                {new Date(notif.fecha).toLocaleString()}
              </small>
            </div>
          )) : (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <p>No tienes notificaciones nuevas</p>
            </div>
          )}
        </div>
      </Modal>

      {/* Modal de Ayuda */}
      <Modal
        title={<div><QuestionCircleOutlined /> Centro de Ayuda</div>}
        open={ayudaVisible}
        onCancel={() => setAyudaVisible(false)}
        footer={null}
        width={600}
      >
        <div style={{ maxHeight: '500px', overflow: 'auto' }}>
          <h3>Bienvenido al Centro de Ayuda de DoctaJus</h3>

          <div style={{ marginBottom: '20px' }}>
            <h4><InfoCircleOutlined /> Navegación básica</h4>
            <p>Utiliza el menú lateral para acceder a las diferentes secciones de la aplicación: Expedientes, Clientes, Tareas, Documentos, etc.</p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h4><InfoCircleOutlined /> Gestión de Expedientes</h4>
            <p>Crea y administra tus expedientes jurídicos, añade clientes, documentos y eventos relacionados.</p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h4><InfoCircleOutlined /> Gestión de Tareas</h4>
            <p>Organiza tu trabajo creando tareas con fechas de vencimiento, prioridades y asignaciones a otros usuarios.</p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h4><InfoCircleOutlined /> Gestión Documental</h4>
            <p>Sube, clasifica y comparte documentos relacionados con tus casos y expedientes.</p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h4><InfoCircleOutlined /> Soporte</h4>
            <p>Para obtener más ayuda, contáctanos en: <a href="mailto:soporte@doctajus.com">soporte@doctajus.com</a></p>
          </div>
        </div>
      </Modal>
    </AntHeader>
  );
};

export default Header;
