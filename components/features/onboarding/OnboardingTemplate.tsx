import React, { ReactNode } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  StatusBar, 
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, ArrowRight } from 'lucide-react-native';
import { HEADER_CONSTANTS } from '../../../constants/headerConfig';
import AppLogo from '../../common/AppLogo';
import { BoltBadge } from '../../common/BoltBadge';


const { width, height } = Dimensions.get('window');

/**
 * Interface for the OnboardingTemplate props
 */
interface OnboardingTemplateProps {
  children: ReactNode;
  disableScroll?: boolean;
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
  // Quiz progress props
  quizStep?: number;
  quizTotalSteps?: number;
  showQuizProgress?: boolean;
  // Scroll control
  customHeaderContent?: ReactNode;
  hideProgress?: boolean;
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
  bgColor = 'transparent',
  logoVariant = 'default',
  buttonPosition = 'absolute',
  hideHeader = false,
  contentContainerStyle,
  quizStep,
  quizTotalSteps,
  showQuizProgress = false,
  customHeaderContent,
  hideProgress = false,
  disableScroll = false,
}: OnboardingTemplateProps) {
  // Determine text color based on background color
  const isDarkBackground = bgColor !== 'transparent' && bgColor !== '#FFFFFF';
  const textColor = isDarkBackground ? '#FFFFFF' : '#111827';
  const statusBarStyle = isDarkBackground ? 'light-content' : 'dark-content';
  
  // Format step display
  const formattedStep = typeof step === 'number' ? `Step ${step} of ${totalSteps}` : step;
  
  // Dynamic text color class
  const textColorClass = isDarkBackground ? 'text-white' : 'text-gray-900'; // Example mapping
  const subtitleColorClass = isDarkBackground ? 'text-gray-200' : 'text-gray-500';
  const stepTextColorClass = 'text-gray-500'; // Assuming this doesn't change based on bg
  const greetingColorClass = 'text-indigo-500'; // Assuming this doesn't change
  const backArrowColor = isDarkBackground ? '#FFFFFF' : '#4F46E5'; // Keep color prop for icon

  // console.log('[OnboardingTemplate] Rendering with step:', step); // Uncomment for debugging

  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: bgColor }}>
      <StatusBar barStyle={statusBarStyle} />
      
      {/* Bolt Badge - appears on all onboarding pages */}
      <BoltBadge />

      
      {!hideHeader && (
        <View 
          className={`${showBack ? 'flex-row items-center justify-between px-4' : 'flex-row items-center justify-center px-4'}`}
          style={{ height: HEADER_CONSTANTS.HEADER_HEIGHT }} // Keep height from constant
        >
          {showBack && (
            <TouchableOpacity 
              className="p-2" // Adjust padding as needed
              onPress={onBackPress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <ArrowLeft size={24} color={backArrowColor} />
            </TouchableOpacity>
          )}
          
          <AppLogo 
            variant={logoVariant} 
            size="medium" 
            textColor={isDarkBackground ? '#FFFFFF' : undefined}
          />
          
          {showBack && <View className="w-10" />}
        </View>
      )}
      
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={insets.top}
      >
        <ScrollView
          scrollEnabled={!disableScroll}
          contentContainerStyle={[
            {
              flexGrow: 1,
              justifyContent: 'space-between',
              // Uniform top padding across all screens
              paddingTop: 16,
              paddingHorizontal: 24,
              paddingBottom: insets.bottom + 16,
            },
            contentContainerStyle,
          ]}
          style={{ flex: 1 }}
        >
          {!hideProgress && typeof step === 'number' && (
            <View style={{ marginBottom: 8 }}>
              <View style={{ height: 4, backgroundColor: '#E5E7EB', borderRadius: 2, marginBottom: 4 }}>
                <View
                  style={{
                    height: 4,
                    backgroundColor: '#4F46E5',
                    borderRadius: 2,
                    width: `${(step / totalSteps) * 100}%`,
                  }}
                />
              </View>
              <Text style={{ fontSize: 14, fontWeight: '500', color: '#6B7280' }}>{formattedStep}</Text>
            </View>
          )}
          {showQuizProgress && typeof quizStep === 'number' && typeof quizTotalSteps === 'number' && (
            <View style={{ marginBottom: 8 }}>
              <View style={{ height: 4, backgroundColor: '#E5E7EB', borderRadius: 2, marginBottom: 4 }}>
                <View
                  style={{
                    height: 4,
                    backgroundColor: '#4F46E5',
                    borderRadius: 2,
                    width: `${(quizStep / quizTotalSteps) * 100}%`,
                  }}
                />
              </View>
              <Text style={{ fontSize: 12, fontWeight: '500', color: '#6B7280', textAlign: 'center' }}>
                Question {quizStep} of {quizTotalSteps}
              </Text>
            </View>
          )}
          {greeting && <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#4F46E5' }}>{greeting}</Text>}
          {(title || subtitle) && (
            <View style={{ marginBottom: 16 }}>
              {title && <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 8, color: isDarkBackground ? '#FFFFFF' : '#111827' }}>{title}</Text>}
              {subtitle && <Text style={{ fontSize: 16, lineHeight: 24, color: isDarkBackground ? '#E5E7EB' : '#6B7280' }}>{subtitle}</Text>}
            </View>
          )}
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
      
      {showContinue && buttonPosition === 'relative' && (
        <View className="px-6 py-4 bg-white border-t border-gray-100">
          <TouchableOpacity
            className={`bg-indigo-600 rounded-lg py-3.5 flex-row items-center justify-center ${continueDisabled ? 'bg-indigo-300 opacity-70' : ''}`}
            onPress={onContinuePress}
            disabled={continueDisabled}
          >
            <Text className="text-white text-base font-semibold mr-2">{continueText}</Text>
            <ArrowRight size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
      
      {showContinue && buttonPosition === 'absolute' && (
        <View className={`absolute bottom-0 left-0 right-0 px-6 py-4 bg-white border-t border-gray-100 ${Platform.OS === 'ios' ? 'pb-8' : 'pb-4'}`}>
          <TouchableOpacity
             className={`bg-indigo-600 rounded-lg py-3.5 flex-row items-center justify-center ${continueDisabled ? 'bg-indigo-300 opacity-70' : ''}`}
            onPress={onContinuePress}
            disabled={continueDisabled}
          >
            <Text className="text-white text-base font-semibold mr-2">{continueText}</Text>
            <ArrowRight size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
