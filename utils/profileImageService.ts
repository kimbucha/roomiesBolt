/**
 * Profile Image Service - Centralized, robust profile picture management
 * 
 * This service provides a single source of truth for all profile picture logic,
 * follows TypeScript best practices, and uses enums instead of magic strings.
 */

import { ImageSourcePropType } from 'react-native';
import { User } from '../store/userStore';

// Enum for profile image types - no more magic strings!
export enum ProfileImageType {
  UPLOADED_PHOTO = 'uploaded_photo',
  PERSONALITY_IMAGE = 'personality_image', 
  POTATO_DEFAULT = 'potato_default',
  INITIALS_FALLBACK = 'initials_fallback'
}

// Enum for personality types - centralized definition
export enum PersonalityType {
  ISTJ = 'ISTJ', ISFJ = 'ISFJ', INFJ = 'INFJ', INTJ = 'INTJ',
  ISTP = 'ISTP', ISFP = 'ISFP', INFP = 'INFP', INTP = 'INTP',
  ESTP = 'ESTP', ESFP = 'ESFP', ENFP = 'ENFP', ENTP = 'ENTP',
  ESTJ = 'ESTJ', ESFJ = 'ESFJ', ENFJ = 'ENFJ', ENTJ = 'ENTJ'
}

// Strongly typed profile image result
export interface ProfileImageResult {
  type: ProfileImageType;
  source: ImageSourcePropType | { uri: string } | null;
  fallbackInitials?: string;
  cacheKey?: string;
}

// Centralized image assets
const PROFILE_IMAGES = {
  personality: {
    [PersonalityType.ISTJ]: require('../assets/images/personality/ISTJ.png'),
    [PersonalityType.ISFJ]: require('../assets/images/personality/ISFJ.png'),
    [PersonalityType.INFJ]: require('../assets/images/personality/INFJ.png'),
    [PersonalityType.INTJ]: require('../assets/images/personality/INTJ.png'),
    [PersonalityType.ISTP]: require('../assets/images/personality/ISTP.png'),
    [PersonalityType.ISFP]: require('../assets/images/personality/ISFP.png'),
    [PersonalityType.INFP]: require('../assets/images/personality/INFP.png'),
    [PersonalityType.INTP]: require('../assets/images/personality/INTP.png'),
    [PersonalityType.ESTP]: require('../assets/images/personality/ESTP.png'),
    [PersonalityType.ESFP]: require('../assets/images/personality/ESFP.png'),
    [PersonalityType.ENFP]: require('../assets/images/personality/ENFP.png'),
    [PersonalityType.ENTP]: require('../assets/images/personality/ENTP.png'),
    [PersonalityType.ESTJ]: require('../assets/images/personality/ESTJ.png'),
    [PersonalityType.ESFJ]: require('../assets/images/personality/ESFJ.png'),
    [PersonalityType.ENFJ]: require('../assets/images/personality/ENFJ.png'),
    [PersonalityType.ENTJ]: require('../assets/images/personality/ENTJ.png'),
  } as Record<PersonalityType, ImageSourcePropType>,
  
  defaults: {
    potato: require('../assets/images/potato.png'),
    lego: 'https://randomuser.me/api/portraits/lego/1.jpg'
  }
};

/**
 * Centralized Profile Image Service
 * 
 * This is the ONLY place that should determine what profile image to show.
 * All components should use this service instead of implementing their own logic.
 */
export class ProfileImageService {
  
  /**
   * Get the appropriate profile image for a user
   * @param user - User object
   * @returns ProfileImageResult with type, source, and metadata
   */
  static getProfileImage(user: User | null | undefined): ProfileImageResult {
    if (!user) {
      return {
        type: ProfileImageType.INITIALS_FALLBACK,
        source: null,
        fallbackInitials: '?'
      };
    }

    // Priority 1: User explicitly set profile picture
    if (user.profilePicture) {
      const explicitResult = this.resolveExplicitProfilePicture(user);
      if (explicitResult) return explicitResult;
    }

    // Priority 2: User uploaded photos with selection
    if (user.photos?.length && user.profilePhotoIndex !== null && user.profilePhotoIndex !== undefined) {
      const photoResult = this.resolveSelectedPhoto(user);
      if (photoResult) return photoResult;
    }

    // Priority 3: User uploaded photos (first one)
    if (user.photos?.length) {
      return {
        type: ProfileImageType.UPLOADED_PHOTO,
        source: { uri: user.photos[0] },
        cacheKey: `photo_${user.id}_0`
      };
    }

    // Priority 4: Personality image (if user has personality type)
    if (user.personalityType && this.isValidPersonalityType(user.personalityType)) {
      return {
        type: ProfileImageType.PERSONALITY_IMAGE,
        source: PROFILE_IMAGES.personality[user.personalityType as PersonalityType],
        cacheKey: `personality_${user.personalityType}`
      };
    }

    // Priority 5: Potato default (fallback)
    return {
      type: ProfileImageType.POTATO_DEFAULT,
      source: PROFILE_IMAGES.defaults.potato,
      cacheKey: 'potato_default'
    };
  }

