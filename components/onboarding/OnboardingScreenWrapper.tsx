import React, { ReactNode } from 'react';
import { 
  View, 
  StyleSheet, 
  SafeAreaView, 
  StatusBar, 
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Text
} from 'react-native';
import { ArrowLeft, ArrowRight } from 'lucide-react-native';
import { HEADER_CONSTANTS } from '../../constants/headerConfig';
import { AppLogo } from '../common';

interface OnboardingScreenWrapperProps {
  children: ReactNode;
  step: number;
  showBack?: boolean;
  showContinue?: boolean;
  continueText?: string;
  continueDisabled?: boolean;
  onBackPress?: () => void;
  onContinuePress?: () => void;
  greeting?: string;
  title?: string;
  subtitle?: string;
  bgColor?: string;
  showLogo?: boolean;
  logoVariant?: 'onboarding' | 'login' | 'default';
}

/**
 * A standardized wrapper for all onboarding screens to ensure consistent
 * header positioning, logo display, and button styling
 */
export default function OnboardingScreenWrapper({
  children,
  step,
  showBack = true,
  showContinue = true,
  continueText = 'Continue',
  continueDisabled = false,
  onBackPress,
  onContinuePress,
  greeting,
  title,
  subtitle,
  bgColor = '#FFFFFF',
  showLogo = true,
  logoVariant = 'onboarding'
}: OnboardingScreenWrapperProps) {
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <StatusBar barStyle={bgColor === '#FFFFFF' ? 'dark-content' : 'light-content'} />

      {/* Logo Section - Positioned according to image 3 */}
      {showLogo && (
        <View style={styles.logoContainer}>
          <AppLogo variant={logoVariant} step={step} size="medium" />
        </View>
      )}

      {/* Main Content Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidContainer}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Back Button */}
          {showBack && (
            <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
              <ArrowLeft size={24} color="#4F46E5" />
            </TouchableOpacity>
          )}

          {/* Greeting/Title Section */}
          {(greeting || title || subtitle) && (
            <View style={styles.headerTextContainer}>
              {greeting && <Text style={styles.greeting}>{greeting}</Text>}
              {title && <Text style={styles.title}>{title}</Text>}
              {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </View>
          )}

          {/* Main Content */}
          <View style={styles.contentContainer}>
            {children}
          </View>
        </ScrollView>

        {/* Continue Button - No divider, consistent with image 3 */}
        {showContinue && (
          <View style={styles.footerContainer}>
            <TouchableOpacity
              style={[
                styles.continueButton,
                continueDisabled && styles.continueButtonDisabled
              ]}
              onPress={onContinuePress}
              disabled={continueDisabled}
            >
              <Text style={styles.continueButtonText}>{continueText}</Text>
              <ArrowRight size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  logoContainer: {
    alignItems: 'center',
    // This matches the height in image 3
    paddingTop: 16,
    marginBottom: 24,
  },
  keyboardAvoidContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: HEADER_CONSTANTS.CONTENT_PADDING,
    paddingBottom: 20,
  },
  backButton: {
    marginBottom: 16,
  },
  headerTextContainer: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 16,
    color: '#6366F1',
    fontWeight: '500',
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  contentContainer: {
    flex: 1,
  },
  footerContainer: {
    padding: HEADER_CONSTANTS.CONTENT_PADDING,
    // No top border
  },
  continueButton: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    height: HEADER_CONSTANTS.BUTTON_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  continueButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  }
});
