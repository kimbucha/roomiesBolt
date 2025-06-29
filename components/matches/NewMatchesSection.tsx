import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, ScrollView, LayoutChangeEvent, findNodeHandle, UIManager, LayoutRectangle } from 'react-native';
import { Heart, Lock, Star, User, MessageCircle, Eye, UserX } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS, SharedValue } from 'react-native-reanimated';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { RoommateProfile } from '../../store/roommateStore';
import { Match, useSupabaseMatchesStore } from '../../store/supabaseMatchesStore';
import { useRouter } from 'expo-router';
import { useSupabaseAuthStore } from '../../store/supabaseAuthStore';
import { useSupabaseUserStore } from '../../store/supabaseUserStore';
import { MatchContextMenu } from './MatchContextMenu';
import { useMessagingStore, selectNewMatches, selectLoading, selectError } from '../../store/messagingStore';
import { NavigationService } from '../../services/NavigationService';
import { logger } from '../../services/Logger';

// --- Exported Types ---
// Use local interfaces that work with RoommateProfile
export interface ProfileWithMatch {
  match: Match;
  profile: RoommateProfile;
}

export interface PendingLikeWithProfile {
  action: 'like' | 'superLike';
  profile: RoommateProfile;
  timestamp: string;
}

export interface CardPosition {
  x: number;
  y: number;
  width?: number;
  height?: number;
}
// ---

// Props for the new MatchCardItem component
interface MatchCardItemProps {
    item: ProfileWithMatch;
    isActive: boolean;
    pressedCardScale: SharedValue<number>;
    onOpenMenu: (matchId: string, absoluteX: number, absoluteY: number) => void;
    onCloseMenu: () => void;
    onNavigate: (matchId: string) => void;
    isPremium: boolean;
    onPremiumInfoRequest: () => void;
    hasNewMessage?: boolean; // New prop for message notification
}

// --- MatchCardItem Component ---
const MatchCardItem: React.FC<MatchCardItemProps> = ({ 
    item, 
    isActive, 
    pressedCardScale, 
    onOpenMenu, 
    onCloseMenu, 
    onNavigate,
    isPremium,
    onPremiumInfoRequest
}) => {
    const cardRef = useRef<View>(null);
    const targetUserId = item.profile.id;
    const firstName = item.profile.name.split(' ')[0];
    const hasSuperLike = item.match.user1Action === 'superLike' || item.match.user2Action === 'superLike';
    const { hasNewMessage = false } = arguments[0]; // Extract hasNewMessage prop

    // Gesture definition
    const longPressGesture = Gesture.LongPress()
      .minDuration(500) 
      .onStart((event) => {
         runOnJS(onOpenMenu)(item.match.id, event.absoluteX, event.absoluteY);
      })
      .onEnd((_, success) => {
        if (!success) {
            runOnJS(onCloseMenu)(); 
        }
      });

    // Animated style
    const animatedCardStyle = useAnimatedStyle(() => {
      const scale = isActive ? pressedCardScale.value : 1;
      return {
        transform: [{ scale: scale }],
      };
    }, [isActive, pressedCardScale]);

    return (
       <GestureDetector gesture={longPressGesture} key={item.match.id}>
         <Animated.View 
            style={[animatedCardStyle, { marginHorizontal: 8 }]} 
         >
             <TouchableOpacity
                 ref={cardRef} 
                 className="w-[120px] items-center bg-transparent overflow-visible"
                 onPress={() => {
                     if (isActive) {
                         onCloseMenu();
                     } else {
                         // Navigate directly to message lobby instead of match profile
                         onNavigate(item.match.id);
                     }
                 }}
                 activeOpacity={0.8}
             >
                 <View className="relative w-full h-[120px] rounded-lg overflow-hidden mb-2 shadow-sm"> 
                    <Image
                        source={{ uri: item.profile.image }}
                        className="w-full h-full rounded-lg"
                    />
                    {hasSuperLike && (
                        <View className="absolute bottom-2 right-2 bg-indigo-600/90 px-2.5 py-1.5 rounded">
                            <Text className="text-white text-[11px] font-bold font-[Poppins-Bold]">Super</Text>
                        </View>
                    )}
                    {hasNewMessage && (
                        <View className="absolute top-2 right-2 w-4 h-4 bg-indigo-600 rounded-full border-2 border-white flex items-center justify-center">
                            <View className="w-2 h-2 bg-white rounded-full" />
                        </View>
                    )}
                  </View>
                  <Text 
                    className="text-[14px] font-semibold text-gray-800 text-center font-[Poppins-SemiBold] mt-1" 
                    numberOfLines={1}
                  >
                    {firstName}
                  </Text>
             </TouchableOpacity>
         </Animated.View>
       </GestureDetector>
    );
};

