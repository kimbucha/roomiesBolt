import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, Slider, TouchableOpacity } from 'react-native';
import { useSupabaseUserStore } from '../store/supabaseUserStore';
import { toJsonb, getJsonbProperty } from '../utils/jsonbHelper';
import { supabase } from '../services/supabaseClient';
import { useSupabaseAuthStore } from '../store/supabaseAuthStore';

/**
 * Component for editing lifestyle preferences with JSONB support
 */
export default function LifestylePreferencesEditor() {
  const { user } = useSupabaseUserStore();
  const { user: authUser } = useSupabaseAuthStore();
  
  // Extract current preferences from JSONB
  const initialPreferences = {
    cleanliness: getJsonbProperty(user?.lifestylePreferences, 'cleanliness', 3),
    noise: getJsonbProperty(user?.lifestylePreferences, 'noise', 2),
    guestFrequency: getJsonbProperty(user?.lifestylePreferences, 'guestFrequency', 2),
    smoking: getJsonbProperty(user?.lifestylePreferences, 'smoking', false),
    pets: getJsonbProperty(user?.lifestylePreferences, 'pets', false),
    drinking: getJsonbProperty(user?.lifestylePreferences, 'drinking', false),
    earlyRiser: getJsonbProperty(user?.lifestylePreferences, 'earlyRiser', false),
    nightOwl: getJsonbProperty(user?.lifestylePreferences, 'nightOwl', false),
  };
  
  // State for form values
  const [preferences, setPreferences] = useState(initialPreferences);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  
  // Format labels for sliders
  const formatCleanlinessLabel = (value) => {
    if (value <= 1) return 'Very Clean';
    if (value <= 2) return 'Clean';
    if (value <= 3) return 'Moderate';
    return 'Relaxed';
  };
  
  const formatNoiseLabel = (value) => {
    if (value <= 1) return 'Quiet';
    if (value <= 2) return 'Moderate';
    return 'Loud';
  };
  
  const formatGuestFrequencyLabel = (value) => {
    if (value <= 1) return 'Rarely';
    if (value <= 2) return 'Sometimes';
    return 'Often';
  };
  
  // Update a single preference
  const updatePreference = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  // Save preferences to Supabase using JSONB
  const savePreferences = async () => {
    if (!authUser) {
      setSaveMessage('You must be logged in to save preferences');
      return;
    }
    
    setIsSaving(true);
    setSaveMessage('');
    
    try {
      // Convert preferences to JSONB format
      const jsonbPreferences = toJsonb(preferences);
      
      // Update in Supabase
      const { error } = await supabase
        .from('users')
        .update({ lifestyle_preferences: jsonbPreferences })
        .eq('id', authUser.id);
        
      if (error) {
        console.error('Error saving preferences:', error.message);
        setSaveMessage(`Error: ${error.message}`);
        return;
      }
      
      // Update local store
      await useSupabaseUserStore.getState().updateUser({
        lifestylePreferences: preferences
      });
      
      setSaveMessage('Preferences saved successfully!');
    } catch (error) {
      console.error('Error:', error);
      setSaveMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lifestyle Preferences</Text>
      
      {/* Cleanliness Slider */}
      <View style={styles.sliderContainer}>
        <Text style={styles.label}>Cleanliness</Text>
        <Text style={styles.valueLabel}>{formatCleanlinessLabel(preferences.cleanliness)}</Text>
        <Slider
          style={styles.slider}
          minimumValue={1}
          maximumValue={4}
          step={1}
          value={preferences.cleanliness}
          onValueChange={(value) => updatePreference('cleanliness', value)}
        />
        <View style={styles.sliderLabels}>
          <Text style={styles.sliderLabel}>Very Clean</Text>
          <Text style={styles.sliderLabel}>Relaxed</Text>
        </View>
      </View>
      
      {/* Noise Level Slider */}
      <View style={styles.sliderContainer}>
        <Text style={styles.label}>Noise Level</Text>
        <Text style={styles.valueLabel}>{formatNoiseLabel(preferences.noise)}</Text>
        <Slider
          style={styles.slider}
          minimumValue={1}
          maximumValue={3}
          step={1}
          value={preferences.noise}
          onValueChange={(value) => updatePreference('noise', value)}
        />
        <View style={styles.sliderLabels}>
          <Text style={styles.sliderLabel}>Quiet</Text>
          <Text style={styles.sliderLabel}>Loud</Text>
        </View>
      </View>
      
      {/* Guest Frequency Slider */}
      <View style={styles.sliderContainer}>
        <Text style={styles.label}>Guest Frequency</Text>
        <Text style={styles.valueLabel}>{formatGuestFrequencyLabel(preferences.guestFrequency)}</Text>
        <Slider
          style={styles.slider}
          minimumValue={1}
          maximumValue={3}
          step={1}
          value={preferences.guestFrequency}
          onValueChange={(value) => updatePreference('guestFrequency', value)}
        />
        <View style={styles.sliderLabels}>
          <Text style={styles.sliderLabel}>Rarely</Text>
          <Text style={styles.sliderLabel}>Often</Text>
        </View>
      </View>
      
      {/* Toggle Switches */}
      <View style={styles.togglesContainer}>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Smoking</Text>
          <Switch
            value={preferences.smoking}
            onValueChange={(value) => updatePreference('smoking', value)}
          />
        </View>
        
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Pets</Text>
          <Switch
            value={preferences.pets}
            onValueChange={(value) => updatePreference('pets', value)}
          />
        </View>
        
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Drinking</Text>
          <Switch
            value={preferences.drinking}
            onValueChange={(value) => updatePreference('drinking', value)}
          />
        </View>
        
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Early Riser</Text>
          <Switch
            value={preferences.earlyRiser}
            onValueChange={(value) => updatePreference('earlyRiser', value)}
          />
        </View>
        
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Night Owl</Text>
          <Switch
            value={preferences.nightOwl}
            onValueChange={(value) => updatePreference('nightOwl', value)}
          />
        </View>
      </View>
      
      {/* Save Button */}
      <TouchableOpacity
        style={styles.saveButton}
        onPress={savePreferences}
        disabled={isSaving}
      >
        <Text style={styles.saveButtonText}>
          {isSaving ? 'Saving...' : 'Save Preferences'}
        </Text>
      </TouchableOpacity>
      
      {saveMessage ? (
        <Text style={[
          styles.saveMessage,
          saveMessage.includes('Error') ? styles.errorMessage : styles.successMessage
        ]}>
          {saveMessage}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  sliderContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  valueLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderLabel: {
    fontSize: 12,
    color: '#999',
  },
  togglesContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  toggleLabel: {
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveMessage: {
    marginTop: 10,
    textAlign: 'center',
    fontSize: 14,
  },
  successMessage: {
    color: 'green',
  },
  errorMessage: {
    color: 'red',
  },
});
