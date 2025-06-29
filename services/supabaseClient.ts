import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-url-polyfill/auto';

// Import environment variables from Expo config
import Constants from 'expo-constants';

// Get Supabase configuration from app.config.js
const { supabaseUrl, supabaseAnonKey, supabaseServiceKey } = Constants.expoConfig?.extra || {};

// Validate that we have the required configuration
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[Supabase] Missing required configuration. Check app.config.js');
}

// In development, we'll use a service role key to bypass RLS for test accounts
// IMPORTANT: This should NEVER be included in production builds
const serviceRoleKey = __DEV__ && supabaseServiceKey ? supabaseServiceKey : '';

// Enhanced client configuration for better performance and reliability
// Regular client for normal app usage
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    // In development, disable session persistence so restarts are truly fresh
    persistSession: !__DEV__, // false in dev, true in production
    detectSessionInUrl: false,
  },
  global: {
    // Improve network reliability with retries
    fetch: (url, options) => {
      // Create a compatible timeout implementation for React Native
      const timeoutController = new AbortController();
      const { signal } = timeoutController;
      
      // Set a timeout that will abort the request if it takes too long
      const timeoutId = setTimeout(() => {
        timeoutController.abort('Request timed out');
      }, 30000); // 30 second timeout
      
      // Use the original signal or our timeout signal
      const finalSignal = options?.signal || signal;
      
      // If the original request is aborted, we should clear our timeout
      if (options?.signal) {
        options.signal.addEventListener('abort', () => {
          clearTimeout(timeoutId);
        });
      }
      
      return fetch(url, {
        ...options,
        signal: finalSignal,
      }).finally(() => {
        // Clean up the timeout when the request completes
        clearTimeout(timeoutId);
      });
    },
  },
});

/**
 * Development helper to completely clear all sessions and storage
 * This ensures a truly fresh start when developing
 */
export const clearAllSessionsAndStorage = async (): Promise<void> => {
  if (!__DEV__) {
    console.warn('[Supabase] Session clearing only available in development');
    return;
  }
  
  try {
    // KEEP: Essential for data persistence testing
    console.log('[DATA PERSISTENCE TEST] 🧹 Clearing all sessions and storage for fresh test...');
    
    // 1. Sign out from Supabase (this also clears the session from storage)
    await supabase.auth.signOut();
    
    // 2. Clear all Supabase-related keys from AsyncStorage
    const allKeys = await AsyncStorage.getAllKeys();
    const supabaseKeys = allKeys.filter(key => 
      key.includes('supabase') || 
      key.includes('sb-') ||
      key.includes('auth-token') ||
      key.includes('session')
    );
    
    if (supabaseKeys.length > 0) {
      await AsyncStorage.multiRemove(supabaseKeys);
    }
    
    // 3. Clear user-related storage (optional - add more keys as needed)
    const userKeys = ['user_profile', 'onboarding_progress', 'user_preferences'];
    const existingUserKeys = allKeys.filter(key => userKeys.includes(key));
    if (existingUserKeys.length > 0) {
      await AsyncStorage.multiRemove(existingUserKeys);
    }
    
    // KEEP: Essential for data persistence testing
    console.log('[DATA PERSISTENCE TEST] ✅ All sessions and storage cleared successfully');
  } catch (error) {
    console.error('[Supabase] ❌ Error clearing sessions:', error);
  }
};

/**
 * Development helper to check what's currently stored in AsyncStorage
 */
export const debugAsyncStorage = async (): Promise<void> => {
  if (!__DEV__) return;
  
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    
    // Show Supabase-related keys
    const supabaseKeys = allKeys.filter(key => 
      key.includes('supabase') || key.includes('sb-')
    );
    
    for (const key of supabaseKeys) {
      const value = await AsyncStorage.getItem(key);
      // Silent - only keep essential data persistence logs
    }
  } catch (error) {
    console.error('[Supabase] Error debugging AsyncStorage:', error);
  }
};

// Helper function to check if Supabase is connected with retry logic
export const checkSupabaseConnection = async (retries = 2): Promise<boolean> => {
  try {
    // Use a simple and fast query to check connection
    const { data, error } = await supabase.from('health_check').select('count').limit(1);
    
    if (error) {
      console.error('[Supabase] Connection error:', error.message);
      
      // Implement retry logic
      if (retries > 0) {
        // Wait for 1 second before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
        return checkSupabaseConnection(retries - 1);
      }
      
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('[Supabase] Connection check failed:', error instanceof Error ? error.message : String(error));
    
    // Implement retry logic for exceptions too
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return checkSupabaseConnection(retries - 1);
    }
    
    return false;
  }
};

// Helper to get current session with error handling
export const getCurrentSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('[Supabase] Session error:', error.message);
      return null;
    }
    return data.session;
  } catch (error) {
    console.error('[Supabase] Get session failed:', error instanceof Error ? error.message : String(error));
    return null;
  }
};

// Development-only service role client for test account operations
// This client bypasses RLS policies and should ONLY be used for test accounts
export const supabaseAdmin = __DEV__ ? createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
}) : null;

/**
 * Helper function for test account operations that need to bypass RLS
 * This should ONLY be used during development for test accounts
 */
export const createProfileWithServiceRole = async (userId: string, profileData: any): Promise<{success: boolean, error?: any}> => {
  if (!__DEV__ || !supabaseAdmin) {
    console.warn('[Supabase] Service role operations only available in development');
    return { success: false, error: 'Service role operations only available in development' };
  }
  
  try {
    const { error } = await supabaseAdmin.from('users').insert({
      id: userId,
      ...profileData
    });
    
    if (error) {
      console.error('[Supabase] Service role profile creation failed:', error.message);
      return { success: false, error };
    }
    
    return { success: true };
  } catch (error) {
    console.error('[Supabase] Service role operation error:', error);
    return { success: false, error };
  }
};
