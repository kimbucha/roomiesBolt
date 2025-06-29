/**
 * UPDATED: Now uses the centralized ProfileImageService
 * This file maintains backward compatibility while delegating to the new service
 */

import { User } from '../store/userStore';
import { RoommateProfile } from '../store/roommateStore';
import { ProfileImageService } from './profileImageService';

// Re-export the PersonalityType for backward compatibility
export type PersonalityType = 
  | 'ISTJ' | 'ISFJ' | 'INFJ' | 'INTJ' 
  | 'ISTP' | 'ISFP' | 'INFP' | 'INTP' 
  | 'ESTP' | 'ESFP' | 'ENFP' | 'ENTP' 
  | 'ESTJ' | 'ESFJ' | 'ENFJ' | 'ENTJ';

/**
 * UPDATED: Now delegates to ProfileImageService for consistency
 * @deprecated Use ProfileImageService.getProfileImage() directly for new code
 */
export function determineProfilePicture(user: User): string {
  // Note: This function is deprecated. Use ProfileImageService.getProfileImage() instead
  
  // Delegate to the new centralized service
  const result = ProfileImageService.getProfileImage(user);
  
  // Convert the new service result back to a string for backward compatibility
  const identifier = ProfileImageService.getDatabaseIdentifier(result);
  
  if (identifier) {
    return identifier;
  }
  
  // Fallback to default lego image for backward compatibility
  return 'https://randomuser.me/api/portraits/lego/1.jpg';
}

/**
 * Creates a roommate profile from user data
 * This is a pure function that doesn't depend on any store
 */
export function createRoommateProfileFromUser(user: User): RoommateProfile {
  if (!user) {
    throw new Error('Cannot create profile: No user data provided');
  }

  // Map lifestyle preferences from user to roommate format
  const lifestylePreferences = user.lifestylePreferences ? {
    cleanliness: user.lifestylePreferences.cleanliness,
    noiseLevel: user.lifestylePreferences.noise,
    guestFrequency: user.lifestylePreferences.guestFrequency,
    smoking: user.lifestylePreferences.smoking,
    pets: user.lifestylePreferences.pets
  } : undefined;

  // Format budget range as string (e.g., "$500-1500")
  let formattedBudget = '$1000-2000'; // Default budget range
  
  // First check user.budget directly
  if (user.budget && user.budget.min !== undefined && user.budget.max !== undefined) {
    // If max is provided, use min-max format
    if (user.budget.max > 0) {
      formattedBudget = `$${user.budget.min}-${user.budget.max}`;
    } 
    // If only max is 0 or not provided (up to X budget), just show the max
    else {
      formattedBudget = `Up to $${user.budget.min}`;
    }
  } 
  // Then check user.preferences.budget as a fallback
  else if (user.preferences?.budget?.min !== undefined && user.preferences?.budget?.max !== undefined) {
    // If max is provided, use min-max format
    if (user.preferences.budget.max > 0) {
      formattedBudget = `$${user.preferences.budget.min}-${user.preferences.budget.max}`;
    }
    // If only max is 0 or not provided (up to X budget), just show the max
    else {
      formattedBudget = `Up to $${user.preferences.budget.min}`;
    }
  }
  
  console.log('[ProfileSynchronizer] Formatted budget:', formattedBudget);
  
  // Determine room type based on user preferences
  let roomTypeValue = 'private';
  
  // Only set the room type if explicitly specified in preferences
  if (user.preferences && user.preferences.roomType) {
    roomTypeValue = user.preferences.roomType;
    console.log('[ProfileSynchronizer] Setting room type from preferences:', roomTypeValue);
  }
  
  // Format move-in date if available
  let moveInDate = undefined;
  if (user.preferences && user.preferences.moveInDate) {
    moveInDate = user.preferences.moveInDate;
  }

  // Create the roommate profile with required fields to satisfy the RoommateProfile type
  const profile: RoommateProfile = {
    id: user.id || `temp-${Date.now()}`,
    name: user.name || 'Anonymous User',
    // Use new ProfileImageService for consistent profile picture resolution
    image: (() => {
      const result = ProfileImageService.getProfileImage(user);
      return ProfileImageService.getDatabaseIdentifier(result) || 'https://randomuser.me/api/portraits/lego/1.jpg';
    })(),
    bio: user.bio || '',
    gender: user.gender as any || 'prefer_not_to_say',
    age: user.dateOfBirth ? calculateAge(user.dateOfBirth) : 25, // Default age
    university: user.university || '',
    major: user.major || '',
    year: user.year || '',
    personalityType: user.personalityType || '',
    personalityTraits: user.personalityTraits || [],
    // Use formatted budget string
    budget: formattedBudget,
    // Convert location to string format for roommate profile
    location: user.location ? `${user.location.city || ''}, ${user.location.state || ''}` : 'San Francisco, CA',
    lifestylePreferences: user.lifestylePreferences ? {
      // Convert numeric values to string enum values
      sleepSchedule: user.lifestylePreferences.earlyRiser ? 'early_bird' : 
                     user.lifestylePreferences.nightOwl ? 'night_owl' : 'flexible',
      cleanliness: mapCleanlinessToEnum(user.lifestylePreferences.cleanliness),
      noiseLevel: mapNoiseLevelToEnum(user.lifestylePreferences.noise),
      guestPolicy: mapGuestFrequencyToEnum(user.lifestylePreferences.guestFrequency),
      smoking: user.lifestylePreferences.smoking,
      // Map pet preference to boolean for the roommate profile
      pets: user.lifestylePreferences.pets === true,
      drinking: user.lifestylePreferences.drinking || false
    } : {
      // Default lifestyle preferences if none provided
      sleepSchedule: 'flexible',
      cleanliness: 'moderate',
      noiseLevel: 'moderate',
      guestPolicy: 'occasionally',
      smoking: false,
      pets: false,
      drinking: false
    },
    // Add personal preferences based on available data
    personalPreferences: {
      petPreference: user.lifestylePreferences?.pets ? 'all_pets_ok' : 'no_pets',
      temperature: 'moderate',
      schedule: {
        earlyRiser: user.lifestylePreferences?.earlyRiser || false,
        nightOwl: user.lifestylePreferences?.nightOwl || false
      }
    },
    hasPlace: user.hasPlace || false,
    roomType: roomTypeValue as any,
    moveInDate: moveInDate || 'Flexible',
    // Use roomPhotos instead of photos to match the RoommateProfile interface
    roomPhotos: user.photos || [],
    verified: user.isVerified || false,
    compatibilityScore: 85,
    traits: user.personalityTraits?.slice(0, 3) || [],
    // Add neighborhood for completeness
    neighborhood: user.location?.city || 'San Francisco',
    
    // Map place details from onboarding to roommate profile
    ...(user.placeDetails && {
      amenities: user.placeDetails.amenities || [],
      bedrooms: user.placeDetails.bedrooms || 1,
      bathrooms: user.placeDetails.bathrooms || 1,
      description: user.placeDetails.description || user.bio || '',
      monthlyRent: user.placeDetails.monthlyRent || (typeof user.budget === 'string' ? user.budget : formattedBudget),
      address: user.placeDetails.address || '',
      leaseDuration: user.placeDetails.leaseDuration || 'Flexible',
      isFurnished: user.placeDetails.isFurnished || false,
      // Use place photos if available, otherwise fall back to user photos
      roomPhotos: user.placeDetails.photos?.length > 0 ? user.placeDetails.photos : (user.photos || []),
      // Override room type with place details if specified
      roomType: (user.placeDetails.roomType || roomTypeValue) as any,
      // Override move-in date if specified in place details
      moveInDate: user.placeDetails.moveInDate || moveInDate || 'Flexible'
    })
  };

  return profile;
}

