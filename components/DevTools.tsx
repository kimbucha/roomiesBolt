import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { clearAllStorage, clearAuthStorage } from '../utils/clearStorage';
import { useRouter } from 'expo-router';

interface DevToolsProps {
  visible?: boolean;
}

/**
 * DevTools component for development purposes
 * This component provides buttons to clear storage and perform other development tasks
 * It should only be visible in development builds
 */
export default function DevTools({ visible = __DEV__ }: DevToolsProps) {
  const router = useRouter();

  if (!visible) return null;

  const handleClearAll = async () => {
    Alert.alert(
      'Clear All Storage',
      'This will clear all app data and return to the login screen. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            const success = await clearAllStorage();
            if (success) {
              Alert.alert('Success', 'All storage cleared. Returning to login screen.');
              // Navigate to the login screen
              router.replace('/');
            }
          },
        },
      ]
    );
  };

  const handleClearAuth = async () => {
    Alert.alert(
      'Clear Auth Storage',
      'This will log you out but preserve other app settings. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            const success = await clearAuthStorage();
            if (success) {
              Alert.alert('Success', 'Auth storage cleared. Returning to login screen.');
              // Navigate to the login screen
              router.replace('/');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Developer Tools</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleClearAuth}>
          <Text style={styles.buttonText}>Clear Auth</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.dangerButton]} onPress={handleClearAll}>
          <Text style={styles.buttonText}>Clear All Data</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    margin: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 8,
    borderRadius: 4,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  dangerButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    fontWeight: '500',
  },
}); 