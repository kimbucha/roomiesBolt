// Base profile interface with common properties
export interface BaseProfile {
  id: string;
  location: string;
  budget: string;
  bio: string;
  image: string;
  verified?: boolean;
}

// Roommate-specific profile interface
export interface RoommateProfile extends BaseProfile {
  type: 'roommate';
  name: string;
  age: number;
  university: string;
  major?: string;
  traits: string[];
  compatibilityScore?: number;
  hasPlace?: boolean;
  roomPhotos?: string[];
  lifestylePreferences?: {
    sleepSchedule?: 'early_bird' | 'night_owl' | 'flexible';
    cleanliness?: 'very_clean' | 'clean' | 'moderate' | 'relaxed';
    noiseLevel?: 'quiet' | 'moderate' | 'loud';
    guestPolicy?: 'rarely' | 'occasionally' | 'frequently';
    studyHabits?: 'in_silence' | 'with_background' | 'in_groups';
    substancePolicy?: 'none' | 'alcohol_only' | 'smoking_ok' | 'all_ok';
  };
  personalPreferences?: {
    temperature?: 'cool' | 'moderate' | 'warm';
    petPreference?: 'no_pets' | 'cats_only' | 'dogs_only' | 'all_pets_ok';
    hometown?: string;
    pronouns?: string;
  };
  socialMedia?: {
    instagram?: string;
    spotify?: string;
    facebook?: string;
    twitter?: string;
    linkedin?: string;
  };
}

// Place-specific profile interface
export interface PlaceProfile extends BaseProfile {
  type: 'place';
  roomType: 'private' | 'shared' | 'studio';
  amenities: string[];
  availability: string;
  roomPhotos: string[];
  squareFootage?: number;
  bedrooms?: number;
  bathrooms?: number;
  furnished?: boolean;
  utilities?: {
    included?: boolean;
    internet?: boolean;
    electricity?: boolean;
    water?: boolean;
    gas?: boolean;
  };
  leaseTerms?: {
    minDuration: number; // in months
    maxDuration?: number; // in months
    securityDeposit?: string;
    petsAllowed?: boolean;
    smokingAllowed?: boolean;
  };
  currentRoommates?: RoommateProfile[];
}

// Union type for both profile types
export type Profile = RoommateProfile | PlaceProfile;

// Type guard to check if a profile is a roommate profile
export function isRoommateProfile(profile: Profile): profile is RoommateProfile {
  return profile.type === 'roommate';
}

// Type guard to check if a profile is a place profile
export function isPlaceProfile(profile: Profile): profile is PlaceProfile {
  return profile.type === 'place';
}

// Utility function to convert the current RoommateProfile to our new types
export function convertToNewProfileType(profile: any): Profile {
  if (profile.roomType && profile.amenities) {
    // This is likely a place profile
    return {
      ...profile,
      type: 'place',
      availability: 'Available now',
      roomPhotos: profile.roomPhotos || [],
      amenities: profile.amenities || [],
    } as PlaceProfile;
  } else {
    // This is likely a roommate profile
    return {
      ...profile,
      type: 'roommate',
      traits: profile.traits || [],
    } as RoommateProfile;
  }
} 