import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Pressable } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring, 
  runOnJS 
} from 'react-native-reanimated';
import { router } from 'expo-router';

interface InterestedUserData {
  id: string;
  userId: string;
  placeId: string;
  userName: string;
  userImage?: string;
  userAge?: number;
  userUniversity?: string;
  createdAt: string;
  status: 'new' | 'contacted' | 'responded';
  hasUnreadMessage?: boolean;
}

interface InterestedUserCardProps {
  user: InterestedUserData;
  onPress?: () => void;
  onLongPress?: () => void;
  placeTitle?: string;
  listingImage?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const InterestedUserCard: React.FC<InterestedUserCardProps> = ({
  user,
  onPress,
  onLongPress,
  placeTitle,
  listingImage
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      // Navigate to conversation - using place-specific conversation ID pattern
      router.push(`/conversation/place-${user.placeId}-${user.userId}`);
    }
  };

  const handleLongPress = () => {
    if (onLongPress) {
      runOnJS(onLongPress)();
    }
  };

  const formatAge = (age?: number) => {
    return age ? `, ${age}` : '';
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onLongPress={handleLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.cardContainer, animatedStyle]}
    >
      <View style={styles.imageContainer}>
        <Image
          source={
            typeof user.userImage === 'string' 
              ? { uri: user.userImage || 'https://via.placeholder.com/120' }
              : user.userImage || { uri: 'https://via.placeholder.com/120' }
          }
          style={styles.profileImage}
        />
        {/* Listing badge overlayed on bottom-right */}
        {listingImage && (
          <View style={styles.listingBadge}>
            <Image
              source={{ uri: listingImage }}
              style={styles.listingBadgeImage}
            />
          </View>
        )}
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={1}>
          {user.userName}
        </Text>
        
        {user.userUniversity && (
          <Text style={styles.university} numberOfLines={1}>
            {user.userUniversity}{formatAge(user.userAge)}
          </Text>
        )}
      </View>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: 120,
    marginRight: 12,
    alignItems: 'center',
  },
  listingBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    padding: 1,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 3,
  },
  listingBadgeImage: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  infoContainer: {
    width: '100%',
    alignItems: 'flex-start',
    paddingHorizontal: 4,
  },
  name: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#1F2937',
    marginBottom: 2,
  },
  university: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
    marginBottom: 4,
  },
});

export default InterestedUserCard;