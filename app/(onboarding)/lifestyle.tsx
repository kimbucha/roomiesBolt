import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing, Image, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowRight, Check, ArrowLeft } from 'lucide-react-native';
import { Button } from '../../components';
import { useUserStore } from '../../store/userStore';
import { ONBOARDING_STEPS, getStepNumber } from '../../store/onboardingConfig';
import OnboardingTemplate from '../../components/features/onboarding/OnboardingTemplate';
import StepProgressIndicator from '../../components/features/onboarding/place-listing/StepProgressIndicator';
import { logOnboardingStepEntry, logOnboardingInputChange, logOnboardingStepComplete, logOnboardingNavigation, logOnboardingStoreUpdate, logOnboardingError } from '../../utils/onboardingDebugUtils';

// Define proper types for lifestyle preferences
interface LifestylePreferences {
  cleanliness: number;
  noise: number;
  guestFrequency: number;
  smoking: boolean;
  drinking: boolean;
  pets: boolean;
  schedule: string;
  [key: string]: number | boolean | string;
}

// Keep track of selected option IDs for UI rendering
interface SelectedOptions {
  [key: string]: string;
}

type LifestyleOption = {
  id: string;
  question: string;
  options: {
    id: string;
    label: string;
  }[];
}

const lifestyleQuestions: LifestyleOption[] = [
  {
    id: 'cleanliness',
    question: 'How clean do you keep your living space?',
    options: [
      { id: 'very-clean', label: 'Very clean' },
      { id: 'clean', label: 'Clean' },
      { id: 'somewhat-clean', label: 'Somewhat clean' },
      { id: 'not-concerned', label: 'Not concerned' },
    ],
  },
  {
    id: 'noise',
    question: 'What is your noise level preference?',
    options: [
      { id: 'very-quiet', label: 'Very quiet' },
      { id: 'quiet', label: 'Quiet' },
      { id: 'moderate', label: 'Moderate' },
      { id: 'lively', label: 'Lively' },
    ],
  },
  {
    id: 'guests',
    question: 'How often do you have guests over?',
    options: [
      { id: 'rarely', label: 'Rarely' },
      { id: 'occasionally', label: 'Occasionally' },
      { id: 'frequently', label: 'Frequently' },
      { id: 'very-frequently', label: 'Very frequently' },
    ],
  },
  {
    id: 'schedule',
    question: 'What is your typical schedule?',
    options: [
      { id: 'early-riser', label: 'Early riser' },
      { id: 'regular-hours', label: 'Regular hours' },
      { id: 'night-owl', label: 'Night owl' },
      { id: 'irregular', label: 'Irregular' },
    ],
  },
  {
    id: 'smoking',
    question: 'What is your smoking preference?',
    options: [
      { id: 'non-smoker', label: 'Non-smoker' },
      { id: 'outside-only', label: 'Outside only' },
      { id: 'occasional', label: 'Occasional smoker' },
      { id: 'smoker', label: 'Regular smoker' },
    ],
  },
  {
    id: 'drinking',
    question: 'What is your drinking preference?',
    options: [
      { id: 'non-drinker', label: 'Non-drinker' },
      { id: 'social', label: 'Social drinker' },
      { id: 'occasional', label: 'Occasional drinker' },
      { id: 'regular', label: 'Regular drinker' },
    ],
  },
  {
    id: 'pets',
    question: 'What is your preference regarding pets?',
    options: [
      { id: 'love-pets', label: 'Love all pets' },
      { id: 'cats-only', label: 'Cats only' },
      { id: 'dogs-only', label: 'Dogs only' },
      { id: 'no-pets', label: 'No pets' },
    ],
  },
];

