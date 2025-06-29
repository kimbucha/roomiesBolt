import React from 'react';
import { View, Text, TouchableOpacity, Image, Alert, ScrollView } from 'react-native';
import { Camera, Plus, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

interface PhotoSelectorProps {
  photos: string[];
  onAddPhoto: (uri: string) => void;
  onRemovePhoto: (index: number) => void;
  maxPhotos?: number;
}

const PhotoSelector: React.FC<PhotoSelectorProps> = ({
  photos,
  onAddPhoto,
  onRemovePhoto,
  maxPhotos = 5
}) => {
  const handleSelectPhoto = async () => {
    if (photos.length >= maxPhotos) {
      Alert.alert('Maximum Photos', `You can only upload up to ${maxPhotos} photos.`);
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }
    
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        onAddPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error selecting photo:', error);
      Alert.alert('Error', 'There was an error selecting your photo. Please try again.');
    }
  };

  const handleTakePhoto = async () => {
    if (photos.length >= maxPhotos) {
      Alert.alert('Maximum Photos', `You can only upload up to ${maxPhotos} photos.`);
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Sorry, we need camera permissions to make this work!');
      return;
    }
    
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        onAddPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'There was an error taking your photo. Please try again.');
    }
  };

  return (
    <View className="mb-4">
      <Text className="text-base font-semibold text-gray-800 mb-3">Property Photos</Text>
      <Text className="text-sm text-gray-500 mb-3">
        Add up to {maxPhotos} photos of your property
      </Text>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        className="mb-2"
      >
        {photos.map((photo, index) => (
          <View key={index} className="relative mr-3 mb-2">
            <Image 
              source={{ uri: photo }} 
              className="w-24 h-24 rounded-lg" 
              accessibilityLabel={`Property photo ${index + 1}`}
            />
            <TouchableOpacity
              className="absolute top-1 right-1 bg-black bg-opacity-50 rounded-full p-1"
              onPress={() => onRemovePhoto(index)}
              accessibilityLabel={`Remove photo ${index + 1}`}
              accessibilityRole="button"
            >
              <X size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ))}
        
        {photos.length < maxPhotos && (
          <View className="flex-row">
            <TouchableOpacity
              className="w-24 h-24 bg-gray-100 rounded-lg items-center justify-center mr-3"
              onPress={handleSelectPhoto}
              accessibilityLabel="Select photo from gallery"
              accessibilityRole="button"
            >
              <Plus size={24} color="#6B7280" />
              <Text className="text-xs text-gray-500 mt-1">Gallery</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              className="w-24 h-24 bg-gray-100 rounded-lg items-center justify-center"
              onPress={handleTakePhoto}
              accessibilityLabel="Take a photo with camera"
              accessibilityRole="button"
            >
              <Camera size={24} color="#6B7280" />
              <Text className="text-xs text-gray-500 mt-1">Camera</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
      
      <Text className="text-xs text-gray-500">
        {photos.length} of {maxPhotos} photos added
      </Text>
    </View>
  );
};

export default PhotoSelector;
