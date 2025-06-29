import { create } from 'zustand';
import { supabase } from '../services/supabaseClient';
import { useSupabaseAuthStore } from './supabaseAuthStore';
import { RoommateProfile } from './roommateStore'; // Reuse existing type

interface RoommateState {
  profiles: RoommateProfile[];
  savedPlaces: string[];
  prioritySavedPlaces: string[];
  isLoading: boolean;
  error: string | null;
  
  // Core actions
  fetchProfiles: (isFilterChange?: boolean) => Promise<void>;
  getProfileById: (id: string) => Promise<RoommateProfile | null>;
  createProfile: (profile: Partial<RoommateProfile>) => Promise<{ data: RoommateProfile | null, error: string | null }>;
  updateProfile: (id: string, updates: Partial<RoommateProfile>) => Promise<{ error: string | null }>;
  
  // Swipe actions
  likeProfile: (profileId: string) => Promise<{ error: string | null }>;
  dislikeProfile: (profileId: string) => Promise<{ error: string | null }>;
  superLikeProfile: (profileId: string) => Promise<{ error: string | null }>;
  
  // Place actions
  savePlaceProfile: (profileId: string) => Promise<{ error: string | null }>;
  unsavePlaceProfile: (profileId: string) => Promise<{ error: string | null }>;
  getSavedPlaces: () => Promise<RoommateProfile[]>;
  
  // Filter actions
  getFilteredProfiles: (filters: any) => Promise<RoommateProfile[]>;
}

// Helper function to convert database record to RoommateProfile
const mapDbRecordToProfile = (record: any): RoommateProfile => {
  return {
    id: record.id,
    name: record.name,
    age: record.age,
    university: record.university,
    major: record.major,
    bio: record.bio,
    budget: record.budget?.range || record.budget,
    location: record.location?.city || record.location,
    neighborhood: record.location?.neighborhood,
    image: record.profile_image_url,
    roomPhotos: record.room_photos,
    traits: record.traits,
    verified: record.is_verified,
    compatibilityScore: record.compatibility_score,
    hasPlace: record.has_place,
    roomType: record.room_type,
    amenities: record.amenities,
    bedrooms: record.bedrooms,
    bathrooms: record.bathrooms,
    isFurnished: record.is_furnished,
    leaseDuration: record.lease_duration,
    moveInDate: record.move_in_date,
    flexibleStay: record.flexible_stay,
    leaseType: record.lease_type,
    utilitiesIncluded: record.utilities_included,
    petPolicy: record.pet_policy,
    subletAllowed: record.sublet_allowed,
    gender: record.gender,
    dateOfBirth: record.date_of_birth,
    year: record.year,
    userRole: record.user_role,
    isPremium: record.is_premium,
    isVerified: record.is_verified,
    personalityTraits: record.personality_traits,
    personalityType: record.personality_type,
    personalityDimensions: record.personality_dimensions,
    socialMedia: record.social_media,
    lifestylePreferences: record.lifestyle_preferences,
    personalPreferences: record.personal_preferences,
    description: record.description,
    address: record.address,
    monthlyRent: record.monthly_rent,
    placeDetails: record.place_details
  };
};

