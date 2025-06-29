import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  Animated
} from 'react-native';
import { useRouter } from 'expo-router';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Mail, Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react-native';
import { useUserStore } from '../../store/userStore';
import { useSupabaseUserStore } from '../../store/supabaseUserStore';
import { supabase } from '../../services/supabaseClient';
import OnboardingTemplate from '../../components/features/onboarding/OnboardingTemplate';
import { TestAccountHelper } from '../../utils/testAccountHelper';
import { EmailConfirmationHelper } from '../../utils/emailConfirmationHelper';
import { SupabaseOnboardingProfileUpdater } from '../../utils/supabaseOnboardingProfileUpdater';

// Helper functions for safe navigation with our loading state system
const safeNavigate = (router, path) => {
  try {
    // Add a small delay to ensure state updates are processed
    setTimeout(() => {
      router.replace(path);
    }, 100);
  } catch (error) {
    console.error('Navigation error:', error);
    // Fallback navigation
    try {
      router.replace(path);
    } catch (fallbackError) {
      console.error('Fallback navigation error:', fallbackError);
      Alert.alert('Navigation Error', 'There was an error navigating to the next screen. Please try again.');
    }
  }
};

const safeNavigateBack = (router) => {
  try {
    // Add a small delay to ensure state updates are processed
    setTimeout(() => {
      router.back();
    }, 100);
  } catch (error) {
    console.error('Navigation back error:', error);
    // Fallback navigation
    try {
      router.back();
    } catch (fallbackError) {
      console.error('Fallback navigation back error:', fallbackError);
      Alert.alert('Navigation Error', 'There was an error navigating back. Please try again.');
    }
  }
};

