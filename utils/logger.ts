export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerOptions {
  enabled?: boolean;
  tag?: string;
  level?: LogLevel;
}

const DEFAULT_LEVEL: LogLevel = 'debug';

let enabledTags: Set<string> = new Set();
let globalEnabled = true;

export const Logger = {
  /**
   * Enable logging globally or selectively by tag.
   * If no tag provided, toggles global enable.
   */
  enable(tag?: string) {
    if (tag) {
      enabledTags.add(tag);
    } else {
      globalEnabled = true;
    }
  },
  /**
   * Disable logging globally or by tag.
   */
  disable(tag?: string) {
    if (tag) {
      enabledTags.delete(tag);
    } else {
      globalEnabled = false;
    }
  },
  /**
   * Log with optional tag & level. Defaults to debug.
   */
  log({ tag = 'GENERAL', level = DEFAULT_LEVEL, enabled = true }: LoggerOptions, ...args: any[]) {
    if (!__DEV__) return; // Strip logs in production
    if (!globalEnabled) return;
    if (enabledTags.size > 0 && !enabledTags.has(tag)) return;
    if (!enabled) return;

    const prefix = `[${tag}]`;
    switch (level) {
      case 'debug':
      default:
        console.log(prefix, ...args);
        break;
      case 'info':
        console.info(prefix, ...args);
        break;
      case 'warn':
        console.warn(prefix, ...args);
        break;
      case 'error':
        console.error(prefix, ...args);
        break;
    }
  },
};

// Convenience wrappers
export const debug = (tag: string, ...args: any[]) => Logger.log({ tag, level: 'debug' }, ...args);
export const info = (tag: string, ...args: any[]) => Logger.log({ tag, level: 'info' }, ...args);
export const warn = (tag: string, ...args: any[]) => Logger.log({ tag, level: 'warn' }, ...args);
export const error = (tag: string, ...args: any[]) => Logger.log({ tag, level: 'error' }, ...args); 