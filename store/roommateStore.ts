import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage, persist } from 'zustand/middleware';
import { mockProfiles } from '../utils/mockDataSetup';
import { useSupabaseAuthStore } from './supabaseAuthStore';
import type { Match as StoredMatch } from './matchesStore';
import { useMatchesStore } from './matchesStore';
import { usePreferencesStore } from './preferencesStore';
import { UserProfileService } from '../services/UserProfileService';

export interface RoommateProfile {
  id: string;
  name: string;
  age?: number;
  university?: string;
  major?: string;
  company?: string; // Work company name (alternative to university)
  role?: string; // Job title/role (alternative to major)
  bio?: string;
  budget: string;
  location: string;
  neighborhood?: string;
  image: string;
  roomPhotos?: string[];
  traits?: string[];
  verified?: boolean;
  compatibilityScore?: number;
  hasPlace?: boolean;
  roomType?: 'private' | 'shared' | 'studio';
  amenities?: string[];
  bedrooms?: number;
  bathrooms?: number;
  isFurnished?: boolean;
  leaseDuration?: string;
  moveInDate?: string;
  flexibleStay?: boolean;
  leaseType?: string;
  utilitiesIncluded?: string[];
  petPolicy?: string;
  subletAllowed?: boolean;
  matchScenario?: 'superMatch' | 'mixedMatch' | 'regularMatch' | 'alreadyLiked' | 'alreadySuperLiked';
  
  // Direct onboarding data fields
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  dateOfBirth?: string;
  year?: string | number; // School year
  userRole?: 'roommate_seeker' | 'place_lister' | 'both';
  isPremium?: boolean;
  isVerified?: boolean;
  
  // Personality data
  personalityTraits?: string[];
  personalityType?: string; // MBTI type (e.g., INFJ, ESTP)
  personalityDimensions?: {
    ei: number; // Extraversion (0) vs Introversion (100)
    sn: number; // Sensing (0) vs Intuition (100)
    tf: number; // Thinking (0) vs Feeling (100)
    jp: number; // Judging (0) vs Perceiving (100)
  };
  
  // Social media profiles
  socialMedia?: {
    instagram?: string;
    spotify?: string;
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
    tiktok?: string;
  };
  
  // Expanded lifestyle preferences
  lifestylePreferences?: {
    sleepSchedule?: 'early_bird' | 'night_owl' | 'flexible';
    cleanliness?: 'very_clean' | 'clean' | 'moderate' | 'relaxed';
    noiseLevel?: 'quiet' | 'moderate' | 'loud';
    guestPolicy?: 'rarely' | 'occasionally' | 'frequently';
    studyHabits?: 'in_silence' | 'with_background' | 'in_groups';
    substancePolicy?: 'none' | 'alcohol_only' | 'smoking_ok' | 'all_ok';
    smoking?: boolean;
    drinking?: boolean;
    pets?: boolean;
  };
  
  // Personal preferences
  personalPreferences?: {
    temperature?: 'cool' | 'moderate' | 'warm';
    petPreference?: 'no_pets' | 'cats_only' | 'dogs_only' | 'all_pets_ok';
    hometown?: string;
    pronouns?: string;
    schedule?: {
      earlyRiser?: boolean;
      nightOwl?: boolean;
    };
  };
  
  // Place details
  description?: string;
  address?: string;
  monthlyRent?: string;
  placeDetails?: {
    furnished?: boolean;
    roomType?: 'private' | 'shared' | 'studio' | 'any';
    amenities?: string[];
    bedrooms?: number;
    bathrooms?: number;
    utilities?: string[]; // Simple utilities list (legacy)
    detailedUtilities?: Array<{
      id: string;
      name: string;
      status: 'included' | 'not-included' | 'estimated';
      estimatedCost?: string;
    }>; // Enhanced utilities with costs
    petPolicy?: string;
    subletAllowed?: boolean;
  };
}

export interface Match {
  id: string;
  profile: RoommateProfile;
  matchedAt: string;
  isSuperMatch: boolean;
  hasUnreadMessages: boolean;
  lastMessage?: {
    content: string;
    timestamp: string;
    isRead: boolean;
  };
}

