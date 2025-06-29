import { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Easing, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import OnboardingTemplate from '../../components/features/onboarding/OnboardingTemplate';
import { useUserStore } from '../../store/userStore';
import { getStepNumber, ONBOARDING_STEPS } from '../../store/onboardingConfig';


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

export default function AboutYou() {
  const router = useRouter();
  const { type } = useLocalSearchParams<{ type: string }>();
  const personalityType = type; // Store the personality type from URL params
  const { updateOnboardingProgress, updateUserAndProfile, user, onboardingProgress } = useUserStore();
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);
  const [selectedGender, setSelectedGender] = useState<string | null>(null);
  // NEW: About You is step 3 of the room seeker branch (restart counting after goals)
  const totalSteps = 7; // Room seeker branch steps
  const currentStepIndex = 3; // Fixed step number - about-you is step 3 of room seeker branch
  
  useEffect(() => {
    if (personalityType) {
      // Update user with personality type
      updateUserAndProfile({
        personalityType
      }, { validate: false });
    }
  }, [personalityType]);

  useEffect(() => {
    // Update onboarding progress
    const updatedCompletedSteps = [...(onboardingProgress?.completedSteps || [])];
    if (!updatedCompletedSteps.includes('goals')) {
      updatedCompletedSteps.push('goals');
    }

    updateOnboardingProgress({
      currentStep: 'about-you',
      completedSteps: updatedCompletedSteps
    });

    // During onboarding, start with fresh selections
    setSelectedPreferences([]);

    // Set gender from user data if available
    setSelectedGender(null); // Ensure gender starts unselected for onboarding
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

  // Handle gender selection
  const handleGenderSelect = (id: string) => {
    // Only update the local state, we'll save everything at once when continuing
    setSelectedGender(id);
  };

  // Handle save and continue
  const handleContinue = () => {
    if (selectedPreferences.length === 0 || !selectedGender) {
      console.error('Please select your personality traits and gender');
      return;
    }
    
    // Save personality traits and gender to user profile and sync with roommate profile
    const result = updateUserAndProfile({
      personalityTraits: selectedPreferences,
      gender: selectedGender as 'male' | 'female' | 'other' | 'prefer_not_to_say',
      // Make sure we preserve the personality type if it exists
      personalityType: personalityType || user?.personalityType
    }, { validate: true });
    
    if (!result.success) {
      console.error('Error saving your preferences:', result.error);
      return;
    }
    
    // Update profile strength in Supabase
    if (user?.id) {
      try {
        const { SupabaseOnboardingProfileUpdater } = require('../../utils/supabaseOnboardingProfileUpdater');
        const stepData = {
          gender: selectedGender,
          personality_traits: selectedPreferences
        };
        
        // Update profile strength asynchronously
                  SupabaseOnboardingProfileUpdater.updateAfterStep(user.id, 'about-you', stepData);
        console.log('[AboutYou] Updating profile strength after completing about-you step');
      } catch (error) {
        console.error('[AboutYou] Error updating profile strength:', error);
      }
    }
    
    // Update onboarding progress
    const updatedCompletedSteps = [...(onboardingProgress?.completedSteps || [])];
    if (!updatedCompletedSteps.includes('about-you')) {
      updatedCompletedSteps.push('about-you');
    }
    
    updateOnboardingProgress({
      currentStep: 'personality/intro', // NEW: Navigate to personality after about-you
      completedSteps: updatedCompletedSteps
    });
    
    // NEW: Navigate to the personality intro page (moved after about-you)
    router.push('/(onboarding)/personality/intro');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <OnboardingTemplate
      step={currentStepIndex}
      totalSteps={totalSteps}
      onBackPress={() => router.back()}
      onContinuePress={handleContinue}
      continueDisabled={selectedPreferences.length === 0 || !selectedGender}
      title="About You"
      subtitle="Help us find roommates with compatible living habits"
      greeting={`Hey ${user?.name ? user.name : 'there'}`}
      buttonPosition="relative"
      disableScroll={true}
    >
        <View style={{ alignItems: 'center' }}>
          <Image
            source={require('../../assets/images/about_you.png')}
            style={{ width: '100%', height: 140 }}
            resizeMode="contain"
          />
        </View>
      <Text className="text-sm text-gray-600 mb-1 mt-1">
        Select up to 5 traits that describe you:
      </Text>

      <View className="flex-row flex-wrap justify-between px-0">
        {personalityTraits.map((trait) => (
          <TouchableOpacity
            key={trait.id}
            className={`
              bg-gray-100 px-2 py-2 rounded-lg mb-1 mx-px w-[32%] items-center justify-center
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

      <View className="mb-1">
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
            onPress={() => handleGenderSelect(option.id)}
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