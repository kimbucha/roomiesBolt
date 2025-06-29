import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { useUserStore } from '../../store/userStore';
import { useRoommateStore } from '../../store/roommateStore';
import { logProfileData } from '../../utils/profileDebugger';

/**
 * Debug Dashboard
 * 
 * This screen provides access to various debugging tools for the Roomies app.
 */
export default function DebugDashboard() {
  const { user } = useUserStore();
  const { profiles } = useRoommateStore();
  
  // Log profile data to console
  const handleLogProfiles = () => {
    if (!user) {
      console.log('No user profile found');
      return;
    }
    
    const matchingProfile = profiles.find(profile => profile.id === user.id);
    logProfileData(user, matchingProfile || null);
    console.log('Profile data logged to console');
  };
  
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Debug Dashboard</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile Tools</Text>
        
        <Link href="/debug/profile-sync" asChild>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Profile Sync Debugger</Text>
          </TouchableOpacity>
        </Link>
        
        <Link href="/debug/onboarding/data-flow" asChild>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Onboarding Data Flow Debug</Text>
          </TouchableOpacity>
        </Link>
        
        <TouchableOpacity style={styles.button} onPress={handleLogProfiles}>
          <Text style={styles.buttonText}>Log Profile Data to Console</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Onboarding Data</Text>
        
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>User ID:</Text>
          <Text style={styles.infoValue}>{user?.id || 'Not logged in'}</Text>
          
          <Text style={styles.infoLabel}>Onboarding Progress:</Text>
          <Text style={styles.infoValue}>{user?.onboardingProgress || 'Not started'}</Text>
          
          <Text style={styles.infoLabel}>Onboarding Completed:</Text>
          <Text style={styles.infoValue}>{user?.onboardingCompleted ? 'Yes' : 'No'}</Text>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Validation</Text>
        
        <Link href="/debug/validation-test" asChild>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Test Validation Rules</Text>
          </TouchableOpacity>
        </Link>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Navigation</Text>
        
        <Link href="/" asChild>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Go to Home</Text>
          </TouchableOpacity>
        </Link>
        
        <Link href="/(onboarding)/welcome" asChild>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Go to Onboarding</Text>
          </TouchableOpacity>
        </Link>
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
  infoBox: {
    padding: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
    color: '#4b5563',
  },
  infoValue: {
    fontSize: 16,
    marginBottom: 8,
  },
});
