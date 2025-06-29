import { supabase } from './supabaseClient';

// Admin API key - should be stored securely in a .env file
// For development purposes only - never expose this in client code in production
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'your-secure-api-key';

/**
 * Service for user management operations
 */
export const UserManagementService = {
  /**
   * Deletes a user completely from Supabase
   * @param email The email of the user to delete
   * @returns Promise with the result of the operation
   */
  /**
   * Handles orphaned users by creating a workaround solution
   * Instead of trying to delete the user (which requires admin privileges),
   * we'll try to sign up with a new password and then create the missing profile
   * @param email The email of the orphaned user
   * @param password The new password to set
   * @param name The user's name
   * @returns Promise with the result of the operation
   */
  handleOrphanedUser: async (email: string, password: string, name: string): Promise<{ success: boolean; message: string }> => {
    try {
      console.log(`Handling orphaned user: ${email}`);
      
      // Step 1: Try to sign in with the provided credentials
      // If the password is correct, we can just create the missing profile
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (!signInError && signInData.user) {
        console.log('Successfully signed in with orphaned user, creating profile');
        
        // Create the missing profile
        const { error: profileError } = await supabase.from('users').insert({
          id: signInData.user.id,
          email: email,
          name: name || 'New User',
          is_premium: false,
          is_verified: false,
          onboarding_completed: false
        });
        
        if (profileError) {
          console.error('Error creating profile for orphaned user:', profileError);
          return { success: false, message: 'Failed to create user profile' };
        }
        
        return { success: true, message: 'Successfully recovered orphaned user' };
      }
      
      // Step 2: If sign-in failed, try password reset as a fallback
      console.log('Sign-in failed, sending password reset email');
      
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'roomies://reset-password'
      });
      
      if (resetError) {
        console.error('Error sending password reset:', resetError);
        return { success: false, message: 'Unable to recover account. Please use a different email.' };
      }
      
      return { 
        success: false, 
        message: 'A password reset email has been sent. Please check your email to recover your account.' 
      };
    } catch (error: any) {
      console.error('Error handling orphaned user:', error);
      return { success: false, message: error.message || 'Unknown error' };
    }
  },
  
  // This is kept for backward compatibility but is no longer used directly
  deleteUser: async (email: string): Promise<{ success: boolean; message: string }> => {
    console.log(`Delete user function is deprecated. Use handleOrphanedUser instead for: ${email}`);
    return { success: false, message: 'This function is deprecated. Use handleOrphanedUser instead.' };
  },
  
  /**
   * Checks if a user exists in Supabase Auth
   * @param email The email to check
   * @returns Promise with boolean indicating if the user exists
   */
  checkUserExists: async (email: string): Promise<boolean> => {
    try {
      // Try to sign in with a wrong password to see if the email exists
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: 'wrong-password-for-check-only'
      });
      
      // If the error is about invalid credentials, the email exists
      if (error && error.message.includes('Invalid login credentials')) {
        return true;
      }
      
      // If there's no error or a different error, assume email doesn't exist
      return false;
    } catch (e) {
      console.error('Error checking if user exists:', e);
      return false;
    }
  },
  
  /**
   * Checks if a user exists in both Auth and the database
   * @param email The email to check
   * @returns Promise with information about where the user exists
   */
  checkUserStatus: async (email: string): Promise<{ 
    existsInAuth: boolean; 
    existsInDb: boolean;
    message: string;
  }> => {
    try {
      // Step 1: Check if user exists in Auth
      const existsInAuth = await UserManagementService.checkUserExists(email);
      
      if (!existsInAuth) {
        return { 
          existsInAuth: false, 
          existsInDb: false,
          message: 'User does not exist in Auth'
        };
      }
      
      // Step 2: Check if user exists in the database
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .maybeSingle();
        
      if (error && error.code !== 'PGRST116') {
        console.error('Error checking database:', error);
        return { 
          existsInAuth: true, 
          existsInDb: false,
          message: `Error checking database: ${error.message}`
        };
      }
      
      const existsInDb = data !== null;
      
      return { 
        existsInAuth: true, 
        existsInDb,
        message: existsInDb 
          ? 'User exists in both Auth and database' 
          : 'User exists in Auth but not in database'
      };
    } catch (e: any) {
      console.error('Error checking user status:', e);
      return { 
        existsInAuth: false, 
        existsInDb: false,
        message: `Error: ${e.message || 'Unknown error'}`
      };
    }
  }
}; 