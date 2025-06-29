import React, { useState, useEffect, useCallback } from 'react';
import { useMatchesStore, SwipeAction, Match } from '../../store/matchesStore';
import { useSupabaseAuthStore } from '../../store/supabaseAuthStore';
import { useRoommateStore, RoommateProfile } from '../../store/roommateStore';
import MatchNotification from './MatchNotification';

interface SwipeHandlerProps {
  children: (props: {
    handleSwipe: (userId: string, action: SwipeAction) => void;
    isProcessingSwipe: boolean;
  }) => React.ReactNode;
  onMatch?: (profileId: string) => void;
}

const SwipeHandler: React.FC<SwipeHandlerProps> = ({ children, onMatch }) => {
  const { handleSwipe } = useMatchesStore();
  const { roommates } = useRoommateStore();
  const { user } = useSupabaseAuthStore();
  
  const [isProcessingSwipe, setIsProcessingSwipe] = useState(false);
  const [showMatchNotification, setShowMatchNotification] = useState(false);
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const [matchedProfile, setMatchedProfile] = useState<RoommateProfile | null>(null);
  
  const getProfileById = useCallback((id: string): RoommateProfile | null => {
    return roommates.find((r: RoommateProfile) => r.id === id) || null;
  }, [roommates]);
  
  const processSwipe = useCallback(async (userId: string, action: SwipeAction) => {
    if (isProcessingSwipe) return;
    
    setIsProcessingSwipe(true);
    
    try {
      const match = await handleSwipe(userId, action);
      
      if (match && (match.status === 'matched' || match.status === 'superMatched' || match.status === 'mixedMatched')) {
        // We have a match!
        const matchedUserId = match.user1Id === user?.id ? match.user2Id : match.user1Id;
        const profile = getProfileById(matchedUserId);
        
        if (profile) {
          setCurrentMatch(match);
          setMatchedProfile(profile);
          setShowMatchNotification(true);
          
          if (onMatch) {
            onMatch(matchedUserId);
          }
        }
      }
    } catch (error) {
      console.error('Error processing swipe:', error);
    } finally {
      setIsProcessingSwipe(false);
    }
  }, [handleSwipe, isProcessingSwipe, user?.id, getProfileById, onMatch]);
  
  const handleCloseMatchNotification = useCallback(() => {
    setShowMatchNotification(false);
    setCurrentMatch(null);
    setMatchedProfile(null);
  }, []);
  
  const handleMessageMatch = useCallback(() => {
    // Navigate to messaging or create conversation
    console.log('Navigate to conversation with', matchedProfile?.name);
    handleCloseMatchNotification();
  }, [matchedProfile, handleCloseMatchNotification]);
  
  return (
    <>
      {children({
        handleSwipe: processSwipe,
        isProcessingSwipe
      })}
      
      <MatchNotification
        visible={showMatchNotification}
        match={currentMatch}
        profile={matchedProfile}
        onClose={handleCloseMatchNotification}
        onMessage={handleMessageMatch}
      />
    </>
  );
};

export default SwipeHandler; 