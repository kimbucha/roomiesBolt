import { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Easing, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { getStepNumber, ONBOARDING_STEPS } from '../../store/onboardingConfig';
import OnboardingTemplate from '../../components/features/onboarding/OnboardingTemplate';
import { useUserStore } from '../../store/userStore';

type PreferenceOption = {
  id: string;
  label: string;
};

type GenderOption = {
  id: string;
  label: string;
};

const genderOptions: GenderOption[] = [
  { id: 'male', label: 'Male' },
  { id: 'female', label: 'Female' },
  { id: 'other', label: 'Other' },
  { id: 'prefer_not_to_say', label: 'Prefer not to say' },
];

const personalityTraits: PreferenceOption[] = [
  { id: 'outgoing', label: 'Outgoing' },
  { id: 'quiet', label: 'Quiet' },
  { id: 'organized', label: 'Organized' },
  { id: 'relaxed', label: 'Relaxed' },
  { id: 'studious', label: 'Studious' },
  { id: 'social', label: 'Social' },
  { id: 'private', label: 'Private' },
  { id: 'clean', label: 'Clean' },
  { id: 'creative', label: 'Creative' },
  { id: 'active', label: 'Active' },
  { id: 'practical', label: 'Practical' },
  { id: 'adventurous', label: 'Adventurous' },
];

const MAX_SELECTIONS = 5;

export default function Preferences() {
  const router = useRouter();
  const optionalTotalSteps = Object.values(ONBOARDING_STEPS).length - 1;
  const currentStepIndex = getStepNumber('preferences') - 1;
  const { updateOnboardingProgress, updateUser, user, onboardingProgress } = useUserStore();
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);
  const [selectedGender, setSelectedGender] = useState<string | null>(user?.gender || null);
  
  useEffect(() => {
    // Update onboarding progress
    const updatedCompletedSteps = [...(onboardingProgress?.completedSteps || [])];
    if (!updatedCompletedSteps.includes('goals')) {
      updatedCompletedSteps.push('goals');
    }
    
    updateOnboardingProgress({
      currentStep: 'preferences',
      completedSteps: updatedCompletedSteps
    });
    
    // During onboarding, start with fresh selections
    setSelectedPreferences([]);
    
    // Set gender from user data if available
    if (user?.gender) {
      setSelectedGender(user.gender);
    }
  }, []);
  
  // Toggle preference selection
  const togglePreference = (id: string) => {
    if (selectedPreferences.includes(id)) {
      setSelectedPreferences(selectedPreferences.filter(p => p !== id));
    } else {
      // Limit to 5 selections
      if (selectedPreferences.length < 5) {
        setSelectedPreferences([...selectedPreferences, id]);
      }
    }
  };
  
  // Select gender
  const selectGender = (id: string) => {
    setSelectedGender(id);
  };
  
  // Handle save and continue
  const handleContinue = () => {
    if (selectedPreferences.length === 0 || !selectedGender) {
      return;
    }
    
    // Update user preferences
    updateUser({
      ...user,
      personalityTraits: selectedPreferences,
      gender: selectedGender,
    });
    
    // Update onboarding progress
    const updatedCompletedSteps = [...(onboardingProgress?.completedSteps || [])];
    if (!updatedCompletedSteps.includes('preferences')) {
      updatedCompletedSteps.push('preferences');
    }
    
    updateOnboardingProgress({
      currentStep: 'photos',
      completedSteps: updatedCompletedSteps
    });
    
    // Navigate to the photos page (step 7)
    router.push('/(onboarding)/photos');
  };
  
  const handleBack = () => {
    router.back();
  };

  return (
    <OnboardingTemplate
      step={currentStepIndex}
      totalSteps={optionalTotalSteps}
      onBackPress={() => router.back()}
      onContinuePress={handleContinue}
      continueDisabled={selectedPreferences.length === 0 || !selectedGender}
      title="About You"
      subtitle="Help us find roommates with compatible living habits"
      greeting={`Hey ${user?.name ? user.name : 'there'}`}
      buttonPosition="relative"
      disableScroll={true}
    >

      <Text className="text-sm text-gray-600 mb-1 mt-2">
        Select up to 5 traits that describe you:
      </Text>

      <View className="flex-row flex-wrap justify-between px-0">
        {personalityTraits.map((trait) => (
          <TouchableOpacity
            key={trait.id}
            className={`
              bg-gray-100 px-2 py-2 rounded-lg mb-1.5 mx-px w-[32%] items-center justify-center
              ${selectedPreferences.includes(trait.id) ? 'bg-indigo-100 border border-indigo-600' : ''}
            `}
            onPress={() => togglePreference(trait.id)}
          >
            <Text 
              className={`
                text-xs text-gray-700 font-medium
                ${selectedPreferences.includes(trait.id) ? 'text-indigo-700 font-semibold' : ''}
              `}
            >
              {trait.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View className="mb-5">
        <Text className="text-xs text-gray-500 text-center">
          {selectedPreferences.length} of {MAX_SELECTIONS} answered
        </Text>
      </View>

      <View className="h-2" /> 

      <Text className="text-sm text-gray-600 mb-1">
        What is your gender?
      </Text>

      <View className="flex-row flex-wrap justify-between mb-1">
        {genderOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            className={`
              bg-gray-100 px-2.5 py-1.5 rounded-lg mb-1.5 w-[48%] items-center justify-center
              ${selectedGender === option.id ? 'bg-indigo-100 border border-indigo-600' : ''}
            `}
            onPress={() => selectGender(option.id)}
          >
            <Text 
              className={`
                text-sm text-gray-700 font-medium
                ${selectedGender === option.id ? 'text-indigo-700 font-semibold' : ''}
              `}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </OnboardingTemplate>
  );
}