interface NewMatchesSectionProps {
  matches: ProfileWithMatch[];
  pendingLikes: PendingLikeWithProfile[];
  isPremium: boolean;
  onPremiumInfoRequest: () => void;
  navigate: any; // Using any since router.push has complex typing
  showHeader?: boolean;
  conversations?: any[]; // Add conversations prop
}

const NewMatchesSection: React.FC<NewMatchesSectionProps> = ({ 
  matches, 
  pendingLikes, 
  isPremium, 
  onPremiumInfoRequest, 
  navigate,
  showHeader = true,
  conversations = []
}) => {
  const router = useRouter();
  const { deleteMatch } = useSupabaseMatchesStore();
  const messagingStore = useMessagingStore();
  const { user: currentUser } = useSupabaseAuthStore();
  const { user } = useSupabaseUserStore();
  const newMatches = useMessagingStore(selectNewMatches);
  const loading = useMessagingStore(selectLoading);
  const error = useMessagingStore(selectError);

  const [activeMenuMatchId, setActiveMenuMatchId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<CardPosition | null>(null);
  const pressedCardScale = useSharedValue(1);

  // Add structured logging
  logger.debug('NewMatchesSection', 'Component rendered with data', {
    matchesCount: matches.length,
    pendingLikesCount: pendingLikes.length,
    isPremium,
    showHeader
  });
  
  if (matches.length > 0) {
    matches.forEach((match, index) => {
      logger.debug('NewMatchesSection', `Match ${index} details`, {
        matchId: match.match.id,
        profileId: match.profile.id,
        profileName: match.profile.name,
        user1Action: match.match.user1Action,
        user2Action: match.match.user2Action,
        hasSuperLike: match.match.user1Action === 'superLike' || match.match.user2Action === 'superLike'
      });
    });
  }

  // --- Menu Action Handlers ---
  const handleOpenMenu = useCallback((matchId: string, absoluteX: number, absoluteY: number) => {
    logger.info('NewMatchesSection', 'Opening context menu for match', { 
      matchId, 
      coordinates: { x: absoluteX, y: absoluteY } 
    });
    logger.debug('NewMatchesSection', 'Long press started on match', { 
      matchId, 
      coordinates: { x: absoluteX, y: absoluteY } 
    });
    triggerHaptic();
    setActiveMenuMatchId(matchId);
    
    setMenuPosition({ x: absoluteX, y: absoluteY });
    
    pressedCardScale.value = withTiming(0.95, { duration: 100 });
  }, [pressedCardScale]);

  const handleCloseMenu = useCallback(() => {
    logger.debug('NewMatchesSection', 'Closing context menu');
    logger.debug('NewMatchesSection', 'Long press ended or menu closed');
    setActiveMenuMatchId(null);
    setMenuPosition(null);
    pressedCardScale.value = withTiming(1, { duration: 100 });
  }, [pressedCardScale]);

  const handleNavigateToProfile = useCallback((profileId: string) => {
    logger.debug('NewMatchesSection', 'Navigating to profile', { profileId });
    handleCloseMenu();
    
    // Find the match associated with this profile
    const matchForProfile = matches.find(m => m.profile.id === profileId);
    if (matchForProfile) {
      logger.info('NewMatchesSection', 'Found match for profile, navigating to match profile', { 
        matchId: matchForProfile.match.id, 
        profileId 
      });
      NavigationService.goToMatch(matchForProfile.match.id);
    } else {
      logger.info('NewMatchesSection', 'No match found for profile, falling back to regular profile', { profileId });
      NavigationService.goToProfileTab();
    }
  }, [handleCloseMenu, matches]);

  const handleNavigateToMatchProfile = useCallback((matchId: string) => {
    logger.debug('NewMatchesSection', 'Navigating to match profile', { matchId });
    NavigationService.goToMatch(matchId);
  }, []);

  // New function to navigate directly to message lobby without sending pre-message
  const handleNavigateToMessageLobby = useCallback(async (matchId: string) => {
    logger.info('NewMatchesSection', 'Navigating to message lobby for match', { matchId });
    
    // Find the match to get the other user's ID
    const matchData = matches.find(m => m.match.id === matchId);
    if (!matchData) {
      logger.error('NewMatchesSection', 'Match data not found', { matchId });
      return;
    }
    
    const currentUserId = currentUser?.id;
    if (!currentUserId) {
      logger.error('NewMatchesSection', 'No current user found');
      Alert.alert('Error', 'Please log in to view conversations.');
      return;
    }
    
    logger.debug('NewMatchesSection', 'Navigating to conversation screen for match', { 
      matchId, 
      otherUserId: matchData.profile.id 
    });
    
    // Navigate with match-based ID - the conversation screen will handle the "match-" prefix
    router.push({
      pathname: `/conversation/${matchId}` as any,
      params: { 
        source: 'matchCard',
        matchId: matchId
      }
    });
  }, [matches, currentUser, router]);

  const handleUnmatch = useCallback((matchId: string, profileName: string) => {
    logger.info('NewMatchesSection', 'Initiating unmatch process', { matchId, profileName });
    handleCloseMenu();
    setTimeout(() => {
        Alert.alert('Confirm Unmatch', `Are you sure you want to unmatch ${profileName}?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Unmatch',
                onPress: () => {
                    deleteMatch(matchId);
                    logger.info('NewMatchesSection', 'Successfully unmatched user', { matchId, profileName });
                },
                style: 'destructive'
            },
        ]);
    }, 150);
  }, [deleteMatch, handleCloseMenu]);

  const handleMessage = useCallback(async (matchId: string) => {
    logger.info('NewMatchesSection', 'Navigating to message lobby from context menu', { matchId });
    handleCloseMenu();
    
    // CRITICAL FIX: Don't auto-create conversation and send automatic message!
    // Just navigate to the message lobby like the match card taps do.
    // The conversation will be created only when the user actually sends their first message.
    
    // Find the match to get the other user's ID  
    const matchData = matches.find(m => m.match.id === matchId);
    if (!matchData) {
      logger.error('NewMatchesSection', 'Match data not found', { matchId });
      return;
    }
    
    const currentUserId = currentUser?.id;
    if (!currentUserId) {
      logger.error('NewMatchesSection', 'No current user found');
      Alert.alert('Error', 'Please log in to view conversations.');
      return;
    }
    
    logger.debug('NewMatchesSection', 'Navigating to conversation lobby from context menu', { 
      matchId, 
      otherUserId: matchData.profile.id 
    });
    
    // Navigate with match-based ID - the conversation screen will handle the "match-" prefix
    router.push({
      pathname: `/conversation/${matchId}` as any,
      params: { 
        source: 'contextMenu',
        matchId: matchId
      }
    });
  }, [matches, currentUser, handleCloseMenu, router]);

  const triggerHaptic = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {
      logger.warn('NewMatchesSection', 'Haptic feedback failed', { error: e });
    }
  };

  // Render the consolidated pending likes card
  const renderPendingLikesCard = () => {
    const previewProfiles = pendingLikes.slice(0, Math.min(4, pendingLikes.length)).map(item => item.profile).filter(Boolean);
    
    // Check for super likes among pending likes
    const hasSuperLikes = pendingLikes.some(like => like.action === 'superLike'); 
    
    return (
      <TouchableOpacity 
        className={`w-[120px] h-[160px] mx-2 bg-white rounded-lg shadow-sm border ${isPremium ? 'border-indigo-600' : 'border-gray-200'} relative overflow-hidden`} // Adjusted border for non-premium
        onPress={() => {
          if (activeMenuMatchId) { 
              handleCloseMenu();
              return;
          }
          if (isPremium) {
            if (pendingLikes.length > 0) {
              navigate('/likes');
            } else {
              Alert.alert(
                "No Likes Yet",
                "Keep swiping to get more visibility!",
                [{ text: "OK" }]
              );
            }
          } else {
            onPremiumInfoRequest();
          }
        }}
        activeOpacity={0.7}
      >
        {previewProfiles.length > 0 ? (
          <View className="relative w-full h-[120px] bg-gray-100 justify-center items-center">
            <Image 
              source={{ uri: previewProfiles[0].image }}
              className="w-full h-full object-cover"
              blurRadius={!isPremium ? 15 : 0} // Keep blur for non-premium
            />
            
            {/* Overlay for non-premium remains */}
            {!isPremium && (
               <View className={`absolute inset-0 bg-black/30 justify-center items-center`}>
                   {/* Lock icon previously here is removed */}
               </View>
            )}
            
            {/* Super like star badge for premium users (top right) */}
            {hasSuperLikes && isPremium && (
              <View className="absolute top-2 right-2 bg-indigo-600 w-[18px] h-[18px] rounded-full items-center justify-center border border-white">
                <Star size={10} color="#FFFFFF" />
              </View>
            )}
          </View>
        ) : (
          // Empty state (Heart icon) remains the same
          <View className="flex-1 justify-center items-center h-[150px]">
            <Heart size={24} color="#4F46E5" />
          </View>
        )}
        
        {/* Bottom section with text and Premium badge */}
        <View className="p-1 items-center justify-center h-10">
          <Text className="text-xs font-semibold text-gray-800 text-center font-[Poppins-SemiBold] mb-0.5">
            {pendingLikes.length > 0 
              ? `${pendingLikes.length} ${pendingLikes.length === 1 ? 'like' : 'likes'}`
              : 'No likes yet'}
          </Text>
          {/* Premium lock badge for non-premium users (bottom) remains */}
          {!isPremium && pendingLikes.length > 0 && (
            <View className="flex-row items-center mt-0 px-1 py-0.5 rounded-xl bg-indigo-600/10">
              <Text className="text-[10px] text-indigo-600 text-center font-[Poppins-Medium]">Premium</Text>
              <Lock size={8} color="#4F46E5" className="ml-0.5" />
            </View>
          )}
          {/* "View all" text for premium users remains */}
          {isPremium && pendingLikes.length > 0 && (
            <Text className="text-indigo-600 text-[14px] mr-1 font-[Poppins-SemiBold]">View all</Text>
          )}
        </View>
        
        {/* Premium badge (star) for premium users - This seems redundant with the one above, consider removing one? */}
        {/* Keeping it for now based on original code */} 
        {isPremium && pendingLikes.length > 0 && (
          <View className="absolute top-2 right-2 bg-indigo-600 w-[18px] h-[18px] rounded-full items-center justify-center border border-white">
            <Star size={10} color="#FFFFFF" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Empty state component
  const renderEmptyState = () => {
    if (matches.length === 0 && pendingLikes.length === 0) {
      return (
        <View style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
          <View className="w-full h-20 items-center justify-center bg-gray-100 rounded-xl">
            <Text className="text-gray-500 text-[14px] text-center p-4 font-[Poppins-Regular]">
              No matches yet. Start swiping to find matches!
            </Text>
          </View>
        </View>
      );
    }
    return null;
  };

  // Find the active match data to pass to the context menu
  const activeMatchData = useMemo(() => {
      if (!activeMenuMatchId) return null;
      return matches.find(m => m.match.id === activeMenuMatchId) || null;
  }, [activeMenuMatchId, matches]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View className="bg-white">
        {showHeader && (
          <Text className="text-[22px] font-[Poppins-Bold] text-gray-800 tracking-[-0.3px] font-extrabold py-3 px-4 bg-white">
            New Matches
            {matches.length > 0 && (
              <View className="bg-indigo-50 rounded-xl px-2 py-0.5 ml-2 inline-block">
                <Text className="text-[12px] text-indigo-600 font-semibold">{matches.length}</Text>
              </View>
            )}
          </Text>
        )}
        
        {/* Show empty state only when there are no matches AND no pending likes */}
        {matches.length === 0 && pendingLikes.length === 0 ? (
          renderEmptyState()
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ 
              paddingHorizontal: 16, 
              paddingVertical: 8, 
              backgroundColor: '#FFFFFF',
              minHeight: 100
            }}
          >
            {/* Only render pending likes card for roommate seekers, not place listers */}
            {pendingLikes.length > 0 && user?.userRole !== 'place_lister' && renderPendingLikesCard()}
            {matches.map((matchItem, index) => {
                logger.debug('NewMatchesSection', `Rendering match ${index}`, { 
                  matchId: matchItem.match.id, 
                  profileName: matchItem.profile.name 
                });
                
                // Check if this match has new messages by looking at conversations
                const hasNewMessage = conversations?.some(conv => 
                  conv.match_id === matchItem.match.id && conv.hasUnreadMessages
                ) || false;
                
              return (
                <MatchCardItem 
                    key={matchItem.match.id} 
                    item={matchItem}
                    isActive={matchItem.match.id === activeMenuMatchId}
                    pressedCardScale={pressedCardScale}
                    onOpenMenu={handleOpenMenu}
                    onCloseMenu={handleCloseMenu}
                    onNavigate={handleNavigateToMessageLobby}
                    isPremium={isPremium}
                    onPremiumInfoRequest={onPremiumInfoRequest}
                    hasNewMessage={hasNewMessage}
                />
              );
            })}
          </ScrollView>
        )}

        {/* Render the Context Menu */}
        <MatchContextMenu
            isVisible={activeMenuMatchId !== null && menuPosition !== null}
            targetPosition={menuPosition}
            match={activeMatchData}
            onClose={handleCloseMenu}
            onViewProfile={handleNavigateToProfile}
            onUnmatch={handleUnmatch}
            onMessage={handleMessage}
        />
      </View>
    </GestureHandlerRootView>
  );
};

export default NewMatchesSection;