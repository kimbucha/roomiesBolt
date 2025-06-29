import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useSupabaseAuthStore } from '../store/supabaseAuthStore';
import { useSupabaseUserStore } from '../store/supabaseUserStore';
import { supabase } from '../services/supabaseClient';

/**
 * AuthWrapper component to handle authentication state and profile loading
 * Wrap your app with this component to ensure the user profile is loaded
 */
export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { user: authUser } = useSupabaseAuthStore();
  const fetchUserProfile = useSupabaseUserStore(state => state.fetchUserProfile);
  
  useEffect(() => {
    // Check for existing session on mount
    const checkSession = async () => {
      try {
        setIsLoading(true);
        
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Session exists, fetch the user profile
          const { success, error } = await fetchUserProfile();
          
          if (!success && error) {
            console.error('Failed to load user profile:', error);
            setError('Failed to load your profile. Please try logging in again.');
          }
        }
      } catch (err) {
        console.error('Auth check error:', err);
        setError('Authentication error. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSession();
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // User signed in, fetch their profile
          await fetchUserProfile();
        } else if (event === 'SIGNED_OUT') {
          // User signed out, clear profile (handled by the auth store)
        }
      }
    );
    
    // Clean up subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }
  
  // Render children when authentication is checked
  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
});
