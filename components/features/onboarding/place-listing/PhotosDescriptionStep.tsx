import React, { forwardRef, useRef } from 'react';
import { View, TextInput } from 'react-native';
import InputField from './InputField';
import PhotoSelector from './PhotoSelector';
import { usePlaceDetails } from '../../../../contexts/PlaceDetailsContext';

interface PhotosDescriptionStepProps {}

const PhotosDescriptionStep = forwardRef<View, PhotosDescriptionStepProps>(
  ({}, ref) => {
  const { placeDetails, updatePlaceDetails } = usePlaceDetails();
  
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
      
      <View>
        <InputField
          ref={descriptionInputRef}
          label="Description"
          placeholder="Tell us about your place..."
          value={placeDetails.description}
          onChangeText={(text) => updatePlaceDetails({ description: text })}
          multiline
          numberOfLines={4}
          returnKeyType="done"
          style={{ height: 120, textAlignVertical: 'top' }}
          scrollEnabled={false}
          editable={true}
        />
      </View>
    </View>
  );
});

PhotosDescriptionStep.displayName = 'PhotosDescriptionStep';

export default PhotosDescriptionStep;
