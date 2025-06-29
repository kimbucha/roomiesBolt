import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useUserStore } from '../../../store/userStore';
import { useRoommateStore } from '../../../store/roommateStore';
import { compareProfiles, logProfileData } from '../../../utils/profileDebugger';
import { showToast } from '../../../components/common/Toast';

/**
 * Onboarding Data Flow Debug Screen
 * 
 * This screen helps diagnose issues with the onboarding data flow:
 * - Shows the current state of user and roommate profiles
 * - Highlights any data inconsistencies
 * - Provides tools to test data synchronization
 * - Includes performance monitoring for UI operations
 */
export default function OnboardingDataFlowDebug() {
  const router = useRouter();
  const { user, updateUserAndProfile } = useUserStore();
  const { profiles } = useRoommateStore();
  const [differences, setDifferences] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [roommateProfile, setRoommateProfile] = useState<any>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    lastUpdateTime: 0,
    updateCount: 0
  });

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

  // Test gender selection performance
  const testGenderSelection = async () => {
    const startTime = performance.now();
    setPerformanceMetrics(prev => ({
      ...prev,
      lastUpdateTime: 0,
      updateCount: prev.updateCount + 1
    }));

    // Update user with gender data
    const result = await updateUserAndProfile({
      gender: 'male'
    }, { validate: true, showToast: true });

    const endTime = performance.now();
    const updateTime = endTime - startTime;
    
    setPerformanceMetrics(prev => ({
      ...prev,
      lastUpdateTime: updateTime
    }));

    if (result.success) {
      showToast(`Gender updated in ${updateTime.toFixed(2)}ms`, 'success');
    } else {
      showToast(`Error: ${result.error}`, 'error');
    }
  };

  // Test personality traits update performance
  const testPersonalityTraitsUpdate = async () => {
    const traits = ['outgoing', 'creative', 'organized', 'quiet', 'active'];
    const startTime = performance.now();
    
    setPerformanceMetrics(prev => ({
      ...prev,
      lastUpdateTime: 0,
      updateCount: prev.updateCount + 1
    }));

    // Update user with personality traits
    const result = await updateUserAndProfile({
      personalityTraits: traits
    }, { validate: true, showToast: true });

    const endTime = performance.now();
    const updateTime = endTime - startTime;
    
    setPerformanceMetrics(prev => ({
      ...prev,
      lastUpdateTime: updateTime
    }));

    if (result.success) {
      showToast(`Personality traits updated in ${updateTime.toFixed(2)}ms`, 'success');
    } else {
      showToast(`Error: ${result.error}`, 'error');
    }
  };

  // Test personality type update performance
  const testPersonalityTypeUpdate = async () => {
    const types = ['INFP', 'ENFJ', 'ISTJ', 'ESTP'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    const startTime = performance.now();
    
    setPerformanceMetrics(prev => ({
      ...prev,
      lastUpdateTime: 0,
      updateCount: prev.updateCount + 1
    }));

    // Update user with personality type
    const result = await updateUserAndProfile({
      personalityType: randomType
    }, { validate: true, showToast: true });

    const endTime = performance.now();
    const updateTime = endTime - startTime;
    
    setPerformanceMetrics(prev => ({
      ...prev,
      lastUpdateTime: updateTime
    }));

    if (result.success) {
      showToast(`Personality type updated to ${randomType} in ${updateTime.toFixed(2)}ms`, 'success');
    } else {
      showToast(`Error: ${result.error}`, 'error');
    }
  };

  // Log detailed profile data to console
  const handleLogProfiles = () => {
    if (!user) {
      showToast('No user profile found', 'error');
      return;
    }
    
    const matchingProfile = profiles.find(profile => profile.id === user.id);
    logProfileData(user, matchingProfile || null);
    showToast('Profile data logged to console', 'success');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Onboarding Data Flow Debug</Text>
      
      {/* Performance Metrics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Performance Metrics</Text>
        <View style={styles.metricsContainer}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Last Update Time:</Text>
            <Text style={styles.metricValue}>
              {performanceMetrics.lastUpdateTime > 0 
                ? `${performanceMetrics.lastUpdateTime.toFixed(2)}ms` 
                : 'N/A'}
            </Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Update Count:</Text>
            <Text style={styles.metricValue}>{performanceMetrics.updateCount}</Text>
          </View>
        </View>
      </View>
      
      {/* Test Buttons */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Test Data Updates</Text>
        <TouchableOpacity style={styles.button} onPress={testGenderSelection}>
          <Text style={styles.buttonText}>Test Gender Selection</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={testPersonalityTraitsUpdate}>
          <Text style={styles.buttonText}>Test Personality Traits Update</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={testPersonalityTypeUpdate}>
          <Text style={styles.buttonText}>Test Personality Type Update</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={handleLogProfiles}>
          <Text style={styles.buttonText}>Log Profile Data to Console</Text>
        </TouchableOpacity>
      </View>
      
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
              Traits: {userProfile.personalityTraits?.join(', ') || 'None'}
            </Text>
            <Text style={styles.infoText}>
              Budget: {userProfile.budget ? `$${userProfile.budget.min}-${userProfile.budget.max}` : 'Not set'}
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
            <Text style={styles.infoText}>
              Traits: {roommateProfile.personalityTraits?.join(', ') || 'None'}
            </Text>
            <Text style={styles.infoText}>Budget: {roommateProfile.budget || 'Not set'}</Text>
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
                <Text style={styles.diffUser}>User: {diff.userValue}</Text>
                <Text style={styles.diffRoommate}>Roommate: {diff.roommateValue}</Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.successText}>No differences found! Profiles are in sync.</Text>
        )}
      </View>
      
      {/* Navigation */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Back to Debug Dashboard</Text>
        </TouchableOpacity>
      </View>
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
  metricsContainer: {
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    padding: 12,
  },
  metricItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#4F46E5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
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
  navigationContainer: {
    marginBottom: 40,
  },
  backButton: {
    backgroundColor: '#6B7280',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});
