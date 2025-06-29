import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import Slider from '@react-native-community/slider';
import OnboardingTemplate from '../../../components/features/onboarding/OnboardingTemplate';
import { useUserStore } from '../../../store/userStore';
import { useSupabaseUserStore } from '../../../store/supabaseUserStore';
// Toast notifications have been removed
import { getStepNumber, getTotalSteps, ONBOARDING_STEPS } from '../../../store/onboardingConfig';
import StepProgressIndicator from '../../../components/features/onboarding/place-listing/StepProgressIndicator';

type Question = {
  id: string;
  text: string;
  leftLabel: string;
  rightLabel: string;
};

// Group questions by personality dimension
const eiQuestions: Question[] = [
  {
    id: 'ei1',
    text: 'After a long day you:',
    leftLabel: 'Spend time with friends',
    rightLabel: 'Enjoy quiet alone time',
  },
  {
    id: 'ei2',
    text: 'Roomies at home, you:',
    leftLabel: 'Prefer group activities',
    rightLabel: 'Prefer being alone',
  },
  {
    id: 'ei3',
    text: 'At a party, you:',
    leftLabel: 'Feel energized',
    rightLabel: 'Feel tired',
  }
];

const snQuestions: Question[] = [
  {
    id: 'sn1',
    text: "Something in your home is broken. You:",
    leftLabel: "Fix it right away",
    rightLabel: "Look for a better solution",
  },
  {
    id: 'sn2',
    text: "Meeting a roomie, you:",
    leftLabel: "Notice their habits",
    rightLabel: "Feel their vibe",
  },
  {
    id: 'sn3',
    text: "Ideal home:",
    leftLabel: "Practical & neat",
    rightLabel: "Creative & chill",
  }
];

const tfQuestions: Question[] = [
  {
    id: 'tf1',
    text: 'Squabble with roomies? You:',
    leftLabel: 'Keep it logical',
    rightLabel: 'Keep the peace',
  },
  {
    id: 'tf2',
    text: 'Deciding on chores, you:',
    leftLabel: 'Weigh pros & cons',
    rightLabel: 'Feel the feels',
  },
  {
    id: 'tf3',
    text: 'Ideal space vibe:',
    leftLabel: 'Like clear rules',
    rightLabel: 'Like a cozy feeling',
  }
];

const jpQuestions: Question[] = [
  {
    id: 'jp1',
    text: 'Chores time, you:',
    leftLabel: 'Make a fixed plan',
    rightLabel: 'Be flexible',
  },
  {
    id: 'jp2',
    text: 'Your room:',
    leftLabel: 'Very tidy',
    rightLabel: 'A bit messy',
  },
  {
    id: 'jp3',
    text: 'Roomies should:',
    leftLabel: 'Have a plan',
    rightLabel: 'Be spontaneous',
  }
];

// Define the personality dimensions in order
const personalityDimensions = [
  { key: 'ei', questions: eiQuestions, title: "Your Social Energy", subtitle: "How do you interact with others and recharge?" },
  { key: 'sn', questions: snQuestions, title: "Your Thinking Style", subtitle: "How do you process information and see the world?" },
  { key: 'tf', questions: tfQuestions, title: "Your Decision Making", subtitle: "How do you make decisions and resolve conflicts?" },
  { key: 'jp', questions: jpQuestions, title: "Your Lifestyle Approach", subtitle: "How do you organize your life and living space?" }
];

