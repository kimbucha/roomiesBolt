import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Dimensions, Platform, ViewStyle, TouchableOpacity } from 'react-native';
import { styled } from 'nativewind';
import { useRouter } from 'expo-router';
import { Users, BookmarkCheck, Heart, MessageCircle, Settings, Star, Clock, Edit } from 'lucide-react-native';
import { useUserStore } from '../../store/userStore';
import { useMatchesStore } from '../../store/matchesStore';
import EnhancedAvatar from '../EnhancedAvatar';

// Styled components
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledAnimatedView = styled(Animated.View);
const StyledTouchableOpacity = styled(TouchableOpacity);

// Props for the component
interface ProfileStatsOverlayProps {
  visible: boolean;
  onClose: () => void;
  showDetailedProfile: () => void;
}

// Get screen dimensions
const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

// Define static styles to ensure consistency across remounts
const CONNECTOR_STYLES: ViewStyle = {
  position: 'absolute',
  right: 44,
  bottom: -11,
  width: 22,
  height: 22,
  backgroundColor: 'white',
  transform: [{ rotate: '45deg' }],
  borderWidth: 0,
  // Add comment to remind not to change this position
  // DO NOT CHANGE THE POSITION OF THIS TRIANGLE - Per user request
  ...Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 1, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 1,
    },
    android: {
      elevation: 4,
    },
  }),
  zIndex: -1,
};

const CONTAINER_STYLES: ViewStyle = {
  borderWidth: 0,
  backgroundColor: 'white',
  borderRadius: 24,
  ...Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    android: {
      elevation: 4,
    },
  }),
};

