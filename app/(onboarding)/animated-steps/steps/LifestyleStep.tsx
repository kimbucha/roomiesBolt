import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView 
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Check } from 'lucide-react-native';
import { logOnboardingInputChange, logOnboardingStepComplete } from '../../../../utils/onboardingDebugUtils';

interface LifestyleStepProps {
  userData: {
    lifestylePreferences?: {
      cleanliness: number;
      noise: number;
      guestFrequency: number;
      smoking: boolean;
      pets: boolean;
    };
  };
  onContinue: (data: any) => void;
}

export default function LifestyleStep({ userData, onContinue }: LifestyleStepProps) {
  // Lifestyle preferences state
  const [cleanliness, setCleanliness] = useState(userData?.lifestylePreferences?.cleanliness || 50);
  const [noise, setNoise] = useState(userData?.lifestylePreferences?.noise || 50);
  const [guestFrequency, setGuestFrequency] = useState(userData?.lifestylePreferences?.guestFrequency || 50);
  const [smoking, setSmoking] = useState(userData?.lifestylePreferences?.smoking || false);
  const [pets, setPets] = useState(userData?.lifestylePreferences?.pets || false);
  
  // Log initial lifestyle preferences
  useEffect(() => {
    logOnboardingInputChange('lifestyle', 'initialPreferences', {
      cleanliness,
      noise,
      guestFrequency,
      smoking,
      pets,
      isDefault: !userData?.lifestylePreferences
    });
  }, []);
  
  // Handle continue
  const handleContinue = () => {
    // Prepare lifestyle preferences data
    const lifestylePreferences = {
      cleanliness,
      noise,
      guestFrequency,
      smoking,
      pets
    };
    
    // Log the final lifestyle preferences
    logOnboardingStepComplete('lifestyle', {
      lifestylePreferences,
      cleanlinessLabel: getSliderLabel(cleanliness, cleanlinessLabels),
      noiseLabel: getSliderLabel(noise, noiseLabels),
      guestFrequencyLabel: getSliderLabel(guestFrequency, guestLabels)
    });
    
    // Pass the updated data back to the parent
    onContinue({
      lifestylePreferences
    });
  };
  
  // Get label for slider value
  const getSliderLabel = (value: number, labels: string[]) => {
    const index = Math.floor((value / 100) * (labels.length - 1));
    return labels[index];
  };
  
  // Cleanliness labels
  const cleanlinessLabels = ['Relaxed', 'Tidy', 'Very Clean', 'Spotless'];
  
  // Noise labels
  const noiseLabels = ['Very Quiet', 'Quiet Hours', 'Some Noise OK', 'Lively'];
  
  // Guest frequency labels
  const guestLabels = ['Rarely', 'Occasionally', 'Weekends', 'Frequently'];
  
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.description}>
        Help us find roommates with compatible living habits
      </Text>
      
      {/* Cleanliness Preference */}
      <View style={styles.preferenceContainer}>
        <Text style={styles.preferenceTitle}>Cleanliness</Text>
        <Text style={styles.preferenceValue}>
          {getSliderLabel(cleanliness, cleanlinessLabels)}
        </Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={100}
          value={cleanliness}
          onValueChange={(value) => {
            setCleanliness(value);
            logOnboardingInputChange('lifestyle', 'cleanliness', {
              value,
              label: getSliderLabel(value, cleanlinessLabels)
            });
          }}
          minimumTrackTintColor="#6366F1"
          maximumTrackTintColor="#E5E7EB"
          thumbTintColor="#6366F1"
        />
        <View style={styles.labelContainer}>
          <Text style={styles.labelText}>Relaxed</Text>
          <Text style={styles.labelText}>Spotless</Text>
        </View>
      </View>
      
      {/* Noise Preference */}
      <View style={styles.preferenceContainer}>
        <Text style={styles.preferenceTitle}>Noise Level</Text>
        <Text style={styles.preferenceValue}>
          {getSliderLabel(noise, noiseLabels)}
        </Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={100}
          value={noise}
          onValueChange={(value) => {
            setNoise(value);
            logOnboardingInputChange('lifestyle', 'noise', {
              value,
              label: getSliderLabel(value, noiseLabels)
            });
          }}
          minimumTrackTintColor="#6366F1"
          maximumTrackTintColor="#E5E7EB"
          thumbTintColor="#6366F1"
        />
        <View style={styles.labelContainer}>
          <Text style={styles.labelText}>Very Quiet</Text>
          <Text style={styles.labelText}>Lively</Text>
        </View>
      </View>
      
      {/* Guest Frequency */}
      <View style={styles.preferenceContainer}>
        <Text style={styles.preferenceTitle}>Guest Frequency</Text>
        <Text style={styles.preferenceValue}>
          {getSliderLabel(guestFrequency, guestLabels)}
        </Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={100}
          value={guestFrequency}
          onValueChange={(value) => {
            setGuestFrequency(value);
            logOnboardingInputChange('lifestyle', 'guestFrequency', {
              value,
              label: getSliderLabel(value, guestLabels)
            });
          }}
          minimumTrackTintColor="#6366F1"
          maximumTrackTintColor="#E5E7EB"
          thumbTintColor="#6366F1"
        />
        <View style={styles.labelContainer}>
          <Text style={styles.labelText}>Rarely</Text>
          <Text style={styles.labelText}>Frequently</Text>
        </View>
      </View>
      
      {/* Toggle Options */}
      <View style={styles.togglesContainer}>
        <TouchableOpacity
          style={styles.toggleOption}
          onPress={() => {
            const newValue = !smoking;
            setSmoking(newValue);
            logOnboardingInputChange('lifestyle', 'smoking', {
              value: newValue,
              label: newValue ? 'Allowed' : 'Not allowed'
            });
          }}
        >
          <View style={[
            styles.checkbox,
            smoking && styles.checkboxSelected
          ]}>
            {smoking && <Check size={16} color="#FFFFFF" />}
          </View>
          <Text style={styles.toggleText}>Smoking allowed</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.toggleOption}
          onPress={() => {
            const newValue = !pets;
            setPets(newValue);
            logOnboardingInputChange('lifestyle', 'pets', {
              value: newValue,
              label: newValue ? 'Allowed' : 'Not allowed'
            });
          }}
        >
          <View style={[
            styles.checkbox,
            pets && styles.checkboxSelected
          ]}>
            {pets && <Check size={16} color="#FFFFFF" />}
          </View>
          <Text style={styles.toggleText}>Pets allowed</Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity
        style={styles.continueButton}
        onPress={handleContinue}
      >
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>
    </ScrollView>
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
  preferenceContainer: {
    marginBottom: 24,
  },
  preferenceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  preferenceValue: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '500',
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -8,
  },
  labelText: {
    fontSize: 12,
    color: '#6B7280',
  },
  togglesContainer: {
    marginBottom: 24,
  },
  toggleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  toggleText: {
    fontSize: 16,
    color: '#1F2937',
  },
  continueButton: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 40,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