export default function Lifestyle() {
  const router = useRouter();
  const { updateOnboardingProgress, onboardingProgress, updateUserAndProfile, user } = useUserStore();
  const insets = useSafeAreaInsets();
  // NEW: Lifestyle is step 2 of the room seeker branch (restart counting after goals)
  const totalSteps = 7; // Room seeker branch steps  
  const currentStepIndex = 2; // Fixed step number - lifestyle is step 2 of room seeker branch
  
  // State for the actual lifestyle preference values
  const [answers, setAnswers] = useState<LifestylePreferences>({
    cleanliness: 0,
    noise: 0,
    guestFrequency: 0,
    smoking: false,
    drinking: false,
    pets: false,
    schedule: ''
  });
  
  // State to track which option IDs are selected (for UI rendering)
  const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>({});
  
  // Current question index
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(0.9)).current;
  
  // Flag to prevent multiple animations from running simultaneously
  const isAnimating = useRef(false);
  
  const { height: screenHeight } = useWindowDimensions();
  const imageHeight = screenHeight * 0.2;
  
  useEffect(() => {
    // Log entry to lifestyle step
    logOnboardingStepEntry('lifestyle', { 
      initialAnswers: answers,
      initialSelectedOptions: selectedOptions,
      user: user
    });
    
    // Update onboarding progress
    const updatedCompletedSteps = [...(onboardingProgress?.completedSteps || [])];
    if (!updatedCompletedSteps.includes('budget')) {
      updatedCompletedSteps.push('budget');
    }
    
    const updatedProgress = {
      currentStep: 'lifestyle',
      completedSteps: updatedCompletedSteps
    };
    
    updateOnboardingProgress(updatedProgress);
    logOnboardingStoreUpdate('onboardingProgress', updatedProgress);
  }, []);

  useEffect(() => {
    const allQuestionsAnswered = isAllQuestionsAnswered();
    
    if (allQuestionsAnswered) {
      animateButtonIn();
    } else {
      animateButtonOut();
    }
  }, [selectedOptions]);

  const animateButtonIn = () => {
    Animated.parallel([
      Animated.timing(buttonOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateButtonOut = () => {
    Animated.parallel([
      Animated.timing(buttonOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 0.9,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleOptionSelect = (questionId: string, optionId: string) => {
    // Log the option selection
    logOnboardingInputChange('lifestyle', questionId, {
      optionId,
      questionIndex: currentQuestionIndex,
      questionText: lifestyleQuestions[currentQuestionIndex].question
    });
    
    // Update selected options for UI rendering
    setSelectedOptions(prev => {
      const updated = {
        ...prev,
        [questionId]: optionId
      };
      return updated;
    });
    
    // Determine the type of value based on the question ID
    let value: any;
    
    if (questionId === 'smoking') {
      // Convert smoking preference to boolean
      value = optionId === 'smoker' || optionId === 'occasional';
    } else if (questionId === 'drinking') {
      // Convert drinking preference to boolean
      value = optionId === 'social' || optionId === 'occasional' || optionId === 'regular';
    } else if (questionId === 'pets') {
      // Store the actual pet preference value
      value = optionId;
    } else if (questionId === 'schedule') {
      value = optionId;
    } else {
      // For cleanliness, noise, and guestFrequency, convert to number
      // Map them to numeric values (0-3)
      const optionMap: Record<string, number> = {
        'very-clean': 3,
        'clean': 2,
        'somewhat-clean': 1,
        'not-concerned': 0,
        'very-quiet': 3,
        'quiet': 2,
        'moderate': 1,
        'lively': 0,
        'rarely': 0,
        'occasionally': 1,
        'frequently': 2,
        'very-frequently': 3
      };
      value = optionMap[optionId] || 0;
    }
    
    // Update the answers state with the properly typed value
    setAnswers(prev => {
      const updated = {
        ...prev,
        [questionId]: value
      };
      
      // Log the updated answers
      logOnboardingInputChange('lifestyle', 'updatedAnswers', {
        questionId,
        value,
        allAnswers: updated
      });
      
      return updated;
    });
    
    // If this is the current question and not the last one, advance to the next question
    if (questionId === lifestyleQuestions[currentQuestionIndex].id && 
        currentQuestionIndex < lifestyleQuestions.length - 1) {
      // Reduced delay before advancing to the next question (from 300ms to 150ms)
      setTimeout(() => {
        navigateToQuestion(currentQuestionIndex + 1);
      }, 150);
    }
  };

  // Dedicated function to handle question navigation with animation
  const navigateToQuestion = (newIndex: number) => {
    // If an animation is already in progress, ignore this request
    if (isAnimating.current) return;
    
    // Log question navigation
    logOnboardingInputChange('lifestyle', 'navigationChange', {
      from: currentQuestionIndex,
      to: newIndex,
      fromQuestion: lifestyleQuestions[currentQuestionIndex].question,
      toQuestion: lifestyleQuestions[newIndex].question
    });
    
    // Set the animation flag to prevent multiple animations
    isAnimating.current = true;
    
    // Fade out current question - reduced duration from 200ms to 150ms
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      // Update the question index
      setCurrentQuestionIndex(newIndex);
      
      // Fade in the new question - reduced duration from 300ms to 200ms
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        // Reset the animation flag
        isAnimating.current = false;
      });
    });
  };

  const isAllQuestionsAnswered = () => {
    // Check if all questions have been answered
    return lifestyleQuestions.every(question => 
      selectedOptions.hasOwnProperty(question.id)
    );
  };

  const handleContinue = () => {
    // Check if all questions have been answered
    const allQuestionsAnswered = lifestyleQuestions.every(q => answers[q.id] !== undefined);
    
    if (allQuestionsAnswered) {
      // Prepare the lifestyle preferences data
      const lifestylePreferences = {
        cleanliness: answers.cleanliness as number,
        noise: answers.noise as number,
        guestFrequency: answers.guests as number, // Fix the key name to match the question ID
        smoking: answers.smoking as boolean,
        drinking: answers.drinking as boolean,
        // Fix pet preference mapping - set pets boolean based on the actual preference
        pets: typeof answers.pets === 'string' && answers.pets !== 'no-pets',
        // Add pet preference details
        petPreference: typeof answers.pets === 'string' ? answers.pets : 'no-pets',
        // Add schedule information if available
        schedule: answers.schedule as string,
      };
      
      // Log completion of lifestyle step with all answers
      logOnboardingStepComplete('lifestyle', {
        lifestylePreferences,
        rawAnswers: answers,
        selectedOptions
      });
      
      // Debug the lifestyle preferences being saved
      console.log('[Lifestyle] Saving preferences:', lifestylePreferences);
      
      // Save lifestyle preferences to user store and sync with roommate profile
      const userData = {
        lifestylePreferences
      };
      
      const result = updateUserAndProfile(userData, { validate: true });
      
      if (!result.success) {
        logOnboardingError('lifestyle', { 
          error: result.error,
          message: 'Failed to update lifestyle preferences'
        });
        console.error('[Lifestyle] Failed to update lifestyle preferences:', result.error);
        return;
      }
      
      logOnboardingStoreUpdate('user', userData);
      console.log('[Lifestyle] Updated user and roommate profile with lifestyle preferences');
      
      // Update profile strength in Supabase
      if (user?.id) {
        try {
          const { SupabaseOnboardingProfileUpdater } = require('../../utils/supabaseOnboardingProfileUpdater');
          const stepData = {
            lifestyle_preferences: lifestylePreferences
          };
          
          // Update profile strength asynchronously
                      SupabaseOnboardingProfileUpdater.updateAfterStep(user.id, 'lifestyle', stepData);
          console.log('[Lifestyle] Updating profile strength after completing lifestyle step');
        } catch (error) {
          console.error('[Lifestyle] Error updating profile strength:', error);
        }
      }
      
      // Update onboarding progress for the next step
      const updatedCompletedSteps = [...(onboardingProgress?.completedSteps || [])];
      if (!updatedCompletedSteps.includes('lifestyle')) {
        updatedCompletedSteps.push('lifestyle');
      }
      
      const updatedProgress = {
        currentStep: 'about-you', // NEW: Navigate to about-you after lifestyle
        completedSteps: updatedCompletedSteps
      };
      
      updateOnboardingProgress(updatedProgress);
      logOnboardingStoreUpdate('onboardingProgress', updatedProgress);
      
      // Log navigation to next step
      logOnboardingNavigation('lifestyle', 'about-you', { 
        lifestylePreferences,
        completedAllQuestions: true
      });
      
      // NEW: Navigate to the about-you screen (moved before personality)
      router.push('/(onboarding)/about-you');
    }
  };

  const handleBack = () => {
    // If an animation is already in progress, ignore this request
    if (isAnimating.current) return;
    
    if (currentQuestionIndex > 0) {
      // Log navigation to previous question
      logOnboardingInputChange('lifestyle', 'backNavigation', {
        from: currentQuestionIndex,
        to: currentQuestionIndex - 1,
        direction: 'back'
      });
      
      // Navigate to the previous question
      navigateToQuestion(currentQuestionIndex - 1);
      
      // Remove the current question's answer to update the progress bar
      const currentQuestionId = lifestyleQuestions[currentQuestionIndex].id;
      setSelectedOptions(prev => {
        const updated = { ...prev };
        delete updated[currentQuestionId];
        
        // Log the updated selected options
        logOnboardingInputChange('lifestyle', 'removedAnswer', {
          questionId: currentQuestionId,
          remainingAnswers: updated
        });
        
        return updated;
      });
    } else {
      // If we're at the first question, go back to the previous screen
      logOnboardingNavigation('lifestyle', 'previous', { direction: 'back' });
      router.back();
    }
  };

  const renderCurrentQuestion = () => {
    if (currentQuestionIndex >= lifestyleQuestions.length) {
      return null;
    }
    
    const question = lifestyleQuestions[currentQuestionIndex];
    
    return (
      <Animated.View 
        style={[
          styles.questionContainer,
          { opacity: fadeAnim }
        ]}
      >
        <Text style={styles.questionText}>{question.question}</Text>
        <View style={styles.optionsContainer}>
          {question.options.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionButton,
                selectedOptions[question.id] === option.id && styles.selectedOption
              ]}
              onPress={() => handleOptionSelect(question.id, option.id)}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedOptions[question.id] === option.id && styles.selectedOptionText
                ]}
              >
                {option.label}
              </Text>
              {selectedOptions[question.id] === option.id && (
                <View style={styles.checkIcon}>
                  <Check size={16} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
    );
  };
  
  // Calculate the current question number for display
  const totalQuestions = lifestyleQuestions.length;
  const answeredCount = Object.keys(selectedOptions).length;

  return (
    <OnboardingTemplate
      step={currentStepIndex}
      totalSteps={totalSteps}
      onBackPress={handleBack}
      onContinuePress={handleContinue}
      continueDisabled={!isAllQuestionsAnswered()}
      title="Lifestyle Preferences"
      subtitle="Let's find roommates with compatible living habits"
      greeting={`Hey ${user?.name ? user.name : 'there'}`}
      disableScroll={true}
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: insets.bottom + 16,
      }}
    >
      <View style={{ alignItems: 'center' }}>
        <Image
          source={require('../../assets/images/lifestyle.png')}
          style={{ width: '100%', height: imageHeight }}
          resizeMode="contain"
        />
      </View>
      <StepProgressIndicator
        currentStep={answeredCount}
        totalSteps={totalQuestions}
        progressCalculation="fraction"
        progressTextFormat={`${answeredCount} of ${totalQuestions} answered`}
      />
      <View style={styles.contentContainer}>
        {renderCurrentQuestion()}
      </View>
    </OnboardingTemplate>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
  },
  questionContainer: {
    marginBottom: 12,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  optionsContainer: {
    width: '100%',
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    marginBottom: 6,  // spacing between options
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedOption: {
    backgroundColor: '#EEF2FF',
    borderColor: '#6366F1',
  },
  optionText: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
  },
  selectedOptionText: {
    color: '#4F46E5',
    fontWeight: '600',
  },
  checkIcon: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    padding: 2,
  },
});