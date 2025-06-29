import { router } from 'expo-router';

/**
 * Navigation service for handling app navigation
 * This centralizes all navigation logic and makes it easier to track and modify navigation flows
 */
class NavigationService {
  // Auth Navigation
  navigateToLogin = () => {
    router.replace('/(auth)/login');
  };

  navigateToSignup = () => {
    router.replace('/(auth)/signup');
  };

  navigateToForgotPassword = () => {
    router.push('/(auth)/forgot-password');
  };

  // Onboarding Navigation
  navigateToOnboarding = () => {
    router.replace('/(onboarding)');
  };

  navigateToOnboardingPhotos = () => {
    router.push('/(onboarding)/photos');
  };

  navigateToOnboardingPreferences = () => {
    router.push('/(onboarding)/preferences');
  };

  // Main App Navigation
  navigateToHome = () => {
    router.replace('/(tabs)');
  };

  navigateToDiscover = () => {
    router.replace('/(tabs)/discover');
  };

  navigateToMatches = () => {
    router.replace('/(tabs)/matches');
  };

  navigateToProfile = () => {
    router.replace('/(tabs)/profile');
  };

  // Profile Related Navigation
  navigateToEditProfile = () => {
    router.push('/edit-profile' as any);
  };

  navigateToPremium = () => {
    router.push('/premium-features' as any);
  };

  navigateToSupport = () => {
    router.push('/support' as any);
  };

  navigateToPrivacySecurity = () => {
    router.push('/privacy-security' as any);
  };

  navigateToPaymentMethods = () => {
    router.push('/payment-methods' as any);
  };

  // Match and Conversation Navigation
  goToMatch = (matchId: string) => {
    router.push({
      pathname: '/(app)/match-profile/[matchId]' as any,
      params: { matchId }
    });
  };

  goToConversation = (conversationId: string, options?: {
    source?: 'newMatch' | 'contextMenu' | 'messagesList';
    matchId?: string;
  }) => {
    router.push({
      pathname: '/conversation/[id]' as any,
      params: {
        id: conversationId,
        source: options?.source || 'direct',
        matchId: options?.matchId || ''
      }
    });
  };

  goToProfileTab = () => {
    router.push('/(app)/profile/user-profile' as any);
  };

  // General Navigation
  goBack = () => {
    router.back();
  };
}

// Export as singleton
export default new NavigationService();
