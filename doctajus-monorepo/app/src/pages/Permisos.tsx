import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Button, Card, Typography, Row, Col } from 'antd';
import { UserOutlined, SettingOutlined, LockOutlined } from '@ant-design/icons';
import './Permisos.css';

const { Title, Text } = Typography;
const { Option } = Select;

const Permisos: React.FC = () => {
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    console.log('Received values:', values);
    // Aquí iría la lógica para guardar los permisos
  };

  return (
    <div className="permisos-container">
      <div className="permisos-content">
        <div className="permisos-header">
          <Title level={2}>Información personal</Title>
        </div>
        <Form
          className="permisos-form"
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            nombre: 'German',
            apellido: 'Castello',
            correo: 'ab.germancastello@gmail.com',
            rol: 'asistente',
          }}
        >
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name="nombre"
                label="Nombre"
                rules={[{ required: true, message: 'Por favor ingresa el nombre' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Nombre" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="apellido"
                label="Apellido"
                rules={[{ required: true, message: 'Por favor ingresa el apellido' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Apellido" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name="correo"
                label="Correo electrónico"
                rules={[
                  { required: true, message: 'Por favor ingresa el correo electrónico' },
                  { type: 'email', message: 'Ingresa un correo electrónico válido' }
                ]}
              >
                <Input disabled placeholder="Correo electrónico" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="rol"
                label="Rol"
                rules={[{ required: true, message: 'Por favor selecciona un rol' }]}
              >
                <Select disabled placeholder="Selecciona un rol">
                  <Option value="asistente">Asistente</Option>
                  <Option value="abogado">Abogado</Option>
                  <Option value="admin">Administrador</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name="telefono"
                label="Teléfono"
              >
                <Input placeholder="Teléfono" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="direccion"
                label="Dirección"
              >
                <Input placeholder="Dirección" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Guardar Cambios
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Permisos;
