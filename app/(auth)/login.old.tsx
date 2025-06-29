import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Link, useRouter } from 'expo-router';
// Replace useUserStore with useSupabaseUserStore
import { useSupabaseUserStore } from '../../store/supabaseUserStore';
import { useSupabaseAuthStore } from '../../store/supabaseAuthStore';
import { Mail, Lock, Eye, EyeOff, Clock } from 'lucide-react-native';
import OnboardingTemplate from '../../components/features/onboarding/OnboardingTemplate';
// Use our new migration helper
import SupabaseMigrationHelper from '../../utils/supabaseMigrationHelper';
import { TestAccountHelper } from '../../utils/testAccountHelper';
import { AppLogo } from '../../components/AppLogo';

export default function Login() {
  const router = useRouter();
  // Use only Supabase stores
  const { fetchUserProfile } = useSupabaseUserStore();
  const { login: supabaseLogin, isLoading: supabaseLoading, error: supabaseError } = useSupabaseAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationNeeded, setMigrationNeeded] = useState(false);
  
  // Test account states (development only)
  const [showTestAccounts, setShowTestAccounts] = useState(false);
  const [savedTestAccounts, setSavedTestAccounts] = useState<Array<{email: string, password: string}>>([]);
  
  // Load saved test accounts in development mode
  useEffect(() => {
    if (__DEV__) {
      setSavedTestAccounts(TestAccountHelper.testAccounts);
    }
  }, []);
  
  // Check if migration is needed on component mount
  useEffect(() => {
    const checkMigration = async () => {
      try {
        // We'll always attempt migration for now
        setMigrationNeeded(true);
        console.log('[Login] Ready to migrate data from AsyncStorage to Supabase if needed');
      } catch (error) {
        console.error('[Login] Error checking migration status:', error);
      }
    };
    
    checkMigration();
  }, []);

  // Combined state update and validation handler
  const handleEmailChange = (text: string) => {
    setEmail(text);
    // Clear validation error while typing
    if (emailError) {
      setEmailError('');
    }
  };
  
  // Toggle test accounts dropdown
  const toggleTestAccounts = () => {
    // Refresh the list when opening
    if (!showTestAccounts) {
      setSavedTestAccounts(TestAccountHelper.testAccounts);
    }
    setShowTestAccounts(!showTestAccounts);
  };
  
  // Select a test account
  const selectTestAccount = (testEmail: string, testPassword: string) => {
    setEmail(testEmail);
    setPassword(testPassword);
    setShowTestAccounts(false);
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
      const { error } = await supabaseLogin(email, password);
      
      if (error) {
        Alert.alert('Login Failed', error);
        return;
      }
      
      if (migrationNeeded) {
        setIsMigrating(true);
        try {
          const migrationResult = await SupabaseMigrationHelper.migrateAllData();
          
          if (migrationResult.success) {
            console.log('[Login] Migration successful:', migrationResult.message);
          } else {
            console.warn('[Login] Migration warning:', migrationResult.message);
          }
        } catch (migrationError) {
          console.error('[Login] Migration error:', migrationError);
        } finally {
          setIsMigrating(false);
        }
      }
      
      await fetchUserProfile();
      
      const { user } = useSupabaseUserStore.getState();
      if (user?.onboardingCompleted) {
        router.replace('/');
      } else {
        router.replace('/(onboarding)/get-started');
      }
    } catch (error) {
      console.error('[Login] Error:', error);
      Alert.alert('Login Error', 'An unexpected error occurred. Please try again.');
    }
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
          
          {(supabaseError) && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{supabaseError}</Text>
            </View>
          )}

          {__DEV__ && (
            <View style={styles.testAccountsContainer}>
              <TouchableOpacity 
                style={styles.testAccountsToggle}
                onPress={() => setShowTestAccounts(!showTestAccounts)}
              >
                <Clock size={16} color="#666" />
                <Text style={styles.testAccountsToggleText}>
                  {showTestAccounts ? 'Hide Test Accounts' : 'Show Test Accounts'}
                </Text>
              </TouchableOpacity>
              
              {showTestAccounts && (
                <View style={styles.testAccountsList}>
                  <Text style={styles.testAccountsTitle}>Test Accounts (Supabase)</Text>
                  {savedTestAccounts.length > 0 ? (
                    savedTestAccounts.map((account, index) => (
                      <TouchableOpacity 
                        key={index}
                        style={styles.testAccountItem}
                        onPress={() => {
                          setEmail(account.email);
                          setPassword(account.password);
                        }}
                      >
                        <Text style={styles.testAccountEmail}>{account.email}</Text>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <Text style={styles.noTestAccounts}>No saved test accounts</Text>
                  )}
                  <TouchableOpacity 
                    style={styles.createTestAccountButton}
                    onPress={async () => {
                      const newAccount = await TestAccountHelper.createTestAccount();
                      if (newAccount) {
                        setSavedTestAccounts([...savedTestAccounts, newAccount]);
                        setEmail(newAccount.email);
                        setPassword(newAccount.password);
                        Alert.alert('Supabase Test Account Created', `Email: ${newAccount.email}\nPassword: ${newAccount.password}`);
                      }
                    }}
                  >
                    <Text style={styles.createTestAccountText}>Create Supabase Test Account</Text>
                  </TouchableOpacity>
                </View>
              )}
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
            style={[styles.loginButton, (supabaseLoading || legacyLoading || isMigrating || !email || !password || !!emailError || !!passwordError) && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={!!(supabaseLoading || legacyLoading || isMigrating || !email || !password || emailError || passwordError)}
          >
            {supabaseLoading || legacyLoading ? (
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
              <Text style={styles.signupButtonText}>Create an Account</Text>
            </TouchableOpacity>
          </Link>
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
    marginBottom: 24,
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
  testAccountContainer: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
  },
  testAccountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  testAccountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  testAccountButton: {
    backgroundColor: '#EEF2FF',
    borderRadius: 4,
    padding: 4,
  },
  testAccountButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  testAccountButtonText: {
    fontSize: 10,
    color: '#4F46E5',
    fontWeight: '500',
  },
  testAccountsList: {
    maxHeight: 150,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  testAccountItem: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  testAccountEmail: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4F46E5',
  },
  testAccountPassword: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
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
});