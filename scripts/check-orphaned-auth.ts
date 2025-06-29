import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

// Use service role key for admin access
// IMPORTANT: This script should only be run locally and never be committed with the actual key
const supabaseUrl = process.env.SUPABASE_URL || 'https://hybyjgpcbcqpndxrquqv.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseServiceKey) {
  console.error('ERROR: SUPABASE_SERVICE_ROLE_KEY environment variable is required.');
  console.error('Create a .env file with SUPABASE_SERVICE_ROLE_KEY=your_service_key');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function checkOrphanedAuth(email: string) {
  try {
    console.log(`\nChecking user: ${email}`);
    console.log('----------------------------------------');
    
    // Check if user exists in Auth by listing all users and filtering manually
    // This is necessary because Supabase doesn't provide a direct getUserByEmail method
    const { data: usersData, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error checking Auth:', authError.message);
      return;
    }
    
    // Find the user with the matching email
    const authUser = usersData?.users?.find(user => user.email === email);
    
    if (!authUser) {
      console.log(`✅ User ${email} does not exist in Auth.`);
      return;
    }
    
    console.log(`📝 User ${email} exists in Auth with ID: ${authUser.id}`);
    console.log(`   Created at: ${new Date(authUser.created_at).toLocaleString()}`);
    console.log(`   Last sign in: ${authUser.last_sign_in_at ? new Date(authUser.last_sign_in_at).toLocaleString() : 'Never'}`);
    console.log(`   User metadata:`, authUser.user_metadata);
    
    // Check if user exists in public.users table
    const { data: dbUser, error: dbError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle();
    
    if (dbError && dbError.code !== 'PGRST116') {
      console.error('❌ Error checking database:', dbError.message);
      return;
    }
    
    if (!dbUser) {
      console.log(`⚠️ ORPHANED USER: ${email} exists in Auth but NOT in the database.`);
      console.log('   This user is in an inconsistent state and should be fixed.');
      
      // Offer to fix the issue
      console.log('\nTo fix this issue, you can:');
      console.log('1. Run the SQL function to delete the user completely:');
      console.log(`   SELECT delete_user_completely('${email}');`);
      console.log('2. Or call the Edge Function from your application:');
      console.log(`   UserManagementService.deleteUser('${email}')`);
    } else {
      console.log(`✅ User ${email} exists in both Auth and the database.`);
      console.log(`   Database record:`, dbUser);
    }
    
    console.log('----------------------------------------');
  } catch (error: any) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.error('Please provide an email address as an argument:');
  console.error('npm run check-orphaned-auth your.email@example.com');
  process.exit(1);
}

// Run the check
checkOrphanedAuth(email).catch(console.error); 