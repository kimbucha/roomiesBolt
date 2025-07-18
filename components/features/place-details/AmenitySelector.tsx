import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Wifi, Car, Dumbbell, Droplets, Wind, Sofa, Dog } from 'lucide-react-native';

export type AmenityType = 'wifi' | 'parking' | 'gym' | 'laundry' | 'ac' | 'furnished' | 'pets';

interface AmenitySelectorProps {
  selectedAmenities: AmenityType[];
  onToggleAmenity: (amenity: AmenityType) => void;
}

interface AmenityOption {
  id: AmenityType;
  label: string;
  icon: React.ReactNode;
}

const AmenitySelector: React.FC<AmenitySelectorProps> = ({
  selectedAmenities,
  onToggleAmenity
}) => {
  const amenities: AmenityOption[] = [
    { id: 'wifi', label: 'WiFi', icon: <Wifi size={20} /> },
    { id: 'parking', label: 'Parking', icon: <Car size={20} /> },
    { id: 'gym', label: 'Gym', icon: <Dumbbell size={20} /> },
    { id: 'laundry', label: 'Laundry', icon: <Droplets size={20} /> },
    { id: 'ac', label: 'A/C', icon: <Wind size={20} /> },
    { id: 'furnished', label: 'Furnished', icon: <Sofa size={20} /> },
    { id: 'pets', label: 'Pet Friendly', icon: <Dog size={20} /> }
  ];

  return (
    <View className="mb-4">
      <Text className="text-base font-semibold text-gray-800 mb-3">Amenities</Text>
      <View className="flex-row flex-wrap">
        {amenities.map((amenity) => {
          const isSelected = selectedAmenities.includes(amenity.id);
          return (
            <TouchableOpacity
              key={amenity.id}
              className={`mr-2 mb-2 px-3 py-2 rounded-full flex-row items-center ${
                isSelected ? 'bg-indigo-100 border border-indigo-300' : 'bg-gray-100 border border-gray-200'
              }`}
              onPress={() => onToggleAmenity(amenity.id)}
              accessibilityLabel={amenity.label}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
            >
              <View className="mr-1">
                {React.cloneElement(amenity.icon as React.ReactElement, { 
                  color: isSelected ? '#6366F1' : '#6B7280' 
                })}
              </View>
              <Text className={`${isSelected ? 'text-indigo-700' : 'text-gray-700'} text-sm`}>
                {amenity.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default AmenitySelector;
