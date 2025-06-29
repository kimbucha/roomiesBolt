/**
 * Structured Logging Service for Roomies
 * 
 * Replaces console.log noise with organized, filterable logging.
 * Supports different log levels and throttling for noisy operations.
 */

export enum LogLevel {
  TRACE = 0,
  DEBUG = 1,
  INFO = 2,
  WARN = 3,
  ERROR = 4,
}

interface LogEntry {
  level: LogLevel;
  tag: string;
  message: string;
  data?: any;
  timestamp: string;
}

interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
  throttleInterval: number;
}

class Logger {
  private config: LoggerConfig;
  private throttleMap = new Map<string, number>();
  private logBuffer: LogEntry[] = [];

  constructor() {
    this.config = {
      level: this.getDefaultLogLevel(),
      enableConsole: true,
      enableRemote: false, // TODO: Enable for production
      throttleInterval: 1000, // 1 second default throttle
    };
  }

  private getDefaultLogLevel(): LogLevel {
    if (__DEV__) {
      // Check for debug flag in development
      const debugFlag = process.env.EXPO_PUBLIC_LOG_LEVEL;
      if (debugFlag === 'debug') return LogLevel.DEBUG;
      if (debugFlag === 'trace') return LogLevel.TRACE;
      return LogLevel.INFO;
    }
    
    // Production: only warnings and errors
    return LogLevel.WARN;
  }

  /**
   * Check if a log level should be output
   */
  private shouldLog(level: LogLevel): boolean {
    return level >= this.config.level;
  }

  /**
   * Throttle logging for noisy operations
   */
  private shouldThrottle(key: string, intervalMs?: number): boolean {
    const now = Date.now();
    const interval = intervalMs || this.config.throttleInterval;
    const lastLog = this.throttleMap.get(key) || 0;
    
    if (now - lastLog < interval) {
      return true; // Should throttle
    }
    
    this.throttleMap.set(key, now);
    return false; // Don't throttle
  }

  /**
   * Core logging method
   */
  private log(level: LogLevel, tag: string, message: string, data?: any) {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      tag,
      message,
      data,
      timestamp: new Date().toISOString(),
    };

    // Add to buffer for potential remote logging
    this.logBuffer.push(entry);
    
    // Keep buffer size manageable
    if (this.logBuffer.length > 1000) {
      this.logBuffer = this.logBuffer.slice(-500);
    }

    // Console output
    if (this.config.enableConsole) {
      this.outputToConsole(entry);
    }

