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

import { RoommateDetailCard } from '../../../components';
import { PlaceDetailCard } from '../../../components';
import { FilterModal } from '../../../components/common';
import { FilterBar } from '../../../components/common';
import { useRoommateStore } from '../../../store/roommateStore';
import { usePreferencesStore, clearPreferencesStorage } from '../../../store/preferencesStore';
import { useUserStore } from '../../../store/userStore';
import { Dropdown } from '../../../components/navigation';
import { DropdownManager, useDropdownManager } from '../../../components/navigation';
import { AnimatedIndicator } from '../../../components/feedback';
import { initializeMockData } from '../../../utils/mockDataSetup';
import { MatchNotification, PlaceSavedNotification } from '../../../components/matching';
import { Match, SwipeAction, useMatchesStore, MatchStatus } from '../../../store/matchesStore';
import { useSupabaseMatchesStore } from '../../../store/supabaseMatchesStore';
import { RoommateProfile, RoommateState } from '../../../store/roommateStore';
import { handleProfileScenario } from '../../../utils/matchingUtils';
import AppLogo from '../../../components/common/AppLogo';
import { useMessageStore } from '../../../store/messageStore';

// NEW: Import the unified service
import { unifiedSwipeService, SwipeRecord, MatchRecord, RoommateProfile as UnifiedProfile } from '../../../services/unifiedSwipeService';

// Add type definitions (same as main discover screen)
type SwipeDirection = 'left' | 'right' | 'up';
type SwipeIndicator = 'like' | 'dislike' | 'superlike' | null;