// Component implementation
const ProfileStatsOverlay = ({ visible, onClose, showDetailedProfile }: ProfileStatsOverlayProps) => {
  const router = useRouter();
  const { user, getUserRating } = useUserStore();
  const { matches, pendingLikes } = useMatchesStore();
  
  // Animation values - init for slide from bottom
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  
  // Add delay animation for the items
  const item1Anim = useRef(new Animated.Value(0)).current;
  const item2Anim = useRef(new Animated.Value(0)).current;
  const item3Anim = useRef(new Animated.Value(0)).current;
  
  // User stats
  const matchCount = matches?.length || 0;
  const likesCount = pendingLikes?.length || 0;
  const savedCount = 0;
  
  // Get user rating data
  const userRating = getUserRating();
  const { averageRating, responseRate, responseTime } = userRating;

  // Profile completeness
  const profileCompleteness = 85;

  // Component mount tracking
  const mountCountRef = useRef(0);
  const animationInstanceRef = useRef(0);
  
  // Animation effects
  useEffect(() => {
    // Common animation config for consistency
    const slideInAnimConfig = {
      tension: 70,
      friction: 12,
      useNativeDriver: true
    };
    
    const fadeAnimConfig = {
      duration: 250,
      useNativeDriver: true
    };
    
    // Store animation references for cleanup
    let mainAnimation: Animated.CompositeAnimation | null = null;
    let staggeredAnimation: Animated.CompositeAnimation | null = null;
    
    if (visible) {
      animationInstanceRef.current += 1;
      
      slideAnim.setValue(SCREEN_HEIGHT);
      opacityAnim.setValue(0);
      
      mainAnimation = Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          ...slideInAnimConfig
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          ...fadeAnimConfig
        }),
      ]);
      
      mainAnimation.start();

      // Staggered entry for items
      staggeredAnimation = Animated.stagger(80, [
        Animated.timing(item1Anim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(item2Anim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(item3Anim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]);
      
      staggeredAnimation.start();
    } else {
      // Use timing for exit animation - much smoother than spring for dismissal
      mainAnimation = Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 600, // Significantly slower for a very smooth dismissal
          useNativeDriver: true
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 500, // Longer fade out for smoother transition
          useNativeDriver: true
        }),
      ]);
      
      mainAnimation.start();

      // Reset icon animations
      item1Anim.setValue(0);
      item2Anim.setValue(0);
      item3Anim.setValue(0);
    }
    
    // Cleanup function to stop animations when component unmounts or visibility changes
    return () => {
      if (mainAnimation) {
        mainAnimation.stop();
      }
      if (staggeredAnimation) {
        staggeredAnimation.stop();
      }
    };
  }, [visible]);

  // Navigation with automatic dismissal
  const navigateAndDismiss = (route: any) => {
    // First dismiss the overlay
    onClose();
    // Then navigate after a short delay to allow animation to start
    setTimeout(() => router.push(route), 100);
  };

  if (!user) return null;
  
  // Combine animated and static styles
  const containerAnimatedStyle = {
    transform: [{ translateY: slideAnim }],
    opacity: opacityAnim,
  };

  const connectorAnimatedStyle = {
    opacity: opacityAnim
  };

  // Calculate profile completeness bar width
  const completenessWidth = `${profileCompleteness}%`;
  
  return (
    <StyledAnimatedView
      className="absolute bottom-20 right-0 left-0 bg-white rounded-3xl mx-4 mb-3.5 p-4 z-10"
      style={[CONTAINER_STYLES, containerAnimatedStyle]}
    >
      {/* Visual connector to profile icon - simple triangle */}
      <StyledAnimatedView 
        style={[CONNECTOR_STYLES, connectorAnimatedStyle]}
      />

      {/* User Profile Section */}
      <StyledTouchableOpacity 
        className="flex-row items-center mb-3"
        onPress={showDetailedProfile}
        activeOpacity={0.7}
      >
        <EnhancedAvatar 
          user={user}
          size="md"
          variant="circle"
          style={{ 
            marginRight: 12,
            borderWidth: 1,
            borderColor: 'rgba(0,0,0,0.05)'
          }}
        />
        
        <StyledView className="flex-1">
          <StyledView className="flex-row items-center">
            <StyledText className="text-[17px] font-bold text-gray-800 mb-0.5">{user.name}</StyledText>
            {profileCompleteness >= 100 && (
              <StyledView className="ml-2 bg-blue-100 px-1.5 py-0.5 rounded-full">
                <StyledText className="text-[10px] font-medium text-blue-600">Verified</StyledText>
              </StyledView>
            )}
          </StyledView>
          <StyledText className="text-[13px] font-normal text-gray-500 mb-1">
            {user.university}{user.major ? `, ${user.major}` : ''}
          </StyledText>
          
          {/* Profile Completeness Bar */}
          <StyledView className="w-full h-1.5 bg-gray-200 rounded-full mt-1">
            <StyledView 
              className="h-1.5 bg-indigo-600 rounded-full" 
              style={{ width: completenessWidth }}
            />
          </StyledView>
          <StyledText className="text-[10px] text-gray-500 mt-1">
            Profile {profileCompleteness}% complete {profileCompleteness < 100 && "• Tap to edit"}
          </StyledText>
        </StyledView>
        
        <StyledView className="ml-2">
          <Edit size={18} color="#4F46E5" />
        </StyledView>
      </StyledTouchableOpacity>
      
      {/* Divider */}
      <StyledView className="h-[1px] bg-gray-100 my-1.5 mx-1" />
      
      {/* Communication Stats */}
      <StyledView className="flex-row justify-between mt-1 mb-2">
        <StyledAnimatedView 
          className="items-center"
          style={{
            opacity: item1Anim,
            transform: [{ translateY: Animated.multiply(Animated.subtract(1, item1Anim), 10) }]
          }}
        >
          <StyledView className="flex-row items-center">
            <MessageCircle size={14} color="#4F46E5" />
            <StyledText className="text-sm font-semibold text-gray-800 ml-1">Response</StyledText>
          </StyledView>
          <StyledText className="text-lg font-bold text-indigo-600 mt-1">{responseRate}</StyledText>
          <StyledText className="text-xs text-gray-500">of messages</StyledText>
        </StyledAnimatedView>
        
        <StyledAnimatedView 
          className="items-center"
          style={{
            opacity: item2Anim,
            transform: [{ translateY: Animated.multiply(Animated.subtract(1, item2Anim), 10) }]
          }}
        >
          <StyledView className="flex-row items-center">
            <Clock size={14} color="#4F46E5" />
            <StyledText className="text-sm font-semibold text-gray-800 ml-1">Time</StyledText>
          </StyledView>
          <StyledText className="text-lg font-bold text-indigo-600 mt-1">{responseTime}</StyledText>
          <StyledText className="text-xs text-gray-500">avg. response</StyledText>
        </StyledAnimatedView>
        
        <StyledAnimatedView 
          className="items-center"
          style={{
            opacity: item3Anim,
            transform: [{ translateY: Animated.multiply(Animated.subtract(1, item3Anim), 10) }]
          }}
        >
          <StyledView className="flex-row items-center">
            <Star size={14} color="#4F46E5" />
            <StyledText className="text-sm font-semibold text-gray-800 ml-1">Rating</StyledText>
          </StyledView>
          <StyledText className="text-lg font-bold text-indigo-600 mt-1">{averageRating.toFixed(1)}</StyledText>
          <StyledText className="text-xs text-gray-500">as roommate</StyledText>
        </StyledAnimatedView>
      </StyledView>
    </StyledAnimatedView>
  );
};

// Export the component as default
export default ProfileStatsOverlay; 