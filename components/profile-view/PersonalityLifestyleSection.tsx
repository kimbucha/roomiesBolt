import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ProfileSection from './ProfileSection';
import type { User } from '../../store/userStore';
import {
    BedDouble, Cat, Cigarette, ConciergeBell, Dumbbell, Library, MapPin, Moon,
    PartyPopper, PencilRuler, Plane, Search, Settings, Sparkles, Sun, Users,
    UtensilsCrossed, Volume2, Waves, Wind, CookingPot, GlassWater, Leaf, Scale,
    Briefcase, BookOpen, Home
} from 'lucide-react-native';

// Define PersonalityDimension type locally for the mock data structure
interface PersonalityDimension { 
  dimension: string; 
  score: number; 
}

// Helper Function: Map lifestyle key to display value
const mapLifestyleValue = (key: keyof User['lifestylePreferences'], value: any): string | null => {
    if (value === null || value === undefined) return null;
    switch (key) {
        case 'smoking': return value ? 'Smoking okay' : 'Non-smoking preferred';
        case 'pets': return value ? 'Pets welcome' : 'No pets preferred';
        case 'cleanliness':
          if (typeof value !== 'number') return 'Not specified';
          if (value <= 2) return 'Relaxed about tidiness';
          if (value === 3) return 'Moderately tidy';
          if (value >= 4) return 'Prefers clean & organized';
          return 'Not specified';
        case 'noise':
          if (typeof value !== 'number') return 'Not specified';
          if (value <= 2) return 'Okay with noise';
          if (value === 3) return 'Prefers moderate noise levels';
          if (value >= 4) return 'Prefers a quiet environment';
          return 'Not specified';
        case 'guestFrequency':
          if (typeof value !== 'number') return 'Not specified';
          if (value <= 2) return 'Guests welcome often';
          if (value === 3) return 'Guests welcome sometimes';
          if (value >= 4) return 'Prefers few guests';
          return 'Not specified';
        default:
            const keyStr = String(key);
            const formattedKey = keyStr.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').replace(/\b\w/g, (l: string) => l.toUpperCase());
            return `${formattedKey}: ${String(value)}`;
    }
};

// Helper Function: Get appropriate icon for lifestyle key
const getLifestyleIcon = (key: keyof User['lifestylePreferences']) => {
    switch (key) {
        case 'smoking': return Cigarette;
        case 'pets': return Cat;
        case 'cleanliness': return Sparkles;
        case 'noise': return Volume2;
        case 'guestFrequency': return Users;
        default: return Leaf;
    }
};

// Update props interface: Use 'User' type
interface PersonalityLifestyleSectionProps {
  userProfile: User | null;
  mockPersonalityDimensions: PersonalityDimension[]; // Uses locally defined type
}

const PersonalityLifestyleSection: React.FC<PersonalityLifestyleSectionProps> = ({ userProfile, mockPersonalityDimensions }) => {
  if (!userProfile) {
    return null; 
  }

  // Check if lifestyle is correctly typed (it should be optional based on User type)
  const lifestyle = userProfile.lifestylePreferences; // Use lifestylePreferences from User type

  return (
    <ProfileSection title="Personality & Lifestyle">
      {/* MBTI Type - Use personalityType from User type */}
      {userProfile.personalityType && (
        <View style={styles.mbtiContainer}>
          <Text style={styles.mbtiText}>MBTI: {userProfile.personalityType}</Text>
        </View>
      )}

      {/* Personality Dimensions (Using Mock Data) - Remains the same for now */}
      <View style={styles.dimensionsContainer}>
        {mockPersonalityDimensions.map((dim, index) => (
          <View key={index} style={styles.dimensionItem}>
            <Text style={styles.dimensionText}>{dim.dimension}</Text>
            <View style={styles.dimensionBarContainer}>
              <View style={[styles.dimensionBar, { width: `${dim.score}%` }]} />
            </View>
            <Text style={styles.dimensionScore}>{dim.score}</Text>
          </View>
        ))}
      </View>

      {/* Personality Traits - Use personalityTraits from User type */}
      {userProfile.personalityTraits && userProfile.personalityTraits.length > 0 && (
        <View style={styles.traitsContainer}>
          {userProfile.personalityTraits.map((trait: string, index: number) => (
            <View key={index} style={styles.traitBadge}>
              <Text style={styles.traitText}>{trait}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Lifestyle Preferences - Use lifestylePreferences from User type */}
      {lifestyle && (
        <View style={styles.lifestyleContainer}>
          {Object.entries(lifestyle)
            // Ensure value is not null/undefined before proceeding
            .filter(([key, value]) => value !== null && value !== undefined)
            // Explicitly cast key to the correct type before passing to helpers
            .map(([key, value]) => {
              const lifestyleKey = key as keyof User['lifestylePreferences'];
              // Check if getLifestyleIcon can handle the key
              const LifestyleIcon = getLifestyleIcon(lifestyleKey);
              // Check if mapLifestyleValue can handle the key and value
              const displayValue = mapLifestyleValue(lifestyleKey, value);
              if (!displayValue || !LifestyleIcon) return null;
              return (
                <View key={key} style={styles.lifestyleItem}>
                  <LifestyleIcon size={18} color="#64748B" style={styles.lifestyleIcon} />
                  <Text style={styles.lifestyleText}>{displayValue}</Text>
                </View>
              );
            })}
        </View>
      )}
    </ProfileSection>
  );
};

// Styles remain the same
const styles = StyleSheet.create({
    mbtiContainer: {
        paddingHorizontal: 20,
        marginBottom: 15,
        paddingTop: 5,
      },
      mbtiText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4F46E5',
      },
      dimensionsContainer: {
        paddingHorizontal: 20,
        marginBottom: 15,
      },
      dimensionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
      },
      dimensionText: {
        fontSize: 14,
        color: '#334155',
        width: 120,
      },
      dimensionBarContainer: {
        flex: 1,
        height: 8,
        backgroundColor: '#E2E8F0',
        borderRadius: 4,
        marginHorizontal: 10,
        overflow: 'hidden',
      },
      dimensionBar: {
        height: '100%',
        backgroundColor: '#6366F1',
        borderRadius: 4,
      },
      dimensionScore: {
        fontSize: 14,
        color: '#475569',
        minWidth: 25,
        textAlign: 'right',
      },
      traitsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 20,
        marginBottom: 15,
      },
      traitBadge: {
        backgroundColor: '#EEF2FF',
        borderRadius: 12,
        paddingVertical: 5,
        paddingHorizontal: 12,
        marginRight: 8,
        marginBottom: 8,
      },
      traitText: {
        fontSize: 13,
        color: '#4338CA',
        fontWeight: '500',
      },
      lifestyleContainer: {
        paddingHorizontal: 20,
        marginTop: 0,
        paddingBottom: 15,
      },
      lifestyleItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
      },
      lifestyleIcon: {
        marginRight: 12,
      },
      lifestyleText: {
        fontSize: 15,
        color: '#475569',
        flexShrink: 1,
      },
});

export default PersonalityLifestyleSection; 