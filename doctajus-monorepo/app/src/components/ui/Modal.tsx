import React from 'react';
import { Modal } from 'antd';

interface ModalProps {
  isOpen: boolean;
  title: string;
  content: React.ReactNode;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  width?: number;
}

const CustomModal: React.FC<ModalProps> = ({
  isOpen,
  title,
  content,
  onClose,
  onConfirm,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  width = 520,
}) => {
  return (
    <Modal
      title={title}
      open={isOpen}
      onCancel={onClose}
      onOk={onConfirm}
      okText={confirmText}
      cancelText={cancelText}
      width={width}
      destroyOnClose
      centered
    >
      <div>{content}</div>
    </Modal>
  );
};

export default CustomModal;
