import { useRef, useCallback } from 'react';
import { calculateVelocity } from '../utils/gestureUtils';

interface VelocitySample {
  position: number;
  timestamp: number;
  velocity: number;
}

/**
 * Hook for tracking velocity over time with improved reliability
 */
export const useVelocityTracker = (historySize = 6, minTimeDelta = 10) => {
  const velocityHistory = useRef<VelocitySample[]>([]);
  const lastPosition = useRef<number | null>(null);
  const lastTimestamp = useRef<number | null>(null);
  const maxVelocity = useRef<number>(0);
  const totalGestureTime = useRef<number>(0);
  const gestureStartTime = useRef<number | null>(null);

  /**
   * Adds a new position sample and calculates velocity
   */
  const addSample = useCallback((position: number) => {
    const now = Date.now();
    
    // Initialize gesture timing on first sample
    if (gestureStartTime.current === null) {
      gestureStartTime.current = now;
    }
    
    // Update total gesture time
    if (gestureStartTime.current !== null) {
      totalGestureTime.current = now - gestureStartTime.current;
    }

    // Calculate velocity if we have previous data
    if (lastPosition.current !== null && lastTimestamp.current !== null) {
      const timeDelta = now - lastTimestamp.current;
      
      // Only calculate velocity if enough time has passed to avoid spikes
      if (timeDelta >= minTimeDelta) {
        const displacement = position - lastPosition.current;
        const velocity = calculateVelocity(displacement, timeDelta);
        
        // Add to history
        velocityHistory.current.push({
          position,
          timestamp: now,
          velocity
        });
        
        // Limit history size
        if (velocityHistory.current.length > historySize) {
          velocityHistory.current.shift();
        }
        
        // Update max velocity (using absolute value)
        if (Math.abs(velocity) > Math.abs(maxVelocity.current)) {
          maxVelocity.current = velocity;
        }
      }
    }
    
    // Update last position and timestamp
    lastPosition.current = position;
    lastTimestamp.current = now;
  }, [historySize, minTimeDelta]);

  /**
   * Resets the velocity tracker for a new gesture
   */
  const reset = useCallback(() => {
    velocityHistory.current = [];
    lastPosition.current = null;
    lastTimestamp.current = null;
    maxVelocity.current = 0;
    totalGestureTime.current = 0;
    gestureStartTime.current = null;
  }, []);

  /**
   * Gets the maximum velocity recorded (absolute value)
   */
  const getMaxVelocity = useCallback(() => {
    return Math.abs(maxVelocity.current);
  }, []);

  /**
   * Gets the total duration of the current gesture in milliseconds
   */
  const getTotalTime = useCallback(() => {
    return totalGestureTime.current;
  }, []);

  /**
   * Checks if a certain percentage of velocity samples are above a threshold
   */
  const hasConsistentHighVelocity = useCallback((threshold: number, percentage = 0.8) => {
    if (velocityHistory.current.length === 0) return false;
    
    const highVelocitySamples = velocityHistory.current.filter(
      sample => Math.abs(sample.velocity) > threshold
    );
    
    return highVelocitySamples.length / velocityHistory.current.length >= percentage;
  }, []);

  return {
    addSample,
    reset,
    getMaxVelocity,
    getTotalTime,
    hasConsistentHighVelocity,
    getVelocityHistory: () => [...velocityHistory.current]
  };
}; 