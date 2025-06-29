import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Home, Search, Users, Eye } from 'lucide-react-native';
import OnboardingTemplate from '../../components/features/onboarding/OnboardingTemplate';
import { useUserStore } from '../../store/userStore';
import { showToast } from '../../components/common/Toast';
import { getStepNumber, ONBOARDING_STEPS } from '../../store/onboardingConfig';

type GoalOption = {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
};

const goalOptions: GoalOption[] = [
  {
    id: 'explore-together',
    label: 'Looking for roomies to move in with',
    icon: <Users size={22} color="#4F46E5" />,
    description: 'Looking to team up to find a new place together'
  },
  {
    id: 'find-room',
    label: 'Finding a room to move into',
    icon: <Search size={22} color="#4F46E5" />,
    description: 'I need to find a place with existing roomies'
  },
  {
    id: 'find-roommates',
    label: 'Got a place, looking for roomies',
    icon: <Home size={22} color="#4F46E5" />,
    description: 'I have a place and need to find roommates'
  },

  // Removed the 'browsing' option for simplification
  // {
  //   id: 'browsing',
  //   label: 'Just browsing for now',
  //   icon: <Eye size={22} color="#4F46E5" />,
  //   description: ''
  // },
];

// New memoized component for rendering a single goal option
interface GoalOptionItemProps {
  option: GoalOption;
  isSelected: boolean;
  onPress: (id: string) => void;
}

const GoalOptionItem: React.FC<GoalOptionItemProps> = React.memo(({ option, isSelected, onPress }) => {
  return (
    <TouchableOpacity
      key={option.id} // Keep key here for React reconciliation
      style={[
        styles.optionCard,
        isSelected && styles.selectedOptionCard
      ]}
      onPress={() => onPress(option.id)}
    >
      <View style={styles.optionHeader}>
        <View style={[
          styles.iconContainer,
          isSelected && styles.selectedIconContainer
        ]}>
          {option.icon}
        </View>
        <View style={styles.textContainer}>
          <Text style={[
            styles.optionLabel,
            isSelected && styles.selectedOptionLabel
          ]}>
            {option.label}
          </Text>
          {option.description ? (
            <Text style={[
              styles.optionDescription,
              isSelected && styles.selectedOptionDescription
            ]}>
              {option.description}
            </Text>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
});

export default function Goals() {
  const router = useRouter();
  const { type } = useLocalSearchParams<{ type: string }>();
  const personalityType = type; // Store the personality type from URL params (if any)
  const { updateOnboardingProgress, updateUserAndProfile, onboardingProgress, user } = useUserStore();
  
  // NEW: Goals is now step 4 (welcome → account → get-started → goals)
  const currentStepIndex = 4; // Fixed step number since this is now step 4
  const totalSteps = 11; // Will be dynamic based on user path later (room seeker flow)
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  
  // Handle personality type from URL params if present (for backward compatibility)
  useEffect(() => {
    if (personalityType && (!user?.personalityType || user.personalityType !== personalityType)) {
      console.log('DEBUG - Updating user store with personality type from params:', personalityType);
      updateUserAndProfile({
        personalityType: personalityType
      }, { validate: false });
    }
  }, [personalityType]);
  
  useEffect(() => {
    // Update onboarding progress - Goals is now step 2
    const updatedCompletedSteps = [...(onboardingProgress?.completedSteps || [])];
    if (!updatedCompletedSteps.includes('welcome')) {
      updatedCompletedSteps.push('welcome');
    }
    
    updateOnboardingProgress({
      currentStep: 'goals',
      completedSteps: updatedCompletedSteps
    });
  }, []);

  const handleGoalSelect = (goalId: string) => {
    setSelectedGoal(goalId);
  };

  const handleContinue = async () => {
    if (!selectedGoal) return;
    
    // NEW ROUTING LOGIC: Map the selected goal to a user role and next screen
    let userRole: 'roommate_seeker' | 'place_lister' = 'roommate_seeker';
    let nextScreen = '';
    
    if (selectedGoal === 'find-roommates') {
      // User has a place and wants roommates → Place Lister Flow
      userRole = 'place_lister';
      nextScreen = 'place-details';
    } else {
      // User is looking for housing (room or teammates) → Standard Room Seeker Flow  
      userRole = 'roommate_seeker';
      nextScreen = 'budget'; // NEW: Standard flow starts with budget now
    }
    
    // Update user role BEFORE navigation to ensure it's available on the next screen
    const result = await updateUserAndProfile({ userRole }, { validate: true });
    
    if (!result.success) {
      console.log('Error saving your goal:', result.error);
      return;
    }
    
    // Navigate after user role is updated, pass userRole as param for immediate availability
    router.push({
      pathname: `/(onboarding)/${nextScreen}` as any,
      params: { userRole }
    });
    
    // Do other heavy operations in background after navigation
    setTimeout(() => {
      try {
        
        // Update onboarding progress
        updateOnboardingProgress({
          currentStep: nextScreen,
          completedSteps: [...(onboardingProgress?.completedSteps || []), 'goals'],
        });
        
        // Supabase update in background
        if (user?.id) {
          setTimeout(async () => {
            try {
              const { SupabaseOnboardingProfileUpdater } = require('../../utils/supabaseOnboardingProfileUpdater');
              const stepData = {
                housing_goals: {
                  goal_type: selectedGoal,
                  user_role: userRole,
                  has_place: selectedGoal === 'find-roommates'
                },
                move_in_timeframe: 'flexible'
              };
              
              await SupabaseOnboardingProfileUpdater.updateAfterStep(user.id, 'goals', stepData);
              console.log('[Goals] Background profile update completed');
            } catch (error) {
              console.error('[Goals] Background profile update failed:', error);
            }
          }, 100);
        }
      } catch (error) {
        console.error('[Goals] Background updates failed:', error);
      }
    }, 0);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <OnboardingTemplate
      hideProgress={true} // Hide step counter since we don't know the total yet
      onBackPress={handleBack}
      onContinuePress={handleContinue}
      continueDisabled={!selectedGoal}
      title="What brings you to Roomies?"
      subtitle="This helps us tailor your experience"
      greeting={`Hey ${user?.name ? user.name : 'there'}`}
      contentContainerStyle={{ justifyContent: 'flex-start' }}
    >
      <View style={styles.container}>
        {goalOptions.map((option) => (
          <GoalOptionItem 
            key={option.id} // Key still needed here for the map
            option={option}
            isSelected={selectedGoal === option.id}
            onPress={handleGoalSelect}
          />
        ))}
      </View>
    </OnboardingTemplate>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  optionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    marginBottom: 10,
  },
  selectedOptionCard: {
    backgroundColor: '#EEF2FF',
    borderColor: '#6366F1',
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  selectedIconContainer: {
    backgroundColor: '#E0E7FF',
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  selectedOptionLabel: {
    color: '#4F46E5',
  },
  optionDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  selectedOptionDescription: {
    color: '#4B5563',
  },
});
