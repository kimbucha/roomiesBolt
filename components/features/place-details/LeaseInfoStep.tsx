import React, { forwardRef, useRef } from 'react';
import { View, TextInput } from 'react-native';
import { Calendar } from 'lucide-react-native';
import InputField from './InputField';
import AmenitySelector from './AmenitySelector';
import { usePlaceDetails } from '../../../contexts/PlaceDetailsContext';

const LeaseInfoStep = forwardRef<View>((_, ref) => {
  const { placeDetails, updatePlaceDetails } = usePlaceDetails();
  
  // Input refs for focus management
  const moveInDateInputRef = useRef<TextInput>(null);
  const leaseDurationInputRef = useRef<TextInput>(null);
  
  // Handle toggling amenities
  const handleToggleAmenity = (amenity: any) => {
    const currentAmenities = [...placeDetails.amenities];
    const index = currentAmenities.indexOf(amenity);
    
    if (index === -1) {
      // Add amenity
      updatePlaceDetails({ amenities: [...currentAmenities, amenity] });
    } else {
      // Remove amenity
      currentAmenities.splice(index, 1);
      updatePlaceDetails({ amenities: currentAmenities });
    }
  };
  
  return (
    <View ref={ref}>
      <InputField
        ref={moveInDateInputRef}
        label="Move-in Date"
        placeholder="MM/DD/YYYY"
        value={placeDetails.moveInDate}
        onChangeText={(text) => updatePlaceDetails({ moveInDate: text })}
        icon={<Calendar size={20} color="#6B7280" />}
        onFocus={() => {}}
        returnKeyType="next"
        onSubmitEditing={() => leaseDurationInputRef.current?.focus()}
      />
      
      <InputField
        ref={leaseDurationInputRef}
        label="Lease Duration"
        placeholder="e.g., 12 months"
        value={placeDetails.leaseDuration}
        onChangeText={(text) => updatePlaceDetails({ leaseDuration: text })}
        onFocus={() => {}}
        returnKeyType="done"
      />
      
      <AmenitySelector
        selectedAmenities={placeDetails.amenities}
        onToggleAmenity={handleToggleAmenity}
      />
    </View>
  );
});

LeaseInfoStep.displayName = 'LeaseInfoStep';

export default LeaseInfoStep;
