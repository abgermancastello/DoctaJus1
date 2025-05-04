import React from 'react';
import { useUIStore } from '../../stores/uiStore';
import { notification } from 'antd';

const NotificationCenter: React.FC = () => {
  const { notifications, removeNotification } = useUIStore();

  React.useEffect(() => {
    notifications.forEach((notif) => {
      notification[notif.type]({
        message: notif.message,
        description: notif.description,
        key: notif.id,
        onClose: () => removeNotification(notif.id)
      });
    });
  }, [notifications, removeNotification]);

  return null;
};

export default NotificationCenter;