function DiscoverContent() {
  const dropdownManager = useDropdownManager();
  const activeDropdown = dropdownManager?.activeDropdown || null;
  const setActiveDropdown = dropdownManager?.setActiveDropdown || (() => {});
  
  // Original state from main discover screen
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
  const [showDataResetPanel, setShowDataResetPanel] = useState(false);
  
  // Track if component is mounted (for safe state updates)
  const isMounted = useRef(true);
  
  // Store ref to current indicator for animations
  const lastIndicatorRef = useRef<SwipeIndicator>(null);
  
  // NEW: Replace roommateStore usage with unified service
  const [unifiedProfiles, setUnifiedProfiles] = useState<UnifiedProfile[]>([]);
  const [unifiedMatches, setUnifiedMatches] = useState<MatchRecord[]>([]);
  const [unifiedSwipes, setUnifiedSwipes] = useState<SwipeRecord[]>([]);
  const [isUnifiedLoading, setIsUnifiedLoading] = useState(false);
  
  // Keep minimal roommateStore usage for fallback
  const { 
    fetchProfiles, // Still need this for mock data fallback
    resetSwipes: legacyResetSwipes,
    isLoading: legacyLoading,
    error,
  } = useRoommateStore();
  
  const { searchFilters, updateSearchFilters } = usePreferencesStore();
  const { setPremiumStatus, isPremium: matchesPremium, setMatches: setLegacyMatches } = useMatchesStore();
  const { user } = useUserStore();
  
  // NEW: Unified service data fetching
  const fetchUnifiedProfiles = useCallback(async () => {
    setIsUnifiedLoading(true);
    console.log('[UnifiedDiscover] Fetching profiles from Supabase...');
    
    try {
      const profiles = await unifiedSwipeService.getUnswipedProfiles();
      console.log(`[UnifiedDiscover] Fetched ${profiles.length} unswiped profiles`);
      setUnifiedProfiles(profiles);
    } catch (error) {
      console.error('[UnifiedDiscover] Error fetching profiles:', error);
      // Fallback to roommateStore if Supabase fails
      console.log('[UnifiedDiscover] Falling back to roommateStore...');
      await fetchProfiles();
    } finally {
      setIsUnifiedLoading(false);
    }
  }, [fetchProfiles]);
  
  const fetchUnifiedMatches = useCallback(async () => {
    try {
      const matches = await unifiedSwipeService.getUserMatches();
      console.log(`[UnifiedDiscover] Fetched ${matches.length} matches`);
      setUnifiedMatches(matches);
    } catch (error) {
      console.error('[UnifiedDiscover] Error fetching matches:', error);
    }
  }, []);
  
  const fetchUnifiedSwipes = useCallback(async () => {
    try {
      const swipes = await unifiedSwipeService.getUserSwipes();
      console.log(`[UnifiedDiscover] Fetched ${swipes.length} swipes`);
      setUnifiedSwipes(swipes);
    } catch (error) {
      console.error('[UnifiedDiscover] Error fetching swipes:', error);
    }
  }, []);
  
  // Initialize unified data
  useEffect(() => {
    fetchUnifiedProfiles();
    fetchUnifiedMatches();
    fetchUnifiedSwipes();
  }, [fetchUnifiedProfiles, fetchUnifiedMatches, fetchUnifiedSwipes]);
  
  // Filter profiles based on search filters (client-side for now)
  const filteredProfiles = useMemo(() => {
    let filtered = [...unifiedProfiles];
    
    // Apply lookingFor filter
    if (searchFilters.lookingFor === 'roommate') {
      filtered = filtered.filter(profile => profile.hasPlace !== true);
    } else if (searchFilters.lookingFor === 'place') {
      filtered = filtered.filter(profile => profile.hasPlace === true);
    }
    // For 'both', show all profiles
    
    // Apply other filters (for now, skip gender filter as schema doesn't have direct gender field)
    // TODO: Implement gender filtering based on profile structure
    if (searchFilters.gender && searchFilters.gender !== 'any') {
      // Skip gender filtering for now - will implement when schema is finalized
      console.log(`[UnifiedDiscover] Gender filter '${searchFilters.gender}' requested but not yet implemented`);
    }
    
    console.log(`[UnifiedDiscover] Filtered ${filtered.length} profiles from ${unifiedProfiles.length} total`);
    return filtered;
  }, [unifiedProfiles, searchFilters]);
  
  // Helper function to handle advancing to next card
  const handleNextCard = useCallback(() => {
    setCurrentIndex(prev => prev + 1);
    setIsTransitioning(false);
    setSwipeIndicator(null);
  }, []);
  
  // NEW: Unified swipe handling
  const handleUnifiedSwipe = useCallback(async (profile: UnifiedProfile, direction: string) => {
    console.log(`[UnifiedDiscover] Processing ${direction} swipe on ${profile.name}`);
    
    let swipeType: 'like' | 'dislike' | 'super_like';
    let indicator: SwipeIndicator;
    
    if (direction === 'right') {
      swipeType = 'like';
      indicator = 'like';
    } else if (direction === 'left') {
      swipeType = 'dislike';
      indicator = 'dislike';
    } else if (direction === 'up') {
      swipeType = 'super_like';
      indicator = 'superlike';
    } else {
      return;
    }
    
    // Record swipe in Supabase
    const swipeRecord = await unifiedSwipeService.recordSwipe(profile.id, swipeType);
    
    if (swipeRecord) {
      console.log(`[UnifiedDiscover] Swipe recorded successfully:`, swipeRecord);
      
      // Update local state
      setUnifiedSwipes(prev => [swipeRecord, ...prev]);
      
      // Remove profile from unswiped list
      setUnifiedProfiles(prev => prev.filter(p => p.id !== profile.id));
      
      // Show swipe indicator
      setSwipeIndicator(indicator);
      
      // Check for place save notification
      if (swipeType === 'like' && profile.hasPlace) {
        setIsPlaceSaved(true);
        setShowPlaceNotification(true);
        setTimeout(() => setShowPlaceNotification(false), 2000);
      }
      
      // Advance to next card
      setTimeout(() => {
        handleNextCard();
      }, 300);
      
      // Refresh matches to see if new match was created
      fetchUnifiedMatches();
    } else {
      console.error('[UnifiedDiscover] Failed to record swipe');
    }
  }, [fetchUnifiedMatches, handleNextCard]);
  
  // NEW: Unified reset function
  const handleUnifiedReset = useCallback(async () => {
    setIsUnifiedLoading(true);
    console.log('[UnifiedDiscover] Resetting all swipes...');
    
    try {
      const success = await unifiedSwipeService.clearAllSwipes();
      if (success) {
        console.log('[UnifiedDiscover] All swipes cleared successfully');
        
        // Also clear matches for complete reset
        await unifiedSwipeService.clearAllMatches();
        
        // Refresh data
        await fetchUnifiedProfiles();
        await fetchUnifiedMatches();
        await fetchUnifiedSwipes();
        
        // Reset UI state
        setCurrentIndex(0);
        setSwipeIndicator(null);
        
        Alert.alert(
          "Swipes Reset", 
          "All swipe history has been cleared from Supabase. You can now swipe on profiles again.",
          [{ text: "OK" }]
        );
      } else {
        Alert.alert("Error", "Failed to reset swipes. Please try again.");
      }
    } catch (error) {
      console.error('[UnifiedDiscover] Error resetting swipes:', error);
      Alert.alert("Error", "An error occurred while resetting swipes.");
    } finally {
      setIsUnifiedLoading(false);
    }
  }, [fetchUnifiedProfiles, fetchUnifiedMatches, fetchUnifiedSwipes]);
  
  // Update the swipe complete handler
  const handleSwipeComplete = useCallback(async (direction: string) => {
    if (isTransitioning) return;
    
    const profile = filteredProfiles[currentIndex];
    if (!profile) return;
    
    console.log(`[UnifiedDiscover] Swipe ${direction} on ${profile.name}`);
    
    setIsTransitioning(true);
    
    // Use unified swipe handler
    await handleUnifiedSwipe(profile, direction);
  }, [currentIndex, filteredProfiles, isTransitioning, handleUnifiedSwipe]);
  
  const renderEmpty = () => (
    <View className="flex-1 bg-gray-50 pb-2.5 justify-center items-center px-6">
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
          className={`bg-indigo-600 rounded-xl py-3 px-6 ${isUnifiedLoading ? 'opacity-50' : ''}`}
          onPress={fetchUnifiedProfiles}
          disabled={isUnifiedLoading}
        >
          <Text className="font-[Poppins-Medium] text-sm text-white">
            Refresh Profiles
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className={`bg-emerald-500 rounded-xl py-3 px-6 ${isUnifiedLoading ? 'opacity-50' : ''}`}
          onPress={handleUnifiedReset}
          onLongPress={() => {
            console.log('[DEBUG] Long press detected - opening data reset panel');
            setShowDataResetPanel(true);
          }}
          disabled={isUnifiedLoading}
        >
          <Text className="font-[Poppins-Medium] text-sm text-white">
            Reset Swipes (Hold for Debug)
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  
  // Use isUnifiedLoading instead of isLoading
  if (isUnifiedLoading && filteredProfiles.length === 0) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#6366f1" />
        <Text className="font-[Poppins-Medium] text-base text-gray-600 mt-4">
          Loading profiles from Supabase...
        </Text>
      </View>
    );
  }
  
  // Show empty state if no profiles
  if (!isUnifiedLoading && filteredProfiles.length === 0) {
    return renderEmpty();
  }
  
  // TODO: Complete the rest of the render logic using filteredProfiles
  // For now, show a simple list view
  return (
    <View className="flex-1 bg-gray-50">
      <Text className="text-center py-4 font-[Poppins-Medium] text-lg">
        🎯 Unified Swipe Service - {filteredProfiles.length} profiles
      </Text>
      <Text className="text-center text-sm text-gray-600 mb-4">
        Swipes: {unifiedSwipes.length} | Matches: {unifiedMatches.length}
      </Text>
      
      {filteredProfiles.length > 0 && (
        <View className="p-4">
          <Text className="font-[Poppins-Medium] text-base mb-2">
            Current Profile: {filteredProfiles[currentIndex]?.name || 'None'}
          </Text>
          
          <View className="flex-row justify-center gap-4 mt-4">
            <TouchableOpacity 
              className="bg-red-500 px-4 py-2 rounded-lg"
              onPress={() => handleSwipeComplete('left')}
              disabled={isTransitioning}
            >
              <Text className="text-white font-medium">Dislike</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="bg-green-500 px-4 py-2 rounded-lg"
              onPress={() => handleSwipeComplete('right')}
              disabled={isTransitioning}
            >
              <Text className="text-white font-medium">Like</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="bg-yellow-500 px-4 py-2 rounded-lg"
              onPress={() => handleSwipeComplete('up')}
              disabled={isTransitioning}
            >
              <Text className="text-white font-medium">Super Like</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      {showPlaceNotification && (
        <View className="absolute top-20 left-4 right-4 bg-green-500 p-4 rounded-lg">
          <Text className="text-white text-center font-medium">
            Place saved! 🏠
          </Text>
        </View>
      )}
    </View>
  );
}

export default function DiscoverScreen() {
  return (
    <DropdownManager>
      <DiscoverContent />
    </DropdownManager>
  );
} 