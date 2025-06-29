import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowRight, Bell, BellOff } from 'lucide-react-native';
import { Button } from '../components';
import OnboardingScreen from '../components/OnboardingScreen';
import { useUserStore } from '../store/userStore';

// Mock implementation for expo-notifications
// In a real app, you would install this package with:
// npm install expo-notifications
const Notifications = {
  getPermissionsAsync: async () => ({ status: 'granted' }),
  requestPermissionsAsync: async () => ({ status: 'granted' }),
};

export default function NotificationsPermission() {
  const router = useRouter();
  const { updateOnboardingProgress, onboardingProgress, updateUser } = useUserStore();
  const [permissionStatus, setPermissionStatus] = useState<string | null>(null);
  
  useEffect(() => {
    // Update onboarding progress
    const updatedCompletedSteps = [...onboardingProgress.completedSteps];
    if (!updatedCompletedSteps.includes('notifications')) {
      updatedCompletedSteps.push('notifications');
    }
    
    updateOnboardingProgress({
      currentStep: 'notifications',
      completedSteps: updatedCompletedSteps
    });
    
    // Check current notification permission status
    checkNotificationPermission();
  }, []);
  
  const checkNotificationPermission = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setPermissionStatus(status);
  };
  
  const requestNotificationPermission = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      setPermissionStatus(status);
      
      // Update user preferences
      updateUser({
        preferences: {
          notifications: status === 'granted',
          darkMode: false,
          language: 'en'
        }
      });
      
      if (status === 'granted') {
        // Permission granted, continue to dashboard
        completeOnboarding();
      } else {
        // Show alert explaining why notifications are important
        Alert.alert(
          "Notifications Disabled",
          "You won't receive alerts about new matches or messages. You can enable notifications later in your settings.",
          [
            { text: "Continue Anyway", onPress: completeOnboarding }
          ]
        );
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      // Continue anyway if there's an error
      completeOnboarding();
    }
  };
  
  const completeOnboarding = () => {
    // Mark onboarding as complete
    updateOnboardingProgress({
      currentStep: 'complete',
      completedSteps: [...onboardingProgress.completedSteps, 'complete'],
      isComplete: true
    });
    
    // Navigate to the main app
    router.replace('/(tabs)');
  };
  
  const skipNotifications = () => {
    // Update user preferences to indicate they declined notifications
    updateUser({
      preferences: {
        notifications: false,
        darkMode: false,
        language: 'en'
      }
    });
    
    completeOnboarding();
  };

  const renderFooter = () => (
    <View style={styles.footerContainer}>
      <Button
        title="Enable Notifications"
        onPress={requestNotificationPermission}
        rightIcon={<ArrowRight size={20} color="#fff" />}
        fullWidth
      />
      <Button
        title="Skip for Now"
        onPress={skipNotifications}
        variant="outline"
        style={styles.skipButton}
        fullWidth
      />
    </View>
  );

  return (
    <OnboardingScreen
      title="Stay Updated"
      subtitle="Enable notifications to get alerts about new matches and messages"
      currentStep={12}
      totalSteps={12}
      footer={renderFooter()}
    >
      <View style={styles.container}>
        <View style={styles.imageContainer}>
          <Image 
            source={require('../assets/images/icon.png')} 
            style={styles.image}
            defaultSource={require('../assets/images/icon.png')}
          />
        </View>
        
        <View style={styles.benefitsContainer}>
          <Text style={styles.benefitsTitle}>Why enable notifications?</Text>
          
          <View style={styles.benefitItem}>
            <View style={styles.benefitIconContainer}>
              <Bell size={24} color="#4F46E5" />
            </View>
            <View style={styles.benefitTextContainer}>
              <Text style={styles.benefitTitle}>New Match Alerts</Text>
              <Text style={styles.benefitDescription}>
                Get notified immediately when you match with a potential roommate
              </Text>
            </View>
          </View>
          
          <View style={styles.benefitItem}>
            <View style={styles.benefitIconContainer}>
              <Bell size={24} color="#4F46E5" />
            </View>
            <View style={styles.benefitTextContainer}>
              <Text style={styles.benefitTitle}>Message Notifications</Text>
              <Text style={styles.benefitDescription}>
                Never miss an important message from your matches
              </Text>
            </View>
          </View>
          
          <View style={styles.benefitItem}>
            <View style={styles.benefitIconContainer}>
              <Bell size={24} color="#4F46E5" />
            </View>
            <View style={styles.benefitTextContainer}>
              <Text style={styles.benefitTitle}>Roommate Reminders</Text>
              <Text style={styles.benefitDescription}>
                Receive timely updates about your roommate search progress
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.privacyNote}>
          <BellOff size={16} color="#6B7280" style={styles.privacyIcon} />
          <Text style={styles.privacyText}>
            You can change your notification preferences anytime in your account settings
          </Text>
        </View>
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  imageContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  image: {
    width: 240,
    height: 240,
    resizeMode: 'contain',
  },
  benefitsContainer: {
    width: '100%',
    marginBottom: 24,
  },
  benefitsTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: '#1F2937',
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  benefitIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  benefitTextContainer: {
    flex: 1,
  },
  benefitTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 4,
  },
  benefitDescription: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
  },
  privacyIcon: {
    marginRight: 8,
  },
  privacyText: {
    flex: 1,
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#6B7280',
  },
  footerContainer: {
    width: '100%',
  },
  skipButton: {
    marginTop: 50,
  },
});
