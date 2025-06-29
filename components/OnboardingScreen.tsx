import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useUserStore } from '../store/userStore';
import OnboardingHeader from './OnboardingHeader';

interface OnboardingScreenProps {
  title: string;
  subtitle?: string;
  currentStep: number;
  totalSteps: number;
  showBackButton?: boolean;
  children: ReactNode;
  footer?: ReactNode;
  scrollable?: boolean;
  onBackPress?: () => void;
}

export default function OnboardingScreen({
  title,
  subtitle,
  currentStep,
  totalSteps,
  showBackButton = true,
  children,
  footer,
  scrollable = true,
  onBackPress,
}: OnboardingScreenProps) {
  const router = useRouter();
  const { user } = useUserStore();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  const progressPercentage = (currentStep / totalSteps) * 100;

  const Content = () => (
    <View style={styles.contentContainer}>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      <View style={styles.childrenContainer}>{children}</View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Roomies logo with progressive highlighting */}
        <View style={styles.logoContainer}>
          <OnboardingHeader step={currentStep > 7 ? 7 : currentStep} />
        </View>
        
        <View style={styles.header}>
          {showBackButton && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBackPress}
              activeOpacity={0.7}
            >
              <ArrowLeft size={24} color="#1F2937" />
            </TouchableOpacity>
          )}
          
          {user?.name && (
            <Text style={styles.greeting}>Hey {user.name}</Text>
          )}
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[styles.progress, { width: `${progressPercentage}%` }]}
              />
            </View>
            <Text style={styles.progressText}>
              Step {currentStep} of {totalSteps}
            </Text>
          </View>
        </View>

        {scrollable ? (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollViewContent}
            showsVerticalScrollIndicator={false}
          >
            <Content />
          </ScrollView>
        ) : (
          <View style={styles.nonScrollContent}>
            <Content />
          </View>
        )}

        {footer && (
          <View style={styles.footerContainer}>
            <View style={styles.footer}>
              {footer}
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingTop: 16,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  backButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    padding: 8,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: '#4F46E5',
    marginBottom: 10,
  },
  progressContainer: {
    marginBottom: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progress: {
    height: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 4,
  },
  progressText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#6B7280',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  nonScrollContent: {
    flex: 1,
    paddingHorizontal: 24,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 32,
    lineHeight: 24,
  },
  childrenContainer: {
    flex: 1,
  },
  footerContainer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  footer: {
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 10,
  },
});
