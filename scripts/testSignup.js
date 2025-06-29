// Script to test Supabase signup
const { createClient } = require('@supabase/supabase-js');

// Replace these with your Supabase project URL and anon key from services/supabaseClient.ts
const supabaseUrl = 'https://hybyjgpcbcqpndxrquqv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5YnlqZ3BjYmNxcG5keHJxdXF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2ODQ3NTIsImV4cCI6MjA2MzI2MDc1Mn0.u4xgnUehjnA45i2I8n7Cml82g1IMtbx0KuQNDfNwbJ0';

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test email and password
const testEmail = 'test' + Date.now() + '@roomies.com'; // Unique email
const testPassword = 'Test1234!';
const testName = 'Test User';

async function testSignup() {
  console.log(`Testing signup with email: ${testEmail}`);

  try {
    // Step 1: Sign up the user
    console.log('Creating user in Supabase Auth...');
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: { name: testName }
      }
    });

    if (error) {
      console.error('Signup error:', error);
      return;
    }

    console.log('Auth signup successful:', data.user.id);
    
    // Step 2: Sign in as the user to get a valid session
    console.log('Signing in as the new user...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    if (signInError) {
      console.error('Sign in error:', signInError);
      return;
    }
    
    console.log('Sign in successful, session established');
    
    // Create a new Supabase client with the user's session
    const userSupabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${signInData.session.access_token}`
        }
      }
    });

    // Step 3: Create user profile using the authenticated client
    console.log('Creating user profile in database...');
    const { error: profileError } = await userSupabase
      .from('users')
      .insert({
        id: data.user.id,
        email: testEmail,
        name: testName,
        is_premium: false,
        is_verified: false,
        onboarding_completed: false
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      return;
    }

    console.log('User profile created successfully');

    // Step 4: Verify the user exists in both Auth and the users table
    console.log('Verifying user exists in users table...');
    const { data: userData, error: userError } = await userSupabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (userError) {
      console.error('Error verifying user:', userError);
      return;
    }

    console.log('User verified in database:', userData);
    console.log('\nSignup test completed successfully!');
    console.log(`Email: ${testEmail}`);
    console.log(`Password: ${testPassword}`);
    console.log('You can use these credentials to log in to the app');

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the test
testSignup(); 