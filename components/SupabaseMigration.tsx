import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Button } from 'react-native';
import SupabaseMigrationHelper from '../utils/supabaseMigrationHelper';
import { useSupabaseAuthStore } from '../store/supabaseAuthStore';
import { useSupabaseUserStore } from '../store/supabaseUserStore';

/**
 * Component to handle migration from AsyncStorage to Supabase
 * This can be shown after login to migrate data
 */
export const SupabaseMigration: React.FC<{
  onComplete: () => void;
  onSkip?: () => void;
}> = ({ onComplete, onSkip }) => {
  const [status, setStatus] = useState<'idle' | 'migrating' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const { user: authUser } = useSupabaseAuthStore();
  const fetchUserProfile = useSupabaseUserStore(state => state.fetchUserProfile);

  const startMigration = async () => {
    if (!authUser) {
      setStatus('error');
      setMessage('You must be logged in to migrate data');
      return;
    }

    setStatus('migrating');
    setMessage('Migrating your data to the new database...');

    try {
      // Attempt to migrate all data
      const result = await SupabaseMigrationHelper.migrateAllData();
      
      if (result.success) {
        // Fetch the user profile from Supabase
        await fetchUserProfile();
        setStatus('success');
        setMessage('Migration completed successfully!');
        
        // Notify parent component
        setTimeout(onComplete, 1500);
      } else {
        setStatus('error');
        setMessage(`Migration failed: ${result.message}`);
      }
    } catch (error) {
      setStatus('error');
      setMessage(`An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // Auto-start migration when component mounts
  useEffect(() => {
    if (authUser) {
      startMigration();
    }
  }, [authUser]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Data Migration</Text>
      
      {status === 'idle' && (
        <>
          <Text style={styles.message}>
            We need to migrate your data to our new database system.
            This will ensure your profile information is preserved.
          </Text>
          <Button title="Start Migration" onPress={startMigration} />
          {onSkip && <Button title="Skip" onPress={onSkip} />}
        </>
      )}
      
      {status === 'migrating' && (
        <>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.message}>{message}</Text>
        </>
      )}
      
      {status === 'success' && (
        <>
          <Text style={[styles.message, styles.success]}>✅ {message}</Text>
        </>
      )}
      
      {status === 'error' && (
        <>
          <Text style={[styles.message, styles.error]}>❌ {message}</Text>
          <Button title="Try Again" onPress={startMigration} />
          {onSkip && <Button title="Skip" onPress={onSkip} />}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 20,
  },
  success: {
    color: 'green',
  },
  error: {
    color: 'red',
  },
});

export default SupabaseMigration;
