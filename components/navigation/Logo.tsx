import React from 'react';
import { View, StyleSheet } from 'react-native';
import { styled } from 'nativewind';
import AppLogo from '../common/AppLogo';
import { HEADER_CONSTANTS } from '../../constants/headerConfig';

const StyledView = styled(View);

/**
 * Navigation Logo component for use in the app's header
 * @param size - Size of the logo (small, medium, large)
 */
export default function Logo({ size = 'small' }: { size?: 'small' | 'medium' | 'large' }) {
  return (
    <StyledView style={styles.container}>
      <AppLogo size={size} variant="default" />
    </StyledView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: 10, // Reduced padding for nav header to avoid extra space
  },
});