export interface RoommateState {
  profiles: RoommateProfile[];
  matches: Match[];
  likedProfiles: string[];
  dislikedProfiles: string[];
  superLikedProfiles: string[];
  savedPlaces: string[];
  prioritySavedPlaces: string[];
  isLoading: boolean;
  error: string | null;
  fetchProfiles: (isFilterChange?: boolean) => Promise<void>;
  likeProfile: (profileId: string) => void;
  dislikeProfile: (profileId: string) => void;
  superLikeProfile: (profileId: string) => void;
  savePlaceProfile: (profileId: string) => void;
  unsavePlaceProfile: (profileId: string) => void;
  getSavedPlaces: () => RoommateProfile[];
  resetSwipes: () => void;
  getFilteredProfiles: () => RoommateProfile[];
  roommates: RoommateProfile[];
  filteredRoommates: RoommateProfile[];
  filters: any;
  getById: (id: string) => RoommateProfile | undefined;
  setRoommates: (roommates: RoommateProfile[]) => void;
  setProfiles: (profiles: RoommateProfile[]) => void;
  addRoommate: (roommate: RoommateProfile) => void;
  createProfileFromUser: (user: any) => RoommateProfile;
  updateRoommate: (id: string, updates: Partial<RoommateProfile>) => void;
  applyFilters: (filters: any) => void;
  resetFilters: () => void;
  addProfile: (profile: RoommateProfile) => void;
}

// Use our mock profiles instead of the hardcoded sample profiles
const sampleProfiles: RoommateProfile[] = __DEV__ ? mockProfiles : [
  // Keep the original sample profiles for production
  {
    id: '1',
    name: 'Sarah Johnson',
    age: 21,
    university: 'Stanford University',
    major: 'Computer Science',
    bio: 'Early riser, clean and organized. I enjoy hiking on weekends and quiet study time during the week.',
    budget: '$800-1200',
    location: 'Palo Alto',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80',
    roomPhotos: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
    ],
    traits: ['Clean', 'Early Bird', 'Quiet'],
    compatibilityScore: 92,
    verified: true,
    hasPlace: true,
    roomType: 'private',
    amenities: ['Washer/Dryer', 'Parking', 'Gym'],
    socialMedia: {
      instagram: 'sarahjcodes',
      spotify: 'sarahj21',
      linkedin: 'sarah-johnson-cs'
    },
    lifestylePreferences: {
      sleepSchedule: 'early_bird',
      cleanliness: 'very_clean',
      noiseLevel: 'quiet',
      guestPolicy: 'occasionally',
      studyHabits: 'in_silence',
      substancePolicy: 'alcohol_only'
    },
    personalPreferences: {
      temperature: 'cool',
      petPreference: 'cats_only',
      hometown: 'Portland, OR',
      pronouns: 'she/her'
    }
  },
  {
    id: '2',
    name: 'Michael Chen',
    age: 22,
    university: 'UC Berkeley',
    major: 'Business',
    bio: 'Business major who loves cooking and watching movies. Looking for a roommate who is respectful of shared spaces.',
    budget: '$900-1300',
    location: 'Berkeley',
    image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80',
    roomPhotos: [
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
    ],
    traits: ['Social', 'Organized', 'Creative'],
    compatibilityScore: 85,
    verified: true,
    hasPlace: false,
    socialMedia: {
      instagram: 'mikec_business',
      spotify: 'mikechenmusic',
      facebook: 'michaelchen',
      twitter: 'mikec_tweets'
    },
    lifestylePreferences: {
      sleepSchedule: 'night_owl',
      cleanliness: 'clean',
      noiseLevel: 'moderate',
      guestPolicy: 'occasionally',
      studyHabits: 'with_background',
      substancePolicy: 'all_ok'
    },
    personalPreferences: {
      temperature: 'moderate',
      petPreference: 'all_pets_ok',
      hometown: 'San Francisco, CA',
      pronouns: 'he/him'
    }
  },
  {
    id: '3',
    name: 'Emma Rodriguez',
    age: 20,
    university: 'UCLA',
    major: 'Psychology',
    bio: 'Psychology student who enjoys yoga and reading. I prefer a calm living environment and am very tidy.',
    budget: '$750-1100',
    location: 'Westwood',
    image: 'https://images.unsplash.com/photo-1517841905240-cad84cf45f1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80',
    roomPhotos: [
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
    ],
    traits: ['Quiet', 'Neat', 'Studious'],
    compatibilityScore: 78,
    verified: false,
    hasPlace: true,
    roomType: 'shared',
    amenities: ['Kitchen', 'WiFi', 'Laundry'],
    socialMedia: {
      instagram: 'emma_r',
      spotify: 'emmayoga',
      linkedin: 'emma-rodriguez'
    },
    lifestylePreferences: {
      sleepSchedule: 'flexible',
      cleanliness: 'very_clean',
      noiseLevel: 'quiet',
      guestPolicy: 'rarely',
      studyHabits: 'in_silence',
      substancePolicy: 'none'
    },
    personalPreferences: {
      temperature: 'warm',
      petPreference: 'no_pets',
      hometown: 'San Diego, CA',
      pronouns: 'she/her'
    }
  },
  {
    id: '4',
    name: 'Alex Thompson',
    age: 23,
    university: 'USC',
    major: 'Film Studies',
    bio: "Film student looking for a creative and respectful roommate. I'm pretty laid back but keep common areas clean.",
    budget: '$900-1400',
    roomPhotos: [
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
    ],
    hasPlace: true,
    roomType: 'studio',
    amenities: ['Balcony', 'Pool', 'Gym'],
    location: 'Los Angeles',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80',
    traits: ['Creative', 'Social', 'Flexible'],
    compatibilityScore: 82,
    verified: true,
    socialMedia: {
      instagram: 'alexfilms',
      twitter: 'alexthompson_films',
      facebook: 'alexthompsonfilms'
    },
    lifestylePreferences: {
      sleepSchedule: 'night_owl',
      cleanliness: 'moderate',
      noiseLevel: 'moderate',
      guestPolicy: 'frequently',
      studyHabits: 'with_background',
      substancePolicy: 'smoking_ok'
    },
    personalPreferences: {
      temperature: 'cool',
      petPreference: 'dogs_only',
      hometown: 'Chicago, IL',
      pronouns: 'they/them'
    }
  },
  {
    id: '5',
    name: 'Jasmine Kim',
    age: 21,
    university: 'UC Davis',
    major: 'Veterinary Science',
    bio: "Animal lover studying to be a vet. I'm organized, quiet, and respectful of personal space.",
    budget: '$700-1000',
    location: 'Davis',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1964&q=80',
    traits: ['Pet Lover', 'Clean', 'Studious'],
    compatibilityScore: 88,
  },
];

