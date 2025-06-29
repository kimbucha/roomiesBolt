import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableWithoutFeedback,
  TouchableOpacity,
  Keyboard
} from 'react-native';
import RangeSlider from '../../../../components/RangeSlider';
import LocationMapSelector from '../../../../components/LocationMapSelector';
import { logOnboardingInputChange } from '../../../../utils/onboardingDebugUtils';

// Constants for budget slider
const MIN_BUDGET = 0;
const MAX_BUDGET = 10000;
const STEP_BUDGET = 50;

interface BudgetStepProps {
  userData: {
    budget?: {
      min: number;
      max: number;
    };
    location?: any;
  };
  onContinue: (data: any) => void;
}

export default function BudgetStep({ userData, onContinue }: BudgetStepProps) {
  // Budget state using range values instead of string inputs
  const [minBudget, setMinBudget] = useState(
    userData?.budget?.min !== undefined ? userData.budget.min : MIN_BUDGET
  );
  const [maxBudget, setMaxBudget] = useState(
    userData?.budget?.max !== undefined ? userData.budget.max : MAX_BUDGET
  );
  
  // Log initial budget values
  useEffect(() => {
    logOnboardingInputChange('budget', 'initialBudget', {
      min: minBudget,
      max: maxBudget,
      isDefault: minBudget === MIN_BUDGET && maxBudget === MAX_BUDGET
    });
  }, []);
  
  // Location state
  const [location, setLocation] = useState({
    latitude: userData?.location?.latitude || 37.7749, // Default to San Francisco
    longitude: userData?.location?.longitude || -122.4194,
    address: userData?.location?.address || 'San Francisco, CA',
    radius: userData?.location?.radius || 20,
    city: userData?.location?.city || 'San Francisco',
    state: userData?.location?.state || 'CA'
  });
  
  // Log initial location values
  useEffect(() => {
    logOnboardingInputChange('budget', 'initialLocation', {
      location,
      isDefault: !userData?.location?.address
    });
  }, []);
  
  // State to track if location has been set
  const [locationSet, setLocationSet] = useState(!!userData?.location?.address);
  
  // State to track if the form is ready to continue
  const [isFormReady, setIsFormReady] = useState(false);
  
  // Check if form is valid
  useEffect(() => {
    // Form is ready when location is set
    setIsFormReady(locationSet);
  }, [locationSet]);
  
  // Handle budget change
  const handleBudgetChange = (low: number, high: number) => {
    setMinBudget(low);
    setMaxBudget(high);
    
    // Log budget changes
    logOnboardingInputChange('budget', 'budgetRange', {
      min: low,
      max: high,
      isAny: low === MIN_BUDGET && high === MAX_BUDGET,
      displayText: low === MIN_BUDGET && high === MAX_BUDGET ? 'Any' : `$${low} - $${high}`
    });
  };
  
  // Handle location change
  const handleLocationChange = (newLocation: any) => {
    // Parse city and state from the address
    const addressParts = newLocation.address.split(',').map((part: string) => part.trim());
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
    setLocationSet(true);
  };
  
  // Handle continue
  const handleContinue = () => {
    // Prepare data to pass back to parent
    const budgetData = {
      budget: {
        min: minBudget,
        max: maxBudget
      },
      location: location
    };
    
    // Log the final data collected in this step
    logOnboardingInputChange('budget', 'finalData', budgetData);
    
    // Pass the updated data back to the parent
    onContinue(budgetData);
  };
  
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text style={styles.description}>
          Help us find roommates in your price range and area
        </Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What's your rental budget?</Text>
          <RangeSlider
            minValue={MIN_BUDGET}
            maxValue={MAX_BUDGET}
            step={STEP_BUDGET}
            initialLowValue={minBudget}
            initialHighValue={maxBudget}
            onValueChange={handleBudgetChange}
          />
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What's your preferred location?</Text>
          <LocationMapSelector 
            onLocationSelected={handleLocationChange}
            initialRadius={location.radius}
          />
        </View>
        
        {isFormReady && (
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  description: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 24,
    lineHeight: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  continueButton: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
