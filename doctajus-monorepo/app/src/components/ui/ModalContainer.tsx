import React from 'react';
import { Modal } from 'antd';
import { useUIStore } from '../../stores/uiStore';

const ModalContainer: React.FC = () => {
  const { modal, closeModal } = useUIStore();
  const { isOpen, title, content, onConfirm, confirmText, cancelText, showCancel } = modal;

  return (
    <Modal
      title={title}
      open={isOpen}
      onOk={() => {
        if (onConfirm) onConfirm();
        closeModal();
      }}
      onCancel={closeModal}
      okText={confirmText}
      cancelText={cancelText}
      cancelButtonProps={{ style: { display: showCancel ? 'inline-block' : 'none' } }}
      centered
      destroyOnClose
    >
      {content}
    </Modal>
  );
};

export default ModalContainer;
