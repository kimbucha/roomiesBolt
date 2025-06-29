import React from 'react';
import { View, StyleSheet } from 'react-native';
import { styled } from 'nativewind';
import AppLogo from './common/AppLogo';
import { HEADER_CONSTANTS } from '../constants/headerConfig';

const StyledView = styled(View);

/**
 * OnboardingHeader component that displays the roomies logo 
 * with progressive letter highlighting based on onboarding progress
 * 
 * @param step - Current onboarding step (1-8)
 */
export default function OnboardingHeader({ step = 1 }: { step?: number }) {
  return (
    <StyledView style={styles.container} className="w-full">
      <AppLogo variant="onboarding" step={step} size="medium" />
    </StyledView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: HEADER_CONSTANTS.HEADER_PADDING_TOP,
    marginBottom: HEADER_CONSTANTS.LOGO_BOTTOM_MARGIN,
  },
});
