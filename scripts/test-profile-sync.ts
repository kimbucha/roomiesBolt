/**
 * Test script for profile synchronization
 * 
 * This script simulates the onboarding process and verifies that the profile
 * data is correctly synchronized between the user and roommate profiles.
 */

// Import the stores
import { useUserStore } from '../store/userStore';
import { useRoommateStore } from '../store/roommateStore';
import { determineProfilePicture } from '../utils/profileSynchronizer';

// Test function to verify profile synchronization
async function testProfileSync() {
  console.log('=== TESTING PROFILE SYNCHRONIZATION ===');
  
  // Get store instances
  const userStore = useUserStore.getState();
  const roommateStore = useRoommateStore.getState();
  
  // Get current user
  const user = userStore.user;
  if (!user) {
    console.error('No user found. Please log in first.');
    return;
  }
  
  console.log('Current user:', {
    id: user.id,
    name: user.name,
    profilePicture: user.profilePicture,
    photos: user.photos?.length || 0,
    profilePhotoIndex: user.profilePhotoIndex,
    budget: user.budget,
    preferences: {
      budget: user.preferences?.budget,
      roomType: user.preferences?.roomType,
      moveInDate: user.preferences?.moveInDate
    },
    lifestylePreferences: user.lifestylePreferences
  });
  
  // Create a roommate profile from the user data
  console.log('Creating roommate profile from user data...');
  const profile = roommateStore.createProfileFromUser(user);
  
  console.log('Created roommate profile:', {
    id: profile.id,
    name: profile.name,
    image: profile.image,
    budget: profile.budget,
    roomType: profile.roomType,
    moveInDate: profile.moveInDate,
    lifestylePreferences: profile.lifestylePreferences,
    personalPreferences: profile.personalPreferences
  });
  
  // Verify that the profile data matches the user data
  console.log('\n=== VERIFICATION RESULTS ===');
  
  // Check profile picture
  const expectedImage = determineExpectedImage(user);
  console.log('Profile picture:', 
    profile.image === expectedImage ? '✅ CORRECT' : '❌ INCORRECT',
    `\n  Expected: ${expectedImage}\n  Actual: ${profile.image}`
  );
  
  // Check budget
  const expectedBudget = formatBudget(user);
  console.log('Budget:', 
    profile.budget === expectedBudget ? '✅ CORRECT' : '❌ INCORRECT',
    `\n  Expected: ${expectedBudget}\n  Actual: ${profile.budget}`
  );
  
  // Check room type
  const expectedRoomType = user.preferences?.roomType || 'private';
  console.log('Room type:', 
    profile.roomType === expectedRoomType ? '✅ CORRECT' : '❌ INCORRECT',
    `\n  Expected: ${expectedRoomType}\n  Actual: ${profile.roomType}`
  );
  
  // Check lifestyle preferences
  console.log('Lifestyle preferences:', 
    profile.lifestylePreferences ? '✅ PRESENT' : '❌ MISSING'
  );
  
  if (profile.lifestylePreferences && user.lifestylePreferences) {
    // Check specific lifestyle preferences
    console.log('  - Pets:', 
      profile.lifestylePreferences.pets === !!user.lifestylePreferences.pets ? '✅ CORRECT' : '❌ INCORRECT'
    );
    
    console.log('  - Cleanliness:', 
      profile.lifestylePreferences.cleanliness ? '✅ PRESENT' : '❌ MISSING'
    );
  }
  
  console.log('\nTest completed.');
}

// Helper function to determine expected profile image - use the one from profileSynchronizer
function determineExpectedImage(user) {
  return determineProfilePicture(user);
}

// Helper function to format budget
function formatBudget(user) {
  if (user.budget && user.budget.min !== undefined && user.budget.max !== undefined) {
    return `$${user.budget.min}-${user.budget.max}`;
  } else if (user.preferences?.budget?.min !== undefined && user.preferences?.budget?.max !== undefined) {
    return `$${user.preferences.budget.min}-${user.preferences.budget.max}`;
  }
  
  return '$1000-2000'; // Default budget range
}

// Run the test
testProfileSync();
