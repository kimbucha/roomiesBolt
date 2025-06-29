import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { ChevronRight, MapPin, Star } from 'lucide-react-native';
import { Place } from '../../types/places';

interface SimilarPlacesProps {
  places: Place[];
  onViewAll: () => void;
  onPlacePress: (placeId: string) => void;
}

export const SimilarPlaces: React.FC<SimilarPlacesProps> = ({
  places,
  onViewAll,
  onPlacePress,
}) => {
  if (!places || places.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Similar Places</Text>
        <TouchableOpacity 
          onPress={onViewAll}
          style={styles.viewAllButton}
          activeOpacity={0.7}
        >
          <Text style={styles.viewAllText}>View All</Text>
          <ChevronRight size={16} color="#4F46E5" />
        </TouchableOpacity>
      </View>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {places.map((place) => (
          <TouchableOpacity
            key={place.id}
            style={styles.placeCard}
            onPress={() => onPlacePress(place.id)}
            activeOpacity={0.9}
          >
            <View style={styles.imageContainer}>
              <Image source={{ uri: place.images[0] }} style={styles.image} />
              {place.isFeatured && (
                <View style={styles.featuredBadge}>
                  <Text style={styles.featuredText}>Featured</Text>
                </View>
              )}
              {place.isNew && (
                <View style={styles.newBadge}>
                  <Text style={styles.newText}>New</Text>
                </View>
              )}
              <View style={styles.priceTag}>
                <Text style={styles.priceText}>${place.price}/mo</Text>
              </View>
            </View>
            
            <View style={styles.contentContainer}>
              <Text style={styles.placeName} numberOfLines={1}>{place.title}</Text>
              
              <View style={styles.locationContainer}>
                <MapPin size={14} color="#6B7280" />
                <Text style={styles.locationText} numberOfLines={1}>
                  {place.location}
                </Text>
              </View>
              
              <View style={styles.detailsRow}>
                <View style={styles.feature}>
                  <Text style={styles.featureValue}>{place.bedrooms}</Text>
                  <Text style={styles.featureLabel}>bed</Text>
                </View>
                
                <View style={styles.separator} />
                
                <View style={styles.feature}>
                  <Text style={styles.featureValue}>{place.bathrooms}</Text>
                  <Text style={styles.featureLabel}>bath</Text>
                </View>
                
                <View style={styles.separator} />
                
                <View style={styles.ratingContainer}>
                  <Star size={14} color="#F59E0B" fill="#F59E0B" />
                  <Text style={styles.ratingText}>{place.rating.toFixed(1)}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
    marginRight: 4,
  },
  scrollContent: {
    paddingRight: 8,
  },
  placeCard: {
    width: 240,
    borderRadius: 12,
    marginRight: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    overflow: 'hidden',
  },
  imageContainer: {
    height: 140,
    width: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  featuredBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#4F46E5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  featuredText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  newBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  newText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  priceTag: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  priceText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  contentContainer: {
    padding: 12,
  },
  placeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
    flex: 1,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  featureValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  featureLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  separator: {
    width: 1,
    height: 16,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 4,
  },
});

export default SimilarPlaces; 