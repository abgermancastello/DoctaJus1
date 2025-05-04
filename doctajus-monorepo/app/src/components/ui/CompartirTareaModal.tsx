import React, { useState, useEffect } from 'react';
import { Modal, Form, Select, Button, Table, Tag, Divider, Radio, Tooltip } from 'antd';
import { ShareAltOutlined, DeleteOutlined, UserOutlined, LockOutlined } from '@ant-design/icons';
import { useUsuarioStore } from '../../stores/usuarioStore';
import { useTareaStore } from '../../stores/tareaStore';
import { PermisoCompartido, UsuarioCompartido } from '../../types';

const { Option } = Select;

interface CompartirTareaModalProps {
  isOpen: boolean;
  onClose: () => void;
  tareaId: string;
  tareaTitulo: string;
}

const CompartirTareaModal: React.FC<CompartirTareaModalProps> = ({
  isOpen,
  onClose,
  tareaId,
  tareaTitulo
}) => {
  const [form] = Form.useForm();
  const { usuarios, fetchUsuarios } = useUsuarioStore();
  const { compartirTarea, dejarDeCompartirTarea, getUsuariosCompartidos } = useTareaStore();

  const [usuariosCompartidos, setUsuariosCompartidos] = useState<UsuarioCompartido[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [usuariosConDetalles, setUsuariosConDetalles] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchUsuarios();
      cargarUsuariosCompartidos();
    }
  }, [isOpen, fetchUsuarios]);

  const cargarUsuariosCompartidos = async () => {
    setIsLoading(true);
    try {
      const compartidos = await getUsuariosCompartidos(tareaId);
      setUsuariosCompartidos(compartidos);

      // Combinar los datos de usuarios compartidos con los detalles de usuario
      actualizarUsuariosConDetalles(compartidos);
    } catch (error) {
      console.error('Error al cargar usuarios compartidos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const actualizarUsuariosConDetalles = (compartidos: UsuarioCompartido[]) => {
    const conDetalles = compartidos.map(uc => {
      const usuarioDetalle = usuarios.find(u => u.id === uc.usuarioId);
      return {
        ...uc,
        nombre: usuarioDetalle ? `${usuarioDetalle.nombre} ${usuarioDetalle.apellido}` : 'Usuario desconocido',
        email: usuarioDetalle?.email || '',
        rol: usuarioDetalle?.rol || ''
      };
    });

    setUsuariosConDetalles(conDetalles);
  };

  const handleCompartir = async () => {
    try {
      const values = await form.validateFields();
      setIsLoading(true);

      const resultado = await compartirTarea(tareaId, values.usuarioId, values.permisos);

      if (resultado) {
        // Recargar la lista de usuarios compartidos
        await cargarUsuariosCompartidos();

        // Limpiar el formulario
        form.resetFields();
      }
    } catch (error) {
      console.error('Error al compartir tarea:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuitarCompartir = async (usuarioId: string) => {
    try {
      setIsLoading(true);
      const resultado = await dejarDeCompartirTarea(tareaId, usuarioId);

      if (resultado) {
        // Recargar la lista de usuarios compartidos
        await cargarUsuariosCompartidos();
      }
    } catch (error) {
      console.error('Error al quitar compartir:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrar usuarios que ya están compartidos para no mostrarlos en el selector
  const usuariosDisponibles = usuarios.filter(
    usuario => !usuariosCompartidos.some(uc => uc.usuarioId === usuario.id)
  );

  const colorPermisos = (permiso: PermisoCompartido) => {
    switch (permiso) {
      case PermisoCompartido.LECTURA:
        return 'blue';
      case PermisoCompartido.ESCRITURA:
        return 'green';
      case PermisoCompartido.COMENTARIOS:
        return 'orange';
      default:
        return 'default';
    }
  };

  const columns = [
    {
      title: 'Usuario',
      dataIndex: 'nombre',
      key: 'nombre',
      render: (text: string, record: any) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <div style={{ fontSize: '0.8rem', color: '#666' }}>{record.email}</div>
        </div>
      )
    },
    {
      title: 'Rol',
      dataIndex: 'rol',
      key: 'rol',
      render: (text: string) => (
        <Tag color={text === 'abogado' ? 'green' : text === 'admin' ? 'blue' : 'orange'}>
          {text}
        </Tag>
      )
    },
    {
      title: 'Permisos',
      dataIndex: 'permisos',
      key: 'permisos',
      render: (permisos: PermisoCompartido) => (
        <Tag color={colorPermisos(permisos)}>
          {permisos === PermisoCompartido.LECTURA ? 'Lectura' :
           permisos === PermisoCompartido.ESCRITURA ? 'Escritura' :
           permisos === PermisoCompartido.COMENTARIOS ? 'Comentarios' : 'Desconocido'}
        </Tag>
      )
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_: any, record: any) => (
        <Tooltip title="Eliminar compartir">
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleQuitarCompartir(record.usuarioId)}
            size="small"
          />
        </Tooltip>
      )
    }
  ];

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShareAltOutlined />
          <span>Compartir Tarea: {tareaTitulo}</span>
        </div>
      }
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ permisos: PermisoCompartido.LECTURA }}
      >
        <div style={{ display: 'flex', gap: '10px' }}>
          <Form.Item
            name="usuarioId"
            label="Selecciona un usuario"
            rules={[{ required: true, message: 'Por favor selecciona un usuario' }]}
            style={{ flex: 1 }}
          >
            <Select
              placeholder="Seleccionar usuario"
              optionFilterProp="children"
              loading={isLoading}
              disabled={isLoading || usuariosDisponibles.length === 0}
            >
              {usuariosDisponibles.map(usuario => (
                <Option key={usuario.id} value={usuario.id}>
                  {usuario.nombre} {usuario.apellido} ({usuario.rol}) - {usuario.email}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="permisos"
            label="Permisos"
            rules={[{ required: true, message: 'Por favor selecciona los permisos' }]}
          >
            <Radio.Group buttonStyle="solid">
              <Tooltip title="Solo puede ver la tarea">
                <Radio.Button value={PermisoCompartido.LECTURA}>
                  <LockOutlined /> Lectura
                </Radio.Button>
              </Tooltip>
              <Tooltip title="Puede editar y comentar la tarea">
                <Radio.Button value={PermisoCompartido.ESCRITURA}>
                  <UserOutlined /> Escritura
                </Radio.Button>
              </Tooltip>
              <Tooltip title="Solo puede comentar la tarea">
                <Radio.Button value={PermisoCompartido.COMENTARIOS}>
                  <ShareAltOutlined /> Comentarios
                </Radio.Button>
              </Tooltip>
            </Radio.Group>
          </Form.Item>
        </div>

        <Form.Item>
          <Button
            type="primary"
            onClick={handleCompartir}
            loading={isLoading}
            icon={<ShareAltOutlined />}
            disabled={usuariosDisponibles.length === 0}
          >
            Compartir
          </Button>
        </Form.Item>
      </Form>

      <Divider>Usuarios con acceso a esta tarea</Divider>

      <Table
        dataSource={usuariosConDetalles}
        columns={columns}
        rowKey="id"
        size="small"
        pagination={false}
        loading={isLoading}
        locale={{ emptyText: 'Esta tarea no está compartida con otros usuarios' }}
      />
    </Modal>
  );
};

export default CompartirTareaModal;
