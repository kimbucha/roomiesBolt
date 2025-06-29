import { useRoommateStore } from '../store/roommateStore';
import { useUserStore } from '../store/userStore';

/**
 * Updates all roommate profiles with the latest user data
 * This is useful when a user updates their profile or completes additional onboarding steps
 */
export function updateProfilesFromUserData() {
  const userStore = useUserStore.getState();
  const roommateStore = useRoommateStore.getState();
  const user = userStore.user;
  
  if (!user) {
    console.warn('[ProfileUpdater] No user data available to update profiles');
    return;
  }
  
  // Get the current user's profile if it exists
  const userProfile = roommateStore.profiles.find(profile => profile.id === user.id);
  
  if (userProfile) {
    // Update existing profile with new user data
    console.log('[ProfileUpdater] Updating existing profile for user:', user.name);
    
    // Create updated profile data
    const updates = {
      // Basic info
      name: user.name,
      image: user.profilePicture || userProfile.image,
      bio: user.bio || userProfile.bio,
      gender: user.gender as any || userProfile.gender,
      
      // Education info
      university: user.university || userProfile.university,
      major: user.major || userProfile.major,
      year: user.year || userProfile.year,
      
      // Personality data
      personalityTraits: user.personalityTraits || userProfile.personalityTraits,
      personalityType: user.personalityType || userProfile.personalityType,
      personalityDimensions: user.personalityDimensions || userProfile.personalityDimensions,
      
      // Verification status
      verified: user.isVerified,
      isVerified: user.isVerified,
      
      // Update traits display (top 3 personality traits)
      traits: user.personalityTraits?.slice(0, 3) || userProfile.traits,
      
      // Update room photos if available
      ...(user.photos && user.photos.length > 0 && { roomPhotos: user.photos }),
    };
    
    // Update the profile
    roommateStore.updateRoommate(userProfile.id, updates);
    
    return userProfile.id;
  } else {
    // If no profile exists, create a new one
    console.log('[ProfileUpdater] No existing profile found, creating new profile for user:', user.name);
    return roommateStore.createProfileFromUser(user);
  }
}

/**
 * Updates a specific field in the user's roommate profile
 * @param fieldName The field to update
 * @param value The new value for the field
 */
export function updateProfileField(fieldName: string, value: any) {
  const userStore = useUserStore.getState();
  const roommateStore = useRoommateStore.getState();
  const user = userStore.user;
  
  if (!user) {
    console.warn('[ProfileUpdater] No user data available to update profile field');
    return;
  }
  
  // Get the current user's profile if it exists
  const userProfile = roommateStore.profiles.find(profile => profile.id === user.id);
  
  if (userProfile) {
    // Create an update object with the single field
    const update = { [fieldName]: value };
    
    // Update the profile
    console.log(`[ProfileUpdater] Updating field "${fieldName}" for user:`, user.name);
    roommateStore.updateRoommate(userProfile.id, update);
    
    return userProfile.id;
  } else {
    // If no profile exists, create a new one and then update the field
    console.log('[ProfileUpdater] No existing profile found, creating new profile for user:', user.name);
    const newProfile = roommateStore.createProfileFromUser(user);
    
    // Update the newly created profile with the field
    if (newProfile && newProfile.id) {
      const update = { [fieldName]: value };
      roommateStore.updateRoommate(newProfile.id, update);
    }
    
    return newProfile?.id;
  }
}
