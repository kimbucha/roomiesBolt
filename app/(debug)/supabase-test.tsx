import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Stack } from 'expo-router';
import SupabaseConnectionTest from '../../components/SupabaseConnectionTest';
import { supabase } from '../../services/supabaseClient';

export default function SupabaseTestScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Supabase Integration Test',
          headerStyle: {
            backgroundColor: '#6366F1',
          },
          headerTintColor: '#fff',
        }} 
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Supabase Integration Test</Text>
        <Text style={styles.subtitle}>Testing connection to your Supabase project</Text>
        
        <SupabaseConnectionTest />
        
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Project Information</Text>
          <Text style={styles.infoText}>URL: {process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://hybyjgpcbcqpndxrquqv.supabase.co'}</Text>
          <Text style={styles.infoText}>Key: {'**********'}</Text>
        </View>
        
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Next Steps</Text>
          <Text style={styles.stepText}>1. Migrate your existing data from AsyncStorage</Text>
          <Text style={styles.stepText}>2. Implement the Supabase auth flow</Text>
          <Text style={styles.stepText}>3. Update your stores to use Supabase</Text>
          <Text style={styles.stepText}>4. Test thoroughly across the app</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4F46E5',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
  },
  stepText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#6366F1',
    paddingVertical: 4,
  },
});