export const useSupabaseRoommateStore = create<RoommateState>((set, get) => ({
  profiles: [],
  savedPlaces: [],
  prioritySavedPlaces: [],
  isLoading: false,
  error: null,
  
  fetchProfiles: async (isFilterChange = false) => {
    const { user } = useSupabaseAuthStore.getState();
    if (!user) {
      set({ error: 'User not authenticated' });
      return;
    }
    
    set({ isLoading: true });
    
    try {
      // Fetch all profiles except the current user's
      const { data, error } = await supabase
        .from('roommate_profiles')
        .select('*')
        .neq('user_id', user.id);
        
      if (error) throw error;
      
      // Map database records to RoommateProfile objects
      const profiles = data.map(mapDbRecordToProfile);
      
      // Fetch saved places
      const { data: savedData, error: savedError } = await supabase
        .from('saved_places')
        .select('place_id, is_priority')
        .eq('user_id', user.id);
        
      if (savedError) throw savedError;
      
      const savedPlaces = savedData.map(item => item.place_id);
      const prioritySavedPlaces = savedData
        .filter(item => item.is_priority)
        .map(item => item.place_id);
      
      set({ 
        profiles, 
        savedPlaces, 
        prioritySavedPlaces,
        isLoading: false,
        error: null
      });
    } catch (error: any) {
      console.error('Error fetching profiles:', error);
      set({ 
        isLoading: false,
        error: error.message
      });
    }
  },
  
  getProfileById: async (id) => {
    try {
      const { data, error } = await supabase
        .from('roommate_profiles')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      
      return mapDbRecordToProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  },
  
  createProfile: async (profile) => {
    const { user } = useSupabaseAuthStore.getState();
    if (!user) {
      return { data: null, error: 'User not authenticated' };
    }
    
    try {
      // Convert RoommateProfile to database format
      const dbProfile = {
        user_id: user.id,
        name: profile.name || user.name,
        age: profile.age,
        university: profile.university,
        major: profile.major,
        bio: profile.bio,
        budget: profile.budget,
        location: typeof profile.location === 'string' 
          ? { city: profile.location } 
          : profile.location,
        profile_image_url: profile.image,
        room_photos: profile.roomPhotos,
        traits: profile.traits,
        is_verified: profile.verified,
        compatibility_score: profile.compatibilityScore,
        has_place: profile.hasPlace,
        room_type: profile.roomType,
        amenities: profile.amenities,
        bedrooms: profile.bedrooms,
        bathrooms: profile.bathrooms,
        is_furnished: profile.isFurnished,
        lease_duration: profile.leaseDuration,
        move_in_date: profile.moveInDate,
        flexible_stay: profile.flexibleStay,
        lease_type: profile.leaseType,
        utilities_included: profile.utilitiesIncluded,
        pet_policy: profile.petPolicy,
        sublet_allowed: profile.subletAllowed,
        gender: profile.gender,
        date_of_birth: profile.dateOfBirth,
        year: profile.year,
        user_role: profile.userRole,
        is_premium: profile.isPremium,
        personality_traits: profile.personalityTraits,
        personality_type: profile.personalityType,
        personality_dimensions: profile.personalityDimensions,
        social_media: profile.socialMedia,
        lifestyle_preferences: profile.lifestylePreferences,
        personal_preferences: profile.personalPreferences,
        description: profile.description,
        address: profile.address,
        monthly_rent: profile.monthlyRent,
        place_details: profile.placeDetails
      };
      
      const { data, error } = await supabase
        .from('roommate_profiles')
        .insert(dbProfile)
        .select()
        .single();
        
      if (error) throw error;
      
      // Add the new profile to the local state
      const newProfile = mapDbRecordToProfile(data);
      set(state => ({
        profiles: [...state.profiles, newProfile]
      }));
      
      return { data: newProfile, error: null };
    } catch (error: any) {
      console.error('Error creating profile:', error);
      return { data: null, error: error.message };
    }
  },
  
  updateProfile: async (id, updates) => {
    const { user } = useSupabaseAuthStore.getState();
    if (!user) {
      return { error: 'User not authenticated' };
    }
    
    try {
      // Convert updates to database format
      const dbUpdates: any = {};
      
      // Map fields from RoommateProfile to database columns
      Object.entries(updates).forEach(([key, value]) => {
        switch (key) {
          case 'image':
            dbUpdates.profile_image_url = value;
            break;
          case 'roomPhotos':
            dbUpdates.room_photos = value;
            break;
          case 'verified':
            dbUpdates.is_verified = value;
            break;
          case 'compatibilityScore':
            dbUpdates.compatibility_score = value;
            break;
          case 'hasPlace':
            dbUpdates.has_place = value;
            break;
          case 'isFurnished':
            dbUpdates.is_furnished = value;
            break;
          case 'dateOfBirth':
            dbUpdates.date_of_birth = value;
            break;
          case 'userRole':
            dbUpdates.user_role = value;
            break;
          case 'isPremium':
            dbUpdates.is_premium = value;
            break;
          case 'personalityTraits':
            dbUpdates.personality_traits = value;
            break;
          case 'personalityType':
            dbUpdates.personality_type = value;
            break;
          case 'personalityDimensions':
            dbUpdates.personality_dimensions = value;
            break;
          case 'socialMedia':
            dbUpdates.social_media = value;
            break;
          case 'lifestylePreferences':
            dbUpdates.lifestyle_preferences = value;
            break;
          case 'personalPreferences':
            dbUpdates.personal_preferences = value;
            break;
          case 'placeDetails':
            dbUpdates.place_details = value;
            break;
          default:
            // For fields that have the same name in both formats
            dbUpdates[key] = value;
        }
      });
      
      const { error } = await supabase
        .from('roommate_profiles')
        .update(dbUpdates)
        .eq('id', id);
        
      if (error) throw error;
      
      // Update the profile in the local state
      set(state => ({
        profiles: state.profiles.map(profile => 
          profile.id === id ? { ...profile, ...updates } : profile
        )
      }));
      
      return { error: null };
    } catch (error: any) {
      console.error('Error updating profile:', error);
      return { error: error.message };
    }
  },
  
  likeProfile: async (profileId) => {
    const { user } = useSupabaseAuthStore.getState();
    if (!user) {
      return { error: 'User not authenticated' };
    }
    
    try {
      const { error } = await supabase
        .from('swipes')
        .insert({
          user_id: user.id,
          target_user_id: profileId,
          action: 'like',
          created_at: new Date().toISOString()
        });
        
      if (error) throw error;
      
      return { error: null };
    } catch (error: any) {
      console.error('Error liking profile:', error);
      return { error: error.message };
    }
  },
  
  dislikeProfile: async (profileId) => {
    const { user } = useSupabaseAuthStore.getState();
    if (!user) {
      return { error: 'User not authenticated' };
    }
    
    try {
      const { error } = await supabase
        .from('swipes')
        .insert({
          user_id: user.id,
          target_user_id: profileId,
          action: 'pass',
          created_at: new Date().toISOString()
        });
        
      if (error) throw error;
      
      return { error: null };
    } catch (error: any) {
      console.error('Error disliking profile:', error);
      return { error: error.message };
    }
  },
  
  superLikeProfile: async (profileId) => {
    const { user } = useSupabaseAuthStore.getState();
    if (!user) {
      return { error: 'User not authenticated' };
    }
    
    try {
      const { error } = await supabase
        .from('swipes')
        .insert({
          user_id: user.id,
          target_user_id: profileId,
          action: 'superLike',
          created_at: new Date().toISOString()
        });
        
      if (error) throw error;
      
      return { error: null };
    } catch (error: any) {
      console.error('Error super liking profile:', error);
      return { error: error.message };
    }
  },
  
  savePlaceProfile: async (profileId) => {
    const { user } = useSupabaseAuthStore.getState();
    if (!user) {
      return { error: 'User not authenticated' };
    }
    
    try {
      const { error } = await supabase
        .from('saved_places')
        .insert({
          user_id: user.id,
          place_id: profileId,
          is_priority: false,
          created_at: new Date().toISOString()
        });
        
      if (error) throw error;
      
      // Update local state
      set(state => ({
        savedPlaces: [...state.savedPlaces, profileId]
      }));
      
      return { error: null };
    } catch (error: any) {
      console.error('Error saving place:', error);
      return { error: error.message };
    }
  },
  
  unsavePlaceProfile: async (profileId) => {
    const { user } = useSupabaseAuthStore.getState();
    if (!user) {
      return { error: 'User not authenticated' };
    }
    
    try {
      const { error } = await supabase
        .from('saved_places')
        .delete()
        .eq('user_id', user.id)
        .eq('place_id', profileId);
        
      if (error) throw error;
      
      // Update local state
      set(state => ({
        savedPlaces: state.savedPlaces.filter(id => id !== profileId),
        prioritySavedPlaces: state.prioritySavedPlaces.filter(id => id !== profileId)
      }));
      
      return { error: null };
    } catch (error: any) {
      console.error('Error unsaving place:', error);
      return { error: error.message };
    }
  },
  
  getSavedPlaces: async () => {
    const { user } = useSupabaseAuthStore.getState();
    const { profiles, savedPlaces } = get();
    
    if (!user) {
      return [];
    }
    
    // If we already have the profiles loaded, filter them
    if (profiles.length > 0 && savedPlaces.length > 0) {
      return profiles.filter(profile => savedPlaces.includes(profile.id));
    }
    
    // Otherwise, fetch them from the database
    try {
      const { data, error } = await supabase
        .from('saved_places')
        .select(`
          place_id,
          is_priority,
          roommate_profiles!inner(*)
        `)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      return data.map(item => mapDbRecordToProfile(item.roommate_profiles));
    } catch (error) {
      console.error('Error fetching saved places:', error);
      return [];
    }
  },
  
  getFilteredProfiles: async (filters) => {
    const { profiles } = get();
    
    // Apply filters to the profiles
    // This is a simplified version - you would implement the full filtering logic here
    let filteredProfiles = [...profiles];
    
    // Filter by lookingFor
    if (filters.lookingFor === 'roommate') {
      filteredProfiles = filteredProfiles.filter(profile => !profile.hasPlace);
    } else if (filters.lookingFor === 'place') {
      filteredProfiles = filteredProfiles.filter(profile => profile.hasPlace);
    }
    
    // Filter by verified
    if (filters.account?.verifiedOnly) {
      filteredProfiles = filteredProfiles.filter(profile => profile.verified);
    }
    
    // Filter by gender
    if (filters.gender && filters.gender !== 'any') {
      filteredProfiles = filteredProfiles.filter(profile => profile.gender === filters.gender);
    }
    
    // Filter by place details
    if (filters.placeDetails && filters.lookingFor === 'place') {
      // Room type filter
      if (filters.placeDetails.roomType && filters.placeDetails.roomType !== 'any') {
        filteredProfiles = filteredProfiles.filter(
          profile => profile.roomType === filters.placeDetails.roomType
        );
      }
      
      // Furnished filter
      if (filters.placeDetails.furnished !== undefined) {
        filteredProfiles = filteredProfiles.filter(
          profile => profile.isFurnished === filters.placeDetails.furnished
        );
      }
    }
    
    return filteredProfiles;
  }
}));
