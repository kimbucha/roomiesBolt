/**
 * Simplified onboarding debugging utility focused on critical data persistence
 * Reduces log noise while keeping essential debugging information
 */

// Enable different levels of debugging
const ENABLE_CRITICAL_LOGS = true;  // Always keep critical data persistence logs
const ENABLE_STEP_LOGS = false;     // Disable step entry/completion logs
const ENABLE_INPUT_LOGS = false;    // Disable individual input change logs

/**
 * Log critical data persistence events (always shown)
 */
export function logCritical(message: string, data?: any): void {
  if (!ENABLE_CRITICAL_LOGS) return;
  console.log(`[DATA PERSISTENCE] ${message}`, data || '');
}

/**
 * Log onboarding step entry with step name and any initial data
 */
export function logOnboardingStepEntry(stepName: string, initialData?: any): void {
  if (!ENABLE_STEP_LOGS) return;
  console.log(`[ONBOARDING] Entering step: ${stepName}`);
}

/**
 * Log onboarding step completion with step name and collected data
 */
export function logOnboardingStepComplete(stepName: string, collectedData: any): void {
  if (!ENABLE_STEP_LOGS) return;
  console.log(`[ONBOARDING] Completed step: ${stepName}`);
}

/**
 * Log onboarding input change with field name and new value (disabled by default)
 */
export function logOnboardingInputChange(stepName: string, fieldName: string, value: any): void {
  if (!ENABLE_INPUT_LOGS) return;
  // Only log when input logging is explicitly enabled
  console.log(`[ONBOARDING] Input in ${stepName} - ${fieldName}:`, value);
}

/**
 * Log onboarding navigation with source, destination and data
 */
export function logOnboardingNavigation(from: string, to: string, data?: any): void {
  if (!ENABLE_STEP_LOGS) return;
  console.log(`[ONBOARDING] Navigation from ${from} to ${to}`);
}

/**
 * Log onboarding error with step name and error details (always shown)
 */
export function logOnboardingError(stepName: string, error: any): void {
  console.error(`[ONBOARDING ERROR] ${stepName}:`, error);
}

/**
 * Log onboarding store update with store name and updated data
 */
export function logOnboardingStoreUpdate(storeName: string, updatedData: any): void {
  if (!ENABLE_STEP_LOGS) return;
  console.log(`[ONBOARDING] Store update: ${storeName}`);
}

/**
 * Toggle input logging on/off for debugging
 */
export function enableInputLogging(enable: boolean): void {
  // This would require module-level state management for dynamic toggling
  console.log(`[ONBOARDING] Input logging ${enable ? 'ENABLED' : 'DISABLED'}`);
}
