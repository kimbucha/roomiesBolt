import React, { forwardRef, useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, TextInputProps, StyleSheet, Keyboard, Platform, findNodeHandle } from 'react-native';

interface InputFieldProps extends TextInputProps {
  label: string;
  icon?: React.ReactNode;
  error?: string;
}

const InputField = forwardRef<TextInput, InputFieldProps>(
  ({ label, icon, error, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<TextInput | null>(null);
    
    // Combine the forwarded ref with our local ref
    useEffect(() => {
      if (typeof ref === 'function') {
        ref(inputRef.current);
      } else if (ref) {
        ref.current = inputRef.current;
      }
    }, [ref]);
    
    // Handle focus with better coordination for scrolling
    const handleFocus = () => {
      setIsFocused(true);
      if (props.onFocus) {
        props.onFocus(null as any);
      }
    };
    
    return (
      <View style={styles.container}>
        <Text style={styles.label}>{label}</Text>
        <View style={[
        styles.inputContainer, 
        error && styles.inputContainerError,
        isFocused && styles.inputContainerFocused
      ]}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <TextInput
            ref={inputRef}
            style={[styles.input, icon ? styles.inputWithIcon : null]}
            placeholderTextColor="#9CA3AF"
            onFocus={handleFocus}
            onBlur={() => setIsFocused(false)}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType={props.returnKeyType || "next"}
            blurOnSubmit={props.blurOnSubmit !== undefined ? props.blurOnSubmit : false}
            {...props}
          />
        </View>
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
  },
  inputContainerError: {
    borderColor: '#EF4444',
  },
  inputContainerFocused: {
    borderColor: '#4F46E5',
    borderWidth: 2,
  },
  iconContainer: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    paddingVertical: 12,
    height: 48, // Fixed height to ensure text doesn't get cut off
  },
  inputWithIcon: {
    paddingLeft: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
});

export default InputField;
