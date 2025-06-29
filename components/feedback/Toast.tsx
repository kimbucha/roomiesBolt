import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react-native';
import { useNotificationStore, NotificationType, Notification } from '../../store/notificationStore';

interface ToastItemProps {
  notification: Notification;
  onClose: () => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ notification, onClose }) => {
  const { id, type, title, message } = notification;
  const opacity = new Animated.Value(0);
  const translateY = new Animated.Value(-20);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Animate in
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-close if enabled
    if (notification.autoClose) {
      timeoutRef.current = setTimeout(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          onClose();
        });
      }, (notification.duration || 3000) - 300); // Subtract animation duration and provide default
    }
    
    // Cleanup function to clear timeout when component unmounts
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const getIconAndColor = () => {
    switch (type) {
      case NotificationType.SUCCESS:
        return { icon: <CheckCircle size={20} color="#10B981" />, color: '#10B981', bgColor: '#D1FAE5' };
      case NotificationType.ERROR:
        return { icon: <AlertCircle size={20} color="#EF4444" />, color: '#EF4444', bgColor: '#FEE2E2' };
      case NotificationType.WARNING:
        return { icon: <AlertTriangle size={20} color="#F59E0B" />, color: '#F59E0B', bgColor: '#FEF3C7' };
      case NotificationType.INFO:
      default:
        return { icon: <Info size={20} color="#3B82F6" />, color: '#3B82F6', bgColor: '#DBEAFE' };
    }
  };

  const { icon, color, bgColor } = getIconAndColor();

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: bgColor, borderLeftColor: color, opacity, transform: [{ translateY }] },
      ]}
    >
      <View style={styles.iconContainer}>{icon}</View>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <X size={16} color="#6B7280" />
      </TouchableOpacity>
    </Animated.View>
  );
};

export const ToastContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotificationStore();

  return (
    <View style={styles.toastContainer}>
      {notifications.map((notification) => (
        <ToastItem
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
  },
  iconContainer: {
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 2,
  },
  message: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#4B5563',
  },
  closeButton: {
    padding: 4,
  },
});

export const Toast = ToastContainer;
