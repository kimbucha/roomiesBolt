import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';
import OnboardingTemplate from '../../components/features/onboarding/OnboardingTemplate';
import { useSupabaseUserStore } from '../../store/supabaseUserStore';
import { useSupabaseAuthStore } from '../../store/supabaseAuthStore';
import { useUserStore } from '../../store/userStore';
import { getStepNumber, ONBOARDING_STEPS } from '../../store/onboardingConfig';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SupabaseOnboardingProfileUpdater } from '../../utils/supabaseOnboardingProfileUpdater';
import { logCritical } from '../../utils/onboardingDebugUtils';

// Placeholder function to request permissions
async function registerForPushNotificationsAsync() {
  let token;
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    Alert.alert('Notifications Disabled', 'You can enable notifications later in your app settings.');
    return null;
  }
  
  // Get the token that identifies this device
  try {
      // Check if we're running in Expo Go or a development environment
      const isExpoGo = Constants.executionEnvironment === 'storeClient';
      
      if (isExpoGo) {
          console.log("Running in Expo Go - using development fallback token");
          return 'expo-go-notification-token';
      }
      
      // For development builds or standalone apps
      let projectId;
      
      // Try different paths to find projectId
      if (Constants.expoConfig?.extra?.eas?.projectId) {
          projectId = Constants.expoConfig.extra.eas.projectId;
      } else if (Constants.manifest?.extra?.eas?.projectId) {
          projectId = Constants.manifest.extra.eas.projectId;
      } else if (Constants.appConfig?.extra?.eas?.projectId) {
          projectId = Constants.appConfig.extra.eas.projectId;
      } else {
          // Fallback for development
          console.log("No project ID found - using development fallback");
          return 'dev-notification-token';
      }
      
      token = (await Notifications.getExpoPushTokenAsync({
          projectId: projectId,
      })).data;
      console.log('Push Token:', token);
  } catch (e) {
      console.error("Failed to get push token", e);
      // In development or Expo Go, we'll simulate success
      return 'dev-notification-token';
  }

  return token;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const { updateUserAndProfile } = useSupabaseUserStore();
  const { user } = useSupabaseAuthStore();
  // NEW: Dynamic step numbers based on user role (restart counting for each branch)
  // Place listers: step 3 of 3, Room seekers: step 7 of 7
  const { user: storeUser } = useUserStore();
  const userRole = storeUser?.userRole;
  const isPlaceLister = userRole === 'place_lister';
  const totalSteps = isPlaceLister ? 3 : 7;
  const currentStepIndex = isPlaceLister ? 3 : 7;

  const completeOnboarding = async (enabledNotifications: boolean) => {
    try {
      // Use simplified critical logging
      logCritical('🎯 Completing onboarding and saving to Supabase...');
      
      // Use the proper onboarding profile updater to mark onboarding as completed
      // Note: Not passing notificationsEnabled since that column doesn't exist in current schema
      await SupabaseOnboardingProfileUpdater.updateAfterStep(
        user?.id || '',
        'notifications',
        { 
          // Only pass essential completion data
          onboardingCompleted: true  // This will be handled by the formatter
        }
      );
      
      // Use simplified critical logging
      logCritical('✅ Onboarding completed successfully!');
      logCritical(`Notifications enabled: ${enabledNotifications}`);
      
      // CRITICAL FIX: Fetch updated profile data from Supabase
      // Add small delay to ensure database transaction completes
      logCritical('🔄 Waiting for database transaction to complete...');
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
      
      logCritical('🔄 Fetching updated profile data after onboarding completion...');
      const { fetchUserProfile } = useSupabaseUserStore.getState();
      const fetchResult = await fetchUserProfile();
      
      if (fetchResult.success) {
        logCritical('✅ Profile data refreshed successfully after onboarding');
      } else {
        logCritical(`❌ Failed to refresh profile data: ${fetchResult.error}`);
      }
      
      // Clear any stale AsyncStorage onboarding data now that we're done
      await AsyncStorage.removeItem('onboarding_progress');
      
      // Navigate to the main app
      router.replace('/(tabs)' as any);
    } catch (error) {
      console.error('[Notifications] Error completing onboarding:', error);
      
      // Even if there's an error saving to Supabase, navigate to main app
      // The user can retry from the profile settings
      Alert.alert(
        'Almost Done!', 
        'Your onboarding is complete, but we had trouble saving some settings. You can update them later in your profile.',
        [{ text: 'Continue', onPress: () => router.replace('/(tabs)' as any) }]
      );
    }
  };

  const handleEnableNotifications = async () => {
    try {
      const token = await registerForPushNotificationsAsync();
      
      // Complete onboarding with notifications enabled
      await completeOnboarding(true);
    } catch (error) {
      console.error('Error in notification setup:', error);
      // Even if there's an error, we'll complete onboarding
      // but mark notifications as not enabled
      await completeOnboarding(false);
    }
  };

  const handleSkip = async () => {
    await completeOnboarding(false); // Notifications not enabled
  };
  
  const handleBack = () => {
    // Navigate back to the previous step (social-proof)
    router.back(); 
  };

  return (
    <View style={{ flex: 1 }}>
      <OnboardingTemplate
        step={currentStepIndex}
        totalSteps={totalSteps}
        onBackPress={handleBack}
        // Use the Enable Notifications button as the primary continue button
        showContinue={true}
        continueText="Enable Notifications"
        onContinuePress={handleEnableNotifications}
        title="Stay Updated"
        subtitle="Enable notifications to get alerts about new matches and messages"
        logoVariant="default"
        buttonPosition="relative"
        disableScroll={true}
      >
        <View style={styles.container}>
          {/* Icon/Content Area */}
          <View style={styles.contentArea}> 
            <View style={styles.iconContainer}>
              <Image
                source={require('../../assets/images/bell.png')}
                style={styles.bellImage}
                resizeMode="contain"
              />
            </View>
          </View>
        </View>
      </OnboardingTemplate>
      
      {/* Skip Button - positioned right above the footer divider */}
      <View style={styles.skipButtonContainer}>
        <TouchableOpacity 
          style={styles.skipButton} 
          onPress={handleSkip}
          activeOpacity={0.7}
        >
          <Text style={styles.skipButtonText}>Skip for Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  contentArea: {
    flex: 1, // Take up remaining space above buttons
    justifyContent: 'center', // Center icon vertically in this area
    alignItems: 'center',
    marginBottom: 8, // Reduced space between content and skip button
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.8,
  },
  bellImage: {
    width: 200,
    height: 200,
  },
  skipButtonContainer: {
    position: 'absolute',
    bottom: 130, // Position higher above the footer for better spacing
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 8,
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  skipButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '500',
  },
  // Removed primaryButton styles since we're using the template's button for Enable Notifications
}); 