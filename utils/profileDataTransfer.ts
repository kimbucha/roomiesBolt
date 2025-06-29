import { User } from '../store/userStore';
import { RoommateProfile } from '../store/roommateStore';
import { generateId } from './idGenerator';

// Import preferences store to get default location
import { usePreferencesStore } from '../store/preferencesStore';

/**
 * Transfers user data from onboarding to create a complete roommate profile
 * @param user The user object from userStore
 * @returns A complete roommate profile with all onboarding data
 */
export function createProfileFromUser(user: User): RoommateProfile {
  // Generate a unique ID if not provided
  const id = user.id || generateId();
  
  // Convert budget range to string format (e.g., "$1000-1500")
  const budgetString = user.preferences?.budget 
    ? `$${user.preferences.budget.min}-${user.preferences.budget.max}` 
    : '$1000-2000'; // Default budget range
  
  // Get default location from preferences store if available
  const defaultLocation = 'San Francisco'; // Fallback default
  
  // Create the roommate profile
  const profile: RoommateProfile = {
    id,
    name: user.name || 'Anonymous User',
    image: user.profilePicture || 'https://randomuser.me/api/portraits/lego/1.jpg', // Default image
    budget: budgetString,
    location: defaultLocation, // Use default location
    
    // Transfer basic user information
    age: user.dateOfBirth ? calculateAge(user.dateOfBirth) : undefined,
    university: user.university,
    major: user.major,
    bio: user.bio,
    gender: user.gender as 'male' | 'female' | 'other' | 'prefer_not_to_say',
    dateOfBirth: user.dateOfBirth,
    year: user.year,
    userRole: user.userRole,
    isPremium: user.isPremium,
    isVerified: user.isVerified,
    
    // Transfer personality data
    personalityTraits: user.personalityTraits,
    personalityType: user.personalityType,
    personalityDimensions: user.personalityDimensions,
    
    // Transfer lifestyle preferences
    lifestylePreferences: user.lifestylePreferences ? {
      sleepSchedule: mapSleepSchedule(user.lifestylePreferences),
      cleanliness: mapCleanliness(user.lifestylePreferences),
      noiseLevel: mapNoiseLevel(user.lifestylePreferences),
      guestPolicy: mapGuestPolicy(user.lifestylePreferences),
      substancePolicy: mapSubstancePolicy(user.lifestylePreferences),
      smoking: user.lifestylePreferences.smoking,
      // Use type assertion for potentially missing properties
      // This is safe because we've defined these in the RoommateProfile interface
      pets: user.lifestylePreferences.pets,
      // Only add drinking if it exists in the user data
      ...(user.lifestylePreferences && 'drinking' in user.lifestylePreferences ? 
        { drinking: (user.lifestylePreferences as any).drinking } : {})
    } : undefined,
    
    // Transfer place details if the user has a place
    hasPlace: user.userRole === 'place_lister' || user.userRole === 'both',
    roomType: user.preferences?.roomType,
    moveInDate: user.preferences?.moveInDate,
    
    // Additional fields
    verified: user.isVerified,
    traits: user.personalityTraits?.slice(0, 3), // Use top 3 traits for display
    roomPhotos: user.photos, // Map photos to roomPhotos
  };
  
  return profile;
}

/**
 * Calculate age from date of birth
 */
function calculateAge(dateOfBirth: string): number {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();
  
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Map user lifestyle preferences to roommate profile format
 */
function mapSleepSchedule(lifestyle: any): 'early_bird' | 'night_owl' | 'flexible' {
  if (lifestyle.schedule?.earlyRiser) return 'early_bird';
  if (lifestyle.schedule?.nightOwl) return 'night_owl';
  return 'flexible';
}

function mapCleanliness(lifestyle: any): 'very_clean' | 'clean' | 'moderate' | 'relaxed' {
  const cleanlinessLevel = lifestyle.cleanliness || 3;
  
  if (cleanlinessLevel >= 5) return 'very_clean';
  if (cleanlinessLevel >= 4) return 'clean';
  if (cleanlinessLevel >= 2) return 'moderate';
  return 'relaxed';
}

function mapNoiseLevel(lifestyle: any): 'quiet' | 'moderate' | 'loud' {
  const noiseLevel = lifestyle.noise || 3;
  
  if (noiseLevel <= 2) return 'quiet';
  if (noiseLevel <= 4) return 'moderate';
  return 'loud';
}

function mapGuestPolicy(lifestyle: any): 'rarely' | 'occasionally' | 'frequently' {
  const guestFrequency = lifestyle.guestFrequency || 3;
  
  if (guestFrequency <= 2) return 'rarely';
  if (guestFrequency <= 4) return 'occasionally';
  return 'frequently';
}

function mapSubstancePolicy(lifestyle: any): 'none' | 'alcohol_only' | 'smoking_ok' | 'all_ok' {
  const smoking = lifestyle.smoking;
  const drinking = lifestyle.drinking;
  
  if (!smoking && !drinking) return 'none';
  if (!smoking && drinking) return 'alcohol_only';
  if (smoking && drinking) return 'all_ok';
  return 'smoking_ok'; // Unlikely case: smoking but no drinking
}
