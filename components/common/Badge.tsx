import React, { ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface BadgeProps {
  label?: string | number;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'small' | 'medium' | 'large';
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  style?: any;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'primary',
  size = 'medium',
  leftIcon,
  rightIcon,
  style,
}) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.primaryBadge;
      case 'secondary':
        return styles.secondaryBadge;
      case 'success':
        return styles.successBadge;
      case 'warning':
        return styles.warningBadge;
      case 'danger':
        return styles.dangerBadge;
      case 'info':
        return styles.infoBadge;
      default:
        return styles.primaryBadge;
    }
  };

  const getTextVariantStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.primaryText;
      case 'secondary':
        return styles.secondaryText;
      case 'success':
        return styles.successText;
      case 'warning':
        return styles.warningText;
      case 'danger':
        return styles.dangerText;
      case 'info':
        return styles.infoText;
      default:
        return styles.primaryText;
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return styles.smallBadge;
      case 'medium':
        return styles.mediumBadge;
      case 'large':
        return styles.largeBadge;
      default:
        return styles.mediumBadge;
    }
  };

  const getTextSizeStyle = () => {
    switch (size) {
      case 'small':
        return styles.smallText;
      case 'medium':
        return styles.mediumText;
      case 'large':
        return styles.largeText;
      default:
        return styles.mediumText;
    }
  };

  // If label is a number and greater than 99, display 99+
  const displayLabel = () => {
    if (typeof label === 'number' && label > 99) {
      return '99+';
    }
    return label;
  };

  return (
    <View
      style={[
        styles.badge,
        getVariantStyle(),
        getSizeStyle(),
        style,
      ]}
    >
      {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}
      
      {label !== undefined && (
        <Text style={[styles.text, getTextVariantStyle(), getTextSizeStyle()]}>
          {displayLabel()}
        </Text>
      )}
      
      {rightIcon && <View style={styles.rightIconContainer}>{rightIcon}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
  },
  text: {
    fontFamily: 'Poppins-Medium',
    textAlign: 'center',
  },
  leftIconContainer: {
    marginRight: 4,
  },
  rightIconContainer: {
    marginLeft: 4,
  },
  // Variants
  primaryBadge: {
    backgroundColor: '#EEF2FF', // Indigo-50
  },
  primaryText: {
    color: '#4F46E5', // Indigo-600
  },
  secondaryBadge: {
    backgroundColor: '#F0FDF4', // Emerald-50
  },
  secondaryText: {
    color: '#10B981', // Emerald-500
  },
  successBadge: {
    backgroundColor: '#ECFDF5', // Green-50
  },
  successText: {
    color: '#10B981', // Green-500
  },
  warningBadge: {
    backgroundColor: '#FFFBEB', // Amber-50
  },
  warningText: {
    color: '#F59E0B', // Amber-500
  },
  dangerBadge: {
    backgroundColor: '#FEF2F2', // Red-50
  },
  dangerText: {
    color: '#EF4444', // Red-500
  },
  infoBadge: {
    backgroundColor: '#EFF6FF', // Blue-50
  },
  infoText: {
    color: '#3B82F6', // Blue-500
  },
  // Sizes
  smallBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  smallText: {
    fontSize: 10,
  },
  mediumBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  mediumText: {
    fontSize: 12,
  },
  largeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  largeText: {
    fontSize: 14,
  },
});
