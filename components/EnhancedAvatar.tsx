/**
 * Enhanced Avatar Component
 * 
 * Uses the centralized ProfileImageService for consistent image resolution.
 * Supports all image types: uploaded photos, personality images, potato default, and initials.
 * 
 * This should replace both Avatar.tsx and UserAvatar.tsx for better consistency.
 */

import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { User } from '../store/userStore';
import { ProfileImageService, ProfileImageType, ProfileImageResult } from '../utils/profileImageService';

interface EnhancedAvatarProps {
  user?: User | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  variant?: 'circle' | 'rounded' | 'square';
  style?: any;
  showOnlineIndicator?: boolean;
  onPress?: () => void;
  
  // Override props for manual control (useful for non-user avatars)
  manualSource?: { uri: string } | number;
  manualName?: string;
  manualInitials?: string;
}

const EnhancedAvatar: React.FC<EnhancedAvatarProps> = ({
  user,
  size = 'md',
  variant = 'circle',
  style,
  showOnlineIndicator = false,
  onPress,
  manualSource,
  manualName,
  manualInitials,
}) => {
  
  // Get profile image using the centralized service
  const profileImageResult: ProfileImageResult = React.useMemo(() => {
    // Manual override mode
    if (manualSource || manualName || manualInitials) {
      return {
        type: manualSource ? ProfileImageType.UPLOADED_PHOTO : ProfileImageType.INITIALS_FALLBACK,
        source: manualSource || null,
        fallbackInitials: manualInitials || ProfileImageService.generateInitials(manualName)
      };
    }
    
    // Use service for user-based resolution
    return ProfileImageService.getProfileImage(user);
  }, [user, manualSource, manualName, manualInitials]);

  const getSizeStyle = () => {
    switch (size) {
      case 'xs': return styles.xsAvatar;
      case 'sm': return styles.smAvatar;
      case 'md': return styles.mdAvatar;
      case 'lg': return styles.lgAvatar;
      case 'xl': return styles.xlAvatar;
      case 'xxl': return styles.xxlAvatar;
      default: return styles.mdAvatar;
    }
  };

  const getTextSizeStyle = () => {
    switch (size) {
      case 'xs': return styles.xsText;
      case 'sm': return styles.smText;
      case 'md': return styles.mdText;
      case 'lg': return styles.lgText;
      case 'xl': return styles.xlText;
      case 'xxl': return styles.xxlText;
      default: return styles.mdText;
    }
  };

  const getVariantStyle = () => {
    switch (variant) {
      case 'circle': return styles.circleVariant;
      case 'rounded': return styles.roundedVariant;
      case 'square': return styles.squareVariant;
      default: return styles.circleVariant;
    }
  };

  const getBackgroundColor = () => {
    const name = user?.name || manualName;
    if (!name) return '#4F46E5';
    
    const colors = [
      '#4F46E5', '#10B981', '#F59E0B', '#EF4444',
      '#8B5CF6', '#EC4899', '#06B6D4', '#F97316'
    ];
    
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const renderContent = () => {
    // Show image if we have a valid source
    if (profileImageResult.source) {
      return (
        <Image
          source={profileImageResult.source}
          style={[styles.image, getSizeStyle(), getVariantStyle()]}
          resizeMode="cover"
        />
      );
    }
    
    // Show initials as fallback
    const initials = profileImageResult.fallbackInitials || 
                    ProfileImageService.generateInitials(user?.name || manualName);
    
    return (
      <Text style={[styles.initials, getTextSizeStyle()]}>
        {initials}
      </Text>
    );
  };

  const renderOnlineIndicator = () => {
    if (!showOnlineIndicator) return null;
    
    return (
      <View style={[styles.onlineIndicator, getOnlineIndicatorSizeStyle()]} />
    );
  };

  const getOnlineIndicatorSizeStyle = () => {
    switch (size) {
      case 'xs': return styles.onlineIndicatorXs;
      case 'sm': return styles.onlineIndicatorSm;
      case 'md': return styles.onlineIndicatorMd;
      case 'lg': return styles.onlineIndicatorLg;
      case 'xl': return styles.onlineIndicatorXl;
      case 'xxl': return styles.onlineIndicatorXxl;
      default: return styles.onlineIndicatorMd;
    }
  };

  const containerStyle = [
    styles.avatar,
    getSizeStyle(),
    getVariantStyle(),
    !profileImageResult.source && { backgroundColor: getBackgroundColor() },
    style,
  ];

  // Wrap in touchable if onPress provided
  if (onPress) {
    const TouchableOpacity = require('react-native').TouchableOpacity;
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <View style={containerStyle}>
          {renderContent()}
          {renderOnlineIndicator()}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={containerStyle}>
      {renderContent()}
      {renderOnlineIndicator()}
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  initials: {
    fontFamily: 'Poppins-Medium',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  
  // Size styles
  xsAvatar: { width: 24, height: 24 },
  smAvatar: { width: 32, height: 32 },
  mdAvatar: { width: 48, height: 48 },
  lgAvatar: { width: 64, height: 64 },
  xlAvatar: { width: 96, height: 96 },
  xxlAvatar: { width: 128, height: 128 },
  
  // Text sizes
  xsText: { fontSize: 10 },
  smText: { fontSize: 12 },
  mdText: { fontSize: 16 },
  lgText: { fontSize: 24 },
  xlText: { fontSize: 32 },
  xxlText: { fontSize: 42 },
  
  // Variant styles
  circleVariant: { borderRadius: 9999 },
  roundedVariant: { borderRadius: 12 },
  squareVariant: { borderRadius: 0 },
  
  // Online indicator
  onlineIndicator: {
    position: 'absolute',
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 9999,
  },
  onlineIndicatorXs: { width: 6, height: 6, bottom: 0, right: 0 },
  onlineIndicatorSm: { width: 8, height: 8, bottom: 0, right: 0 },
  onlineIndicatorMd: { width: 12, height: 12, bottom: 2, right: 2 },
  onlineIndicatorLg: { width: 16, height: 16, bottom: 4, right: 4 },
  onlineIndicatorXl: { width: 20, height: 20, bottom: 6, right: 6 },
  onlineIndicatorXxl: { width: 24, height: 24, bottom: 8, right: 8 },
});

export default EnhancedAvatar; 