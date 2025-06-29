import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Home, Search, Users, Eye } from 'lucide-react-native';
import { logOnboardingInputChange, logOnboardingStepComplete, logOnboardingStepEntry } from '../../../../utils/onboardingDebugUtils';

type GoalOption = {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  userRole: 'roommate_seeker' | 'place_lister' | 'both';
};

const goalOptions: GoalOption[] = [
  {
    id: 'find-room',
    label: 'Finding a room to move into',
    icon: <Search size={22} color="#4F46E5" />,
    description: 'I need to find a place with existing roommates',
    userRole: 'roommate_seeker'
  },
  {
    id: 'find-roommates',
    label: 'Finding roommates for my place',
    icon: <Users size={22} color="#4F46E5" />,
    description: 'I have a place and need to find roommates',
    userRole: 'place_lister'
  },
  {
    id: 'explore-together',
    label: 'Exploring housing options with others',
    icon: <Home size={22} color="#4F46E5" />,
    description: 'Looking to team up and find a new place together',
    userRole: 'both'
  },
  {
    id: 'browsing',
    label: 'Just browsing for now',
    icon: <Eye size={22} color="#4F46E5" />,
    description: 'I\'m exploring options without a specific goal yet',
    userRole: 'roommate_seeker'
  },
];

interface GoalsStepProps {
  userData: {
    userRole?: 'roommate_seeker' | 'place_lister' | 'both';
  };
  onContinue: (data: any) => void;
}

export default function GoalsStep({ userData, onContinue }: GoalsStepProps) {
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  
  // Log entry to goals step
  useEffect(() => {
    logOnboardingStepEntry('goals', {
      initialUserRole: userData?.userRole,
      userData: userData
    });
  }, []);
  
  // Initialize with existing selection if available
  useEffect(() => {
    if (userData?.userRole) {
      // Map user role back to goal ID
      let goalId = 'browsing';
      switch (userData.userRole) {
        case 'roommate_seeker':
          goalId = 'find-room';
          break;
        case 'place_lister':
          goalId = 'find-roommates';
          break;
        case 'both':
          goalId = 'explore-together';
          break;
      }
      
      // Log the initial goal selection
      logOnboardingInputChange('goals', 'initialGoal', {
        goalId,
        userRole: userData.userRole,
        isPreselected: true
      });
      
      setSelectedGoal(goalId);
    }
  }, [userData?.userRole]);
  
  const handleGoalSelect = (goalId: string) => {
    // Find the selected goal option
    const selectedOption = goalOptions.find(option => option.id === goalId);
    
    if (selectedOption) {
      // Log the goal selection
      logOnboardingInputChange('goals', 'goalSelection', {
        goalId,
        goalLabel: selectedOption.label,
        userRole: selectedOption.userRole,
        previousGoal: selectedGoal
      });
      
      setSelectedGoal(goalId);
      
      // Log completion of goals step
      logOnboardingStepComplete('goals', {
        selectedGoal: goalId,
        goalLabel: selectedOption.label,
        userRole: selectedOption.userRole
      });
      
      // Pass the updated data back to the parent
      onContinue({
        userRole: selectedOption.userRole
      });
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.description}>
        Tell us what you're looking for so we can personalize your experience
      </Text>
      
      <View style={styles.goalsContainer}>
        {goalOptions.map((goal) => (
          <TouchableOpacity
            key={goal.id}
            style={[
              styles.goalCard,
              selectedGoal === goal.id && styles.goalCardSelected
            ]}
            onPress={() => handleGoalSelect(goal.id)}
          >
            <View style={styles.goalIconContainer}>
              {goal.icon}
            </View>
            <View style={styles.goalTextContainer}>
              <Text style={styles.goalLabel}>{goal.label}</Text>
              {goal.description ? (
                <Text style={styles.goalDescription}>{goal.description}</Text>
              ) : null}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
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
  goalsContainer: {
    gap: 16,
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
  },
  goalCardSelected: {
    backgroundColor: '#EEF2FF',
    borderColor: '#6366F1',
  },
  goalIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  goalTextContainer: {
    flex: 1,
  },
  goalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  goalDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
});
