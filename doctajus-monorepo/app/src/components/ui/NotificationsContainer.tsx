import React from 'react';
import { notification as antNotification } from 'antd';
import { useUIStore } from '../../stores/uiStore';

const NotificationsContainer: React.FC = () => {
  const { notifications, removeNotification } = useUIStore();

  React.useEffect(() => {
    notifications.forEach((notif) => {
      antNotification[notif.type]({
        message: notif.message,
        description: notif.description,
        duration: 5,
        onClose: () => removeNotification(notif.id),
      });
    });
  }, [notifications, removeNotification]);

  return null;
};

export default NotificationsContainer;
