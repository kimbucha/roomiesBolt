/**
 * Utility to disable all logging throughout the app
 */

// Debug levels (kept for API compatibility)
export enum LogLevel {
  NONE = 0,
  ERROR = 1,
  WARN = 2,
  INFO = 3,
  DEBUG = 4,
  VERBOSE = 5
}

// Current log level - set to NONE to disable all logs
let currentLogLevel = LogLevel.NONE;

/**
 * Set the current logging level (no-op, all logs are disabled)
 */
export function setLogLevel(level: LogLevel): void {
  // No-op - logging is disabled
}

/**
 * Get the current logging level
 */
export function getLogLevel(): LogLevel {
  return LogLevel.NONE;
}

/**
 * Disables all console logs
 */
export function silenceConsoleLogs(): void {
  // Store original console methods
  const originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error,
    info: console.info,
    debug: console.debug,
  };

  // Disable all logs
  console.log = () => {};
  console.info = () => {};
  console.debug = () => {};
  console.warn = () => {};
}

/**
 * No-op logging function
 */
export function devLog(message: string, ...args: any[]): void {
  // No-op
}

/**
 * No-op debug logging
 */
export function debugLog(message: string, ...args: any[]): void {
  // No-op
}

/**
 * No-op verbose logging
 */
export function verboseLog(message: string, ...args: any[]): void {
  // No-op
}

/**
 * No-op warning logging
 */
export function warnLog(message: string, ...args: any[]): void {
  // No-op
}

/**
 * No-op error logging
 */
export function errorLog(message: string, ...args: any[]): void {
  // No-op
} 