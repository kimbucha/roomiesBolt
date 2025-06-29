import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface LoadingScreenProps {
  message?: string;
  transparent?: boolean;
}

/**
 * A full-screen loading component with gradient background
 * Used during app initialization and auth state changes to prevent white flashing
 */
const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'Loading...', 
  transparent = false 
}) => {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[
      styles.container, 
      transparent ? styles.transparentContainer : null,
      { paddingTop: insets.top, paddingBottom: insets.bottom }
    ]}>
      {!transparent && (
        <LinearGradient
          colors={['#6A11CB', '#2575FC']}
          style={styles.gradient}
        />
      )}
      <View style={styles.content}>
        <ActivityIndicator size="large" color="#ffffff" />
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  transparentContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    alignItems: 'center',
  },
  message: {
    marginTop: 16,
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LoadingScreen;
