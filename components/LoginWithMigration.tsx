import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSupabaseAuthStore } from '../store/supabaseAuthStore';
import { useSupabaseUserStore } from '../store/supabaseUserStore';
import SupabaseMigrationHelper from '../utils/supabaseMigrationHelper';

export default function LoginWithMigration() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState<string | null>(null);
  
  const router = useRouter();
  const login = useSupabaseAuthStore(state => state.login);
  const fetchUserProfile = useSupabaseUserStore(state => state.fetchUserProfile);
  
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Login with Supabase auth
      const { error } = await login(email, password);
      
      if (error) {
        Alert.alert('Login Failed', error);
        setIsLoading(false);
        return;
      }
      
      // Attempt to migrate data from AsyncStorage to Supabase
      setMigrationStatus('Migrating your data...');
      const migrationResult = await SupabaseMigrationHelper.migrateAllData();
      
      if (migrationResult.success) {
        setMigrationStatus('Migration successful!');
      } else {
        console.warn('Migration warning:', migrationResult.message);
        setMigrationStatus('Migration skipped. Continuing with login...');
      }
      
      // Fetch user profile from Supabase
      setMigrationStatus('Loading your profile...');
      const { success, error: profileError } = await fetchUserProfile();
      
      if (!success) {
        Alert.alert('Error', `Failed to load profile: ${profileError}`);
        setIsLoading(false);
        return;
      }
      
      // Navigate to the appropriate screen based on onboarding status
      const { user } = useSupabaseUserStore.getState();
      
      if (user?.onboardingCompleted) {
        router.replace('/');
      } else {
        router.replace('/(onboarding)/get-started');
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
      setMigrationStatus(null);
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>
      
      <TouchableOpacity
        style={styles.loginButton}
        onPress={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.loginButtonText}>Log In</Text>
        )}
      </TouchableOpacity>
      
      {migrationStatus && (
        <Text style={styles.migrationStatus}>{migrationStatus}</Text>
      )}
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
          <Text style={styles.signupLink}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 24,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#007AFF',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  migrationStatus: {
    marginTop: 16,
    textAlign: 'center',
    color: '#666',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
  },
  signupLink: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: 'bold',
  },
});
