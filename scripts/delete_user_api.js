// This is a server-side function that should be deployed as an API endpoint
// You can use Supabase Edge Functions or a separate server for this
// For security, this should NOT be included in your client-side code

const { createClient } = require('@supabase/supabase-js');

// These should be environment variables in a real deployment
const SUPABASE_URL = 'https://hybyjgpcbcqpndxrquqv.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5YnlqZ3BjYmNxcG5keHJxdXF2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzY4NDc1MiwiZXhwIjoyMDYzMjYwNzUyfQ.9Z1zaIrlQOBcpcQ826mzF6qj7qj1sA4symdh69Y6_kw';

// Create a Supabase client with the service role key
const adminSupabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

/**
 * Completely deletes a user and all related data from Supabase
 * @param {string} email - The email of the user to delete
 */
async function deleteUserByEmail(email) {
  try {
    // Step 1: Get the user ID from the email
    const { data: userData, error: userError } = await adminSupabase.auth.admin.listUsers();
    
    if (userError) {
      throw new Error(`Error listing users: ${userError.message}`);
    }
    
    const user = userData.users.find(u => u.email === email);
    
    if (!user) {
      return { success: false, message: 'User not found' };
    }
    
    const userId = user.id;
    
    // Step 2: Delete from auth.sessions
    const { error: sessionsError } = await adminSupabase.rpc('delete_auth_sessions', { user_id_param: userId });
    if (sessionsError) console.log('Sessions delete error:', sessionsError);
    
    // Step 3: Delete from auth.refresh_tokens
    const { error: tokensError } = await adminSupabase.rpc('delete_auth_refresh_tokens', { user_id_param: userId });
    if (tokensError) console.log('Tokens delete error:', tokensError);
    
    // Step 4: Delete from auth.identities
    const { error: identitiesError } = await adminSupabase.rpc('delete_auth_identities', { user_id_param: userId });
    if (identitiesError) console.log('Identities delete error:', identitiesError);
    
    // Step 5: Delete from public.users
    const { error: usersError } = await adminSupabase.from('users').delete().eq('id', userId);
    if (usersError) console.log('Users delete error:', usersError);
    
    // Step 6: Delete from auth.users
    const { error: deleteError } = await adminSupabase.auth.admin.deleteUser(userId);
    
    if (deleteError) {
      throw new Error(`Error deleting user: ${deleteError.message}`);
    }
    
    return { success: true, message: 'User deleted successfully' };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { success: false, message: error.message };
  }
}

// Example Express.js API endpoint
// app.post('/api/delete-user', async (req, res) => {
//   const { email, adminKey } = req.body;
//   
//   // Verify admin key for security
//   if (adminKey !== 'YOUR_ADMIN_KEY') {
//     return res.status(401).json({ success: false, message: 'Unauthorized' });
//   }
//   
//   const result = await deleteUserByEmail(email);
//   return res.json(result);
// });

module.exports = { deleteUserByEmail }; 