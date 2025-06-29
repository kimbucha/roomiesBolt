import { User } from '../store/userStore';

/**
 * Validation result interface
 */
interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validates user data before saving
 * @param userData Partial user data to validate
 * @returns Validation result with status and any error messages
 */
export function validateUserData(userData: Partial<User>): ValidationResult {
  const errors: string[] = [];
  
  // Validate basic user information
  if (userData.email !== undefined) {
    if (!isValidEmail(userData.email)) {
      errors.push('Please enter a valid email address');
    }
  }
  
  if (userData.name !== undefined) {
    if (!userData.name || userData.name.trim().length < 2) {
      errors.push('Name must be at least 2 characters');
    }
  }
  
  if (userData.dateOfBirth !== undefined) {
    if (!isValidDate(userData.dateOfBirth)) {
      errors.push('Please enter a valid date of birth');
    }
  }
  
  // Validate gender
  if (userData.gender !== undefined) {
    const validGenders = ['male', 'female', 'other', 'prefer_not_to_say'];
    if (!validGenders.includes(userData.gender)) {
      errors.push('Please select a valid gender option');
    }
  }
  
  // Validate budget
  if (userData.preferences?.budget !== undefined) {
    const { min, max } = userData.preferences.budget;
    if (min < 0 || max < min) {
      errors.push('Please enter a valid budget range');
    }
  }
  
  // Validate lifestyle preferences
  if (userData.lifestylePreferences !== undefined) {
    const { cleanliness, noise, guestFrequency } = userData.lifestylePreferences;
    
    if (cleanliness !== undefined && (cleanliness < 0 || cleanliness > 3)) {
      errors.push('Please select a valid cleanliness preference');
    }
    
    if (noise !== undefined && (noise < 0 || noise > 3)) {
      errors.push('Please select a valid noise level preference');
    }
    
    if (guestFrequency !== undefined && (guestFrequency < 0 || guestFrequency > 3)) {
      errors.push('Please select a valid guest frequency preference');
    }
  }
  
  // Validate personality traits
  if (userData.personalityTraits !== undefined) {
    if (userData.personalityTraits.length > 10) {
      errors.push('Please select no more than 10 personality traits');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates an email address format
 * @param email Email to validate
 * @returns True if email is valid
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates a date string
 * @param dateString Date string to validate
 * @returns True if date is valid
 */
function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

/**
 * Validates onboarding data for a specific step
 * @param step Onboarding step name
 * @param data Data for the step
 * @returns Validation result
 */
export function validateOnboardingStep(step: string, data: any): ValidationResult {
  switch (step) {
    case 'account':
      return validateAccountStep(data);
    case 'about-you':
      return validateAboutYouStep(data);
    case 'budget':
      return validateBudgetStep(data);
    case 'lifestyle':
      return validateLifestyleStep(data);
    case 'personality':
      return validatePersonalityStep(data);
    case 'photos':
      return validatePhotosStep(data);
    case 'place-details':
      return validatePlaceDetailsStep(data);
    default:
      return { isValid: true, errors: [] };
  }
}

/**
 * Validates account step data
 */
function validateAccountStep(data: any): ValidationResult {
  const errors: string[] = [];
  
  if (!data.email || !isValidEmail(data.email)) {
    errors.push('Please enter a valid email address');
  }
  
  if (!data.name || data.name.trim().length < 2) {
    errors.push('Please enter your name');
  }
  
  return { isValid: errors.length === 0, errors };
}

/**
 * Validates about-you step data
 */
function validateAboutYouStep(data: any): ValidationResult {
  const errors: string[] = [];
  
  if (!data.gender) {
    errors.push('Please select your gender');
  }
  
  if (data.personalityTraits && data.personalityTraits.length === 0) {
    errors.push('Please select at least one personality trait');
  }
  
  return { isValid: errors.length === 0, errors };
}

/**
 * Validates budget step data
 */
function validateBudgetStep(data: any): ValidationResult {
  const errors: string[] = [];
  
  if (!data.budget || !data.budget.min || !data.budget.max) {
    errors.push('Please set your budget range');
  } else if (data.budget.min > data.budget.max) {
    errors.push('Minimum budget cannot be greater than maximum budget');
  }
  
  if (!data.location) {
    errors.push('Please select a location');
  }
  
  return { isValid: errors.length === 0, errors };
}

/**
 * Validates lifestyle step data
 */
function validateLifestyleStep(data: any): ValidationResult {
  const errors: string[] = [];
  
  if (data.lifestylePreferences === undefined) {
    errors.push('Please complete all lifestyle questions');
    return { isValid: false, errors };
  }
  
  const { cleanliness, noise, guestFrequency, schedule } = data.lifestylePreferences;
  
  if (cleanliness === undefined) {
    errors.push('Please select your cleanliness preference');
  }
  
  if (noise === undefined) {
    errors.push('Please select your noise level preference');
  }
  
  if (guestFrequency === undefined) {
    errors.push('Please select your guest frequency preference');
  }
  
  if (!schedule) {
    errors.push('Please select your schedule preference');
  }
  
  return { isValid: errors.length === 0, errors };
}

/**
 * Validates personality step data
 */
function validatePersonalityStep(data: any): ValidationResult {
  const errors: string[] = [];
  
  if (!data.personalityType) {
    errors.push('Please complete the personality assessment');
  }
  
  if (!data.personalityDimensions) {
    errors.push('Personality dimensions are missing');
  }
  
  return { isValid: errors.length === 0, errors };
}

/**
 * Validates photos step data
 */
function validatePhotosStep(data: any): ValidationResult {
  const errors: string[] = [];
  
  if (!data.profilePicture) {
    errors.push('Please upload a profile picture');
  }
  
  return { isValid: errors.length === 0, errors };
}

/**
 * Validates place-details step data
 */
function validatePlaceDetailsStep(data: any): ValidationResult {
  const errors: string[] = [];
  
  if (data.hasPlace && !data.roomType) {
    errors.push('Please select a room type');
  }
  
  if (data.hasPlace && !data.amenities) {
    errors.push('Please select available amenities');
  }
  
  return { isValid: errors.length === 0, errors };
}
