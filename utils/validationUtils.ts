/**
 * Form validation utilities for consistent validation across the app
 */

// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation (at least 8 characters, one uppercase, one lowercase, one number)
export const isValidPassword = (password: string): boolean => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

// Name validation (at least 2 characters, only letters, spaces, hyphens, and apostrophes)
export const isValidName = (name: string): boolean => {
  const nameRegex = /^[a-zA-Z\s'-]{2,}$/;
  return nameRegex.test(name);
};

// Phone number validation (simple format check)
export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^\+?[0-9]{10,15}$/;
  return phoneRegex.test(phone);
};

// URL validation
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

// Required field validation
export const isRequired = (value: any): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

// Min length validation
export const minLength = (value: string, min: number): boolean => {
  return value.length >= min;
};

// Max length validation
export const maxLength = (value: string, max: number): boolean => {
  return value.length <= max;
};

// Number range validation
export const isInRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max;
};

// Date validation (must be in the future)
export const isFutureDate = (date: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date >= today;
};

// Form validation helper
export interface ValidationRule {
  validator: (value: any) => boolean;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const validateForm = (
  values: Record<string, any>,
  rules: Record<string, ValidationRule[]>
): ValidationResult => {
  const errors: Record<string, string> = {};
  let isValid = true;

  Object.entries(rules).forEach(([field, fieldRules]) => {
    const value = values[field];

    for (const rule of fieldRules) {
      if (!rule.validator(value)) {
        errors[field] = rule.message;
        isValid = false;
        break;
      }
    }
  });

  return { isValid, errors };
};
