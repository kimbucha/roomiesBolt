import React, { useState, useRef } from 'react';
import { 
  View, 
  Image, 
  TouchableWithoutFeedback,
  Animated,
  StyleSheet,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ImageCarouselProps {
  images: string[];
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSuperLike?: () => void;
  onImagePress?: () => void;
}

/**
 * A component for displaying and navigating through images
 */
export const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images,
  onSwipeLeft,
  onSwipeRight,
  onSuperLike,
  onImagePress
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const highlightOpacity = useRef(new Animated.Value(0)).current;
  const longPressTimeout = useRef<NodeJS.Timeout | null>(null);
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const holdAnimationRef = useRef<NodeJS.Timeout | null>(null);
  
  const photosArray = images || [];
  const imageToShow = currentImageIndex < photosArray.length 
    ? photosArray[currentImageIndex]
    : photosArray[0];
  
  // Navigate to the next image
  const nextImage = () => {
    if (photosArray.length > 1) {
      setCurrentImageIndex((currentImageIndex + 1) % photosArray.length);
    }
  };
  
  // Navigate to the previous image
  const prevImage = () => {
    if (photosArray.length > 1) {
      setCurrentImageIndex((currentImageIndex - 1 + photosArray.length) % photosArray.length);
    }
  };
  
  const handleImagePress = (event: any) => {
    const screenWidth = Dimensions.get('window').width;
    const x = event.nativeEvent.locationX;
    
    // If press is on the left 1/3 of the screen, go to previous image
    if (x < screenWidth / 3) {
      prevImage();
    } 
    // If press is on the right 1/3 of the screen, go to next image
    else if (x > (screenWidth * 2) / 3) {
      nextImage();
    } 
    // If press is in the middle 1/3 of the screen, handle the tap
    else if (onImagePress) {
      onImagePress();
    }
  };
  
  // Handle long press for super like
  const handleLongPressIn = () => {
    if (!onSuperLike) return;
    
    setIsHolding(true);
    setHoldProgress(0);
    
    // Start the hold animation
    let progress = 0;
    const totalTime = 1000; // 1 second to complete
    const interval = 16; // ~60fps
    const steps = totalTime / interval;
    const increment = 1 / steps;
    
    holdAnimationRef.current = setInterval(() => {
      progress += increment;
      setHoldProgress(progress);
      
      if (progress >= 1) {
        // Complete the hold action
        if (holdAnimationRef.current) {
          clearInterval(holdAnimationRef.current);
          holdAnimationRef.current = null;
        }
        
        // Trigger super like
        onSuperLike();
        
        // Show the highlight effect
        Animated.sequence([
          Animated.timing(highlightOpacity, {
            toValue: 0.7,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(highlightOpacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
        
        setIsHolding(false);
        setHoldProgress(0);
      }
    }, interval);
    
    // Set a timeout to trigger the super like after 1 second
    longPressTimeout.current = setTimeout(() => {
      if (onSuperLike) {
        onSuperLike();
      }
    }, 1000);
  };
  
  const handleLongPressOut = () => {
    // Cancel the long press
    if (longPressTimeout.current) {
      clearTimeout(longPressTimeout.current);
      longPressTimeout.current = null;
    }
    
    // Cancel the hold animation
    if (holdAnimationRef.current) {
      clearInterval(holdAnimationRef.current);
      holdAnimationRef.current = null;
    }
    
    setIsHolding(false);
    setHoldProgress(0);
  };
  
  // Render the hold progress indicator
  const renderHoldProgress = () => {
    if (!isHolding || holdProgress === 0) return null;
    
    return (
      <View style={styles.holdProgressContainer}>
        <View 
          style={[
            styles.holdProgress, 
            { width: `${holdProgress * 100}%` }
          ]} 
        />
      </View>
    );
  };
  
  return (
    <View style={styles.container}>
      <TouchableWithoutFeedback
        onPress={handleImagePress}
        onLongPress={() => {}}
        delayLongPress={200}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: imageToShow }}
            style={styles.image}
          />
          
          {/* Gradient overlay at the bottom */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.gradient}
          />
          
          {/* Super like highlight overlay */}
          <Animated.View 
            style={[
              styles.highlightOverlay,
              { opacity: highlightOpacity }
            ]}
          />
          
          {/* Hold progress indicator */}
          {renderHoldProgress()}
          
          {/* Image navigation indicators */}
          {photosArray.length > 1 && (
            <View style={styles.indicators}>
              {photosArray.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.indicator,
                    index === currentImageIndex && styles.activeIndicator
                  ]}
                />
              ))}
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  imageContainer: {
    flex: 1,
    position: 'relative',
  },
  image: {
    flex: 1,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    backgroundColor: '#000',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
  },
  indicators: {
    position: 'absolute',
    top: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    zIndex: 10,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 3,
  },
  activeIndicator: {
    backgroundColor: '#FFFFFF',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  highlightOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#4F46E5', // Indigo color for super like
  },
  holdProgressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    zIndex: 10,
  },
  holdProgress: {
    height: '100%',
    backgroundColor: '#4F46E5', // Indigo color
  },
}); 