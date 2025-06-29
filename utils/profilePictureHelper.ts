/**
 * Profile Picture Helper
 * 
 * This utility provides a consistent way to get profile pictures throughout the app
 */

import { User } from '../store/userStore';

// Define personality type as a type for better type safety
type PersonalityType = 
  | 'ISTJ' | 'ISFJ' | 'INFJ' | 'INTJ' 
  | 'ISTP' | 'ISFP' | 'INFP' | 'INTP' 
  | 'ESTP' | 'ESFP' | 'ENFP' | 'ENTP' 
  | 'ESTJ' | 'ESFJ' | 'ENFJ' | 'ENTJ';

// Map of personality types to their image URLs
const personalityImages: Record<PersonalityType, string> = {
  'ISTJ': require('../assets/images/personality/ISTJ.png'),
  'ISFJ': require('../assets/images/personality/ISFJ.png'),
  'INFJ': require('../assets/images/personality/INFJ.png'),
  'INTJ': require('../assets/images/personality/INTJ.png'),
  'ISTP': require('../assets/images/personality/ISTP.png'),
  'ISFP': require('../assets/images/personality/ISFP.png'),
  'INFP': require('../assets/images/personality/INFP.png'),
  'INTP': require('../assets/images/personality/INTP.png'),
  'ESTP': require('../assets/images/personality/ESTP.png'),
  'ESFP': require('../assets/images/personality/ESFP.png'),
  'ENFP': require('../assets/images/personality/ENFP.png'),
  'ENTP': require('../assets/images/personality/ENTP.png'),
  'ESTJ': require('../assets/images/personality/ESTJ.png'),
  'ESFJ': require('../assets/images/personality/ESFJ.png'),
  'ENFJ': require('../assets/images/personality/ENFJ.png'),
  'ENTJ': require('../assets/images/personality/ENTJ.png'),
};

// Import the potato image
const potatoImage = require('../assets/images/potato.png');

/**
 * Gets the default profile picture for users who skip onboarding
 * @returns The potato image require() object
 */
export function getSkippedOnboardingProfilePicture() {
  return potatoImage;
}

/**
 * Converts local image identifier to actual image object
 * @param identifier The local image identifier (e.g., 'local://potato.png')
 * @returns The require() image object or null if not found
 */
export function convertLocalImageIdentifier(identifier: string) {
  if (identifier === 'local://potato.png') {
    return potatoImage;
  }
  return null;
}

/**
 * Gets the appropriate profile picture URL for a user
 * This function centralizes profile picture logic to ensure consistency
 * @param user The user object
 * @returns The URL of the profile picture or undefined if no user
 */
export function getProfilePicture(user: User | null | undefined): string | undefined {
  if (!user) return undefined;
  
  // Default profile picture if nothing else is available - use potato instead of lego
  const defaultImage = potatoImage;
  
  // If user has a direct profilePicture property, use that
  if (user?.profilePicture) {
    // Handle special case of 'personality_image' identifier
    if (user.profilePicture === 'personality_image' && user.personalityType) {
      if (Object.keys(personalityImages).includes(user.personalityType)) {
        return personalityImages[user.personalityType as PersonalityType];
      }
    }
    
    // Handle local image identifiers
    if (typeof user.profilePicture === 'string' && user.profilePicture.startsWith('local://')) {
      const convertedImage = convertLocalImageIdentifier(user.profilePicture);
      if (convertedImage) {
        return convertedImage;
      }
      return undefined;
    }
    
    // Handle regular string URLs
    if (typeof user.profilePicture === 'string' && user.profilePicture !== 'personality_image') {
      return user.profilePicture;
    }
    
    // Handle require() objects (shouldn't reach here with new design, but keep for safety)
    if (typeof user.profilePicture === 'object') {
      return undefined;
    }
  }
  
  // If user has photos and a valid profilePhotoIndex, use the selected photo
  if (user.photos && user.photos.length > 0 && 
      typeof user.profilePhotoIndex === 'number' && 
      user.profilePhotoIndex >= 0 && 
      user.profilePhotoIndex < user.photos.length) {
    
    return user.photos[user.profilePhotoIndex];
  }
  
  // If user has any photos but no valid index, use the first photo
  if (user.photos && user.photos.length > 0) {
    return user.photos[0];
  }
  
  // If user has a personality type, use the corresponding image
  if (user.personalityType && Object.keys(personalityImages).includes(user.personalityType)) {
    return personalityImages[user.personalityType as PersonalityType];
  }
  
  // If we reach here, no valid photo was found
  return defaultImage;
}
