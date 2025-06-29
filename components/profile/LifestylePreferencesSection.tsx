import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Users, Moon, Volume2, Sparkles, Cigarette, Dog, Wine, UserPlus, Edit2 } from 'lucide-react-native';
import { useSupabaseUserStore } from '../../store/supabaseUserStore';
import { useRouter } from 'expo-router';

const LifestylePreferencesSection: React.FC = () => {
  const { user } = useSupabaseUserStore();
  const router = useRouter();

  // Navigate to lifestyle edit page
  const handleEdit = () => {
    router.push('/lifestyle-edit');
  };

  // DEBUG: Log the actual lifestyle preferences data
  React.useEffect(() => {
    console.log('🔍 [LIFESTYLE SECTION] Component rendered!');
    console.log('🔍 [LIFESTYLE SECTION] User exists:', !!user);
    console.log('🔍 [LIFESTYLE SECTION] User ID:', user?.id);
    console.log('🔍 [LIFESTYLE SECTION] Onboarding completed:', user?.onboardingCompleted);
    console.log('🔍 [LIFESTYLE SECTION] Raw user data:', user);
    console.log('🔍 [LIFESTYLE SECTION] Lifestyle preferences:', user?.lifestylePreferences);
    if (user?.lifestylePreferences) {
      console.log('🔍 [LIFESTYLE SECTION] Schedule:', (user.lifestylePreferences as any).schedule);
      console.log('🔍 [LIFESTYLE SECTION] Pet preference:', (user.lifestylePreferences as any).petPreference);
      console.log('🔍 [LIFESTYLE SECTION] Cleanliness:', user.lifestylePreferences.cleanliness);
      console.log('🔍 [LIFESTYLE SECTION] Noise:', user.lifestylePreferences.noise);
      console.log('🔍 [LIFESTYLE SECTION] Guest frequency:', user.lifestylePreferences.guestFrequency);
    } else {
      console.log('❌ [LIFESTYLE SECTION] No lifestyle preferences found in user data!');
    }
  }, [user]);

  // Helper functions for getting text descriptions
  const getNoiseLevelText = (level?: number) => {
    if (level === undefined || level === null) return 'Not specified';
    if (level === 0) return 'Lively';
    if (level === 1) return 'Moderate';
    if (level === 2) return 'Quiet';
    if (level === 3) return 'Very quiet';
    return 'Not specified';
  };

  const getCleanlinessText = (level?: number) => {
    if (level === undefined || level === null) return 'Not specified';
    if (level === 0) return 'Not concerned';
    if (level === 1) return 'Somewhat clean';
    if (level === 2) return 'Clean';
    if (level === 3) return 'Very clean';
    return 'Not specified';
  };

  const getGuestFrequencyText = (level?: number) => {
    if (level === undefined || level === null) return 'Not specified';
    if (level === 0) return 'Rarely';
    if (level === 1) return 'Occasionally';  
    if (level === 2) return 'Frequently';
    if (level === 3) return 'Very frequently';
    return 'Not specified';
  };

  const getSleepScheduleText = () => {
    if (!user?.lifestylePreferences) return 'Not specified';
    
    // Check for saved schedule format (using any type to avoid TypeScript errors)
    const schedule = (user.lifestylePreferences as any).schedule;
    if (schedule) {
      if (schedule === 'early-riser') return 'Early Riser';
      if (schedule === 'regular-hours') return 'Regular Hours';
      if (schedule === 'night-owl') return 'Night Owl';
      if (schedule === 'irregular') return 'Irregular';
      if (schedule === 'flexible') return 'Flexible';
    }
    
    // Legacy format check
    if (user.lifestylePreferences.earlyRiser) return 'Early Riser';
    if (user.lifestylePreferences.nightOwl) return 'Night Owl';
    return 'Flexible';
  };

  const getPetPreferenceText = () => {
    if (!user?.lifestylePreferences) return 'Not specified';
    
    const petPreference = (user.lifestylePreferences as any).petPreference;
    if (petPreference) {
      switch (petPreference) {
        case 'love-pets': return 'Love all pets';
        case 'cats-only': return 'Cats only';
        case 'dogs-only': return 'Dogs only';
        case 'no-pets': return 'No pets';
        default: return 'Not specified';
      }
    }
    
    // Fallback to boolean value
    return user.lifestylePreferences.pets ? 'Pet friendly' : 'No pets';
  };

  // Get personality traits to display
  const getPersonalityTraits = () => {
    if (!user?.personalityTraits || user.personalityTraits.length === 0) {
      return ['No traits specified'];
    }
    return user.personalityTraits.slice(0, 5);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Users size={20} color="#4F46E5" />
          <Text style={styles.headerTitle}>Lifestyle & Traits</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.editButton} 
          onPress={handleEdit}
        >
          <Edit2 size={16} color="#4F46E5" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Living Preferences - Grid Layout */}
        <View style={styles.preferencesGrid}>
          <View style={styles.preferenceItem}>
            <View style={styles.iconContainer}>
              <Moon size={16} color="#4F46E5" />
            </View>
            <View style={styles.preferenceContent}>
              <Text style={styles.preferenceLabel}>Sleep Schedule</Text>
              <Text style={styles.preferenceValue}>{getSleepScheduleText()}</Text>
            </View>
          </View>

          <View style={styles.preferenceItem}>
            <View style={styles.iconContainer}>
              <Volume2 size={16} color="#4F46E5" />
            </View>
            <View style={styles.preferenceContent}>
              <Text style={styles.preferenceLabel}>Noise Level</Text>
              <Text style={styles.preferenceValue}>{getNoiseLevelText(user?.lifestylePreferences?.noise)}</Text>
            </View>
          </View>

          <View style={styles.preferenceItem}>
            <View style={styles.iconContainer}>
              <Sparkles size={16} color="#4F46E5" />
            </View>
            <View style={styles.preferenceContent}>
              <Text style={styles.preferenceLabel}>Cleanliness</Text>
              <Text style={styles.preferenceValue}>{getCleanlinessText(user?.lifestylePreferences?.cleanliness)}</Text>
            </View>
          </View>

          <View style={styles.preferenceItem}>
            <View style={styles.iconContainer}>
              <UserPlus size={16} color="#4F46E5" />
            </View>
            <View style={styles.preferenceContent}>
              <Text style={styles.preferenceLabel}>Guests</Text>
              <Text style={styles.preferenceValue}>{getGuestFrequencyText(user?.lifestylePreferences?.guestFrequency)}</Text>
            </View>
          </View>

          <View style={styles.preferenceItem}>
            <View style={styles.iconContainer}>
              <Cigarette size={16} color="#4F46E5" />
            </View>
            <View style={styles.preferenceContent}>
              <Text style={styles.preferenceLabel}>Smoking</Text>
              <Text style={styles.preferenceValue}>{user?.lifestylePreferences?.smoking ? 'Yes' : 'No'}</Text>
            </View>
          </View>

          <View style={styles.preferenceItem}>
            <View style={styles.iconContainer}>
              <Dog size={16} color="#4F46E5" />
            </View>
            <View style={styles.preferenceContent}>
              <Text style={styles.preferenceLabel}>Pet Friendly</Text>
              <Text style={styles.preferenceValue}>{getPetPreferenceText()}</Text>
            </View>
          </View>

          <View style={styles.preferenceItem}>
            <View style={styles.iconContainer}>
              <Wine size={16} color="#4F46E5" />
            </View>
            <View style={styles.preferenceContent}>
              <Text style={styles.preferenceLabel}>Drinking</Text>
              <Text style={styles.preferenceValue}>{user?.lifestylePreferences?.drinking ? 'Yes' : 'No'}</Text>
            </View>
          </View>
        </View>

        {/* Personality Traits */}
        {getPersonalityTraits()[0] !== 'No traits specified' && (
          <View style={styles.traitsSection}>
            <Text style={styles.sectionLabel}>Personality Traits</Text>
            <View style={styles.traitsContainer}>
              {getPersonalityTraits().map((trait, index) => (
                <View key={index} style={styles.traitBadge}>
                  <Text style={styles.traitText}>{trait}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  editButton: {
    padding: 4,
  },
  content: {
    gap: 16,
  },

  // Preferences Grid
  preferencesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    paddingVertical: 8,
  },
  iconContainer: {
    backgroundColor: '#EEF2FF',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  preferenceContent: {
    flex: 1,
  },
  preferenceLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 2,
  },
  preferenceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },

  // Personality Traits
  traitsSection: {
    marginTop: 4,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  traitsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  traitBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  traitText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4F46E5',
  },
});

export default LifestylePreferencesSection;
