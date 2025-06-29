// Script to deploy database functions to Supabase
// Run this with: node deployDbFunctions.js

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env file');
  process.exit(1);
}

// Initialize Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function deployFunctions() {
  try {
    console.log('Deploying database functions to Supabase...');
    
    // Read the create_user_profile function SQL
    const createUserProfileSql = fs.readFileSync(
      path.join(__dirname, '../supabase/create_user_profile_function.sql'),
      'utf8'
    );
    
    // Execute the SQL to create/update the function
    const { error } = await supabase.rpc('exec_sql', { sql: createUserProfileSql });
    
    if (error) {
      console.error('Error deploying functions:', error);
      return;
    }
    
    console.log('Functions deployed successfully!');
    
    // Test the function
    console.log('Testing create_user_profile function...');
    const testUserId = '00000000-0000-0000-0000-000000000000'; // Test UUID
    const { data, error: testError } = await supabase.rpc('create_user_profile', {
      user_id: testUserId,
      user_email: 'test@example.com',
      user_name: 'Test User'
    });
    
    if (testError) {
      console.error('Error testing function:', testError);
      return;
    }
    
    console.log('Function test result:', data);
    console.log('Note: If the test user already exists, the function will return false, which is expected');
    
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

deployFunctions();
