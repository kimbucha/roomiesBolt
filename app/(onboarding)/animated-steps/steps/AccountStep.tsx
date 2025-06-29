import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { logOnboardingInputChange, logOnboardingStepComplete, logOnboardingStepEntry } from '../../../../utils/onboardingDebugUtils';

interface AccountStepProps {
  userData: {
    email?: string;
  };
  onContinue: (data: any) => void;
}

export default function AccountStep({ userData, onContinue }: AccountStepProps) {
  // Form state
  const [email, setEmail] = useState(userData?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Error states
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  // Log entry to account step
  useEffect(() => {
    logOnboardingStepEntry('account', {
      initialEmail: userData?.email || '',
      userData: userData
    });
  }, []);
  
  // Validate email
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Email is required');
      logOnboardingInputChange('account', 'emailError', {
        email,
        error: 'Email is required'
      });
      return false;
    } else if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      logOnboardingInputChange('account', 'emailError', {
        email,
        error: 'Please enter a valid email address'
      });
      return false;
    } else {
      setEmailError('');
      return true;
    }
  };
  
  // Validate password
  const validatePassword = (password: string) => {
    if (!password) {
      setPasswordError('Password is required');
      logOnboardingInputChange('account', 'passwordError', {
        error: 'Password is required'
      });
      return false;
    } else if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      logOnboardingInputChange('account', 'passwordError', {
        error: 'Password must be at least 8 characters'
      });
      return false;
    } else {
      setPasswordError('');
      return true;
    }
  };
  
  // Validate confirm password
  const validateConfirmPassword = (confirmPassword: string) => {
    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      logOnboardingInputChange('account', 'confirmPasswordError', {
        error: 'Please confirm your password'
      });
      return false;
    } else if (confirmPassword !== password) {
      setConfirmPasswordError('Passwords do not match');
      logOnboardingInputChange('account', 'confirmPasswordError', {
        error: 'Passwords do not match'
      });
      return false;
    } else {
      setConfirmPasswordError('');
      return true;
    }
  };
  
  // Handle continue
  const handleContinue = () => {
    // Validate all fields
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    const isConfirmPasswordValid = validateConfirmPassword(confirmPassword);

    logOnboardingInputChange('account', 'attemptContinue', {
      email,
      isEmailValid,
      isPasswordValid,
      isConfirmPasswordValid
    });
    
    if (isEmailValid && isPasswordValid && isConfirmPasswordValid) {
      logOnboardingStepComplete('account', {
        email,
        passwordLength: password.length,
        confirmPasswordLength: confirmPassword.length,
        timestamp: new Date().toISOString()
      });
      // Pass the updated data back to the parent
      onContinue({
        email: email,
        // Note: In a real app, you would hash the password before sending it
        // or use a secure authentication service
      });
    }
  };
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.description}>
          Create your account to save your profile and preferences
        </Text>
        
        {/* Email input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Email</Text>
          <View style={[styles.inputWrapper, emailError ? styles.inputWrapperError : null]}>
            <Mail size={20} color="#9CA3AF" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                logOnboardingInputChange('account', 'emailInput', { value: text });
              }}
              onBlur={() => validateEmail(email)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
        </View>
        
        {/* Password input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Password</Text>
          <View style={[styles.inputWrapper, passwordError ? styles.inputWrapperError : null]}>
            <Lock size={20} color="#9CA3AF" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Create a password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                logOnboardingInputChange('account', 'passwordInput', { length: text.length });
              }}
              onBlur={() => validatePassword(password)}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={styles.visibilityToggle}
              onPress={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff size={20} color="#9CA3AF" />
              ) : (
                <Eye size={20} color="#9CA3AF" />
              )}
            </TouchableOpacity>
          </View>
          {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
        </View>
        
        {/* Confirm Password input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Confirm Password</Text>
          <View style={[styles.inputWrapper, confirmPasswordError ? styles.inputWrapperError : null]}>
            <Lock size={20} color="#9CA3AF" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                logOnboardingInputChange('account', 'confirmPasswordInput', { length: text.length });
              }}
              onBlur={() => validateConfirmPassword(confirmPassword)}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={styles.visibilityToggle}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff size={20} color="#9CA3AF" />
              ) : (
                <Eye size={20} color="#9CA3AF" />
              )}
            </TouchableOpacity>
          </View>
          {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}
        </View>
        
        {/* Terms and conditions */}
        <Text style={styles.termsText}>
          By creating an account, you agree to our Terms of Service and Privacy Policy
        </Text>
        
        {/* Create Account button */}
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>Create Account</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  description: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 24,
    lineHeight: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
  },
  inputWrapperError: {
    borderColor: '#EF4444',
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#1F2937',
  },
  visibilityToggle: {
    padding: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  termsText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    marginBottom: 24,
    textAlign: 'center',
  },
  continueButton: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 40,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