export default function PersonalityQuiz() {
  const router = useRouter();
  const { updateOnboardingProgress, onboardingProgress, updateUserAndProfile, user } = useUserStore();
  
  // CRITICAL FIX: Use Supabase store for personality data persistence
  const { updateUserAndProfile: updateSupabaseUserAndProfile } = useSupabaseUserStore();
  
  // Compute dynamic step and total for optional onboarding steps
  const userRole = user?.userRole || 'roommate_seeker';
  const totalSteps = getTotalSteps(userRole);
  // Quiz is part of the personality step, so use personality step number
  const currentStepIndex = getStepNumber('personality', userRole);
  
  // State for all answers - CRITICAL: Initialize with current values from store if available
  const [answers, setAnswers] = useState<Record<string, number>>(() => {
    // Check if user already has personality data and initialize accordingly
    const existingDimensions = user?.personalityDimensions;
    if (existingDimensions) {
      console.log('[Quiz] Initializing with existing personality data:', existingDimensions);
      return {
        ei1: existingDimensions.ei, ei2: existingDimensions.ei, ei3: existingDimensions.ei,
        sn1: existingDimensions.sn, sn2: existingDimensions.sn, sn3: existingDimensions.sn,
        tf1: existingDimensions.tf, tf2: existingDimensions.tf, tf3: existingDimensions.tf,
        jp1: existingDimensions.jp, jp2: existingDimensions.jp, jp3: existingDimensions.jp
      };
    }
    // Default to 50 (middle) if no existing data
    console.log('[Quiz] Initializing with default 50 values (first time taking quiz)');
    return {
      ei1: 50, ei2: 50, ei3: 50,
      sn1: 50, sn2: 50, sn3: 50,
      tf1: 50, tf2: 50, tf3: 50,
      jp1: 50, jp2: 50, jp3: 50
    };
  });
  
  // Current dimension index (0-3 for ei, sn, tf, jp)
  const [currentDimensionIndex, setCurrentDimensionIndex] = useState(0);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  
  // Initialize onboarding progress
  useEffect(() => {
    const updatedCompletedSteps = [...(onboardingProgress?.completedSteps || [])];
    if (!updatedCompletedSteps.includes('personality/intro')) {
      updatedCompletedSteps.push('personality/intro');
    }
    
    updateOnboardingProgress({
      currentStep: 'personality/quiz',
      completedSteps: updatedCompletedSteps
    });
  }, []);
  
  const handleSliderChange = (questionId: string, value: number) => {
    console.log(`[Quiz] Slider changed: ${questionId} = ${value.toFixed(2)}`);
    setAnswers(prev => {
      const newAnswers = {
        ...prev,
        [questionId]: value,
      };
      console.log(`[Quiz] Updated answers state:`, newAnswers);
      return newAnswers;
    });
  };
  
  const handleBack = () => {
    if (currentDimensionIndex > 0) {
      // Fade out current dimension
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        // Move to previous dimension
        setCurrentDimensionIndex(currentDimensionIndex - 1);
        
        // Fade in previous dimension
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    } else {
      // If we're at the first dimension, go back to the previous screen in the navigation stack
      // This ensures proper back navigation flow
      router.back();
    }
  };
  
  const handleContinue = async () => {
    if (currentDimensionIndex < personalityDimensions.length - 1) {
      // Fade out current dimension
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        // Move to next dimension
        setCurrentDimensionIndex(currentDimensionIndex + 1);
        
        // Fade in next dimension
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    } else {
      // If we're at the last dimension, calculate scores and navigate to results
      
      // Calculate average scores for each personality dimension
      const eiScores = [answers.ei1, answers.ei2, answers.ei3];
      const snScores = [answers.sn1, answers.sn2, answers.sn3];
      const tfScores = [answers.tf1, answers.tf2, answers.tf3];
      const jpScores = [answers.jp1, answers.jp2, answers.jp3];
      
      const eiScore = eiScores.reduce((sum, val) => sum + val, 0) / eiScores.length;
      const snScore = snScores.reduce((sum, val) => sum + val, 0) / snScores.length;
      const tfScore = tfScores.reduce((sum, val) => sum + val, 0) / tfScores.length;
      const jpScore = jpScores.reduce((sum, val) => sum + val, 0) / jpScores.length;
      
      // CRITICAL DEBUG: Log ALL raw answers to see exactly what was submitted
      console.log('===== PERSONALITY QUIZ DEBUG INFORMATION =====');
      console.log('🔍 ALL RAW ANSWERS FROM SLIDERS:', answers);
      console.log('Raw slider values for each question:');
      console.log('E/I questions:', eiScores, '(ei1, ei2, ei3)');
      console.log('S/N questions:', snScores, '(sn1, sn2, sn3)');
      console.log('T/F questions:', tfScores, '(tf1, tf2, tf3)');
      console.log('J/P questions:', jpScores, '(jp1, jp2, jp3)');
      
      // IMPORTANT DEBUG: Log calculated dimension scores
      console.log('\nAverage scores for each dimension:');
      console.log(`E/I dimension: ${eiScore.toFixed(2)} (${eiScore < 50 ? 'Extraverted (E)' : 'Introverted (I)'})`);
      console.log(`S/N dimension: ${snScore.toFixed(2)} (${snScore < 50 ? 'Sensing (S)' : 'Intuitive (N)'})`);
      console.log(`T/F dimension: ${tfScore.toFixed(2)} (${tfScore < 50 ? 'Thinking (T)' : 'Feeling (F)'})`);
      console.log(`J/P dimension: ${jpScore.toFixed(2)} (${jpScore < 50 ? 'Judging (J)' : 'Perceiving (P)'})`);
      
      // IMPORTANT: Clarify the meaning of slider values
      console.log('\nHOW TO READ THE SCORES:');
      console.log('E/I dimension: Low values (0-49) = Extraverted (E), High values (51-100) = Introverted (I)');
      console.log('S/N dimension: Low values (0-49) = Sensing (S), High values (51-100) = Intuitive (N)');
      console.log('T/F dimension: Low values (0-49) = Thinking (T), High values (51-100) = Feeling (F)');
      console.log('J/P dimension: Low values (0-49) = Judging (J), High values (51-100) = Perceiving (P)');
      console.log('50 exactly is a borderline case and could go either way');
      
      // Determine the four-letter type with clear logic
      const e_i = eiScore < 50 ? 'E' : 'I';
      const s_n = snScore < 50 ? 'S' : 'N';
      const t_f = tfScore < 50 ? 'T' : 'F';
      const j_p = jpScore < 50 ? 'J' : 'P';
      
      const mbtiType = `${e_i}${s_n}${t_f}${j_p}`;
      console.log(`\nFINAL PERSONALITY TYPE: ${mbtiType}`);
      
      // For INTP specifically, verify the conditions
      if (mbtiType === 'INTP') {
        console.log('\nINTP VERIFICATION:');
        console.log(`I: ${eiScore.toFixed(2)} > 50 ✓`);
        console.log(`N: ${snScore.toFixed(2)} > 50 ✓`);
        console.log(`T: ${tfScore.toFixed(2)} < 50 ✓`);
        console.log(`P: ${jpScore.toFixed(2)} > 50 ✓`);
      }
      
      // First, log the current user state
      console.log('DEBUG - Current user state before update:', {
        hasUser: !!user,
        personalityType: user?.personalityType,
        personalityDimensions: user?.personalityDimensions
      });
      
      // Create a simpler update object with just the personality data
      const personalityData = {
        personalityDimensions: {
          ei: eiScore,
          sn: snScore,
          tf: tfScore,
          jp: jpScore
        },
        personalityType: mbtiType
      };
      
      // CRITICAL DEBUG: Log the exact data being saved
      console.log('🔍 EXACT PERSONALITY DATA BEING SAVED TO SUPABASE:', JSON.stringify(personalityData, null, 2));
      console.log('🔍 Individual dimension scores being saved:');
      console.log(`  ei (E/I): ${eiScore} (raw average of [${eiScores.join(', ')}])`);
      console.log(`  sn (S/N): ${snScore} (raw average of [${snScores.join(', ')}])`);
      console.log(`  tf (T/F): ${tfScore} (raw average of [${tfScores.join(', ')}])`);
      console.log(`  jp (J/P): ${jpScore} (raw average of [${jpScores.join(', ')}])`);
      
      // CRITICAL FIX: Save personality data to Supabase store (not regular store)
      // This ensures it's available in the radar chart which reads from Supabase store
      const result = await updateSupabaseUserAndProfile(personalityData, { validate: true });
      
      if (!result.success) {
        console.error('Error saving personality data to Supabase:', result.error);
        return;
      }
      
      console.log('Your personality profile has been saved!');
      console.log('DEBUG - Applied personality update:', personalityData);
      
      console.log('\nPersonality data saved to user store:', mbtiType);
      
      // Verify the data was saved correctly immediately  
      setTimeout(() => {
        const currentUser = useSupabaseUserStore.getState().user;
        console.log('VERIFICATION - Supabase user data after saving:', {
          personalityType: currentUser?.personalityType,
          dimensions: currentUser?.personalityDimensions
        });
      }, 100);
      
      
      // Update onboarding progress
      const updatedCompletedSteps = [...(onboardingProgress?.completedSteps || [])];
      if (!updatedCompletedSteps.includes('personality/quiz')) {
        updatedCompletedSteps.push('personality/quiz');
      }
      
      updateOnboardingProgress({
        currentStep: 'personality/results',
        completedSteps: updatedCompletedSteps
      });
      
      // Create a more reliable way to pass the personality type to the results screen
      // First, make sure the store is updated
      setTimeout(() => {
        // Verify the update was successful in Supabase store
        const verifiedUser = useSupabaseUserStore.getState().user;
        console.log('FINAL VERIFICATION - Supabase user data before navigation:', {
          personalityType: verifiedUser?.personalityType,
          dimensions: verifiedUser?.personalityDimensions
        });
        
        if (verifiedUser?.personalityType === mbtiType) {
          console.log('✅ Personality type successfully saved to Supabase store');
          // Navigate with the personality type as a param to ensure it's available
          console.log('Navigating to results screen with personality type:', mbtiType);
          // Use the correct format for passing search params in Expo Router
          router.replace(`/(onboarding)/personality/results?type=${mbtiType}`);
        } else {
          console.log('⚠️ Supabase store update failed, using direct navigation with params');
          // If store update failed, pass the type directly in the navigation
          // Use the correct format for passing search params in Expo Router
          router.replace(`/(onboarding)/personality/results?type=${mbtiType}`);
        }
      }, 500);
    }
  };
  
  // Get current dimension
  const currentDimension = personalityDimensions[currentDimensionIndex];
  
  return (
    <OnboardingTemplate
      step={currentStepIndex}
      totalSteps={totalSteps}
      onBackPress={handleBack}
      onContinuePress={handleContinue}
      title={currentDimension.title}
      subtitle={currentDimension.subtitle}
      greeting={`Hey ${user?.name ? user.name : 'there'}`}
      disableScroll={true}
      contentContainerStyle={styles.contentPadding}
    >
      <StepProgressIndicator
        currentStep={currentDimensionIndex + 1}
        totalSteps={personalityDimensions.length}
        progressTextFormat={`Part ${currentDimensionIndex + 1} of ${personalityDimensions.length}`}
      />
    
      <Animated.View 
        style={[
          styles.questionsContainer,
          { opacity: fadeAnim }
        ]}
      >
        {currentDimension.questions.map((question) => (
          <View key={question.id} style={styles.questionContainer}>
            <Text style={styles.questionText}>{question.text}</Text>
            
            <View style={styles.sliderContainer}> 
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={100}
                value={answers[question.id] || 50}
                onValueChange={(value) => handleSliderChange(question.id, value)}
                minimumTrackTintColor="#6366F1"
                maximumTrackTintColor="#E5E7EB"
                thumbTintColor="#4F46E5"
              />
              <View style={styles.labelContainer}>
                <Text style={styles.sliderLabel}>{question.leftLabel}</Text>
                <Text style={[styles.sliderLabel, styles.rightLabel]}>{question.rightLabel}</Text>
              </View>
            </View>

          </View>
        ))}
      </Animated.View>
    </OnboardingTemplate>
  );
}

const styles = StyleSheet.create({
  contentPadding: {
    paddingHorizontal: 16,
  },
  questionsContainer: {
    flex: 1,
    paddingBottom: 24,
    paddingTop: 10,
  },
  questionContainer: {
    marginVertical: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  questionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
    lineHeight: 20,
  },
  sliderContainer: {
    marginVertical: 4,
  },
  slider: {
    width: '100%',
    height: 36,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
    paddingHorizontal: 4,
    alignItems: 'flex-start',
  },
  sliderLabel: {
    fontSize: 12,
    color: '#4B5563',
    flex: 1,
    marginHorizontal: 2,
    lineHeight: 16,
  },
  rightLabel: {
    textAlign: 'right',
  }
});
