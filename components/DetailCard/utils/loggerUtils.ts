import { useRef } from 'react';

interface LogEntry {
  message: string;
  data?: any;
  timestamp: number;
}

/**
 * Utility functions and hooks for logging
 */

/**
 * Hook for logging debug information
 */
export const useDebugLogger = () => {
  const logsRef = useRef<LogEntry[]>([]);
  
  /**
   * Add a log entry
   */
  const addLog = (message: string, data?: any) => {
    logsRef.current.push({
      message,
      data,
      timestamp: Date.now()
    });
    
    // Keep only the last 100 logs
    if (logsRef.current.length > 100) {
      logsRef.current.shift();
    }
  };
  
  /**
   * Get all logs as a formatted string
   */
  const getAllLogs = () => {
    return logsRef.current.map(log => {
      const time = new Date(log.timestamp).toLocaleTimeString();
      const dataStr = log.data ? `\n${JSON.stringify(log.data, null, 2)}` : '';
      return `[${time}] ${log.message}${dataStr}`;
    }).join('\n\n');
  };
  
  /**
   * Get recent logs as an array
   */
  const getLogs = () => {
    return logsRef.current;
  };
  
  /**
   * Clear all logs
   */
  const clearLogs = () => {
    logsRef.current = [];
  };
  
  return {
    addLog,
    getAllLogs,
    getLogs,
    clearLogs,
    logsRef
  };
}; 