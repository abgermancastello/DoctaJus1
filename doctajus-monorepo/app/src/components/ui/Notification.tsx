import React, { useEffect } from 'react';
import { useUIStore } from '../../stores/uiStore';

interface NotificationProps {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ 
  id, 
  type, 
  message, 
  onClose 
}) => {
  useEffect(() => {
    // Añadir clase para animar la entrada
    const element = document.getElementById(`notification-${id}`);
    if (element) {
      element.classList.add('notification-enter');
    }
  }, [id]);

  const handleClose = () => {
    // Añadir clase para animar la salida
    const element = document.getElementById(`notification-${id}`);
    if (element) {
      element.classList.add('notification-exit');
      // Esperar a que termine la animación
      setTimeout(onClose, 300);
    } else {
      onClose();
    }
  };

  // Diferentes iconos según el tipo
  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        );
      case 'error':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        );
    }
  };

  // Diferentes clases según el tipo
  const getTypeClasses = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 text-green-800 border-green-300 notification-success';
      case 'error':
        return 'bg-red-50 text-red-800 border-red-300 notification-error';
      case 'warning':
        return 'bg-yellow-50 text-yellow-800 border-yellow-300 notification-warning';
      default:
        return 'bg-blue-50 text-blue-800 border-blue-300 notification-info';
    }
  };

  return (
    <div 
      id={`notification-${id}`}
      className={`notification ${getTypeClasses()}`}
    >
      <div className="notification-icon">
        {getIcon()}
      </div>
      <div className="notification-content">
        {message}
      </div>
      <button 
        className="notification-close" 
        onClick={handleClose}
        aria-label="Cerrar"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>
  );
};

const NotificationsContainer: React.FC = () => {
  const { notifications, removeNotification } = useUIStore();

  if (notifications.length === 0) return null;

  return (
    <div className="notifications-container">
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          id={notification.id}
          type={notification.type}
          message={notification.message}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};

export default NotificationsContainer; 