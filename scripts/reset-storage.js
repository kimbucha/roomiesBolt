/**
 * This script clears all AsyncStorage data
 * Run with: node scripts/reset-storage.js
 */

const AsyncStorage = require('@react-native-async-storage/async-storage').default;

const clearAllStorage = async () => {
  try {
    await AsyncStorage.clear();
    console.log('✅ All storage successfully cleared!');
    process.exit(0);
  } catch (e) {
    console.error('❌ Failed to clear storage:', e);
    process.exit(1);
  }
};

clearAllStorage(); 