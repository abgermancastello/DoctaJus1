import React, { useState } from 'react';
import { Modal, Form, Input, Switch, Select, Button, Divider, Checkbox, TimePicker } from 'antd';
import { BellOutlined, MailOutlined, SettingOutlined } from '@ant-design/icons';
import { EstadoTarea, PrioridadTarea } from '../../types';

const { Option } = Select;

interface NotificacionesConfigProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: NotificacionesConfig) => void;
  configuracionActual: NotificacionesConfig;
}

export interface NotificacionesConfig {
  email: string;
  recibirNotificaciones: boolean;
  recibirCorreos: boolean;
  frecuenciaCorreos: 'diario' | 'semanal' | 'instantaneo';
  horaNotificacion?: string;
  diasAntelacion: number;
  notificarPrioridad: {
    [PrioridadTarea.ALTA]: boolean;
    [PrioridadTarea.MEDIA]: boolean;
    [PrioridadTarea.BAJA]: boolean;
  };
  notificarEstados: {
    [EstadoTarea.PENDIENTE]: boolean;
    [EstadoTarea.EN_PROGRESO]: boolean;
    [EstadoTarea.COMPLETADA]: boolean;
    [EstadoTarea.CANCELADA]: boolean;
  };
}

// Valores por defecto para la configuración de notificaciones
export const defaultNotificacionesConfig: NotificacionesConfig = {
  email: '',
  recibirNotificaciones: true,
  recibirCorreos: false,
  frecuenciaCorreos: 'diario',
  horaNotificacion: '09:00',
  diasAntelacion: 3,
  notificarPrioridad: {
    [PrioridadTarea.ALTA]: true,
    [PrioridadTarea.MEDIA]: true,
    [PrioridadTarea.BAJA]: false
  },
  notificarEstados: {
    [EstadoTarea.PENDIENTE]: true,
    [EstadoTarea.EN_PROGRESO]: true,
    [EstadoTarea.COMPLETADA]: false,
    [EstadoTarea.CANCELADA]: false
  }
};

const NotificacionesConfig: React.FC<NotificacionesConfigProps> = ({
  isOpen,
  onClose,
  onSave,
  configuracionActual
}) => {
  const [form] = Form.useForm();
  const [config, setConfig] = useState<NotificacionesConfig>(configuracionActual);

  // Al abrir el modal, inicializar el formulario con los valores actuales
  React.useEffect(() => {
    if (isOpen) {
      form.setFieldsValue(configuracionActual);
      setConfig(configuracionActual);
    }
  }, [isOpen, configuracionActual, form]);

  const handleValuesChange = (changedValues: any, allValues: any) => {
    setConfig(allValues);
  };

  const handleSubmit = () => {
    form.validateFields().then(values => {
      onSave(values as NotificacionesConfig);
      onClose();
    });
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <BellOutlined />
          <span>Configuración de Notificaciones</span>
        </div>
      }
      open={isOpen}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancelar
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          Guardar Configuración
        </Button>
      ]}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={configuracionActual}
        onValuesChange={handleValuesChange}
      >
        <Divider orientation="left">
          <span style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <BellOutlined /> Notificaciones en la aplicación
          </span>
        </Divider>

        <Form.Item
          name="recibirNotificaciones"
          valuePropName="checked"
          label="Recibir notificaciones en la aplicación"
        >
          <Switch />
        </Form.Item>

        <Form.Item
          name="diasAntelacion"
          label="Días de antelación para recibir notificaciones"
          tooltip="Cuántos días antes de la fecha de vencimiento deseas recibir notificaciones"
        >
          <Select>
            <Option value={1}>1 día</Option>
            <Option value={2}>2 días</Option>
            <Option value={3}>3 días</Option>
            <Option value={5}>5 días</Option>
            <Option value={7}>1 semana</Option>
          </Select>
        </Form.Item>

        <Divider orientation="left">
          <span style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <MailOutlined /> Notificaciones por correo electrónico
          </span>
        </Divider>

        <Form.Item
          name="recibirCorreos"
          valuePropName="checked"
          label="Recibir notificaciones por correo electrónico"
        >
          <Switch />
        </Form.Item>

        {config.recibirCorreos && (
          <>
            <Form.Item
              name="email"
              label="Dirección de correo electrónico"
              rules={[
                { required: true, message: 'Por favor ingresa tu correo electrónico' },
                { type: 'email', message: 'Por favor ingresa un correo electrónico válido' }
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder="ejemplo@correo.com" />
            </Form.Item>

            <Form.Item
              name="frecuenciaCorreos"
              label="Frecuencia de correos"
            >
              <Select>
                <Option value="instantaneo">Instantáneo (al momento de detectar)</Option>
                <Option value="diario">Resumen diario</Option>
                <Option value="semanal">Resumen semanal</Option>
              </Select>
            </Form.Item>

            {(config.frecuenciaCorreos === 'diario' || config.frecuenciaCorreos === 'semanal') && (
              <Form.Item
                name="horaNotificacion"
                label="Hora de envío de correos"
              >
                <TimePicker format="HH:mm" />
              </Form.Item>
            )}
          </>
        )}

        <Divider orientation="left">
          <span style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <SettingOutlined /> Filtros de notificaciones
          </span>
        </Divider>

        <Form.Item label="Notificar según prioridad">
          <Form.Item name={['notificarPrioridad', PrioridadTarea.ALTA]} valuePropName="checked" noStyle>
            <Checkbox style={{ marginRight: '10px' }}>Alta</Checkbox>
          </Form.Item>
          <Form.Item name={['notificarPrioridad', PrioridadTarea.MEDIA]} valuePropName="checked" noStyle>
            <Checkbox style={{ marginRight: '10px' }}>Media</Checkbox>
          </Form.Item>
          <Form.Item name={['notificarPrioridad', PrioridadTarea.BAJA]} valuePropName="checked" noStyle>
            <Checkbox>Baja</Checkbox>
          </Form.Item>
        </Form.Item>

        <Form.Item label="Notificar según estado">
          <Form.Item name={['notificarEstados', EstadoTarea.PENDIENTE]} valuePropName="checked" noStyle>
            <Checkbox style={{ marginRight: '10px' }}>Pendiente</Checkbox>
          </Form.Item>
          <Form.Item name={['notificarEstados', EstadoTarea.EN_PROGRESO]} valuePropName="checked" noStyle>
            <Checkbox style={{ marginRight: '10px' }}>En Progreso</Checkbox>
          </Form.Item>
          <Form.Item name={['notificarEstados', EstadoTarea.COMPLETADA]} valuePropName="checked" noStyle>
            <Checkbox style={{ marginRight: '10px' }}>Completada</Checkbox>
          </Form.Item>
          <Form.Item name={['notificarEstados', EstadoTarea.CANCELADA]} valuePropName="checked" noStyle>
            <Checkbox>Cancelada</Checkbox>
          </Form.Item>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default NotificacionesConfig;
