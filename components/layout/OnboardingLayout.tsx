import React, { ReactNode } from 'react';
import { 
  View, 
  StyleSheet, 
  SafeAreaView, 
  StatusBar, 
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { HEADER_CONSTANTS } from '../../constants/headerConfig';
import OnboardingHeader from '../OnboardingHeader';

interface OnboardingLayoutProps {
  step: number;
  children: ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
  footerContent?: ReactNode;
  scrollable?: boolean;
  avoidKeyboard?: boolean;
}

/**
 * A shared layout component for all onboarding screens to ensure consistent
 * positioning of headers, content, and footers.
 */
export default function OnboardingLayout({
  step,
  children,
  showHeader = true,
  showFooter = false,
  footerContent,
  scrollable = true,
  avoidKeyboard = true
}: OnboardingLayoutProps) {
  const renderContent = () => {
    const content = (
      <View style={styles.contentContainer}>
        {children}
      </View>
    );

    if (scrollable) {
      return (
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {content}
        </ScrollView>
      );
    }

    return content;
  };

  const renderMain = () => {
    const main = (
      <>
        {showHeader && <OnboardingHeader step={step} />}
        {renderContent()}
        {showFooter && footerContent && (
          <View style={styles.footerContainer}>
            {footerContent}
          </View>
        )}
      </>
    );

    if (avoidKeyboard) {
      return (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidContainer}
        >
          {main}
        </KeyboardAvoidingView>
      );
    }

    return main;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {renderMain()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAvoidContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: HEADER_CONSTANTS.CONTENT_PADDING,
  },
  footerContainer: {
    padding: HEADER_CONSTANTS.CONTENT_PADDING,
    borderTopWidth: 0, // Remove divider
  }
});
