import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, MapPin, DollarSign, Heart } from 'lucide-react-native';
import { useRoommateStore, RoommateProfile } from '../store/roommateStore';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 48) / 2; // 2 columns with 16px padding on sides and 16px gap

export default function SavedPlacesScreen() {
  const router = useRouter();
  const [savedPlaces, setSavedPlaces] = useState<RoommateProfile[]>([]);
  const { getSavedPlaces, unsavePlaceProfile } = useRoommateStore();
  
  // Function to load saved places
  const loadSavedPlaces = () => {
    const places = getSavedPlaces();
    setSavedPlaces(places);
    
    // Debug logging
    const { savedPlaces: savedPlaceIds, profiles } = useRoommateStore.getState();
    console.log(`[SavedPlaces] Loaded ${places.length} saved places`);
    console.log('[SavedPlaces] Saved place IDs:', savedPlaceIds);
    console.log('[SavedPlaces] Saved place profiles:', places.map(p => ({ id: p.id, name: p.name, location: p.location })));
  };
  
  useEffect(() => {
    // Load saved places on mount
    loadSavedPlaces();
  }, []);
  
  const handleBack = () => {
    router.back();
  };
  
  const handleRefresh = () => {
    // Force reload saved places
    loadSavedPlaces();
  };
  
  const handleUnsave = (placeId: string) => {
    unsavePlaceProfile(placeId);
    // Update the local state to remove the unsaved place
    setSavedPlaces(prevPlaces => prevPlaces.filter(place => place.id !== placeId));
  };
  
  const handleViewPlace = (placeId: string) => {
    router.push(`/place-detail?id=${placeId}`);
  };
  
  const renderPlaceItem = ({ item }: { item: RoommateProfile }) => {
    // Get location and price range
    const location = item.location || '';
    const budget = item.budget || '';
    
    // Get room type if available
    const roomType = item.roomType 
      ? item.roomType.charAt(0).toUpperCase() + item.roomType.slice(1) 
      : 'Room';
    
    // Get the first photo or use the profile image
    const photo = item.roomPhotos && item.roomPhotos.length > 0 
      ? item.roomPhotos[0] 
      : item.image;
    
    return (
      <View style={styles.placeCard}>
        <TouchableOpacity 
          style={styles.placeImageContainer}
          onPress={() => handleViewPlace(item.id)}
          activeOpacity={0.8}
        >
          <Image 
            source={{ uri: photo }} 
            style={styles.placeImage} 
            resizeMode="cover"
          />
          <TouchableOpacity 
            style={styles.heartButton}
            onPress={() => handleUnsave(item.id)}
          >
            <Heart size={18} color="#FFFFFF" fill="#FFFFFF" />
          </TouchableOpacity>
        </TouchableOpacity>
        
        <View style={styles.placeInfo}>
          <Text style={styles.placePrice}>{budget}</Text>
          <Text style={styles.placeType}>{roomType} Room</Text>
          
          <View style={styles.locationContainer}>
            <MapPin size={12} color="#6B7280" />
            <Text style={styles.locationText} numberOfLines={1}>{location}</Text>
          </View>
        </View>
      </View>
    );
  };
  
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Heart size={48} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>No Saved Places</Text>
      <Text style={styles.emptyText}>
        Places you save will appear here. Swipe right on places to save them!
      </Text>
      <TouchableOpacity 
        style={styles.browseButton}
        onPress={() => router.push('/')}
      >
        <Text style={styles.browseButtonText}>Browse Places</Text>
      </TouchableOpacity>
    </View>
  );
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Places</Text>
        
        {/* Add refresh button */}
        {__DEV__ && (
          <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <FlatList
        data={savedPlaces}
        renderItem={renderPlaceItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 16,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  placeCard: {
    width: COLUMN_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  placeImageContainer: {
    position: 'relative',
    width: '100%',
    height: 140,
  },
  placeImage: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  heartButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#4F46E5',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeInfo: {
    padding: 12,
  },
  placePrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  placeType: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    marginTop: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  browseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  refreshButton: {
    position: 'absolute',
    right: 16,
    backgroundColor: '#4F46E5',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
}); 