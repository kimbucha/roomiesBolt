import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Utility function to clear all AsyncStorage data
 * This can be used during development to reset the app state
 */
export const clearAllStorage = async () => {
  try {
    await AsyncStorage.clear();
    console.log('Storage successfully cleared!');
    return true;
  } catch (e) {
    console.error('Failed to clear storage:', e);
    return false;
  }
};

/**
 * Utility function to clear only authentication-related storage
 * This preserves other app settings but logs the user out
 */
export const clearAuthStorage = async () => {
  try {
    // Get all keys
    const keys = await AsyncStorage.getAllKeys();
    
    // Filter for auth-related keys - specifically target the user store
    // The key for Zustand stores is typically in the format 'store-name-storage'
    const authKeys = keys.filter(key => 
      key.includes('user-store') || 
      key.includes('auth') || 
      key.includes('token')
    );
    
    if (authKeys.length > 0) {
      await AsyncStorage.multiRemove(authKeys);
      console.log('Auth storage successfully cleared:', authKeys);
    } else {
      // If no specific auth keys found, look for any store keys that might contain user data
      const storeKeys = keys.filter(key => key.includes('store'));
      if (storeKeys.length > 0) {
        console.log('No specific auth keys found, clearing all store keys:', storeKeys);
        await AsyncStorage.multiRemove(storeKeys);
      } else {
        console.log('No auth storage found to clear');
      }
    }
    
    return true;
  } catch (e) {
    console.error('Failed to clear auth storage:', e);
    return false;
  }
}; 