import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { create } from 'zustand';

// Toast types
type ToastType = 'success' | 'error' | 'info';

// Toast message interface
interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

// Toast store interface
interface ToastStore {
  messages: ToastMessage[];
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  hideToast: (id: string) => void;
}

// Create toast store
export const useToastStore = create<ToastStore>((set) => ({
  messages: [],
  showToast: (message, type = 'success', duration = 3000) => {
    const id = Date.now().toString();
    set((state) => ({
      messages: [...state.messages, { id, message, type, duration }],
    }));

    // Auto-hide toast after duration
    setTimeout(() => {
      set((state) => ({
        messages: state.messages.filter((msg) => msg.id !== id),
      }));
    }, duration);
  },
  hideToast: (id) => {
    set((state) => ({
      messages: state.messages.filter((msg) => msg.id !== id),
    }));
  },
}));

// Toast component
const Toast: React.FC<{ message: ToastMessage }> = ({ message }) => {
  const { hideToast } = useToastStore();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

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

    // Auto-hide after duration
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -20,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        hideToast(message.id);
      });
    }, message.duration || 3000);

    return () => clearTimeout(timer);
  }, []);

  // Get background color based on toast type
  const getBackgroundColor = () => {
    switch (message.type) {
      case 'success':
        return '#4CAF50';
      case 'error':
        return '#F44336';
      case 'info':
        return '#2196F3';
      default:
        return '#333333';
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: getBackgroundColor(),
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <Text style={styles.message}>{message.message}</Text>
    </Animated.View>
  );
};

// Toast container component
export const ToastContainer: React.FC = () => {
  const { messages } = useToastStore();

  return (
    <View style={styles.toastContainer}>
      {messages.map((msg) => (
        <Toast key={msg.id} message={msg} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: 'center',
  },
  container: {
    marginVertical: 5,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: Dimensions.get('window').width * 0.9,
  },
  message: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
});

// Helper function to show toast from anywhere in the app
export const showToast = (message: string, type: ToastType = 'success', duration: number = 3000) => {
  useToastStore.getState().showToast(message, type, duration);
};

export default ToastContainer;
