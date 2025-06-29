import React, { useEffect, useState, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, Image, ImageSourcePropType } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowRight, Check } from 'lucide-react-native';
import { Button } from '../../../components';
import OnboardingTemplate from '../../../components/features/onboarding/OnboardingTemplate';
import { useSupabaseUserStore } from '../../../store/supabaseUserStore';
import ConfettiCannon from 'react-native-confetti-cannon';
import * as Haptics from 'expo-haptics';
import { getStepNumber, getTotalSteps, ONBOARDING_STEPS } from '../../../store/onboardingConfig';

// Define personality type as a type for better type safety
type PersonalityType = 
  | 'ISTJ' | 'ISFJ' | 'INFJ' | 'INTJ' 
  | 'ISTP' | 'ISFP' | 'INFP' | 'INTP' 
  | 'ESTP' | 'ESFP' | 'ENFP' | 'ENTP' 
  | 'ESTJ' | 'ESFJ' | 'ENFJ' | 'ENTJ';

// PERFORMANCE: Memoize personality images to avoid re-creating object
const personalityImages: Record<PersonalityType, any> = {
  'ISTJ': require('../../../assets/images/personality/ISTJ.png'),
  'ISFJ': require('../../../assets/images/personality/ISFJ.png'),
  'INFJ': require('../../../assets/images/personality/INFJ.png'),
  'INTJ': require('../../../assets/images/personality/INTJ.png'),
  'ISTP': require('../../../assets/images/personality/ISTP.png'),
  'ISFP': require('../../../assets/images/personality/ISFP.png'),
  'INFP': require('../../../assets/images/personality/INFP.png'),
  'INTP': require('../../../assets/images/personality/INTP.png'),
  'ESTP': require('../../../assets/images/personality/ESTP.png'),
  'ESFP': require('../../../assets/images/personality/ESFP.png'),
  'ENFP': require('../../../assets/images/personality/ENFP.png'),
  'ENTP': require('../../../assets/images/personality/ENTP.png'),
  'ESTJ': require('../../../assets/images/personality/ESTJ.png'),
  'ESFJ': require('../../../assets/images/personality/ESFJ.png'),
  'ENFJ': require('../../../assets/images/personality/ENFJ.png'),
  'ENTJ': require('../../../assets/images/personality/ENTJ.png'),
};

