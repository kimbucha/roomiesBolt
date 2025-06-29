import React, { useRef, useEffect, useState } from 'react';
import { View, Text, Image, ImageSourcePropType, Animated, TouchableOpacity } from 'react-native';
import { Brain, Sparkles, Users, Heart, TrendingUp } from 'lucide-react-native';
import { RoommateProfile } from '../../store/roommateStore';
import { CompatibilityRadarChart } from './CompatibilityRadarChart';
import { useSupabaseUserStore } from '../../store/supabaseUserStore';
import { useSupabaseAuthStore } from '../../store/supabaseAuthStore';
import { useUserStore } from '../../store/userStore';

interface PersonalityDetailSectionProps {
  profile: RoommateProfile;
}

// Define personality type as a type for better type safety
type PersonalityType = 
  | 'ISTJ' | 'ISFJ' | 'INFJ' | 'INTJ' 
  | 'ISTP' | 'ISFP' | 'INFP' | 'INTP' 
  | 'ESTP' | 'ESFP' | 'ENFP' | 'ENTP' 
  | 'ESTJ' | 'ESFJ' | 'ENFJ' | 'ENTJ';

// Import all personality type images
const personalityImages: Record<PersonalityType, ImageSourcePropType> = {
  'ISTJ': require('../../assets/images/personality/ISTJ.png'),
  'ISFJ': require('../../assets/images/personality/ISFJ.png'),
  'INFJ': require('../../assets/images/personality/INFJ.png'),
  'INTJ': require('../../assets/images/personality/INTJ.png'),
  'ISTP': require('../../assets/images/personality/ISTP.png'),
  'ISFP': require('../../assets/images/personality/ISFP.png'),
  'INFP': require('../../assets/images/personality/INFP.png'),
  'INTP': require('../../assets/images/personality/INTP.png'),
  'ESTP': require('../../assets/images/personality/ESTP.png'),
  'ESFP': require('../../assets/images/personality/ESFP.png'),
  'ENFP': require('../../assets/images/personality/ENFP.png'),
  'ENTP': require('../../assets/images/personality/ENTP.png'),
  'ESTJ': require('../../assets/images/personality/ESTJ.png'),
  'ESFJ': require('../../assets/images/personality/ESFJ.png'),
  'ENFJ': require('../../assets/images/personality/ENFJ.png'),
  'ENTJ': require('../../assets/images/personality/ENTJ.png'),
};

