import React from 'react';
import { View, Text, TouchableOpacity, Image, Alert, ListRenderItemInfo } from 'react-native';
import { Camera, Plus, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import { SupabasePhotoUpload, parseSupabaseUrl } from '../../../../services/supabasePhotoUpload';
import { useSupabaseUserStore } from '../../../../store/supabaseUserStore';
import { showToast } from '../../../common/Toast';

interface PhotoSelectorProps {
  photos: string[];
  onAddPhoto: (uri: string) => void;
  onRemovePhoto: (index: number) => void;
  onReorderPhotos?: (reorderedPhotos: string[]) => void;
  maxPhotos?: number;
}

// Define item types for DraggableFlatList data
type PhotoItem = { type: 'photo'; uri: string; index: number; key: string };
type AddButtonItem = { type: 'add_gallery' | 'add_camera'; key: string };
type ListItem = PhotoItem | AddButtonItem;

const PhotoSelector: React.FC<PhotoSelectorProps> = ({
  photos,
  onAddPhoto,
  onRemovePhoto,
  onReorderPhotos,
  maxPhotos = 5
}) => {
  const { user, isLoading, fetchUserProfile } = useSupabaseUserStore();
  
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
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const localUri = result.assets[0].uri;
        
        // If user is not available, try fetching the profile first
        let currentUser = user;
        if (!currentUser && !isLoading) {
          console.log('[PhotoSelector] User not found, attempting to fetch profile...');
          const fetchResult = await fetchUserProfile();
          if (fetchResult.success) {
            currentUser = useSupabaseUserStore.getState().user;
          }
        }
        
        if (currentUser?.id) {
          showToast('Uploading photo...', 'info');
          const uploadResult = await SupabasePhotoUpload.uploadListingPhoto(localUri, currentUser.id, undefined, {
            compress: true,
            quality: 0.8,
            maxWidth: 1600,
            maxHeight: 1200
          });
          
          if (uploadResult.success && uploadResult.url) {
            onAddPhoto(uploadResult.url);
            showToast('Photo uploaded successfully!', 'success');
          } else {
            console.error('Error uploading photo:', uploadResult.error);
            Alert.alert('Upload Error', uploadResult.error || 'Failed to upload photo. Please try again.');
          }
        } else {
          console.error('[PhotoSelector] No user available after fetch attempt');
          Alert.alert('Error', 'User authentication not found. Please try logging in again.');
        }
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

    // 1. Check current permissions
    let finalStatus = await ImagePicker.getCameraPermissionsAsync();
    
    // 2. Request if undetermined and askable
    if (!finalStatus.granted && finalStatus.canAskAgain) {
      console.log('Camera permission undetermined, requesting...');
      finalStatus = await ImagePicker.requestCameraPermissionsAsync();
    }

    // 3. Check final status
    if (!finalStatus.granted) {
      if (finalStatus.canAskAgain) {
        // User denied the request just now
        Alert.alert('Permission Denied', 'Camera access is needed to take photos.');
      } else {
        // Permission permanently denied or restricted
        Alert.alert(
          'Permission Required', 
          'Camera access is currently denied. Please enable it in your phone\'s Settings app to take photos.',
          // Optionally add a button to open settings, requires linking module
          // [{ text: "Open Settings", onPress: () => Linking.openSettings() }]
        );
      }
      return; // Exit if permission not granted
    }
    
    // 4. Permission granted, proceed to launch camera
    console.log('Camera permission granted, launching camera...');
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const localUri = result.assets[0].uri;
        
        // If user is not available, try fetching the profile first
        let currentUser = user;
        if (!currentUser && !isLoading) {
          console.log('[PhotoSelector] User not found in takePhoto, attempting to fetch profile...');
          const fetchResult = await fetchUserProfile();
          if (fetchResult.success) {
            currentUser = useSupabaseUserStore.getState().user;
          }
        }
        
        if (currentUser?.id) {
          showToast('Uploading photo...', 'info');
          const uploadResult = await SupabasePhotoUpload.uploadListingPhoto(localUri, currentUser.id, undefined, {
            compress: true,
            quality: 0.8,
            maxWidth: 1600,
            maxHeight: 1200
          });
          
          if (uploadResult.success && uploadResult.url) {
            onAddPhoto(uploadResult.url);
            showToast('Photo uploaded successfully!', 'success');
          } else {
            console.error('Error uploading photo:', uploadResult.error);
            Alert.alert('Upload Error', uploadResult.error || 'Failed to upload photo. Please try again.');
          }
        } else {
          console.error('[PhotoSelector] No user available after fetch attempt in takePhoto');
          Alert.alert('Error', 'User authentication not found. Please try logging in again.');
        }
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'There was an error taking your photo. Please try again.');
    }
  };

  // Handle photo removal with Supabase Storage cleanup
  const handleRemovePhoto = async (index: number) => {
    const photoUrl = photos[index];
    
    // If this is a Supabase Storage URL, delete it from storage
    if (photoUrl && photoUrl.includes('supabase.co/storage')) {
      try {
        const urlInfo = parseSupabaseUrl(photoUrl);
        
        if (urlInfo) {
          const deleteResult = await SupabasePhotoUpload.deletePhoto(urlInfo.path, urlInfo.bucket);
          if (!deleteResult.success) {
            console.warn('Failed to delete photo from storage:', deleteResult.error);
          }
        }
      } catch (error) {
        console.warn('Error deleting photo from storage:', error);
      }
    }
    
    // Call the parent's remove function
    onRemovePhoto(index);
  };

  // Prepare data for DraggableFlatList
  const photoItems: PhotoItem[] = photos.map((uri, index) => ({ 
    type: 'photo', 
    uri, 
    index, 
    key: `photo-${index}-${uri.substring(uri.length - 10)}` // Use end of URI for uniqueness
  }));
  
  const addButtonItems: AddButtonItem[] = photos.length < maxPhotos ? [
    { type: 'add_gallery', key: 'add-gallery' },
    { type: 'add_camera', key: 'add-camera' }
  ] : [];
  
  const listData: ListItem[] = [...photoItems, ...addButtonItems];

  // Handle drag-and-drop reordering
  const handleDragEnd = ({ data }: { data: ListItem[] }) => {
    // Extract only photo items and reorder them
    const reorderedPhotoItems = data.filter((item): item is PhotoItem => item.type === 'photo');
    const reorderedPhotos = reorderedPhotoItems.map(item => item.uri);
    
    // Call the callback to update parent state
    if (onReorderPhotos) {
      onReorderPhotos(reorderedPhotos);
    }
  };

  // Render item function for DraggableFlatList
  const renderItem = ({ item, drag, isActive }: RenderItemParams<ListItem>) => {
    if (item.type === 'photo') {
      return (
        <View className="relative mr-3 mb-2">
          <TouchableOpacity
            onLongPress={drag}
            disabled={isActive}
            style={{
              opacity: isActive ? 0.7 : 1,
              transform: [{ scale: isActive ? 1.05 : 1 }]
            }}
          >
            <Image 
              source={{ uri: item.uri }} 
              className="w-24 h-24 rounded-lg" 
              accessibilityLabel={`Property photo ${item.index + 1}`}
            />
          </TouchableOpacity>
          <TouchableOpacity
            className="absolute top-1 right-1 bg-black bg-opacity-50 rounded-full p-1"
            onPress={() => handleRemovePhoto(item.index)}
            accessibilityLabel={`Remove photo ${item.index + 1}`}
            accessibilityRole="button"
          >
            <X size={14} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      );
    } else if (item.type === 'add_gallery') {
      return (
        <TouchableOpacity
          className="w-24 h-24 bg-gray-100 rounded-lg items-center justify-center mr-3"
          onPress={handleSelectPhoto}
          accessibilityLabel="Select photo from gallery"
          accessibilityRole="button"
        >
          <Plus size={24} color="#6B7280" />
          <Text className="text-xs text-gray-500 mt-1">Gallery</Text>
        </TouchableOpacity>
      );
    } else if (item.type === 'add_camera') {
      return (
        <TouchableOpacity
          className="w-24 h-24 bg-gray-100 rounded-lg items-center justify-center"
          onPress={handleTakePhoto}
          accessibilityLabel="Take a photo with camera"
          accessibilityRole="button"
        >
          <Camera size={24} color="#6B7280" />
          <Text className="text-xs text-gray-500 mt-1">Camera</Text>
        </TouchableOpacity>
      );
    }
    return null;
  };

  return (
    <View className="mb-4">
      <Text className="text-base font-semibold text-gray-800 mb-3">Property Photos</Text>
      <Text className="text-sm text-gray-500 mb-3">
        Add up to {maxPhotos} photos of your property
      </Text>
      
      {/* Replace FlatList with DraggableFlatList */}
      <DraggableFlatList
        data={listData}
        renderItem={renderItem}
        keyExtractor={(item) => item.key}
        onDragEnd={handleDragEnd}
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mb-2"
      />
      
      <Text className="text-xs text-gray-500">
        {photos.length} of {maxPhotos} photos added
      </Text>
    </View>
  );
};

export default PhotoSelector;
