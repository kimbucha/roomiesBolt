import React, { forwardRef, useRef } from 'react';
import { View, TextInput } from 'react-native';
import InputField from './InputField';
import PhotoSelector from './PhotoSelector';
import { usePlaceDetails } from '../../../contexts/PlaceDetailsContext';

const PhotosDescriptionStep = forwardRef<View>((_, ref) => {
  const { placeDetails, updatePlaceDetails } = usePlaceDetails();
  
  // Input refs for focus management
  const descriptionInputRef = useRef<TextInput>(null);
  
  // Handle adding a photo
  const handleAddPhoto = (uri: string) => {
    updatePlaceDetails({
      photos: [...placeDetails.photos, uri]
    });
  };
  
  // Handle removing a photo
  const handleRemovePhoto = (index: number) => {
    const updatedPhotos = [...placeDetails.photos];
    updatedPhotos.splice(index, 1);
    updatePlaceDetails({ photos: updatedPhotos });
  };
  
  return (
    <View ref={ref}>
      <PhotoSelector
        photos={placeDetails.photos}
        onAddPhoto={handleAddPhoto}
        onRemovePhoto={handleRemovePhoto}
      />
      
      <InputField
        ref={descriptionInputRef}
        label="Description"
        placeholder="Describe your place..."
        value={placeDetails.description}
        onChangeText={(text) => updatePlaceDetails({ description: text })}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        onFocus={() => {}}
        style={{ height: 120, textAlignVertical: 'top' }}
      />
    </View>
  );
});

PhotosDescriptionStep.displayName = 'PhotosDescriptionStep';

export default PhotosDescriptionStep;