  /**
   * Resolve explicitly set profile picture (handles all current formats)
   */
  private static resolveExplicitProfilePicture(user: User): ProfileImageResult | null {
    const { profilePicture } = user;

    // Handle personality image identifier
    if (profilePicture === 'personality_image' && user.personalityType) {
      if (this.isValidPersonalityType(user.personalityType)) {
        return {
          type: ProfileImageType.PERSONALITY_IMAGE,
          source: PROFILE_IMAGES.personality[user.personalityType as PersonalityType],
          cacheKey: `personality_${user.personalityType}`
        };
      }
    }

    // Handle potato identifier (for skipped onboarding)
    if (profilePicture === 'local://potato.png') {
      return {
        type: ProfileImageType.POTATO_DEFAULT,
        source: PROFILE_IMAGES.defaults.potato,
        cacheKey: 'potato_default'
      };
    }

    // Handle direct URL strings
    if (typeof profilePicture === 'string' && 
        !profilePicture.startsWith('local://') && 
        profilePicture !== 'personality_image') {
      return {
        type: ProfileImageType.UPLOADED_PHOTO,
        source: { uri: profilePicture },
        cacheKey: `url_${profilePicture.substring(0, 20)}`
      };
    }

    // Handle require() objects (legacy support)
    if (typeof profilePicture === 'object' && profilePicture !== null) {
      return {
        type: ProfileImageType.UPLOADED_PHOTO,
        source: profilePicture as ImageSourcePropType,
        cacheKey: 'require_object'
      };
    }

    return null;
  }

  /**
   * Resolve user's selected photo from their uploaded photos
   */
  private static resolveSelectedPhoto(user: User): ProfileImageResult | null {
    if (!user.photos?.length || user.profilePhotoIndex === null || user.profilePhotoIndex === undefined) {
      return null;
    }

    // Handle special personality image index (-1)
    if (user.profilePhotoIndex === -1 && user.personalityType) {
      if (this.isValidPersonalityType(user.personalityType)) {
        return {
          type: ProfileImageType.PERSONALITY_IMAGE,
          source: PROFILE_IMAGES.personality[user.personalityType as PersonalityType],
          cacheKey: `personality_${user.personalityType}`
        };
      }
    }

    // Handle valid photo index
    if (user.profilePhotoIndex >= 0 && user.profilePhotoIndex < user.photos.length) {
      return {
        type: ProfileImageType.UPLOADED_PHOTO,
        source: { uri: user.photos[user.profilePhotoIndex] },
        cacheKey: `photo_${user.id}_${user.profilePhotoIndex}`
      };
    }

    return null;
  }

  /**
   * Generate initials from user name
   */
  static generateInitials(name?: string): string {
    if (!name?.trim()) return '?';
    
    const nameParts = name.trim().split(' ').filter(part => part.length > 0);
    
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    }
    
    return (
      nameParts[0].charAt(0).toUpperCase() + 
      nameParts[nameParts.length - 1].charAt(0).toUpperCase()
    );
  }

  /**
   * Get database-safe identifier for storage
   * Converts React Native image sources to string identifiers for database storage
   */
  static getDatabaseIdentifier(profileImage: ProfileImageResult): string | null {
    switch (profileImage.type) {
      case ProfileImageType.PERSONALITY_IMAGE:
        return 'personality_image';
        
      case ProfileImageType.POTATO_DEFAULT:
        return 'local://potato.png';
        
      case ProfileImageType.UPLOADED_PHOTO:
        if (profileImage.source && typeof profileImage.source === 'object' && 'uri' in profileImage.source) {
          return (profileImage.source as { uri: string }).uri;
        }
        return null;
        
      case ProfileImageType.INITIALS_FALLBACK:
      default:
        return null;
    }
  }

  /**
   * Validate personality type
   */
  private static isValidPersonalityType(type: string): boolean {
    return Object.values(PersonalityType).includes(type as PersonalityType);
  }

  /**
   * Get all available personality images (useful for UI components)
   */
  static getPersonalityImages(): Record<PersonalityType, ImageSourcePropType> {
    return PROFILE_IMAGES.personality;
  }

  /**
   * Get default images (useful for fallbacks)
   */
  static getDefaultImages() {
    return PROFILE_IMAGES.defaults;
  }
} 