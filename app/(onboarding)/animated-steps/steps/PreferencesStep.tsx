import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  FlatList
} from 'react-native';
import { Check } from 'lucide-react-native';
import { logOnboardingInputChange, logOnboardingStepComplete, logOnboardingStepEntry } from '../../../../utils/onboardingDebugUtils';

// Define personality traits
const personalityTraits = [
  { id: 'organized', label: 'Organized', category: 'Habits' },
  { id: 'clean', label: 'Clean', category: 'Habits' },
  { id: 'punctual', label: 'Punctual', category: 'Habits' },
  { id: 'respectful', label: 'Respectful', category: 'Habits' },
  { id: 'quiet', label: 'Quiet', category: 'Habits' },
  { id: 'tidy', label: 'Tidy', category: 'Habits' },
  { id: 'outgoing', label: 'Outgoing', category: 'Social' },
  { id: 'friendly', label: 'Friendly', category: 'Social' },
  { id: 'social', label: 'Social', category: 'Social' },
  { id: 'adventurous', label: 'Adventurous', category: 'Social' },
  { id: 'easygoing', label: 'Easy-going', category: 'Social' },
  { id: 'considerate', label: 'Considerate', category: 'Social' },
  { id: 'active', label: 'Active', category: 'Lifestyle' },
  { id: 'creative', label: 'Creative', category: 'Lifestyle' },
  { id: 'studious', label: 'Studious', category: 'Lifestyle' },
  { id: 'health_conscious', label: 'Health-conscious', category: 'Lifestyle' },
  { id: 'eco_friendly', label: 'Eco-friendly', category: 'Lifestyle' },
  { id: 'tech_savvy', label: 'Tech-savvy', category: 'Lifestyle' },
];

interface PreferencesStepProps {
  userData: {
    personalityTraits?: string[];
  };
  onContinue: (data: any) => void;
}

export default function PreferencesStep({ userData, onContinue }: PreferencesStepProps) {
  // Selected traits
  const [selectedTraits, setSelectedTraits] = useState<string[]>(
    userData?.personalityTraits || []
  );
  
  // Log entry to preferences step
  useEffect(() => {
    logOnboardingStepEntry('preferences', {
      initialTraits: userData?.personalityTraits || [],
      userData: userData
    });
  }, []);
  
  // Handle trait selection
  const toggleTrait = (traitId: string) => {
    // Find the trait details
    const trait = personalityTraits.find(t => t.id === traitId);
    
    setSelectedTraits(prev => {
      let updated;
      let action;
      
      if (prev.includes(traitId)) {
        // Remove trait
        updated = prev.filter(id => id !== traitId);
        action = 'removed';
      } else {
        // Limit to 5 traits
        if (prev.length >= 5) {
          return prev;
        }
        // Add trait
        updated = [...prev, traitId];
        action = 'added';
      }
      
      // Log the trait selection change
      logOnboardingInputChange('preferences', 'traitSelection', {
        traitId,
        traitLabel: trait?.label,
        traitCategory: trait?.category,
        action,
        count: updated.length,
        allTraits: updated
      });
      
      return updated;
    });
  };
  
  // Handle continue
  const handleContinue = () => {
    // Get the full details of selected traits
    const selectedTraitDetails = personalityTraits
      .filter(trait => selectedTraits.includes(trait.id))
      .map(trait => ({
        id: trait.id,
        label: trait.label,
        category: trait.category
      }));
    
    // Log completion of preferences step
    logOnboardingStepComplete('preferences', {
      selectedTraits,
      traitDetails: selectedTraitDetails,
      traitCount: selectedTraits.length
    });
    
    // Pass the updated data back to the parent
    onContinue({
      personalityTraits: selectedTraits
    });
  };
  
  // Group traits by category
  const traitsByCategory: Record<string, typeof personalityTraits> = {};
  personalityTraits.forEach(trait => {
    if (!traitsByCategory[trait.category]) {
      traitsByCategory[trait.category] = [];
    }
    traitsByCategory[trait.category].push(trait);
  });
  
  // Get categories
  const categories = Object.keys(traitsByCategory);
  
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.description}>
        Select up to 5 traits that best describe you as a roommate
      </Text>
      
      <Text style={styles.selectionCount}>
        {selectedTraits.length}/5 traits selected
      </Text>
      
      {categories.map(category => (
        <View key={category} style={styles.categorySection}>
          <Text style={styles.categoryTitle}>{category}</Text>
          <View style={styles.traitsGrid}>
            {traitsByCategory[category].map(trait => (
              <TouchableOpacity
                key={trait.id}
                style={[
                  styles.traitChip,
                  selectedTraits.includes(trait.id) && styles.traitChipSelected,
                  selectedTraits.length >= 5 && !selectedTraits.includes(trait.id) && styles.traitChipDisabled
                ]}
                onPress={() => toggleTrait(trait.id)}
                disabled={selectedTraits.length >= 5 && !selectedTraits.includes(trait.id)}
              >
                {selectedTraits.includes(trait.id) && (
                  <Check size={16} color="#FFFFFF" style={styles.checkIcon} />
                )}
                <Text 
                  style={[
                    styles.traitLabel,
                    selectedTraits.includes(trait.id) && styles.traitLabelSelected
                  ]}
                >
                  {trait.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
      
      {selectedTraits.length > 0 && (
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  description: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 16,
    lineHeight: 24,
  },
  selectionCount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6366F1',
    marginBottom: 24,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  traitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  traitChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  traitChipSelected: {
    backgroundColor: '#6366F1',
  },
  traitChipDisabled: {
    opacity: 0.5,
  },
  checkIcon: {
    marginRight: 4,
  },
  traitLabel: {
    fontSize: 14,
    color: '#4B5563',
  },
  traitLabelSelected: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  continueButton: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 40,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
