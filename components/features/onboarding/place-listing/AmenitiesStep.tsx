import React, { forwardRef } from 'react';
import { View } from 'react-native';
import AmenitySelector from './AmenitySelector';
import { usePlaceDetails, AmenityType } from '../../../../contexts/PlaceDetailsContext';

interface AmenitiesStepProps {}

const AmenitiesStep = forwardRef<View, AmenitiesStepProps>(({}, ref) => {
  const { placeDetails, updatePlaceDetails } = usePlaceDetails();

  // Handle toggling amenities
  const handleToggleAmenity = (amenity: AmenityType) => {
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
      <AmenitySelector
        selectedAmenities={placeDetails.amenities}
        onToggleAmenity={handleToggleAmenity}
      />
    </View>
  );
});

AmenitiesStep.displayName = 'AmenitiesStep';

export default AmenitiesStep; 