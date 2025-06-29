import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useUserStore } from '../../store/userStore';
import { useSupabaseAuthStore } from '../../store/supabaseAuthStore';
import { supabase } from '../../services/supabaseClient';
import { checkMigrationNeeded, migrateUserToSupabase } from '../../utils/supabaseMigration';
import { migrateAllDataToSupabase, clearAsyncStorageData } from '../../utils/migrationUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function MigrationScreen() {
  const router = useRouter();
  const { user } = useUserStore();
  const { user: supabaseUser } = useSupabaseAuthStore();
  
  const [asyncStorageData, setAsyncStorageData] = useState<any>(null);
  const [supabaseData, setSupabaseData] = useState<any>(null);
  const [migrationStatus, setMigrationStatus] = useState<'idle' | 'checking' | 'needed' | 'not-needed' | 'in-progress' | 'completed' | 'failed'>('idle');
  const [migrationDetails, setMigrationDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkMigrationStatus();
  }, []);

  const checkMigrationStatus = async () => {
    setMigrationStatus('checking');
    setIsLoading(true);
    
    try {
      // Check if migration is needed
      const needsMigration = await checkMigrationNeeded();
      
      // Load AsyncStorage data
      const asyncData = await loadAsyncStorageData();
      setAsyncStorageData(asyncData);
      
      // Load Supabase data
      const supaData = await loadSupabaseData();
      setSupabaseData(supaData);
      
      if (needsMigration) {
        setMigrationStatus('needed');
      } else {
        setMigrationStatus('not-needed');
      }
    } catch (error) {
      console.error('Error checking migration status:', error);
      setMigrationStatus('failed');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAsyncStorageData = async () => {
    try {
      // Get all keys
      const keys = await AsyncStorage.getAllKeys();
      
      // Filter for Roomies-specific keys
      const roomiesKeys = keys.filter(key => key.startsWith('roomies-'));
      
      // Get data for each key
      const result: Record<string, any> = {};
      
      for (const key of roomiesKeys) {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          try {
            result[key] = JSON.parse(data);
          } catch (e) {
            result[key] = data;
          }
        }
      }
      
      return result;
    } catch (error) {
      console.error('Error loading AsyncStorage data:', error);
      return null;
    }
  };

  const loadSupabaseData = async () => {
    try {
      // Check if user is authenticated
      const { data: session } = await supabase.auth.getSession();
      
      if (!session || !session.session) {
        return { authenticated: false };
      }
      
      const userId = session.session.user.id;
      
      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (profileError) {
        console.error('Error loading user profile:', profileError);
      }
      
      // Get roommate profile
      const { data: roommateProfile, error: roommateError } = await supabase
        .from('roommate_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
        
      if (roommateError && roommateError.code !== 'PGRST116') {
        console.error('Error loading roommate profile:', roommateError);
      }
      
      // Get matches
      const { data: matches, error: matchesError } = await supabase
        .from('matches')
        .select('*')
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);
        
      if (matchesError) {
        console.error('Error loading matches:', matchesError);
      }
      
      // Get messages
      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .in('match_id', matches?.map(m => m.id) || []);
        
      if (messagesError) {
        console.error('Error loading messages:', messagesError);
      }
      
      return {
        authenticated: true,
        userId,
        profile,
        roommateProfile,
        matches: matches || [],
        messages: messages || [],
        matchCount: matches?.length || 0,
        messageCount: messages?.length || 0
      };
    } catch (error) {
      console.error('Error loading Supabase data:', error);
      return { authenticated: false };
    }
  };

  const startMigration = async () => {
    try {
      setMigrationStatus('in-progress');
      setIsLoading(true);
      
      // Check if user data exists in AsyncStorage
      const userDataString = await AsyncStorage.getItem('roomies-user-storage');
      if (!userDataString) {
        Alert.alert('Migration Error', 'No user data found in local storage.');
        setMigrationStatus('failed');
        setIsLoading(false);
        return;
      }
      
      // Parse user data
      const userData = JSON.parse(userDataString);
      if (!userData.state || !userData.state.user) {
        Alert.alert('Migration Error', 'Invalid user data format in local storage.');
        setMigrationStatus('failed');
        setIsLoading(false);
        return;
      }
      
      const user = userData.state.user;
      
      // Prompt for password (in a real app, you'd have a proper password input)
      const password = 'password123'; // This is just for demo purposes
      
      // Migrate user to Supabase
      const migrationResult = await migrateUserToSupabase(user.email, password);
      
      if (!migrationResult.success) {
        Alert.alert('Migration Error', migrationResult.error || 'Failed to migrate user account.');
        setMigrationStatus('failed');
        setIsLoading(false);
        return;
      }
      
      // Migrate all other data
      const dataResult = await migrateAllDataToSupabase(migrationResult.userId);
      
      if (!dataResult.success) {
        Alert.alert('Migration Warning', 'User account migrated but some data could not be migrated.');
      }
      
      // Refresh data
      const asyncData = await loadAsyncStorageData();
      setAsyncStorageData(asyncData);
      
      const supaData = await loadSupabaseData();
      setSupabaseData(supaData);
      
      setMigrationStatus('completed');
      setMigrationDetails({
        userId: migrationResult.userId,
        userMigrated: true,
        dataMigrated: dataResult.success
      });
      
      Alert.alert('Migration Complete', 'Your account has been successfully migrated to our new system.');
      
    } catch (error: any) {
      console.error('Error during migration:', error);
      Alert.alert('Migration Error', error.message || 'An unexpected error occurred during migration.');
      setMigrationStatus('failed');
    } finally {
      setIsLoading(false);
    }
  };

  const clearLocalData = async () => {
    try {
      const result = await clearAsyncStorageData();
      
      if (result.success) {
        Alert.alert('Data Cleared', `Successfully cleared ${result.count} items from local storage.`);
        
        // Refresh AsyncStorage data
        const asyncData = await loadAsyncStorageData();
        setAsyncStorageData(asyncData);
      } else {
        Alert.alert('Operation Cancelled', result.message || 'No data was cleared.');
      }
    } catch (error: any) {
      console.error('Error clearing data:', error);
      Alert.alert('Error', error.message || 'An unexpected error occurred while clearing data.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Data Migration Tool</Text>
        <Text style={styles.subtitle}>Migrate your data from local storage to Supabase</Text>
      </View>
      
      <View style={styles.statusCard}>
        <Text style={styles.statusTitle}>Migration Status</Text>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Status:</Text>
          <Text style={[
            styles.statusValue, 
            migrationStatus === 'needed' && styles.statusWarning,
            migrationStatus === 'completed' && styles.statusSuccess,
            migrationStatus === 'failed' && styles.statusError
          ]}>
            {migrationStatus === 'idle' && 'Not checked'}
            {migrationStatus === 'checking' && 'Checking...'}
            {migrationStatus === 'needed' && 'Migration needed'}
            {migrationStatus === 'not-needed' && 'No migration needed'}
            {migrationStatus === 'in-progress' && 'Migration in progress...'}
            {migrationStatus === 'completed' && 'Migration completed'}
            {migrationStatus === 'failed' && 'Migration failed'}
          </Text>
        </View>
        
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Local User:</Text>
          <Text style={styles.statusValue}>
            {asyncStorageData?.['roomies-user-storage']?.state?.user?.name || 'None'}
          </Text>
        </View>
        
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Supabase User:</Text>
          <Text style={styles.statusValue}>
            {supabaseData?.profile?.name || (supabaseUser && 'metadata' in supabaseUser ? (supabaseUser as any).user_metadata?.name : null) || 'None'}
          </Text>
        </View>
      </View>
      
      <View style={styles.dataCard}>
        <Text style={styles.cardTitle}>Local Storage Data</Text>
        {asyncStorageData ? (
          <>
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>User:</Text>
              <Text style={styles.dataValue}>
                {asyncStorageData['roomies-user-storage']?.state?.user ? 'Found' : 'Not found'}
              </Text>
            </View>
            
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Roommate Profile:</Text>
              <Text style={styles.dataValue}>
                {asyncStorageData['roomies-roommate-storage']?.state?.profiles?.length > 0 ? 
                  `${asyncStorageData['roomies-roommate-storage']?.state?.profiles?.length} profiles` : 
                  'Not found'}
              </Text>
            </View>
            
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Matches:</Text>
              <Text style={styles.dataValue}>
                {asyncStorageData['roomies-matches-storage']?.state?.matches?.length || 0} matches
              </Text>
            </View>
            
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Messages:</Text>
              <Text style={styles.dataValue}>
                {asyncStorageData['roomies-messages-storage']?.state?.conversations?.length || 0} conversations
              </Text>
            </View>
          </>
        ) : (
          <Text style={styles.emptyText}>No local storage data found</Text>
        )}
      </View>
      
      <View style={styles.dataCard}>
        <Text style={styles.cardTitle}>Supabase Data</Text>
        {supabaseData?.authenticated ? (
          <>
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>User Profile:</Text>
              <Text style={styles.dataValue}>
                {supabaseData.profile ? 'Found' : 'Not found'}
              </Text>
            </View>
            
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Roommate Profile:</Text>
              <Text style={styles.dataValue}>
                {supabaseData.roommateProfile ? 'Found' : 'Not found'}
              </Text>
            </View>
            
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Matches:</Text>
              <Text style={styles.dataValue}>
                {supabaseData.matchCount} matches
              </Text>
            </View>
            
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Messages:</Text>
              <Text style={styles.dataValue}>
                {supabaseData.messageCount} messages
              </Text>
            </View>
          </>
        ) : (
          <Text style={styles.emptyText}>Not authenticated with Supabase</Text>
        )}
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.refreshButton]} 
          onPress={checkMigrationStatus}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Refresh Data</Text>
        </TouchableOpacity>
        
        {migrationStatus === 'needed' && (
          <TouchableOpacity 
            style={[styles.button, styles.migrateButton]} 
            onPress={startMigration}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>Start Migration</Text>
          </TouchableOpacity>
        )}
        
        {migrationStatus === 'completed' && (
          <TouchableOpacity 
            style={[styles.button, styles.clearButton]} 
            onPress={clearLocalData}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>Clear Local Data</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={[styles.button, styles.backButton]} 
          onPress={() => router.back()}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
      </View>
      
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#6200EE" />
          <Text style={styles.loadingText}>
            {migrationStatus === 'checking' && 'Checking migration status...'}
            {migrationStatus === 'in-progress' && 'Migrating data...'}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  header: {
    marginTop: 60,
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  statusCard: {
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
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 16,
    color: '#666',
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  statusWarning: {
    color: '#FF9800',
  },
  statusSuccess: {
    color: '#4CAF50',
  },
  statusError: {
    color: '#F44336',
  },
  dataCard: {
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
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dataLabel: {
    fontSize: 16,
    color: '#666',
  },
  dataValue: {
    fontSize: 16,
    color: '#333',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 16,
  },
  buttonContainer: {
    marginVertical: 24,
  },
  button: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  refreshButton: {
    backgroundColor: '#2196F3',
  },
  migrateButton: {
    backgroundColor: '#6200EE',
  },
  clearButton: {
    backgroundColor: '#FF5722',
  },
  backButton: {
    backgroundColor: '#757575',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#333',
  },
});