// MBTI type descriptions with roommate-specific insights
const personalityDescriptions: Record<string, {
  title: string;
  description: string;
  roommateTips: string[];
  colors: {
    primary: string;
    secondary: string;
    gradient: string[];
  };
}> = {
  'ISTJ': {
    title: 'The Inspector',
    description: 'Practical, detail-oriented, and reliable. Values tradition, organization, and clear expectations.',
    roommateTips: ['Thrives with clear household rules', 'Appreciates personal space', 'Values cleanliness & organization'],
    colors: { primary: '#A6C4A2', secondary: '#E5E9DC', gradient: ['#A6C4A2', '#E5E9DC'] }
  },
  'ISFJ': {
    title: 'The Protector',
    description: 'Warm, considerate, and dependable. Creates a harmonious living environment.',
    roommateTips: ['Creates warm home environment', 'Communicates needs clearly', 'Values advance notice for changes'],
    colors: { primary: '#F3B94D', secondary: '#FCD77A', gradient: ['#F3B94D', '#FCD77A'] }
  },
  'INFJ': {
    title: 'The Counselor',
    description: 'Insightful, creative, and principled. Seeks meaningful connections and peaceful spaces.',
    roommateTips: ['Values meaningful conversations', 'Needs quiet time to recharge', 'Respects personal values'],
    colors: { primary: '#B1B9E3', secondary: '#D8DDF0', gradient: ['#B1B9E3', '#D8DDF0'] }
  },
  'INTJ': {
    title: 'The Mastermind',
    description: 'Strategic, independent, and analytical. Values efficiency and logical solutions.',
    roommateTips: ['Logical household decisions', 'Values independence', 'Direct communication style'],
    colors: { primary: '#8B7EC8', secondary: '#C8C4E8', gradient: ['#8B7EC8', '#C8C4E8'] }
  },
  'ISTP': {
    title: 'The Craftsman',
    description: 'Practical, adaptable, and independent. Skilled at solving household problems.',
    roommateTips: ['Excellent at practical fixes', 'Values personal freedom', 'Prefers straightforward interactions'],
    colors: { primary: '#D4C5A9', secondary: '#E0D3BA', gradient: ['#D4C5A9', '#E0D3BA'] } // Changed to beige/tan
  },
  'ISFP': {
    title: 'The Composer',
    description: 'Gentle, aesthetic, and present-focused. Creates beautiful, harmonious living spaces.',
    roommateTips: ['Brings aesthetic touches', 'Prefers harmony over conflict', 'Values authenticity & kindness'],
    colors: { primary: '#F4A5B9', secondary: '#F8D7E1', gradient: ['#F4A5B9', '#F8D7E1'] }
  },
  'INFP': {
    title: 'The Healer',
    description: 'Idealistic, empathetic, and authentic. Creates supportive, values-based environments.',
    roommateTips: ['Creates cozy personal spaces', 'Needs alone time to recharge', 'Respects personal beliefs'],
    colors: { primary: '#A8BFA8', secondary: '#D7E5D7', gradient: ['#A8BFA8', '#D7E5D7'] }
  },
  'INTP': {
    title: 'The Architect',
    description: 'Logical, curious, and innovative. Values intellectual discussions and flexibility.',
    roommateTips: ['Creative problem solutions', 'Prefers flexible routines', 'Enjoys intellectual discussions'],
    colors: { primary: '#9BB7D4', secondary: '#CDE0F0', gradient: ['#9BB7D4', '#CDE0F0'] }
  },
  'ESTP': {
    title: 'The Dynamo',
    description: 'Energetic, practical, and spontaneous. Brings excitement and adaptability.',
    roommateTips: ['Brings energy & spontaneity', 'Enjoys social gatherings', 'Prefers practical solutions'],
    colors: { primary: '#E8A87C', secondary: '#F2D4C1', gradient: ['#E8A87C', '#F2D4C1'] }
  },
  'ESFP': {
    title: 'The Performer',
    description: 'Enthusiastic, social, and fun-loving. Creates lively, welcoming atmospheres.',
    roommateTips: ['Creates fun atmosphere', 'Enjoys hosting activities', 'Values positive energy'],
    colors: { primary: '#F5C6A0', secondary: '#F9E3D3', gradient: ['#F5C6A0', '#F9E3D3'] }
  },
  'ENFP': {
    title: 'The Champion',
    description: 'Enthusiastic, creative, and people-oriented. Brings positive energy and new ideas.',
    roommateTips: ['Brings creativity & enthusiasm', 'Enjoys deep conversations', 'Appreciates spontaneity'],
    colors: { primary: '#F59E0B', secondary: '#FCD34D', gradient: ['#F59E0B', '#FCD34D'] }
  },
  'ENTP': {
    title: 'The Visionary',
    description: 'Innovative, curious, and adaptable. Enjoys intellectual challenges and creative solutions.',
    roommateTips: ['Enjoys debating ideas', 'Innovative problem solving', 'Open to new perspectives'],
    colors: { primary: '#C8A8D8', secondary: '#E4D4EC', gradient: ['#C8A8D8', '#E4D4EC'] }
  },
  'ESTJ': {
    title: 'The Supervisor',
    description: 'Organized, practical, and decisive. Establishes clear systems and responsibilities.',
    roommateTips: ['Clear household systems', 'Values reliability', 'Direct communication about issues'],
    colors: { primary: '#B8C5A8', secondary: '#DCE2D4', gradient: ['#B8C5A8', '#DCE2D4'] }
  },
  'ESFJ': {
    title: 'The Provider',
    description: 'Warm, organized, and supportive. Creates harmonious, welcoming home environments.',
    roommateTips: ['Welcoming organized home', 'Values harmony', 'Enjoys shared traditions'],
    colors: { primary: '#E5B8A0', secondary: '#F2DCD3', gradient: ['#E5B8A0', '#F2DCD3'] }
  },
  'ENFJ': {
    title: 'The Teacher',
    description: 'Warm, empathetic, and organized. Fosters positive relationships and supportive environments.',
    roommateTips: ['Positive communication', 'Growth-oriented environment', 'Values emotional depth'],
    colors: { primary: '#D4A5C8', secondary: '#EAD2E4', gradient: ['#D4A5C8', '#EAD2E4'] }
  },
  'ENTJ': {
    title: 'The Commander',
    description: 'Strategic, efficient, and decisive. Implements effective systems and drives improvement.',
    roommateTips: ['Efficient household systems', 'Values competence', 'Appreciates direct feedback'],
    colors: { primary: '#A8B8D8', secondary: '#D4DCEC', gradient: ['#A8B8D8', '#D4DCEC'] }
  },
};

