import { useUserStore } from '../store/userStore';
import { useRoommateStore } from '../store/roommateStore';
import { usePreferencesStore } from '../store/preferencesStore';
import { createProfileFromUser } from './profileDataTransfer';
import { updateProfileField } from './profileUpdater';

/**
 * Utility to test the profile data transfer functionality
 * This can be used to verify that data is being properly transferred
 * from the user profile to the roommate profile
 */
export function testProfileDataTransfer() {
  // Get store states
  const userStore = useUserStore.getState();
  const roommateStore = useRoommateStore.getState();
  const preferencesStore = usePreferencesStore.getState();
  
  // Get the current user
  const user = userStore.user;
  
  if (!user) {
    console.error('[ProfileDataTester] No user found. Please log in first.');
    return {
      success: false,
      error: 'No user found'
    };
  }
  
  console.log('[ProfileDataTester] Starting profile data transfer test');
  console.log('[ProfileDataTester] User data:', JSON.stringify(user, null, 2));
  
  try {
    // Create a roommate profile from the user data
    const profile = createProfileFromUser(user);
    
    // Log the created profile
    console.log('[ProfileDataTester] Created profile:', JSON.stringify(profile, null, 2));
    
    // Verify that key fields were transferred correctly
    const verificationResults = {
      name: profile.name === user.name,
      gender: profile.gender === user.gender,
      university: profile.university === user.university,
      major: profile.major === user.major,
      bio: profile.bio === user.bio,
      personalityTraits: JSON.stringify(profile.personalityTraits) === JSON.stringify(user.personalityTraits),
      lifestylePreferences: verifyLifestylePreferences(profile.lifestylePreferences, user.lifestylePreferences)
    };
    
    console.log('[ProfileDataTester] Verification results:', verificationResults);
    
    // Check if any verifications failed
    const failedVerifications = Object.entries(verificationResults)
      .filter(([_, result]) => result === false)
      .map(([field]) => field);
    
    if (failedVerifications.length > 0) {
      console.error('[ProfileDataTester] Some fields were not transferred correctly:', failedVerifications);
      return {
        success: false,
        error: `Fields not transferred correctly: ${failedVerifications.join(', ')}`,
        profile,
        verificationResults
      };
    }
    
    console.log('[ProfileDataTester] All fields were transferred correctly');
    return {
      success: true,
      profile,
      verificationResults
    };
  } catch (error) {
    console.error('[ProfileDataTester] Error during profile data transfer test:', error);
    return {
      success: false,
      error: String(error)
    };
  }
}

/**
 * Verify that lifestyle preferences were transferred correctly
 */
function verifyLifestylePreferences(profilePrefs: any, userPrefs: any): boolean {
  if (!profilePrefs || !userPrefs) return false;
  
  // Check if smoking and pets were transferred correctly
  const smokingMatch = profilePrefs.smoking === userPrefs.smoking;
  const petsMatch = profilePrefs.pets === userPrefs.pets;
  
  // Check if cleanliness was mapped correctly
  let cleanlinessMatch = false;
  if (userPrefs.cleanliness >= 3 && profilePrefs.cleanliness === 'very_clean') cleanlinessMatch = true;
  else if (userPrefs.cleanliness >= 2 && profilePrefs.cleanliness === 'clean') cleanlinessMatch = true;
  else if (userPrefs.cleanliness >= 1 && profilePrefs.cleanliness === 'moderate') cleanlinessMatch = true;
  else if (userPrefs.cleanliness < 1 && profilePrefs.cleanliness === 'relaxed') cleanlinessMatch = true;
  
  // Check if noise level was mapped correctly
  let noiseMatch = false;
  if (userPrefs.noise >= 3 && profilePrefs.noiseLevel === 'quiet') noiseMatch = true;
  else if (userPrefs.noise >= 1 && profilePrefs.noiseLevel === 'moderate') noiseMatch = true;
  else if (userPrefs.noise < 1 && profilePrefs.noiseLevel === 'loud') noiseMatch = true;
  
  return smokingMatch && petsMatch && cleanlinessMatch && noiseMatch;
}

/**
 * Test updating a specific field in the roommate profile
 */
export function testProfileFieldUpdate(fieldName: string, value: any) {
  // Get store states
  const userStore = useUserStore.getState();
  const roommateStore = useRoommateStore.getState();
  
  // Get the current user
  const user = userStore.user;
  
  if (!user) {
    console.error('[ProfileDataTester] No user found. Please log in first.');
    return {
      success: false,
      error: 'No user found'
    };
  }
  
  console.log(`[ProfileDataTester] Testing update of field "${fieldName}" with value:`, value);
  
  try {
    // Update the field
    const profileId = updateProfileField(fieldName, value);
    
    if (!profileId) {
      console.error('[ProfileDataTester] Failed to update profile field');
      return {
        success: false,
        error: 'Failed to update profile field'
      };
    }
    
    // Get the updated profile
    const updatedProfile = roommateStore.getById(profileId);
    
    if (!updatedProfile) {
      console.error('[ProfileDataTester] Failed to retrieve updated profile');
      return {
        success: false,
        error: 'Failed to retrieve updated profile'
      };
    }
    
    // Verify that the field was updated correctly
    const fieldPath = fieldName.split('.');
    let profileValue = updatedProfile as any;
    let fieldExists = true;
    
    for (const part of fieldPath) {
      if (profileValue && typeof profileValue === 'object' && part in profileValue) {
        profileValue = profileValue[part];
      } else {
        fieldExists = false;
        break;
      }
    }
    
    const updateSuccess = fieldExists && JSON.stringify(profileValue) === JSON.stringify(value);
    
    if (updateSuccess) {
      console.log(`[ProfileDataTester] Field "${fieldName}" was updated successfully`);
      return {
        success: true,
        profile: updatedProfile
      };
    } else {
      console.error(`[ProfileDataTester] Field "${fieldName}" was not updated correctly`);
      console.log('Expected:', value);
      console.log('Actual:', profileValue);
      return {
        success: false,
        error: `Field "${fieldName}" was not updated correctly`,
        expected: value,
        actual: profileValue
      };
    }
  } catch (error) {
    console.error('[ProfileDataTester] Error during profile field update test:', error);
    return {
      success: false,
      error: String(error)
    };
  }
}
