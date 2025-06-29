import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useUserStore } from '../../store/userStore';
import { useSupabaseUserStore } from '../../store/supabaseUserStore';
import { TestAccountHelper } from '../../utils/testAccountHelper';

export default function DebugMenu() {
  const router = useRouter();
  const { user } = useUserStore();
  const { updateUserAndProfile } = useSupabaseUserStore();

  // One-time personality data migration function
  const migratePersonalityData = async () => {
    try {
      console.log('🔄 Starting personality data migration...');
      
      // Check if legacy user has personality data
      if (!user?.personalityDimensions && !user?.personalityType) {
        alert('No personality data found in legacy store to migrate');
        return;
      }

      // Prepare personality data for migration
      const personalityData: any = {};
      if (user.personalityDimensions) {
        personalityData.personalityDimensions = user.personalityDimensions;
      }
      if (user.personalityType) {
        personalityData.personalityType = user.personalityType;
      }
      if (user.personalityTraits) {
        personalityData.personalityTraits = user.personalityTraits;
      }

      console.log('📊 Migrating personality data:', personalityData);

      // Migrate to Supabase store
      const result = await updateUserAndProfile(personalityData, { validate: false });

      if (result.success) {
        alert('✅ Personality data migrated successfully! Your radar charts should now work properly.');
        console.log('✅ Personality migration completed');
      } else {
        alert(`❌ Migration failed: ${result.error}`);
        console.error('❌ Migration failed:', result.error);
      }
    } catch (error) {
      alert(`❌ Migration error: ${error instanceof Error ? error.message : String(error)}`);
      console.error('❌ Migration error:', error);
    }
  };

  const debugOptions = [
    {
      title: 'Supabase Connection Test',
      description: 'Test the connection to Supabase and view project information',
      route: '/(debug)/supabase-test' as any,
    },
    {
      title: 'Data Migration Tool',
      description: 'Migrate data from AsyncStorage to Supabase',
      route: '/(debug)/migration' as any,
    },
    {
      title: 'Fix Personality Radar Charts',
      description: '🔧 One-time fix: Migrate personality data to fix radar charts for existing accounts',
      action: migratePersonalityData,
    },
    {
      title: 'Add Test Personality Data',
      description: '🧪 Add test personality data (ENFP) to current account for radar chart testing',
      action: async () => {
        try {
          const result = await TestAccountHelper.addPersonalityDataToTestAccount();
          if (result.success) {
            alert('✅ Test personality data added successfully! Your radar charts should now show ENFP data.');
          } else {
            alert(`❌ Failed to add test data: ${result.error}`);
          }
        } catch (error) {
          alert(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
        }
      },
    },
    {
      title: 'Reset Onboarding',
      description: 'Reset the onboarding progress to start over',
      action: () => {
        // This would reset onboarding in a real app
        alert('Onboarding reset functionality would go here');
      },
    },
    {
      title: 'Clear All Data',
      description: 'Clear all local data (use with caution)',
      action: () => {
        // This would clear all data in a real app
        alert('Clear all data functionality would go here');
      },
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Debug Menu</Text>
          <Text style={styles.subtitle}>Tools for testing and development</Text>
        </View>

        <View style={styles.userInfo}>
          <Text style={styles.userInfoTitle}>Current User</Text>
          <Text style={styles.userInfoText}>
            {user ? `${user.name} (${user.email})` : 'No user logged in'}
          </Text>
        </View>

        <View style={styles.optionsContainer}>
          {debugOptions.map((option, index) => (
            <View key={index} style={styles.optionCard}>
              <Text style={styles.optionTitle}>{option.title}</Text>
              <Text style={styles.optionDescription}>{option.description}</Text>
              
              {option.route ? (
                <Link href={option.route} asChild>
                  <TouchableOpacity style={styles.optionButton}>
                    <Text style={styles.optionButtonText}>Open</Text>
                  </TouchableOpacity>
                </Link>
              ) : (
                <TouchableOpacity 
                  style={styles.optionButton}
                  onPress={option.action}
                >
                  <Text style={styles.optionButtonText}>Execute</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Back to App</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginTop: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  userInfo: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  userInfoText: {
    fontSize: 16,
    color: '#666',
  },
  optionsContainer: {
    marginBottom: 24,
  },
  optionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  optionButton: {
    backgroundColor: '#6200EE',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  optionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  backButton: {
    backgroundColor: '#757575',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});
