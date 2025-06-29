import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  Dimensions,
  SafeAreaView,
  TouchableOpacity
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowRight, ArrowLeft } from 'lucide-react-native';
import { Button } from '../../components';
import OnboardingTemplate from '../../components/features/onboarding/OnboardingTemplate';
import RangeSlider from '../../components/RangeSlider';
import LocationMapSelector from '../../components/LocationMapSelector';
import { useSupabaseUserStore } from '../../store/supabaseUserStore';
import { getNextStep, ONBOARDING_STEPS, getStepNumber } from '../../store/onboardingConfig';
import { SupabaseOnboardingProfileUpdater } from '../../utils/supabaseOnboardingProfileUpdater';
import { useSupabaseAuthStore } from '../../store/supabaseAuthStore';

const { width } = Dimensions.get('window');

// Constants for budget slider
const MIN_BUDGET = 0;
const MAX_BUDGET = 3500;
const STEP_BUDGET = 50;

export default function SupabaseBudget() {
  const router = useRouter();
  const { user: authUser } = useSupabaseAuthStore();
  const { 
    user, 
    updateOnboardingProgress, 
    onboardingProgress, 
    completeOnboardingStep 
  } = useSupabaseUserStore();

  // Compute optional quests count and index (budget is first)
  const optionalTotalSteps = Object.values(ONBOARDING_STEPS).length - 1;
  const currentStepIndex = getStepNumber('budget') - 1;

  // Budget state using range values instead of string inputs
  const [minBudget, setMinBudget] = useState(user?.budget?.min || 0);
  const [maxBudget, setMaxBudget] = useState(user?.budget?.max || 0);
  
  // Location state
  const [location, setLocation] = useState({
    latitude: user?.location?.latitude || 37.7749, // Default to San Francisco
    longitude: user?.location?.longitude || -122.4194,
    address: user?.location?.address || 'San Francisco, CA', // Set a default address
    radius: user?.location?.radius || 20, // Default radius
  });
  
  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Format budget for display
  const formatBudget = (value) => {
    if (value === 0) return 'Any';
    if (value === MAX_BUDGET) return `$${value}+`;
    return `$${value}`;
  };

  // Handle budget change
  const handleBudgetChange = (values) => {
    setMinBudget(values[0]);
    setMaxBudget(values[1]);
  };

  // Handle location change
  const handleLocationChange = (newLocation) => {
    setLocation(newLocation);
  };

  // Handle continue button press
  const handleContinue = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Prepare data for the step
      const budgetData = {
        budget: {
          min: minBudget,
          max: maxBudget
        },
        location
      };

      // Update profile using the JSONB-aware updater
      if (authUser?.id) {
        await SupabaseOnboardingProfileUpdater.updateAfterStep(
          authUser.id,
          'budget',
          budgetData
        );
      }

      // Complete the step in the store
      const result = await completeOnboardingStep('budget', budgetData);
      
      if (!result.success) {
        setError(result.error || 'Failed to save budget information');
        setIsLoading(false);
        return;
      }

      // Navigate to the next step
      const nextStep = getNextStep('budget');
      router.push(`/(onboarding)/${nextStep}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle back button press
  const handleBack = () => {
    router.back();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView style={styles.safeArea}>
          <OnboardingTemplate
            currentStep={currentStepIndex}
            totalSteps={optionalTotalSteps}
            title="What's your budget?"
            subtitle="Set your monthly rent budget range"
          >
            <View style={styles.content}>
              {/* Budget Range Slider */}
              <View style={styles.sliderContainer}>
                <View style={styles.budgetDisplay}>
                  <Text style={styles.budgetValue}>{formatBudget(minBudget)}</Text>
                  <Text style={styles.budgetDash}>-</Text>
                  <Text style={styles.budgetValue}>{formatBudget(maxBudget)}</Text>
                </View>
                
                <RangeSlider
                  min={MIN_BUDGET}
                  max={MAX_BUDGET}
                  step={STEP_BUDGET}
                  values={[minBudget, maxBudget]}
                  onValuesChange={handleBudgetChange}
                />
                
                <View style={styles.rangeLabels}>
                  <Text style={styles.rangeLabel}>Any</Text>
                  <Text style={styles.rangeLabel}>${MAX_BUDGET}+</Text>
                </View>
              </View>
              
              {/* Location Selector */}
              <View style={styles.locationContainer}>
                <Text style={styles.sectionTitle}>Where are you looking?</Text>
                <LocationMapSelector
                  initialLocation={location}
                  onLocationChange={handleLocationChange}
                />
              </View>
              
              {/* Error message */}
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
            </View>
            
            {/* Navigation Buttons */}
            <View style={styles.buttonsContainer}>
              <TouchableOpacity 
                style={styles.backButton} 
                onPress={handleBack}
                disabled={isLoading}
              >
                <ArrowLeft size={24} color="#000" />
              </TouchableOpacity>
              
              <Button
                title="Continue"
                onPress={handleContinue}
                loading={isLoading}
                style={styles.continueButton}
                rightIcon={<ArrowRight size={20} color="#fff" />}
              />
            </View>
          </OnboardingTemplate>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sliderContainer: {
    marginTop: 30,
    marginBottom: 40,
  },
  budgetDisplay: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  budgetValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  budgetDash: {
    fontSize: 24,
    marginHorizontal: 10,
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  rangeLabel: {
    fontSize: 14,
    color: '#666',
  },
  locationContainer: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    padding: 10,
  },
  continueButton: {
    flex: 1,
    marginLeft: 20,
  },
  errorText: {
    color: 'red',
    marginTop: 10,
    textAlign: 'center',
  },
});