/**
 * Calculates age from date of birth
 */
function calculateAge(dateOfBirth: string): number {
  const dob = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Helper function to map numeric lifestyle values to string enum values
 */
export function mapCleanlinessToEnum(value: number | undefined): "very_clean" | "clean" | "moderate" | "relaxed" | undefined {
  if (value === undefined) return undefined;
  if (value <= 1) return "very_clean";
  if (value <= 2) return "clean";
  if (value <= 3) return "moderate";
  return "relaxed";
}

export function mapNoiseLevelToEnum(value: number | undefined): "quiet" | "moderate" | "loud" | undefined {
  if (value === undefined) return undefined;
  if (value <= 1) return "quiet";
  if (value <= 2) return "moderate";
  return "loud";
}

export function mapGuestFrequencyToEnum(value: number | undefined): "rarely" | "occasionally" | "frequently" | undefined {
  if (value === undefined) return undefined;
  if (value <= 1) return "rarely";
  if (value <= 2) return "occasionally";
  return "frequently";
}

/**
 * Maps pet preference option IDs to enum values used in the RoommateProfile
 */
function mapPetPreferenceToEnum(value: string): "no_pets" | "cats_only" | "dogs_only" | "all_pets_ok" {
  switch(value) {
    case 'love-pets':
      return "all_pets_ok";
    case 'cats-only':
      return "cats_only";
    case 'dogs-only':
      return "dogs_only";
    case 'no-pets':
    default:
      return "no_pets";
  }
}

/**
 * Resets a roommate profile to default values
 * This should be called when onboarding is reset
 */
export function resetRoommateProfile(userId: string): Partial<RoommateProfile> {
  return {
    // Keep the ID but reset everything else
    image: 'https://randomuser.me/api/portraits/lego/1.jpg',
    bio: '',
    budget: '$1000-2000', // Default budget
    location: 'San Francisco, CA',
    roomType: 'private',
    lifestylePreferences: {
      sleepSchedule: 'flexible',
      cleanliness: 'moderate',
      noiseLevel: 'moderate',
      guestPolicy: 'occasionally',
      smoking: false,
      pets: false,
      drinking: false
    },
    personalPreferences: {
      petPreference: 'no_pets',
      temperature: 'moderate',
      schedule: {
        earlyRiser: false,
        nightOwl: false
      }
    },
    personalityTraits: [],
    roomPhotos: [],
  };
}

/**
 * Compares user and roommate profiles to find differences
 */
export function findProfileDifferences(user: User, roommateProfile: RoommateProfile): string[] {
  const differences: string[] = [];
  
  // Check basic info
  if (user.name !== roommateProfile.name) {
    differences.push('name');
  }
  
  if (user.gender !== roommateProfile.gender) {
    differences.push('gender');
  }
  
  // Check personality data
  if (user.personalityType !== roommateProfile.personalityType) {
    differences.push('personalityType');
  }
  
  // Check lifestyle preferences
  if (user.lifestylePreferences && roommateProfile.lifestylePreferences) {
    // Compare using the mapping functions
    const mappedCleanliness = mapCleanlinessToEnum(user.lifestylePreferences.cleanliness);
    if (mappedCleanliness !== roommateProfile.lifestylePreferences.cleanliness) {
      differences.push('lifestylePreferences.cleanliness');
    }
    
    const mappedNoiseLevel = mapNoiseLevelToEnum(user.lifestylePreferences.noise);
    if (mappedNoiseLevel !== roommateProfile.lifestylePreferences.noiseLevel) {
      differences.push('lifestylePreferences.noise/noiseLevel');
    }
  }
  
  return differences;
}
