import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MapPin, Navigation, Map } from 'lucide-react-native';

interface LocationMapPreviewProps {
  address: string;
  mapImageUrl?: string;
  distance?: string;
  lat: number;
  lng: number;
  onGetDirections: () => void;
  onViewMap: () => void;
}

export const LocationMapPreview: React.FC<LocationMapPreviewProps> = ({
  address,
  mapImageUrl,
  distance,
  lat,
  lng,
  onGetDirections,
  onViewMap,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Location</Text>
      
      <View style={styles.addressContainer}>
        <MapPin size={20} color="#4F46E5" />
        <View style={styles.addressTextContainer}>
          <Text style={styles.addressText}>{address}</Text>
          {distance && <Text style={styles.distanceText}>{distance} from campus</Text>}
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.mapContainer}
        activeOpacity={0.9}
        onPress={onViewMap}
      >
        {mapImageUrl ? (
          <Image 
            source={{ uri: mapImageUrl }} 
            style={styles.mapImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.mapPlaceholder}>
            <Map size={32} color="#4F46E5" />
            <Text style={styles.mapPlaceholderText}>View Map</Text>
          </View>
        )}
        
        <View style={styles.mapPinContainer}>
          <View style={styles.mapPinOuter}>
            <View style={styles.mapPinInner} />
          </View>
          <View style={styles.mapPinShadow} />
        </View>
        
        <View style={styles.coordinatesContainer}>
          <Text style={styles.coordinatesText}>
            {lat.toFixed(6)}, {lng.toFixed(6)}
          </Text>
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.directionsButton}
        onPress={onGetDirections}
        activeOpacity={0.7}
      >
        <Navigation size={20} color="#FFFFFF" />
        <Text style={styles.directionsButtonText}>Get Directions</Text>
      </TouchableOpacity>
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
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  addressTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  addressText: {
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 22,
  },
  distanceText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  mapContainer: {
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  mapPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4F46E5',
    marginTop: 8,
  },
  mapPinContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -12,
    marginTop: -24,
    alignItems: 'center',
  },
  mapPinOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4F46E5',
  },
  mapPinInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4F46E5',
  },
  mapPinShadow: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderLeftColor: 'transparent',
    borderRightWidth: 8,
    borderRightColor: 'transparent',
    borderTopWidth: 8,
    borderTopColor: '#4F46E5',
    marginTop: -2,
  },
  coordinatesContainer: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  coordinatesText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontFamily: 'monospace',
  },
  directionsButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 8,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  directionsButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});

export default LocationMapPreview; 