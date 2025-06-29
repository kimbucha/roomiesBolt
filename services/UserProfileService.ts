import { supabase } from './supabaseClient';
import { RoommateProfile } from '../store/roommateStore';
import { Database } from '../types/database';

type UserRow = Database['public']['Tables']['users']['Row'];
type RoommateProfileRow = Database['public']['Tables']['roommate_profiles']['Row'];

// Personality types for fallback data
const fallbackPersonalityTypes = [
  'ENFP', 'INTJ', 'ISFJ', 'ESTP', 'INFP', 'ESTJ', 'ENFJ', 'ISTP',
  'ESFP', 'INFJ', 'ENTP', 'ISFP', 'ENTJ', 'ESFJ', 'INTP', 'ISTJ'
];

// Fallback traits arrays
const fallbackTraitsArrays = [
  ['adaptable', 'creative', 'social'],
  ['analytical', 'independent', 'strategic'],
  ['caring', 'reliable', 'organized'],
  ['practical', 'energetic', 'spontaneous'],
  ['empathetic', 'artistic', 'idealistic'],
  ['organized', 'decisive', 'leadership'],
  ['warm', 'supportive', 'inspiring'],
  ['logical', 'flexible', 'observant'],
  ['enthusiastic', 'friendly', 'fun'],
  ['insightful', 'private', 'perfectionist'],
  ['innovative', 'curious', 'debater'],
  ['gentle', 'aesthetic', 'authentic'],
  ['confident', 'strategic', 'efficient'],
  ['helpful', 'social', 'traditional'],
  ['intellectual', 'independent', 'analytical'],
  ['responsible', 'detail-oriented', 'practical']
];

export class UserProfileService {
  /**
   * Fetch discover profiles with real Supabase user data
   */
  static async fetchDiscoverProfiles(
    currentUserId: string,
    filters: any = {},
    limit: number = 20
  ): Promise<RoommateProfile[]> {
    try {
      console.log('[UserProfileService] Fetching real user profiles from Supabase...');
      
      // Get current user's personality data for compatibility calculation
      const currentUserData = await this.getCurrentUserPersonalityData(currentUserId);
      
      // Query users with their roommate profiles - exclude current user
      const { data: usersData, error } = await supabase
        .from('users')
        .select(`
          id,
          name,
          email,
          gender,
          date_of_birth,
          university,
          major,
          personality_type,
          personality_traits,
          personality_dimensions,
          lifestyle_preferences,
          budget_min,
          budget_max,
          location,
          profile_image_url,
          is_verified,
          onboarding_completed,
          roommate_profiles (
            id,
            age,
            bio,
            budget,
            location,
            neighborhood,
            room_photos,
            traits,
            has_place,
            room_type,
            amenities,
            bedrooms,
            bathrooms,
            is_furnished,
            lifestyle_preferences,
            personality_dimensions,
            personality_traits,
            personality_type,
            social_media,
            personal_preferences
          )
        `)
        .neq('id', currentUserId) // Exclude current user
        .eq('onboarding_completed', true) // Only completed profiles
        .limit(limit);

      if (error) {
        console.error('[UserProfileService] Error fetching users:', error);
        return [];
      }

      if (!usersData || usersData.length === 0) {
        console.log('[UserProfileService] No users found, returning empty array');
        return [];
      }

      console.log(`[UserProfileService] Found ${usersData.length} users, formatting profiles...`);

      // Format users into RoommateProfile objects
      const profiles: RoommateProfile[] = usersData.map((user, index) => {
        return this.formatUserToRoommateProfile(user, currentUserData, index);
      });

      console.log(`[UserProfileService] Successfully formatted ${profiles.length} profiles`);
      return profiles;

    } catch (error) {
      console.error('[UserProfileService] Error in fetchDiscoverProfiles:', error);
      return [];
    }
  }

