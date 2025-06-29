import { Redirect } from 'expo-router';

// This file redirects from /(onboarding)/ to /(onboarding)/welcome
export default function OnboardingIndex() {
  return <Redirect href="/(onboarding)/welcome" />;
}