export const PersonalityDetailSection: React.FC<PersonalityDetailSectionProps> = ({ profile }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [detailsHeight, setDetailsHeight] = useState(0);
  const [contentMeasured, setContentMeasured] = useState(false);
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const animatedOpacity = useRef(new Animated.Value(0)).current;
  
  // Get current user's personality dimensions from BOTH stores (for existing users)
  const { user: supabaseUser } = useSupabaseUserStore();
  const { user: legacyUser } = useUserStore();

  // Check if we have personality data
  const hasPersonalityData = profile.personalityType || profile.personalityTraits || profile.personalityDimensions;
  
  if (!hasPersonalityData) {
    return null;
  }

  const personalityType = profile.personalityType as PersonalityType || 'ENFJ';
  const personalityInfo = personalityDescriptions[personalityType] || personalityDescriptions['ENFJ'];
  const personalityImage = personalityImages[personalityType];

  // CRITICAL FIX: Smart fallback for existing users
  // Try Supabase store first, then fall back to legacy store, then fetch from Supabase
  const getCurrentUserDimensions = () => {
    console.log('[PersonalityDetailSection] ===== DEBUGGING USER PERSONALITY DATA =====');
    console.log('[PersonalityDetailSection] ===== CURRENT AUTH STATE =====');
    console.log('[PersonalityDetailSection] Supabase user data:', {
      exists: !!supabaseUser,
      id: supabaseUser?.id,
      email: supabaseUser?.email,
      name: supabaseUser?.name,
      personalityType: supabaseUser?.personalityType,
      personalityDimensions: supabaseUser?.personalityDimensions,
      onboardingCompleted: supabaseUser?.onboardingCompleted
    });
    console.log('[PersonalityDetailSection] Legacy user data:', {
      exists: !!legacyUser,
      id: legacyUser?.id,
      email: legacyUser?.email,
      name: legacyUser?.name,
      personalityType: legacyUser?.personalityType,
      personalityDimensions: legacyUser?.personalityDimensions
    });
    
    // Also check auth store state
    const authStore = useSupabaseAuthStore.getState();
    console.log('[PersonalityDetailSection] Auth store state:', {
      isLoggedIn: authStore.isLoggedIn,
      user: authStore.user ? {
        id: authStore.user.id,
        email: authStore.user.email,
        name: authStore.user.name
      } : null
    });
    
    // Priority 1: Supabase store (for new users and migrated users)
    if (supabaseUser?.personalityDimensions && typeof supabaseUser.personalityDimensions === 'object') {
      console.log('[PersonalityDetailSection] ✅ Using Supabase store personality data:', supabaseUser.personalityDimensions);
      console.log('[PersonalityDetailSection] 🔍 DETAILED SUPABASE DIMENSIONS:', JSON.stringify(supabaseUser.personalityDimensions, null, 2));
      console.log('[PersonalityDetailSection] 🔍 RAW SUPABASE USER OBJECT:', JSON.stringify({
        id: supabaseUser.id,
        personalityType: supabaseUser.personalityType,
        personalityDimensions: supabaseUser.personalityDimensions,
        onboardingCompleted: supabaseUser.onboardingCompleted
      }, null, 2));
      return supabaseUser.personalityDimensions;
    }
    
    // Priority 2: Legacy store (for existing users who haven't migrated)
    if (legacyUser?.personalityDimensions && typeof legacyUser.personalityDimensions === 'object') {
      console.log('[PersonalityDetailSection] ✅ Using legacy store personality data (existing user):', legacyUser.personalityDimensions);
      return legacyUser.personalityDimensions;
    }
    
    // Priority 3: Try to get dimensions from personality type if available
    const userPersonalityType = supabaseUser?.personalityType || legacyUser?.personalityType;
    if (userPersonalityType) {
      console.log('[PersonalityDetailSection] 🔄 Converting personality type to dimensions:', userPersonalityType);
      const dimensions = convertPersonalityTypeToDimensions(userPersonalityType);
      console.log('[PersonalityDetailSection] ✅ Converted dimensions:', dimensions);
      return dimensions;
    }
    
    // Priority 4: Default fallback (ENFP - more distinctive pattern)
    console.log('[PersonalityDetailSection] ⚠️ No personality data found, using ENFP defaults');
    console.log('[PersonalityDetailSection] This means the user has not completed the personality quiz or the data was not saved properly');
    return {
      ei: 25, // Extroverted (E) - lower values = more extroverted
      sn: 75, // Intuition (N) - higher values = more intuitive/creative  
      tf: 65, // Feeling (F) - higher values = more feeling/empathetic
      jp: 70  // Perceiving (P) - higher values = more flexible/adaptable
    };
  };

  // Helper function to convert MBTI type to dimensions
  const convertPersonalityTypeToDimensions = (personalityType: string) => {
    const ei = personalityType.includes('I') ? 75 : 25; // I = introverted (high), E = extroverted (low)
    const sn = personalityType.includes('N') ? 75 : 25; // N = intuitive (high), S = sensing (low)
    const tf = personalityType.includes('F') ? 75 : 25; // F = feeling (high), T = thinking (low)
    const jp = personalityType.includes('P') ? 75 : 25; // P = perceiving (high), J = judging (low)
    
    return { ei, sn, tf, jp };
  };

  // Get user personality type with same fallback logic
  const getCurrentUserPersonalityType = () => {
    return supabaseUser?.personalityType || legacyUser?.personalityType || 'ISTP';
  };

  const currentUserDimensions = getCurrentUserDimensions();
  const currentUserPersonalityType = getCurrentUserPersonalityType();
  
  console.log('[PersonalityDetailSection] Final data being used:', {
    currentUserDimensions,
    currentUserPersonalityType,
    profileDimensions: profile.personalityDimensions
  });

  const toggleExpanded = () => {
    // Don't toggle if we haven't measured the content yet
    if (!contentMeasured || detailsHeight === 0) {
      return;
    }
    
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);
    
    if (newExpandedState) {
      // Expanding
      Animated.parallel([
        Animated.timing(animatedHeight, {
          toValue: detailsHeight,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(animatedOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      // Collapsing
      Animated.parallel([
        Animated.timing(animatedHeight, {
          toValue: 0,
          duration: 250,
          useNativeDriver: false,
        }),
        Animated.timing(animatedOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start();
    }
  };

  const onContentLayout = (event: any) => {
    const { height } = event.nativeEvent.layout;
    if (height > 0 && detailsHeight === 0) {
      setDetailsHeight(height);
      setContentMeasured(true);
    }
  };

  const renderExpandableContent = () => (
    <View>
      {/* Beautiful Animated Compatibility Radar Chart */}
      {profile.personalityDimensions && (
        <CompatibilityRadarChart
          userDimensions={currentUserDimensions}
          roommateDimensions={profile.personalityDimensions}
          primaryColor={personalityInfo.colors.primary}
          secondaryColor={personalityInfo.colors.secondary}
          overallCompatibility={profile.compatibilityScore}
          userPersonalityType={currentUserPersonalityType}
        />
      )}
    </View>
  );

  return (
    <View className="mb-6">
      {/* Section Header */}
      <View className="flex-row items-center mb-3">
        <View 
          className="w-8 h-8 rounded-full items-center justify-center mr-3"
          style={{ backgroundColor: `${personalityInfo.colors.primary}20` }}
        >
          <Brain size={16} color={personalityInfo.colors.primary} />
        </View>
        <Text className="font-[Poppins-SemiBold] text-lg text-gray-800 flex-1">
          Personality Profile
        </Text>
      </View>

      {/* Main Personality Card */}
      <View 
        className="rounded-2xl p-5 mb-4 shadow-sm"
        style={{
          backgroundColor: personalityInfo.colors.gradient[1] + '15',
        }}
      >
        <View className="flex-row items-start">
          {/* Personality Image */}
          <View className="mr-4">
            <View 
              className="w-20 h-20 rounded-2xl items-center justify-center overflow-hidden"
              style={{ backgroundColor: '#FFFFFF' }}
            >
              <Image 
                source={personalityImage}
                className="w-16 h-16"
                resizeMode="contain"
              />
            </View>
          </View>

          {/* Personality Info */}
          <View className="flex-1">
            <View className="flex-row items-center mb-2">
              <Text 
                className="font-[Poppins-Bold] text-xl mr-3"
                style={{ color: personalityInfo.colors.primary }}
              >
                {personalityType}
              </Text>
              <View 
                className="px-2 py-1 rounded-full"
                style={{ backgroundColor: personalityInfo.colors.primary + '20' }}
              >
                <Text 
                  className="font-[Poppins-Medium] text-xs"
                  style={{ color: personalityInfo.colors.primary }}
                >
                  {personalityInfo.title}
                </Text>
              </View>
            </View>
            
            <Text className="font-[Poppins-Regular] text-sm text-gray-700 leading-5 mb-3">
              {personalityInfo.description}
            </Text>

            {/* Roommate Compatibility Quick Tips */}
            <View className="flex-row items-center">
              <Users size={14} color={personalityInfo.colors.primary} />
              <Text 
                className="font-[Poppins-Medium] text-xs ml-2"
                style={{ color: personalityInfo.colors.primary }}
              >
                Great roommate match for collaborative living
              </Text>
            </View>
          </View>
        </View>

        {/* Compatibility Chart Button */}
        <TouchableOpacity 
          onPress={toggleExpanded}
          className="flex-row items-center justify-center py-2 px-4 mt-2 rounded-lg self-center"
          style={{ 
            backgroundColor: `${personalityInfo.colors.primary}08`,
            opacity: contentMeasured ? 1 : 0.5 
          }}
        >
          <Sparkles size={14} color={personalityInfo.colors.primary} />
          <Text 
            className="font-[Poppins-SemiBold] text-xs ml-2"
            style={{ color: personalityInfo.colors.primary }}
          >
            {isExpanded ? 'Hide Chart' : 'View Chart'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Hidden Content for Measuring Height */}
      {!contentMeasured && (
        <View
          style={{
            position: 'absolute',
            left: -9999,
            top: -9999,
            opacity: 0,
          }}
          onLayout={onContentLayout}
        >
          {renderExpandableContent()}
        </View>
      )}

      {/* Expandable Details Container */}
      <Animated.View
        style={{
          height: animatedHeight,
          opacity: animatedOpacity,
          overflow: 'hidden',
        }}
      >
        {renderExpandableContent()}
      </Animated.View>
    </View>
  );
}; 