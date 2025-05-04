import React, { useState, useEffect } from 'react';
import { Tooltip, List, Button, Input, Avatar, Popconfirm, Empty } from 'antd';
import { DeleteOutlined, EditOutlined, UserOutlined, SendOutlined } from '@ant-design/icons';
import { ComentarioTarea } from '../../types';
import { useTareaStore } from '../../stores/tareaStore';
import moment from 'moment';
import 'moment/locale/es';

moment.locale('es');

const { TextArea } = Input;

interface ComentariosTareaProps {
  tareaId: string;
  usuarioActualId: string;
  usuarioActualNombre: string;
}

const ComentariosTarea: React.FC<ComentariosTareaProps> = ({
  tareaId,
  usuarioActualId,
  usuarioActualNombre
}) => {
  const { getComentariosTarea, addComentario, editComentario, deleteComentario } = useTareaStore();

  const [comentarios, setComentarios] = useState<ComentarioTarea[]>([]);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [enviandoComentario, setEnviandoComentario] = useState(false);
  const [comentarioEditandoId, setComentarioEditandoId] = useState<string | null>(null);
  const [textoEdicion, setTextoEdicion] = useState('');

  // Cargar comentarios al montar el componente
  useEffect(() => {
    cargarComentarios();
  }, [tareaId]);

  // Función para cargar comentarios
  const cargarComentarios = async () => {
    setIsLoading(true);
    try {
      const comentariosCargados = await getComentariosTarea(tareaId);
      setComentarios(comentariosCargados);
    } catch (error) {
      console.error('Error al cargar comentarios:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar envío de nuevo comentario
  const handleEnviarComentario = async () => {
    if (!nuevoComentario.trim()) return;

    setEnviandoComentario(true);
    try {
      await addComentario(tareaId, usuarioActualId, nuevoComentario);

      // Limpiar campo de texto
      setNuevoComentario('');

      // Recargar comentarios
      await cargarComentarios();
    } catch (error) {
      console.error('Error al enviar comentario:', error);
    } finally {
      setEnviandoComentario(false);
    }
  };

  // Comenzar edición de comentario
  const handleIniciarEdicion = (comentario: ComentarioTarea) => {
    setComentarioEditandoId(comentario.id);
    setTextoEdicion(comentario.texto);
  };

  // Cancelar edición de comentario
  const handleCancelarEdicion = () => {
    setComentarioEditandoId(null);
    setTextoEdicion('');
  };

  // Guardar edición de comentario
  const handleGuardarEdicion = async (comentarioId: string) => {
    if (!textoEdicion.trim()) return;

    setIsLoading(true);
    try {
      await editComentario(comentarioId, textoEdicion);

      // Limpiar estado de edición
      setComentarioEditandoId(null);
      setTextoEdicion('');

      // Recargar comentarios
      await cargarComentarios();
    } catch (error) {
      console.error('Error al editar comentario:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Eliminar comentario
  const handleEliminarComentario = async (comentarioId: string) => {
    setIsLoading(true);
    try {
      await deleteComentario(comentarioId);

      // Recargar comentarios
      await cargarComentarios();
    } catch (error) {
      console.error('Error al eliminar comentario:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getUsuarioNombre = (usuarioId: string) => {
    // Aquí deberíamos obtener el nombre real del usuario
    // En una implementación completa se consultaría un almacén de usuarios
    if (usuarioId === usuarioActualId) {
      return usuarioActualNombre;
    }
    return `Usuario ${usuarioId}`;
  };

  const renderComentarioAcciones = (comentario: ComentarioTarea) => {
    const acciones = [];

    // Solo mostrar acciones de edición/eliminación si es el autor o un admin
    if (comentario.usuarioId === usuarioActualId) {
      acciones.push(
        <Tooltip key="edit" title="Editar comentario">
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleIniciarEdicion(comentario)}
          />
        </Tooltip>,
        <Popconfirm
          key="delete"
          title="¿Eliminar comentario?"
          description="Esta acción no se puede deshacer"
          onConfirm={() => handleEliminarComentario(comentario.id)}
          okText="Eliminar"
          cancelText="Cancelar"
        >
          <Tooltip title="Eliminar comentario">
            <Button type="text" danger size="small" icon={<DeleteOutlined />} />
          </Tooltip>
        </Popconfirm>
      );
    }

    return acciones;
  };

  const renderComentarioContenido = (comentario: ComentarioTarea) => {
    // Si el comentario está siendo editado, mostrar campo de edición
    if (comentarioEditandoId === comentario.id) {
      return (
        <div>
          <TextArea
            value={textoEdicion}
            onChange={e => setTextoEdicion(e.target.value)}
            rows={2}
            autoFocus
          />
          <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button size="small" onClick={handleCancelarEdicion}>
              Cancelar
            </Button>
            <Button
              type="primary"
              size="small"
              onClick={() => handleGuardarEdicion(comentario.id)}
              disabled={!textoEdicion.trim()}
            >
              Guardar
            </Button>
          </div>
        </div>
      );
    }

    // Mostrar texto normal si no está en edición
    return <p>{comentario.texto}</p>;
  };

  return (
    <div className="comentarios-tarea">
      <h3 className="comentarios-titulo">Comentarios y notas</h3>

      <div className="nuevo-comentario">
        <div className="nuevo-comentario-input">
          <Avatar icon={<UserOutlined />} />
          <TextArea
            value={nuevoComentario}
            onChange={e => setNuevoComentario(e.target.value)}
            placeholder="Escribe un comentario..."
            autoSize={{ minRows: 2, maxRows: 6 }}
            disabled={enviandoComentario}
          />
        </div>
        <div className="nuevo-comentario-actions">
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleEnviarComentario}
            loading={enviandoComentario}
            disabled={!nuevoComentario.trim()}
          >
            Enviar
          </Button>
        </div>
      </div>

      <div className="comentarios-lista">
        {isLoading ? (
          <div className="loading-comentarios">Cargando comentarios...</div>
        ) : comentarios.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No hay comentarios para esta tarea"
          />
        ) : (
          <List
            className="comentarios-list"
            itemLayout="horizontal"
            dataSource={comentarios}
            renderItem={comentario => (
              <div className="comentario-item">
                <div className="comentario-header">
                  <div className="comentario-autor">
                    <Avatar icon={<UserOutlined />} />
                    <div>
                      <div className="autor-nombre">{getUsuarioNombre(comentario.usuarioId)}</div>
                      <Tooltip title={moment(comentario.fechaCreacion).format('DD/MM/YYYY HH:mm:ss')}>
                        <div className="comentario-fecha">
                          {moment(comentario.fechaCreacion).fromNow()}
                          {comentario.fechaEdicion && <span> (editado)</span>}
                        </div>
                      </Tooltip>
                    </div>
                  </div>
                  <div className="comentario-actions">
                    {renderComentarioAcciones(comentario)}
                  </div>
                </div>
                <div className="comentario-content">
                  {renderComentarioContenido(comentario)}
                </div>
              </div>
            )}
          />
        )}
      </div>
    </div>
  );
};

export default ComentariosTarea;
