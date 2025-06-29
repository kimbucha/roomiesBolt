import { LogLevel } from './logUtils';

/**
 * Simplified debug configuration for the app.
 * All debugging features are disabled.
 */

// Minimal type definition for API compatibility
export type DebugConfig = {
  logging: {
    level: LogLevel;
    [key: string]: any;
  };
  [key: string]: any;
};

// Default debug configuration with everything disabled
const defaultDebugConfig: DebugConfig = {
  logging: {
    level: LogLevel.NONE,
  }
};

// No-op functions for API compatibility
export function getDebugConfig(): DebugConfig {
  return defaultDebugConfig;
}

export function updateDebugConfig(): void {
  // No-op
}

export function resetDebugConfig(): void {
  // No-op
}

export function initializeDebugConfig(): void {
  // No-op
} 