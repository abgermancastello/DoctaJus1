import React, { useEffect, useState } from 'react';
import { Tabs, Card, Button, Table, Space, Modal, Form, Input, Switch, Select, InputNumber, Tooltip } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { useConfigFinanzasStore } from '../stores/configFinanzasStore';
import { useUIStore } from '../stores/uiStore';

const { confirm } = Modal;

const ConfigFinanzas: React.FC = () => {
  // Estados
  const [formCategorias] = Form.useForm();
  const [formLimites] = Form.useForm();
  const [formPermisos] = Form.useForm();
  const [modalCategoriasVisible, setModalCategoriasVisible] = useState(false);
  const [modalLimitesVisible, setModalLimitesVisible] = useState(false);
  const [modalPermisosVisible, setModalPermisosVisible] = useState(false);
  const [editandoCategoria, setEditandoCategoria] = useState<string | null>(null);
  const [editandoLimite, setEditandoLimite] = useState<string | null>(null);
  const [editandoPermiso, setEditandoPermiso] = useState<string | null>(null);

  // Obtener store
  const {
    categoriasPersonalizadas,
    categoriasPredeterminadas,
    limitesAprobacion,
    permisosFinanzas,
    loading,
    fetchCategorias,
    fetchLimitesAprobacion,
    fetchPermisosFinanzas,
    addCategoria,
    updateCategoria,
    deleteCategoria,
    addLimiteAprobacion,
    updateLimiteAprobacion,
    deleteLimiteAprobacion,
    addPermisoFinanzas,
    updatePermisoFinanzas,
    deletePermisoFinanzas
  } = useConfigFinanzasStore();

  // Cargar datos iniciales
  useEffect(() => {
    fetchCategorias();
    fetchLimitesAprobacion();
    fetchPermisosFinanzas();
  }, [fetchCategorias, fetchLimitesAprobacion, fetchPermisosFinanzas]);

  // Mostrar notificaciones
  const { addNotification } = useUIStore();

  // ========= CATEGORÍAS =========
  const handleAbrirModalCategorias = (id?: string) => {
    if (id) {
      const categoria = categoriasPersonalizadas.find(cat => cat.id === id);
      if (categoria) {
        formCategorias.setFieldsValue(categoria);
        setEditandoCategoria(id);
      }
    } else {
      formCategorias.resetFields();
      setEditandoCategoria(null);
    }
    setModalCategoriasVisible(true);
  };

  const handleGuardarCategoria = async () => {
    try {
      const values = await formCategorias.validateFields();

      if (editandoCategoria) {
        await updateCategoria(editandoCategoria, values);
      } else {
        await addCategoria(values);
      }

      setModalCategoriasVisible(false);
      formCategorias.resetFields();
    } catch (error) {
      console.error('Error al guardar categoría:', error);
    }
  };

  const handleEliminarCategoria = (id: string) => {
    confirm({
      title: '¿Estás seguro de eliminar esta categoría?',
      icon: <ExclamationCircleOutlined />,
      content: 'Esta acción no se puede deshacer.',
      okText: 'Sí, eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk() {
        deleteCategoria(id);
      }
    });
  };

  // Columnas para la tabla de categorías
  const columnasCategorias = [
    {
      title: 'Nombre',
      dataIndex: 'nombre',
      key: 'nombre',
    },
    {
      title: 'Tipo',
      dataIndex: 'tipo',
      key: 'tipo',
      render: (tipo: string) => (tipo === 'ingreso' ? 'Ingreso' : 'Egreso')
    },
    {
      title: 'Descripción',
      dataIndex: 'descripcion',
      key: 'descripcion',
    },
    {
      title: 'Estado',
      dataIndex: 'activa',
      key: 'activa',
      render: (activa: boolean) => (
        <span style={{ color: activa ? 'green' : 'red' }}>
          {activa ? 'Activa' : 'Inactiva'}
        </span>
      )
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleAbrirModalCategorias(record.id)}
          />
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleEliminarCategoria(record.id)}
          />
        </Space>
      )
    }
  ];

  // ========= LÍMITES DE APROBACIÓN =========
  const handleAbrirModalLimites = (id?: string) => {
    if (id) {
      const limite = limitesAprobacion.find(lim => lim.id === id);
      if (limite) {
        formLimites.setFieldsValue(limite);
        setEditandoLimite(id);
      }
    } else {
      formLimites.resetFields();
      setEditandoLimite(null);
    }
    setModalLimitesVisible(true);
  };

  const handleGuardarLimite = async () => {
    try {
      const values = await formLimites.validateFields();

      if (editandoLimite) {
        await updateLimiteAprobacion(editandoLimite, values);
      } else {
        await addLimiteAprobacion(values);
      }

      setModalLimitesVisible(false);
      formLimites.resetFields();
    } catch (error) {
      console.error('Error al guardar límite:', error);
    }
  };

  const handleEliminarLimite = (id: string) => {
    confirm({
      title: '¿Estás seguro de eliminar este límite de aprobación?',
      icon: <ExclamationCircleOutlined />,
      content: 'Esta acción no se puede deshacer.',
      okText: 'Sí, eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk() {
        deleteLimiteAprobacion(id);
      }
    });
  };

  // Columnas para la tabla de límites
  const columnasLimites = [
    {
      title: 'Rol de Usuario',
      dataIndex: 'rolUsuario',
      key: 'rolUsuario',
      render: (rol: string) => rol.charAt(0).toUpperCase() + rol.slice(1)
    },
    {
      title: 'Monto Máximo',
      dataIndex: 'montoMaximo',
      key: 'montoMaximo',
      render: (monto: number) => `$${monto.toLocaleString('es-AR')}`
    },
    {
      title: 'Requiere Aprobación Adicional',
      dataIndex: 'requiereAprobacionAdicional',
      key: 'requiereAprobacionAdicional',
      render: (requiere: boolean) => (
        <span style={{ color: requiere ? 'red' : 'green' }}>
          {requiere ? 'Sí' : 'No'}
        </span>
      )
    },
    {
      title: 'Descripción',
      dataIndex: 'descripcion',
      key: 'descripcion',
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleAbrirModalLimites(record.id)}
          />
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleEliminarLimite(record.id)}
          />
        </Space>
      )
    }
  ];

  // ========= PERMISOS =========
  const handleAbrirModalPermisos = (id?: string) => {
    if (id) {
      const permiso = permisosFinanzas.find(perm => perm.id === id);
      if (permiso) {
        formPermisos.setFieldsValue(permiso);
        setEditandoPermiso(id);
      }
    } else {
      formPermisos.resetFields();
      setEditandoPermiso(null);
    }
    setModalPermisosVisible(true);
  };

  const handleGuardarPermiso = async () => {
    try {
      const values = await formPermisos.validateFields();

      if (editandoPermiso) {
        await updatePermisoFinanzas(editandoPermiso, values);
      } else {
        await addPermisoFinanzas(values);
      }

      setModalPermisosVisible(false);
      formPermisos.resetFields();
    } catch (error) {
      console.error('Error al guardar permiso:', error);
    }
  };

  const handleEliminarPermiso = (id: string) => {
    confirm({
      title: '¿Estás seguro de eliminar este permiso?',
      icon: <ExclamationCircleOutlined />,
      content: 'Esta acción no se puede deshacer.',
      okText: 'Sí, eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk() {
        deletePermisoFinanzas(id);
      }
    });
  };

  // Columnas para la tabla de permisos
  const columnasPermisos = [
    {
      title: 'Rol de Usuario',
      dataIndex: 'rolUsuario',
      key: 'rolUsuario',
      render: (rol: string) => rol.charAt(0).toUpperCase() + rol.slice(1)
    },
    {
      title: 'Ver Movimientos',
      dataIndex: 'verMovimientos',
      key: 'verMovimientos',
      render: (permitido: boolean) => (
        <span style={{ color: permitido ? 'green' : 'red' }}>
          {permitido ? 'Sí' : 'No'}
        </span>
      )
    },
    {
      title: 'Crear Movimientos',
      dataIndex: 'crearMovimientos',
      key: 'crearMovimientos',
      render: (permitido: boolean) => (
        <span style={{ color: permitido ? 'green' : 'red' }}>
          {permitido ? 'Sí' : 'No'}
        </span>
      )
    },
    {
      title: 'Editar Movimientos',
      dataIndex: 'editarMovimientos',
      key: 'editarMovimientos',
      render: (permitido: boolean) => (
        <span style={{ color: permitido ? 'green' : 'red' }}>
          {permitido ? 'Sí' : 'No'}
        </span>
      )
    },
    {
      title: 'Eliminar Movimientos',
      dataIndex: 'eliminarMovimientos',
      key: 'eliminarMovimientos',
      render: (permitido: boolean) => (
        <span style={{ color: permitido ? 'green' : 'red' }}>
          {permitido ? 'Sí' : 'No'}
        </span>
      )
    },
    {
      title: 'Configuración Avanzada',
      dataIndex: 'configuraCategoriasYLimites',
      key: 'configuraCategoriasYLimites',
      render: (permitido: boolean) => (
        <span style={{ color: permitido ? 'green' : 'red' }}>
          {permitido ? 'Sí' : 'No'}
        </span>
      )
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleAbrirModalPermisos(record.id)}
          />
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleEliminarPermiso(record.id)}
          />
        </Space>
      )
    }
  ];

  // Items para los tabs
  const tabItems = [
    {
      key: "1",
      label: "Categorías de Ingresos/Egresos",
      children: (
        <Card title="Gestionar Categorías">
          <div style={{ marginBottom: 16 }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleAbrirModalCategorias()}
            >
              Nueva Categoría
            </Button>
          </div>

          <h3>Categorías Personalizadas</h3>
          <Table
            dataSource={categoriasPersonalizadas}
            columns={columnasCategorias}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
          />

          <h3 style={{ marginTop: 30 }}>Categorías Predeterminadas</h3>
          <p>Estas categorías vienen por defecto en el sistema y no pueden modificarse.</p>
          <ul className="categorias-predeterminadas">
            <li>
              <h4>Ingresos</h4>
              <ul>
                {categoriasPredeterminadas.filter(cat =>
                  ['honorarios', 'consultas', 'abonos', 'juicios_ganados', 'otros_ingresos'].includes(cat)
                ).map(cat => (
                  <li key={cat}>
                    {cat.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </li>
                ))}
              </ul>
            </li>
            <li>
              <h4>Egresos</h4>
              <ul>
                {categoriasPredeterminadas.filter(cat =>
                  ['salarios', 'alquiler', 'servicios', 'impuestos', 'gastos_judiciales', 'papeleria', 'software', 'otros_gastos'].includes(cat)
                ).map(cat => (
                  <li key={cat}>
                    {cat.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </li>
                ))}
              </ul>
            </li>
          </ul>
        </Card>
      )
    },
    {
      key: "2",
      label: "Límites de Aprobación",
      children: (
        <Card title="Gestionar Límites de Aprobación para Gastos">
          <div style={{ marginBottom: 16 }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleAbrirModalLimites()}
            >
              Nuevo Límite
            </Button>
            <Tooltip title="Establece montos máximos que cada rol de usuario puede autorizar sin aprobación adicional.">
              <Button type="link" icon={<InfoCircleOutlined />}>Información</Button>
            </Tooltip>
          </div>

          <Table
            dataSource={limitesAprobacion}
            columns={columnasLimites}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        </Card>
      )
    },
    {
      key: "3",
      label: "Permisos de Usuario",
      children: (
        <Card title="Gestionar Permisos para Diferentes Roles">
          <div style={{ marginBottom: 16 }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleAbrirModalPermisos()}
            >
              Nuevo Permiso
            </Button>
            <Tooltip title="Define qué acciones puede realizar cada rol de usuario en el módulo de finanzas.">
              <Button type="link" icon={<InfoCircleOutlined />}>Información</Button>
            </Tooltip>
          </div>

          <Table
            dataSource={permisosFinanzas}
            columns={columnasPermisos}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        </Card>
      )
    }
  ];

  return (
    <div className="page">
      <h1>Configuración de Finanzas</h1>

      <Tabs defaultActiveKey="1" items={tabItems} />

      {/* Modal para Categorías */}
      <Modal
        title={editandoCategoria ? "Editar Categoría" : "Nueva Categoría"}
        open={modalCategoriasVisible}
        onOk={handleGuardarCategoria}
        onCancel={() => setModalCategoriasVisible(false)}
        confirmLoading={loading}
      >
        <Form form={formCategorias} layout="vertical">
          <Form.Item
            name="nombre"
            label="Nombre"
            rules={[{ required: true, message: 'Por favor ingresa el nombre de la categoría' }]}
          >
            <Input placeholder="Nombre de la categoría" />
          </Form.Item>

          <Form.Item
            name="tipo"
            label="Tipo"
            rules={[{ required: true, message: 'Por favor selecciona el tipo' }]}
          >
            <Select placeholder="Selecciona el tipo">
              <Select.Option value="ingreso">Ingreso</Select.Option>
              <Select.Option value="egreso">Egreso</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="descripcion"
            label="Descripción"
          >
            <Input.TextArea rows={3} placeholder="Descripción (opcional)" />
          </Form.Item>

          <Form.Item
            name="activa"
            label="Activa"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal para Límites de Aprobación */}
      <Modal
        title={editandoLimite ? "Editar Límite de Aprobación" : "Nuevo Límite de Aprobación"}
        open={modalLimitesVisible}
        onOk={handleGuardarLimite}
        onCancel={() => setModalLimitesVisible(false)}
        confirmLoading={loading}
      >
        <Form form={formLimites} layout="vertical">
          <Form.Item
            name="rolUsuario"
            label="Rol de Usuario"
            rules={[{ required: true, message: 'Por favor selecciona el rol de usuario' }]}
          >
            <Select placeholder="Selecciona el rol">
              <Select.Option value="asistente">Asistente</Select.Option>
              <Select.Option value="abogado">Abogado</Select.Option>
              <Select.Option value="admin">Administrador</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="montoMaximo"
            label="Monto Máximo"
            rules={[{ required: true, message: 'Por favor ingresa el monto máximo' }]}
          >
            <InputNumber<number>
              style={{ width: '100%' }}
              formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value: string | undefined) => value ? Number(value.replace(/\$\s?|(,*)/g, '')) : 0}
              min={0}
              placeholder="Monto máximo de aprobación"
            />
          </Form.Item>

          <Form.Item
            name="requiereAprobacionAdicional"
            label="Requiere Aprobación Adicional"
            valuePropName="checked"
            initialValue={false}
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="descripcion"
            label="Descripción"
            rules={[{ required: true, message: 'Por favor ingresa una descripción' }]}
          >
            <Input.TextArea rows={3} placeholder="Descripción del límite" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal para Permisos */}
      <Modal
        title={editandoPermiso ? "Editar Permiso" : "Nuevo Permiso"}
        open={modalPermisosVisible}
        onOk={handleGuardarPermiso}
        onCancel={() => setModalPermisosVisible(false)}
        confirmLoading={loading}
      >
        <Form form={formPermisos} layout="vertical">
          <Form.Item
            name="rolUsuario"
            label="Rol de Usuario"
            rules={[{ required: true, message: 'Por favor selecciona el rol de usuario' }]}
          >
            <Select placeholder="Selecciona el rol">
              <Select.Option value="asistente">Asistente</Select.Option>
              <Select.Option value="abogado">Abogado</Select.Option>
              <Select.Option value="admin">Administrador</Select.Option>
            </Select>
          </Form.Item>

          <div style={{ marginBottom: 16 }}>
            <h4>Permisos de Acceso:</h4>
          </div>

          <Form.Item
            name="verMovimientos"
            label="Ver Movimientos"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="crearMovimientos"
            label="Crear Movimientos"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="editarMovimientos"
            label="Editar Movimientos"
            valuePropName="checked"
            initialValue={false}
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="eliminarMovimientos"
            label="Eliminar Movimientos"
            valuePropName="checked"
            initialValue={false}
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="verDashboard"
            label="Ver Dashboard"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="exportarReportes"
            label="Exportar Reportes"
            valuePropName="checked"
            initialValue={false}
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="configuraCategoriasYLimites"
            label="Configurar Categorías y Límites"
            valuePropName="checked"
            initialValue={false}
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="gestionarPermisos"
            label="Gestionar Permisos"
            valuePropName="checked"
            initialValue={false}
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ConfigFinanzas;