// MBTI type descriptions
const personalityDescriptions: Record<string, { title: string, description: string, roommateTips: string[] }> = {
  'ISTJ': {
    title: 'The Inspector',
    description: 'Practical, detail-oriented, and reliable. You value tradition, organization, and clear expectations in your living space.',
    roommateTips: [
      'Thrives with clear household rules and routines',
      'Appreciates roommates who respect personal space',
      'Values cleanliness and organization'
    ]
  },
  'ISFJ': {
    title: 'The Protector',
    description: 'Warm, considerate, and dependable. You create a harmonious living environment and are attentive to others\' needs.',
    roommateTips: [
      'Creates a warm, comfortable home environment',
      'Prefers roommates who communicate needs clearly',
      'Appreciates advance notice for guests or changes'
    ]
  },
  'INFJ': {
    title: 'The Counselor',
    description: 'Insightful, creative, and principled. You seek deep connections and a peaceful, meaningful living environment.',
    roommateTips: [
      'Values meaningful conversations and connections',
      'Needs quiet time to recharge',
      'Appreciates roommates who respect personal values'
    ]
  },
  'INTJ': {
    title: 'The Mastermind',
    description: 'Strategic, independent, and analytical. You value efficiency and logical solutions to household challenges.',
    roommateTips: [
      'Prefers logical approaches to household decisions',
      'Values independence and personal space',
      'Appreciates roommates who are direct communicators'
    ]
  },
  'ISTP': {
    title: 'The Craftsman',
    description: 'Practical, adaptable, and independent. You\'re good at solving household problems and value personal freedom.',
    roommateTips: [
      'Skilled at practical household fixes',
      'Values personal freedom and space',
      'Prefers low-drama, straightforward interactions'
    ]
  },
  'ISFP': {
    title: 'The Composer',
    description: 'Gentle, sensitive, and artistic. You create a beautiful living space and are considerate of others\' feelings.',
    roommateTips: [
      'Brings aesthetic touches to shared spaces',
      'Prefers harmony and avoiding conflict',
      'Values roommates who are authentic and kind'
    ]
  },
  'INFP': {
    title: 'The Healer',
    description: 'Idealistic, compassionate, and creative. You seek authentic connections and a living space that reflects your values.',
    roommateTips: [
      'Creates a cozy, personalized living space',
      'Needs alone time to recharge',
      'Values roommates who respect personal beliefs'
    ]
  },
  'INTP': {
    title: 'The Architect',
    description: 'Logical, curious, and innovative. You value intellectual discussions and a flexible approach to household matters.',
    roommateTips: [
      'Brings creative solutions to household challenges',
      'Prefers flexible routines over strict schedules',
      'Values intellectual discussions and idea-sharing'
    ]
  },
  'ESTP': {
    title: 'The Dynamo',
    description: 'Energetic, practical, and spontaneous. You bring excitement to your living space and are adaptable to change.',
    roommateTips: [
      'Brings energy and spontaneity to the household',
      'Enjoys social gatherings and activities',
      'Prefers practical solutions over theoretical discussions'
    ]
  },
  'ESFP': {
    title: 'The Performer',
    description: 'Enthusiastic, social, and fun-loving. You create a lively home atmosphere and enjoy shared activities.',
    roommateTips: [
      'Creates a fun, welcoming atmosphere',
      'Enjoys hosting and social activities',
      'Values roommates who are positive and easygoing'
    ]
  },
  'ENFP': {
    title: 'The Champion',
    description: 'Enthusiastic, creative, and people-oriented. You bring positive energy and new ideas to your living environment.',
    roommateTips: [
      'Brings enthusiasm and creativity to the home',
      'Enjoys deep conversations and connections',
      'Values roommates who appreciate spontaneity'
    ]
  },
  'ENTP': {
    title: 'The Visionary',
    description: 'Innovative, curious, and adaptable. You enjoy intellectual challenges and bring creative solutions to household matters.',
    roommateTips: [
      'Enjoys debating ideas and brainstorming',
      'Brings innovative approaches to household challenges',
      'Values roommates who are open to new perspectives'
    ]
  },
  'ESTJ': {
    title: 'The Supervisor',
    description: 'Organized, practical, and decisive. You establish clear household systems and ensure responsibilities are met.',
    roommateTips: [
      'Establishes clear household systems and routines',
      'Values reliability and responsibility',
      'Prefers direct communication about issues'
    ]
  },
  'ESFJ': {
    title: 'The Provider',
    description: 'Warm, organized, and supportive. You create a harmonious home environment and are attentive to others\' needs.',
    roommateTips: [
      'Creates a welcoming, organized home',
      'Values harmony and positive interactions',
      'Enjoys shared meals and household traditions'
    ]
  },
  'ENFJ': {
    title: 'The Teacher',
    description: 'Warm, empathetic, and organized. You foster positive relationships and create a supportive living environment.',
    roommateTips: [
      'Fosters positive communication and connection',
      'Creates a supportive, growth-oriented environment',
      'Values roommates who appreciate emotional depth'
    ]
  },
  'ENTJ': {
    title: 'The Commander',
    description: 'Strategic, efficient, and decisive. You implement effective household systems and drive improvement.',
    roommateTips: [
      'Implements efficient household systems',
      'Values competence and clear expectations',
      'Prefers roommates who appreciate direct feedback'
    ]
  },
};

// Default description if type not found
const defaultDescription = {
  title: 'Balanced Personality',
  description: 'You have a balanced approach to living with others, adapting to different situations as needed.',
  roommateTips: [
    'Adapts well to different roommate dynamics',
    'Balances social time and personal space',
    'Values clear communication and mutual respect'
  ]
};

