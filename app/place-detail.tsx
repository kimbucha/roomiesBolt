import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Animated,
  Share,
  Alert,
  Linking,
  Platform,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  SafeAreaView
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRoommateStore, RoommateProfile } from '../store/roommateStore';
import { ChevronLeft, Share2, Flag, Heart, MapPin } from 'lucide-react-native';

// Import our custom components for place detail
import Header from '../components/place-detail/Header';
import ImageGallery from '../components/place-detail/ImageGallery';
import CriticalInfoCard from '../components/place-detail/CriticalInfoCard';
import HostProfileCard from '../components/place-detail/HostProfileCard';
import TabbedContent from '../components/place-detail/TabbedContent';
import LocationMapPreview from '../components/place-detail/LocationMapPreview';
import ContactHostButton from '../components/place-detail/ContactHostButton';
import PhotoGalleryModal from '../components/place-detail/PhotoGalleryModal';
import { BookingFormModal, BookingFormData } from '../components/place-detail/BookingFormModal';
import { Place, Amenity, Rule } from '../types/places';

const { width } = Dimensions.get('window');

export default function PlaceDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  
  // State for the place detail view
  const [place, setPlace] = useState<RoommateProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [showGallery, setShowGallery] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  
  // Ref and animated values
  const scrollY = useRef(new Animated.Value(0)).current;
  
  // Store hooks
  const { 
    getById, 
    savedPlaces, 
    savePlaceProfile, 
    unsavePlaceProfile
  } = useRoommateStore();
  
  useEffect(() => {
    if (id) {
      // Fetch place details
      const placeProfile = getById(id as string);
      
      if (placeProfile) {
        setPlace(placeProfile);
        // Check if this place is already saved
        setIsSaved(savedPlaces.includes(placeProfile.id));
      }
      
      setIsLoading(false);
    }
  }, [id, getById, savedPlaces]);
  
  const handleBack = () => {
    router.back();
  };
  
  const toggleSave = () => {
    if (!place) return;
    
    if (isSaved) {
      unsavePlaceProfile(place.id);
      setIsSaved(false);
    } else {
      savePlaceProfile(place.id);
      setIsSaved(true);
    }
  };
  
  const handleShare = async () => {
    if (!place) return;
    
    try {
      await Share.share({
        message: `Check out ${place.name}'s place in ${place.location}: ${place.budget} per month`,
        url: `roomies://place/${place.id}`,
        title: `${place.name}'s Place on Roomies`
      });
    } catch (error) {
      console.error('Error sharing place:', error);
    }
  };
  
  const handleReport = () => {
    Alert.alert(
      "Report Place",
      "Are you sure you want to report this listing?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Report", 
          onPress: () => {
            Alert.alert(
              "Thank you",
              "We've received your report and will review this listing."
            );
          },
          style: "destructive" 
        }
      ]
    );
  };
  
  const handleContactHost = () => {
    // Navigate to messaging screen with the host's information
    if (!place) return;
    
    router.push({
      pathname: "/chat-redirect",
      params: { 
        userId: place.id,
        name: place.name,
        image: place.image,
      }
    });
  };
  
  const handleViewAllPhotos = (index = 0) => {
    setPhotoIndex(index);
    setShowGallery(true);
  };
  
  const handleViewMap = () => {
    // Implement map view navigation
    Alert.alert("Map View", "Full map functionality would be implemented here.");
  };
  
  const handleGetDirections = () => {
    if (!place) return;
    
    const address = encodeURIComponent(place.location);
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const url = Platform.select({
      ios: `${scheme}${address}`,
      android: `${scheme}${address}`
    });
    
    if (url) {
      Linking.openURL(url);
    }
  };
  
  const handleViewHostProfile = () => {
    if (!place || !place.id) return; // Ensure place and host ID exist
    // Navigate to the host's profile screen using their ID (place.id seems to be host id here?)
    router.push(`/(app)/profile/${place.id}`); 
  };
  
  const handleBookNowPress = () => {
    setShowBookingForm(true);
  };
  
  const handleBookingFormSubmit = (formData: BookingFormData) => {
    // Implementation for submitting booking form
    console.log('Booking form submitted', formData);
  };
  
  // Fix price display
  const formatPrice = (priceStr: string) => {
    const numericPrice = parseInt(priceStr.replace(/[^0-9]/g, ''));
    if (isNaN(numericPrice)) return '$1,000';
    
    // Format with commas
    return `$${numericPrice.toLocaleString()}`;
  };
  
  // Add helper function for amenity descriptions
  const getAmenityDescription = (amenity: string): string => {
    switch (amenity.toLowerCase()) {
      case 'washer/dryer':
        return 'In-unit laundry available';
      case 'parking':
        return 'Free street parking available';
      case 'gym':
        return 'Access to building fitness center';
      case 'wifi':
      case 'internet':
        return 'High-speed internet included';
      case 'kitchen':
        return 'Equipped with modern appliances';
      case 'air conditioning':
      case 'ac':
        return 'Central AC throughout the unit';
      case 'pool':
        return 'Shared swimming pool';
      case 'pet friendly':
        return 'Dogs and cats allowed';
      case 'balcony':
        return 'Private outdoor space';
      default:
        return '';
    }
  };
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Loading place details...</Text>
      </View>
    );
  }
  
  if (!place) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Place not found</Text>
        <TouchableOpacity onPress={handleBack} style={styles.backButtonLink}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  // Get photos from place data or use fallback
  const photos = place.roomPhotos || [
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
  ];
  
  // Sample house rules for demonstration
  const rules: Rule[] = [
    { title: "No smoking inside the apartment", description: "Smoking is not allowed in any part of the property", allowed: false },
    { title: "Quiet hours after 10 PM on weekdays", description: "Please be quiet between 10PM and 7AM", allowed: true },
    { title: "Guests must be approved in advance", description: "Contact host before bringing guests", allowed: true },
    { title: "Shared cleaning responsibilities", description: "All tenants share cleaning duties", allowed: true }
  ];
  
  // Create lease terms object with better formatting
  const leaseTerms = {
    duration: place.leaseDuration || '12 months',
    moveInDate: place.moveInDate || 'Flexible',
    flexibleStay: place.flexibleStay || false,
    leaseType: place.leaseType || 'Standard',
    securityDeposit: `$${Math.floor(parseInt(place.budget.replace(/[^0-9]/g, '')) / 2).toLocaleString()}`,
    utilitiesIncluded: place.utilitiesIncluded || ['Water', 'Internet'],
    petPolicy: place.petPolicy || 'No pets allowed',
    subletAllowed: place.subletAllowed || false
  };
  
  // Define a better set of amenities with descriptions
  const amenities: Amenity[] = ((place?.amenities && place.amenities.length > 0) 
    ? place.amenities.map(amenity => ({
        type: amenity.toLowerCase(),
        title: amenity,
        description: getAmenityDescription(amenity)
      }))
    : [
        { type: 'washer/dryer', title: 'Washer/Dryer', description: 'In-unit laundry available' },
        { type: 'parking', title: 'Parking', description: 'Free street parking available' },
        { type: 'gym', title: 'Gym', description: 'Access to building fitness center' },
        { type: 'wifi', title: 'High-Speed WiFi', description: 'Gigabit internet included' },
        { type: 'air conditioning', title: 'Air Conditioning', description: 'Central AC throughout the unit' },
        { type: 'kitchen', title: 'Full Kitchen', description: 'Equipped with modern appliances' },
      ]);
  
  // Assume `host` object is derived or part of `place`
  const hostData = {
     id: place.id, 
     name: place.name || 'Host', 
     avatar: place.image, 
     verified: place.verified || false, 
  };

  // Assume joinDate and responseRate are derived or fetched
  const joinDate = 'Sep 2021'; // Placeholder
  const responseRate = 95; // Placeholder
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <Header 
        title={`${place.name}'s Place`}
        onBack={handleBack}
        onShare={handleShare}
        onReport={handleReport}
        isSaved={isSaved}
        onToggleSave={toggleSave}
      />
      
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={(event) => {
          const offsetY = event.nativeEvent.contentOffset.y;
          scrollY.setValue(offsetY);
        }}
        scrollEventThrottle={16}
      >
        <ImageGallery 
          images={photos}
          onImagePress={handleViewAllPhotos}
          onViewAllPress={() => setShowGallery(true)}
        />
        
        {/* Reduced padding for thumbnails */}
        <View style={styles.thumbnailPadding} />
        
        <CriticalInfoCard 
          title={`${place.name}'s Place`}
          price={formatPrice(place.budget)}
          location={place.location}
          roomType={place.roomType || 'private'}
          isAvailable={true}
          moveInDate={place.moveInDate || 'October 15, 2023'}
          leaseLength={place.leaseDuration || '9 months'}
          bedCount={place.bedrooms || 1}
          bathCount={place.bathrooms || 1}
          isFurnished={place.isFurnished || false}
        />
        
        {/* Spacer between cards */}
        <View style={styles.cardSpacer} />
        
        <TabbedContent 
          description={place.bio || 'No description available'}
          amenities={amenities}
          rules={rules}
        />
        
        {/* Spacer between cards */}
        <View style={styles.cardSpacer} />
        
        <HostProfileCard 
           host={hostData}
           joinDate={joinDate}
           responseRate={responseRate}
           onViewProfile={handleViewHostProfile}
        />
        
        {/* Spacer between cards */}
        <View style={styles.cardSpacer} />
        
        <LocationMapPreview 
          address={place.location || 'Near campus'}
          lat={37.8715}
          lng={-122.2730}
          distance="0.5 miles from campus"
          onViewMap={handleViewMap}
          onGetDirections={handleGetDirections}
        />
        
        {/* Bottom padding to ensure content isn't hidden behind floating button */}
        <View style={styles.bottomPadding} />
      </ScrollView>
      
      <ContactHostButton 
        hostName={place.name}
        onPress={handleContactHost}
        isPrimary={true}
        isFloating={true}
      />
      
      <PhotoGalleryModal 
        isVisible={showGallery}
        images={photos}
        initialIndex={photoIndex}
        onClose={() => setShowGallery(false)}
      />
      
      <BookingFormModal
        isVisible={showBookingForm}
        placeTitle={`${place.name}'s Place`}
        pricePerMonth={parseInt(place.budget.replace(/[^0-9]/g, '')) || 1000}
        onClose={() => setShowBookingForm(false)}
        onSubmit={handleBookingFormSubmit}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  bottomPadding: {
    height: 120,
  },
  thumbnailPadding: {
    height: 20, // Reduced from 30 to 20 for even more compact layout
  },
  cardSpacer: {
    height: 16, // Consistent spacing between all cards
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    fontSize: 16,
    color: '#4B5563',
    marginTop: 12,
  },
  backButtonLink: {
    marginTop: 16,
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#4F46E5',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  leaseSummary: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  leaseSummaryText: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
  },
  leaseTermsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  leaseTermColumn: {
    flex: 1,
    paddingHorizontal: 8,
  },
  columnHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 12,
  },
  leaseTermItem: {
    marginBottom: 16,
  },
  leaseTermLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 4,
  },
  leaseTermValue: {
    fontSize: 16,
    fontWeight: '400',
    color: '#1F2937',
  },
  viewLeaseButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  viewLeaseButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4F46E5',
  },
}); 