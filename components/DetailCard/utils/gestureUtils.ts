/**
 * Utility functions for gesture calculations and velocity tracking
 */

/**
 * Calculates velocity in pixels per second from displacement and time
 */
export const calculateVelocity = (
  displacement: number,
  timeDeltaMs: number
): number => {
  if (timeDeltaMs <= 0) return 0;
  return (displacement / timeDeltaMs) * 1000; // Convert to pixels per second
};

/**
 * Determines if a swipe should dismiss based on distance and velocity
 * 
 * Following best practices for bottom sheet dismissal:
 * 1. Small movements with low velocity should spring back
 * 2. Large movements (>40% of sheet height) should always dismiss
 * 3. Medium movements with moderate velocity should dismiss
 * 4. Any movement with very high velocity should dismiss
 */
export const shouldDismissSwipe = (
  dy: number,
  velocity: number,
  maxHistoryVelocity: number,
  hasConsistentHighVelocity: boolean,
  detailSheetHeight: number
): boolean => {
  // NEVER dismiss for upward swipes
  if (dy < 0) {
    // Debug logging reduced to minimize console spam during drag interactions
    return false;
  }

  // Calculate percentage of screen dragged
  const percentDragged = Math.abs(dy) / detailSheetHeight;
  
  // Log the swipe details only for significant movements
  if (Math.abs(dy) > 50) {
    console.log(`[GESTURE] Swipe - dy: ${Math.abs(dy).toFixed(1)}px (${(percentDragged * 100).toFixed(1)}%), vel: ${Math.abs(velocity).toFixed(0)}px/s`);
  }

  // Condition 1: Large distance swipe (15%+ of screen)
  if (percentDragged > 0.15) {
    // Debug logging reduced to minimize console spam during drag interactions
    return true;
  }
  
  // Condition 2: Medium distance (8%+) with any detected movement (velocity is often broken)
  if (percentDragged > 0.08 && Math.abs(dy) > 12) {
    // Debug logging reduced to minimize console spam during drag interactions
    return true;
  }
  
  // Condition 3: Has reached reasonable movement threshold (3% of screen AND >12px)
  // BUT only dismiss if it's a perceptible swipe (not just a tap or tiny movement)
  if (percentDragged > 0.03 && Math.abs(dy) > 12) {
    if (Math.abs(velocity) > 200 || maxHistoryVelocity > 200) {
      // Debug logging reduced to minimize console spam during drag interactions
      return true;
    }
    
    // Even if velocity detection failed, if the user dragged more than 3% and 12px, it's likely intentional
    // Debug logging reduced to minimize console spam during drag interactions
    return true;
  }

  return false;
};

/**
 * Determines if a short gesture should dismiss
 * Used for quick flicks that might not register as normal swipes
 */
export const shouldDismissShortGesture = (
  dy: number,
  velocity: number,
  maxHistoryVelocity: number,
  totalTimeMs: number,
  detailSheetHeight: number
): boolean => {
  // NEVER dismiss for upward swipes  
  if (dy < 0) {
    // Debug logging reduced to minimize console spam during drag interactions
    return false;
  }

  const percentDragged = Math.abs(dy) / detailSheetHeight;
  const effectiveVelocity = Math.max(Math.abs(velocity), maxHistoryVelocity);

  // Log details only for significant movements to reduce console spam
  if (Math.abs(dy) > 30) {
    console.log(`[SHORT-GESTURE] dy: ${Math.abs(dy).toFixed(1)}px, percent: ${(percentDragged * 100).toFixed(1)}%, time: ${totalTimeMs}ms, vel: ${Math.abs(velocity).toFixed(0)}px/s, maxVel: ${maxHistoryVelocity.toFixed(0)}px/s`);
  }

  // RULE 1: Sufficient distance (>10px AND >3% of screen)
  if (Math.abs(dy) > 10 && percentDragged > 0.03) {
    // Debug logging reduced to minimize console spam during drag interactions
    return true;
  }

  // RULE 2: Quick flick (>5px within reasonable time OR with velocity)
  if (Math.abs(dy) > 5 && (totalTimeMs < 300 || effectiveVelocity > 100)) {
    // Debug logging reduced to minimize console spam during drag interactions
    return true;
  }

  return false;
};

/**
 * Calculates an effective velocity based on various inputs and the sheet height
 * This helps smooth out velocity spikes and provides a more consistent experience
 */
export const calculateEffectiveVelocity = (
  dy: number,
  vy: number,
  isFastSwipe: boolean,
  maxHistoryVelocity: number,
  alternateVelocity: number = 0,
  sheetHeight: number = 600 // Default sheet height
): number => {
  // Calculate percentage of sheet height that has been dragged
  const percentDragged = Math.abs(dy) / sheetHeight;
  
  // If this is a fast swipe, ensure smooth dismissal animation
  if (isFastSwipe) {
    // Base velocity on sheet height for natural feel
    const baseVelocity = sheetHeight / 300; // Complete in ~300ms
    
    // For small movements, use a higher velocity
    if (percentDragged < 0.1) {
      return Math.max(baseVelocity * 1.5, maxHistoryVelocity) * Math.sign(dy);
    }
    
    // For medium movements
    if (percentDragged < 0.2) {
      return Math.max(baseVelocity * 1.2, maxHistoryVelocity * 0.8) * Math.sign(dy);
    }
    
    // For large movements
    return Math.max(baseVelocity, maxHistoryVelocity * 0.6) * Math.sign(dy);
  }
  
  // For non-fast swipes that still need to be dismissed (large movements)
  if (percentDragged > 0.25) {
    const baseVelocity = sheetHeight / 400; // Complete in ~400ms
    return Math.max(baseVelocity, maxHistoryVelocity * 0.5) * Math.sign(dy);
  }
  
  // Default case - use a weighted average between current velocity and history
  const weightedVelocity = (0.4 * Math.abs(vy) + 0.6 * maxHistoryVelocity) * Math.sign(dy);
  
  // Ensure minimum velocity for smooth animation
  return Math.max(weightedVelocity, sheetHeight / 500); // At least complete in ~500ms
}; 