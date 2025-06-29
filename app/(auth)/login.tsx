import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Link, useRouter } from 'expo-router';
// Use Supabase stores
import { useSupabaseUserStore } from '../../store/supabaseUserStore';
import { useSupabaseAuthStore } from '../../store/supabaseAuthStore';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import OnboardingTemplate from '../../components/features/onboarding/OnboardingTemplate';
// Use our new migration helper
import SupabaseMigrationHelper from '../../utils/supabaseMigrationHelper';

export default function Login() {
  const router = useRouter();
  // Use only Supabase stores
  const { fetchUserProfile } = useSupabaseUserStore();
  const { login: supabaseLogin } = useSupabaseAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationNeeded, setMigrationNeeded] = useState(false);
  
  // Check if migration is needed on component mount
  useEffect(() => {
    // Simply set migration needed to true without logging repeatedly
    setMigrationNeeded(true);
  }, []);

  // Combined state update and validation handler
  const handleEmailChange = (text: string) => {
    setEmail(text);
    // Clear validation error while typing
    if (emailError) {
      setEmailError('');
      }
    };
    
  const validateEmail = (emailValue: string) => { // Renamed param for clarity
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailValue) {
      setEmailError('Email is required');
      return false;
    } else if (!emailRegex.test(emailValue)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError(''); // Clear error if valid
    return true;
  };
  
  const validatePassword = (passwordValue: string) => {
    if (!passwordValue) {
      setPasswordError('Password is required');
      return false;
    } else if (passwordValue.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
      setPasswordError('');
      return true;
  };
  
  const validateInputs = () => {
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    return isEmailValid && isPasswordValid;
  };

  const handleLogin = async () => {
    if (!validateInputs()) return;
    
    try {
      setIsLoading(true);
      setIsMigrating(true);
      setError('');

      const result = await supabaseLogin(email, password);
      if (result.error) {
        handleError({ message: result.error });
        return;
      }
      
      // KEEP: Essential for data persistence testing
      console.log('[DATA PERSISTENCE TEST] ✅ Authentication successful for:', email);

      // Fetch user profile to check data persistence
      const userState = useSupabaseUserStore.getState();
      await userState.fetchUserProfile();
      const user = userState.user;

      if (user) {
        // KEEP: Essential for data persistence testing - verify user data loaded correctly
        console.log('[DATA PERSISTENCE TEST] User profile loaded - onboarding completed:', user.onboardingCompleted);

        // Check if we need to run migration for incomplete onboarding
        if (!user.onboardingCompleted) {
          // KEEP: Essential for data persistence testing
          console.log('[DATA PERSISTENCE TEST] 🔄 User has incomplete onboarding, checking for migration...');
          
          const migrationResult = await SupabaseMigrationHelper.migrateAllData();
          
          if (migrationResult.success) {
            // KEEP: Essential for data persistence testing
            console.log('[DATA PERSISTENCE TEST] Migration successful');
          } else {
            console.warn('[LOGIN] Migration warning:', migrationResult.message);
          }
        } else {
          // KEEP: Essential for data persistence testing
          console.log('[DATA PERSISTENCE TEST] ⏭️ Onboarding already completed, no migration needed');
        }
      }
      
      // Determine where to redirect based on onboarding status
      const finalUser = useSupabaseUserStore.getState().user;
      // KEEP: Essential for data persistence testing - track final redirect decision
      console.log('[DATA PERSISTENCE TEST] Final redirect decision - onboarding completed:', finalUser?.onboardingCompleted);

      if (finalUser?.onboardingCompleted) {
        // KEEP: Essential for data persistence testing
        console.log('[DATA PERSISTENCE TEST] ✅ REDIRECTING TO MAIN APP - user data complete');
        router.replace('/(tabs)');
      } else {
        // KEEP: Essential for data persistence testing
        console.log('[DATA PERSISTENCE TEST] ❌ REDIRECTING TO ONBOARDING - incomplete user data');
        router.replace('/(onboarding)/welcome');
      }
    } catch (migrationError) {
      console.error('[LOGIN] Migration error:', migrationError);
      setError('Failed to load user data. Please try again.');
    } finally {
      setIsLoading(false);
      setIsMigrating(false);
    }
  };

  const handleError = (error: any) => {
    console.error('[LOGIN] Error:', error);
    let errorMessage = 'An error occurred during login.';
    
    if (error?.message) {
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password. Please check your credentials.';
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'Please check your email and click the confirmation link before signing in.';
      } else if (error.message.includes('Too many requests')) {
        errorMessage = 'Too many login attempts. Please wait a moment and try again.';
      } else {
        errorMessage = error.message;
      }
    }
    
    setError(errorMessage);
    setIsLoading(false);
  };

  return (
    <OnboardingTemplate
      hideHeader={true}
      showBack={false}
      showContinue={false}
      bgColor="#FFFFFF"
      step=""
    >
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <View style={styles.logoWrapper}>
            <Text style={styles.logoText}>
              <Text style={styles.logoFirstLetter}>r</Text>
              <Text>oomies</Text>
            </Text>
          </View>
          <Text style={styles.tagline}>Find your perfect roommate</Text>
        </View>
        
        <View style={styles.formContainer}>
          <Text style={styles.title}>Welcome Back</Text>
          
          {(error) && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <View style={[styles.inputWrapper, emailError ? styles.inputWrapperError : null]}>
              <Mail size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={handleEmailChange}
                onBlur={() => validateEmail(email)}
                placeholder="Enter your email"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <View style={[styles.inputWrapper, passwordError ? styles.inputWrapperError : null]}>
              <Lock size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showPassword}
                onBlur={() => validatePassword(password)}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <EyeOff size={20} color="#6B7280" />
                ) : (
                  <Eye size={20} color="#6B7280" />
                )}
              </TouchableOpacity>
            </View>
            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
          </View>

          <TouchableOpacity
            style={[styles.loginButton, (isLoading || isMigrating || !email || !password || !!emailError || !!passwordError) && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={!!(isLoading || isMigrating || !email || !password || emailError || passwordError)}
          >
            {isLoading ? (
              <Text style={styles.loginButtonText}>Logging in...</Text>
            ) : isMigrating ? (
              <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                <ActivityIndicator color="#FFFFFF" />
                <Text style={styles.loginButtonText}> Migrating account...</Text>
              </View>
            ) : (
              <Text style={styles.loginButtonText}>Log In</Text>
            )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <Link href="/(onboarding)/welcome" asChild>
            <TouchableOpacity style={styles.signupButton}>
              <Text style={styles.signupButtonText}>Don't have an account? Sign Up</Text>
            </TouchableOpacity>
          </Link>

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>
      </View>
    </OnboardingTemplate>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 40,
  },
  logoWrapper: {
    marginBottom: 12,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  logoFirstLetter: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4F46E5',
    textTransform: 'lowercase',
  },
  tagline: {
    fontSize: 16,
    color: '#6B7280',
  },
  formContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 60,
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: 4,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4B5563',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    backgroundColor: '#FFFFFF',
  },
  inputWrapperError: {
    borderColor: '#EF4444',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  loginButton: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  loginButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    paddingHorizontal: 16,
    color: '#6B7280',
    fontSize: 14,
  },
  signupButton: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signupButtonText: {
    color: '#4B5563',
    fontSize: 16,
    fontWeight: '500',
  },
  forgotPassword: {
    alignItems: 'center',
    marginTop: 16,
  },
  forgotPasswordText: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: '500',
  },
});
