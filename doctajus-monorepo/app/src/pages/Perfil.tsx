import React, { useState } from 'react';
import { Card, Avatar, Tabs, Form, Input, Button, message, Row, Col, Typography, Divider } from 'antd';
import { UserOutlined, LockOutlined, SettingOutlined } from '@ant-design/icons';
import { useAuth } from '../hooks/useAuth';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const Perfil: React.FC = () => {
  const { user, loadUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    // Aquí iría la lógica para actualizar el perfil
    setLoading(true);
    try {
      // Simular una petición
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success('Perfil actualizado correctamente');
      loadUser(); // Recargar usuario
    } catch (error) {
      message.error('Error al actualizar perfil');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Obtener iniciales del usuario para avatar
  const getInitials = () => {
    if (!user) return '?';

    const nombre = user.nombre || '';
    const apellido = user.apellido || '';

    return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
  };

  if (!user) {
    return <div>Cargando perfil...</div>;
  }

  return (
    <div className="perfil-container">
      <Card>
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} sm={8} style={{ textAlign: 'center' }}>
            <Avatar
              size={120}
              style={{ backgroundColor: '#1890ff', fontSize: '3rem' }}
            >
              {getInitials()}
            </Avatar>
            <Title level={3} style={{ marginTop: 16, marginBottom: 0 }}>
              {user.nombre} {user.apellido}
            </Title>
            <Text type="secondary">{user.role || 'Usuario'}</Text>
          </Col>
          <Col xs={24} sm={16}>
            <div className="user-info">
              <Title level={4}>Información personal</Title>
              <Divider />
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Text type="secondary">Correo electrónico</Text>
                  <p>{user.email}</p>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Rol</Text>
                  <p>{user.role || 'Usuario'}</p>
                </Col>
                {user.especialidad && (
                  <Col span={12}>
                    <Text type="secondary">Especialidad</Text>
                    <p>{user.especialidad}</p>
                  </Col>
                )}
              </Row>
            </div>
          </Col>
        </Row>
      </Card>

      <Card style={{ marginTop: 24 }}>
        <Tabs defaultActiveKey="1">
          <TabPane
            tab={<span><UserOutlined /> Editar Perfil</span>}
            key="1"
          >
            <Form
              layout="vertical"
              initialValues={{
                nombre: user.nombre,
                apellido: user.apellido,
                email: user.email,
                especialidad: user.especialidad || '',
                telefono: user.telefono || ''
              }}
              onFinish={onFinish}
            >
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="nombre"
                    label="Nombre"
                    rules={[{ required: true, message: 'Por favor ingrese su nombre' }]}
                  >
                    <Input placeholder="Nombre" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="apellido"
                    label="Apellido"
                    rules={[{ required: true, message: 'Por favor ingrese su apellido' }]}
                  >
                    <Input placeholder="Apellido" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="email"
                    label="Correo electrónico"
                    rules={[
                      { required: true, message: 'Por favor ingrese su correo' },
                      { type: 'email', message: 'Correo electrónico inválido' }
                    ]}
                  >
                    <Input placeholder="Email" disabled />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="telefono"
                    label="Teléfono"
                  >
                    <Input placeholder="Teléfono" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="especialidad"
                label="Especialidad"
              >
                <Input placeholder="Especialidad (ej. Derecho Civil)" />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Guardar cambios
                </Button>
              </Form.Item>
            </Form>
          </TabPane>

          <TabPane
            tab={<span><LockOutlined /> Cambiar Contraseña</span>}
            key="2"
          >
            <Form layout="vertical" onFinish={onFinish}>
              <Form.Item
                name="currentPassword"
                label="Contraseña actual"
                rules={[{ required: true, message: 'Por favor ingrese su contraseña actual' }]}
              >
                <Input.Password placeholder="Contraseña actual" />
              </Form.Item>

              <Form.Item
                name="newPassword"
                label="Nueva contraseña"
                rules={[
                  { required: true, message: 'Por favor ingrese su nueva contraseña' },
                  { min: 8, message: 'La contraseña debe tener al menos 8 caracteres' }
                ]}
              >
                <Input.Password placeholder="Nueva contraseña" />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="Confirmar contraseña"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: 'Por favor confirme su contraseña' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Las contraseñas no coinciden'));
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="Confirmar contraseña" />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Cambiar contraseña
                </Button>
              </Form.Item>
            </Form>
          </TabPane>

          <TabPane
            tab={<span><SettingOutlined /> Preferencias</span>}
            key="3"
          >
            <p>Configuración de preferencias (en desarrollo)</p>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default Perfil;
