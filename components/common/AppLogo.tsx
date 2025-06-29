import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { styled } from 'nativewind';
import { HEADER_CONSTANTS } from '../../constants/headerConfig';

const StyledView = styled(View);
const StyledText = styled(Text);

interface AppLogoProps {
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'onboarding' | 'login';
  step?: number;
  className?: string;
  textColor?: string;
}

/**
 * Consistent AppLogo component that can be used across the entire app
 * 
 * @param size - Size of the logo (small, medium, large)
 * @param variant - Logo variant (default, onboarding with step highlighting, or login)
 * @param step - Current step in onboarding (1-8)
 * @param className - Additional className for styling
 * @param textColor - Override for the text color
 */
export default function AppLogo({ 
  size = 'medium', 
  variant = 'default',
  step = 1,
  className = '',
  textColor
}: AppLogoProps) {
  // Font size based on the size prop
  const fontSize = size === 'small' ? 22 : size === 'medium' ? HEADER_CONSTANTS.LOGO_TEXT_SIZE : 40;
  
  // For onboarding variant with progressive highlighting
  if (variant === 'onboarding') {
    // Letters in "roomies" + "+" for account step
    const letters = ['r', 'o', 'o', 'm', 'i', 'e', 's', '+'];
    
    // Define the highlighted color (indigo-600)
    const highlightColor = '#6366f1';
    const defaultColor = '#FFFFFF';
    
    return (
      <StyledView style={[styles.container]} className={className}>
        <StyledText style={styles.logoTextOnboarding}>
          {letters.map((letter, index) => (
            <StyledText 
              key={index}
              style={[
                styles.letter,
                { 
                  color: index < step ? highlightColor : defaultColor,
                  fontWeight: 'bold',
                  fontSize: letter === '+' ? fontSize - 8 : fontSize, // Smaller plus sign
                  marginLeft: letter === '+' ? 2 : 0, // Add a small gap before the plus
                  textAlignVertical: letter === '+' ? 'top' : 'auto', // Align plus sign
                }
              ]}
            >
              {letter}
            </StyledText>
          ))}
        </StyledText>
      </StyledView>
    );
  }
  
  // Login variant (white text)
  if (variant === 'login') {
    return (
      <StyledView style={styles.container} className={className}>
        <StyledText style={[styles.logoText, { fontSize, color: '#FFFFFF' }]}>
          <StyledText style={[styles.logoText, { fontSize, color: '#FFFFFF' }]}>
            r
          </StyledText>
          <StyledText style={[styles.logoText, { fontSize, color: '#FFFFFF' }]}>
            oomies
          </StyledText>
        </StyledText>
      </StyledView>
    );
  }
  
  // Default variant (lowercase "roomies")
  const textColorToUse = textColor || '#4F46E5';
  return (
    <StyledView style={styles.container} className={className}>
      <StyledText style={[styles.logoText, { fontSize }]}>
        <StyledText style={[styles.logoText, { color: textColorToUse, fontSize, letterSpacing: -0.5 }]}>
          r
        </StyledText>
        <StyledText style={[styles.logoText, { color: textColorToUse, letterSpacing: -0.3, fontSize }]}>
          oomies
        </StyledText>
      </StyledText>
    </StyledView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 0, // No default padding - will be controlled by parent
  },
  logoText: {
    fontFamily: 'Poppins-Bold',
    color: '#4F46E5', 
    fontWeight: '700',
  },
  logoTextOnboarding: {
    fontFamily: 'Poppins-Bold',
    fontWeight: '700',
  },
  letter: {
    fontFamily: 'Poppins-Bold',
  }
});
