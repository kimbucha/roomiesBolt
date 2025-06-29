import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  ScrollView,
  Platform,
  SafeAreaView,
  Image,
  Animated,
  Dimensions,
  PanResponder,
  Linking
} from 'react-native';
import { X, MapPin, DollarSign, Calendar, Bed, Bath, Check, ArrowRight, Heart, Share2, Flag } from 'lucide-react-native';
import { Amenity, Rule } from '../../../types/places';
import { RoommateProfile } from '../../../store/roommateStore';

interface PlaceInfoSheetProps {
  isVisible: boolean;
  place: RoommateProfile;
  onClose: () => void;
  onContactHost: () => void;
  onBookNow?: () => void;
  onToggleSave: () => void;
  onShare?: () => void;
  onReport?: () => void;
  isSaved: boolean;
}

const { height, width } = Dimensions.get('window');
const SHEET_HEIGHT = height * 0.9; // Increased height for more content
const SNAP_POINTS = [0, SHEET_HEIGHT];

// Default house rules
const DEFAULT_RULES: Rule[] = [
  { 
    title: "No smoking inside the apartment",
    description: "Smoking is not allowed in any part of the property",
    allowed: false 
  },
  { 
    title: "Quiet hours after 10 PM on weekdays",
    description: "Please be quiet between 10PM and 7AM",
    allowed: true 
  },
  { 
    title: "Guests must be approved in advance",
    description: "Contact host before bringing guests",
    allowed: true 
  },
  { 
    title: "Shared cleaning responsibilities",
    description: "All tenants share cleaning duties",
    allowed: true 
  }
];

// Amenity descriptions mapping
const AMENITY_DESCRIPTIONS: Record<string, string> = {
  'washer/dryer': 'In-unit laundry available',
  'parking': 'Free street parking available',
  'gym': 'Access to building fitness center',
  'wifi': 'High-speed internet included',
  'kitchen': 'Equipped with modern appliances',
  'air conditioning': 'Central AC throughout the unit',
  'pool': 'Shared swimming pool',
  'pet friendly': 'Dogs and cats allowed',
  'balcony': 'Private outdoor space'
};

// Default amenities
const DEFAULT_AMENITIES: Amenity[] = [
  { type: 'washer/dryer', title: 'Washer/Dryer', description: AMENITY_DESCRIPTIONS['washer/dryer'] },
  { type: 'parking', title: 'Parking', description: AMENITY_DESCRIPTIONS['parking'] },
  { type: 'wifi', title: 'WiFi', description: AMENITY_DESCRIPTIONS['wifi'] }
];

