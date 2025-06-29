/**
 * Profile Strength Calculator
 * 
 * This utility calculates the profile strength/completeness percentage
 * based on the user's profile data.
 */

import { User } from '../store/userStore';

// Define the profile fields and their weights
const PROFILE_FIELDS = {
  // Basic info (30%)
  BASIC_INFO: {
    name: 5,
    email: 5,
    dateOfBirth: 5,
    gender: 5,
    bio: 10
  },
  
  // Photos (20%)
  PHOTOS: {
    hasProfilePhoto: 10,
    hasMultiplePhotos: 10
  },
  
  // Education & Career (15%)
  EDUCATION: {
    university: 5,
    major: 5,
    year: 5
  },
  
  // Lifestyle preferences (20%)
  LIFESTYLE: {
    cleanliness: 4,
    noise: 4,
    guestFrequency: 4,
    smoking: 4,
    pets: 4
  },
  
  // Housing preferences (15%)
  HOUSING: {
    budget: 5,
    location: 5,
    roomType: 5
  }
};

/**
 * Calculate the profile strength percentage based on completed fields
 * @param user The user object
 * @returns A number between 0-100 representing profile completeness
 */
export function calculateProfileStrength(user: User): number {
  if (!user) return 0;
  
  let totalScore = 0;
  let totalPossibleScore = 0;
  
  // Basic Info (30%)
  totalPossibleScore += Object.values(PROFILE_FIELDS.BASIC_INFO).reduce((sum, weight) => sum + weight, 0);
  if (user.name) totalScore += PROFILE_FIELDS.BASIC_INFO.name;
  if (user.email) totalScore += PROFILE_FIELDS.BASIC_INFO.email;
  if (user.dateOfBirth) totalScore += PROFILE_FIELDS.BASIC_INFO.dateOfBirth;
  if (user.gender) totalScore += PROFILE_FIELDS.BASIC_INFO.gender;
  if (user.bio) totalScore += PROFILE_FIELDS.BASIC_INFO.bio;
  
  // Photos (20%)
  totalPossibleScore += Object.values(PROFILE_FIELDS.PHOTOS).reduce((sum, weight) => sum + weight, 0);
  // Check if user has a profile photo set
  if (user.profilePicture || (user.photos && user.photos.length > 0 && user.profilePhotoIndex !== undefined)) {
    totalScore += PROFILE_FIELDS.PHOTOS.hasProfilePhoto;
  }
  // Check if user has multiple photos
  if (user.photos && user.photos.length > 1) {
    totalScore += PROFILE_FIELDS.PHOTOS.hasMultiplePhotos;
  }
  
  // Education & Career (15%)
  totalPossibleScore += Object.values(PROFILE_FIELDS.EDUCATION).reduce((sum, weight) => sum + weight, 0);
  if (user.university) totalScore += PROFILE_FIELDS.EDUCATION.university;
  if (user.major) totalScore += PROFILE_FIELDS.EDUCATION.major;
  if (user.year) totalScore += PROFILE_FIELDS.EDUCATION.year;
  
  // Lifestyle preferences (20%)
  totalPossibleScore += Object.values(PROFILE_FIELDS.LIFESTYLE).reduce((sum, weight) => sum + weight, 0);
  if (user.lifestylePreferences) {
    if (user.lifestylePreferences.cleanliness !== undefined) totalScore += PROFILE_FIELDS.LIFESTYLE.cleanliness;
    if (user.lifestylePreferences.noise !== undefined) totalScore += PROFILE_FIELDS.LIFESTYLE.noise;
    if (user.lifestylePreferences.guestFrequency !== undefined) totalScore += PROFILE_FIELDS.LIFESTYLE.guestFrequency;
    if (user.lifestylePreferences.smoking !== undefined) totalScore += PROFILE_FIELDS.LIFESTYLE.smoking;
    if (user.lifestylePreferences.pets !== undefined) totalScore += PROFILE_FIELDS.LIFESTYLE.pets;
  }
  
  // Housing preferences (15%)
  totalPossibleScore += Object.values(PROFILE_FIELDS.HOUSING).reduce((sum, weight) => sum + weight, 0);
  // Check if budget is set (either directly or in preferences)
  if ((user.budget && (user.budget.min !== undefined || user.budget.max !== undefined)) || 
      (user.preferences?.budget && (user.preferences.budget.min !== undefined || user.preferences.budget.max !== undefined))) {
    totalScore += PROFILE_FIELDS.HOUSING.budget;
  }
  // Check if location is set
  if (user.location && (user.location.city || user.location.state)) {
    totalScore += PROFILE_FIELDS.HOUSING.location;
  }
  // Check if room type is set
  if (user.preferences?.roomType) {
    totalScore += PROFILE_FIELDS.HOUSING.roomType;
  }
  
  // Calculate percentage
  const percentage = Math.round((totalScore / totalPossibleScore) * 100);
  
  return percentage;
}

/**
 * Get profile completion suggestions based on missing fields
 * @param user The user object
 * @returns Array of suggestions for completing the profile
 */
export function getProfileCompletionSuggestions(user: User): string[] {
  if (!user) return ['Complete your profile to get started'];
  
  const suggestions: string[] = [];
  
  // Basic Info
  if (!user.bio) suggestions.push('Add a bio to tell potential roommates about yourself');
  if (!user.dateOfBirth) suggestions.push('Add your date of birth');
  if (!user.gender) suggestions.push('Add your gender');
  
  // Photos
  if (!user.photos || user.photos.length === 0) {
    suggestions.push('Add photos to your profile');
  } else if (user.photos.length < 2) {
    suggestions.push('Add more photos to showcase your personality');
  }
  
  // Education
  if (!user.university) suggestions.push('Add your university');
  if (!user.major) suggestions.push('Add your field of study');
  
  // Lifestyle
  if (!user.lifestylePreferences) {
    suggestions.push('Complete your lifestyle preferences');
  }
  
  // Housing
  if (!user.budget && !user.preferences?.budget) {
    suggestions.push('Set your budget preferences');
  }
  if (!user.location) {
    suggestions.push('Add your preferred location');
  }
  if (!user.preferences?.roomType) {
    suggestions.push('Select your preferred room type');
  }
  
  return suggestions;
}
