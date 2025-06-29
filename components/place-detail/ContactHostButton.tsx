import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Platform } from 'react-native';
import { MessageCircle } from 'lucide-react-native';

interface ContactHostButtonProps {
  hostName: string;
  onPress: () => void;
  isPrimary?: boolean;
  isFloating?: boolean;
}

export const ContactHostButton: React.FC<ContactHostButtonProps> = ({
  hostName,
  onPress,
  isPrimary = true,
  isFloating = false,
}) => {
  const baseStyles = [
    styles.button,
    isPrimary ? styles.primaryButton : styles.secondaryButton,
    isFloating && styles.floatingButton,
  ];

  const textStyles = [
    styles.buttonText,
    isPrimary ? styles.primaryButtonText : styles.secondaryButtonText,
  ];

  return (
    <View style={isFloating ? styles.floatingContainer : styles.container}>
      <TouchableOpacity 
        style={baseStyles} 
        onPress={onPress}
        activeOpacity={0.9}
      >
        <MessageCircle 
          size={20} 
          color={isPrimary ? '#FFFFFF' : '#4F46E5'} 
        />
        <Text style={textStyles}>
          Contact {hostName}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  floatingContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    paddingTop: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButton: {
    backgroundColor: '#4F46E5',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#4F46E5',
  },
  floatingButton: {
    paddingVertical: 18,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
  },
  secondaryButtonText: {
    color: '#4F46E5',
  },
});

export default ContactHostButton; 