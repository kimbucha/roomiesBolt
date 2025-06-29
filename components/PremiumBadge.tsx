import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Crown } from 'lucide-react-native';

interface PremiumBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  style?: any;
}

export default function PremiumBadge({ 
  size = 'md', 
  showLabel = true,
  style 
}: PremiumBadgeProps) {
  // Determine sizes based on the size prop
  const badgeSize = {
    sm: { height: 16, iconSize: 10, fontSize: 10, paddingHorizontal: 4 },
    md: { height: 20, iconSize: 12, fontSize: 12, paddingHorizontal: 6 },
    lg: { height: 24, iconSize: 14, fontSize: 14, paddingHorizontal: 8 },
  }[size];
  
  return (
    <View 
      style={[
        styles.badge,
        { 
          height: badgeSize.height,
          paddingHorizontal: showLabel ? badgeSize.paddingHorizontal : 0,
          width: showLabel ? undefined : badgeSize.height,
        },
        style
      ]}
    >
      <Crown size={badgeSize.iconSize} color="#FFFFFF" />
      {showLabel && (
        <Text 
          style={[
            styles.badgeText,
            { fontSize: badgeSize.fontSize }
          ]}
        >
          PREMIUM
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F59E0B',
    borderRadius: 12,
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 4,
    fontFamily: 'Poppins-Bold',
  },
});
