/**
 * Feature Flags for Roomies Migration
 * 
 * These flags control the gradual rollout of new unified stores
 * and allow for safe rollback if issues are encountered.
 */

export const FEATURE_FLAGS = {
  // Store unification flags
  UNIFIED_MATCHES: true,
  UNIFIED_MESSAGES: true, // Re-enabled after fixing infinite loop in useMemo dependency
  UNIFIED_USER_PROFILE: true,
  
  // Infrastructure flags
  STRUCTURED_LOGGING: true,
  NAVIGATION_SERVICE: true,
  
  // Development flags
  DEBUG_STORE_TRANSITIONS: __DEV__,
  VERBOSE_MIGRATION_LOGS: __DEV__,
} as const;

export type FeatureFlag = keyof typeof FEATURE_FLAGS;

/**
 * Check if a feature flag is enabled
 */
export const isFeatureEnabled = (flag: FeatureFlag): boolean => {
  return FEATURE_FLAGS[flag];
};

/**
 * Get all enabled features (useful for debugging)
 */
export const getEnabledFeatures = (): FeatureFlag[] => {
  return Object.entries(FEATURE_FLAGS)
    .filter(([_, enabled]) => enabled)
    .map(([flag, _]) => flag as FeatureFlag);
};

/**
 * Feature flag wrapper for conditional store usage
 */
export const withFeatureFlag = <T>(
  flag: FeatureFlag,
  newImplementation: () => T,
  legacyImplementation: () => T
): T => {
  return isFeatureEnabled(flag) ? newImplementation() : legacyImplementation();
};

/**
 * Development helper to log feature flag usage
 */
export const logFeatureUsage = (flag: FeatureFlag, context: string) => {
  if (__DEV__ && isFeatureEnabled('VERBOSE_MIGRATION_LOGS')) {
    console.log(`[FeatureFlag] ${flag} used in ${context}: ${isFeatureEnabled(flag) ? 'NEW' : 'LEGACY'}`);
  }
}; 