  /**
   * Get current user's personality data for compatibility calculation
   */
  private static async getCurrentUserPersonalityData(currentUserId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('personality_dimensions, personality_type')
        .eq('id', currentUserId)
        .single();

      if (error || !data) {
        console.log('[UserProfileService] Could not fetch current user personality data');
        return null;
      }

      return data;
    } catch (error) {
      console.error('[UserProfileService] Error fetching current user data:', error);
      return null;
    }
  }

  /**
   * Format a Supabase user record into a RoommateProfile
   */
  private static formatUserToRoommateProfile(
    user: any,
    currentUserData: any,
    index: number
  ): RoommateProfile {
    // Get roommate profile data (may be null)
    const roommateProfile = user.roommate_profiles?.[0] || {};
    
    // Calculate age from date_of_birth if available
    const age = user.date_of_birth 
      ? new Date().getFullYear() - new Date(user.date_of_birth).getFullYear()
      : roommateProfile.age || 22; // Fallback age

    // Format personality data with fallbacks
    const personalityType = user.personality_type || 
                           roommateProfile.personality_type || 
                           fallbackPersonalityTypes[index % fallbackPersonalityTypes.length];

    const personalityTraits = user.personality_traits || 
                             roommateProfile.personality_traits ||
                             fallbackTraitsArrays[index % fallbackTraitsArrays.length];

    const personalityDimensions = this.parsePersonalityDimensions(
      user.personality_dimensions || roommateProfile.personality_dimensions,
      personalityType
    );

    // Calculate compatibility score
    const compatibilityScore = this.calculateCompatibility(
      currentUserData?.personality_dimensions,
      personalityDimensions
    );

    // Format budget
    const budget = this.formatBudget(user.budget_min, user.budget_max, roommateProfile.budget);

    // Format lifestyle preferences
    const lifestylePreferences = this.parseLifestylePreferences(
      user.lifestyle_preferences || roommateProfile.lifestyle_preferences
    );

    // Generate profile image URL with fallback
    const image = user.profile_image_url || 
                  `https://images.unsplash.com/photo-${1500000000000 + (index * 1000000)}?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80`;

    // Format location
    const location = this.formatLocation(user.location, roommateProfile.location);

    return {
      id: user.id,
      name: user.name || 'Anonymous User',
      age,
      university: user.university || 'University',
      major: user.major || 'Student',
      bio: roommateProfile.bio || 'Looking for great roommates!',
      budget,
      location,
      neighborhood: roommateProfile.neighborhood,
      image,
      roomPhotos: roommateProfile.room_photos || [],
      traits: personalityTraits,
      verified: user.is_verified || false,
      compatibilityScore,
      hasPlace: roommateProfile.has_place || false,
      roomType: roommateProfile.room_type as any || 'private',
      amenities: roommateProfile.amenities || [],
      bedrooms: roommateProfile.bedrooms,
      bathrooms: roommateProfile.bathrooms,
      isFurnished: roommateProfile.is_furnished,
      gender: user.gender as any,
      personalityType,
      personalityTraits,
      personalityDimensions,
      lifestylePreferences,
      socialMedia: this.parseSocialMedia(roommateProfile.social_media),
      personalPreferences: this.parsePersonalPreferences(roommateProfile.personal_preferences),
      // Add other required fields with sensible defaults
      leaseDuration: '12 months',
      moveInDate: 'Flexible',
      flexibleStay: true,
      leaseType: 'Standard',
      utilitiesIncluded: ['Internet'],
      petPolicy: 'Ask about pets',
      subletAllowed: false,
      matchScenario: 'regularMatch' as any
    };
  }

  /**
   * Parse personality dimensions from JSONB with fallbacks
   */
  private static parsePersonalityDimensions(dimensions: any, personalityType: string): any {
    if (dimensions && typeof dimensions === 'object') {
      // Ensure all required fields exist
      return {
        ei: dimensions.ei ?? 50,
        sn: dimensions.sn ?? 50,
        tf: dimensions.tf ?? 50,
        jp: dimensions.jp ?? 50
      };
    }

    // Generate dimensions from personality type as fallback
    return this.generateDimensionsFromType(personalityType);
  }

  /**
   * Generate personality dimensions from MBTI type
   */
  private static generateDimensionsFromType(personalityType: string): any {
    if (!personalityType || personalityType.length !== 4) {
      return { ei: 50, sn: 50, tf: 50, jp: 50 }; // Neutral
    }

    return {
      ei: personalityType[0] === 'E' ? 25 : 75, // E = more extroverted (lower score)
      sn: personalityType[1] === 'S' ? 25 : 75, // S = more sensing (lower score)  
      tf: personalityType[2] === 'T' ? 25 : 75, // T = more thinking (lower score)
      jp: personalityType[3] === 'J' ? 25 : 75  // J = more judging (lower score)
    };
  }

  /**
   * Calculate compatibility between two users' personality dimensions
   */
  private static calculateCompatibility(
    currentUserDimensions: any,
    targetUserDimensions: any
  ): number {
    if (!currentUserDimensions || !targetUserDimensions) {
      return Math.floor(Math.random() * 30) + 70; // Random 70-99% for demo
    }

    try {
      const dimensions = ['ei', 'sn', 'tf', 'jp'];
      let totalDifference = 0;

      dimensions.forEach(dim => {
        const current = currentUserDimensions[dim] ?? 50;
        const target = targetUserDimensions[dim] ?? 50;
        const difference = Math.abs(current - target);
        totalDifference += difference;
      });

      // Convert to compatibility percentage (lower difference = higher compatibility)
      const avgDifference = totalDifference / dimensions.length;
      const compatibility = Math.max(0, 100 - avgDifference);
      
      // Add some randomness for variation (±10%)
      const variation = (Math.random() - 0.5) * 20;
      const finalScore = Math.max(60, Math.min(99, compatibility + variation));
      
      return Math.round(finalScore);
    } catch (error) {
      console.error('[UserProfileService] Error calculating compatibility:', error);
      return Math.floor(Math.random() * 30) + 70;
    }
  }

  /**
   * Format budget from min/max or budget string
   */
  private static formatBudget(budgetMin?: number, budgetMax?: number, budgetString?: string): string {
    if (budgetString) return budgetString;
    
    if (budgetMin && budgetMax) {
      return `$${budgetMin}-${budgetMax}`;
    }
    
    if (budgetMin) return `$${budgetMin}+`;
    
    return '$1000-1500'; // Default budget range
  }

  /**
   * Parse lifestyle preferences from JSONB
   */
  private static parseLifestylePreferences(preferences: any): any {
    if (!preferences || typeof preferences !== 'object') {
      return {
        sleepSchedule: 'flexible',
        cleanliness: 'clean',
        noiseLevel: 'moderate',
        guestPolicy: 'occasionally',
        studyHabits: 'with_background',
        substancePolicy: 'alcohol_only'
      };
    }

    return {
      sleepSchedule: preferences.sleepSchedule || preferences.sleep_schedule || 'flexible',
      cleanliness: preferences.cleanliness || 'clean',
      noiseLevel: preferences.noiseLevel || preferences.noise_level || 'moderate',
      guestPolicy: preferences.guestPolicy || preferences.guest_policy || 'occasionally',
      studyHabits: preferences.studyHabits || preferences.study_habits || 'with_background',
      substancePolicy: preferences.substancePolicy || preferences.substance_policy || 'alcohol_only'
    };
  }

  /**
   * Parse social media from JSONB
   */
  private static parseSocialMedia(socialMedia: any): any {
    if (!socialMedia || typeof socialMedia !== 'object') {
      return {};
    }

    return {
      instagram: socialMedia.instagram,
      spotify: socialMedia.spotify,
      facebook: socialMedia.facebook,
      twitter: socialMedia.twitter,
      linkedin: socialMedia.linkedin
    };
  }

  /**
   * Parse personal preferences from JSONB
   */
  private static parsePersonalPreferences(preferences: any): any {
    if (!preferences || typeof preferences !== 'object') {
      return {
        temperature: 'moderate',
        petPreference: 'no_pets',
        hometown: '',
        pronouns: 'they/them'
      };
    }

    return {
      temperature: preferences.temperature || 'moderate',
      petPreference: preferences.petPreference || preferences.pet_preference || 'no_pets',
      hometown: preferences.hometown || '',
      pronouns: preferences.pronouns || 'they/them'
    };
  }

  /**
   * Format location from JSONB or string
   */
  private static formatLocation(userLocation: any, roommateLocation: any): string {
    const location = userLocation || roommateLocation;
    
    if (typeof location === 'string') {
      return location;
    }
    
    if (location && typeof location === 'object') {
      return location.city || location.name || 'San Francisco';
    }
    
    return 'San Francisco'; // Default location
  }
} 