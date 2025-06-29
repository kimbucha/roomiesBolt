import { supabase } from './supabaseClient';
import { PlaceDetailsData } from '../contexts/PlaceDetailsContext';

/**
 * Service for syncing place details from onboarding to Supabase roommate_profiles table
 * This ensures place detail sheets show real user data instead of hardcoded placeholders
 */
export const SupabasePlaceDetailsSync = {
  /**
   * Sync place details from users table to roommate_profiles table
   * @param userId User ID from authentication
   * @param placeDetails Place details data from onboarding
   * @returns Promise with success/error result
   */
  syncPlaceDetailsToProfile: async (
    userId: string, 
    placeDetails: PlaceDetailsData
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('[PlaceDetailsSync] Starting sync for user:', userId);
      console.log('[PlaceDetailsSync] Place details:', JSON.stringify(placeDetails, null, 2));

      // Validate inputs
      if (!userId || !placeDetails) {
        return { success: false, error: 'Missing required parameters' };
      }

      // Get current authenticated user to ensure security
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      if (authError || !authUser || authUser.id !== userId) {
        console.error('[PlaceDetailsSync] Authentication error:', authError?.message);
        return { success: false, error: 'Authentication failed' };
      }

      // Check if roommate profile exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from('roommate_profiles')
        .select('id, user_id')
        .eq('user_id', userId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        // Error other than "not found"
        console.error('[PlaceDetailsSync] Error fetching profile:', fetchError.message);
        return { success: false, error: `Error fetching profile: ${fetchError.message}` };
      }

      // Map onboarding data to database format
      const syncData = SupabasePlaceDetailsSync.mapPlaceDetailsToDbFormat(placeDetails);

      let result;
      if (existingProfile) {
        // Update existing profile
        console.log('[PlaceDetailsSync] Updating existing profile:', existingProfile.id);
        const { error: updateError } = await supabase
          .from('roommate_profiles')
          .update(syncData)
          .eq('user_id', userId);

        if (updateError) {
          console.error('[PlaceDetailsSync] Error updating profile:', updateError.message);
          return { success: false, error: `Error updating profile: ${updateError.message}` };
        }
        result = { success: true };
      } else {
        // Create new profile
        console.log('[PlaceDetailsSync] Creating new profile for user:', userId);
        
        // Get basic user info for profile creation
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('name, email')
          .eq('id', userId)
          .single();

        if (userError) {
          console.error('[PlaceDetailsSync] Error fetching user data:', userError.message);
          return { success: false, error: `Error fetching user data: ${userError.message}` };
        }

        const newProfileData = {
          user_id: userId,
          name: userData.name || 'Unknown User',
          ...syncData
        };

        const { error: insertError } = await supabase
          .from('roommate_profiles')
          .insert(newProfileData);

        if (insertError) {
          console.error('[PlaceDetailsSync] Error creating profile:', insertError.message);
          return { success: false, error: `Error creating profile: ${insertError.message}` };
        }
        result = { success: true };
      }

      console.log('[PlaceDetailsSync] ✅ Successfully synced place details to roommate profile');
      return result;

    } catch (error) {
      console.error('[PlaceDetailsSync] Unexpected error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  },

  /**
   * Map PlaceDetailsData from onboarding to roommate_profiles database format
   * @param placeDetails Place details from onboarding context
   * @returns Database-formatted object
   */
  mapPlaceDetailsToDbFormat: (placeDetails: PlaceDetailsData): Record<string, any> => {
    // Extract utilities information
    const utilitiesIncluded = placeDetails.utilities
      ?.filter(u => u.status === 'included')
      ?.map(u => u.name) || [];

    // Create place_details JSONB object for complex data
    const placeDetailsJson = {
      utilities: placeDetails.utilities || [],
      utilitiesIncluded: placeDetails.utilitiesIncluded,
      estimatedUtilitiesCost: placeDetails.estimatedUtilitiesCost
    };

    return {
      // Direct field mappings
      bedrooms: placeDetails.bedrooms || 1,
      bathrooms: placeDetails.bathrooms || 1,
      room_type: placeDetails.roomType || 'private',
      monthly_rent: placeDetails.monthlyRent,
      address: placeDetails.address,
      move_in_date: placeDetails.moveInDate,
      lease_duration: placeDetails.leaseDuration,
      is_furnished: false, // Default value, can be enhanced later
      description: placeDetails.description,
      
      // Array mappings
      amenities: placeDetails.amenities || [],
      room_photos: placeDetails.photos || [],
      utilities_included: utilitiesIncluded,
      
      // JSON storage for complex data
      place_details: placeDetailsJson,
      
      // Flags
      has_place: true,
      
      // Metadata
      updated_at: new Date().toISOString()
    };
  },

  /**
   * Repair function to sync existing user place details to roommate profiles
   * Useful for fixing data inconsistencies
   * @param userId Optional user ID, if not provided syncs current user
   */
  repairPlaceDetailsSync: async (userId?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // If no userId provided, get current authenticated user
      if (!userId) {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        if (authError || !authUser) {
          return { success: false, error: 'No authenticated user found' };
        }
        userId = authUser.id;
      }

      // Fetch user's place details from users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError) {
        console.error('[PlaceDetailsSync] Error fetching user for repair:', userError.message);
        return { success: false, error: `Error fetching user: ${userError.message}` };
      }

      // Check if user has place details to sync
      if (!userData.place_details && !userData.housing_goals) {
        return { success: false, error: 'No place details found in user data' };
      }

      // Extract place details from user data (could be in different fields)
      const placeDetails = userData.place_details || userData.housing_goals || {};

      // Convert to PlaceDetailsData format if needed
      const formattedPlaceDetails: PlaceDetailsData = {
        roomType: placeDetails.roomType || 'private',
        bedrooms: placeDetails.bedrooms || 1,
        bathrooms: placeDetails.bathrooms || 1,
        monthlyRent: placeDetails.monthlyRent,
        address: placeDetails.address,
        moveInDate: placeDetails.moveInDate,
        leaseDuration: placeDetails.leaseDuration,
                 amenities: placeDetails.amenities || [],
         photos: placeDetails.photos || [],
         description: placeDetails.description
      };

      // Sync to roommate profile
      return await SupabasePlaceDetailsSync.syncPlaceDetailsToProfile(userId, formattedPlaceDetails);

    } catch (error) {
      console.error('[PlaceDetailsSync] Error in repair function:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown repair error' 
      };
    }
  }
}; 