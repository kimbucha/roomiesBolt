import React from 'react';
import { View, Text } from 'react-native';
import { RoommateProfile } from '../../store/roommateStore';
import { MapPin, Home, Wifi } from 'lucide-react-native';

interface PlaceHeaderContentProps {
  place: RoommateProfile;
}

export const PlaceHeaderContent: React.FC<PlaceHeaderContentProps> = ({ place }) => {
  // Extract amenity information
  const amenities = place.amenities || [];
  
  // Determine key features to display
  const isFurnished = amenities.includes('furnished');
  const hasUtilities = amenities.includes('utilities');
  const nearTransit = amenities.includes('nearTransit');
  
  // Format location - extract area if location includes comma
  const locationParts = place.location.split(',');
  const areaLabel = locationParts.length > 1 ? locationParts[0].trim() : 'Near campus';
  
  // Check if available now or future date
  const isAvailableNow = !place.moveInDate || new Date(place.moveInDate) <= new Date();
  
  return (
    <View>
      {/* Title and Location */}
      <View className="flex-row justify-between items-center">
        <View className="flex-1">
          <Text className="font-[Poppins-SemiBold] text-lg text-gray-800">
            {place.location}
          </Text>
          <View className="flex-row flex-wrap items-center mt-0.5">
            <View className="flex-row items-center mr-2">
              <Home size={12} color="#6B7280" />
              <Text className="font-[Poppins-Medium] text-xs text-gray-600 ml-1">
                {place.roomType ? place.roomType.charAt(0).toUpperCase() + place.roomType.slice(1) : 'Room'}
              </Text>
            </View>
            
            <View className="flex-row items-center mr-2">
              <MapPin size={12} color="#6B7280" />
              <Text className="font-[Poppins-Medium] text-xs text-gray-600 ml-1">
                {areaLabel}
              </Text>
            </View>
            
            {hasUtilities && (
              <View className="flex-row items-center mr-2">
                <Wifi size={12} color="#0EA5E9" />
                <Text className="font-[Poppins-Medium] text-xs text-sky-600 ml-1">
                  Utilities Incl.
                </Text>
              </View>
            )}
            
            {isAvailableNow ? (
              <Text className="font-[Poppins-Medium] text-xs text-green-600 ml-2">
                • Available now
              </Text>
            ) : (
              <Text className="font-[Poppins-Medium] text-xs text-amber-600 ml-2">
                • Available {place.moveInDate}
              </Text>
            )}
          </View>
        </View>
        
        {/* Price badge */}
        <View className="bg-indigo-500 px-2 py-0.5 rounded-full">
          <Text className="font-[Poppins-SemiBold] text-xs text-white">
            {place.budget}
          </Text>
        </View>
      </View>
    </View>
  );
}; 