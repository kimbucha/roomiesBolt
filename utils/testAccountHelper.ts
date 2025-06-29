import { supabase, supabaseAdmin } from '../services/supabaseClient';

/**
 * Helper utilities for test accounts during development
 * These functions should only be used during development
 * 
 * Updated to work with Supabase migration and provide better type safety
 */
export const TestAccountHelper = {
  /**
   * Creates a test account for development purposes
   * Uses a multi-step approach that works with Supabase's email confirmation requirement
   * @param email The test email to use (will be ignored in favor of a unique one)
   * @param password The password for the account
   * @param name The user's name
   * @returns Promise with the result of the operation
   */
  /**
   * Creates a test account for development purposes
   * Uses a multi-step approach that works with Supabase's email confirmation requirement
   * 
   * @param email Optional email to use (defaults to a generated test email)
   * @param password Optional password (defaults to 'password123')
   * @param name Optional name (defaults to 'Test User')
   * @returns Promise with the result of the operation or the account details
   */
  /**
   * Creates a test account for development purposes
   * Uses a multi-step approach that works with Supabase's email confirmation requirement
   * 
   * @param email Optional email to use (defaults to a generated test email)
   * @param password Optional password (defaults to 'password123')
   * @param name Optional name (defaults to 'Test User')
   * @returns Promise with the account details (email and password)
   */
  createTestAccount: async (email?: string, password: string = 'password123', name: string = 'Test User'): Promise<{ email: string; password: string }> => {
    try {
      // Generate a user-friendly test email if none provided
      const uniqueEmail = email || TestAccountHelper.getTestEmail(true); // Force new email
      console.log(`[TestAccount] Creating test account with email: ${uniqueEmail}`);
      
      let accountToSave = { email: uniqueEmail, password };
      
      // DEVELOPMENT WORKAROUND: For test accounts, we'll try multiple approaches
      // to create a user that can be immediately signed in without email confirmation
      
      // Approach 1: Try using the admin API to create a pre-confirmed user
      console.log('[TestAccount] Attempting admin API user creation with pre-confirmation...');
      
      // Check if we have access to the admin client
      if (!supabaseAdmin) {
        console.log('[TestAccount] Admin client not available, skipping admin API approach');
        throw new Error('Admin client not available');
      }
      
      // Log that we're using the admin client with service role key
      console.log('[TestAccount] Using admin client with service role key');
      
      // Use the admin client to create a pre-confirmed user
      // CRITICAL: All test accounts should be free tier
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: uniqueEmail,
        password: password,
        email_confirm: true, // This is the key - auto-confirm the email
        user_metadata: { 
          name,
          is_premium: false  // Ensure test accounts are free
        }
      });
      
      // If admin API succeeds, use that
      if (!authError && authData.user) {
        const userId = authData.user.id;
        console.log(`[TestAccount] Admin API success! User created with ID: ${userId} (pre-confirmed)`);
        
        // Sign in immediately - this should work since the email is pre-confirmed
        console.log('[TestAccount] Signing in with pre-confirmed account...');
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: uniqueEmail,
          password
        });
        
        if (signInError) {
          console.error('[TestAccount] Sign-in failed after admin creation:', signInError.message);
        } else {
        console.log('[TestAccount] Sign-in successful with pre-confirmed account');
        }
        
        // Save the test account credentials once at the end
        TestAccountHelper.saveTestAccount(accountToSave.email, accountToSave.password);
        
        return accountToSave;
      }
      
      // Log detailed error information for debugging
      if (authError) {
        console.error('[TestAccount] Admin user creation failed:', authError.message);
        console.error('[TestAccount] Error details:', JSON.stringify(authError, null, 2));
        
        // Check if it's a permissions issue
        if (authError.message.includes('not allowed') || authError.message.includes('permission')) {
          console.warn('[TestAccount] This appears to be a permissions issue with the service role key');
          console.warn('[TestAccount] Make sure you have the correct service_role key from your Supabase dashboard');
        }
      } else {
        console.error('[TestAccount] Admin user creation failed with unknown error');
      }
      
      // Approach 2: Create user with regular signup, then immediately try to sign in
      // In some development environments, Supabase allows sign-in without confirmation
      console.log('[TestAccount] Falling back to regular signup...');
      const { data: regularAuthData, error: regularAuthError } = await supabase.auth.signUp({
        email: uniqueEmail,
        password,
        options: {
          data: { name }
        }
      });
      
      if (regularAuthError) {
        console.error('[TestAccount] Regular signup failed:', regularAuthError.message);
        // Generate a fallback email and password if an error occurs
        const fallbackEmail = TestAccountHelper.getTestEmail(true);
        const fallbackPassword = 'password123';
        
        console.error('[TestAccount] Error creating account, returning fallback credentials:', regularAuthError);
        
        accountToSave = { email: fallbackEmail, password: fallbackPassword };
        
        // Save the test account credentials once at the end
        TestAccountHelper.saveTestAccount(accountToSave.email, accountToSave.password);
        
        return accountToSave;
      }
      
      if (!regularAuthData.user) {
        // Generate a fallback email and password if no user is returned
        const fallbackEmail = TestAccountHelper.getTestEmail(true);
        const fallbackPassword = 'password123';
        
        console.error('[TestAccount] No user returned, returning fallback credentials');
        
        accountToSave = { email: fallbackEmail, password: fallbackPassword };
        
        // Save the test account credentials once at the end
        TestAccountHelper.saveTestAccount(accountToSave.email, accountToSave.password);
        
        return accountToSave;
      }
      
      const userId = regularAuthData.user.id;
      console.log(`[TestAccount] Auth user created with ID: ${userId}`);
      
      // Try to sign in immediately after signup
      console.log('[TestAccount] Attempting immediate sign-in after signup...');
      const { error: immediateSignInError } = await supabase.auth.signInWithPassword({
        email: uniqueEmail,
        password
      });
      
      if (!immediateSignInError) {
        console.log('[TestAccount] Immediate sign-in successful!');
      } else {
      console.error('[TestAccount] Immediate sign-in failed:', immediateSignInError.message);
      }
      
      // Save the test account credentials once at the end
      TestAccountHelper.saveTestAccount(accountToSave.email, accountToSave.password);
      
      return accountToSave;
      
    } catch (error: any) {
      console.error('[TestAccount] Unexpected error:', error);
      // Generate a fallback email and password if an unexpected error occurs
      const fallbackEmail = TestAccountHelper.getTestEmail(true);
      const fallbackPassword = 'password123';
      
      console.error('[TestAccount] Unexpected error, returning fallback credentials');
      
      const accountToSave = { email: fallbackEmail, password: fallbackPassword };
      
      // Save the test account credentials once at the end
      TestAccountHelper.saveTestAccount(accountToSave.email, accountToSave.password);
      
      return accountToSave;
    }
  },
  
  /**
   * Store for test accounts to make them easier to reuse
   */
  testAccounts: [] as Array<{email: string, password: string}>,
  
  /**
   * Get all saved test accounts
   * @returns Array of test accounts with email and password
   */
  getTestAccounts: (): Array<{email: string, password: string}> => {
    return TestAccountHelper.testAccounts;
  },

  /**
   * Remove duplicate test accounts and clean up the stored accounts
   */
  removeDuplicateAccounts: (): void => {
    const uniqueAccounts: Array<{email: string, password: string}> = [];
    const seenEmails = new Set<string>();
    
    // Keep only unique emails (first occurrence)
    for (const account of TestAccountHelper.testAccounts) {
      if (!seenEmails.has(account.email)) {
        seenEmails.add(account.email);
        uniqueAccounts.push(account);
      }
    }
    
    TestAccountHelper.testAccounts = uniqueAccounts;
    console.log(`[TestAccount] Removed duplicates, now have ${uniqueAccounts.length} unique accounts`);
  },

  /**
   * Get the last used test account or create a new one
   * @param forceNew Force creation of a new test account
   * @returns A test email that's easy to remember
   */
  getTestEmail: (forceNew: boolean = false): string => {
    // Check if we have any stored test accounts
    if (!forceNew && TestAccountHelper.testAccounts.length > 0) {
      // Return the most recently used test account
      return TestAccountHelper.testAccounts[TestAccountHelper.testAccounts.length - 1].email;
    }
    
    // Create a simple test email with the current date
    const date = new Date();
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(2);
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    
    // Format: test_MM-DD-YY_HH-MM@roomies.com (e.g., test_05-21-25_12-30@roomies.com)
    return `test_${month}-${day}-${year}_${hour}-${minute}@roomies.com`;
  },
  
  /**
   * Save test account credentials for easy reuse
   * @param email The test email
   * @param password The password
   */
  saveTestAccount: (email: string, password: string): void => {
    // Check if this account already exists to prevent duplicates
    const existingAccount = TestAccountHelper.testAccounts.find(account => account.email === email);
    if (existingAccount) {
      console.log(`[TestAccount] Account ${email} already exists, skipping save`);
      return;
    }
    
    // Store the account credentials
    TestAccountHelper.testAccounts.push({ email, password });
    
    // Keep only the last 5 accounts
    if (TestAccountHelper.testAccounts.length > 5) {
      TestAccountHelper.testAccounts = TestAccountHelper.testAccounts.slice(-5);
    }
    
    // Log the saved accounts for easy reference
    console.log('[TestAccount] Saved test accounts:');
    TestAccountHelper.testAccounts.forEach((account, index) => {
      console.log(`[TestAccount] ${index + 1}: ${account.email} (password: ${account.password})`);
    });
  },

  /**
   * Create complete test personality data for debugging radar chart
   */
  createTestPersonalityData: () => {
    return {
      personalityType: 'ENFP',
      personalityDimensions: {
        ei: 25, // More Extroverted
        sn: 75, // More Intuitive  
        tf: 80, // More Feeling
        jp: 85  // More Perceiving
      },
      personalityTraits: ['creative', 'enthusiastic', 'social', 'adaptable', 'empathetic']
    };
  },

  /**
   * Add personality data to test account after login
   * This helps with debugging the radar chart issue
   */
  addPersonalityDataToTestAccount: async () => {
    try {
      console.log('[TestAccount] Adding personality data to test account...');
      
      // Import the store functions
      const { useSupabaseUserStore } = require('../store/supabaseUserStore');
      const { updateUserAndProfile } = useSupabaseUserStore.getState();
      
      const personalityData = TestAccountHelper.createTestPersonalityData();
      
      const result = await updateUserAndProfile(personalityData, { validate: false });
      
      if (result.success) {
        console.log('[TestAccount] ✅ Successfully added personality data to test account:', personalityData);
      } else {
        console.error('[TestAccount] ❌ Failed to add personality data:', result.error);
      }
      
      return result;
    } catch (error) {
      console.error('[TestAccount] Error adding personality data:', error);
      return { success: false, error: String(error) };
    }
  }
};
