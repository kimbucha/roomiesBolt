import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { dataReset } from '../../utils/dataReset';

interface DataResetPanelProps {
  visible: boolean;
  onClose: () => void;
}

export const DataResetPanel: React.FC<DataResetPanelProps> = ({ visible, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastAction, setLastAction] = useState<string>('');

  if (!visible) return null;

  const handleAction = async (actionName: string, actionFn: () => Promise<void>) => {
    try {
      setIsLoading(true);
      setLastAction(actionName);
      await actionFn();
      Alert.alert('Success', `${actionName} completed successfully!`);
    } catch (error) {
      console.error(`[DataResetPanel] ${actionName} failed:`, error);
      Alert.alert('Error', `${actionName} failed. Check console for details.`);
    } finally {
      setIsLoading(false);
      setLastAction('');
    }
  };

  const confirmAction = (title: string, message: string, actionFn: () => Promise<void>) => {
    Alert.alert(
      title,
      message,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          style: 'destructive',
          onPress: () => handleAction(title, actionFn)
        }
      ]
    );
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.panel}>
        <ScrollView style={styles.scrollContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>🔧 Data Reset Panel</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4F46E5" />
              <Text style={styles.loadingText}>Executing: {lastAction}</Text>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔍 Debugging Actions</Text>
            
            <TouchableOpacity
              style={[styles.button, styles.debugButton]}
              onPress={() => handleAction('Debug Storage', dataReset.debugStorage)}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>View Storage Contents</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.debugButton]}
              onPress={() => handleAction('Get Storage Keys', async () => {
                const keys = await dataReset.getStorageKeys();
                Alert.alert('Storage Keys', `Found ${keys.length} keys. Check console for details.`);
              })}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>List Storage Keys</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🧹 Selective Reset</Text>
            
            <TouchableOpacity
              style={[styles.button, styles.warningButton]}
              onPress={() => confirmAction(
                'Reset Matching Data',
                'This will clear all swipe history and matches. Continue?',
                dataReset.debugMatchingReset
              )}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>Reset Matching Data Only</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.warningButton]}
              onPress={() => confirmAction(
                'Reset Stores in Memory',
                'This will reset all stores in memory. Continue?',
                dataReset.resetStoresInMemory
              )}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>Reset Stores in Memory</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🚨 Danger Zone</Text>
            
            <TouchableOpacity
              style={[styles.button, styles.dangerButton]}
              onPress={() => confirmAction(
                'Clear All AsyncStorage',
                'This will clear ALL app data including auth tokens. You will need to log in again. Continue?',
                dataReset.clearAsyncStorage
              )}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>Clear All AsyncStorage</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.dangerButton]}
              onPress={() => confirmAction(
                'Complete Reset',
                '⚠️ WARNING: This will completely reset the app to factory state. You will lose ALL data and need to log in again. Are you sure?',
                dataReset.completeReset
              )}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>🚨 COMPLETE RESET</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.instructions}>
            <Text style={styles.instructionsTitle}>Instructions:</Text>
            <Text style={styles.instructionsText}>
              • Start with "Reset Matching Data Only" to fix swipe issues{'\n'}
              • Use "View Storage Contents" to debug what's persisting{'\n'}
              • "Complete Reset" is for emergency situations only{'\n'}
              • After any reset, restart the app for full effect
            </Text>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    zIndex: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  panel: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    margin: 20,
    maxHeight: '80%',
    maxWidth: 400,
    width: '90%',
  },
  scrollContainer: {
    maxHeight: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#6B7280',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    margin: 20,
    borderRadius: 8,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '500',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  debugButton: {
    backgroundColor: '#EEF2FF',
  },
  warningButton: {
    backgroundColor: '#FEF3C7',
  },
  dangerButton: {
    backgroundColor: '#FEE2E2',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  instructions: {
    padding: 20,
    backgroundColor: '#F9FAFB',
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
  },
});

export default DataResetPanel; 