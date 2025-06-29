import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Bug } from 'lucide-react-native';

interface DebugButtonProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export default function DebugButton({ position = 'bottom-right' }: DebugButtonProps) {
  const router = useRouter();

  const getPositionStyle = () => {
    switch (position) {
      case 'top-left':
        return { top: 50, left: 20 };
      case 'top-right':
        return { top: 50, right: 20 };
      case 'bottom-left':
        return { bottom: 30, left: 20 };
      case 'bottom-right':
      default:
        return { bottom: 30, right: 20 };
    }
  };

  return (
    <TouchableOpacity
      style={[styles.debugButton, getPositionStyle()]}
      onPress={() => router.push('/(debug)')}
    >
      <Bug size={20} color="#FFFFFF" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  debugButton: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(98, 0, 238, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    zIndex: 999,
  },
});