export default function Account() {
  const router = useRouter();
  const { user, updateUser, updateOnboardingProgress } = useUserStore();
  const { updateUserProfile } = useSupabaseUserStore();
  
  // Form state
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Validation state
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [doPasswordsMatch, setDoPasswordsMatch] = useState(false);
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [useTestAccount, setUseTestAccount] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  
  // Debug logging for onboarding store updates
  const logOnboardingStoreUpdate = (key, value) => {
    if (__DEV__) {
      console.log(`[Account] Updating ${key}:`, value);
    }
  };
  
  // Helper function to update user and profile
  const updateUserAndProfile = (userData, options = { validate: false }) => {
    try {
      // Update local user store
      updateUser(userData);
      
      // Also update Supabase profile if validation is requested
      if (options.validate) {
        updateUserProfile(userData);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error updating user profile:', error);
      return { success: false, error: error.message || 'Unknown error' };
    }
  };
  
  // Run animations on mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true
      })
    ]).start();
  }, []);
  
  // Validate email
  useEffect(() => {
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      setIsEmailValid(emailRegex.test(email));
    } else {
      setIsEmailValid(false);
    }
  }, [email]);
  
  // Validate password
  useEffect(() => {
    if (password) {
      setIsPasswordValid(password.length >= 6);
    } else {
      setIsPasswordValid(false);
    }
  }, [password]);
  
  // Check if passwords match
  useEffect(() => {
    if (confirmPassword) {
      setDoPasswordsMatch(password === confirmPassword);
    } else {
      setDoPasswordsMatch(false);
    }
  }, [password, confirmPassword]);
  
  // Toggle test account mode in development
  useEffect(() => {
    if (__DEV__) {
      // Check if we should use a test account
      const checkTestMode = async () => {
        // In development, we'll use test accounts by default
        setUseTestAccount(true);
      };
      
      checkTestMode();
    }
  }, []);
  
  // Handle form submission
  const handleSubmit = async () => {
    // Validate form
    if (!isEmailValid) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    
    if (!isPasswordValid) {
      Alert.alert('Invalid Password', 'Password must be at least 6 characters long.');
      return;
    }
    
    if (!doPasswordsMatch) {
      Alert.alert('Passwords Do Not Match', 'Please make sure your passwords match.');
      return;
    }
    
    // Update validation state for UI feedback
    setIsEmailValid(isEmailValid);
    setIsPasswordValid(isPasswordValid);
    setDoPasswordsMatch(doPasswordsMatch);
    
    setIsSubmitting(true);
    
    try {
      // Create user in Supabase with retry logic
      console.log('Creating user in Supabase...');
      
      // For development, if using a test account, use the special helper
      if (__DEV__ && useTestAccount) {
        console.log('Using test account helper for:', email);
        
        try {
          // The updated TestAccountHelper always returns email and password
          const result = await TestAccountHelper.createTestAccount(email, password, user?.name || '');
          
          console.log('Test account created successfully with email:', result.email);
          
          // Use the email returned from the helper
          const actualEmail = result.email || email;
          
          // Use EmailConfirmationHelper to handle any email confirmation issues
          const confirmResult = await EmailConfirmationHelper.signInWithUnconfirmedEmail(actualEmail, result.password);
          if (!confirmResult.success) {
            console.log('Using EmailConfirmationHelper to handle unconfirmed email...');
          }
          
          // Store the actual email in user store
          const userResult = updateUserAndProfile({
            email: actualEmail,
            // Do NOT store password here
          }, { validate: true });
          
          if (!userResult.success) {
            throw new Error(userResult.error || 'Failed to update user profile');
          }
          
          // Continue with onboarding from the get-started page
          // Reset onboarding progress but mark account as completed
          const updatedProgress = {
            currentStep: 'get-started',
            completedSteps: ['account'], // Keep account as completed
            isComplete: false,
          };
          
          updateOnboardingProgress(updatedProgress);
          logOnboardingStoreUpdate('onboardingProgress', updatedProgress);
          
          // Use safeNavigate helper to ensure proper navigation
          safeNavigate(router, '/(onboarding)/get-started');
          return;
        } catch (error) {
          console.error('Error during test account creation process:', error);
          Alert.alert('Account Creation Error', 'There was an error during the account creation process. Please try again.');
          setIsSubmitting(false);
          return;
        }
      }
      
      // Normal flow for production or if not using test account
      try {
        // Create user with Supabase Auth
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: user?.name || '',
            }
          }
        });
        
        if (error) {
          throw error;
        }
        
        // Update user data in store
        updateUserAndProfile({
          email,
          // Do NOT store password
        }, { validate: true });
        
        // Update onboarding progress
        const updatedProgress = {
          currentStep: 'get-started',
          completedSteps: ['account'],
          isComplete: false,
        };
        
        updateOnboardingProgress(updatedProgress);
        logOnboardingStoreUpdate('onboardingProgress', updatedProgress);
        
        // Navigate to next step
        safeNavigate(router, '/(onboarding)/get-started');
      } catch (error) {
        console.error('Account creation error:', error);
        Alert.alert('Account Creation Failed', error.message || 'An unexpected error occurred');
        setIsSubmitting(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleBack = () => {
    safeNavigateBack(router);
  };
  
  // Whether the continue button should be enabled
  const isContinueEnabled = isEmailValid && isPasswordValid && doPasswordsMatch && !isSubmitting;
  
  return (
    <OnboardingTemplate
      step={2}
      totalSteps={2}
      hideProgress={true}
      title="Create Account"
      subtitle="Enter your email and create a password"
      onBack={handleBack}
      continueButtonLabel={isSubmitting ? 'Creating Account...' : 'Create Account'}
      onContinue={handleSubmit}
      continueButtonDisabled={!isContinueEnabled}
      showSpinner={isSubmitting}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAwareScrollView 
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          enableOnAndroid={true}
          enableAutomaticScroll={Platform.OS === 'ios'}
        >
          <Animated.View 
            style={[
              styles.formContainer,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
          >
            {/* Email Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={[styles.inputContainer, isEmailValid && email.length > 0 && styles.validInput]}>
                <Mail size={20} color={isEmailValid && email.length > 0 ? "#4F46E5" : "#9CA3AF"} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  textContentType="emailAddress"
                  editable={!isSubmitting}
                />
                {isEmailValid && email.length > 0 && (
                  <CheckCircle size={20} color="#4F46E5" style={styles.validationIcon} />
                )}
              </View>
              {email.length > 0 && !isEmailValid && (
                <View style={styles.validationMessage}>
                  <AlertCircle size={16} color="#EF4444" />
                  <Text style={styles.validationText}>Please enter a valid email address</Text>
                </View>
              )}
            </View>
            
            {/* Password Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={[styles.inputContainer, isPasswordValid && password.length > 0 && styles.validInput]}>
                <Lock size={20} color={isPasswordValid && password.length > 0 ? "#4F46E5" : "#9CA3AF"} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Create a password"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="password-new"
                  textContentType="newPassword"
                  editable={!isSubmitting}
                />
                <TouchableOpacity 
                  style={styles.visibilityToggle}
                  onPress={() => setShowPassword(!showPassword)}
                  disabled={isSubmitting}
                >
                  {showPassword ? (
                    <EyeOff size={20} color="#9CA3AF" />
                  ) : (
                    <Eye size={20} color="#9CA3AF" />
                  )}
                </TouchableOpacity>
              </View>
              {password.length > 0 && !isPasswordValid && (
                <View style={styles.validationMessage}>
                  <AlertCircle size={16} color="#EF4444" />
                  <Text style={styles.validationText}>Password must be at least 6 characters</Text>
                </View>
              )}
            </View>
            
            {/* Confirm Password Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <View style={[styles.inputContainer, doPasswordsMatch && confirmPassword.length > 0 && styles.validInput]}>
                <Lock size={20} color={doPasswordsMatch && confirmPassword.length > 0 ? "#4F46E5" : "#9CA3AF"} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm your password"
                  placeholderTextColor="#9CA3AF"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="password-new"
                  textContentType="newPassword"
                  editable={!isSubmitting}
                />
                <TouchableOpacity 
                  style={styles.visibilityToggle}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isSubmitting}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} color="#9CA3AF" />
                  ) : (
                    <Eye size={20} color="#9CA3AF" />
                  )}
                </TouchableOpacity>
              </View>
              {confirmPassword.length > 0 && !doPasswordsMatch && (
                <View style={styles.validationMessage}>
                  <AlertCircle size={16} color="#EF4444" />
                  <Text style={styles.validationText}>Passwords do not match</Text>
                </View>
              )}
            </View>
          </Animated.View>
        </KeyboardAwareScrollView>
      </TouchableWithoutFeedback>
    </OnboardingTemplate>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  formContainer: {
    marginTop: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#111827',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 50,
    backgroundColor: '#FFFFFF',
  },
  validInput: {
    borderColor: '#4F46E5',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    height: 50,
  },
  inputIcon: {
    marginRight: 12,
  },
  visibilityToggle: {
    padding: 8,
  },
  validationIcon: {
    marginLeft: 8,
  },
  validationMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  validationText: {
    fontSize: 14,
    color: '#EF4444',
    marginLeft: 6,
  },
  buttonContainer: {
    marginTop: 24,
  },
  button: {
    backgroundColor: '#4F46E5',
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextDisabled: {
    color: '#9CA3AF',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