export const useRoommateStore = create<RoommateState>()(
  persist(
    (set, get) => ({
      profiles: [],
      matches: [],
      likedProfiles: [],
      dislikedProfiles: [],
      superLikedProfiles: [],
      savedPlaces: [],
      prioritySavedPlaces: [],
      isLoading: false,
      error: null,
      fetchProfiles: async (isFilterChange = false) => {
        console.log('[DEBUG_PROFILES] ===== FETCH PROFILES DEBUG =====');
        console.log(`[DEBUG_PROFILES] Is filter change: ${isFilterChange}`);
        console.log(`[DEBUG_PROFILES] Current profiles count: ${get().profiles.length}`);
        
        set({ isLoading: true, error: null });
        
        try {
          // For now, use the sample profiles
          const profiles = sampleProfiles;
          console.log(`[DEBUG_PROFILES] Sample profiles loaded: ${profiles.length}`);
          console.log(`[DEBUG_PROFILES] Profile details:`, profiles.map(p => ({
            name: p.name,
            id: p.id,
            hasPlace: p.hasPlace,
            matchScenario: p.matchScenario || 'none',
            university: p.university || p.company || 'N/A'
          })));
          
          // Clear existing profiles and set new ones to prevent duplicates
          // Note: This replaces the entire profiles array
          set({ profiles, isLoading: false });
          console.log(`[DEBUG_PROFILES] Profiles set in store successfully (${profiles.length} total)`);
          console.log('[DEBUG_PROFILES] =====================================');
        } catch (error) {
          console.error('[RoommateStore] Error fetching profiles:', error);
          set({ error: 'Failed to load profiles', isLoading: false });
          
          // On error, fall back to mock data in dev mode
          if (__DEV__) {
            console.log('[RoommateStore] Falling back to mock data due to error');
            const { mockProfiles } = require('../utils/mockDataSetup');
            set({ 
              profiles: mockProfiles, 
              isLoading: false,
              error: null // Clear error since we have fallback data
            });
          }
        }
      },
      likeProfile: (profileId) => {
        const profile = get().profiles.find(p => p.id === profileId);
        if (!profile) return;
        
        // Add to liked profiles
        set((state) => ({
          likedProfiles: [...state.likedProfiles, profileId],
        }));
        
        // Check if this is a place listing or a roommate profile
        const isPlaceListing = profile.hasPlace === true;
        
        if (isPlaceListing) {
          // For place listings, save it to the savedPlaces list
          set((state) => ({
            savedPlaces: [...state.savedPlaces, profileId],
          }));
          return;
        }
        
        // Only create matches for roommate profiles (not places)
        // 70% chance of matching when liking
        if (Math.random() > 0.3) {
          set((state) => ({
            matches: [
              ...state.matches,
              {
                id: `match-${Date.now()}`,
                profile,
                matchedAt: new Date().toISOString(),
                isSuperMatch: false,
                hasUnreadMessages: false,
              },
            ],
          }));
        }
      },
      dislikeProfile: (profileId) => {
        set((state) => ({
          dislikedProfiles: [...state.dislikedProfiles, profileId],
        }));
      },
      superLikeProfile: (profileId) => {
        const profile = get().profiles.find(p => p.id === profileId);
        if (!profile) return;
        
        // Add to super liked profiles
        set((state) => ({
          superLikedProfiles: [...state.superLikedProfiles, profileId],
        }));
        
        // Check if this is a place listing or a roommate profile
        const isPlaceListing = profile.hasPlace === true;
        
        if (isPlaceListing) {
          // For place listings, add to priority saved places
          set((state) => ({
            savedPlaces: [...state.savedPlaces, profileId],
            prioritySavedPlaces: [...state.prioritySavedPlaces, profileId],
          }));
          return;
        }
        
        // Only create matches for roommate profiles (not places)
        // 90% chance of matching when super liking
        if (Math.random() > 0.1) {
          set((state) => ({
            matches: [
              ...state.matches,
              {
                id: `match-${Date.now()}`,
                profile,
                matchedAt: new Date().toISOString(),
                isSuperMatch: true,
                hasUnreadMessages: false,
              },
            ],
          }));
        }
      },
      savePlaceProfile: (profileId) => {
        const profile = get().profiles.find(p => p.id === profileId);
        if (!profile) {
          console.error('Cannot save place: Profile not found with ID:', profileId);
          return;
        }
        
        // Check if this is a place profile
        const isPlaceProfile = profile.hasPlace === true || (profile.roomPhotos && profile.roomPhotos.length > 0) || profile.roomType;
        
        if (!isPlaceProfile) {
          console.warn('Attempting to save a non-place profile:', profile.name, profile);
          // Continue anyway, as it might be a place that doesn't have the hasPlace flag set
        }
        
        // Check if already saved
        const { savedPlaces } = get();
        if (savedPlaces.includes(profileId)) {
          return;
        }
        
        set((state) => ({
          savedPlaces: [...state.savedPlaces, profileId],
        }));
      },
              unsavePlaceProfile: (profileId) => {
          set((state) => ({
            savedPlaces: state.savedPlaces.filter(id => id !== profileId),
            prioritySavedPlaces: state.prioritySavedPlaces.filter(id => id !== profileId),
          }));
        },
      getSavedPlaces: () => {
        const { profiles, savedPlaces } = get();
        
        if (savedPlaces.length === 0) {
          return [];
        }
        
        const savedProfiles = profiles.filter(profile => savedPlaces.includes(profile.id));
        return savedProfiles;
      },
      resetSwipes: async () => {
        // Get current saved places before resetting
        const { savedPlaces, prioritySavedPlaces } = get();
        
        // Reset the swipe arrays but preserve saved places
        set({
          likedProfiles: [],
          dislikedProfiles: [],
          superLikedProfiles: [],
          // Keep saved places intact
          savedPlaces,
          prioritySavedPlaces,
        });
        
        // Then force a refresh of profiles
        await get().fetchProfiles();
      },
      getFilteredProfiles: () => {
        const { profiles, likedProfiles, dislikedProfiles, superLikedProfiles } = get();
        
        // Debug logging reduced to minimize console spam during profile interactions
        
        // Import search filters from preferences store
        const { searchFilters } = usePreferencesStore.getState();
        
        // In DEV mode, we'll still apply filters but ignore swipe history
        const swipedProfileIds = __DEV__ ? [] : [...likedProfiles, ...dislikedProfiles, ...superLikedProfiles];
        
        // Exclude profiles already matched
        const currentUserId = useSupabaseAuthStore.getState().user?.id;
        const matched: StoredMatch[] = useMatchesStore.getState().getMatches();
        const matchedIds = matched.map((m: StoredMatch) => m.user1Id === currentUserId ? m.user2Id : m.user1Id);
        
        // First, strictly filter by lookingFor to ensure we only get the right profile types
        let profilesByType: RoommateProfile[] = [];
        
        if (searchFilters.lookingFor === 'roommate') {
          // If looking for roommates, only include profiles without places
          profilesByType = profiles.filter(profile => profile.hasPlace !== true);
        } else if (searchFilters.lookingFor === 'place') {
          // If looking for places, only include profiles with places
          const allPlaceListings = profiles.filter(profile => profile.hasPlace === true);
          profilesByType = allPlaceListings;
        } else if (searchFilters.lookingFor === 'both') {
          // If looking for both, include all profiles
          profilesByType = profiles;
        } else {
          // Default fallback - include all profiles
          profilesByType = profiles;
        }
        
        // Remove matched profiles from the discover stack
        if (matchedIds.length) {
          profilesByType = profilesByType.filter(profile => !matchedIds.includes(profile.id));
        }
        
        // Then apply the rest of the filters to the type-filtered profiles
        let filteredProfiles = profilesByType.filter(profile => {
          // Skip profiles that have been swiped on (except in DEV mode)
          if (!__DEV__ && swipedProfileIds.includes(profile.id)) return false;
          
          // Apply other filters
          // Add defensive check for account object
          if (searchFilters.account?.verifiedOnly && !profile.verified) return false;
          
          // Special handling for place listings
          if (searchFilters.lookingFor === 'place') {
            // For place listings, we need to make sure hasPlace is true
            if (!profile.hasPlace) {
              return false;
            }
            
            // Apply room type filter if it's not 'any'
            const roomTypeFilter = searchFilters.placeDetails?.roomType;
            if (roomTypeFilter && roomTypeFilter !== 'any' && profile.roomType !== roomTypeFilter) {
              return false;
            }
            
            // Apply furnished filter if specified, but only if the profile has a defined isFurnished value
            if (searchFilters.placeDetails?.furnished !== undefined) {
              // Only apply this filter if the profile has a defined isFurnished value
              // If profile.isFurnished is undefined, don't filter it out
              if (profile.isFurnished !== undefined && profile.isFurnished !== searchFilters.placeDetails.furnished) {
                return false;
              }
            }
          } else if (searchFilters.lookingFor === 'roommate') {
            // For roommate listings ONLY, ensure we're not showing place listings
            if (profile.hasPlace) {
              return false;
            }
          }
          
          // For 'both' option, don't filter by hasPlace - show all profiles
          
          // DEBUG: Add logging to see what's being filtered
          console.log(`[DEBUG_FILTER] Profile ${profile.name}: lookingFor=${searchFilters.lookingFor}, hasPlace=${profile.hasPlace}, passing filter=${true}`);
          
          // Apply gender filter if specified
          if (searchFilters.gender && searchFilters.gender !== 'any') {
            // First try to use the direct gender field if available
            if (profile.gender) {
              // Direct gender field comparison
              if (searchFilters.gender === 'male' && profile.gender !== 'male') {
                return false;
              }
              
              if (searchFilters.gender === 'female' && profile.gender !== 'female') {
                return false;
              }
            } 
            // Fallback to pronouns if gender field is not available
            else if (profile.personalPreferences?.pronouns) {
              const pronouns = profile.personalPreferences.pronouns.toLowerCase();
              
              if (searchFilters.gender === 'male' && !pronouns.includes('he')) {
                return false;
              }
              
              if (searchFilters.gender === 'female' && !pronouns.includes('she')) {
                return false;
              }
            }
            // If neither gender nor pronouns are available, use name-based filtering as last resort
            else {
              const typicallyMaleNames = [
                'ethan', 'jordan', 'marcus', 'alex', 'michael', 'david', 'james', 'john',
                'robert', 'william', 'richard', 'joseph', 'thomas', 'christopher'
              ];
              
              const typicallyFemaleNames = [
                'jamie', 'taylor', 'sarah', 'emily', 'jessica', 'ashley', 'amanda', 'jennifer',
                'elizabeth', 'stephanie', 'nicole', 'melissa', 'rebecca', 'lauren'
              ];
              
              // Get the first name in lowercase
              const firstName = profile.name.split(' ')[0].toLowerCase();
              
              // Apply gender filter based on first name
              if (searchFilters.gender === 'male' && !typicallyMaleNames.includes(firstName)) {
                return false;
              }
              
              if (searchFilters.gender === 'female' && !typicallyFemaleNames.includes(firstName)) {
                return false;
              }
            }
          }
          
          return true;
        });
        
        // If no profiles are left after filtering, ignore the swipe history
        // but still respect the lookingFor filter
        if (filteredProfiles.length === 0) {
          
          // Start with the type-filtered profiles
          filteredProfiles = profilesByType.filter(profile => {
            // Apply only non-swipe filters
            // Add defensive check for account object
            if (searchFilters.account?.verifiedOnly && !profile.verified) return false;
            if (searchFilters.hasPlace && !profile.hasPlace) return false;
            
            // Add defensive check for placeDetails object
            const roomTypeFilter = searchFilters.placeDetails?.roomType;
            if (roomTypeFilter && profile.hasPlace) {
              if (profile.roomType !== roomTypeFilter) return false;
            }
            
            // Apply gender filter if specified
            if (searchFilters.gender && searchFilters.gender !== 'any') {
              if (profile.personalPreferences?.pronouns) {
                const pronouns = profile.personalPreferences.pronouns.toLowerCase();
                
                // Check if pronouns indicate "other" or "prefer not to say"
                const isNonBinary = !pronouns.includes('he') && !pronouns.includes('she') || 
                                   pronouns.includes('they') || 
                                   pronouns.includes('other') || 
                                   pronouns.includes('prefer not');
                
                // If non-binary/other/prefer not to say, exclude from specific gender filters
                if (isNonBinary) return false;
                
                // Apply standard gender filters
                if (searchFilters.gender === 'male' && !pronouns.includes('he')) return false;
                if (searchFilters.gender === 'female' && !pronouns.includes('she')) return false;
              } else {
                // If no pronouns specified, we can't determine gender, so exclude from specific filters
                return false;
              }
            }
            
            return true;
          });
        }
        
        // Final validation to ensure we only return profiles matching the lookingFor filter
        if (searchFilters.lookingFor === 'roommate') {
          filteredProfiles = filteredProfiles.filter(profile => profile.hasPlace !== true);
        } else if (searchFilters.lookingFor === 'place') {
          filteredProfiles = filteredProfiles.filter(profile => profile.hasPlace === true);
        }
        // For 'both' option, don't apply any final filtering - show all profiles
        
        return filteredProfiles;
      },
      roommates: [],
      filteredRoommates: [],
      filters: {},
      
      getById: (id: string) => get().profiles.find(profile => profile.id === id),
      
      setRoommates: (roommates: RoommateProfile[]) => {
        set({ roommates });
      },
      
      setProfiles: (profiles: RoommateProfile[]) => {
        console.log(`[DEBUG_PROFILES] Setting ${profiles.length} profiles (replacing existing)`);
        set({ profiles });
      },
      
      addRoommate: (roommate: RoommateProfile) => {
        set((state) => ({
          roommates: [...state.roommates, roommate]
        }));
      },
      
      addProfile: (profile: RoommateProfile) => {
        console.log(`[DEBUG_PROFILES] Adding profile: ${profile.name} (${profile.id})`);
        set((state) => {
          // Check if profile already exists to prevent duplicates
          const existingProfile = state.profiles.find(p => p.id === profile.id);
          if (existingProfile) {
            console.log(`[DEBUG_PROFILES] Profile ${profile.name} (${profile.id}) already exists, skipping`);
            return state; // Return unchanged state
          }
          
          return {
            profiles: [...state.profiles, profile]
          };
        });
      },
      
      /**
       * Creates a roommate profile directly from user data
       * @param user User data from userStore
       * @returns The created roommate profile
       */
      createProfileFromUser: (user: any): RoommateProfile => {
        // Helper functions for mapping lifestyle preferences
        const mapSleepSchedule = (lifestyle: any): 'early_bird' | 'night_owl' | 'flexible' => {
          if (!lifestyle || !lifestyle.schedule) return 'flexible';
          
          if (lifestyle.schedule === 'early-riser') return 'early_bird';
          if (lifestyle.schedule === 'night-owl') return 'night_owl';
          return 'flexible';
        };
        
        const mapCleanliness = (lifestyle: any): 'very_clean' | 'clean' | 'moderate' | 'relaxed' => {
          if (!lifestyle || lifestyle.cleanliness === undefined) return 'moderate';
          
          if (lifestyle.cleanliness >= 3) return 'very_clean';
          if (lifestyle.cleanliness >= 2) return 'clean';
          if (lifestyle.cleanliness >= 1) return 'moderate';
          return 'relaxed';
        };
        
        const mapNoiseLevel = (lifestyle: any): 'quiet' | 'moderate' | 'loud' => {
          if (!lifestyle || lifestyle.noise === undefined) return 'moderate';
          
          if (lifestyle.noise >= 3) return 'quiet';
          if (lifestyle.noise >= 1) return 'moderate';
          return 'loud';
        };
        
        const mapGuestPolicy = (lifestyle: any): 'rarely' | 'occasionally' | 'frequently' => {
          if (!lifestyle || lifestyle.guestFrequency === undefined) return 'occasionally';
          
          if (lifestyle.guestFrequency >= 3) return 'frequently';
          if (lifestyle.guestFrequency >= 1) return 'occasionally';
          return 'rarely';
        };
        if (!user || !user.id) {
          console.error('[RoommateStore] Cannot create profile: Invalid user data');
          // Create a minimal valid profile instead of returning null
          user = {
            id: `temp-${Date.now()}`,
            name: 'Anonymous User',
            email: 'anonymous@example.com'
          };
        }
        
        // Calculate age from date of birth if available
        let age: number | undefined;
        if (user.dateOfBirth) {
          const birthDate = new Date(user.dateOfBirth);
          const today = new Date();
          age = today.getFullYear() - birthDate.getFullYear();
          const m = today.getMonth() - birthDate.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
        }
        
        // Convert budget range to string format (e.g., "$1000-1500")
        const budgetString = user.preferences?.budget 
          ? `$${user.preferences.budget.min}-${user.preferences.budget.max}` 
          : '$1000-2000'; // Default budget range
        
        // Map lifestyle preferences to roommate profile format
        const lifestylePreferences = user.lifestylePreferences ? {
          sleepSchedule: mapSleepSchedule(user.lifestylePreferences),
          cleanliness: mapCleanliness(user.lifestylePreferences),
          noiseLevel: mapNoiseLevel(user.lifestylePreferences),
          guestPolicy: mapGuestPolicy(user.lifestylePreferences),
          smoking: !!user.lifestylePreferences.smoking,
          drinking: !!user.lifestylePreferences.drinking,
          pets: !!user.lifestylePreferences.pets
        } : undefined;
        
        // Create the roommate profile
        const newProfile: RoommateProfile = {
          id: user.id,
          name: user.name || 'Anonymous User',
          image: user.profilePicture || 'https://randomuser.me/api/portraits/lego/1.jpg',
          budget: budgetString,
          location: user.location?.address || 'San Francisco, CA',
          neighborhood: user.location?.city || 'San Francisco',
          
          // Basic info
          age,
          bio: user.bio,
          gender: user.gender as 'male' | 'female' | 'other' | 'prefer_not_to_say',
          dateOfBirth: user.dateOfBirth,
          
          // Education info
          university: user.university,
          major: user.major,
          year: user.year,
          
          // User role and verification
          userRole: user.userRole,
          isPremium: user.isPremium,
          isVerified: user.isVerified,
          verified: user.isVerified,
          
          // Personality data
          personalityTraits: user.personalityTraits,
          personalityType: user.personalityType,
          personalityDimensions: user.personalityDimensions,
          traits: user.personalityTraits?.slice(0, 3),
          
          // Lifestyle preferences
          lifestylePreferences,
          
          // Place details
          hasPlace: user.userRole === 'place_lister' || user.userRole === 'both',
          roomType: user.preferences?.roomType,
          moveInDate: user.preferences?.moveInDate,
          
          // Photos
          roomPhotos: user.photos || [],
          
          // Default compatibility score
          compatibilityScore: 85,
          matchScenario: 'regularMatch', // Valid match scenario type
        };
        
        // Add the new profile to both profiles and roommates arrays
        set((state) => ({
          profiles: [...state.profiles, newProfile],
          roommates: [...state.roommates, newProfile]
        }));
        
        // Profile created successfully
        return newProfile;
      },
      

      
      updateRoommate: (id: string, updates: Partial<RoommateProfile>) => {
        set(state => ({
          roommates: state.roommates.map(r => 
            r.id === id ? { ...r, ...updates } : r
          ),
          filteredRoommates: state.filteredRoommates.map(r => 
            r.id === id ? { ...r, ...updates } : r
          )
        }));
      },
      
      /**
       * Resets a user's roommate profile when onboarding is reset
       * @param userId The ID of the user whose profile should be reset
       */
      resetProfile: (userId: string) => {
        if (!userId) {
          console.error('[RoommateStore] Cannot reset profile: No user ID provided');
          return;
        }
        
        try {
          // Import the resetRoommateProfile function from profileSynchronizer
          const { resetRoommateProfile } = require('../utils/profileSynchronizer');
          
          // Get the reset profile data
          const resetData = resetRoommateProfile(userId);
          
          // Update the profile in the store
          set((state) => {
            // Find the profile in both arrays
            const profileIndex = state.profiles.findIndex(p => p.id === userId);
            const roommateIndex = state.roommates.findIndex(r => r.id === userId);
            
            // Create new arrays to avoid mutating state
            const updatedProfiles = [...state.profiles];
            const updatedRoommates = [...state.roommates];
            
            // Update the profile if it exists
            if (profileIndex >= 0) {
              updatedProfiles[profileIndex] = {
                ...updatedProfiles[profileIndex],
                ...resetData
              };
            }
            
            // Update the roommate if it exists
            if (roommateIndex >= 0) {
              updatedRoommates[roommateIndex] = {
                ...updatedRoommates[roommateIndex],
                ...resetData
              };
            }
            
            // Profile reset successfully
            
            return {
              profiles: updatedProfiles,
              roommates: updatedRoommates
            };
          });
        } catch (error) {
          console.error('[RoommateStore] Error resetting profile:', error);
        }
      },
      
      applyFilters: (filters: any) => {
        // Implement your filtering logic here
        const filtered = get().roommates.filter(roommate => {
          // This is a simple example - enhance with your actual filter logic
          let matches = true;
          
          // Example filter: budget range
          if (filters.budgetMin && parseFloat(roommate.budget.replace(/[^0-9.]/g, '')) < filters.budgetMin) {
            matches = false;
          }
          
          // Example filter: has place
          if (filters.hasPlace !== undefined && roommate.hasPlace !== filters.hasPlace) {
            matches = false;
          }
          
          return matches;
        });
        
        set({ filteredRoommates: filtered, filters });
      },
      
      resetFilters: () => {
        set(state => ({ filteredRoommates: state.roommates, filters: {} }));
      }
    }),
    {
      name: 'roomies-roommate-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
