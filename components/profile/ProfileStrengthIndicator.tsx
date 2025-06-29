import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSupabaseUserStore } from '../../store/supabaseUserStore';
import { calculateProfileStrength, getProfileCompletionSuggestions } from '../../utils/profileStrength';

interface ProfileStrengthIndicatorProps {
  showSuggestions?: boolean;
}

const ProfileStrengthIndicator: React.FC<ProfileStrengthIndicatorProps> = ({ 
  showSuggestions = false 
}) => {
  const { user } = useSupabaseUserStore();
  const [strength, setStrength] = useState<number>(0);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      const profileStrength = calculateProfileStrength(user);
      setStrength(profileStrength);
      
      if (showSuggestions) {
        const completionSuggestions = getProfileCompletionSuggestions(user);
        setSuggestions(completionSuggestions);
      }
    }
  }, [user, showSuggestions]);

  // Determine the color based on strength
  const getColor = () => {
    if (strength < 40) return '#F44336'; // Red for low completion
    if (strength < 70) return '#FFC107'; // Yellow/amber for medium completion
    return '#4CAF50'; // Green for high completion
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Profile Strength</Text>
        <Text style={styles.percentage}>{strength}%</Text>
      </View>
      
      <View style={styles.progressBarContainer}>
        <View 
          style={[
            styles.progressBar, 
            { width: `${strength}%`, backgroundColor: getColor() }
          ]} 
        />
      </View>
      
      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <Text style={styles.suggestionsTitle}>
            Complete these to improve your profile:
          </Text>
          {suggestions.slice(0, 3).map((suggestion, index) => (
            <Text key={index} style={styles.suggestion}>
              • {suggestion}
            </Text>
          ))}
          {suggestions.length > 3 && (
            <Text style={styles.moreSuggestions}>
              +{suggestions.length - 3} more suggestions
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  percentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  suggestionsContainer: {
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  suggestionsTitle: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 4,
    color: '#4B5563',
  },
  suggestion: {
    fontSize: 12,
    color: '#6B7280',
    marginVertical: 2,
  },
  moreSuggestions: {
    fontSize: 12,
    color: '#4F46E5',
    marginTop: 4,
    fontWeight: '500',
  },
});

export default ProfileStrengthIndicator;
