import { create } from 'zustand';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  description?: string;
}

interface ModalConfig {
  isOpen: boolean;
  title: string;
  content: React.ReactNode | null;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
}

interface ConfirmModalConfig {
  isOpen: boolean;
  title: string;
  content: React.ReactNode | null;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

interface UIState {
  // Manejo de notificaciones
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;

  // Manejo de modales
  modal: ModalConfig;
  openModal: (config: Omit<ModalConfig, 'isOpen'>) => void;
  closeModal: () => void;

  // Manejo de modales de confirmación
  confirmModal: ConfirmModalConfig;
  openConfirmModal: (config: Omit<ConfirmModalConfig, 'isOpen'>) => void;
  closeConfirmModal: () => void;

  // Manejo del sidebar
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;

  // Manejo del tema
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (isDark: boolean) => void;

  // Estado de carga global
  isGlobalLoading: boolean;
  setGlobalLoading: (isLoading: boolean) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  // Estado inicial para notificaciones
  notifications: [],

  addNotification: (notification) => {
    const id = Date.now().toString();
    set((state) => ({
      notifications: [...state.notifications, { ...notification, id }]
    }));

    // Auto-remove notification after 5 seconds
    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id)
      }));
    }, 5000);
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id)
    }));
  },

  clearNotifications: () => {
    set({ notifications: [] });
  },

  // Estado inicial para modales
  modal: {
    isOpen: false,
    title: '',
    content: null,
    confirmText: 'Aceptar',
    cancelText: 'Cancelar',
    showCancel: true
  },

  openModal: (config) => {
    set({
      modal: {
        ...config,
        isOpen: true
      }
    });
  },

  closeModal: () => {
    set(state => ({
      modal: {
        ...state.modal,
        isOpen: false,
        content: null
      }
    }));
  },

  // Estado inicial para modales de confirmación
  confirmModal: {
    isOpen: false,
    title: '',
    content: null,
    onConfirm: () => {},
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    type: 'warning'
  },

  openConfirmModal: (config) => {
    set({
      confirmModal: {
        ...config,
        isOpen: true
      }
    });
  },

  closeConfirmModal: () => {
    set(state => ({
      confirmModal: {
        ...state.confirmModal,
        isOpen: false,
        content: null
      }
    }));
  },

  // Estado inicial para el sidebar
  isSidebarOpen: true,

  toggleSidebar: () => {
    set(state => ({
      isSidebarOpen: !state.isSidebarOpen
    }));
  },

  setSidebarOpen: (isOpen) => {
    set({ isSidebarOpen: isOpen });
  },

  // Estado inicial para el tema
  isDarkMode: localStorage.getItem('darkMode') === 'true',

  toggleDarkMode: () => {
    set(state => {
      const newDarkMode = !state.isDarkMode;
      localStorage.setItem('darkMode', newDarkMode.toString());
      return { isDarkMode: newDarkMode };
    });
  },

  setDarkMode: (isDark) => {
    localStorage.setItem('darkMode', isDark.toString());
    set({ isDarkMode: isDark });
  },

  // Estado inicial para carga global
  isGlobalLoading: false,

  setGlobalLoading: (isLoading) => {
    set({ isGlobalLoading: isLoading });
  }
}));
