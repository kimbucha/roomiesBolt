// Add global type declarations at the top of the file
declare global {
  var _isMounted: boolean;
  var _hasValidProfile: boolean;
  var _isValidProfile: boolean;
  var _componentUnmounted: boolean;
  var _timeoutIds: NodeJS.Timeout[];
  var _eventLog: string[];
}

// Type definitions for better type safety
type SwipeDirection = 'left' | 'right' | 'up';
type SwipeIndicator = 'like' | 'dislike' | 'superlike' | null;

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, Dimensions, StatusBar, ActivityIndicator, ScrollView, StyleSheet, Image, Alert } from 'react-native';
import { Heart, X, Star, SlidersVertical, RefreshCw, Home, Search } from 'lucide-react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  useAnimatedReaction, 
  withSpring, 
  withTiming, 
  runOnJS,
  runOnUI,
  interpolate,
  Extrapolate,
  cancelAnimation,
  interpolateColor,
  Easing
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { SectionList } from 'react-native';

import { RoommateDetailCard } from '../../components';
import { PlaceDetailCard } from '../../components';
import { FilterModal } from '../../components/common';
import { FilterBar } from '../../components/common';
import { useRoommateStore } from '../../store/roommateStore';
import { usePreferencesStore, clearPreferencesStorage } from '../../store/preferencesStore';
import { useUserStore } from '../../store/userStore';
import { useSupabaseUserStore } from '../../store/supabaseUserStore';
import { Dropdown } from '../../components/navigation';
import { DropdownManager, useDropdownManager } from '../../components/navigation';
import { AnimatedIndicator } from '../../components/feedback';
import { initializeMockData } from '../../utils/mockDataSetup';
import { MatchNotification, PlaceSavedNotification } from '../../components/matching';
import { Match, SwipeAction, useMatchesStore, MatchStatus } from '../../store/matchesStore';
import { useSupabaseMatchesStore } from '../../store/supabaseMatchesStore';
import { RoommateProfile, RoommateState } from '../../store/roommateStore';
import { handleProfileScenario } from '../../utils/matchingUtils';
import AppLogo from '../../components/common/AppLogo';
import { useMessageStore } from '../../store/messageStore';
import { HEADER_CONSTANTS } from '../../constants/headerConfig';
import { TabScreenHeader } from '../../components/layout';
import { Conversation, Message } from '../../store/messageStore';
import { NavigationService } from '../../services/NavigationService';
import { logger } from '../../services/Logger';
import { useConversationsStore } from '../../hooks/useConversationsStore';
import { useSupabaseAuthStore } from '../../store/supabaseAuthStore';
import { BoltBadge } from '../../components/common/BoltBadge';


// Global JS error handler to catch uncaught exceptions
const globalAny = (global as any);
if (globalAny.ErrorUtils && typeof globalAny.ErrorUtils.getGlobalHandler === 'function') {
  const defaultHandler = globalAny.ErrorUtils.getGlobalHandler();
  globalAny.ErrorUtils.setGlobalHandler((error: any, isFatal?: boolean) => {
    console.error('Uncaught JS Error', error.stack || error);
    Alert.alert('Uncaught JS Error', error?.message || String(error));
    defaultHandler(error, isFatal);
  });
}

const { width, height } = Dimensions.get('window');

// Spring animation configurations
const SPRING_CONFIG = {
  damping: 15,     // Controls bounce
  stiffness: 150,  // Controls speed
  mass: 1,         // Controls inertia
  overshootClamping: false,
};

// Timing animation configurations
const TIMING_CONFIG = {
  duration: 200
};

// Gesture and animation thresholds
const SWIPE_THRESHOLD = width * 0.3;
const SUPER_LIKE_THRESHOLD = -height * 0.15;
const ROTATION_FACTOR = 15; // Degrees of rotation per 100px of movement

// Haptic feedback handler with error catching
const triggerHaptic = async (style = Haptics.ImpactFeedbackStyle.Medium): Promise<void> => {
  try {
    await Haptics.impactAsync(style);
  } catch (error) {
    console.log('Haptic feedback failed:', error);
  }
};

// Enhanced haptic feedback for card actions
const triggerActionHaptic = async (action: SwipeIndicator): Promise<void> => {
  try {
    if (!action) return;
    
    switch (action) {
      case 'like':
        // Double tap for more satisfying like feeling
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setTimeout(() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }, 100);
        break;
      case 'dislike':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'superlike':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        setTimeout(() => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }, 100);
        break;
    }
  } catch (error) {
    console.log('Enhanced haptic feedback failed:', error);
  }
};

