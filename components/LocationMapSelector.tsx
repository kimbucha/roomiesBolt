import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions,
  ActivityIndicator,
  Platform,
  Animated,
  Image
} from 'react-native';
import MapView, { Marker, Circle, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import { MapPin, Minus, Plus } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

// Default radius in miles
const DEFAULT_RADIUS = 20;
// Min and max radius values
const MIN_RADIUS = 5;
const MAX_RADIUS = 50;
// Step for radius adjustment
const RADIUS_STEP = 5;

interface LocationMapSelectorProps {
  onLocationSelected: (location: {
    latitude: number;
    longitude: number;
    address: string;
    radius: number;
  }) => void;
  initialRadius?: number;
}

const LocationMapSelector: React.FC<LocationMapSelectorProps> = ({
  onLocationSelected,
  initialRadius = DEFAULT_RADIUS
}) => {
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    address: string;
  } | null>(null);
  
  const [radius, setRadius] = useState(initialRadius);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const circleOpacity = useRef(new Animated.Value(0)).current;
  
  const mapRef = useRef<MapView>(null);
  
  // Convert miles to meters for the Circle component
  const radiusInMeters = radius * 1609.34;
  
  // Initial region (San Francisco as default)
  const [region, setRegion] = useState({
    latitude: 37.7749,
    longitude: -122.4194,
    latitudeDelta: 0.5, // Adjusted to show more area
    longitudeDelta: 0.5, // Adjusted to show more area
  });
  
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        setIsLoading(false);
        return;
      }
      
      try {
        const currentLocation = await Location.getCurrentPositionAsync({});
        
        // Get address from coordinates
        const reverseGeocode = await Location.reverseGeocodeAsync({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });
        
        if (reverseGeocode && reverseGeocode.length > 0) {
          const city = reverseGeocode[0].city || '';
          const region = reverseGeocode[0].region || '';
          const address = `${city}${region ? ', ' + region : ''}`;
          
          setLocation({
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
            address: address
          });
          
          setRegion({
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
            latitudeDelta: 0.5,
            longitudeDelta: 0.5,
          });
          
          // Notify parent component about the initial location
          onLocationSelected({
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
            address: address,
            radius: radius
          });
        }
      } catch (error) {
        setErrorMsg('Could not fetch location');
        console.error(error);
      }
      
      setIsLoading(false);
    })();
  }, []);

  // Update parent when radius changes
  useEffect(() => {
    if (location) {
      onLocationSelected({
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address,
        radius: radius
      });
    }
  }, [radius]);
  
  const handleMapPress = async (event: any) => {
    const { coordinate } = event.nativeEvent;
    
    try {
      // Get address from coordinates
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
      });
      
      if (reverseGeocode && reverseGeocode.length > 0) {
        const city = reverseGeocode[0].city || '';
        const region = reverseGeocode[0].region || '';
        const address = `${city}${region ? ', ' + region : ''}`;
        
        setLocation({
          latitude: coordinate.latitude,
          longitude: coordinate.longitude,
          address: address
        });
        
        // Notify parent component
        onLocationSelected({
          latitude: coordinate.latitude,
          longitude: coordinate.longitude,
          address: address,
          radius: radius
        });
      }
    } catch (error) {
      console.error('Error getting address:', error);
    }
  };
  
  const handleRegionChange = async (newRegion: any) => {
    // Only update when significant movement has occurred
    if (
      location && 
      (Math.abs(newRegion.latitude - location.latitude) > 0.01 ||
       Math.abs(newRegion.longitude - location.longitude) > 0.01)
    ) {
      try {
        // Get address from coordinates at the center of the new region
        const reverseGeocode = await Location.reverseGeocodeAsync({
          latitude: newRegion.latitude,
          longitude: newRegion.longitude,
        });
        
        if (reverseGeocode && reverseGeocode.length > 0) {
          const city = reverseGeocode[0].city || '';
          const region = reverseGeocode[0].region || '';
          const address = `${city}${region ? ', ' + region : ''}`;
          
          setLocation({
            latitude: newRegion.latitude,
            longitude: newRegion.longitude,
            address: address
          });
          
          // Notify parent component
          onLocationSelected({
            latitude: newRegion.latitude,
            longitude: newRegion.longitude,
            address: address,
            radius: radius
          });
        }
      } catch (error) {
        console.error('Error getting address:', error);
      }
    }
  };
  
  const handleLocateMe = async () => {
    setIsLoading(true);
    
    try {
      const currentLocation = await Location.getCurrentPositionAsync({});
      
      // Get address from coordinates
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
      
      if (reverseGeocode && reverseGeocode.length > 0) {
        const city = reverseGeocode[0].city || '';
        const region = reverseGeocode[0].region || '';
        const address = `${city}${region ? ', ' + region : ''}`;
        
        setLocation({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          address: address
        });
        
        // Animate to the new region
        mapRef.current?.animateToRegion({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          latitudeDelta: 0.5,
          longitudeDelta: 0.5,
        });
        
        // Notify parent component
        onLocationSelected({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          address: address,
          radius: radius
        });
      }
    } catch (error) {
      setErrorMsg('Could not fetch location');
      console.error(error);
    }
    
    setIsLoading(false);
  };

  const increaseRadius = () => {
    if (radius < MAX_RADIUS) {
      setRadius(prev => Math.min(prev + RADIUS_STEP, MAX_RADIUS));
    }
  };

  const decreaseRadius = () => {
    if (radius > MIN_RADIUS) {
      setRadius(prev => Math.max(prev - RADIUS_STEP, MIN_RADIUS));
    }
  };
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Getting your location...</Text>
      </View>
    );
  }
  
  if (errorMsg) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{errorMsg}</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={region}
          onPress={handleMapPress}
          onRegionChangeComplete={handleRegionChange}
          showsScale={true}
          showsCompass={true}
          provider={PROVIDER_DEFAULT}
        >
          {location && (
            <>
              <Marker
                coordinate={{
                  latitude: location.latitude,
                  longitude: location.longitude
                }}
                anchor={{ x: 0.5, y: 0.5 }}
                tracksViewChanges={false}
              >
                <View style={styles.customMarkerContainer}>
                  <View style={styles.markerIconBackground}>
                    <MapPin size={20} color="#6366f1" fill="#FFFFFF" />
                  </View>
                </View>
              </Marker>
              <Circle
                center={{
                  latitude: location.latitude,
                  longitude: location.longitude
                }}
                radius={radiusInMeters}
                strokeWidth={1.5}
                strokeColor="#6366f1"
                fillColor="rgba(99, 102, 241, 0.2)"
                zIndex={1}
              />
            </>
          )}
        </MapView>
        
        <View style={styles.overlay}>
          <Text style={styles.dragMapText}>Drag map to choose location</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.locateButton}
          onPress={handleLocateMe}
        >
          <MapPin size={18} color="#fff" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.radiusControlsContainer}>
        <MapPin size={18} color="#6366f1" />
        <Text style={styles.addressText}>
          {location ? location.address : 'Select a location on the map'}
        </Text>
        <View style={styles.radiusControls}>
          <TouchableOpacity 
            style={[
              styles.radiusButton, 
              radius <= MIN_RADIUS && styles.radiusButtonDisabled
            ]}
            onPress={decreaseRadius}
            disabled={radius <= MIN_RADIUS}
          >
            <Minus size={14} color={radius <= MIN_RADIUS ? "#d1d5db" : "#6366f1"} />
          </TouchableOpacity>
          <Text style={styles.milesText}>{radius} mi</Text>
          <TouchableOpacity 
            style={[
              styles.radiusButton,
              radius >= MAX_RADIUS && styles.radiusButtonDisabled
            ]}
            onPress={increaseRadius}
            disabled={radius >= MAX_RADIUS}
          >
            <Plus size={14} color={radius >= MAX_RADIUS ? "#d1d5db" : "#6366f1"} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    flex: 1,
  },
  mapContainer: {
    width: '100%',
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 10,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  customMarkerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerIconBackground: {
    backgroundColor: 'transparent',
  },
  overlay: {
    position: 'absolute',
    bottom: 8,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  dragMapText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: 'Poppins-Medium',
  },
  locateButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#6366f1',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  radiusControlsContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 10,
    marginTop: 2,
    marginBottom: 30,
  },
  addressText: {
    flex: 1,
    marginLeft: 6,
    fontSize: 13,
    color: '#1f2937',
    fontFamily: 'Poppins-Medium',
  },
  radiusControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 2,
  },
  radiusButton: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radiusButtonDisabled: {
    backgroundColor: '#f3f4f6',
  },
  milesText: {
    fontSize: 13,
    color: '#6366f1',
    fontFamily: 'Poppins-Medium',
    marginHorizontal: 6,
  },
  loadingContainer: {
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#6366f1',
    fontFamily: 'Poppins-Medium',
  },
  errorContainer: {
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    borderRadius: 12,
    padding: 20,
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    fontFamily: 'Poppins-Medium',
    textAlign: 'center',
  },
});

export default LocationMapSelector;
