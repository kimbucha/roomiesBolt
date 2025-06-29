import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useUserStore } from '../../../store/userStore';
import AppLogo from '../../../components/common/AppLogo';
import { logOnboardingStepEntry, logOnboardingInputChange, logOnboardingStepComplete, logOnboardingNavigation, logOnboardingStoreUpdate } from '../../../utils/onboardingDebugUtils';
import { useSupabaseUserStore } from '../../../store/supabaseUserStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import step components (we'll create these next)
import BudgetStep from './steps/BudgetStep';
import LifestyleStep from './steps/LifestyleStep';
import PersonalityStep from './steps/PersonalityStep';
import GoalsStep from './steps/GoalsStep';
import PreferencesStep from './steps/PreferencesStep';
import PhotosStep from './steps/PhotosStep';
import AccountStep from './steps/AccountStep';

// Define the steps in the onboarding flow
const steps = [
  { id: 2, title: 'Budget', component: BudgetStep },
  { id: 3, title: 'Lifestyle', component: LifestyleStep },
  { id: 4, title: 'Personality', component: PersonalityStep },
  { id: 5, title: 'Goals', component: GoalsStep },
  { id: 6, title: 'Preferences', component: PreferencesStep },
  { id: 7, title: 'Photos', component: PhotosStep },
  { id: 8, title: 'Account', component: AccountStep },
];

export default function AnimatedOnboarding() {
  const router = useRouter();
  const { updateUser, user } = useUserStore();
  const { updateUserAndProfile } = useSupabaseUserStore();
  
  // Log entry to animated onboarding flow
  useEffect(() => {
    logOnboardingStepEntry('animated-onboarding', { 
      user, 
      initialStep: steps[0].title 
    });
  }, []);
  
  // Current step index
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  // User data collected from steps - Initialize with type-safe defaults
  const [userData, setUserData] = useState({
    budget: user?.budget || { min: 0, max: 10000 },
    // Provide a default Location object matching the type
    location: user?.location || { 
      city: '', 
      state: '',
      // Other fields can be undefined by default
    },
    // Provide default structure for lifestylePreferences
    lifestylePreferences: user?.lifestylePreferences || {
      cleanliness: 3, // Default middle value
      noise: 3,
      guestFrequency: 3,
      smoking: false,
      pets: false,
    },
    personalityType: user?.personalityType || '',
    // Provide default structure for personalityDimensions
    personalityDimensions: user?.personalityDimensions || {
      ei: 50, // Default middle value
      sn: 50,
      tf: 50,
      jp: 50,
    },
    userRole: user?.userRole || 'both', // Default to both
    personalityTraits: user?.personalityTraits || [],
    photos: user?.photos || [],
  });
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  
  // Update progress animation when current step changes
  useEffect(() => {
    // Calculate progress
    const progress = currentStepIndex / (steps.length - 1);
    
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
    
    // Log step change
    logOnboardingStepEntry(steps[currentStepIndex].title.toLowerCase(), {
      stepIndex: currentStepIndex,
      stepId: steps[currentStepIndex].id,
      progress: progress
    });
    
    // Update onboarding progress in user store (only the step number)
    // This avoids the infinite loop issues
    const updatedProgress = {
      onboardingProgress: steps[currentStepIndex].id,
    };
    updateUser(updatedProgress);
    logOnboardingStoreUpdate('user', updatedProgress);
  }, [currentStepIndex]);
  
  // Go to next step
  const goToNextStep = (stepData = {}) => {
    // Log step completion with collected data
    logOnboardingStepComplete(steps[currentStepIndex].title.toLowerCase(), stepData);
    
    // Update user data with data from the current step
    setUserData(prevData => {
      const updatedData = {
        ...prevData,
        ...stepData
      };
      
      // Log the updated user data
      logOnboardingStoreUpdate('userData', updatedData);
      return updatedData;
    });
    
    if (currentStepIndex < steps.length - 1) {
      // Log navigation to next step
      const currentStep = steps[currentStepIndex].title;
      const nextStep = steps[currentStepIndex + 1].title;
      logOnboardingNavigation(currentStep.toLowerCase(), nextStep.toLowerCase(), { stepData });
      
      // Fade out current step
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        // Move to next step
        setCurrentStepIndex(currentStepIndex + 1);
        
        // Fade in next step
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    } else {
      // If we're at the last step, complete onboarding
      completeOnboarding();
    }
  };
  
  // Go to previous step
  const goToPreviousStep = () => {
    // Log navigation back
    logOnboardingNavigation(steps[currentStepIndex].title.toLowerCase(), 'previous', { 
      direction: 'back',
      currentStepIndex,
      userData
    });
    
    // Always navigate back out of the animated sequence
    // This prevents getting stuck in a loop between animated steps
    router.back(); 
  };
  
  // Complete onboarding
  const completeOnboarding = async () => {
    try {
      setIsLoading(true);
      
      // KEEP: Essential for data persistence testing
      console.log('[DATA PERSISTENCE TEST] 🎯 Completing onboarding via animated steps...');
    
      // Mark onboarding as completed in Supabase
      await updateUserAndProfile({
        onboardingCompleted: true
      });
      
      // KEEP: Essential for data persistence testing
      console.log('[DATA PERSISTENCE TEST] ✅ Onboarding completed successfully via animated steps!');
    
      // Clear any stale AsyncStorage onboarding data
      await AsyncStorage.removeItem('onboarding_progress');
    
    // Navigate to the main app
      router.replace('/(tabs)' as any);
    } catch (error) {
      console.error('[AnimatedOnboarding] Error completing onboarding:', error);
      
      // Even if there's an error saving to Supabase, navigate to main app
      Alert.alert(
        'Almost Done!', 
        'Your onboarding is complete, but we had trouble saving some settings. You can update them later in your profile.',
        [{ text: 'Continue', onPress: () => router.replace('/(tabs)' as any) }]
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get current step
  const currentStep = steps[currentStepIndex];
  
  // Render the current step component
  const renderStepContent = () => {
    const StepComponent = currentStep.component;
    return (
      <StepComponent 
        userData={userData}
        onContinue={goToNextStep}
      />
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Roomies logo */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={goToPreviousStep}
        >
          <ChevronLeft size={24} color="#4B5563" />
        </TouchableOpacity>
        <AppLogo variant="default" size="small" />
        <View style={styles.headerRight} />
      </View>
      
      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <Animated.View 
            style={[
              styles.progressBar,
              { width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%']
              }) }
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          Step {steps[currentStepIndex].id} of 8
        </Text>
      </View>
      
      {/* Step title */}
      <View style={styles.titleContainer}>
        <Text style={styles.stepTitle}>{currentStep.title}</Text>
      </View>
      
      {/* Content area */}
      <Animated.View 
        style={[
          styles.contentContainer,
          { opacity: fadeAnim }
        ]}
      >
        {renderStepContent()}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRight: {
    width: 40,
  },
  progressContainer: {
    paddingHorizontal: 16,
    marginVertical: 12,
  },
  progressTrack: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#6366F1',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'right',
  },
  titleContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
});
