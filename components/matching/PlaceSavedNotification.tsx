import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  Image,
  Pressable,
  Platform,
  Animated,
  Easing,
  Dimensions
} from 'react-native';
import { X } from 'lucide-react-native';
import { RoommateProfile } from '../../store/roommateStore';

// Get screen dimensions for animation calculations
const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PlaceSavedNotificationProps {
  visible?: boolean;
  profile: RoommateProfile | null;
  onClose: () => void;
  onViewDetails: () => void;
  isPrioritized?: boolean;
}

const PlaceSavedNotification: React.FC<PlaceSavedNotificationProps> = ({
  visible = true,
  profile,
  onClose,
  onViewDetails,
  isPrioritized = false
}) => {
  // Add state to track internal visibility for smooth transitions
  const [internalVisible, setInternalVisible] = useState(visible);
  const [internalProfile, setInternalProfile] = useState(profile);
  const [animationComplete, setAnimationComplete] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const placeImageOpacity = useRef(new Animated.Value(0)).current;
  const placeImageScale = useRef(new Animated.Value(0.6)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  
  // Reset animation state when modal closes
  useEffect(() => {
    if (!visible) {
      setAnimationComplete(false);
    }
  }, [visible]);
  
  // Update internal state when props change
  useEffect(() => {
    if (visible) {
      // When becoming visible, update internal data first, then show
      setInternalProfile(profile);
      setInternalVisible(true);
      
      // Reset animation values
      placeImageOpacity.setValue(0);
      placeImageScale.setValue(0.6);
      titleOpacity.setValue(0);
      contentOpacity.setValue(0);
      
      console.log('[PlaceSavedNotification] Animation values reset');
      
      // Fade in backdrop
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }).start();
      
      // Start animation sequence
      Animated.sequence([
        // 1. Fade in place image
        Animated.timing(placeImageOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true
        }),
        
        // 2. Scale up the image slightly with a bounce effect
        Animated.timing(placeImageScale, {
          toValue: 1,
          duration: 300,
          easing: Easing.bounce,
          useNativeDriver: true
        }),
        
        // 3. Fade in the title
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true
        }),
        
        // 4. Fade in the rest of the content
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        })
      ]).start(() => {
        setAnimationComplete(true);
      });
    } else {
      // When hiding, animate out first, then update internal data
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
      }).start(() => {
        setInternalVisible(false);
        // Only clear internal data after animation completes
        setInternalProfile(null);
      });
    }
  }, [visible, profile]);

  // Handle view details button press
  const handleViewDetailsPress = () => {
    console.log('[PLACE] View Details button pressed');
    if (onViewDetails) {
      onViewDetails();
    }
  };

  // Handle close button press
  const handleClosePress = () => {
    console.log('[PLACE] Close button pressed');
    if (onClose) {
      onClose();
    }
  };

  // Handle keep swiping button press
  const handleKeepSwipingPress = () => {
    console.log('[PLACE] Keep Swiping button pressed');
    if (onClose) {
      onClose();
    }
  };

  if (!internalProfile || !internalVisible) return null;

  // Determine notification title and message
  const notificationTitle = isPrioritized ? "Place Prioritized!" : "Place Saved!";
  const notificationDescription = isPrioritized 
    ? `You've added ${internalProfile.location} to your priority list.`
    : `You've saved this place in ${internalProfile.location} to your favorites.`;

  // Get place image - use room photos if available, otherwise use profile image
  const placeImage = internalProfile.roomPhotos && internalProfile.roomPhotos.length > 0 
    ? internalProfile.roomPhotos[0] 
    : internalProfile.image;

  return (
    <Modal
      transparent={true}
      visible={internalVisible}
      animationType="none" // We'll handle animation ourselves
      onRequestClose={handleClosePress}
      statusBarTranslucent={true}
    >
      <Animated.View 
        style={[
          styles.backdrop,
          { opacity: fadeAnim }
        ]}
      >
        <Pressable 
          style={styles.backdropPressable}
          onPress={handleClosePress}
        >
          <Pressable style={styles.contentWrapper} onPress={(e) => e.stopPropagation()}>
            <View style={styles.content}>
              {/* Close button */}
              <Pressable 
                style={styles.closeButton} 
                onPress={handleClosePress}
                hitSlop={20}
              >
                <X size={24} color="#fff" />
              </Pressable>
              
              {/* Notification title */}
              <Animated.Text style={[
                styles.notificationTitle,
                { opacity: titleOpacity }
              ]}>
                {notificationTitle}
              </Animated.Text>
              
              {/* Place Image */}
              <View style={styles.imageContainer}>
                <Animated.View
                  style={[
                    styles.placeImageWrapper,
                    {
                      opacity: placeImageOpacity,
                      transform: [{ scale: placeImageScale }]
                    }
                  ]}
                >
                  <Image
                    source={{ uri: placeImage }}
                    style={styles.placeImage}
                  />
                </Animated.View>
              </View>
              
              {/* Notification description */}
              <Animated.Text style={[
                styles.notificationDescription,
                { opacity: contentOpacity }
              ]}>
                {notificationDescription}
              </Animated.Text>
              
              {/* View Details button */}
              <Animated.View style={{ opacity: contentOpacity, width: '100%' }}>
                <Pressable 
                  style={({pressed}) => [
                    styles.viewDetailsButton,
                    pressed && styles.buttonPressed
                  ]}
                  onPress={handleViewDetailsPress}
                  android_ripple={{color: '#3c4bb0'}}
                >
                  <Text style={styles.viewDetailsButtonText}>View Details</Text>
                </Pressable>
              </Animated.View>
              
              {/* Keep Swiping button */}
              <Animated.View style={{ opacity: contentOpacity }}>
                <Pressable 
                  style={({pressed}) => [
                    styles.keepSwipingButton,
                    pressed && styles.textButtonPressed
                  ]}
                  onPress={handleKeepSwipingPress}
                  hitSlop={{top: 15, right: 15, bottom: 15, left: 15}}
                >
                  <Text style={styles.keepSwipingText}>Keep Swiping</Text>
                </Pressable>
              </Animated.View>
            </View>
          </Pressable>
        </Pressable>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  backdropPressable: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentWrapper: {
    width: '85%',
    maxWidth: 340,
    borderRadius: 20,
    overflow: 'hidden',
  },
  content: {
    backgroundColor: '#5e72e4',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    zIndex: 10,
    padding: 8,
  },
  notificationTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 24,
    textAlign: 'center',
    marginTop: 16,
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    height: 120,
    position: 'relative',
    width: '100%',
  },
  placeImageWrapper: {
    width: 160,
    height: 120,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: 'white',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  placeImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  notificationDescription: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.9,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  buttonPressed: {
    opacity: 0.8,
    backgroundColor: '#3c4bb0',
  },
  viewDetailsButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  keepSwipingButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  textButtonPressed: {
    opacity: 0.7,
  },
  keepSwipingText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    opacity: 0.9,
  },
});

export default PlaceSavedNotification; 