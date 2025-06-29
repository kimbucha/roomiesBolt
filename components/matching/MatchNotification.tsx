import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  Image,
  Pressable,
  Platform,
  Animated,
  Easing,
  Dimensions
} from 'react-native';
import { MessageSquare, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Match } from '../../store/matchesStore';
import { RoommateProfile } from '../../store/roommateStore';
import { useSupabaseUserStore } from '../../store/supabaseUserStore';
import EnhancedAvatar from '../EnhancedAvatar';

// Get screen dimensions for animation calculations
const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface MatchNotificationProps {
  visible?: boolean;
  match: Match | null;
  profile: RoommateProfile | null;
  onClose: () => void;
  onMessage: () => void;
}

const MatchNotification: React.FC<MatchNotificationProps> = ({
  visible = true,
  match,
  profile,
  onClose,
  onMessage
}) => {
  // Add state to track internal visibility for smooth transitions
  const [internalVisible, setInternalVisible] = useState(visible);
  const [internalMatch, setInternalMatch] = useState(match);
  const [internalProfile, setInternalProfile] = useState(profile);
  const [animationComplete, setAnimationComplete] = useState(false);
  
  // Get current user profile for the animation
  const { user } = useSupabaseUserStore();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const leftProfileOpacity = useRef(new Animated.Value(0)).current;
  const rightProfileOpacity = useRef(new Animated.Value(0)).current;
  const profileScale = useRef(new Animated.Value(0.6)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  
  // Liquid glass animation values
  const glassShimmer1 = useRef(new Animated.Value(0)).current;
  const glassShimmer2 = useRef(new Animated.Value(0)).current;
  const glassRotate = useRef(new Animated.Value(0)).current;
  
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
      setInternalMatch(match);
      setInternalProfile(profile);
      setInternalVisible(true);
      
      // Reset animation values
      leftProfileOpacity.setValue(0);
      rightProfileOpacity.setValue(0);
      profileScale.setValue(0.6);
      titleOpacity.setValue(0);
      contentOpacity.setValue(0);
      glassShimmer1.setValue(0);
      glassShimmer2.setValue(0);
      glassRotate.setValue(0);
      
      console.log('[MatchNotification] Animation values reset');
      
      // Start continuous glass animations
      const glassAnimation1 = Animated.loop(
        Animated.sequence([
          Animated.timing(glassShimmer1, {
            toValue: 1,
            duration: 3000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true
          }),
          Animated.timing(glassShimmer1, {
            toValue: 0,
            duration: 3000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true
          })
        ])
      );
      
      const glassAnimation2 = Animated.loop(
        Animated.sequence([
          Animated.timing(glassShimmer2, {
            toValue: 1,
            duration: 4000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true
          }),
          Animated.timing(glassShimmer2, {
            toValue: 0,
            duration: 4000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true
          })
        ])
      );
      
      const rotateAnimation = Animated.loop(
        Animated.timing(glassRotate, {
          toValue: 1,
          duration: 20000,
          easing: Easing.linear,
          useNativeDriver: true
        })
      );
      
      // Start glass animations
      glassAnimation1.start();
      glassAnimation2.start();
      rotateAnimation.start();
      
      // Fade in backdrop
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }).start();
      
      // Start animation sequence
      Animated.sequence([
        // 1. Fade in both profile bubbles with a slight delay between them
        Animated.stagger(150, [
          Animated.timing(leftProfileOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true
          }),
          Animated.timing(rightProfileOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true
          })
        ]),
        
        // 2. Scale up the bubbles slightly with a bounce effect
        Animated.timing(profileScale, {
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
        setInternalMatch(null);
        setInternalProfile(null);
      });
    }
  }, [visible, match, profile]);
  
  // Debug function to log button presses without showing alerts
  const debugPress = (buttonName: string) => {
    console.log(`[MATCH] ${buttonName} button pressed`);
  };

  // Handle message button press
  const handleMessagePress = () => {
    debugPress('Message');
    if (onMessage) {
      onMessage();
    }
  };

  // Handle close button press
  const handleClosePress = () => {
    debugPress('Close');
    if (onClose) {
      onClose();
    }
  };

  // Handle keep swiping button press
  const handleKeepSwipingPress = () => {
    debugPress('Keep Swiping');
    if (onClose) {
      onClose();
    }
  };

  if (!internalMatch || !internalProfile || !internalVisible) return null;

  // Determine match type message
  let matchTitle = "It's a Match!";
  let matchDescription = "You and {profile.name} have liked each other.";
  
  if (internalMatch.status === 'superMatched') {
    matchTitle = "Super Match!";
    matchDescription = "Wow! You both super liked each other!";
  } else if (internalMatch.status === 'mixedMatched') {
    matchTitle = "Super Match!";
    matchDescription = "One of you used a super like. This could be special!";
  }
  
  // Replace placeholder with actual name
  matchDescription = matchDescription.replace('{profile.name}', internalProfile?.name || '');

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
            <View style={styles.glassContainer}>
              {/* Glass morphism background layers */}
              <BlurView intensity={80} tint="light" style={styles.glassBlur} />
              
              {/* Main gradient background */}
              <LinearGradient
                colors={[
                  'rgba(94, 114, 228, 0.9)', 
                  'rgba(99, 102, 241, 0.85)', 
                  'rgba(79, 70, 229, 0.9)'
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.glassGradient}
              />
              
              {/* Glass border effect */}
              <View style={styles.glassBorder} />
              
              {/* Animated shimmer layers */}
              <Animated.View
                style={[
                  styles.glassShimmer,
                  styles.glassShimmer1,
                  {
                    opacity: glassShimmer1.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.1, 0.3]
                    }),
                    transform: [{
                      rotate: glassRotate.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '360deg']
                      })
                    }]
                  }
                ]}
              >
                <LinearGradient
                  colors={[
                    'rgba(255, 255, 255, 0.4)',
                    'rgba(255, 255, 255, 0.1)',
                    'rgba(255, 255, 255, 0.4)'
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
              </Animated.View>
              
              <Animated.View
                style={[
                  styles.glassShimmer,
                  styles.glassShimmer2,
                  {
                    opacity: glassShimmer2.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.05, 0.2]
                    }),
                    transform: [{
                      rotate: glassRotate.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['180deg', '540deg']
                      })
                    }]
                  }
                ]}
              >
                <LinearGradient
                  colors={[
                    'rgba(168, 85, 247, 0.3)',
                    'rgba(139, 92, 246, 0.1)',
                    'rgba(168, 85, 247, 0.3)'
                  ]}
                  start={{ x: 1, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
              </Animated.View>
              
              {/* Content container */}
              <View style={styles.content}>
              {/* Close button */}
              <Pressable 
                style={styles.closeButton} 
                onPress={handleClosePress}
                hitSlop={20}
              >
                <X size={24} color="#fff" />
              </Pressable>
              
              {/* Match title */}
              <Animated.Text style={[
                styles.matchTitle,
                { opacity: titleOpacity }
              ]}>
                {matchTitle}
              </Animated.Text>
              
              {/* Profile Images Container */}
              <View style={styles.profilesContainer}>
                {/* Current User Profile (Left) */}
                <Animated.View
                  style={[
                    styles.profileImageWrapper,
                    styles.leftProfileWrapper,
                    styles.leftProfileBackground,
                    {
                      opacity: leftProfileOpacity,
                      transform: [{ scale: profileScale }]
                    }
                  ]}
                >
                  <EnhancedAvatar
                    user={user}
                    size="xl"
                    variant="circle"
                    style={styles.profileImage}
                  />
                </Animated.View>
                
                {/* Matched User Profile (Right) */}
                <Animated.View
                  style={[
                    styles.profileImageWrapper,
                    styles.rightProfileWrapper,
                    {
                      opacity: rightProfileOpacity,
                      transform: [{ scale: profileScale }]
                    }
                  ]}
                >
                  <EnhancedAvatar
                    user={{
                      id: internalProfile.id,
                      name: internalProfile.name,
                      profilePicture: internalProfile.image,
                      personalityType: internalProfile.personalityType,
                      photos: internalProfile.roomPhotos || []
                    } as any}
                    size="xl"
                    variant="circle"
                    style={styles.profileImage}
                  />
                </Animated.View>
              </View>
              
              {/* Match description */}
              <Animated.Text style={[
                styles.matchDescription,
                { opacity: contentOpacity }
              ]}>
                {matchDescription}
              </Animated.Text>
              
              {/* Send Message button */}
              <Animated.View style={{ opacity: contentOpacity, width: '100%' }}>
                <Pressable 
                  style={({pressed}) => [
                    styles.messageButton,
                    pressed && styles.buttonPressed
                  ]}
                  onPress={handleMessagePress}
                  android_ripple={{color: '#3c4bb0'}}
                >
                  <MessageSquare size={20} color="#fff" style={styles.messageIcon} />
                  <Text style={styles.messageButtonText}>Send Message</Text>
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
  glassContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
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
  glassBlur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
  },
  glassGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
  },
  glassBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  glassShimmer: {
    position: 'absolute',
    top: -50,
    left: -50,
    right: -50,
    bottom: -50,
    borderRadius: 50,
  },
  glassShimmer1: {
    transform: [{ scale: 1.2 }],
  },
  glassShimmer2: {
    transform: [{ scale: 0.8 }],
  },
  content: {
    backgroundColor: 'transparent',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    position: 'relative',
    zIndex: 10,
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    zIndex: 10,
    padding: 8,
  },
  matchTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 24,
    textAlign: 'center',
    marginTop: 16,
  },
  profilesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    height: 120,
    position: 'relative',
    width: '100%',
  },
  profileImageWrapper: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
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
  leftProfileWrapper: {
    left: 50,
  },
  leftProfileBackground: {
    backgroundColor: 'white',
  },
  rightProfileWrapper: {
    right: 50,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 45,
  },
  matchDescription: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.9,
  },
  messageButton: {
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
  messageIcon: {
    marginRight: 8,
  },
  messageButtonText: {
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

export default MatchNotification; 