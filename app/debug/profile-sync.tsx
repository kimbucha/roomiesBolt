import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useUserStore } from '../../store/userStore';
import { useRoommateStore } from '../../store/roommateStore';
import { updateProfilesFromUserData } from '../../utils/profileUpdater';
import { showToast } from '../../components/common/Toast';

/**
 * Debug screen to compare user and roommate profiles
 * Helps identify any data inconsistencies between the two profiles
 */
export default function ProfileSyncDebug() {
  const { user } = useUserStore();
  const { profiles } = useRoommateStore();
  const [differences, setDifferences] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [roommateProfile, setRoommateProfile] = useState<any>(null);

  // Find the roommate profile that matches the current user
  useEffect(() => {
    if (user) {
      // Get the current user's roommate profile
      const matchingProfile = profiles.find(profile => profile.id === user.id);
      
      setUserProfile(user);
      setRoommateProfile(matchingProfile || null);
      
      // Compare the profiles and identify differences
      if (matchingProfile) {
        const diffs = compareProfiles(user, matchingProfile);
        setDifferences(diffs);
      }
    }
  }, [user, profiles]);

  // Compare user and roommate profiles to identify differences
  const compareProfiles = (user: any, roommateProfile: any): any[] => {
    const differences = [];
    
    // Check basic info
    if (user.name !== roommateProfile.name) {
      differences.push({
        field: 'name',
        user: user.name,
        roommate: roommateProfile.name
      });
    }
    
    if (user.gender !== roommateProfile.gender) {
      differences.push({
        field: 'gender',
        user: user.gender,
        roommate: roommateProfile.gender
      });
    }
    
    // Check personality data
    if (user.personalityType !== roommateProfile.personalityType) {
      differences.push({
        field: 'personalityType',
        user: user.personalityType,
        roommate: roommateProfile.personalityType
      });
    }
    
    // Check if personality traits match
    if (user.personalityTraits && roommateProfile.personalityTraits) {
      const userTraits = new Set(user.personalityTraits);
      const roommateTraits = new Set(roommateProfile.personalityTraits);
      
      if (userTraits.size !== roommateTraits.size || 
          !user.personalityTraits.every((trait: string) => roommateTraits.has(trait))) {
        differences.push({
          field: 'personalityTraits',
          user: user.personalityTraits.join(', '),
          roommate: roommateProfile.personalityTraits.join(', ')
        });
      }
    }
    
    // Check if lifestyle preferences match
    if (user.lifestylePreferences && roommateProfile.lifestylePreferences) {
      // Compare cleanliness
      if (user.lifestylePreferences.cleanliness !== undefined) {
        differences.push({
          field: 'lifestylePreferences.cleanliness',
          user: user.lifestylePreferences.cleanliness,
          roommate: roommateProfile.lifestylePreferences?.cleanliness || 'Not set'
        });
      }
      
      // Compare noise level
      if (user.lifestylePreferences.noise !== undefined) {
        differences.push({
          field: 'lifestylePreferences.noise',
          user: user.lifestylePreferences.noise,
          roommate: roommateProfile.lifestylePreferences?.noiseLevel || 'Not set'
        });
      }
    }
    
    // Check budget
    if (user.budget && (
        !roommateProfile.budget || 
        !roommateProfile.budget.includes(`${user.budget.min}-${user.budget.max}`)
      )) {
      differences.push({
        field: 'budget',
        user: user.budget ? `$${user.budget.min}-${user.budget.max}` : 'Not set',
        roommate: roommateProfile.budget || 'Not set'
      });
    }
    
    // Check place details
    if (user.hasPlace !== (roommateProfile.hasPlace === true)) {
      differences.push({
        field: 'hasPlace',
        user: user.hasPlace ? 'Yes' : 'No',
        roommate: roommateProfile.hasPlace ? 'Yes' : 'No'
      });
    }
    
    if (user.preferences?.roomType !== roommateProfile.roomType) {
      differences.push({
        field: 'roomType',
        user: user.preferences?.roomType || 'Not set',
        roommate: roommateProfile.roomType || 'Not set'
      });
    }
    
    return differences;
  };

  // Force sync profiles
  const handleSyncProfiles = () => {
    try {
      updateProfilesFromUserData();
      showToast('Profiles synced successfully!', 'success');
      
      // Refresh the differences after syncing
      setTimeout(() => {
        if (user) {
          const matchingProfile = profiles.find(profile => profile.id === user.id);
          if (matchingProfile) {
            const diffs = compareProfiles(user, matchingProfile);
            setDifferences(diffs);
            setRoommateProfile(matchingProfile);
          }
        }
      }, 500);
    } catch (error) {
      showToast('Error syncing profiles: ' + (error as Error).message, 'error');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Profile Sync Debug</Text>
      
      {/* User Profile Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>User Profile</Text>
        {userProfile ? (
          <View>
            <Text style={styles.infoText}>Name: {userProfile.name}</Text>
            <Text style={styles.infoText}>Email: {userProfile.email}</Text>
            <Text style={styles.infoText}>Gender: {userProfile.gender || 'Not set'}</Text>
            <Text style={styles.infoText}>Personality: {userProfile.personalityType || 'Not set'}</Text>
            <Text style={styles.infoText}>
              Budget: {userProfile.budget ? `$${userProfile.budget.min}-${userProfile.budget.max}` : 'Not set'}
            </Text>
            <Text style={styles.infoText}>
              Room Type: {userProfile.preferences?.roomType || 'Not set'}
            </Text>
            <Text style={styles.infoText}>
              Has Place: {userProfile.hasPlace ? 'Yes' : 'No'}
            </Text>
          </View>
        ) : (
          <Text style={styles.errorText}>No user profile found</Text>
        )}
      </View>
      
      {/* Roommate Profile Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Roommate Profile</Text>
        {roommateProfile ? (
          <View>
            <Text style={styles.infoText}>Name: {roommateProfile.name}</Text>
            <Text style={styles.infoText}>Gender: {roommateProfile.gender || 'Not set'}</Text>
            <Text style={styles.infoText}>Personality: {roommateProfile.personalityType || 'Not set'}</Text>
            <Text style={styles.infoText}>Budget: {roommateProfile.budget || 'Not set'}</Text>
            <Text style={styles.infoText}>Room Type: {roommateProfile.roomType || 'Not set'}</Text>
            <Text style={styles.infoText}>Has Place: {roommateProfile.hasPlace ? 'Yes' : 'No'}</Text>
          </View>
        ) : (
          <Text style={styles.errorText}>No matching roommate profile found</Text>
        )}
      </View>
      
      {/* Differences Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Differences ({differences.length})</Text>
        {differences.length > 0 ? (
          differences.map((diff, index) => (
            <View key={index} style={styles.diffItem}>
              <Text style={styles.diffField}>{diff.field}</Text>
              <View style={styles.diffValues}>
                <Text style={styles.diffUser}>User: {diff.user}</Text>
                <Text style={styles.diffRoommate}>Roommate: {diff.roommate}</Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.successText}>No differences found! Profiles are in sync.</Text>
        )}
      </View>
      
      {/* Sync Button */}
      <TouchableOpacity style={styles.syncButton} onPress={handleSyncProfiles}>
        <Text style={styles.syncButtonText}>Force Sync Profiles</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 40,
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#4F46E5',
  },
  infoText: {
    fontSize: 16,
    marginBottom: 8,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 16,
    fontStyle: 'italic',
  },
  successText: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: '500',
  },
  diffItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  diffField: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  diffValues: {
    marginLeft: 8,
  },
  diffUser: {
    fontSize: 14,
    color: '#4F46E5',
    marginBottom: 2,
  },
  diffRoommate: {
    fontSize: 14,
    color: '#EF4444',
  },
  syncButton: {
    backgroundColor: '#4F46E5',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 16,
  },
  syncButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
