import { Animated, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Vibration } from 'react-native';
import { Easing } from 'react-native';

/**
 * Utility functions for animations
 */

/**
 * Animates a sheet dismissal with haptic feedback
 */
export const animateDismiss = (
  infoSlideAnim: Animated.Value,
  toValue: number,
  duration: number,
  vibrationEnabled: boolean,
  onComplete?: () => void
): void => {
  // Debug logging reduced to minimize console spam during drag interactions
  
  Animated.timing(infoSlideAnim, {
    toValue,
    duration,
    useNativeDriver: true,
    easing: Easing.out(Easing.ease),
  }).start((finished) => {
    if (finished) {
      // Debug logging reduced to minimize console spam during drag interactions
      
      // Provide haptic feedback on completion if enabled
      if (vibrationEnabled) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      
      // Call completion callback
      onComplete?.();
    }
  });
};

/**
 * Animates a spring back to the original position
 */
export const animateSpringBack = (
  animation: Animated.Value,
  toValue: number = 0,
  onComplete?: () => void
): void => {
  console.log('[DEBUG] Springing back to position', toValue);
  
  // Get the current position to determine spring parameters
  animation.stopAnimation((currentValue) => {
    // The distance being sprung back
    const distance = Math.abs(currentValue - toValue);
    
    // For very small movements, use gentler spring parameters
    // This creates a smoother, less "bouncy" feel for tiny accidental movements
    const isSmallMovement = distance < 20;
    
    Animated.spring(animation, {
      toValue,
      useNativeDriver: true,
      // Smaller tension and higher friction for small movements
      tension: isSmallMovement ? 40 : 50,
      friction: isSmallMovement ? 9 : 7,
      // More precise threshold for small movements
      restDisplacementThreshold: isSmallMovement ? 0.05 : 0.01,
      restSpeedThreshold: isSmallMovement ? 0.05 : 0.01
    }).start(onComplete);
  });
}; 