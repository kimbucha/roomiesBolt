import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  FlatList, 
  Image, 
  Dimensions, 
  ScrollView, 
  StatusBar,
  SafeAreaView,
  Platform,
} from 'react-native';
import { X, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react-native';

interface PhotoGalleryModalProps {
  isVisible: boolean;
  images: string[];
  initialIndex?: number;
  onClose: () => void;
}

const { width: screenWidth } = Dimensions.get('window');

export const PhotoGalleryModal: React.FC<PhotoGalleryModalProps> = ({
  isVisible,
  images,
  initialIndex = 0,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const flatListRef = useRef<FlatList>(null);
  const thumbsRef = useRef<ScrollView>(null);

  // Navigate to previous image
  const goToPrevious = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      scrollToIndex(newIndex);
    }
  };

  // Navigate to next image
  const goToNext = () => {
    if (currentIndex < images.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      scrollToIndex(newIndex);
    }
  };

  // Scroll main gallery to index
  const scrollToIndex = (index: number) => {
    if (flatListRef.current) {
      flatListRef.current.scrollToIndex({
        index,
        animated: true,
        viewOffset: 0,
      });
    }

    // Ensure thumbnail is visible in scroll view
    if (thumbsRef.current) {
      thumbsRef.current.scrollTo({
        x: index * 80 - screenWidth / 2 + 40,
        animated: true,
      });
    }
  };

  // Handle main flat list scroll end to update current index
  const handleScrollEnd = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(contentOffsetX / screenWidth);
    setCurrentIndex(newIndex);
  };

  return (
    <Modal
      animationType="fade"
      transparent={false}
      visible={isVisible}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <SafeAreaView style={styles.container}>
        {/* Header with close button, image count, and caption */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.imageCounter}>{currentIndex + 1} / {images.length}</Text>
          <View style={styles.spacer} />
        </View>

        {/* Main image gallery */}
        <View style={styles.galleryContainer}>
          <FlatList
            ref={flatListRef}
            data={images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={initialIndex}
            getItemLayout={(_, index) => ({
              length: screenWidth,
              offset: screenWidth * index,
              index,
            })}
            onMomentumScrollEnd={handleScrollEnd}
            renderItem={({ item }) => (
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: item }}
                  style={styles.image}
                  resizeMode="contain"
                />
              </View>
            )}
            keyExtractor={(_, index) => index.toString()}
          />

          {/* Navigation buttons overlaid on the main image */}
          <View style={styles.navigationContainer}>
            <TouchableOpacity 
              style={[styles.navButton, styles.leftButton, currentIndex === 0 && styles.disabledNavButton]}
              onPress={goToPrevious}
              disabled={currentIndex === 0}
            >
              <ChevronLeft 
                size={28} 
                color={currentIndex === 0 ? 'rgba(255, 255, 255, 0.4)' : '#FFFFFF'} 
              />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.navButton, styles.rightButton, currentIndex === images.length - 1 && styles.disabledNavButton]}
              onPress={goToNext}
              disabled={currentIndex === images.length - 1}
            >
              <ChevronRight 
                size={28} 
                color={currentIndex === images.length - 1 ? 'rgba(255, 255, 255, 0.4)' : '#FFFFFF'} 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Thumbnails gallery at the bottom */}
        <View style={styles.thumbnailsContainer}>
          <ScrollView
            ref={thumbsRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbnailsContent}
          >
            {images.map((image, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.thumbnailButton,
                  currentIndex === index && styles.activeThumbnail,
                ]}
                onPress={() => {
                  setCurrentIndex(index);
                  scrollToIndex(index);
                }}
              >
                <Image
                  source={{ uri: image }}
                  style={styles.thumbnail}
                  resizeMode="cover"
                />
                {currentIndex === index && (
                  <View style={styles.activeThumbnailOverlay} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    zIndex: 10,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageCounter: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  spacer: {
    width: 40,
  },
  galleryContainer: {
    flex: 1,
    position: 'relative',
  },
  imageContainer: {
    width: screenWidth,
    height: '100%',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  navigationContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  navButton: {
    height: '100%',
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  leftButton: {
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  rightButton: {
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  disabledNavButton: {
    opacity: 0.5,
  },
  thumbnailsContainer: {
    height: 90,
    backgroundColor: '#111111',
    paddingVertical: 10,
  },
  thumbnailsContent: {
    paddingHorizontal: 10,
  },
  thumbnailButton: {
    width: 60,
    height: 60,
    marginHorizontal: 5,
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  activeThumbnail: {
    borderColor: '#4F46E5',
  },
  activeThumbnailOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(79, 70, 229, 0.2)',
  },
});

export default PhotoGalleryModal; 