const PlaceInfoSheet: React.FC<PlaceInfoSheetProps> = ({
  isVisible,
  place,
  onClose,
  onContactHost,
  onBookNow,
  onToggleSave,
  onShare,
  onReport,
  isSaved
}) => {
  const [activeTab, setActiveTab] = useState<'description' | 'amenities' | 'rules'>('description');
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  
  // Format price for display
  const formatPrice = (priceStr: string) => {
    const numericPrice = parseInt(priceStr.replace(/[^0-9]/g, ''));
    if (isNaN(numericPrice)) return '$1,000';
    return `$${numericPrice.toLocaleString()}`;
  };
  
  // Handle opening maps for directions
  const handleGetDirections = () => {
    if (!place.location) return;
    
    const address = encodeURIComponent(place.location);
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const url = Platform.select({
      ios: `${scheme}${address}`,
      android: `${scheme}${address}`
    });
    
    if (url) {
      Linking.openURL(url).catch(err => {
        console.error('Error opening map directions:', err);
      });
    }
  };
  
  // Create the gesture pan responder for the draggable sheet
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          // User dragged down, so close the sheet
          closeSheet();
        } else {
          // Snap back to open position
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 4,
          }).start();
        }
      },
    })
  ).current;
  
  // Effect to handle visibility changes
  useEffect(() => {
    if (isVisible) {
      // Reset to overview tab when opening
      setActiveTab('description');
      // Show the modal with animation
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 4,
        }),
      ]).start();
    }
  }, [isVisible]);
  
  // Handle closing the sheet with animation
  const closeSheet = () => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: SHEET_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };
  
  // Get photos from place data or use fallback
  const photos = place.roomPhotos && place.roomPhotos.length > 0 
    ? place.roomPhotos 
    : [place.image];
  
  // Get amenities with descriptions
  const getAmenities = (): Amenity[] => {
    if (!place.amenities || place.amenities.length === 0) {
      return DEFAULT_AMENITIES;
    }
    
    return place.amenities.map(amenity => ({
      type: amenity.toLowerCase(),
      title: amenity,
      description: AMENITY_DESCRIPTIONS[amenity.toLowerCase()] || ''
    }));
  };

  // Create lease terms for details tab
  const leaseTerms = {
    moveInDate: place.moveInDate || 'Flexible',
    leaseDuration: place.leaseDuration || '12 months',
    bedrooms: place.bedrooms || 1,
    bathrooms: place.bathrooms || 1,
    furnished: place.isFurnished ? 'Yes' : 'No'
  };
  
  // Get room type with proper formatting and fallback
  const roomType = place.roomType 
    ? place.roomType.charAt(0).toUpperCase() + place.roomType.slice(1) 
    : 'Private';
  
  if (!isVisible) return null;
  
  const amenities = getAmenities();

  return (
    <Modal
      transparent={true}
      visible={isVisible}
      animationType="none"
      statusBarTranslucent
      onRequestClose={closeSheet}
    >
      <View className="flex-1 justify-end bg-black/50">
        <TouchableOpacity 
          className="absolute inset-0"
          onPress={closeSheet} 
          activeOpacity={1}
        />
        
        <Animated.View 
          className="bg-white rounded-t-3xl overflow-hidden shadow-lg"
          style={[
            { height: SHEET_HEIGHT },
            {
              transform: [{ translateY }],
              opacity
            }
          ]}
        >
          <SafeAreaView className="flex-1">
            {/* Handle bar */}
            <View {...panResponder.panHandlers} className="w-full items-center py-2">
              <View className="w-10 h-1 bg-gray-200 rounded" />
            </View>

            {/* Header Actions */}
            <View className="flex-row justify-between items-center px-4 py-2">
              <TouchableOpacity 
                className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
                onPress={closeSheet}
              >
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
              
              <View className="flex-row gap-2">
                {onShare && (
                  <TouchableOpacity 
                    className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
                    onPress={onShare}
                  >
                    <Share2 size={20} color="#6B7280" />
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity 
                  className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
                  onPress={onToggleSave}
                >
                  <Heart 
                    size={20} 
                    color={isSaved ? "#EF4444" : "#6B7280"}
                    fill={isSaved ? "#EF4444" : "none"}
                  />
                </TouchableOpacity>
                
                {onReport && (
                  <TouchableOpacity 
                    className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
                    onPress={onReport}
                  >
                    <Flag size={20} color="#6B7280" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Critical Info */}
            <View className="px-4 py-3 border-b border-gray-200">
              <Text className="text-2xl font-semibold text-gray-900 mb-2 font-poppins">
                {place.location}
              </Text>
              <View className="flex-row items-center mb-2">
                <MapPin size={16} color="#6B7280" />
                <Text className="text-gray-600 ml-1 font-poppins">
                  0.5 miles from campus
                </Text>
              </View>
              <Text className="text-2xl font-bold text-indigo-600 font-poppins">
                {formatPrice(place.budget)}<Text className="text-base font-normal">/month</Text>
              </Text>
            </View>

            {/* Tabs */}
            <View className="flex-row border-b border-gray-200">
              {(['description', 'amenities', 'rules'] as const).map((tab) => (
                <TouchableOpacity
                  key={tab}
                  className={`flex-1 py-3 px-4 ${activeTab === tab ? 'border-b-2 border-indigo-600' : ''}`}
                  onPress={() => setActiveTab(tab)}
                >
                  <Text 
                    className={`text-center font-medium ${
                      activeTab === tab ? 'text-indigo-600' : 'text-gray-600'
                    } font-poppins`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Tab content */}
            <ScrollView 
              className="flex-1"
              showsVerticalScrollIndicator={false}
            >
              {activeTab === 'description' && (
                <View className="px-4 py-4">
                  {/* Host info */}
                  <View className="mb-6">
                    <Text className="text-lg font-semibold text-gray-900 mb-3 font-poppins">
                      About the Host
                    </Text>
                    <View className="bg-white rounded-xl p-4 shadow-sm">
                      <View className="flex-row items-center">
                        <Image 
                          source={{ uri: place.image }} 
                          className="w-12 h-12 rounded-full"
                        />
                        <View className="flex-1 ml-3">
                          <View className="flex-row items-center">
                            <Text className="text-base font-semibold text-gray-900 font-poppins">
                              {place.name}
                            </Text>
                            {place.verified && (
                              <View className="ml-2 bg-green-100 px-2 py-1 rounded">
                                <Text className="text-xs text-green-700 font-medium">Verified</Text>
                              </View>
                            )}
                          </View>
                          <Text className="text-sm text-gray-600 mt-1">
                            Member since {place.memberSince || 'Sep 2021'}
                          </Text>
                        </View>
                        <View className="items-end">
                          <Text className="text-lg font-semibold text-gray-900">4.8</Text>
                          <Text className="text-sm text-gray-600">Rating</Text>
                        </View>
                      </View>
                      <View className="mt-3 pt-3 border-t border-gray-100">
                        <View className="flex-row justify-between items-center">
                          <Text className="text-sm text-gray-600">Response rate</Text>
                          <Text className="text-sm font-medium text-gray-900">95%</Text>
                        </View>
                        <View className="flex-row justify-between items-center mt-2">
                          <Text className="text-sm text-gray-600">Response time</Text>
                          <Text className="text-sm font-medium text-gray-900">~2 hours</Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Place Description */}
                  <View className="mb-6">
                    <Text className="text-lg font-semibold text-gray-900 mb-3 font-poppins">
                      About this Place
                    </Text>
                    <Text className="text-base leading-6 text-gray-600">
                      {place.bio || 'Looking for a clean and quiet roommate. I study a lot but also enjoy hiking on weekends.'}
                    </Text>
                  </View>

                  {/* Key Details */}
                  <View className="mb-6">
                    <Text className="text-lg font-semibold text-gray-900 mb-3 font-poppins">
                      Room Details
                    </Text>
                    <View className="bg-white rounded-xl p-4 shadow-sm">
                      <View className="flex-row flex-wrap -mx-2">
                        <View className="w-1/2 px-2 mb-4">
                          <View className="flex-row items-center">
                            <Bed size={20} color="#4F46E5" />
                            <Text className="ml-2 text-gray-600">
                              {place.bedrooms || 1} Bed
                            </Text>
                          </View>
                        </View>
                        <View className="w-1/2 px-2 mb-4">
                          <View className="flex-row items-center">
                            <Bath size={20} color="#4F46E5" />
                            <Text className="ml-2 text-gray-600">
                              {place.bathrooms || 1} Bath
                            </Text>
                          </View>
                        </View>
                        <View className="w-1/2 px-2 mb-4">
                          <View className="flex-row items-center">
                            <Calendar size={20} color="#4F46E5" />
                            <Text className="ml-2 text-gray-600">
                              {place.moveInDate || 'Oct 15'}
                            </Text>
                          </View>
                        </View>
                        <View className="w-1/2 px-2 mb-4">
                          <View className="flex-row items-center">
                            <Check size={20} color="#4F46E5" />
                            <Text className="ml-2 text-gray-600">
                              {place.isFurnished ? 'Furnished' : 'Unfurnished'}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              )}
              
              {activeTab === 'amenities' && (
                <View className="px-4 py-4">
                  <View className="bg-white rounded-xl p-4 shadow-sm">
                    <View className="flex-row flex-wrap -mx-2">
                      {amenities.map((amenity, index) => (
                        <View key={index} className="w-1/2 px-2 mb-4">
                          <View className="flex-row items-center">
                            <Check size={20} color="#10B981" />
                            <View className="ml-2">
                              <Text className="text-gray-900 font-medium">
                                {amenity.title}
                              </Text>
                              <Text className="text-sm text-gray-600">
                                {amenity.description}
                              </Text>
                            </View>
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              )}
              
              {activeTab === 'rules' && (
                <View className="px-4 py-4">
                  <View className="bg-white rounded-xl p-4 shadow-sm">
                    {DEFAULT_RULES.map((rule, index) => (
                      <View key={index} className={`${index > 0 ? 'mt-4 pt-4 border-t border-gray-100' : ''}`}>
                        <View className="flex-row items-center">
                          {rule.allowed ? (
                            <Check size={20} color="#10B981" />
                          ) : (
                            <X size={20} color="#EF4444" />
                          )}
                          <View className="ml-3 flex-1">
                            <Text className="text-gray-900 font-medium">
                              {rule.title}
                            </Text>
                            <Text className="text-sm text-gray-600 mt-1">
                              {rule.description}
                            </Text>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>
            
            {/* Action Buttons */}
            <View className="px-4 py-4 border-t border-gray-200">
              <View className="flex-row space-x-4">
                <TouchableOpacity 
                  className="flex-1 h-12 bg-white border border-indigo-600 rounded-xl justify-center items-center"
                  onPress={onContactHost}
                >
                  <Text className="text-base font-semibold text-indigo-600 font-poppins">
                    Contact Host
                  </Text>
                </TouchableOpacity>
                
                {onBookNow && (
                  <TouchableOpacity 
                    className="flex-1 h-12 bg-indigo-600 rounded-xl justify-center items-center"
                    onPress={onBookNow}
                  >
                    <Text className="text-base font-semibold text-white font-poppins">
                      Book Now
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default PlaceInfoSheet; 