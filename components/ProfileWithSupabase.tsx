import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useSupabaseUserStore } from '../store/supabaseUserStore';
import EnhancedAvatar from './EnhancedAvatar';
import { getJsonbProperty } from '../utils/jsonbHelper';

export default function ProfileWithSupabase() {
  // Use the Supabase user store instead of the original user store
  const { user, getUserRating } = useSupabaseUserStore();
  const [isLoading, setIsLoading] = useState(false);

  // Get user rating information
  const rating = getUserRating();

  // Extract complex data from JSONB using our helper
  const personalityType = user?.personalityType || 'Not set';
  const cleanliness = getJsonbProperty(user?.lifestylePreferences, 'cleanliness', 0);
  const noise = getJsonbProperty(user?.lifestylePreferences, 'noise', 0);
  const guestFrequency = getJsonbProperty(user?.lifestylePreferences, 'guestFrequency', 0);
  const city = getJsonbProperty(user?.location, 'city', 'Not set');
  const budget = user?.budget ? `$${user.budget.min} - $${user.budget.max}` : 'Not set';

  // Format lifestyle preferences for display
  const formatLifestyleLevel = (value: number, type: string) => {
    if (type === 'cleanliness') {
      return value <= 1 ? 'Very Clean' : value <= 2 ? 'Clean' : value <= 3 ? 'Moderate' : 'Relaxed';
    } else if (type === 'noise') {
      return value <= 1 ? 'Quiet' : value <= 2 ? 'Moderate' : 'Loud';
    } else if (type === 'guestFrequency') {
      return value <= 1 ? 'Rarely' : value <= 2 ? 'Sometimes' : 'Often';
    }
    return 'Unknown';
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <EnhancedAvatar 
          user={user}
          size="xxl"
          variant="circle"
          style={styles.profileImage} 
        />
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.location}>{city}</Text>
        
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingValue}>{rating.averageRating.toFixed(1)}</Text>
          <Text style={styles.ratingLabel}>Rating</Text>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About Me</Text>
        <Text style={styles.bio}>{user.bio || 'No bio provided yet.'}</Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personality</Text>
        <Text style={styles.personalityType}>{personalityType}</Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Lifestyle Preferences</Text>
        
        <View style={styles.preferenceItem}>
          <Text style={styles.preferenceLabel}>Cleanliness</Text>
          <Text style={styles.preferenceValue}>{formatLifestyleLevel(cleanliness, 'cleanliness')}</Text>
        </View>
        
        <View style={styles.preferenceItem}>
          <Text style={styles.preferenceLabel}>Noise Level</Text>
          <Text style={styles.preferenceValue}>{formatLifestyleLevel(noise, 'noise')}</Text>
        </View>
        
        <View style={styles.preferenceItem}>
          <Text style={styles.preferenceLabel}>Guest Frequency</Text>
          <Text style={styles.preferenceValue}>{formatLifestyleLevel(guestFrequency, 'guestFrequency')}</Text>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Housing Preferences</Text>
        
        <View style={styles.preferenceItem}>
          <Text style={styles.preferenceLabel}>Budget</Text>
          <Text style={styles.preferenceValue}>{budget}</Text>
        </View>
        
        <View style={styles.preferenceItem}>
          <Text style={styles.preferenceLabel}>Room Type</Text>
          <Text style={styles.preferenceValue}>{getJsonbProperty(user?.preferences, 'roomType', 'Not set')}</Text>
        </View>
        
        <View style={styles.preferenceItem}>
          <Text style={styles.preferenceLabel}>Move-in Date</Text>
          <Text style={styles.preferenceValue}>{getJsonbProperty(user?.preferences, 'moveInDate', 'Not set')}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  location: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  ratingContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 10,
  },
  ratingValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  ratingLabel: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  bio: {
    fontSize: 16,
    lineHeight: 24,
  },
  personalityType: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  preferenceLabel: {
    fontSize: 16,
  },
  preferenceValue: {
    fontSize: 16,
    fontWeight: '500',
  },
});
