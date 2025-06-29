import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowRight, Star, Shield, CheckCircle } from 'lucide-react-native';
import OnboardingTemplate from '../../components/features/onboarding/OnboardingTemplate';
import { useUserStore } from '../../store/userStore';
import { getStepNumber, ONBOARDING_STEPS } from '../../store/onboardingConfig';

// Sample testimonials
const testimonials = [
  {
    id: '1',
    name: 'Sarah K.',
    age: 24,
    rating: 5,
    comment: "Found my perfect roommate in just 3 days! We've been living together for 6 months now and it's been amazing.",
    avatar: require('../../assets/images/users/sarah_k_24.png'),
  },
  {
    id: '2',
    name: 'Michael T.',
    age: 26,
    rating: 5,
    comment: "The personality matching really works. My roommate and I have similar habits and we've had zero conflicts.",
    avatar: require('../../assets/images/users/mike_t_26.png'),
  },
  {
    id: '3',
    name: 'Jessica L.',
    age: 23,
    rating: 4,
    comment: "I was skeptical at first, but Roomies helped me find someone who respects my space and shares my interests.",
    avatar: require('../../assets/images/users/jess_l_23.png'),
  },
];

export default function SocialProof() {
  const router = useRouter();
  const { updateOnboardingProgress, onboardingProgress } = useUserStore();
  const totalSteps = Object.values(ONBOARDING_STEPS).length;
  const currentStepIndex = getStepNumber('social-proof');
  
  useEffect(() => {
    // Update onboarding progress
    const updatedCompletedSteps = [...(onboardingProgress?.completedSteps || [])];
    // Previous step is now 'account' (Step 8)
    if (!updatedCompletedSteps.includes('account')) {
      updatedCompletedSteps.push('account'); 
    }
    
    updateOnboardingProgress({
      currentStep: 'social-proof', // This is the social proof step
      completedSteps: updatedCompletedSteps
    });
  }, []);

  const handleContinue = () => {
    // Update progress for next step (notifications - now Step 10)
    const updatedCompletedSteps = [...(onboardingProgress?.completedSteps || [])];
    if (!updatedCompletedSteps.includes('social-proof')) {
      updatedCompletedSteps.push('social-proof');
    }
    updateOnboardingProgress({
      currentStep: 'notifications',
      completedSteps: updatedCompletedSteps
    });
    // Navigate to notifications
    router.push('/(onboarding)/notifications' as any);
  };

  const handleBack = () => {
    router.back();
  };

  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, index) => (
      <Star 
        key={index} 
        size={16} 
        color={index < rating ? '#FBBF24' : '#E5E7EB'} 
        fill={index < rating ? '#FBBF24' : 'none'} 
      />
    ));
  };

  const renderTestimonial = (item: {
    id: string;
    name: string;
    age: number;
    rating: number;
    comment: string;
    avatar: any;
  }) => (
    <View key={item.id} style={styles.testimonialCard}>
      <View style={styles.testimonialHeader}>
        <Image source={item.avatar} style={styles.avatar} />
        <View style={styles.testimonialInfo}>
          <Text style={styles.testimonialName}>{item.name}, {item.age}</Text>
          <View style={styles.ratingContainer}>
            {renderStars(item.rating)}
          </View>
        </View>
      </View>
      <Text style={styles.testimonialComment}>"{item.comment}"</Text>
    </View>
  );

  return (
    <OnboardingTemplate
      step={currentStepIndex}
      totalSteps={totalSteps}
      onBackPress={handleBack}
      onContinuePress={handleContinue}
      title="Join Our Community"
      subtitle="See how Roomies has helped others find their perfect match"
      logoVariant="default"
      buttonPosition="relative"
    >
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Trust indicators */}
        <View style={styles.trustContainer}>
          <View style={styles.trustItem}>
            <Shield size={24} color="#4F46E5" />
            <Text style={styles.trustText}>Verified Users</Text>
          </View>
          <View style={styles.trustItem}>
            <CheckCircle size={24} color="#4F46E5" />
            <Text style={styles.trustText}>95% Match Rate</Text>
          </View>
          <View style={styles.trustItem}>
            <Star size={24} color="#4F46E5" />
            <Text style={styles.trustText}>4.8 App Rating</Text>
          </View>
        </View>
        
        {/* Testimonials */}
        <View style={styles.testimonialSection}>
          <Text style={styles.sectionTitle}>What Our Users Say</Text>
          {testimonials.map(renderTestimonial)}
        </View>
        
        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>93%</Text>
            <Text style={styles.statLabel}>Match Success</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>14k+</Text>
            <Text style={styles.statLabel}>Happy Roommates</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>4.8</Text>
            <Text style={styles.statLabel}>App Rating</Text>
          </View>
        </View>
      </ScrollView>
    </OnboardingTemplate>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  trustContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
  },
  trustItem: {
    alignItems: 'center',
    flex: 1,
  },
  trustText: {
    fontSize: 14,
    color: '#4B5563',
    marginTop: 8,
    fontWeight: '500',
    textAlign: 'center',
  },
  testimonialSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  testimonialCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  testimonialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  testimonialInfo: {
    flex: 1,
  },
  testimonialName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
  },
  testimonialComment: {
    fontSize: 15,
    lineHeight: 22,
    color: '#4B5563',
    fontStyle: 'italic',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#EEF2FF',
    padding: 16,
    borderRadius: 12,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4F46E5',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#4B5563',
    textAlign: 'center',
  },
});
