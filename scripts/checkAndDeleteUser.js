// Script to check if a user exists in Supabase and delete if needed
const { createClient } = require('@supabase/supabase-js');

// Replace these with your Supabase project URL and anon key from services/supabaseClient.ts
const supabaseUrl = 'https://hybyjgpcbcqpndxrquqv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5YnlqZ3BjYmNxcG5keHJxdXF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2ODQ3NTIsImV4cCI6MjA2MzI2MDc1Mn0.u4xgnUehjnA45i2I8n7Cml82g1IMtbx0KuQNDfNwbJ0';

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Email to check and potentially delete
const emailToCheck = 't@roomies.com';

async function checkAndDeleteUser() {
  console.log(`Checking if user ${emailToCheck} exists...`);

  try {
    // Try to sign in with a wrong password to see if the email exists
    const { error } = await supabase.auth.signInWithPassword({
      email: emailToCheck,
      password: 'wrong-password-for-check-only'
    });

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        console.log(`User with email ${emailToCheck} exists in Auth but sign-in failed (expected).`);
        
        // Now check if the user exists in the users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('email', emailToCheck)
          .single();
        
        if (userError) {
          if (userError.code === 'PGRST116') {
            console.log(`User exists in Auth but NOT in the users table. This is the likely cause of your issue.`);
            console.log(`You need to either:`);
            console.log(`1. Delete the user from Auth (requires admin access)`);
            console.log(`2. Use a different email address`);
            console.log(`3. Fix your user creation process to ensure both Auth and DB entries are created`);
          } else {
            console.log(`Error checking users table:`, userError);
          }
        } else {
          console.log(`User exists in both Auth and the users table:`, userData);
        }
      } else {
        console.log(`User with email ${emailToCheck} does not exist or another error occurred:`, error);
      }
    } else {
      console.log(`Unexpectedly able to sign in with ${emailToCheck}. This shouldn't happen with a wrong password.`);
    }
  } catch (error) {
    console.error('Error checking user:', error);
  }
}

// Run the function
checkAndDeleteUser(); 