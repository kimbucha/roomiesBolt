import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  Dimensions,
  StatusBar,
  SafeAreaView,
  Animated,
  Easing,
  TouchableOpacity
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowRight, ArrowLeft } from 'lucide-react-native';
import { Button } from '../../components';
import OnboardingTemplate from '../../components/features/onboarding/OnboardingTemplate';
import RangeSlider from '../../components/RangeSlider';
import LocationMapSelector from '../../components/LocationMapSelector';
import { useUserStore } from '../../store/userStore';
import { getNextStep, ONBOARDING_STEPS, getStepNumber } from '../../store/onboardingConfig';
import { logOnboardingStepEntry, logOnboardingInputChange, logOnboardingStepComplete, logOnboardingNavigation, logOnboardingStoreUpdate, logOnboardingError } from '../../utils/onboardingDebugUtils';

const { width, height } = Dimensions.get('window');

// Constants for budget slider
const MIN_BUDGET = 0;
const MAX_BUDGET = 3500;
const STEP_BUDGET = 50;

export default function Budget() {
  const router = useRouter();
  const { updateOnboardingProgress, onboardingProgress, updateUserAndProfile, user } = useUserStore();

  // NEW: Budget is step 1 of the room seeker branch (restart counting after goals)
  const totalSteps = 7; // Room seeker branch steps (budget → lifestyle → about-you → personality → education → photos → notifications)
  const currentStepIndex = 1; // Fixed step number - budget is step 1 of room seeker branch

  // Budget state using range values instead of string inputs
  const [minBudget, setMinBudget] = useState(0);
  const [maxBudget, setMaxBudget] = useState(0);
  
  // Location state
  const [location, setLocation] = useState({
    latitude: 37.7749, // Default to San Francisco
    longitude: -122.4194,
    address: 'San Francisco, CA', // Set a default address
    radius: 20, // Default radius
    city: 'San Francisco',
    state: 'CA'
  });
  
  // State to track if location has been set
  const [locationSelected, setLocationSelected] = useState(false);
  
  // Animation for button fade-in
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(0.9)).current;
  
  // Check if form is ready to show continue button - only need location
  const isFormReady = locationSelected;
  
  // Animate button appearance when form is ready
  useEffect(() => {
    if (isFormReady) {
      animateButtonIn();
    } else {
      animateButtonOut();
    }
  }, [isFormReady]);
  
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
  
  useEffect(() => {
    // Log entry to budget step
    logOnboardingStepEntry('budget', { 
      initialBudget: { min: minBudget, max: maxBudget },
      initialLocation: location,
      user: user
    });
    
    // Update onboarding progress
    const updatedCompletedSteps = [...(onboardingProgress?.completedSteps || [])];
    if (!updatedCompletedSteps.includes('welcome')) {
      updatedCompletedSteps.unshift('welcome');
    }
    
    const updatedProgress = {
      currentStep: 'budget',
      completedSteps: updatedCompletedSteps,
      isComplete: false
    };
    
    updateOnboardingProgress(updatedProgress);
    logOnboardingStoreUpdate('onboardingProgress', updatedProgress);
  }, []);

  const handleContinue = () => {
    // Log completion of budget step
    logOnboardingStepComplete('budget', {
      budget: { min: minBudget, max: maxBudget },
      location: location
    });
    
    // Save budget and location to user store and sync with roommate profile
    const userData = {
      budget: {
        min: minBudget,
        max: maxBudget
      },
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address,
        radius: location.radius,
        city: location.city,
        state: location.state
      }
    };
    
    const result = updateUserAndProfile(userData, { validate: true });
    
    if (!result.success) {
      logOnboardingError('budget', { 
        error: result.error,
        message: 'Failed to update budget and location'
      });
      console.error('[Budget] Failed to update budget and location:', result.error);
      return;
    }
    
    logOnboardingStoreUpdate('user', userData);
    console.log('[Budget] Updated user and roommate profile with budget and location');
    
    // Update profile strength in Supabase
    try {
      const { SupabaseOnboardingProfileUpdater } = require('../../utils/supabaseOnboardingProfileUpdater');
      const stepData = {
        budget_min: minBudget,
        budget_max: maxBudget,
        preferred_locations: [
          {
            latitude: location.latitude,
            longitude: location.longitude,
            address: location.address,
            radius: location.radius,
            city: location.city,
            state: location.state
          }
        ]
      };
      
      // Update profile strength asynchronously (don't await to keep the UI responsive)
      // Let the updater get the correct ID from auth if user is not available
      SupabaseOnboardingProfileUpdater.updateAfterStep(user?.id || '', 'budget', stepData);
      console.log('[Budget] Updating profile strength after completing budget step');
    } catch (error) {
      console.error('[Budget] Error updating profile strength:', error);
    }
    
    // Update onboarding progress for the next step
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
    
    // Log navigation to next step
    logOnboardingNavigation('budget', 'lifestyle', { 
      budget: { min: minBudget, max: maxBudget },
      location: location
    });
    
    // Navigate to the next step
    router.push('/(onboarding)/lifestyle');
  };

  const handleBudgetChange = useCallback((low: number, high: number) => {
    setMinBudget(low);
    setMaxBudget(high);
    
    // Log budget changes
    logOnboardingInputChange('budget', 'budgetRange', {
      min: low,
      max: high,
      isAny: low === MIN_BUDGET && high === MAX_BUDGET,
      displayText: low === MIN_BUDGET && high === MAX_BUDGET ? 'Any' : `$${low} - $${high}`
    });
  }, [setMinBudget, setMaxBudget]);

  const handleLocationChange = (newLocation: {
    latitude: number;
    longitude: number;
    address: string;
    radius: number;
  }) => {
    // Parse city and state from the address (typically in format "City, State")
    const addressParts = newLocation.address.split(',').map(part => part.trim());
    const city = addressParts[0] || '';
    const state = addressParts[1] || '';
    
    const updatedLocation = {
      ...newLocation,
      city,
      state
    };
    
    // Log location change
    logOnboardingInputChange('budget', 'location', {
      previous: location,
      new: updatedLocation,
      addressParts: { city, state },
      timestamp: new Date().toISOString()
    });
    
    setLocation(updatedLocation);
    
    // Enable the continue button once location is set
    setLocationSelected(true);
  };

  return (
    <OnboardingTemplate
      step={currentStepIndex}
      totalSteps={totalSteps}
      onBackPress={() => router.back()}
      onContinuePress={handleContinue}
      title="Set Your Budget & Location"
      subtitle="Help us find roommates in your price range and area"
      greeting={`Hey ${user?.name ? user.name : 'there'}`}
      disableScroll={true}
    >
      <View style={styles.container}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.contentContainer}>
            {/* Budget section */}
            <View style={[styles.sectionContainer, { flex: 0.25 }]}>
              <Text style={styles.sectionTitle}>What's your rental budget?</Text>
              <View style={styles.sliderWrapper}>
                <RangeSlider
                  minValue={MIN_BUDGET}
                  maxValue={MAX_BUDGET}
                  step={STEP_BUDGET}
                  initialLowValue={minBudget}
                  initialHighValue={maxBudget}
                  onValueChange={handleBudgetChange}
                />
              </View>
            </View>
            
            {/* Location section */}
            <View style={[styles.locationContainer, { flex: 0.75 }]}>
              <Text style={styles.sectionTitle}>What's your preferred location?</Text>
              <View style={styles.mapWrapper}>
                <LocationMapSelector 
                  onLocationSelected={handleLocationChange}
                  initialRadius={location.radius}
                />
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </OnboardingTemplate>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 8,
  },
  contentContainer: {
    flex: 1,
  },
  sectionContainer: {
    marginBottom: -75, // lift map/radius up closer to slider
  },
  sectionTitle: {
    fontSize: 18,
    color: '#1F2937',
    marginBottom: 8,
    fontWeight: '600',
  },
  locationContainer: {
    marginTop: 0,
  },
  sliderWrapper: {
    paddingHorizontal: 16,
    width: '100%',
  },
  mapWrapper: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
  radiusControlsContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 10,
    marginTop: 8,
    marginBottom: 1,
  },
});