/**
 * Utility functions for working with JSONB data in Supabase
 */

/**
 * Safely converts a value to a JSONB-compatible format
 * @param value Any value to convert to JSONB
 * @returns A JSONB-safe object
 */
export const toJsonb = (value: any): object => {
  if (value === null || value === undefined) {
    return {};
  }
  
  if (typeof value === 'object') {
    // Filter out undefined values which can cause issues with PostgreSQL
    return Object.fromEntries(
      Object.entries(value).filter(([_, v]) => v !== undefined)
    );
  }
  
  // If it's a primitive value, wrap it in an object
  return { value };
};

/**
 * Safely extracts a property from a JSONB column
 * @param jsonb The JSONB object from Supabase
 * @param path The path to the property (e.g., 'user.preferences.theme')
 * @param defaultValue Default value if the property doesn't exist
 * @returns The property value or the default value
 */
export const getJsonbProperty = <T>(
  jsonb: any, 
  path: string, 
  defaultValue: T
): T => {
  if (!jsonb) return defaultValue;
  
  const parts = path.split('.');
  let current = jsonb;
  
  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return defaultValue;
    }
    current = current[part];
  }
  
  return (current === undefined || current === null) ? defaultValue : current as T;
};

/**
 * Converts a flat object structure to a nested JSONB structure
 * For example: { 'lifestyle_preferences.cleanliness': 5 } becomes { lifestyle_preferences: { cleanliness: 5 } }
 * @param flatObject The flat object with dot notation keys
 * @returns A nested object suitable for JSONB storage
 */
export const flatToNested = (flatObject: Record<string, any>): Record<string, any> => {
  const result: Record<string, any> = {};
  
  Object.entries(flatObject).forEach(([key, value]) => {
    if (key.includes('.')) {
      const parts = key.split('.');
      let current = result;
      
      // Navigate to the deepest level, creating objects as needed
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (!current[part]) {
          current[part] = {};
        }
        current = current[part];
      }
      
      // Set the value at the deepest level
      current[parts[parts.length - 1]] = value;
    } else {
      // No nesting needed
      result[key] = value;
    }
  });
  
  return result;
};

/**
 * Converts a nested JSONB structure to a flat object with dot notation
 * For example: { lifestyle_preferences: { cleanliness: 5 } } becomes { 'lifestyle_preferences.cleanliness': 5 }
 * @param nestedObject The nested object from JSONB
 * @param prefix Current path prefix for recursion (leave empty when calling)
 * @returns A flat object with dot notation keys
 */
export const nestedToFlat = (
  nestedObject: Record<string, any>, 
  prefix = ''
): Record<string, any> => {
  const result: Record<string, any> = {};
  
  Object.entries(nestedObject).forEach(([key, value]) => {
    const newKey = prefix ? `${prefix}.${key}` : key;
    
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      // Recursively flatten nested objects
      Object.assign(result, nestedToFlat(value, newKey));
    } else {
      // Add leaf values directly
      result[newKey] = value;
    }
  });
  
  return result;
};
