import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
  cancelAnimation,
  runOnJS,
} from 'react-native-reanimated';

interface AnimatedIndicatorProps {
  children: React.ReactNode;
  isVisible: boolean;
  isActive: boolean;
  style?: ViewStyle;
  backgroundColor?: string;
  onAnimationComplete?: () => void;
}

/**
 * AnimatedIndicator - A component that wraps indicator icons and provides simple fade animations
 * 
 * @param children - The icon/component to display
 * @param isVisible - Whether the indicator should be visible (opacity animation)
 * @param isActive - Whether to trigger the completion animation
 * @param style - Additional styles for the container
 * @param backgroundColor - Background color for the indicator bubble (default: transparent)
 * @param onAnimationComplete - Callback when animation completes
 */
export const AnimatedIndicator: React.FC<AnimatedIndicatorProps> = ({
  children,
  isVisible,
  isActive,
  style,
  backgroundColor = 'transparent',
  onAnimationComplete,
}) => {
  // Animation shared values
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.5);
  
  // Track animation state to prevent multiple animations running simultaneously
  const isAnimating = useRef(false);
  const wasVisible = useRef(isVisible);
  const wasActive = useRef(isActive);
  const animationCompleteCallbackRef = useRef(onAnimationComplete);
  
  // Update callback ref when it changes
  useEffect(() => {
    animationCompleteCallbackRef.current = onAnimationComplete;
  }, [onAnimationComplete]);
  
  // Cleanup function to ensure animations are properly cancelled
  const cleanupAnimations = () => {
    cancelAnimation(opacity);
    cancelAnimation(scale);
    isAnimating.current = false;
  };
  
  // Handle visibility changes
  useEffect(() => {
    // Only animate if visibility changed
    if (isVisible !== wasVisible.current) {
      wasVisible.current = isVisible;
      
      if (isVisible) {
        // Ensure we're not in an animating state when becoming visible
        isAnimating.current = false;
        
        // Fade in when becoming visible - reduced from 120ms to 80ms
        opacity.value = withTiming(1, { 
          duration: 80,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        });
        
        // Scale up when becoming visible - simplified animation for faster response
        scale.value = withTiming(1, { 
          duration: 80,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        });
      } else if (!isActive) {
        // Only fade out if not currently in active state
        // This prevents conflicts between visibility and active animations
        
        // Fade out when becoming invisible - reduced from 100ms to 80ms
        opacity.value = withTiming(0, { 
          duration: 80,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        });
        
        // Scale down when becoming invisible - reduced from 100ms to 80ms
        scale.value = withTiming(0.5, { 
          duration: 80,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        });
      }
    }
    
    // Cleanup animations when component unmounts
    return cleanupAnimations;
  }, [isVisible, opacity, scale, isActive]);

  // Handle active state (completion animation)
  useEffect(() => {
    // Only trigger animation when isActive changes from false to true
    if (isActive && !wasActive.current && !isAnimating.current) {
      wasActive.current = isActive;
      
      // Mark as animating to prevent multiple animations
      isAnimating.current = true;
      
      // Ensure opacity is 1 during animation
      opacity.value = 1;
      
      // Enhanced scale animation for better visual feedback
      scale.value = withSequence(
        // Quick scale up - reduced from 120ms to 80ms
        withTiming(1.15, { 
          duration: 80,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        }),
        // Scale back down with a slight bounce - reduced from 80ms to 60ms
        withTiming(0.95, { 
          duration: 60,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        }),
        // Return to normal size - reduced from 100ms to 60ms
        withTiming(1, { 
          duration: 60,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        }, (finished) => {
          if (finished) {
            isAnimating.current = false;
            
            // Fade out after animation completes - reduced from 150ms to 100ms
            opacity.value = withTiming(0, { 
              duration: 100 
            }, () => {
              // Reset scale after fade out
              scale.value = 0.5;
            });
            
            // Call the completion callback
            if (animationCompleteCallbackRef.current) {
              runOnJS(animationCompleteCallbackRef.current)();
            }
          }
        })
      );
    } else if (!isActive && wasActive.current) {
      // Reset the active state tracking
      wasActive.current = false;
    }
    
    // Cleanup animations when component unmounts or when isActive changes
    return () => {
      // Only clean up if we're transitioning from active to inactive
      if (wasActive.current && !isActive) {
        cleanupAnimations();
      }
    };
  }, [isActive, opacity, scale]);

  // Create animated styles
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { scale: scale.value },
      ],
    };
  });

  return (
    <Animated.View style={[styles.container, animatedStyle, style]}>
      <View style={[styles.bubble, { backgroundColor }]}>
        {children}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubble: {
    borderRadius: 40,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AnimatedIndicator; 