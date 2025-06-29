import React, { useState, useRef, useMemo } from 'react';
import { View, Image, ScrollView, TouchableOpacity, Text, StyleSheet, Dimensions, Animated } from 'react-native';
import { ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface ImageGalleryProps {
  images: string[];
  onImagePress?: (index: number) => void;
  onViewAllPress: () => void;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ 
  images, 
  onImagePress, 
  onViewAllPress 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const mainScrollRef = useRef<ScrollView>(null);
  const thumbScrollRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  
  // Create animated values for each thumbnail
  const thumbnailAnims = useMemo(() => 
    images.map(() => new Animated.Value(0)), 
    [images]
  );

  // Helper function to animate thumbnails
  const animateThumbnails = (newIndex: number) => {
    // Fade out previous thumbnail
    Animated.timing(thumbnailAnims[currentIndex], {
      toValue: 0,
      duration: 150,
      useNativeDriver: true
    }).start();

    // Fade in new thumbnail
    Animated.timing(thumbnailAnims[newIndex], {
      toValue: 1,
      duration: 150,
      useNativeDriver: true
    }).start();
  };

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(contentOffsetX / width);
    
    if (newIndex !== currentIndex) {
      // Fade out current image
      Animated.timing(fadeAnim, {
        toValue: 0.5,
        duration: 150,
        useNativeDriver: true
      }).start(() => {
        setCurrentIndex(newIndex);
        // Fade in new image
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true
        }).start();
      });
      
      // Animate thumbnails
      animateThumbnails(newIndex);
      
      // Smoothly scroll thumbnail
      if (thumbScrollRef.current) {
        thumbScrollRef.current.scrollTo({
          x: newIndex * 60 - 80,
          animated: true
        });
      }
    }
  };
  
  const scrollToImage = (index: number) => {
    if (mainScrollRef.current) {
      // Fade out current image
      Animated.timing(fadeAnim, {
        toValue: 0.5,
        duration: 150,
        useNativeDriver: true
      }).start(() => {
        mainScrollRef.current?.scrollTo({ x: width * index, animated: true });
        
        // Fade in new image after a short delay
        setTimeout(() => {
          setCurrentIndex(index);
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true
          }).start();
        }, 100);
      });
      
      // Animate thumbnails
      animateThumbnails(index);
      
      // Scroll thumbnail into view
      if (thumbScrollRef.current) {
        thumbScrollRef.current.scrollTo({
          x: index * 60 - 80,
          animated: true
        });
      }
    }
  };
  
  const goNext = () => {
    if (currentIndex < images.length - 1) {
      scrollToImage(currentIndex + 1);
    }
  };
  
  const goPrev = () => {
    if (currentIndex > 0) {
      scrollToImage(currentIndex - 1);
    }
  };
  
  return (
    <View style={styles.container}>
      {/* Main Image */}
      <View style={styles.mainImageContainer}>
        <ScrollView
          ref={mainScrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={styles.mainImageScroll}
        >
          {images.map((image, index) => (
            <TouchableOpacity
              key={index} 
              style={styles.imageWrapper}
              onPress={() => onImagePress && onImagePress(index)}
              activeOpacity={0.9}
            >
              <Animated.Image
                source={{ uri: image }}
                style={[styles.mainImage, { opacity: fadeAnim }]}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        {/* Navigation Controls */}
        <View style={styles.controls}>
          {currentIndex > 0 && (
            <TouchableOpacity 
              style={[styles.navButton, styles.navButtonLeft]} 
              onPress={goPrev}
              activeOpacity={0.7}
            >
              <ChevronLeft size={20} color="#FFFFFF" />
            </TouchableOpacity>
          )}
          
          {currentIndex < images.length - 1 && (
            <TouchableOpacity 
              style={[styles.navButton, styles.navButtonRight]} 
              onPress={goNext}
              activeOpacity={0.7}
            >
              <ChevronRight size={20} color="#FFFFFF" />
            </TouchableOpacity>
          )}
          
          {/* Photo Indicator */}
          <View style={styles.indicatorContainer}>
            <View style={styles.photoIndicator}>
              <Text style={styles.indicatorText}>
                {currentIndex + 1}/{images.length}
              </Text>
            </View>
          </View>
          
          {/* View All Button */}
          <TouchableOpacity 
            style={styles.viewAllButton}
            onPress={onViewAllPress}
            activeOpacity={0.8}
          >
            <ImageIcon size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Thumbnails */}
      <ScrollView
        ref={thumbScrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.thumbnailContainer}
        contentContainerStyle={styles.thumbnailContent}
      >
        {images.map((image, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => scrollToImage(index)}
            style={styles.thumbnailButton}
            activeOpacity={0.7}
          >
            <Image
              source={{ uri: image }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
            <Animated.View 
              style={[
                styles.activeOverlay,
                { opacity: thumbnailAnims[index] }
              ]} 
            />
            <Animated.View
              style={[
                styles.thumbnailBorder,
                {
                  borderColor: '#4F46E5',
                  opacity: thumbnailAnims[index]
                }
              ]}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 300, // Reduced from 350 to 300
    position: 'relative',
    backgroundColor: '#F3F4F6',
    marginBottom: 20, // Add margin to separate from critical info card
  },
  mainImageContainer: {
    height: 250, // Reduced from 280 to 250
    position: 'relative',
  },
  mainImageScroll: {
    height: '100%',
  },
  imageWrapper: {
    width,
    height: 250, // Reduced from 280 to 250
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  controls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    marginTop: -18,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  navButtonLeft: {
    left: 12,
  },
  navButtonRight: {
    right: 12,
  },
  indicatorContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
  },
  photoIndicator: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  indicatorText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  viewAllButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 8,
    borderRadius: 20,
    zIndex: 10,
  },
  viewAllText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  thumbnailContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 5,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  thumbnailContent: {
    paddingHorizontal: 15,
  },
  thumbnailButton: {
    width: 60,
    height: 60,
    borderRadius: 4,
    marginRight: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  thumbnailBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 2,
    borderRadius: 4,
    backgroundColor: 'transparent'
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  activeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
  }
});

export default ImageGallery; 