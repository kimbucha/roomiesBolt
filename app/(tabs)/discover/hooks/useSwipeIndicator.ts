import { useState, useEffect } from 'react';
import { Animated } from 'react-native';

/**
 * Hook to manage swipe indicator animations
 * @param direction - The direction of the swipe ('left', 'right', 'up', or 'none')
 * @param duration - Duration of the animation in milliseconds
 * @returns Animation values and utility functions
 */
const useSwipeIndicator = (initialDirection = 'none', duration = 300) => {
  const [direction, setDirection] = useState(initialDirection);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Animation values
  const leftOpacity = useState(new Animated.Value(0))[0];
  const rightOpacity = useState(new Animated.Value(0))[0];
  const upOpacity = useState(new Animated.Value(0))[0];
  
  // Reset all animations
  const resetAnimations = () => {
    leftOpacity.setValue(0);
    rightOpacity.setValue(0);
    upOpacity.setValue(0);
    setDirection('none');
    setIsAnimating(false);
  };
  
  // Trigger a swipe animation
  const triggerSwipe = (newDirection: 'left' | 'right' | 'up' | 'none') => {
    if (isAnimating) return;
    
    setDirection(newDirection);
    setIsAnimating(true);
    
    // Determine which animation to run
    let animationValue: Animated.Value;
    switch (newDirection) {
      case 'left':
        animationValue = leftOpacity;
        break;
      case 'right':
        animationValue = rightOpacity;
        break;
      case 'up':
        animationValue = upOpacity;
        break;
      default:
        resetAnimations();
        return;
    }
    
    // Run the animation
    Animated.sequence([
      Animated.timing(animationValue, {
        toValue: 1,
        duration: duration / 2,
        useNativeDriver: true,
      }),
      Animated.timing(animationValue, {
        toValue: 0,
        duration: duration / 2,
        useNativeDriver: true,
      }),
    ]).start(() => {
      resetAnimations();
    });
  };
  
  // Clean up animations on unmount
  useEffect(() => {
    return () => {
      resetAnimations();
    };
  }, []);
  
  return {
    direction,
    isAnimating,
    leftOpacity,
    rightOpacity,
    upOpacity,
    triggerSwipe,
    resetAnimations,
  };
};

export default useSwipeIndicator;