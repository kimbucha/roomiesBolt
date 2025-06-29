import { useMatchesStore, SwipeAction, Match } from '../store/matchesStore';
import { RoommateProfile } from '../store/roommateStore';

/**
 * Handles the profile scenario based on the matchScenario property
 * This is used for testing different match scenarios in the app
 * 
 * @param profile The profile to handle
 * @param action The swipe action performed by the user
 * @returns A match object if a match was created, null otherwise
 */
export const handleProfileScenario = async (
  profile: RoommateProfile, 
  action: SwipeAction
): Promise<Match | null> => {
  const matchesStore = useMatchesStore.getState();
  
  // If the profile doesn't have a matchScenario, just handle it normally
  if (!profile.matchScenario) {
    return await matchesStore.handleSwipe(profile.id, action);
  }
  
  console.log(`[MatchingUtils] Handling ${profile.matchScenario} scenario for ${profile.name}`);
  
  // Handle different scenarios
  switch (profile.matchScenario) {
    case 'superMatch':
      // Always create a super match if the user likes or super likes
      if (action === 'like' || action === 'superLike') {
        // Add a pending like with superLike from the profile
        matchesStore.setPendingLikes([
          ...matchesStore.getPendingLikes(),
          { userId: profile.id, action: 'superLike', timestamp: Date.now() }
        ]);
        
        // Now handle the swipe to create the match
        return await matchesStore.handleSwipe(profile.id, action);
      }
      break;
      
    case 'mixedMatch':
      // Create a mixed match (one like, one superlike)
      if (action === 'like' || action === 'superLike') {
        // If user super likes, the profile will like
        // If user likes, the profile will super like
        const profileAction: SwipeAction = action === 'superLike' ? 'like' : 'superLike';
        
        // Add a pending like from the profile
        matchesStore.setPendingLikes([
          ...matchesStore.getPendingLikes(),
          { userId: profile.id, action: profileAction, timestamp: Date.now() }
        ]);
        
        // Now handle the swipe to create the match
        return await matchesStore.handleSwipe(profile.id, action);
      }
      break;
      
    case 'regularMatch':
      // Always create a regular match if the user likes
      if (action === 'like' || action === 'superLike') {
        // Add a pending like with like from the profile
        matchesStore.setPendingLikes([
          ...matchesStore.getPendingLikes(),
          { userId: profile.id, action: 'like', timestamp: Date.now() }
        ]);
        
        // Now handle the swipe to create the match
        return await matchesStore.handleSwipe(profile.id, action);
      }
      break;
      
    case 'alreadyLiked':
      // The profile has already liked the user, so it should show in pending likes
      // We don't need to do anything here, as the profile should already be in pendingLikes
      // Just handle the swipe normally
      return await matchesStore.handleSwipe(profile.id, action);
      
    case 'alreadySuperLiked':
      // The profile has already super liked the user, so it should show in pending likes
      // We don't need to do anything here, as the profile should already be in pendingLikes
      // Just handle the swipe normally
      return await matchesStore.handleSwipe(profile.id, action);
      
    default:
      // For any other scenario, just handle the swipe normally
      return await matchesStore.handleSwipe(profile.id, action);
  }
  
  // If we get here, it means no match was created
  return null;
}; 