export default function PersonalityResults() {
  const router = useRouter();
  // Extract the type parameter from the URL if available
  const { type } = useLocalSearchParams<{ type: string }>();
  const typeFromParams = type as PersonalityType | undefined;
  
  const { user, updateUser } = useSupabaseUserStore();
  const userRole = user?.userRole || 'roommate_seeker';
  const totalSteps = getTotalSteps(userRole);
  const currentStepIndex = getStepNumber('personality', userRole);
  const [personalityType, setPersonalityType] = useState<PersonalityType | ''>(typeFromParams || '');
  const [showConfetti, setShowConfetti] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // PERFORMANCE: Memoize personality info to avoid recalculation
  const personalityInfo = useMemo(() => {
    return personalityType ? 
      (personalityDescriptions[personalityType] || defaultDescription) : 
      defaultDescription;
  }, [personalityType]);

  // PERFORMANCE: Memoize personality image to avoid re-lookup
  const personalityImage = useMemo(() => {
    return personalityType ? personalityImages[personalityType] : null;
  }, [personalityType]);

  // Function to trigger confetti and haptic feedback
  const triggerCelebration = () => {
    // Trigger haptic feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Start confetti animation
    setShowConfetti(true);
    
    // Add a stronger haptic impact after a short delay
    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }, 300);
  };

  // PERFORMANCE: Simplified personality type detection and setup
  useEffect(() => {
    if (typeFromParams && Object.keys(personalityImages).includes(typeFromParams)) {
      setPersonalityType(typeFromParams);
      
      // PERFORMANCE: Defer user store update to avoid blocking UI
      setTimeout(() => {
        if (updateUser && user?.personalityDimensions) {
          updateUser({
            personalityType: typeFromParams,
            personalityDimensions: user.personalityDimensions
          });
        }
      }, 100);
      
      // PERFORMANCE: Trigger celebration after UI renders
      setTimeout(triggerCelebration, 300);
    }
  }, [typeFromParams, updateUser]);

  // PERFORMANCE: Ultra-fast continue handler - navigate first, update later
  const handleContinue = () => {
    if (isLoading) return; // Prevent double-clicks
    setIsLoading(true);

    // Navigate to next step using onboarding config
    router.push(`/(onboarding)/photos?type=${personalityType}`);
    
    // Do ALL updates in background after navigation
    setTimeout(() => {
      try {
        // Skip onboarding progress updates since we're using direct navigation now
        // The personality data is already saved to Supabase above
        
        // Supabase update in background
        if (user?.id && personalityType) {
          setTimeout(async () => {
            try {
              const { SupabaseOnboardingProfileUpdater } = require('../../../utils/supabaseOnboardingProfileUpdater');
              const stepData = {
                personality_type: personalityType,
                personality_traits: personalityInfo.roommateTips,
                personality_dimensions: user?.personalityDimensions
              };
              
              await SupabaseOnboardingProfileUpdater.updateAfterStep(user.id, 'personality', stepData);
            } catch (error) {
              console.error('[Personality] Background profile update failed:', error);
            }
          }, 100);
        }
      } catch (error) {
        console.error('[Personality] Background updates failed:', error);
      } finally {
        setIsLoading(false);
      }
    }, 0);
  };

  return (
    <OnboardingTemplate
      step={currentStepIndex}
      totalSteps={totalSteps}
      onBackPress={() => router.back()}
      onContinuePress={handleContinue}
      continueDisabled={isLoading}
      title="Your Roommate Compatibility Profile"
      subtitle={personalityType ? `You are : ${personalityInfo.title} (${personalityType})` : 'You are : Balanced Personality'}
      greeting={`Hey ${user?.name ? user.name : 'there'}`}
    >
      <View style={styles.container}>
        {personalityImage && (
          <View style={styles.imageContainer}>
            <Image 
              source={personalityImage} 
              style={styles.personalityImage}
              resizeMode="contain"
              accessibilityLabel={`${personalityType} personality type illustration`}
              // PERFORMANCE: Optimize image loading
              fadeDuration={200}
            />
          </View>
        )}
        
        <View style={styles.personalityCard}>
          <Text style={styles.personalityDescription}>
            {personalityInfo.description}
          </Text>
        </View>
        
        <View style={styles.compatibilityContainer}>
          <Text style={styles.sectionTitle}>Roommate Compatibility</Text>
          {personalityInfo.roommateTips.map((tip, index) => (
            <View key={index} style={styles.tipItem}>
              <View style={styles.checkCircle}>
                <Check size={14} color="#fff" />
              </View>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>
        
        {/* Confetti cannon - full celebration experience */}
        {showConfetti && (
          <View style={styles.confettiContainer} pointerEvents="none">
            <ConfettiCannon
              count={200}
              origin={{x: 150, y: 0}}
              autoStart={true}
              fadeOut={true}
              fallSpeed={3000}
              explosionSpeed={500}
              colors={['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981']}
            />
          </View>
        )}
      </View>
    </OnboardingTemplate>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 32,
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 8,
    height: 200,
    overflow: 'hidden',
  },
  personalityImage: {
    width: '95%',
    height: '95%',
    alignSelf: 'center',
  },
  personalityCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  personalityDescription: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  compatibilityContainer: {
    flex: 1,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 1,
  },
  tipText: {
    fontSize: 14,
    color: '#4B5563',
    flex: 1,
    lineHeight: 20,
  },
});
