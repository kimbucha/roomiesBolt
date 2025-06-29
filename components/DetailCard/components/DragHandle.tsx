import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface DragHandleProps {
  color?: string;
  width?: number;
  height?: number;
  opacity?: number;
  isDragging?: boolean;
}

/**
 * A visual indicator that shows users they can drag the sheet
 */
export const DragHandle: React.FC<DragHandleProps> = ({
  color = '#CCCCCC',
  width = 36,
  height = 5,
  opacity = 0.6,
  isDragging = false
}) => {
  // Use animated values for smooth transitions
  const animatedWidth = useRef(new Animated.Value(width)).current;
  const animatedOpacity = useRef(new Animated.Value(opacity)).current;
  
  // The active width when dragging
  const activeWidth = width * 1.2;
  const activeOpacity = Math.min(1, opacity * 1.3);
  
  // Animate changes to width and opacity based on isDragging
  useEffect(() => {
    Animated.parallel([
      Animated.spring(animatedWidth, {
        toValue: isDragging ? activeWidth : width,
        useNativeDriver: false,
        friction: 8,
        tension: 50
      }),
      Animated.spring(animatedOpacity, {
        toValue: isDragging ? activeOpacity : opacity,
        useNativeDriver: false,
        friction: 8,
        tension: 50
      })
    ]).start();
  }, [isDragging, width, opacity, activeWidth, activeOpacity]);
  
  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.handle,
          {
            backgroundColor: color,
            width: animatedWidth,
            height,
            opacity: animatedOpacity
          }
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    width: '100%'
  },
  handle: {
    borderRadius: 3
  }
}); 