import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import Slider from '@react-native-community/slider';
import { useRouter } from 'expo-router';
import { ArrowLeft, Check, Moon, Volume2, Sparkles, Users, Coffee, Wine, Cigarette, Dog } from 'lucide-react-native';
import { useUserStore } from '../store/userStore';
import { Button } from '../components';

export default function LifestyleEditScreen() {
  const router = useRouter();
  const { user, updateUserAndProfile } = useUserStore();
  
  // Initialize state with user's lifestyle preferences or defaults
  const [cleanliness, setCleanliness] = useState<number>(user?.lifestylePreferences?.cleanliness ?? 3);
  const [noiseLevel, setNoiseLevel] = useState<number>(user?.lifestylePreferences?.noise ?? 2);
  const [guestFrequency, setGuestFrequency] = useState<number>(user?.lifestylePreferences?.guestFrequency ?? 2);
  const [isSmoking, setIsSmoking] = useState<boolean>(user?.lifestylePreferences?.smoking ?? false);
  const [isPetFriendly, setIsPetFriendly] = useState<boolean>(user?.lifestylePreferences?.pets ?? false);
  const [isDrinking, setIsDrinking] = useState<boolean>(user?.lifestylePreferences?.drinking ?? false);
  const [isEarlyRiser, setIsEarlyRiser] = useState<boolean>(user?.lifestylePreferences?.earlyRiser ?? false);
  const [isNightOwl, setIsNightOwl] = useState<boolean>(user?.lifestylePreferences?.nightOwl ?? false);
  
  // Helper functions to get text labels for slider values
  const getCleanlinessLabel = (value: number) => {
    if (value <= 1) return 'Very clean';
    if (value <= 2) return 'Clean';
    if (value <= 3) return 'Moderate';
    return 'Relaxed';
  };
  
  const getNoiseLevelLabel = (value: number) => {
    if (value <= 1) return 'Quiet';
    if (value <= 2) return 'Moderate';
    return 'Loud';
  };
  
  const getGuestFrequencyLabel = (value: number) => {
    if (value <= 1) return 'Rarely';
    if (value <= 2) return 'Occasionally';
    return 'Frequently';
  };
  
  // Handle sleep schedule selection
  const handleSleepScheduleChange = (type: 'early' | 'night') => {
    if (type === 'early') {
      setIsEarlyRiser(!isEarlyRiser);
      if (!isEarlyRiser) setIsNightOwl(false); // Can't be both
    } else {
      setIsNightOwl(!isNightOwl);
      if (!isNightOwl) setIsEarlyRiser(false); // Can't be both
    }
  };
  
  const handleSave = () => {
    // Update user's lifestyle preferences
    updateUserAndProfile({
      lifestylePreferences: {
        cleanliness,
        noise: noiseLevel,
        guestFrequency,
        smoking: isSmoking,
        pets: isPetFriendly,
        drinking: isDrinking,
        earlyRiser: isEarlyRiser,
        nightOwl: isNightOwl
      }
    }, { validate: false, showToast: false });
    
    // Navigate back to profile page
    router.back();
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Lifestyle Preferences</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Check size={24} color="#4F46E5" />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Sleep Schedule</Text>
        <View style={styles.optionsContainer}>
          <TouchableOpacity 
            style={[styles.optionButton, isEarlyRiser && styles.selectedOption]} 
            onPress={() => handleSleepScheduleChange('early')}
          >
            <Coffee size={20} color={isEarlyRiser ? "#FFFFFF" : "#4F46E5"} />
            <Text style={[styles.optionText, isEarlyRiser && styles.selectedOptionText]}>Early Riser</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.optionButton, isNightOwl && styles.selectedOption]} 
            onPress={() => handleSleepScheduleChange('night')}
          >
            <Moon size={20} color={isNightOwl ? "#FFFFFF" : "#4F46E5"} />
            <Text style={[styles.optionText, isNightOwl && styles.selectedOptionText]}>Night Owl</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.optionButton, (!isEarlyRiser && !isNightOwl) && styles.selectedOption]} 
            onPress={() => {
              setIsEarlyRiser(false);
              setIsNightOwl(false);
            }}
          >
            <Text style={[styles.optionText, (!isEarlyRiser && !isNightOwl) && styles.selectedOptionText]}>Flexible</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.sectionTitle}>Cleanliness</Text>
        <View style={styles.sliderContainer}>
          <Sparkles size={20} color="#4F46E5" />
          <View style={styles.sliderContent}>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={5}
              step={1}
              value={cleanliness}
              onValueChange={setCleanliness}
              minimumTrackTintColor="#4F46E5"
              maximumTrackTintColor="#E5E7EB"
              thumbTintColor="#4F46E5"
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabel}>Very Clean</Text>
              <Text style={styles.sliderLabel}>Relaxed</Text>
            </View>
            <Text style={styles.sliderValue}>{getCleanlinessLabel(cleanliness)} ({Math.round(cleanliness)}/5)</Text>
          </View>
        </View>
        
        <Text style={styles.sectionTitle}>Noise Level</Text>
        <View style={styles.sliderContainer}>
          <Volume2 size={20} color="#4F46E5" />
          <View style={styles.sliderContent}>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={3}
              step={1}
              value={noiseLevel}
              onValueChange={setNoiseLevel}
              minimumTrackTintColor="#4F46E5"
              maximumTrackTintColor="#E5E7EB"
              thumbTintColor="#4F46E5"
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabel}>Quiet</Text>
              <Text style={styles.sliderLabel}>Loud</Text>
            </View>
            <Text style={styles.sliderValue}>{getNoiseLevelLabel(noiseLevel)}</Text>
          </View>
        </View>
        
        <Text style={styles.sectionTitle}>Guest Frequency</Text>
        <View style={styles.sliderContainer}>
          <Users size={20} color="#4F46E5" />
          <View style={styles.sliderContent}>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={3}
              step={1}
              value={guestFrequency}
              onValueChange={setGuestFrequency}
              minimumTrackTintColor="#4F46E5"
              maximumTrackTintColor="#E5E7EB"
              thumbTintColor="#4F46E5"
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabel}>Rarely</Text>
              <Text style={styles.sliderLabel}>Frequently</Text>
            </View>
            <Text style={styles.sliderValue}>{getGuestFrequencyLabel(guestFrequency)}</Text>
          </View>
        </View>
        
        <Text style={styles.sectionTitle}>Other Preferences</Text>
        <View style={styles.switchContainer}>
          <View style={styles.switchItem}>
            <View style={styles.switchLabel}>
              <Cigarette size={20} color="#4F46E5" style={styles.switchIcon} />
              <Text style={styles.switchText}>Smoking</Text>
            </View>
            <Switch
              value={isSmoking}
              onValueChange={setIsSmoking}
              trackColor={{ false: '#E5E7EB', true: '#4F46E5' }}
              thumbColor="#FFFFFF"
            />
          </View>
          
          <View style={styles.switchItem}>
            <View style={styles.switchLabel}>
              <Dog size={20} color="#4F46E5" style={styles.switchIcon} />
              <Text style={styles.switchText}>Pet Friendly</Text>
            </View>
            <Switch
              value={isPetFriendly}
              onValueChange={setIsPetFriendly}
              trackColor={{ false: '#E5E7EB', true: '#4F46E5' }}
              thumbColor="#FFFFFF"
            />
          </View>
          
          <View style={styles.switchItem}>
            <View style={styles.switchLabel}>
              <Wine size={20} color="#4F46E5" style={styles.switchIcon} />
              <Text style={styles.switchText}>Drinking</Text>
            </View>
            <Switch
              value={isDrinking}
              onValueChange={setIsDrinking}
              trackColor={{ false: '#E5E7EB', true: '#4F46E5' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
        
        <Button 
          title="Save Changes" 
          onPress={handleSave} 
          style={styles.saveButtonLarge}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  saveButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginTop: 24,
    marginBottom: 12,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedOption: {
    backgroundColor: '#4F46E5',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4F46E5',
    marginLeft: 8,
  },
  selectedOptionText: {
    color: '#FFFFFF',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  sliderContent: {
    flex: 1,
    marginLeft: 16,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -8,
  },
  sliderLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  sliderValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginTop: 4,
  },
  switchContainer: {
    marginBottom: 24,
  },
  switchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  switchLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchIcon: {
    marginRight: 12,
  },
  switchText: {
    fontSize: 16,
    color: '#111827',
  },
  saveButtonLarge: {
    marginTop: 24,
    marginBottom: 40,
  },
});
