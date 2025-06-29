import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';

interface AvatarProps {
  source?: { uri: string } | null;
  name?: string;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  variant?: 'circle' | 'rounded' | 'square';
  style?: any;
}

export const Avatar: React.FC<AvatarProps> = React.memo(({
  source,
  name,
  size = 'medium',
  variant = 'circle',
  style,
}) => {
  // Only log in development mode to reduce production overhead
  if (__DEV__) {
    console.log('[Avatar] rendering with props:', { source, name, size, variant });
  }

  const getInitials = (name: string) => {
    if (!name) return '';
    
    const nameParts = name.split(' ');
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    }
    
    return (
      nameParts[0].charAt(0).toUpperCase() + 
      nameParts[nameParts.length - 1].charAt(0).toUpperCase()
    );
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return styles.smallAvatar;
      case 'medium':
        return styles.mediumAvatar;
      case 'large':
        return styles.largeAvatar;
      case 'xlarge':
        return styles.xlargeAvatar;
      default:
        return styles.mediumAvatar;
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
      case 'xlarge':
        return styles.xlargeText;
      default:
        return styles.mediumText;
    }
  };

  const getVariantStyle = () => {
    switch (variant) {
      case 'circle':
        return styles.circleAvatar;
      case 'rounded':
        return styles.roundedAvatar;
      case 'square':
        return styles.squareAvatar;
      default:
        return styles.circleAvatar;
    }
  };

  // Generate a consistent background color based on the name
  const getBackgroundColor = (name?: string) => {
    if (!name) return '#4F46E5'; // Default color
    
    const colors = [
      '#4F46E5', // Indigo
      '#10B981', // Emerald
      '#F59E0B', // Amber
      '#EF4444', // Red
      '#8B5CF6', // Violet
      '#EC4899', // Pink
      '#06B6D4', // Cyan
      '#F97316', // Orange
    ];
    
    // Simple hash function to get a consistent index
    const hash = name.split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);
    
    return colors[hash % colors.length];
  };

  return (
    <View
      style={[
        styles.avatar,
        getSizeStyle(),
        getVariantStyle(),
        !source && { backgroundColor: getBackgroundColor(name) },
        style,
      ]}
    >
      {source ? (
        <Image
          source={source}
          style={[styles.image, getSizeStyle(), getVariantStyle()]}
        />
      ) : (
        <Text style={[styles.initials, getTextSizeStyle()]}>
          {name ? getInitials(name) : '?'}
        </Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  avatar: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  initials: {
    fontFamily: 'Poppins-Medium',
    color: '#FFFFFF',
  },
  // Sizes
  smallAvatar: {
    width: 32,
    height: 32,
  },
  mediumAvatar: {
    width: 48,
    height: 48,
  },
  largeAvatar: {
    width: 64,
    height: 64,
  },
  xlargeAvatar: {
    width: 96,
    height: 96,
  },
  // Text sizes
  smallText: {
    fontSize: 12,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 24,
  },
  xlargeText: {
    fontSize: 32,
  },
  // Variants
  circleAvatar: {
    borderRadius: 9999,
  },
  roundedAvatar: {
    borderRadius: 12,
  },
  squareAvatar: {
    borderRadius: 0,
  },
});
