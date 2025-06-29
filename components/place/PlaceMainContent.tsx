import React from 'react';
import { View, Text } from 'react-native';
import { RoommateProfile } from '../../store/roommateStore';
import { MapPin } from 'lucide-react-native';

interface PlaceMainContentProps {
  place: RoommateProfile;
}

export const PlaceMainContent: React.FC<PlaceMainContentProps> = ({ place }) => {
  // Format amenities or default values
  const furnished = place.amenities?.includes('furnished') ? 'Furnished' : '';
  const utilities = place.amenities?.includes('utilities') ? 'Utilities Incl.' : '';
  const nearTransit = place.amenities?.includes('nearTransit') ? 'Near Transit' : '';
  
  // Get first available amenity for display
  const highlightedAmenity = furnished || utilities || nearTransit || '';
  
  return (
    <>
      <View className="flex-row justify-between items-start mb-1">
        <View className="flex-1 mr-2">
          <Text className="font-[Poppins-SemiBold] text-2xl text-white shadow-black shadow-md">
            {place.location}
          </Text>
          {place.neighborhood && (
            <Text className="font-[Poppins-Regular] text-sm text-white/80 shadow-black shadow-md">
              {place.neighborhood}
            </Text>
          )}
        </View>
      </View>
      
      {/* Place type & Budget */}
      <View className="flex-row mb-2 items-center">
        <Text className="font-[Poppins-Medium] text-lg text-white mb-0.5 shadow-black shadow-md">
          {place.budget}
        </Text>
        
        {place.roomType && (
          <View className="bg-white/20 px-2 py-0.5 rounded-full ml-2">
            <Text className="font-[Poppins-Medium] text-xs text-white">
              {place.roomType.charAt(0).toUpperCase() + place.roomType.slice(1)} Room
            </Text>
          </View>
        )}
        
        {highlightedAmenity && (
          <View className="bg-white/20 px-2 py-0.5 rounded-full ml-2">
            <Text className="font-[Poppins-Medium] text-xs text-white">
              {highlightedAmenity}
            </Text>
          </View>
        )}
      </View>
    </>
  );
}; 