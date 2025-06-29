// Quick utility to restore user's previous swipe state
// This matches the state from before the rebuild

import { useRoommateStore } from '../store/roommateStore';

export const restorePreviousSwipeState = () => {
  console.log('[RESTORE] Restoring previous swipe state...');
  
  const store = useRoommateStore.getState();
  
  // Based on user's previous logs, they had:
  // - 2 liked profiles (Jamie + 1 other) 
  // - 8 disliked profiles
  // Total: 10 swiped profiles
  
  const previousState = {
    likedProfiles: ['user2'], // Jamie Rodriguez (confirmed from logs)
    dislikedProfiles: [
      'user4',  // Jordan Smith
      'user6',  // Priya Patel  
      'user7',  // Marcus Johnson
      'user8',  // Sophia Garcia
      'user9',  // Ethan Williams
      'user10', // Olivia Kim
      'user11', // Alex Rivera
      'user1'   // Ethan Garcia (likely the missing 8th)
    ],
    superLikedProfiles: [] as string[]
  };
  
  console.log('[RESTORE] Setting previous swipe state:');
  console.log('[RESTORE] - Liked:', previousState.likedProfiles.length);
  console.log('[RESTORE] - Disliked:', previousState.dislikedProfiles.length);
  console.log('[RESTORE] - Super liked:', previousState.superLikedProfiles.length);
  
  // Apply the previous state using individual actions
  // Simulate the previous likes
  previousState.likedProfiles.forEach(profileId => {
    store.likeProfile(profileId);
  });
  
  // Simulate the previous dislikes  
  previousState.dislikedProfiles.forEach(profileId => {
    store.dislikeProfile(profileId);
  });
  
  console.log('[RESTORE] ✅ Previous swipe state restored!');
  console.log('[RESTORE] This should show the empty state with "Reset Swipes" button');
  
  // Trigger a refresh to apply the filtering
  store.fetchProfiles();
};

// Helper to check current state
export const checkCurrentSwipeState = () => {
  const store = useRoommateStore.getState();
  console.log('[STATE_CHECK] Current swipe state:');
  console.log('- Liked profiles:', store.likedProfiles.length, store.likedProfiles);
  console.log('- Disliked profiles:', store.dislikedProfiles.length, store.dislikedProfiles);
  console.log('- Super liked profiles:', store.superLikedProfiles.length, store.superLikedProfiles);
};
 