function DiscoverContent() {
  // Debug logs removed to reduce console noise during data persistence testing

  const dropdownManager = useDropdownManager();
  const activeDropdown = dropdownManager?.activeDropdown || null;
  const setActiveDropdown = dropdownManager?.setActiveDropdown || (() => {});
  
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [isPremium, setIsPremium] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentIndexSv = useSharedValue(currentIndex);
  useEffect(() => { currentIndexSv.value = currentIndex; }, [currentIndex]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [swipeIndicator, setSwipeIndicator] = useState<SwipeIndicator | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCardExpanded, setIsCardExpanded] = useState(false);
  const [showMatchNotification, setShowMatchNotification] = useState(false);
  const [showPlaceNotification, setShowPlaceNotification] = useState(false);
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const [matchedProfile, setMatchedProfile] = useState<RoommateProfile | null>(null);
  const [isPlacePrioritized, setIsPlacePrioritized] = useState(false);
  const [isPlaceSaved, setIsPlaceSaved] = useState(false);
  const [isPremiumMode, setIsPremiumMode] = useState(false);
  
  // Track if component is mounted (for safe state updates)
  const isMounted = useRef(true);
  
  // Store ref to current indicator for animations
  const lastIndicatorRef = useRef<SwipeIndicator>(null);
  
  const { 
    profiles, 
    fetchProfiles, 
    likeProfile, 
    dislikeProfile, 
    superLikeProfile,
    resetSwipes,
    getFilteredProfiles,
    isLoading,
    error,
    roommates,
    getById
  } = useRoommateStore();
  
  const { searchFilters, updateSearchFilters } = usePreferencesStore();
  const { setPremiumStatus, isPremium: matchesPremium, setMatches: setLegacyMatches } = useMatchesStore();
  const { user: legacyUser } = useUserStore();
  const { user } = useSupabaseUserStore();
  const { createConversation } = useConversationsStore();
  
  // Import the consistent matches store for creating matches
  const supabaseMatchesStore = useSupabaseMatchesStore();
  
  // Set default filter based on user's onboarding goal on first load
  const [hasInitialized, setHasInitialized] = useState(false);
  
  useEffect(() => {
    if (hasInitialized || !user?.userRole) return;
    
    // Map user's onboarding goal to appropriate filter
    let defaultFilter: 'roommate' | 'place' = 'roommate';
    
    // Map user role from onboarding to discover filter
    switch (user.userRole) {
      case 'roommate_seeker':
        // User is looking for roommates/teammates → show roommates
        defaultFilter = 'roommate';
        break;
      case 'place_lister':
        // User has a place and wants roommates → show roommate cards (people looking for places)
        defaultFilter = 'roommate';
        break;
      default:
        // Default to looking for roommates/teammates
        defaultFilter = 'roommate';
    }
    
    // Prepare filter updates with user's onboarding data
    const filterUpdates: any = { lookingFor: defaultFilter };
    
    // Sync user's budget preferences to search filters if available
    if (user.budget && typeof user.budget.min === 'number' && typeof user.budget.max === 'number') {
      // Only sync if user has set a specific budget (not default "any" range)
      if (user.budget.min > 0 || user.budget.max < 3500) {
        filterUpdates.budget = {
          min: Math.max(0, user.budget.min), // Ensure min is not negative
          max: Math.min(3500, user.budget.max) // Ensure max doesn't exceed limit
        };
        console.log(`[DiscoverContent] Syncing user budget preferences: $${filterUpdates.budget.min}-${filterUpdates.budget.max}`);
      } else {
        console.log(`[DiscoverContent] User has "any" budget range (${user.budget.min}-${user.budget.max}), keeping default search filters`);
      }
    }
    
    // Sync user's location preferences if available
    if (user.location?.city && user.location?.state) {
      filterUpdates.location = [`${user.location.city}, ${user.location.state}`];
      console.log(`[DiscoverContent] Syncing user location preferences: ${user.location.city}, ${user.location.state}`);
    }
    
    logger.info('DiscoverScreen', `Setting default filter to '${defaultFilter}' based on user role: ${user.userRole}`);
    updateSearchFilters(filterUpdates);
    
    // Fetch profiles with the determined filter
    setTimeout(() => {
      console.log(`[DiscoverContent] Initial profile fetch with ${defaultFilter} filter and user preferences`);
      fetchProfiles(true); // isFilterChange = true
    }, 200);
    
    setHasInitialized(true);
  }, [user?.userRole, user?.budget, user?.location, hasInitialized]);
  
  // Refetch when searchFilters change (but not on initial load)
  useEffect(() => {
    if (!hasInitialized) return;
    
    logger.debug('DiscoverScreen', 'Filter changed to:', { lookingFor: searchFilters.lookingFor });
    fetchProfiles(true);
  }, [searchFilters.lookingFor, hasInitialized]);
  
  // Create Reanimated shared values
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const cardOpacity = useSharedValue(1);
  // UI-thread flag to hide bottom card during swipe
  const hideBottom = useSharedValue(false);
  
  // Log hideBottom changes
  useAnimatedReaction(
    () => hideBottom.value,
    (value) => {
      'worklet';
      // runOnJS(console.log)(`[SWIPE_DEBUG] hideBottom ->`, value);
    }
  );
  
  // Memoize filtered profiles to avoid unnecessary recalculations
  const filteredProfiles = useMemo(() => {
    const profiles = getFilteredProfiles();
    
    // Debug stack information (disabled to reduce console noise)
    const ENABLE_STACK_DEBUG = false; // Set to true to enable stack debugging
    if (ENABLE_STACK_DEBUG) {
      console.log('[DEBUG_STACK] ===== PROFILE STACK DEBUG =====');
      console.log(`[DEBUG_STACK] Total available profiles: ${profiles.length}`);
      console.log(`[DEBUG_STACK] Current filter: ${searchFilters.lookingFor}`);
      console.log(`[DEBUG_STACK] Profiles in stack:`, profiles.map(p => ({
        name: p.name,
        id: p.id,
        hasPlace: p.hasPlace,
        matchScenario: p.matchScenario || 'none'
      })));
      console.log('[DEBUG_STACK] =====================================');
    }
    
    return profiles;
  }, [getFilteredProfiles, searchFilters]);
  
  // Add state for tracking completed animations
  const [animationCompleted, setAnimationCompleted] = useState<SwipeIndicator | null>(null);
  
  const router = useRouter();
  
  // Set up component lifecycle and initialize mock data
  useEffect(() => {
    const initialize = async () => {
    fetchProfiles();
    
    // Initialize mock data for testing in dev mode
    if (__DEV__) {
        await initializeMockData(isPremiumMode);
    }
    };
    
    initialize();
    
    // Create a local flag for checking if component is mounted
    // instead of using a ref that gets passed to worklets
    let isComponentMounted = true;
    
    // Track component lifecycle
    isMounted.current = true;
    
    return () => {
      // Clean up and mark as unmounted
      isMounted.current = false;
      isComponentMounted = false;
      
      // Cancel any active animations
      cancelAnimation(translateX);
      cancelAnimation(translateY);
      cancelAnimation(scale);
      cancelAnimation(cardOpacity);
    };
  }, [fetchProfiles, isPremiumMode]);


  
  // Toggle premium mode for testing
  const togglePremiumMode = useCallback(() => {
    const newPremiumMode = !isPremiumMode;
    setIsPremiumMode(newPremiumMode);
    setPremiumStatus(newPremiumMode);
    
    // Reinitialize mock data with new premium status
    if (__DEV__) {
      initializeMockData(newPremiumMode).catch(console.error);
    }
  }, [isPremiumMode, setPremiumStatus]);
  
  // Function to close match notification
  const closeMatchNotification = useCallback(() => {
    console.log('[DISCOVER] Closing match notification');
    
    // Add haptic feedback
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    
    // Hide the notification and clear match data immediately
    setShowMatchNotification(false);
    setCurrentMatch(null);
    setMatchedProfile(null);
  }, []);
  
  // Function to close place notification
  const closePlaceNotification = useCallback(() => {
    console.log('[DISCOVER] Closing place notification');
    
    // Add haptic feedback
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    
    // Hide the notification and clear place data immediately
    setShowPlaceNotification(false);
    setMatchedProfile(null);
    setIsPlacePrioritized(false);
  }, []);
  
  // Function to handle viewing place details
  const handleViewPlaceDetails = useCallback(() => {
    if (!matchedProfile) return;
    
    console.log('[DISCOVER] Viewing place details:', matchedProfile.id);
    
    // Add haptic feedback
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    
    // Store profile ID before clearing state
    const profileId = matchedProfile.id;
    
    // Close the notification and clear data immediately
    setShowPlaceNotification(false);
    setMatchedProfile(null);
    
    // Navigate to place detail screen
    router.push(`/place-detail?id=${profileId}`);
  }, [matchedProfile, router]);
  
  // Function to handle messaging a match
  const handleMessageMatch = useCallback(async () => {
    if (!currentMatch) return;
    
    console.log('[DISCOVER] Navigating to conversation lobby for match:', currentMatch.id);
    
    // Add haptic feedback
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    
    // Store match ID before clearing state
    const matchId = currentMatch.id;
    
    // Close the notification and clear match data immediately
    setShowMatchNotification(false);
    setCurrentMatch(null);
    setMatchedProfile(null);
    
    // CRITICAL FIX: Don't auto-create conversation! 
    // Just navigate to the match-based conversation screen.
    // The conversation will be created only when the first message is actually sent.
    console.log('[DISCOVER] Navigating to match lobby without auto-creating conversation');
    
    // Navigate directly to the match-based conversation ID
    // This will show the message lobby but won't create a conversation until first message
    NavigationService.goToConversation(matchId, { 
      source: 'newMatch', 
      matchId: matchId 
    });
  }, [currentMatch, matchedProfile]);
  
  
  // Handle swipe completion
  const handleSwipeComplete = (direction: SwipeDirection, index: number) => {
    try {
      console.log(`[DEBUG_SWIPE] ===== SWIPE DETECTED =====`);
      console.log(`[DEBUG_SWIPE] Direction: ${direction}, Index: ${index}`);
      console.log(`[DEBUG_SWIPE] Is card expanded: ${isCardExpanded}`);
      
      // Don't process swipes if card is expanded
      if (isCardExpanded) {
        console.log(`[DEBUG_SWIPE] Card is expanded, ignoring swipe`);
        return;
      }
      
      const profile = filteredProfiles[index];
      console.log(`[DEBUG_SWIPE] Profile at index ${index}:`, profile ? {
        name: profile.name,
        id: profile.id,
        hasPlace: profile.hasPlace,
        matchScenario: profile.matchScenario
      } : 'undefined');
      
      if (!profile) {
        console.log(`[DEBUG_SWIPE] No profile found at index ${index}`);
        return;
      }
      
      // Set animation completed for visual feedback
      setAnimationCompleted(direction === 'left' ? 'dislike' : direction === 'right' ? 'like' : 'superlike');
      
      let action: SwipeAction;
      let indicator: SwipeIndicator;
      
      if (direction === 'right') {
        action = 'like';
        indicator = 'like';
        likeProfile(profile.id);
      } else if (direction === 'left') {
        action = 'pass';
        indicator = 'dislike';
        dislikeProfile(profile.id);
      } else if (direction === 'up') {
        action = 'superLike';
        indicator = 'superlike';
        superLikeProfile(profile.id);
      } else {
        return;
      }
      
      console.log(`[DEBUG_SWIPE] Action: ${action}, Indicator: ${indicator}`);
      
      // Set the swipe indicator for animation
      setSwipeIndicator(indicator);
      
      // Check if this is a place listing - if so, don't show match notification
      const isPlaceListing = profile.hasPlace === true;
      console.log(`[DEBUG_SWIPE] Is place listing: ${isPlaceListing}`);
      
      // Validate that the profile type matches the current filter
      const isFilterMatch = (searchFilters.lookingFor === 'place' && isPlaceListing) || 
                            (searchFilters.lookingFor === 'roommate' && !isPlaceListing) ||
                            (searchFilters.lookingFor === 'both'); // Add support for 'both' filter
      console.log(`[DEBUG_SWIPE] Filter match: ${isFilterMatch} (filter: ${searchFilters.lookingFor})`);
      console.log(`[DEBUG_SWIPE] DEV mode: ${__DEV__}, Match scenario: ${profile.matchScenario || 'none'}`);
      console.log(`[DEBUG_SWIPE] Checking match conditions...`);
      
      // For place listings, show a saved notification instead of a match
      if (isPlaceListing && (direction === 'right' || direction === 'up') && isFilterMatch) {
        console.log(`[PLACE] Saved place listing: ${profile.name}`);
        
        // Trigger haptic feedback
        triggerActionHaptic(indicator);
        
        // Add a small delay before showing the saved place notification
        setTimeout(() => {
          setMatchedProfile(profile);
          setIsPlacePrioritized(direction === 'up');
          setShowPlaceNotification(true);
        }, 500);
      }
      // Handle match creation based on profile scenario - only for roommate profiles
      else if (__DEV__ && profile.matchScenario && !isPlaceListing && isFilterMatch) {
        console.log(`[DEBUG_MATCH] ===== MATCH DEBUG =====`);
        console.log(`[DEBUG_MATCH] Profile: ${profile.name} (${profile.id})`);
        console.log(`[DEBUG_MATCH] Swiped: ${action} (${direction})`);
        console.log(`[DEBUG_MATCH] Match scenario: ${profile.matchScenario}`);
        console.log(`[DEBUG_MATCH] Is place listing: ${isPlaceListing}`);
        console.log(`[DEBUG_MATCH] Filter match: ${isFilterMatch}`);
        console.log(`[DEBUG_MATCH] Processing ${action} on profile with scenario: ${profile.matchScenario}`);
        
        // Force a match based on the scenario
        let match: Match | null = null;
        
        if (action === 'like' || action === 'superLike') {
          // Create a match object
          const matchId = `match-${Date.now()}`;
          
          // Determine the appropriate match status based on the scenario
          let matchStatus: MatchStatus = 'matched';
          if (profile.matchScenario === 'superMatch') {
            matchStatus = 'superMatched';
          } else if (profile.matchScenario === 'mixedMatch') {
            matchStatus = 'mixedMatched';
          }
          
          // Determine the appropriate user2Action based on the scenario
          let user2Action: SwipeAction = 'like';
          if (profile.matchScenario === 'superMatch') {
            user2Action = 'superLike';
          } else if (profile.matchScenario === 'mixedMatch') {
            // For mixed matches, the other user (user2) is the one who super liked
            user2Action = 'superLike';
          }
          
          match = {
            id: matchId,
            user1Id: 'currentUser',
            user2Id: profile.id,
            user1Action: action,
            user2Action: user2Action,
            status: matchStatus,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            hasRead: false
          };
          
          // Add the match to both stores for consistency during development
          // Legacy store (for backward compatibility)
          const matchesStore = useMatchesStore.getState();
          const currentMatches = matchesStore.getMatches();
          matchesStore.setMatches([...currentMatches, match]);
          
          // Primary store (used by matches screen)
          const supabaseStore = supabaseMatchesStore;
          const currentSupabaseMatches = supabaseStore.getMatches();
          // Convert to supabase format and add
          const supabaseMatch: import('../../store/supabaseMatchesStore').Match = {
            id: match.id,
            user1Id: match.user1Id,
            user2Id: match.user2Id,
            user1Action: (match.user1Action === 'superLike' ? 'superLike' : 'like') as 'like' | 'superLike',
            user2Action: (match.user2Action === 'superLike' ? 'superLike' : 'like') as 'like' | 'superLike',
            status: match.status,
            conversationId: match.conversationId,
            hasRead: match.hasRead,
            createdAt: new Date(match.createdAt).toISOString(),
            updatedAt: new Date(match.updatedAt).toISOString()
          };
          // Add to matches using the addMatch method
          supabaseStore.addMatch(supabaseMatch);
          
          console.log(`[DEBUG_MATCH] Match added to both stores - Legacy: ${currentMatches.length + 1}, Supabase: ${currentSupabaseMatches.length + 1}`);
          
          console.log(`[DEBUG_MATCH] Match created! Type: ${matchStatus}`);
          console.log(`[DEBUG_MATCH] Match object:`, match);
          console.log(`[DEBUG_MATCH] Setting notification in 500ms...`);
          
          // Trigger haptic feedback for match
          triggerActionHaptic(indicator);
          
          // Add a small delay before showing the match notification
          // This ensures the card animation completes first
          setTimeout(() => {
            console.log(`[DEBUG_MATCH] Showing match notification now!`);
            // Show the match notification
            setCurrentMatch(match);
            setMatchedProfile(profile);
            setShowMatchNotification(true);
          }, 500);
        }
        else {
          // DEBUG: Profile doesn't have match scenario or doesn't meet criteria
          if (__DEV__) {
            console.log(`[DEBUG_MATCH] ===== NO MATCH =====`);
            console.log(`[DEBUG_MATCH] Profile: ${profile.name} (${profile.id})`);
            console.log(`[DEBUG_MATCH] Swiped: ${action} (${direction})`);
            console.log(`[DEBUG_MATCH] Has match scenario: ${!!profile.matchScenario} (${profile.matchScenario || 'none'})`);
            console.log(`[DEBUG_MATCH] Is place listing: ${isPlaceListing}`);
            console.log(`[DEBUG_MATCH] Filter match: ${isFilterMatch}`);
            console.log(`[DEBUG_MATCH] Dev mode: ${__DEV__}`);
            console.log(`[DEBUG_MATCH] Action type: ${action} (like/superLike needed for match)`);
            console.log('[DEBUG_MATCH] =====================');
          }
        }
      }
      
      // Check if this is the last profile
      const isLastProfile = index === filteredProfiles.length - 1;
      
      // Only update the index; animation/state resets are handled in effect below
      setCurrentIndex(prev => prev + 1);
    } catch (error) {
      console.error('[SWIPE_ERROR] handleSwipeComplete crashed:', error);
      Alert.alert('Swipe Complete Error', String(error));
    }
  };
  
  // After swipe completes and index updates, reset shared values and transition states
  useEffect(() => {
    // Clear reanimated values to default
    translateX.value = 0;
    translateY.value = 0;
    scale.value = 1;
    cardOpacity.value = 1;
    // Reset JS-side flags
    setIsTransitioning(false);
    setSwipeIndicator(null);
    setAnimationCompleted(null);
    // Reset bottom hide flag on UI thread
    runOnUI(() => {
      'worklet';
      hideBottom.value = false;
    })();
    // Debug log removed to reduce console noise during data persistence testing
  }, [currentIndex]);
  
  // Debug logging removed to reduce console noise during data persistence testing
  
  // Function to update the swipe indicator
  const updateIndicator = useCallback((indicator: SwipeIndicator) => {
    // Don't update indicator if card is expanded
    if (isCardExpanded) {
      setSwipeIndicator(null);
          return;
        }
        
    setSwipeIndicator(indicator);
  }, [isCardExpanded]);
  
  // Create pan gesture handler for swipe
  const panGesture = Gesture.Pan()
    .maxPointers(1) // Ensure only one finger is tracked
    .onStart(() => {
      'worklet';
      // Don't start a new gesture if we're already in transition or if a card is expanded
      if (isTransitioning || isCardExpanded) return false;
      
      // Reset indicators on gesture start
      runOnJS(updateIndicator)(null);
      
      return true;
    })
    .onUpdate((event) => {
      'worklet';
      // SWIPE_DEBUG: onUpdate
      // runOnJS(console.log)(`[SWIPE_DEBUG onUpdate] tx=${translateX.value.toFixed(1)}, ty=${translateY.value.toFixed(1)}`);
      // Don't update if transitioning or if a card is expanded
      if (isTransitioning || isCardExpanded) return;
      
      // Update position based on gesture
      translateX.value = event.translationX;
      translateY.value = event.translationY * 0.7; // Increased from 0.5 to 0.7 for more responsive vertical movement
      
      // Calculate how far the card has moved as a percentage
      const xProgress = Math.abs(translateX.value) / SWIPE_THRESHOLD;
      const yProgress = Math.abs(translateY.value) / Math.abs(SUPER_LIKE_THRESHOLD);
      const swipeProgress = Math.max(xProgress, yProgress);
      
      // SWIPE_DEBUG: log translation and swipeProgress
      // runOnJS(console.log)(`[SWIPE_DEBUG] tx=${translateX.value.toFixed(1)}, ty=${translateY.value.toFixed(1)}, swipeProgress=${swipeProgress.toFixed(2)}`);
      
      // Update scale based on distance
      scale.value = 1 + (swipeProgress * 0.05); // Max scale of 1.05x at threshold
      
      // Determine swipe direction for indicator - wrap in try/catch for safety
      try {
        if (translateX.value > 50) {
          runOnJS(updateIndicator)('like');
        } else if (translateX.value < -50) {
          runOnJS(updateIndicator)('dislike');
        } else if (translateY.value < -35) { // Reduced from -50 to -35 to show super like indicator sooner
          runOnJS(updateIndicator)('superlike');
        } else {
          runOnJS(updateIndicator)(null);
        }
      } catch (error) {
        // Silently handle any errors in the indicator update
        console.log('Error updating indicator:', error);
      }
    })
    .onEnd((event) => {
      'worklet';
      try {
        // Store values locally to avoid race conditions
        const currentX = translateX.value;
        const currentY = translateY.value;
        const localCurrentIndex = currentIndexSv.value; // Capture current index
        
        // SWIPE_DEBUG: log gesture data
        // runOnJS(console.log)(`[SWIPE_DEBUG] onEnd: localIndex=${localCurrentIndex}, X=${currentX}, Y=${currentY}`);
        
        // Handle swipe right
        if (currentX > SWIPE_THRESHOLD) {
          // SWIPE_DEBUG: RIGHT threshold
          // runOnJS(console.log)('[SWIPE_DEBUG] RIGHT threshold met');
          runOnJS(setIsTransitioning)(true);
          runOnJS(triggerActionHaptic)('like');
          hideBottom.value = true;
          translateX.value = withTiming(width * 1.5, TIMING_CONFIG, (finished) => {
            'worklet';
            if (finished) runOnJS(handleSwipeComplete)('right', localCurrentIndex);
          });
          return;
        }
    
        // Handle swipe left
        if (currentX < -SWIPE_THRESHOLD) {
          // SWIPE_DEBUG: LEFT threshold
          // runOnJS(console.log)('[SWIPE_DEBUG] LEFT threshold met');
          runOnJS(setIsTransitioning)(true);
          runOnJS(triggerActionHaptic)('dislike');
          hideBottom.value = true;
          translateX.value = withTiming(-width * 1.5, TIMING_CONFIG, (finished) => {
            'worklet';
            if (finished) runOnJS(handleSwipeComplete)('left', localCurrentIndex);
          });
          return;
        }
        
        // Handle super like (swipe up)
        if (currentY < SUPER_LIKE_THRESHOLD) {
          // SWIPE_DEBUG: SUPERLIKE threshold
          // runOnJS(console.log)('[SWIPE_DEBUG] SUPERLIKE threshold met');
          runOnJS(setIsTransitioning)(true);
          runOnJS(triggerActionHaptic)('superlike');
          hideBottom.value = true;
          translateY.value = withTiming(-height, TIMING_CONFIG, (finished) => {
            'worklet';
            if (finished) runOnJS(handleSwipeComplete)('up', localCurrentIndex);
          });
          return;
        }
        
        // If we haven't hit any thresholds, return to center with spring animation
        // SWIPE_DEBUG: no threshold, resetting
        // runOnJS(console.log)('[SWIPE_DEBUG] no threshold met, resetting animation');
        translateX.value = withSpring(0, SPRING_CONFIG);
        translateY.value = withSpring(0, SPRING_CONFIG);
        scale.value = withSpring(1, SPRING_CONFIG);
        hideBottom.value = false;
        
        // Clear the indicator
        runOnJS(updateIndicator)(null);
      } catch (error) {
        // runOnJS(console.error)('[SWIPE_DEBUG] onEnd error:', error);
        Alert.alert('Gesture Error', String(error));
        console.error('Error in gesture onEnd:', error);
        
        // Reset animations on error
        translateX.value = withSpring(0, SPRING_CONFIG);
        translateY.value = withSpring(0, SPRING_CONFIG);
        scale.value = withSpring(1, SPRING_CONFIG);
        cardOpacity.value = withSpring(1, SPRING_CONFIG);
        
        // Reset states
        runOnJS(setIsTransitioning)(false);
        runOnJS(updateIndicator)(null);
      }
    });
  
  // Handle wraparound of cards
  useEffect(() => {
    if (currentIndex >= filteredProfiles.length && filteredProfiles.length > 0) {
      // Reset index when we run out of profiles
      console.log('Reached end of profiles, resetting to index 0');
      
      // First ensure all animations and indicators are cleared
      // to prevent flickering when transitioning to empty state
      if (translateX) translateX.value = 0;
      if (translateY) translateY.value = 0;
      if (scale) scale.value = 1;
      if (cardOpacity) cardOpacity.value = 1;
      
      // Clear any indicators that might be showing
      setSwipeIndicator(null);
      setAnimationCompleted(null);
      if (lastIndicatorRef.current) lastIndicatorRef.current = null;
      
      // Reset transition state
      setIsTransitioning(false);
      
      // Now reset the index
      setCurrentIndex(0);
    }
  }, [currentIndex, filteredProfiles.length]);
  
  // Handler for refreshing profiles
  const handleRefreshProfiles = useCallback(async () => {
    if (isRefreshing) return;
    
    try {
      setIsRefreshing(true);
      setIsTransitioning(true);
      
      // Reset animation values
      translateX.value = 0;
      translateY.value = 0;
      scale.value = 1;
      cardOpacity.value = 1;
      
      // Reset index
      setCurrentIndex(0);
      
      // Fetch new profiles
      await fetchProfiles();
      
      // Add a fallback timeout to ensure UI updates even if fetch takes too long
      const timeoutId = setTimeout(() => {
        if (isMounted.current) {
          setIsTransitioning(false);
          setIsRefreshing(false);
        }
      }, 3000);
      
      // Store timeout ID for cleanup
      if (global._timeoutIds) {
        global._timeoutIds.push(timeoutId);
      }
      
    } catch (error) {
      console.error('Error refreshing profiles:', error);
    } finally {
      setIsTransitioning(false);
      setIsRefreshing(false);
    }
  }, [fetchProfiles, isRefreshing]);
  
  // Handler for resetting swipes
  const handleResetSwipes = useCallback(async () => {
    if (isRefreshing) return;
    
    try {
      setIsRefreshing(true);
      setIsTransitioning(true);
    
      // Reset animation values
      translateX.value = 0;
      translateY.value = 0;
      scale.value = 1;
      cardOpacity.value = 1;
      
      // Reset index
      setCurrentIndex(0);
      
      // Reset swipes in store
      await resetSwipes();
      
    } catch (error) {
      console.error('Error resetting swipes:', error);
    } finally {
      setIsTransitioning(false);
      setIsRefreshing(false);
    }
  }, [resetSwipes, isRefreshing]);
  
  // Create animated styles for the card
  const cardStyle = useAnimatedStyle(() => {
    // Calculate rotation based on horizontal position
    const rotationDegrees = (translateX.value / width) * ROTATION_FACTOR; // Re-enable rotation
    
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotationDegrees}deg` }, // Re-enable rotation
        { scale: scale.value }, // Re-enable scale
        { perspective: 1000 }, // Add perspective for more natural 3D feel
      ],
      opacity: cardOpacity.value,
      // Dynamic shadow based on scale/lift (re-enabled)
      shadowOpacity: interpolate(
        scale.value,
        [1, 1.05],
        [0.1, 0.3],
        Extrapolate.CLAMP
      ),
      shadowRadius: interpolate(
        scale.value,
        [1, 1.05],
        [5, 15],
        Extrapolate.CLAMP
      ),
      shadowOffset: {
        height: interpolate(
          scale.value,
          [1, 1.05],
          [2, 8],
          Extrapolate.CLAMP
        ),
        width: 0
      },
      shadowColor: '#000',
      elevation: interpolate(
        scale.value,
        [1, 1.05],
        [1, 5],
        Extrapolate.CLAMP
      ),
    };
  });
  
  // Create animated styles for like indicator
  const likeIndicatorStyle = useAnimatedStyle(() => {
    return {
      opacity: translateX.value > 0 
        ? interpolate(
            translateX.value,
            [0, SWIPE_THRESHOLD / 2],
            [0, 1],
            Extrapolate.CLAMP
          )
        : 0,
      transform: [
        { scale: translateX.value > 0 
          ? interpolate(
              translateX.value,
              [0, SWIPE_THRESHOLD],
              [0.5, 1],
              Extrapolate.CLAMP
            )
          : 0.5 
        },
      ],
    };
  });
  
  // Create animated styles for dislike indicator
  const dislikeIndicatorStyle = useAnimatedStyle(() => {
    return {
      opacity: translateX.value < 0 
        ? interpolate(
            -translateX.value,
            [0, SWIPE_THRESHOLD / 2],
            [0, 1],
            Extrapolate.CLAMP
          )
        : 0,
      transform: [
        { scale: translateX.value < 0 
          ? interpolate(
              -translateX.value,
              [0, SWIPE_THRESHOLD],
              [0.5, 1],
              Extrapolate.CLAMP
            )
          : 0.5 
        },
      ],
    };
  });
  
  // Create animated styles for super like indicator
  const superLikeIndicatorStyle = useAnimatedStyle(() => {
    return {
      opacity: translateY.value < 0 
        ? interpolate(
            -translateY.value,
            [0, -SUPER_LIKE_THRESHOLD / 2.5],
            [0, 1],
            Extrapolate.CLAMP
          )
        : 0,
      transform: [
        { scale: translateY.value < 0 
          ? interpolate(
              -translateY.value,
              [0, -SUPER_LIKE_THRESHOLD],
              [0.5, 1],
              Extrapolate.CLAMP
            )
          : 0.5 
        },
      ],
    };
  });

  // Create animated style to hide bottom card
  const bottomHideStyle = useAnimatedStyle(() => ({ opacity: hideBottom.value ? 0 : 1 }));

  // Create base styles for the control buttons
  const baseButtonStyle = {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  };

  // Create animated styles for the control buttons that respond to swipe
  const dislikeButtonStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: translateX.value < 0 
        ? interpolateColor(
            -translateX.value,
            [0, SWIPE_THRESHOLD],
            ['#FFFFFF', '#FECACA']
          )
        : '#FFFFFF',
      transform: [
        { scale: translateX.value < 0 
          ? interpolate(
              -translateX.value,
              [0, SWIPE_THRESHOLD],
              [1, 1.1],
              Extrapolate.CLAMP
            )
          : 1 
        },
      ],
    };
  });

  const likeButtonStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: translateX.value > 0 
        ? interpolateColor(
            translateX.value,
            [0, SWIPE_THRESHOLD],
            ['#FFFFFF', '#E0E7FF']
          )
        : '#FFFFFF',
      transform: [
        { scale: translateX.value > 0 
          ? interpolate(
              translateX.value,
              [0, SWIPE_THRESHOLD],
              [1, 1.1],
              Extrapolate.CLAMP
            )
          : 1 
        },
      ],
    };
  });

  const superLikeButtonStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: translateY.value < 0 
        ? interpolateColor(
            -translateY.value,
            [0, -SUPER_LIKE_THRESHOLD],
            ['#FCD34D', '#F59E0B']
          )
        : '#FCD34D',
      transform: [
        { scale: translateY.value < 0 
          ? interpolate(
              -translateY.value,
              [0, -SUPER_LIKE_THRESHOLD],
              [1, 1.1],
              Extrapolate.CLAMP
            )
          : 1 
        },
      ],
    };
  });
  
  // Abstracted swipe action function
  const swipeAction = useCallback((direction: SwipeDirection, indicator: SwipeIndicator) => {
    if (isTransitioning || !isMounted.current || !indicator) return;
    
    const localCurrentIndex = currentIndex; // Capture index
    if (localCurrentIndex >= filteredProfiles.length || filteredProfiles.length === 0) {
      console.log('No current profile, ignoring swipe action');
      return;
    }
    
    try {
      console.log(`Starting ${direction} swipe with ${indicator} indicator`);
      runOnJS(setIsTransitioning)(true);
      runOnJS(triggerActionHaptic)(indicator);
      runOnJS(updateIndicator)(indicator);
      
      const wasMounted = isMounted.current;
      
      const animationTimeoutId = setTimeout(() => {
        if (!wasMounted || !isMounted.current) return;
        
        cardOpacity.value = withTiming(0, { duration: 80 }, (finished) => {
          'worklet';
          if (!finished || !wasMounted || !isMounted.current) return;
          
          setAnimationCompleted(indicator);
          
          const positionConfig = { duration: TIMING_CONFIG.duration - 20 };
          const animationCompleteCallback = (finished: boolean | undefined) => {
            'worklet';
            if (finished && wasMounted && isMounted.current) {
              handleSwipeComplete(direction, localCurrentIndex);
            }
          };

          if (direction === 'left') {
            translateX.value = withTiming(-width * 1.5, positionConfig, animationCompleteCallback);
          } else if (direction === 'right') {
            translateX.value = withTiming(width * 1.5, positionConfig, animationCompleteCallback);
          } else if (direction === 'up') {
            translateY.value = withTiming(-height, positionConfig, animationCompleteCallback);
          }
        });
      }, 20); 
      
      // Store timeout ID for cleanup
      const timeoutIds = global._timeoutIds || [];
      timeoutIds.push(animationTimeoutId);
      global._timeoutIds = timeoutIds;
      
    } catch (error) {
      console.error('Error in swipe action:', error);
      runOnJS(setIsTransitioning)(false);
      runOnJS(updateIndicator)(null);
      setAnimationCompleted(null);
      
      // Clean up any timeouts
      if (global._timeoutIds && global._timeoutIds.length > 0) {
        global._timeoutIds.forEach(id => clearTimeout(id));
        global._timeoutIds = [];
      }
    }
  }, [isTransitioning, handleSwipeComplete, width, height, currentIndex, filteredProfiles, updateIndicator]); // Added updateIndicator dependency
  
  // Button handler for left swipe
  const swipeLeft = useCallback(() => {
    swipeAction('left', 'dislike');
  }, [swipeAction]);
  
  // Button handler for right swipe
  const swipeRight = useCallback(() => {
    swipeAction('right', 'like');
  }, [swipeAction]);
  
  // Button handler for super like
  const superLike = useCallback(() => {
    swipeAction('up', 'superlike');
  }, [swipeAction]);
  
  // Animation completion handler
  const handleAnimationComplete = useCallback(() => {
    console.log('Animation completed, cleaning up indicator states');
    
    // Reset animation completed state after animation finishes
    setAnimationCompleted(null);
    
    // Immediately clear the swipe indicator to ensure it's hidden
    setSwipeIndicator(null);
    if (lastIndicatorRef.current) lastIndicatorRef.current = null;
  }, [isTransitioning]);
  
  // Render helper functions for different states
  const renderLoading = () => (
      <View className="flex-1 bg-gray-50 pb-2.5 justify-center items-center">
      <BoltBadge style={{ top: 60, right: 280 }} />
      <ActivityIndicator size="large" color="#4F46E5" />
      <Text className="font-[Poppins-Medium] text-base text-gray-600 mt-4">
          Loading profiles...
        </Text>
      </View>
    );

  const renderError = () => (
      <View className="flex-1 bg-gray-50 pb-2.5 justify-center items-center">
        <BoltBadge style={{ top: 60, right: 280 }} />
        <Text className="font-[Poppins-Medium] text-base text-red-400">
          {error}
        </Text>
      </View>
    );
  
  const renderEmpty = () => (
    <View className="flex-1 bg-gray-50 pb-2.5">
      <StatusBar barStyle="dark-content" />
      
      {/* Bolt Badge - positioned next to roomies logo */}
      <BoltBadge style={{ top: 65, right: 220 }} />
      
      {/* Use the same TabScreenHeader as the main view */}
      <TabScreenHeader rightContent={headerRightContent} />
      
      {/* Empty state content */}
      <View className="flex-1 justify-center items-center px-6">
        <Text className="font-[Poppins-Medium] text-xl text-gray-700 mb-2">
          No more profiles to show
        </Text>
        <Text className="font-[Poppins-Regular] text-base text-gray-500 text-center mb-6">
          {searchFilters.lookingFor === 'place' 
            ? "We couldn't find any place listings that match your filters. Try refreshing or adjusting your filters."
            : "We couldn't find any roommates that match your filters. Try refreshing or adjusting your filters."}
        </Text>
        <View className="flex-row justify-center mt-4 gap-3">
          <TouchableOpacity 
            className={`bg-indigo-600 rounded-xl py-3 px-6 ${isRefreshing ? 'opacity-50' : ''}`}
            onPress={handleRefreshProfiles}
            disabled={isRefreshing}
          >
            <Text className="font-[Poppins-Medium] text-sm text-white">
              Refresh Profiles
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className={`bg-emerald-500 rounded-xl py-3 px-6 ${isRefreshing ? 'opacity-50' : ''}`}
            onPress={handleResetSwipes}
            disabled={isRefreshing}
          >
            <Text className="font-[Poppins-Medium] text-sm text-white">
              Reset Swipes
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Add a button to switch filter type */}
        <TouchableOpacity 
          className="mt-6 bg-gray-200 rounded-xl py-3 px-6"
          onPress={() => {
            // Switch the filter type
            const newLookingFor = searchFilters.lookingFor === 'place' ? 'roommate' : 'place';
            console.log(`[EmptyState] Switching filter from ${searchFilters.lookingFor} to ${newLookingFor}`);
            
            // Update the filter
            updateSearchFilters({ lookingFor: newLookingFor });
            
            // Force a refresh
            setTimeout(() => {
              fetchProfiles(true);
            }, 100);
          }}
        >
          <Text className="font-[Poppins-Medium] text-sm text-gray-700">
            {searchFilters.lookingFor === 'place' 
              ? "Switch to Roommate Profiles" 
              : "Switch to Place Listings"}
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Filter Modal */}
      <FilterModal 
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
      />
    </View>
  );
  
  // Prepare cards to render - Restoring stacked approach again
  const profilesToRender = useMemo(() => {
      // Render current + next 3 cards, reversed for stacking
      const profiles = filteredProfiles.slice(currentIndex, currentIndex + 3).reverse();
      // Debug logging reduced to minimize console spam during profile interactions
      return profiles;
  }, [filteredProfiles, currentIndex]);
  
  // Function to render individual card in the stack - Restored
  const renderCard = (profile: RoommateProfile, index: number) => {
    // Debug logging reduced to minimize console spam during profile interactions
    
    // Safety check for profile data
    if (!profile.name || !profile.id) {
      console.warn(`[CARD RENDER] Invalid profile data at index ${index}:`, profile);
      return null;
    }
    
    const isTopCard = index === profilesToRender.length - 1;
    // removed shouldHideBottom: now driven by hideBottom SV
    const styleForCard = isTopCard 
      ? cardStyle // Main animated style for top card
      : { 
          // Static style for cards underneath
          opacity: 1, 
          transform: [{ scale: 0.95 }], // Slightly smaller
          // Add basic shadow for consistency if needed
          shadowOpacity: 0.05,
          shadowRadius: 3,
          shadowOffset: { height: 1, width: 0 },
          shadowColor: '#000',
          elevation: 0.5,
        }; 
    
    const CardComponent = profile.hasPlace ? PlaceDetailCard : RoommateDetailCard;

    // Pass props - Add dummy swipe handlers back to satisfy TS types
    const commonProps = {
        expanded: isCardExpanded,
        onExpandedChange: setIsCardExpanded,
        id: profile.id, 
        onSwipeLeft: () => {}, 
        onSwipeRight: () => {},
        onSuperLike: () => {},
    };

    // Card Content View
    const cardContent = (
        <Animated.View
            key={profile.id} 
            className="absolute w-full h-full"
            style={[
                { zIndex: index }, 
                styleForCard, // Apply dynamic or static style
            ]}
        >
            {/* Context-aware card type selection based on current filter */}
            {searchFilters.lookingFor === 'place' && profile.hasPlace ? (
                <PlaceDetailCard place={profile} {...commonProps} />
            ) : (
                <RoommateDetailCard profile={profile} {...commonProps} />
            )}
        </Animated.View>
    );

    // Wrap ONLY the top card with the GestureDetector
    if (isTopCard) {
        return (
            <GestureDetector key={profile.id} gesture={panGesture}>
                {cardContent}
            </GestureDetector>
        );
    }

    // Render lower cards without the gesture detector
    return cardContent;
  };
  
  // Helper function to get current filter display text
  const getCurrentFilterText = () => {
    // Location and budget text removed - no longer displayed next to filter button
    return null;
  };

  // Define the right side content for the header
  const headerRightContent = (
    <View className="flex-row items-center gap-3">
      {/* Current filter display */}
      {getCurrentFilterText() && (
        <Text className="font-[Poppins-Bold] text-base text-gray-900 tracking-wide">
          {getCurrentFilterText()}
        </Text>
      )}
      
      {/* Filter button */}
      <TouchableOpacity 
        className="bg-indigo-50 rounded-full p-2 w-10 h-10 items-center justify-center"
        onPress={() => setFilterModalVisible(true)}
      >
        <SlidersVertical size={20} color="#4F46E5" />
      </TouchableOpacity>
    </View>
  );
  
  // State Checks
  if (isLoading && !isRefreshing) return renderLoading();
  if (error) return renderError();
  if (!filteredProfiles || filteredProfiles.length === 0) return renderEmpty();

  return (
    <View className="flex-1 bg-gray-50 pb-2.5">
      <StatusBar barStyle="dark-content" />
      
      {/* Bolt Badge - positioned next to roomies logo */}
      <BoltBadge style={{ top: 65, right: 220 }} />
      
      {/* Use the new TabScreenHeader */}
      <TabScreenHeader rightContent={headerRightContent} />
      
      {/* Card Container - Back to stacked rendering */}
      <View className="flex-1 items-center justify-center overflow-hidden">
        {/* Render the stack */} 
        {profilesToRender.map((profile, index) => renderCard(profile, index))}
        
        {/* Keep Fixed position indicators - Conditionally render based on stack */} 
        {profilesToRender.length > 0 && (
          <>
            {/* Like Indicator Overlay - Fixed position */}
            <View 
              style={{ 
                position: 'absolute', 
                bottom: height * 0.5,
                right: width / 9,
                zIndex: 30,
                pointerEvents: 'none',
              }}
            >
              <AnimatedIndicator
                isVisible={swipeIndicator === 'like'}
                isActive={animationCompleted === 'like'}
                backgroundColor="transparent"
                onAnimationComplete={handleAnimationComplete}
              >
                <Image 
                  source={require('../../assets/images/YES.png')} 
                  style={{ width: 100, height: 100 }}
                  resizeMode="contain" 
                />
              </AnimatedIndicator>
            </View>
            
            <View 
              style={{ 
                position: 'absolute', 
                bottom: height * 0.5,
                left: width / 9,
                zIndex: 30,
                pointerEvents: 'none',
              }}
            >
              <AnimatedIndicator
                isVisible={swipeIndicator === 'dislike'}
                isActive={animationCompleted === 'dislike'}
                backgroundColor="transparent"
                onAnimationComplete={handleAnimationComplete}
              >
                <Image 
                  source={require('../../assets/images/PASS.png')} 
                  style={{ width: 100, height: 100 }}
                  resizeMode="contain" 
                />
              </AnimatedIndicator>
            </View>
            
            <View 
              style={{ 
                position: 'absolute', 
                bottom: height * 0.5,
                left: width / 2 - 75,
                zIndex: 30,
                pointerEvents: 'none',
              }}
            >
              <AnimatedIndicator
                isVisible={swipeIndicator === 'superlike'}
                isActive={animationCompleted === 'superlike'}
                backgroundColor="transparent"
                onAnimationComplete={handleAnimationComplete}
              >
                <Image 
                  source={require('../../assets/images/SUPER.png')} 
                  style={{ width: 150, height: 150 }}
                  resizeMode="contain" 
                />
              </AnimatedIndicator>
            </View>
          </>
        )} 
      </View>
      
      {/* Filter Modal */}
      <FilterModal 
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
      />
      
      {/* Roommate Match Notification Wrapper View for zIndex */} 
      {/* Applying position: 'absolute' to ensure the wrapper doesn't affect layout */}
      <View style={{ zIndex: 1000, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: showMatchNotification ? 'auto' : 'none' }}> 
        <MatchNotification
          visible={showMatchNotification}
          match={currentMatch}
          profile={matchedProfile}
          onClose={closeMatchNotification}
          onMessage={handleMessageMatch}
          // No style prop here
        />
      </View>
      
      {/* Place Saved Notification Wrapper View for zIndex */} 
      {/* Applying position: 'absolute' to ensure the wrapper doesn't affect layout */}
      <View style={{ zIndex: 1000, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: showPlaceNotification ? 'auto' : 'none' }}> 
        <PlaceSavedNotification
          visible={showPlaceNotification}
          profile={matchedProfile}
          onClose={closePlaceNotification}
          onViewDetails={handleViewPlaceDetails}
          isPrioritized={isPlacePrioritized}
          // No style prop here
        />
      </View>
              
    </View>
  );
}

function DiscoverScreen() {
  return (
    <DropdownManager>
      <DiscoverContent />
    </DropdownManager>
  );
}

export default DiscoverScreen;

function HomeScreenContent() {
  const router = useRouter();
  
  // Get matches, saved places, and messages from stores
  const { getMatches } = useMatchesStore();
  const { getSavedPlaces, getById } = useRoommateStore();
  const { conversations } = useMessageStore();
  
  // Retrieve data
  const matches = getMatches();
  const savedPlaces = getSavedPlaces();

  // Helper function to get user data for matches
  const getMatchUserData = (match: Match) => {
    const isUser1 = match.user1Id === 'currentUser'; 
    const userId = isUser1 ? match.user2Id : match.user1Id;
    const profile = getById(userId);
    return {
      id: userId,
      name: profile?.name || 'User',
      image: profile?.image || ''
    };
  };

  return (
    <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false} stickyHeaderIndices={[0, 2, 4]}>
      {/* New Matches Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-black/5 w-full z-10 shadow-sm">
        <Text className="text-xl font-bold text-gray-800">New Matches</Text>
        <View className="bg-indigo-50 px-2.5 py-1 rounded-full">
          <Text className="text-base font-semibold text-indigo-600">{matches.length}</Text>
        </View>
      </View>
      
      {/* New Matches Content */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} 
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}
      >
        {matches.map((match) => {
          const userData = getMatchUserData(match);
          return (
            <TouchableOpacity 
              key={match.id} 
              className="mr-4 items-center w-20"
              onPress={() => router.push(`/conversation/${match.id}`)}
            >
              <Image source={{ uri: userData.image }} className="w-[70px] h-[70px] rounded-full" />
              <Text className="text-sm font-semibold mt-2 text-gray-800 text-center">{userData.name}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      
      {/* Saved Places Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-black/5 w-full z-10 shadow-sm">
        <Text className="text-xl font-bold text-gray-800">Saved Places</Text>
        <View className="bg-indigo-50 px-2.5 py-1 rounded-full">
          <Text className="text-base font-semibold text-indigo-600">{savedPlaces.length}</Text>
        </View>
      </View>
      
      {/* Saved Places Content */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} 
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}
      >
        {savedPlaces.map((place) => (
          <TouchableOpacity 
            key={place.id} 
            className="w-50 rounded-xl overflow-hidden bg-gray-100 mr-4"
            onPress={() => router.push(`/place-detail?id=${place.id}`)}
          >
            <Image source={{ uri: place.image }} className="w-full h-30" />
            <View className="absolute top-3 left-3 bg-indigo-600 px-2 py-1 rounded-xl">
              <Text className="text-white text-xs font-semibold">{place.roomType || 'Room'}</Text>
            </View>
            <View className="p-3">
              <Text className="text-base font-bold text-gray-800 mb-1">{place.budget}</Text>
              <Text className="text-xs text-gray-500">{place.location}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      {/* Messages Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-black/5 w-full z-10 shadow-sm">
        <Text className="text-xl font-bold text-gray-800">Messages</Text>
        <View className="bg-indigo-50 px-2.5 py-1 rounded-full">
          <Text className="text-base font-semibold text-indigo-600">{conversations.length}</Text>
        </View>
      </View>
      
      {/* Messages Content */}
      <View className="p-4">
        {conversations.slice(0, 5).map((conversation: Conversation) => {
          // Safely access conversation data
          const otherParticipant = conversation.participants?.find(p => p.id !== 'currentUser');
          const profileImage = otherParticipant?.avatar || '';
          const name = otherParticipant?.name || 'User';
          const lastMessageContent = conversation.lastMessage?.content || 'No messages yet';
          const timestamp = conversation.lastMessage?.timestamp || conversation.updatedAt;
          
          // Format timestamp (you might need a date formatting library like date-fns)
          const formattedTimestamp = timestamp ? new Date(timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : 'Just now';

          return (
            <TouchableOpacity 
              key={conversation.id} 
              className="flex-row items-center py-3 border-b border-black/5"
              onPress={() => router.push(`/conversation/${conversation.id}`)}
            >
              <Image 
                source={{ uri: profileImage }} 
                className="w-12 h-12 rounded-full mr-3" 
              />
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-800 mb-1">{name}</Text>
                <Text className="text-sm text-gray-500" numberOfLines={1}>
                  {lastMessageContent}
                </Text>
              </View>
              <Text className="text-xs text-gray-400 ml-2">{formattedTimestamp}</Text>
            </TouchableOpacity>
          );
        })}
        
        <TouchableOpacity 
          className="mt-4 py-3 bg-indigo-50 rounded-lg items-center"
          onPress={() => router.push('/messaging')}
        >
          <Text className="text-sm font-semibold text-indigo-600">View All Messages</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
