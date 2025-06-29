import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  Animated, 
  Dimensions,
  Vibration,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  StyleSheet
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { X, ChevronUp, Info } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { usePreferencesStore } from '../../store/preferencesStore';
import { useDebugLogger } from './utils/loggerUtils';

export interface DetailCardProps {
  images: string[];
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onSuperLike: () => void;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  renderMainContent: () => React.ReactNode;
  renderDetailContent: () => React.ReactNode;
  renderHeaderContent?: () => React.ReactNode;
  id: string; // Unique identifier for the card
  showDebugOverlay?: boolean;
}

/**
 * A modular implementation of the BaseDetailCard component
 * Maintains the exact same appearance and functionality
 */
export const DetailCard: React.FC<DetailCardProps> = ({
  images,
  onSwipeLeft,
  onSwipeRight,
  onSuperLike,
  expanded: initialExpanded = false,
  onExpandedChange,
  renderMainContent,
  renderDetailContent,
  renderHeaderContent,
  id,
  showDebugOverlay = false
}) => {
  // Use the user preferences from the preferences store
  const userPreferences = usePreferencesStore(state => state.userPreferences);
  // Get vibration from notifications instead since vibrationEnabled doesn't exist
  const vibrationEnabled = userPreferences.notifications.messages; 
  
  // State for image handling
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  // Track which images have been preloaded
  const [preloadedImages, setPreloadedImages] = useState<{[key: string]: boolean}>({});
  const [showFullInfo, setShowFullInfo] = useState(initialExpanded);
  // Add state to track when the detail sheet is animating out
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const infoSlideAnim = useRef(new Animated.Value(initialExpanded ? 0 : 350)).current;
  const highlightOpacity = useRef(new Animated.Value(0)).current;
  const buttonRotation = useRef(new Animated.Value(initialExpanded ? 1 : 0)).current;
  const backdropOpacity = useRef(new Animated.Value(initialExpanded ? 1 : 0)).current;
  
  // Refs for long press handling
  const longPressTimeout = useRef<NodeJS.Timeout | null>(null);
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const holdAnimationRef = useRef<NodeJS.Timeout | null>(null);
  
  // Scroll handling
  const scrollViewRef = useRef<ScrollView>(null);
  const [scrollOffset, setScrollOffset] = useState(0);
  
  // Initialize logger
  const logger = useDebugLogger();
  
  // Process images
  const photosArray = images || [];
  const imageToShow = currentImageIndex < photosArray.length 
    ? photosArray[currentImageIndex]
    : photosArray[0];

  // Define height constants for animations and calculations
  const deviceHeight = Dimensions.get('window').height;
  // Calculate the detail sheet height - adjust to show content up to Lifestyle section
  const detailSheetHeight = Math.min(deviceHeight * 0.5, 450);
  
  // Preload all images when component mounts
  useEffect(() => {
    if (photosArray.length > 0) {
      // Mark the first image as loaded immediately to avoid initial flash
      setPreloadedImages(prev => ({...prev, [photosArray[0]]: true}));
      
      // Preload all other images
      photosArray.forEach(imageUrl => {
        if (imageUrl) {
          Image.prefetch(imageUrl).then(() => {
            setPreloadedImages(prev => ({...prev, [imageUrl]: true}));
          }).catch(err => {
            console.log('Error preloading image:', imageUrl, err);
          });
        }
      });
    }
  }, [photosArray]);
  
  // UseEffect to initialize animation value based on expanded state
  useEffect(() => {
    if (initialExpanded !== showFullInfo) {
      setShowFullInfo(initialExpanded);
      // Set initial animation value based on visibility
      infoSlideAnim.setValue(initialExpanded ? 0 : detailSheetHeight);
      buttonRotation.setValue(initialExpanded ? 1 : 0);
    }
  }, [initialExpanded]);
  
  // Navigate to the next image - with immediate transition
  const nextImage = () => {
    if (photosArray.length > 1) {
      // Immediately update the index without any delay or animation
      setCurrentImageIndex((currentImageIndex + 1) % photosArray.length);
    }
  };
  
  // Navigate to the previous image - with immediate transition
  const prevImage = () => {
    if (photosArray.length > 1) {
      // Immediately update the index without any delay or animation
      setCurrentImageIndex((currentImageIndex - 1 + photosArray.length) % photosArray.length);
    }
  };
  
  // Toggle the info sheet
  const toggleFullInfo = () => {
    if (showFullInfo) {
      hideFullInfo();
    } 
    else {
      // Provide haptic feedback
      if (vibrationEnabled) {
        if (Platform.OS === 'ios') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } else {
          Vibration.vibrate(20);
        }
      }
      
      // First set initial position - ensure it's fully off-screen
      infoSlideAnim.setValue(detailSheetHeight);
      // Then update state
      setShowFullInfo(true);
      onExpandedChange?.(true);
      
      // Animate button, slide, and backdrop opacity IN
      Animated.parallel([
        Animated.timing(buttonRotation, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(infoSlideAnim, { 
          toValue: 0, 
          useNativeDriver: true, 
          tension: 50, 
          friction: 12 // Increased friction from 9 to reduce bounce
        }),
        Animated.timing(backdropOpacity, { toValue: 1, duration: 300, useNativeDriver: true })
      ]).start();
    }
  };

  // Hide the detail sheet
  const hideFullInfo = () => {
    if (showFullInfo) {
      if (vibrationEnabled) {
        if (Platform.OS === 'ios') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } else {
          Vibration.vibrate(30);
        }
      }
      
      // Update state immediately so the main card's info overlay appears right away
      setShowFullInfo(false);
      onExpandedChange?.(false);
      
      // Keep the detail sheet visible during animation using a local state
      setIsAnimatingOut(true);
      
      // Animate button, slide, and backdrop opacity OUT
      Animated.parallel([
        Animated.timing(buttonRotation, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(infoSlideAnim, { toValue: detailSheetHeight, duration: 300, useNativeDriver: true }),
        Animated.timing(backdropOpacity, { toValue: 0, duration: 300, useNativeDriver: true })
      ]).start(() => {
        setIsAnimatingOut(false);
      });
    }
  };

  // Handle press in for hold animation only (not long press detection)
  const handlePressIn = () => {
    // Start hold animation
    setIsHolding(true);
    setHoldProgress(0);
    
    // Animate hold progress
    let progress = 0;
    const animateHold = () => {
      progress += 0.05;
      setHoldProgress(Math.min(1, progress));
      
      if (progress < 1 && isHolding) {
        holdAnimationRef.current = setTimeout(animateHold, 25);
      }
    };
    
    holdAnimationRef.current = setTimeout(animateHold, 25);
  };

  // Handle press out to cancel hold animation
  const handlePressOut = () => {
    // Clear hold animation
    setIsHolding(false);
    setHoldProgress(0);
    
    if (holdAnimationRef.current) {
      clearTimeout(holdAnimationRef.current);
      holdAnimationRef.current = null;
    }
  };

  // Handle scroll events
  const handleScroll = (event: any) => {
    const offset = event.nativeEvent.contentOffset.y;
    setScrollOffset(offset);
  };

  // Handle image press for navigation
  const handleImagePress = (event: any) => {
    // Get touch position
    const { locationX } = event.nativeEvent;
    const screenWidth = Dimensions.get('window').width;
    
    // Split the screen down the middle
    // If touch is on the left half, go to previous image
    if (locationX < screenWidth / 2) {
      prevImage();
      
      // Provide subtle haptic feedback for image navigation
      if (vibrationEnabled) {
        if (Platform.OS === 'ios') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } else {
          Vibration.vibrate(10);
        }
      }
    }
    // If touch is on the right half, go to next image
    else {
      nextImage();
      
      // Provide subtle haptic feedback for image navigation
      if (vibrationEnabled) {
        if (Platform.OS === 'ios') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } else {
          Vibration.vibrate(10);
        }
      }
    }
  };

  if (!photosArray.length) {
    return (
      <View className="flex-1 w-full h-[calc(100vh-150px)]">
        <View className="flex-1 rounded-none overflow-hidden bg-white">
          <Text className="font-[Poppins-Medium] text-lg text-gray-500 text-center">
            No images available
          </Text>
        </View>
      </View>
    );
  }
  
  return (
    <View style={styles.cardContainer}>
      <View style={styles.mainCardContent} pointerEvents={showFullInfo ? 'none' : 'auto'}>
        <Animated.View 
          className="flex-1 overflow-hidden bg-white"
          style={{ opacity: fadeAnim, borderRadius: 16 }}
        >
          {/* Main image */}
          <Image
            source={{ uri: imageToShow }}
            className="w-full h-full object-cover"
            onLoad={() => {
              setImageLoaded(true);
            }}
            onLoadStart={() => setImageLoaded(false)}
            key="main-image"
            fadeDuration={0}
          />
          
          {/* Highlight overlay for feedback */}
          <Animated.View 
            className="absolute top-0 left-0 right-0 bottom-0 bg-black z-15"
            style={{ opacity: highlightOpacity }}
            pointerEvents="none"
          />
          
          {/* Touchable overlay for image navigation and long press */}
          <TouchableWithoutFeedback
            onPress={handleImagePress}
            onLongPress={toggleFullInfo}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            delayLongPress={300}
          >
            <View className="absolute top-0 left-0 right-0 bottom-0 z-20" />
          </TouchableWithoutFeedback>
          
          {/* Photo navigation dots - MOVED FROM BOTTOM TO TOP MIDDLE */}
          {photosArray.length > 1 && !showFullInfo && (
            <View className="absolute top-5 flex-row justify-center w-full z-20" pointerEvents="none">
              {photosArray.map((_: any, index: number) => (
                <View 
                  key={index} 
                  className={`w-2 h-2 rounded-full bg-white/50 mx-1 ${
                    index === currentImageIndex % photosArray.length 
                      ? 'bg-white w-2.5 h-2.5' 
                      : ''
                  }`}
                />
              ))}
            </View>
          )}

          {/* Bottom gradient - ONLY SHOW WHEN DETAIL SHEET IS NOT VISIBLE OR ANIMATING OUT */}
          {!showFullInfo && (
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.8)']}
              className="absolute bottom-0 left-0 right-0 h-48 z-10"
              pointerEvents="none"
            />
          )}
          
          {/* Main content - ONLY SHOW WHEN DETAIL SHEET IS NOT VISIBLE OR ANIMATING OUT */}
          {!showFullInfo && (
            <View className="absolute bottom-0 left-0 right-0 p-4 z-20">
              {renderMainContent()}
            </View>
          )}
        </Animated.View>
      </View>

      {/* Backdrop (Only rendered when sheet is potentially visible) */}
      {(showFullInfo || isAnimatingOut) && (
        <TouchableWithoutFeedback onPress={hideFullInfo} accessible={false}>
          <Animated.View 
            style={[styles.backdrop, { opacity: backdropOpacity }]} 
          />
        </TouchableWithoutFeedback>
      )}

      {/* Detail Info Sheet (Animated) */}
      {(showFullInfo || isAnimatingOut) && (
        <Animated.View
          style={[
            styles.infoContainer,
            {
              transform: [{ translateY: infoSlideAnim }],
              height: detailSheetHeight,
            },
          ]}
        >
          <View style={{ flex: 1 }}>
            {/* Sticky Header Section with white background */}
            <View style={styles.sheetHeader}>
              {renderHeaderContent && renderHeaderContent()}
            </View>
            
            {/* Scrollable content area */}
            <ScrollView
              ref={scrollViewRef}
              style={styles.infoScrollView}
              contentContainerStyle={{ paddingBottom: 100 }}
              showsVerticalScrollIndicator={true}
              bounces={true}
              overScrollMode="auto"
              scrollEventThrottle={16}
              onScroll={handleScroll}
            >
              {/* Render the detail content */}
              <View style={{ marginTop: 8 }}>
                {renderDetailContent()}
              </View>
            </ScrollView>
          </View>
        </Animated.View>
      )}

      {/* FAB (Moved here, sibling to main content, backdrop, sheet) */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={toggleFullInfo}
        style={styles.fabContainer} // zIndex: 50 keeps it on top
      >
        <Animated.View style={[ styles.fabIconWrapper, { transform: [{ rotate: buttonRotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '90deg'] }) }] } ]}>
          <Animated.View style={{ opacity: buttonRotation.interpolate({ inputRange: [0, 0.5], outputRange: [1, 0], extrapolate: 'clamp' }) }}>
            <Info size={20} color="#ffffff" />
          </Animated.View>
        </Animated.View>
        
        <Animated.View style={[ styles.fabIconWrapper, { transform: [{ rotate: buttonRotation.interpolate({ inputRange: [0, 1], outputRange: ['-90deg', '0deg'] }) }], opacity: buttonRotation.interpolate({ inputRange: [0.5, 1], outputRange: [0, 1], extrapolate: 'clamp' }) } ]}>
          <X size={20} color="#ffffff" />
        </Animated.View>
      </TouchableOpacity>

      {/* Debug overlay - only visible in development */}
      {showDebugOverlay && (
        <View 
          style={{
            position: 'absolute',
            top: 100,
            right: 10,
            backgroundColor: 'rgba(0,0,0,0.8)',
            padding: 10,
            borderRadius: 5,
            zIndex: 9999,
            borderWidth: 1,
            borderColor: '#666'
          }}
        >
          <Text style={{ color: '#fff', fontSize: 12, marginBottom: 5 }}>
            Debug Info:
          </Text>
          <Text style={{ color: '#fff', fontSize: 10 }}>
            Image: {currentImageIndex + 1}/{photosArray.length}
          </Text>
          <Text style={{ color: '#fff', fontSize: 10 }}>
            Detail Sheet: {showFullInfo ? 'Visible' : 'Hidden'}
          </Text>
          <Text style={{ color: '#fff', fontSize: 10 }}>
            Animating Out: {isAnimatingOut ? 'Yes' : 'No'}
          </Text>
          <Text style={{ color: '#fff', fontSize: 10 }}>
            Scroll Offset: {scrollOffset.toFixed(1)}
          </Text>
          <Text style={{ color: '#fff', fontSize: 10 }}>
            Hold Progress: {(holdProgress * 100).toFixed(0)}%
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    flex: 1,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#eee',
  },
  mainCardContent: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 30,
  },
  infoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
    overflow: 'hidden',
    zIndex: 40,
  },
  sheetHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(200, 200, 200, 0.5)',
    backgroundColor: 'white',
    zIndex: 41,
  },
  infoScrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F46E5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 50,
  },
  fabIconWrapper: {
    position: 'absolute',
  },
}); 