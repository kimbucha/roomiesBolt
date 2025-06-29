import { Platform, TextInputProps } from 'react-native';

/**
 * Simple fix for React Native 0.76.9 TextInput paste crash
 * 
 * Apply these props to any TextInput where users might paste content
 * to prevent the "Inconsistency between local and UIKit touch registries" crash
 */
export const safeTextInputProps: Partial<TextInputProps> = {
  // Prevent touch registry conflicts
  contextMenuHidden: false,
  selectTextOnFocus: false,
  
  // iOS-specific fixes
  ...(Platform.OS === 'ios' && {
    // Disable problematic text selection features that conflict with touch handling
    clearButtonMode: 'never',
    // Ensure stable text content type
    textContentType: 'none',
    // Prevent automatic text replacement that can trigger touch conflicts
    autoCorrect: false,
    spellCheck: false,
  }),
};

/**
 * Apply to TextInput components where paste operations might occur
 * 
 * Usage:
 * <TextInput {...safeTextInputProps} {...yourOtherProps} />
 */ 