    // Remote logging (future enhancement)
    if (this.config.enableRemote) {
      this.sendToRemote(entry);
    }
  }

  /**
   * Output log entry to console with appropriate styling
   */
  private outputToConsole(entry: LogEntry) {
    const prefix = `[${LogLevel[entry.level]}][${entry.tag}]`;
    const timestamp = new Date(entry.timestamp).toLocaleTimeString();
    
    switch (entry.level) {
      case LogLevel.ERROR:
        console.error(`${timestamp} ${prefix}`, entry.message, entry.data || '');
        break;
      case LogLevel.WARN:
        console.warn(`${timestamp} ${prefix}`, entry.message, entry.data || '');
        break;
      case LogLevel.INFO:
        console.info(`${timestamp} ${prefix}`, entry.message, entry.data || '');
        break;
      case LogLevel.DEBUG:
      case LogLevel.TRACE:
      default:
        console.log(`${timestamp} ${prefix}`, entry.message, entry.data || '');
    }
  }

  /**
   * Send log to remote service (placeholder for future implementation)
   */
  private sendToRemote(entry: LogEntry) {
    // TODO: Implement remote logging (Sentry, LogRocket, etc.)
    // For now, just store in buffer
  }

  // =================================================================
  // PUBLIC LOGGING METHODS
  // =================================================================

  /**
   * Trace level logging (most verbose)
   */
  trace(tag: string, message: string, data?: any) {
    this.log(LogLevel.TRACE, tag, message, data);
  }

  /**
   * Debug level logging
   */
  debug(tag: string, message: string, data?: any) {
    this.log(LogLevel.DEBUG, tag, message, data);
  }

  /**
   * Info level logging
   */
  info(tag: string, message: string, data?: any) {
    this.log(LogLevel.INFO, tag, message, data);
  }

  /**
   * Warning level logging
   */
  warn(tag: string, message: string, data?: any) {
    this.log(LogLevel.WARN, tag, message, data);
  }

  /**
   * Error level logging
   */
  error(tag: string, message: string, data?: any) {
    this.log(LogLevel.ERROR, tag, message, data);
  }

  // =================================================================
  // THROTTLED LOGGING METHODS
  // =================================================================

  /**
   * Throttled debug logging for noisy operations
   */
  debugThrottled(tag: string, message: string, data?: any, intervalMs?: number) {
    const key = `${tag}:${message}`;
    if (!this.shouldThrottle(key, intervalMs)) {
      this.debug(tag, message, data);
    }
  }

  /**
   * Throttled info logging
   */
  infoThrottled(tag: string, message: string, data?: any, intervalMs?: number) {
    const key = `${tag}:${message}`;
    if (!this.shouldThrottle(key, intervalMs)) {
      this.info(tag, message, data);
    }
  }

  /**
   * Throttled warning logging
   */
  warnThrottled(tag: string, message: string, data?: any, intervalMs?: number) {
    const key = `${tag}:${message}`;
    if (!this.shouldThrottle(key, intervalMs)) {
      this.warn(tag, message, data);
    }
  }

  // =================================================================
  // SPECIALIZED LOGGING METHODS
  // =================================================================

  /**
   * Log navigation events
   */
  navigation(from: string, to: string, params?: any) {
    this.debug('NAVIGATION', `${from} → ${to}`, params);
  }

  /**
   * Log API calls
   */
  api(method: string, endpoint: string, status?: number, duration?: number) {
    const message = `${method} ${endpoint}`;
    const data = { status, duration };
    
    if (status && status >= 400) {
      this.error('API', message, data);
    } else {
      this.debug('API', message, data);
    }
  }

  /**
   * Log store actions
   */
  store(storeName: string, action: string, data?: any) {
    this.debugThrottled('STORE', `${storeName}.${action}`, data, 500);
  }

  /**
   * Log user interactions
   */
  interaction(component: string, action: string, data?: any) {
    this.debug('INTERACTION', `${component}.${action}`, data);
  }

  /**
   * Log performance metrics
   */
  performance(operation: string, duration: number, data?: any) {
    const message = `${operation} took ${duration}ms`;
    
    if (duration > 1000) {
      this.warn('PERFORMANCE', message, data);
    } else {
      this.debug('PERFORMANCE', message, data);
    }
  }

  // =================================================================
  // CONFIGURATION METHODS
  // =================================================================

  /**
   * Set log level
   */
  setLevel(level: LogLevel) {
    this.config.level = level;
    this.info('LOGGER', `Log level set to ${LogLevel[level]}`);
  }

  /**
   * Enable/disable console output
   */
  setConsoleEnabled(enabled: boolean) {
    this.config.enableConsole = enabled;
  }

  /**
   * Get current configuration
   */
  getConfig(): LoggerConfig {
    return { ...this.config };
  }

  /**
   * Get recent log entries
   */
  getRecentLogs(count: number = 100): LogEntry[] {
    return this.logBuffer.slice(-count);
  }

  /**
   * Clear log buffer
   */
  clearBuffer() {
    this.logBuffer = [];
    this.throttleMap.clear();
  }

  /**
   * Export logs for debugging
   */
  exportLogs(): string {
    return JSON.stringify(this.logBuffer, null, 2);
  }
}

// Create singleton instance
export const logger = new Logger();

// Convenience exports for common operations
export const {
  trace,
  debug,
  info,
  warn,
  error,
  debugThrottled,
  infoThrottled,
  warnThrottled,
  navigation,
  api,
  store,
  interaction,
  performance,
  setLevel,
  setConsoleEnabled,
  getConfig,
  getRecentLogs,
  clearBuffer,
  exportLogs
} = logger;

// Export types
export type { LogEntry, LoggerConfig }; 