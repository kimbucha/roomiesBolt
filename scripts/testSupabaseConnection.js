import { supabase, checkSupabaseConnection } from '../services/supabaseClient';

// Simple script to test Supabase connection
const testConnection = async () => {
  console.log('Testing Supabase connection...');
  
  try {
    const isConnected = await checkSupabaseConnection();
    
    if (isConnected) {
      console.log('✅ Successfully connected to Supabase!');
      
      // Get Supabase version
      const { data, error } = await supabase.rpc('get_pg_version');
      if (!error) {
        console.log('Postgres version:', data);
      }
      
      console.log('Your Supabase project is properly configured.');
    } else {
      console.error('❌ Failed to connect to Supabase.');
      console.log('Please check your URL and anon key in services/supabaseClient.ts');
    }
  } catch (error) {
    console.error('Error testing connection:', error);
  }
};

testConnection();
