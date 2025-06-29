import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import OnboardingTemplate from '../../../components/features/onboarding/OnboardingTemplate';
import { useUserStore } from '../../../store/userStore';
import { CheckCircle2 } from 'lucide-react-native';
import { getStepNumber, ONBOARDING_STEPS } from '../../../store/onboardingConfig';

export default function PersonalityIntro() {
  const router = useRouter();
  const { updateOnboardingProgress, onboardingProgress, user } = useUserStore();
  // NEW: Personality is step 4 of the room seeker branch (restart counting after goals)
  const totalSteps = 7; // Room seeker branch steps only
  const currentStepIndex = 4; // Fixed step number - personality is step 4 of room seeker branch
  
  useEffect(() => {
    // Update onboarding progress
    const updatedCompletedSteps = [...(onboardingProgress?.completedSteps || [])];
    if (!updatedCompletedSteps.includes('preferences')) {
      updatedCompletedSteps.push('preferences');
    }
    
    updateOnboardingProgress({
      currentStep: 'personality/intro',
      completedSteps: updatedCompletedSteps
    });
  }, []);

  const handleContinue = () => {
    // Update onboarding progress for the next step
    const updatedCompletedSteps = [...(onboardingProgress?.completedSteps || [])];
    if (!updatedCompletedSteps.includes('personality/intro')) {
      updatedCompletedSteps.push('personality/intro');
    }
    
    updateOnboardingProgress({
      currentStep: 'personality/quiz',
      completedSteps: updatedCompletedSteps
    });
    
    // Navigate to the consolidated personality quiz instead of separate dimension pages
    router.push('/(onboarding)/personality/quiz');
  };

  const handleBack = () => {
    // Use router.back() to ensure proper navigation flow
    // This will return to the previous screen in the navigation stack
    router.back();
  };

  return (
    <OnboardingTemplate
      step={currentStepIndex}
      totalSteps={totalSteps}
      onBackPress={handleBack}
      onContinuePress={handleContinue}
      title="Discover Your Roommate Compatibility"
      subtitle="Based on the scientifically-validated Myers-Briggs Type Indicator"
      greeting={`Hey ${user?.name ? user.name : 'there'}`}
      disableScroll={true}
    >
      <View style={styles.content}>
        <View style={styles.imageContainer}>
          <Image 
            source={require('../../../assets/images/personality.jpeg')} 
            style={styles.image}
            resizeMode="contain"
          />
        </View>
        
        <View style={styles.statsContainer}>
          <Text style={styles.statHighlight}>85%</Text>
          <Text style={styles.statDescription}>
            of users find better matches with personality insights. This quick assessment helps us understand your preferences and habits.
          </Text>
        </View>
        
        <View style={styles.benefitsContainer}>
          <View style={styles.benefitItem}>
            <CheckCircle2 size={24} color="#6366F1" style={styles.benefitIcon} />
            <Text style={styles.benefitText}>Only takes 2-3 minutes to complete.</Text>
          </View>
          
          <View style={styles.benefitItem}>
            <CheckCircle2 size={24} color="#6366F1" style={styles.benefitIcon} />
            <Text style={styles.benefitText}>Identifies your ideal roommate types.</Text>
          </View>
          
          <View style={styles.benefitItem}>
            <CheckCircle2 size={24} color="#6366F1" style={styles.benefitIcon} />
            <Text style={styles.benefitText}>Improves your matching accuracy by 65%.</Text>
          </View>
        </View>
      </View>
    </OnboardingTemplate>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingVertical: 8,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  image: {
    width: 200,
    height: 160,
  },
  statsContainer: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
  },
  statHighlight: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4F46E5',
    marginBottom: 4,
    textAlign: 'center',
  },
  statDescription: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
    textAlign: 'center',
  },
  benefitsContainer: {
    marginBottom: 8,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitIcon: {
    marginRight: 10,
  },
  benefitText: {
    fontSize: 15,
    color: '#1F2937',
    flex: 1,
  },
});
