import React, { ReactNode, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  StatusBar, 
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { ArrowLeft, ArrowRight } from 'lucide-react-native';
import { HEADER_CONSTANTS } from '../../constants/headerConfig';
import AppLogo from '../common/AppLogo';

const { width, height } = Dimensions.get('window');

/**
 * Interface for the OnboardingTemplate props
 */
interface OnboardingTemplateProps {
  children: ReactNode;
  step?: number | string;
  totalSteps?: number;
  showBack?: boolean;
  showContinue?: boolean;
  continueText?: string;
  continueDisabled?: boolean;
  onBackPress?: () => void;
  onContinuePress?: () => void;
  title?: string;
  subtitle?: string;
  greeting?: string;
  bgColor?: string;
  logoVariant?: 'default' | 'onboarding' | 'login';
  buttonPosition?: 'absolute' | 'relative';
  hideHeader?: boolean;
  contentContainerStyle?: any;
}

/**
 * A standardized template for all onboarding screens to ensure consistent
 * header positioning, logo display, and button styling across the entire app
 */
export default function OnboardingTemplate({
  children,
  step = 1,
  totalSteps = 8,
  showBack = true,
  showContinue = true,
  continueText = 'Continue',
  continueDisabled = false,
  onBackPress,
  onContinuePress,
  title,
  subtitle,
  greeting,
  bgColor = '#FFFFFF',
  logoVariant = 'default',
  buttonPosition = 'relative',
  hideHeader = false,
  contentContainerStyle
}: OnboardingTemplateProps) {
  // PERFORMANCE: Stable refs to prevent header flash during navigation
  const showBackRef = useRef(showBack);
  const onBackPressRef = useRef(onBackPress);
  
  // Update refs when props change, but prevent flash during navigation
  useEffect(() => {
    // Small delay to prevent flash during navigation transitions
    const timer = setTimeout(() => {
      showBackRef.current = showBack;
      onBackPressRef.current = onBackPress;
    }, 50);
    
    return () => clearTimeout(timer);
  }, [showBack, onBackPress]);

  // Determine text color based on background color
  const isDarkBackground = bgColor !== '#FFFFFF';
  const textColor = isDarkBackground ? '#FFFFFF' : '#111827';
  const statusBarStyle = isDarkBackground ? 'light-content' : 'dark-content';
  
  // Format step display
  const formattedStep = typeof step === 'number' ? 
    `Step ${step} of ${totalSteps}` : 
    step;
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <StatusBar barStyle={statusBarStyle} />
      
      {/* Header with Logo */}
      {!hideHeader && (
        <View style={styles.header}>
          {/* Always render back button container for stable layout */}
          <View style={styles.backButtonContainer}>
            {showBackRef.current && onBackPressRef.current && (
              <TouchableOpacity 
                style={styles.backButton} 
                onPress={onBackPressRef.current}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <ArrowLeft size={24} color={isDarkBackground ? '#FFFFFF' : '#4F46E5'} />
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.logoContainer}>
            <AppLogo 
              variant={logoVariant} 
              size="medium" 
              textColor={isDarkBackground ? '#FFFFFF' : undefined}
            />
          </View>
          
          <View style={styles.placeholder} />
        </View>
      )}
      
      {/* Main Content */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidContainer}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            contentContainerStyle
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Progress Bar */}
          {typeof step === 'number' && (
            <View style={styles.progressContainer}>
              <View style={styles.progressTrack}>
                <View 
                  style={[
                    styles.progressBar, 
                    { width: `${(step / totalSteps) * 100}%` }
                  ]} 
                />
              </View>
              <Text style={[styles.stepText, { color: textColor }]}>
                {formattedStep}
              </Text>
            </View>
          )}
          
          {/* Greeting if provided */}
          {greeting && (
            <Text style={[styles.greeting, { color: '#6366F1' }]}>
              {greeting}
            </Text>
          )}
          
          {/* Title & Subtitle */}
          {(title || subtitle) && (
            <View style={styles.textContainer}>
              {title && (
                <Text style={[styles.title, { color: textColor }]}>
                  {title}
                </Text>
              )}
              {subtitle && (
                <Text style={[styles.subtitle, { color: isDarkBackground ? '#E5E7EB' : '#6B7280' }]}>
                  {subtitle}
                </Text>
              )}
            </View>
          )}
          
          {/* Main Content */}
          <View style={styles.contentContainer}>
            {children}
          </View>
        </ScrollView>
        
        {/* Continue Button */}
        {showContinue && buttonPosition === 'relative' && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.continueButton,
                continueDisabled && styles.buttonDisabled
              ]}
              onPress={onContinuePress}
              disabled={continueDisabled}
            >
              <Text style={styles.buttonText}>{continueText}</Text>
              {continueText !== 'Log In' && continueText !== 'Create Account' && (
                <ArrowRight size={20} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
      
      {/* Absolutely positioned button (for special cases like welcome screen) */}
      {showContinue && buttonPosition === 'absolute' && (
        <View style={styles.absoluteButtonContainer}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              continueDisabled && styles.buttonDisabled
            ]}
            onPress={onContinuePress}
            disabled={continueDisabled}
          >
            <Text style={styles.buttonText}>{continueText}</Text>
            {continueText !== 'Log In' && continueText !== 'Create Account' && (
              <ArrowRight size={20} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: HEADER_CONSTANTS.HEADER_HEIGHT,
    paddingTop: 8,
  },
  backButtonContainer: {
    width: 28, // Fixed width to maintain stable layout
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  backButton: {
    padding: 4,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  placeholder: {
    width: 28, // Same as back button container width for centering
  },
  keyboardAvoidContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: HEADER_CONSTANTS.CONTENT_PADDING,
    paddingBottom: 30,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressTrack: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#6366F1',
    borderRadius: 2,
  },
  stepText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  greeting: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6366F1',
    marginBottom: 8,
  },
  textContainer: {
    marginBottom: 24,
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
    lineHeight: 24,
  },
  contentContainer: {
    flex: 1,
  },
  buttonContainer: {
    paddingHorizontal: HEADER_CONSTANTS.CONTENT_PADDING,
    paddingVertical: 16,
  },
  absoluteButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: HEADER_CONSTANTS.CONTENT_PADDING,
    paddingBottom: 16 + (Platform.OS === 'ios' ? 8 : 16), // Extra padding for iOS
    paddingTop: 16,
    backgroundColor: 'transparent',
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
  buttonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});
