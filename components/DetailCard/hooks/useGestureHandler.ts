import { useRef, useState, useMemo } from 'react';
import { PanResponder, Animated } from 'react-native';
import { useVelocityTracker } from './useVelocityTracker';
import { useDebugLogger } from '../utils/loggerUtils';
import { 
  shouldDismissSwipe, 
  shouldDismissShortGesture,
  calculateEffectiveVelocity
} from '../utils/gestureUtils';
import {
  animateDismiss,
  animateSpringBack
} from '../utils/animationUtils';

interface UseGestureHandlerProps {
  detailSheetHeight: number;
  vibrationEnabled: boolean;
  onDismiss: () => void;
  logger?: ReturnType<typeof useDebugLogger>;
  velocityTracker?: ReturnType<typeof useVelocityTracker>;
  infoSlideAnim?: Animated.Value;
  setIsDragging?: (isDragging: boolean) => void;
  scrollOffset?: number;
}

/**
 * Hook for handling pan gestures on the detail sheet
 */
export const useGestureHandler = ({
  detailSheetHeight,
  vibrationEnabled,
  onDismiss,
  logger: externalLogger,
  velocityTracker: externalTracker,
  infoSlideAnim: externalAnim,
  setIsDragging: externalSetIsDragging,
  scrollOffset = 0
}: UseGestureHandlerProps) => {
  // Animation value for the sheet position
  const localInfoSlideAnim = useRef(new Animated.Value(0)).current;
  const infoSlideAnim = externalAnim || localInfoSlideAnim;
  
  // Velocity tracker for more reliable velocity calculations
  const localVelocityTracker = useVelocityTracker();
  const velocityTracker = externalTracker || localVelocityTracker;
  
  // Local dragging state
  const isDraggingLocal = useRef(false);
  const setIsDragging = (dragging: boolean) => {
    isDraggingLocal.current = dragging;
    externalSetIsDragging?.(dragging);
  };
  
  // Dismissal lock to prevent double dismissal
  const isDismissing = useRef(false);
  
  const localLogger = useDebugLogger();
  const logger = externalLogger || localLogger;
  
  /**
   * Dismiss the sheet with animation
   */
  const dismissWithAnimation = (velocity: number): void => {
    // Prevent duplicate dismissals
    if (isDismissing.current) {
      console.log('[SWIPE-ANIMATION] Dismissal already in progress, ignoring duplicate request');
      return;
    }
    
    // Set the dismissing flag
    isDismissing.current = true;
    
    // Debug logging reduced to minimize console spam during drag interactions
    
    // Calculate duration based on velocity
    // Faster velocity = shorter duration
    const baseDuration = 300; // Base duration in ms
    const velocityFactor = Math.max(0.2, Math.min(1, Math.abs(velocity) / 2));
    const duration = Math.max(150, baseDuration * (1 - velocityFactor * 0.7));
    
    // Call the animation utility
    animateDismiss(
      infoSlideAnim,
      detailSheetHeight,
      duration,
      vibrationEnabled,
      () => {
        // Reset the dismissing flag before calling onDismiss
        isDismissing.current = false;
        onDismiss();
      }
    );
  };
  
  /**
   * Create the pan responder
   */
  const panResponder = useMemo(() => PanResponder.create({
    // Only capture gestures at the header/top of the sheet
    // This allows scrolling in the content area
    onStartShouldSetPanResponderCapture: (_, gestureState) => {
      // We'll let the component tell us if we're touching the header/drag area
      // through the nativeEvent locationY property in onPanResponderGrant
      return false;
    },
    
    onMoveShouldSetPanResponderCapture: (evt, gestureState) => {
      const { dy, moveY, y0 } = gestureState;
      
      // If we're already dragging, maintain control
      if (isDraggingLocal.current) {
        return true;
      }
      
      // CRITICAL: Only capture downward movements for dismissal
      // Upward gestures should NEVER dismiss (they should scroll the content instead)
      const isDownwardSwipe = dy > 0;
      
      // If not a downward swipe, never capture the gesture - let the ScrollView handle it
      if (!isDownwardSwipe) {
        return false;
      }
      
      // For gestures that start in the header area, always capture if downward
      const isNearTop = y0 < 50; // Assume header area is about 50px tall
      if (isNearTop) {
        return isDownwardSwipe;
      }
      
      // CRITICAL: If the ScrollView is at the top (scrollOffset = 0),
      // we SHOULD capture downward swipes to dismiss the sheet, but with
      // a slightly higher threshold to make the transition feel smoother
      const isScrollViewAtTop = scrollOffset <= 0;
      if (isScrollViewAtTop) {
        // For significant downward swipes when at the top, capture for dismissal
        // Using a slightly higher threshold (10px instead of 5px) for smoother feel
        return isDownwardSwipe && Math.abs(dy) > 10;
      }
      
      // CRITICAL: If the ScrollView is scrolled down (not at the top),
      // we should NOT capture downward swipes - they should scroll the content
      const isScrollViewScrolled = scrollOffset > 0;
      if (isScrollViewScrolled) {
        // Let the ScrollView handle downward swipes when scrolled
        return false;
      }
      
      // For other areas, only capture if it's a significant downward swipe
      // and only if the ScrollView is at the top
      return isDownwardSwipe && Math.abs(dy) > 20;
    },
    
    // Be selective about handling touches, only capture in header or for significant downward swipes
    onStartShouldSetPanResponder: (evt, gestureState) => {
      // Get touch position within the component
      const { locationY } = evt.nativeEvent;
      
      // Store the initial touch position to help with header detection
      const isTouchingHeader = locationY < 50;
      
      // Only capture if touching the header area (drag handle)
      return isTouchingHeader;
    },
    
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      // If we're already dragging, maintain control
      if (isDraggingLocal.current) {
        return true;
      }
      
      const { dy, moveY, y0 } = gestureState;
      
      // Get the current touch position
      const { locationY } = evt.nativeEvent;
      const isTouchingHeader = locationY < 50;
      
      // CRITICAL: Only allow downward swipes to potentially dismiss
      // Upward swipes should always go to the ScrollView for scrolling
      const isDownwardSwipe = dy > 0;
      
      // For upward movements, never capture - let the ScrollView handle scrolling
      if (!isDownwardSwipe) {
        return false;
      }
      
      // For gestures that start near the top, be more sensitive to downward swipes
      // But only if they're actually in the header area
      if (isTouchingHeader) {
        return isDownwardSwipe;
      }
      
      // CRITICAL: If the ScrollView is at the top (scrollOffset = 0),
      // we SHOULD capture downward swipes to dismiss the sheet, but with
      // a slightly higher threshold to make the transition feel smoother
      const isScrollViewAtTop = scrollOffset <= 0;
      if (isScrollViewAtTop) {
        // For significant downward swipes when at the top, capture for dismissal
        // Using a slightly higher threshold (10px instead of 5px) for smoother feel
        return isDownwardSwipe && Math.abs(dy) > 10;
      }
      
      // CRITICAL: If the ScrollView is scrolled down (not at the top),
      // we should NOT capture downward swipes - they should scroll the content
      const isScrollViewScrolled = scrollOffset > 0;
      if (isScrollViewScrolled) {
        // Let the ScrollView handle downward swipes when scrolled
        return false;
      }
      
      // For other areas, require more significant downward movement
      // and only if we're sure it's not a scroll gesture
      return isDownwardSwipe && Math.abs(dy) > 20;
    },
    
    // When the gesture starts
    onPanResponderGrant: (evt, gestureState) => {
      // Track the initial touch position to help distinguish header touches from content touches
      const { locationY } = evt.nativeEvent;
      const isTouchingHeader = locationY < 50;
      
      // Reduced logging to minimize console spam during drag interactions
      
      // Only set dragging if we're touching the header area
      if (isTouchingHeader) {
        setIsDragging(true);
      }
      
      // Stop any ongoing animations
      infoSlideAnim.stopAnimation();
      // Reset velocity tracker
      velocityTracker.reset();
    },
    
    // When the gesture moves
    onPanResponderMove: (_, gestureState) => {
      const { dy, vy } = gestureState;
      
      // Track the movement for velocity calculations
      velocityTracker.addSample(dy);
      
      // Get the maximum velocity from history
      const maxHistoryVelocity = velocityTracker.getMaxVelocity();
      
      // Get the total gesture time so far
      const totalGestureTime = velocityTracker.getTotalTime();
      
      // Convert vy to pixels per second (React Native provides vy in unusual units)
      const vyPixelsPerSecond = vy * 1000;
      
      // Calculate a manual velocity as a fallback when the system velocity detection fails
      // If we have a total gesture time, calculate velocity as distance/time
      let manualVelocity = 0;
      if (totalGestureTime > 0) {
        manualVelocity = Math.abs(dy) / (totalGestureTime / 1000);
        // Apply direction of the gesture
        if (dy < 0) manualVelocity *= -1;
      }
      
      // For real-world swipe gestures, ensure we have a minimum reasonable velocity
      // This compensates for the broken velocity measurements
      // Set a minimum reasonable velocity based on drag distance to make normal swipes work
      let minVelocity = 0;
      if (Math.abs(dy) > 30) {
        minVelocity = 600; // Large swipe - high velocity
      } else if (Math.abs(dy) > 20) {
        minVelocity = 500; // Medium swipe - medium-high velocity 
      } else if (Math.abs(dy) > 10) {
        minVelocity = 400; // Normal swipe - medium velocity
      } else if (Math.abs(dy) > 5) {
        minVelocity = 200; // Small swipe - lower velocity
      }
      
      const effectiveVy = Math.abs(manualVelocity) > minVelocity ? manualVelocity : (Math.abs(dy) > 5 ? (dy > 0 ? minVelocity : -minVelocity) : 0);
      
      // Check if this is a fast swipe that should dismiss
      const isFastSwipe = shouldDismissSwipe(
        dy,
        effectiveVy, // Use our manually calculated velocity
        maxHistoryVelocity,
        velocityTracker.hasConsistentHighVelocity,
        detailSheetHeight
      );
      
      // Log the current state - but only for significant movements to reduce noise
      if (Math.abs(dy) > 10) {
        // Logging reduced to minimize console spam during drag interactions
      }
      
      // If it's a fast swipe, dismiss immediately
      if (isFastSwipe) {
        // Only log when we're actually dismissing
        console.log(`[GESTURE] Fast swipe detected - dy: ${dy.toFixed(1)}px, vy: ${effectiveVy.toFixed(0)}px/s`);
        
        // Calculate effective velocity for animation
        const effectiveVelocity = calculateEffectiveVelocity(
          dy,
          effectiveVy,
          true,
          maxHistoryVelocity,
          0, // alternateVelocity
          detailSheetHeight
        );
        
        dismissWithAnimation(effectiveVelocity);
        return;
      }
      
      // Otherwise, update the position based on gesture
      infoSlideAnim.setValue(Math.max(0, dy));
    },
    
    // When the gesture ends
    onPanResponderRelease: (_, gestureState) => {
      const { dy, vy } = gestureState;
      
      // Add final sample for velocity calculation
      velocityTracker.addSample(dy);
      
      // Get the maximum velocity from history
      const maxHistoryVelocity = velocityTracker.getMaxVelocity();
      
      // Get the total gesture time
      const totalGestureTime = velocityTracker.getTotalTime();
      
      // Convert vy to pixels per second (React Native provides vy in unusual units)
      const vyPixelsPerSecond = vy * 1000;
      
      // Calculate a manual velocity as a fallback when the system velocity detection fails
      // If we have a total gesture time, calculate velocity as distance/time
      let manualVelocity = 0;
      if (totalGestureTime > 0) {
        manualVelocity = Math.abs(dy) / (totalGestureTime / 1000);
        // Apply direction of the gesture
        if (dy < 0) manualVelocity *= -1;
      }
      
      // For real-world swipe gestures, ensure we have a minimum reasonable velocity
      // This compensates for the broken velocity measurements
      // Set a minimum reasonable velocity based on drag distance to make normal swipes work
      let minVelocity = 0;
      if (Math.abs(dy) > 30) {
        minVelocity = 600; // Large swipe - high velocity
      } else if (Math.abs(dy) > 20) {
        minVelocity = 500; // Medium swipe - medium-high velocity 
      } else if (Math.abs(dy) > 10) {
        minVelocity = 400; // Normal swipe - medium velocity
      } else if (Math.abs(dy) > 5) {
        minVelocity = 200; // Small swipe - lower velocity
      }
      
      const effectiveVy = Math.abs(manualVelocity) > minVelocity ? manualVelocity : (Math.abs(dy) > 5 ? (dy > 0 ? minVelocity : -minVelocity) : 0);
      
      // Simplified logging to reduce console spam during drag interactions
      if (Math.abs(dy) > 20) {
        console.log(`[GESTURE] Release - dy: ${dy.toFixed(1)}px, vy: ${effectiveVy.toFixed(1)}px/s`);
      }
      
      // Check if this is a fast swipe that should dismiss
      const isFastSwipe = shouldDismissSwipe(
        dy,
        effectiveVy, // Use our manually calculated velocity
        maxHistoryVelocity,
        velocityTracker.hasConsistentHighVelocity,
        detailSheetHeight
      );
      
      // Check if this is a short gesture that should dismiss
      const isShortGesture = shouldDismissShortGesture(
        dy,
        effectiveVy, // Use our manually calculated velocity
        maxHistoryVelocity,
        totalGestureTime,
        detailSheetHeight
      );
      
      // Debug logging removed to reduce console spam during drag interactions
      
      // If it's a fast swipe or short gesture, dismiss
      if (isFastSwipe || isShortGesture) {
        // Debug logging removed to reduce console spam during drag interactions
        
        // Calculate effective velocity for animation
        const effectiveVelocity = calculateEffectiveVelocity(
          dy,
          effectiveVy, // Use our manually calculated velocity
          true,
          maxHistoryVelocity,
          0, // alternateVelocity
          detailSheetHeight
        );
        
        dismissWithAnimation(effectiveVelocity);
        return;
      }
      
      // Otherwise, spring back to original position
      // Debug logging removed to reduce console spam during drag interactions
      animateSpringBack(infoSlideAnim);
      
      // Always reset isDragging state when the gesture ends
      setIsDragging(false);
    },
    
    // When the gesture is terminated (e.g. by another responder taking over)
    onPanResponderTerminate: () => {
      // Spring back to original position
      animateSpringBack(infoSlideAnim);
      
      // Reset isDragging state
      setIsDragging(false);
    },
    
    // Don't capture events after becoming responder
    onPanResponderTerminationRequest: () => true,
  }), [
    detailSheetHeight,
    vibrationEnabled,
    onDismiss,
    infoSlideAnim,
    setIsDragging,
    velocityTracker,
    logger
  ]);
  
  return {
    panResponder,
    panHandlers: panResponder.panHandlers,
    infoSlideAnim,
    isDragging: isDraggingLocal.current,
    dismissWithAnimation,
    logger
  };
}; 