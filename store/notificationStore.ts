import { create } from 'zustand';

// Notification types
export enum NotificationType {
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  WARNING = 'WARNING',
  INFO = 'INFO',
}

// Notification interface
export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  title?: string;
  autoClose?: boolean;
  duration?: number;
  createdAt: Date;
  timeoutId?: NodeJS.Timeout;
}

// Notification store interface
interface NotificationState {
  notifications: Notification[];
  timeouts: Record<string, NodeJS.Timeout>;
  showNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'timeoutId'>) => string;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

// Create notification store
export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  timeouts: {},
  
  showNotification: (notification) => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newNotification: Notification = {
      id,
      ...notification,
      autoClose: notification.autoClose ?? true,
      duration: notification.duration ?? 5000, // Default 5 seconds
      createdAt: new Date(),
    };
    
    set((state) => ({
      notifications: [...state.notifications, newNotification],
    }));
    
    // Auto-close notification if enabled
    if (newNotification.autoClose) {
      const timeoutId = setTimeout(() => {
        get().removeNotification(id);
      }, newNotification.duration);
      
      // Store timeout ID for cleanup
      set((state) => ({
        timeouts: { ...state.timeouts, [id]: timeoutId }
      }));
      
      // Attach timeoutId to notification for tracking
      newNotification.timeoutId = timeoutId;
    }
    
    return id;
  },
  
  removeNotification: (id) => {
    // Clear timeout if exists
    const { timeouts } = get();
    if (timeouts[id]) {
      clearTimeout(timeouts[id]);
      
      // Remove from timeouts
      set((state) => {
        const newTimeouts = { ...state.timeouts };
        delete newTimeouts[id];
        return { timeouts: newTimeouts };
      });
    }
    
    set((state) => ({
      notifications: state.notifications.filter((notification) => notification.id !== id),
    }));
  },
  
  clearAllNotifications: () => {
    // Clear all timeouts
    const { timeouts } = get();
    Object.values(timeouts).forEach(timeoutId => {
      clearTimeout(timeoutId);
    });
    
    set({ notifications: [], timeouts: {} });
  },
}));

// Helper functions for showing different types of notifications
export const showSuccessNotification = (
  message: string,
  title: string = 'Success',
  options: Partial<Notification> = {}
): string => {
  return useNotificationStore.getState().showNotification({
    type: NotificationType.SUCCESS,
    message,
    title,
    ...options,
  });
};

export const showErrorNotification = (
  message: string,
  title: string = 'Error',
  options: Partial<Notification> = {}
): string => {
  return useNotificationStore.getState().showNotification({
    type: NotificationType.ERROR,
    message,
    title,
    ...options,
  });
};

export const showWarningNotification = (
  message: string,
  title: string = 'Warning',
  options: Partial<Notification> = {}
): string => {
  return useNotificationStore.getState().showNotification({
    type: NotificationType.WARNING,
    message,
    title,
    ...options,
  });
};

export const showInfoNotification = (
  message: string,
  title: string = 'Info',
  options: Partial<Notification> = {}
): string => {
  return useNotificationStore.getState().showNotification({
    type: NotificationType.INFO,
    message,
    title,
    ...options,
  });
};
