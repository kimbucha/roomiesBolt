import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Emergency Data Reset Utility
 * 
 * This utility provides functions to completely reset all app data
 * including Zustand persisted stores, AsyncStorage, and Supabase cache.
 */

export const dataReset = {
  /**
   * Clear all AsyncStorage data
   */
  clearAsyncStorage: async (): Promise<void> => {
    try {
      console.log('[DataReset] Clearing AsyncStorage...');
      await AsyncStorage.clear();
      console.log('[DataReset] ✅ AsyncStorage cleared');
    } catch (error) {
      console.error('[DataReset] ❌ Failed to clear AsyncStorage:', error);
      throw error;
    }
  },

  /**
   * Clear specific Zustand store from AsyncStorage
   */
  clearZustandStore: async (storeName: string): Promise<void> => {
    try {
      console.log(`[DataReset] Clearing Zustand store: ${storeName}`);
      await AsyncStorage.removeItem(storeName);
      console.log(`[DataReset] ✅ Cleared store: ${storeName}`);
    } catch (error) {
      console.error(`[DataReset] ❌ Failed to clear store ${storeName}:`, error);
      throw error;
    }
  },

  /**
   * Clear all known Zustand stores
   */
  clearAllZustandStores: async (): Promise<void> => {
    const storeKeys = [
      'roomies-roommate-storage',      // roommateStore (CORRECTED NAME!)
      'matches-storage',              // matchesStore (legacy)
      'supabase-matches-storage',     // supabaseMatchesStore
      'supabase-user-storage',        // supabaseUserStore
      'message-storage',              // messageStore
      'roomies-preferences-storage',  // preferencesStore (CORRECTED NAME!)
      'auth-storage',                 // authStore
      'roomies-user-storage',         // userStore (CORRECTED NAME!)
      'roomies-subscription-storage', // subscriptionStore
      'profile-overlay-storage',      // profileOverlayStore
    ];

    for (const storeKey of storeKeys) {
      await dataReset.clearZustandStore(storeKey);
    }
  },

  /**
   * Reset specific stores related to matching/swiping
   */
  clearMatchingData: async (): Promise<void> => {
    const matchingStores = [
      'roomies-roommate-storage',  // CORRECTED NAME!
      'matches-storage', 
      'supabase-matches-storage',
    ];

    for (const storeKey of matchingStores) {
      await dataReset.clearZustandStore(storeKey);
    }

    console.log('[DataReset] ✅ All matching data cleared');
  },

  /**
   * Reset stores in memory (force them to reinitialize)
   */
  resetStoresInMemory: async (): Promise<void> => {
    try {
      console.log('[DataReset] Resetting stores in memory...');
      
      // Import stores using require to avoid dynamic import issues
      const { useRoommateStore } = require('../store/roommateStore');
      const { useMatchesStore } = require('../store/matchesStore');
      const { useSupabaseMatchesStore } = require('../store/supabaseMatchesStore');
      
      // Get store instances and reset them
      const roommateStore = useRoommateStore.getState();
      const matchesStore = useMatchesStore.getState();
      const supabaseMatchesStore = useSupabaseMatchesStore.getState();

      // Reset roommateStore
      if (roommateStore.resetSwipes) {
        roommateStore.resetSwipes();
        console.log('[DataReset] ✅ Reset roommateStore swipes');
      }

      // Reset matchesStore
      if (matchesStore.setMatches) {
        matchesStore.setMatches([]);
        matchesStore.setPendingLikes([]);
        console.log('[DataReset] ✅ Reset matchesStore');
      }

      // Reset supabaseMatchesStore (remove clearMatches since it doesn't exist)
      console.log('[DataReset] ✅ Reset supabaseMatchesStore (no clear method available)');

      console.log('[DataReset] ✅ All stores reset in memory');
    } catch (error) {
      console.error('[DataReset] ❌ Failed to reset stores in memory:', error);
      // Don't throw - this is a fallback operation
    }
  },

  /**
   * Complete data reset - USE WITH CAUTION
   * This will clear ALL app data including user auth
   */
  completeReset: async (): Promise<void> => {
    console.log('[DataReset] 🚨 PERFORMING COMPLETE DATA RESET 🚨');
    
    try {
      // Step 1: Clear all AsyncStorage
      await dataReset.clearAsyncStorage();
      
      // Step 2: Reset stores in memory
      await dataReset.resetStoresInMemory();
      
      console.log('[DataReset] ✅ COMPLETE RESET SUCCESSFUL');
      console.log('[DataReset] 📱 Please restart the app for full effect');
      
    } catch (error) {
      console.error('[DataReset] ❌ COMPLETE RESET FAILED:', error);
      throw error;
    }
  },

  /**
   * Targeted reset for debugging matching issues
   */
  debugMatchingReset: async (): Promise<void> => {
    console.log('[DataReset] 🔧 Debug matching reset...');
    
    try {
      // Clear only matching-related data
      await dataReset.clearMatchingData();
      
      // Reset stores in memory
      await dataReset.resetStoresInMemory();
      
      console.log('[DataReset] ✅ Debug matching reset complete');
      
    } catch (error) {
      console.error('[DataReset] ❌ Debug matching reset failed:', error);
      throw error;
    }
  },

  /**
   * Get all AsyncStorage keys for debugging
   */
  getStorageKeys: async (): Promise<readonly string[]> => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      console.log('[DataReset] Current AsyncStorage keys:', keys);
      return keys;
    } catch (error) {
      console.error('[DataReset] Failed to get storage keys:', error);
      return [];
    }
  },

  /**
   * Get storage data for debugging
   */
  debugStorage: async (): Promise<void> => {
    const keys = await dataReset.getStorageKeys();
    
    for (const key of keys) {
      try {
        const value = await AsyncStorage.getItem(key);
        console.log(`[DataReset] ${key}:`, value ? JSON.parse(value) : null);
      } catch (error) {
        console.log(`[DataReset] ${key}: Failed to parse`);
      }
    }
  }
};

export default dataReset; 