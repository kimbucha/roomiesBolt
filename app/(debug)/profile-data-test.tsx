import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useUserStore } from '../../store/userStore';
import { useRoommateStore } from '../../store/roommateStore';
import { testProfileDataTransfer, testProfileFieldUpdate } from '../../utils/profileDataTester';

export default function ProfileDataTestScreen() {
  const router = useRouter();
  const { user } = useUserStore();
  const { profiles } = useRoommateStore();
  const [testResults, setTestResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTest, setSelectedTest] = useState<string | null>(null);

  // Run the profile data transfer test
  const runTransferTest = async () => {
    setIsLoading(true);
    setSelectedTest('transfer');
    
    try {
      const results = testProfileDataTransfer();
      setTestResults(results);
    } catch (error) {
      setTestResults({
        success: false,
        error: String(error)
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Run the profile field update test
  const runFieldUpdateTest = async () => {
    setIsLoading(true);
    setSelectedTest('fieldUpdate');
    
    try {
      // Test updating a simple field
      const results = testProfileFieldUpdate('bio', 'Updated bio from debug screen');
      setTestResults(results);
    } catch (error) {
      setTestResults({
        success: false,
        error: String(error)
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Run a test for updating lifestyle preferences
  const runLifestyleUpdateTest = async () => {
    setIsLoading(true);
    setSelectedTest('lifestyleUpdate');
    
    try {
      // Test updating lifestyle preferences
      const results = testProfileFieldUpdate('lifestylePreferences', {
        sleepSchedule: 'night_owl',
        cleanliness: 'very_clean',
        noiseLevel: 'quiet',
        guestPolicy: 'rarely',
        smoking: false,
        pets: true
      });
      setTestResults(results);
    } catch (error) {
      setTestResults({
        success: false,
        error: String(error)
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile Data Test</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>User Profile</Text>
        {user ? (
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>Name: {user.name}</Text>
            <Text style={styles.infoText}>Email: {user.email}</Text>
            <Text style={styles.infoText}>Gender: {user.gender || 'Not set'}</Text>
            <Text style={styles.infoText}>University: {user.university || 'Not set'}</Text>
            <Text style={styles.infoText}>Personality Traits: {user.personalityTraits?.join(', ') || 'None'}</Text>
          </View>
        ) : (
          <Text style={styles.noDataText}>No user data available</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Roommate Profiles</Text>
        {profiles.length > 0 ? (
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>Total Profiles: {profiles.length}</Text>
            {profiles.map((profile, index) => (
              <View key={profile.id} style={styles.profileItem}>
                <Text style={styles.profileName}>{index + 1}. {profile.name}</Text>
                <Text style={styles.infoText}>Gender: {profile.gender || 'Not set'}</Text>
                <Text style={styles.infoText}>University: {profile.university || 'Not set'}</Text>
                <Text style={styles.infoText}>Traits: {profile.traits?.join(', ') || 'None'}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.noDataText}>No roommate profiles available</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Test Actions</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, selectedTest === 'transfer' && styles.selectedButton]} 
            onPress={runTransferTest}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>Test Profile Transfer</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, selectedTest === 'fieldUpdate' && styles.selectedButton]} 
            onPress={runFieldUpdateTest}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>Test Field Update</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, selectedTest === 'lifestyleUpdate' && styles.selectedButton]} 
            onPress={runLifestyleUpdateTest}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>Test Lifestyle Update</Text>
          </TouchableOpacity>
        </View>
      </View>

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Running test...</Text>
        </View>
      )}

      {testResults && !isLoading && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test Results</Text>
          <View style={[
            styles.resultsCard, 
            testResults.success ? styles.successCard : styles.errorCard
          ]}>
            <Text style={styles.resultTitle}>
              {testResults.success ? '✅ Success' : '❌ Failed'}
            </Text>
            
            {testResults.error && (
              <Text style={styles.errorText}>{testResults.error}</Text>
            )}
            
            {testResults.verificationResults && (
              <View style={styles.verificationContainer}>
                <Text style={styles.verificationTitle}>Field Verifications:</Text>
                {Object.entries(testResults.verificationResults).map(([field, result]: [string, any]) => (
                  <Text key={field} style={styles.verificationText}>
                    {field}: {result ? '✅' : '❌'}
                  </Text>
                ))}
              </View>
            )}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#6366F1',
    fontSize: 16,
  },
  section: {
    marginVertical: 12,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 6,
  },
  noDataText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 12,
  },
  profileItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  buttonContainer: {
    flexDirection: 'column',
    gap: 12,
  },
  button: {
    backgroundColor: '#6366F1',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  selectedButton: {
    backgroundColor: '#4F46E5',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6366F1',
  },
  resultsCard: {
    borderRadius: 8,
    padding: 16,
  },
  successCard: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  errorCard: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 14,
    marginBottom: 8,
  },
  verificationContainer: {
    marginTop: 12,
  },
  verificationTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  verificationText: {
    fontSize: 14,
    marginBottom: 4,
  },
});
