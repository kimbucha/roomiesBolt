import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import OnboardingTemplate from '../../components/features/onboarding/OnboardingTemplate';
import { useUserStore } from '../../store/userStore';
import { useSupabaseUserStore } from '../../store/supabaseUserStore';
import { useSupabaseAuthStore } from '../../store/supabaseAuthStore';
import { getSkippedOnboardingProfilePicture } from '../../utils/profilePictureHelper';

export default function GetStarted() {
  const router = useRouter();
  const { updateOnboardingProgress, onboardingProgress, user } = useUserStore();
  const { updateUserAndProfile } = useSupabaseUserStore();
  const { user: authUser } = useSupabaseAuthStore();

  const handleBegin = async () => {
    // Update onboarding progress in local state
    updateOnboardingProgress({
      currentStep: 'get-started',
      completedSteps: [...(onboardingProgress?.completedSteps || []), 'get-started'],
    });
    
    // Update profile strength in Supabase
    try {
      const { SupabaseOnboardingProfileUpdater } = require('../../utils/supabaseOnboardingProfileUpdater');
      // Let the updater get the correct ID from auth since user might not be available yet
      await SupabaseOnboardingProfileUpdater.updateAfterStep(user?.id || '', 'get-started');
    } catch (error) {
      console.error('[GetStarted] Error updating profile strength:', error);
    }
    
    // Navigate to goals (what brings you here) - NEW FIRST STEP
    router.push('/(onboarding)/goals');
  };

  const handleSkip = async () => {
    console.log('User chose to skip onboarding, setting potato default profile picture');
    
    try {
      // Use the new ProfileImageService to set potato default
      const { ProfileImageService, ProfileImageType } = require('../../utils/profileImageService');
      
      const potatoIdentifier = ProfileImageService.getDatabaseIdentifier({
        type: ProfileImageType.POTATO_DEFAULT,
        source: null
      });
      
      // Update user with potato image and mark onboarding as completed
      const updateResult = await updateUserAndProfile({
        profilePicture: potatoIdentifier,
        onboardingCompleted: true
      }, { validate: false });
      
      if (updateResult.success) {
        console.log('[GetStarted] Successfully set potato profile picture and completed onboarding');
        
        // Navigate to main app
        router.replace('/(tabs)');
      } else {
        console.error('[GetStarted] Failed to update user profile:', updateResult.error);
        Alert.alert('Error', 'Failed to save profile. Please try again.');
      }
    } catch (error) {
      console.error('[GetStarted] Error in handleSkip:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  return (
    <OnboardingTemplate
      hideHeader={false}
      hideProgress
      showBack={false}
      showContinue
      continueText="Let's Begin"
      onContinuePress={handleBegin}
      contentContainerStyle={styles.contentContainer}
      title="Welcome to Roomies"
      subtitle="Complete your profile for the best matches"
    >
      <Image
        source={require('../../assets/images/hero.png')}
        style={styles.heroImage}
        resizeMode="contain"
      />
      <Text style={styles.description}>
        Tell us your budget, location, preferences, take our in-depth personality quiz, and add photos to find your perfect roommate.
      </Text>
      <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
        <Text style={styles.skipText}>Skip for now</Text>
      </TouchableOpacity>
    </OnboardingTemplate>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  heroImage: {
    width: 200,
    height: 200,
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  skipButton: {
    marginTop: 16,
  },
  skipText: {
    fontSize: 16,
    color: '#6B7280',
    textDecorationLine: 'underline',
  },
});
