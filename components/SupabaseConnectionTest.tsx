import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { supabase } from '../services/supabaseClient';

const SupabaseConnectionTest = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Testing connection to Supabase...');

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Try to fetch from the health_check table we created in the schema
        const { data, error } = await supabase
          .from('health_check')
          .select('*')
          .limit(1);

        if (error) {
          console.error('Supabase connection error:', error);
          setStatus('error');
          setMessage(`Failed to connect: ${error.message}`);
          return;
        }

        if (data && data.length > 0) {
          setStatus('success');
          setMessage('Successfully connected to Supabase!');
          console.log('Connection successful, data:', data);
        } else {
          setStatus('error');
          setMessage('Connected but health_check table is empty or not found');
        }
      } catch (error: any) {
        console.error('Error testing connection:', error);
        setStatus('error');
        setMessage(`Error: ${error.message}`);
      }
    };

    testConnection();
  }, []);

  return (
    <View style={styles.container}>
      {status === 'loading' && <ActivityIndicator size="large" color="#6366F1" />}
      
      <Text style={[
        styles.statusText,
        status === 'success' ? styles.successText : 
        status === 'error' ? styles.errorText : 
        styles.loadingText
      ]}>
        {status === 'success' ? '✅ ' : status === 'error' ? '❌ ' : ''}
        {message}
      </Text>
      
      {status === 'success' && (
        <Text style={styles.infoText}>
          Your Supabase integration is working correctly!
        </Text>
      )}
      
      {status === 'error' && (
        <Text style={styles.infoText}>
          Please check your Supabase URL and anon key in services/supabaseClient.ts,
          and make sure you've run the schema.sql in your Supabase SQL Editor.
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginVertical: 10,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
  loadingText: {
    color: '#6366F1',
  },
  successText: {
    color: '#10B981',
    fontWeight: 'bold',
  },
  errorText: {
    color: '#EF4444',
    fontWeight: 'bold',
  },
  infoText: {
    marginTop: 10,
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default SupabaseConnectionTest;
