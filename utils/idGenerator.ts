/**
 * Utility function to generate a unique ID
 * Uses a combination of timestamp and random string to ensure uniqueness
 */
export function generateId(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${randomStr}`;
} 