import React, { useState, useRef } from 'react';
import { View, ScrollView, StyleSheet, Animated, Dimensions, StatusBar, TouchableOpacity } from 'react-native';
import { PlaceData } from '../../types/places';
import { ImageGallery } from './ImageGallery';
import { CriticalInfoCard } from './CriticalInfoCard';
import { HostProfileCard } from './HostProfileCard';
import { TabbedContent } from './TabbedContent';
import { LocationMapPreview } from './LocationMapPreview';
import { SimilarPlaces } from './SimilarPlaces'; 
import { ContactHostButton } from './ContactHostButton';
import { BookingFormModal } from './BookingFormModal';
import PhotoGalleryModal from './PhotoGalleryModal';

interface PlaceDetailScreenProps {
  place: PlaceData;
}

const { height } = Dimensions.get('window');
const HEADER_MAX_HEIGHT = height * 0.4;
const HEADER_MIN_HEIGHT = 0;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

export const PlaceDetailScreen: React.FC<PlaceDetailScreenProps> = ({ place }) => {
  const scrollY = useRef(new Animated.Value(0)).current;
  const [galleryHeight, setGalleryHeight] = useState(HEADER_MAX_HEIGHT);
  const [showPhotoGallery, setShowPhotoGallery] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false }
  );

  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  });

  const imageOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp',
  });

  const handleBookNow = () => {
    setShowBookingForm(true);
  };
  
  const handleOpenGallery = (index = 0) => {
    setSelectedPhotoIndex(index);
    setShowPhotoGallery(true);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
      
      <Animated.View
        style={[
          styles.header,
          { height: headerHeight, opacity: imageOpacity },
        ]}
      >
        <ImageGallery 
          images={place.images} 
          scrollY={scrollY}
          onGalleryPress={() => handleOpenGallery(0)}
        />
      </Animated.View>

      <Animated.ScrollView
        contentContainerStyle={styles.scrollViewContent}
        scrollEventThrottle={16}
        onScroll={handleScroll}
      >
        <View style={{ height: galleryHeight }} />
        
        <View style={styles.contentContainer}>
          <CriticalInfoCard 
            title={place.title}
            price={place.budget}
            location={place.location}
            roomType={place.roomType}
            onBookNowPress={handleBookNow}
          />
          
          <HostProfileCard 
            host={place.host}
            joinDate="January 2023"
            responseRate={98}
          />
          
          <TabbedContent 
            description={place.description}
            amenities={place.amenities}
            houseRules={place.houseRules}
          />
          
          <LocationMapPreview 
            location={place.location}
            coordinates={place.coordinates}
          />
          
          <SimilarPlaces 
            currentPlaceId={place.id} 
            currentLocation={place.location}
          />
        </View>
      </Animated.ScrollView>
      
      <ContactHostButton 
        scrollY={scrollY} 
        onPress={() => setShowBookingForm(true)}
        hostName={place.host.name}
      />
      
      <BookingFormModal
        visible={showBookingForm}
        onClose={() => setShowBookingForm(false)}
        placeTitle={place.title}
        placePrice={place.budget}
      />
      
      <PhotoGalleryModal
        visible={showPhotoGallery}
        photos={place.images}
        initialIndex={selectedPhotoIndex}
        onClose={() => setShowPhotoGallery(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
    zIndex: 1,
  },
  scrollViewContent: {
    paddingBottom: 32,
  },
  contentContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 80,
  },
}); 