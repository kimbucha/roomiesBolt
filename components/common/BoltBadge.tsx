import React from 'react';
import { TouchableOpacity, StyleSheet, Linking, Image } from 'react-native';

interface BoltBadgeProps {
  style?: any;
}

export const BoltBadge: React.FC<BoltBadgeProps> = ({ style }) => {
  const handlePress = () => {
    Linking.openURL('https://bolt.new/');
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Image
        source={require('../../assets/images/white_circle_360x360.png')}
        style={styles.badge}
        resizeMode="contain"
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 9999,
  },
  badge: {
    width: 50,
    height: 50,
  },
});