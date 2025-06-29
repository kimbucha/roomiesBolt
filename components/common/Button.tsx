import React, { ReactNode } from 'react';
import { Text, TouchableOpacity, ActivityIndicator, View } from 'react-native';
import { styled } from 'nativewind';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchable = styled(TouchableOpacity);

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  style?: any;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  style,
}) => {
  const getButtonClasses = () => {
    let classes = 'rounded-xl justify-center items-center flex-row ';
    
    // Variant classes
    switch (variant) {
      case 'primary':
        classes += 'bg-indigo-600 ';
        break;
      case 'secondary':
        classes += 'bg-emerald-500 ';
        break;
      case 'outline':
        classes += 'bg-transparent border border-indigo-600 ';
        break;
      case 'text':
        classes += 'bg-transparent ';
        break;
      case 'danger':
        classes += 'bg-red-500 ';
        break;
      default:
        classes += 'bg-indigo-600 ';
    }
    
    // Size classes
    switch (size) {
      case 'small':
        classes += 'py-1.5 px-3 ';
        break;
      case 'medium':
        classes += 'py-2.5 px-4 ';
        break;
      case 'large':
        classes += 'py-3.5 px-5 ';
        break;
      default:
        classes += 'py-2.5 px-4 ';
    }
    
    // Width
    if (fullWidth) {
      classes += 'w-full ';
    }
    
    // Disabled state
    if (disabled) {
      classes += 'bg-gray-200 border-gray-200 ';
    }
    
    return classes;
  };
  
  const getTextClasses = () => {
    let classes = 'font-medium text-center ';
    
    // Text color based on variant
    if (disabled) {
      classes += 'text-gray-400 ';
    } else {
      switch (variant) {
        case 'primary':
        case 'secondary':
        case 'danger':
          classes += 'text-white ';
          break;
        case 'outline':
        case 'text':
          classes += 'text-indigo-600 ';
          break;
        default:
          classes += 'text-white ';
      }
    }
    
    // Text size based on button size
    switch (size) {
      case 'small':
        classes += 'text-xs ';
        break;
      case 'medium':
        classes += 'text-sm ';
        break;
      case 'large':
        classes += 'text-base ';
        break;
      default:
        classes += 'text-sm ';
    }
    
    return classes;
  };

  const getIconColor = () => {
    if (disabled) return '#9CA3AF';
    
    switch (variant) {
      case 'primary':
      case 'secondary':
      case 'danger':
        return '#FFFFFF';
      case 'outline':
      case 'text':
        return '#4F46E5';
      default:
        return '#FFFFFF';
    }
  };

  return (
    <StyledTouchable
      className={getButtonClasses()}
      style={style}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'text' ? '#4F46E5' : '#fff'}
          size="small"
        />
      ) : (
        <StyledView className="flex-row items-center justify-center">
          {leftIcon && (
            <StyledView className="mr-2">
              {leftIcon}
            </StyledView>
          )}
          
          <StyledText className={getTextClasses()}>
            {title}
          </StyledText>
          
          {rightIcon && (
            <StyledView className="ml-2">
              {rightIcon}
            </StyledView>
          )}
        </StyledView>
      )}
    </StyledTouchable>
  );
};

// Styles converted to Tailwind
