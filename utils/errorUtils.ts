/**
 * Error handling utilities for consistent error management across the app
 */

// Error types
export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTH = 'AUTH',
  VALIDATION = 'VALIDATION',
  SERVER = 'SERVER',
  UNKNOWN = 'UNKNOWN',
}

// Error interface
export interface AppError {
  type: ErrorType;
  message: string;
  code?: string;
  originalError?: any;
}

// Error factory
export const createError = (
  type: ErrorType,
  message: string,
  code?: string,
  originalError?: any
): AppError => ({
  type,
  message,
  code,
  originalError,
});

// Error handlers
export const handleApiError = (error: any): AppError => {
  // Network errors
  if (!navigator.onLine || error.message === 'Network request failed') {
    return createError(
      ErrorType.NETWORK,
      'Please check your internet connection and try again.',
      'network_error',
      error
    );
  }

  // Try to parse error from API response
  try {
    if (error.response) {
      const { status, data } = error.response;

      // Authentication errors
      if (status === 401 || status === 403) {
        return createError(
          ErrorType.AUTH,
          data.message || 'You are not authorized to perform this action.',
          `auth_error_${status}`,
          error
        );
      }

      // Validation errors
      if (status === 400 || status === 422) {
        return createError(
          ErrorType.VALIDATION,
          data.message || 'Please check your input and try again.',
          'validation_error',
          error
        );
      }

      // Server errors
      if (status >= 500) {
        return createError(
          ErrorType.SERVER,
          'Something went wrong on our end. Please try again later.',
          `server_error_${status}`,
          error
        );
      }

      // Other HTTP errors
      return createError(
        ErrorType.UNKNOWN,
        data.message || 'An unexpected error occurred.',
        `http_error_${status}`,
        error
      );
    }
  } catch (e) {
    // Error parsing failed, fallback to generic error
  }

  // Default unknown error
  return createError(
    ErrorType.UNKNOWN,
    'An unexpected error occurred. Please try again.',
    'unknown_error',
    error
  );
};

// User-friendly error messages
export const getErrorMessage = (error: AppError): string => {
  switch (error.type) {
    case ErrorType.NETWORK:
      return 'Network error. Please check your connection and try again.';
    case ErrorType.AUTH:
      return 'Authentication error. Please log in again.';
    case ErrorType.VALIDATION:
      return error.message || 'Please check your input and try again.';
    case ErrorType.SERVER:
      return 'Server error. Our team has been notified.';
    case ErrorType.UNKNOWN:
    default:
      return 'Something went wrong. Please try again later.';
  }
};

// Error logging
export const logError = (error: AppError): void => {
  // In a real app, this would send the error to a logging service
  console.error('[ERROR]', {
    type: error.type,
    message: error.message,
    code: error.code,
    originalError: error.originalError,
    timestamp: new Date().toISOString(),
  });
};
