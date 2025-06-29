import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  ScrollView,
  Alert
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, X, Upload, Plus } from 'lucide-react-native';
import { logOnboardingInputChange, logOnboardingStepComplete, logOnboardingStepEntry } from '../../../../utils/onboardingDebugUtils';

interface PhotosStepProps {
  userData: {
    photos?: string[];
  };
  onContinue: (data: any) => void;
}

export default function PhotosStep({ userData, onContinue }: PhotosStepProps) {
  // Photos state
  const [photos, setPhotos] = useState<string[]>(
    userData?.photos || []
  );
  
  // Log entry to photos step
  useEffect(() => {
    logOnboardingStepEntry('photos', {
      initialPhotos: userData?.photos || [],
      photoCount: userData?.photos?.length || 0,
      userData: userData
    });
  }, []);
  
  // Request permission and pick image
  const pickImage = async () => {
    logOnboardingInputChange('photos', 'pickImageAttempt', {
      source: 'gallery',
      currentPhotoCount: photos.length
    });
    
    // Request permission
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      const errorInfo = {
        error: 'permission_denied',
        source: 'gallery',
        permissionResult
      };
      
      logOnboardingInputChange('photos', 'permissionError', errorInfo);
      
      Alert.alert(
        "Permission Required", 
        "You need to allow access to your photos to continue.",
        [{ text: "OK" }]
      );
      return;
    }
    
    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    
    if (!result.canceled) {
      // Add new photo to the array
      const newPhotos = [...photos, result.assets[0].uri];
      setPhotos(newPhotos);
      
      logOnboardingInputChange('photos', 'photoAdded', {
        source: 'gallery',
        photoIndex: photos.length,
        totalPhotos: newPhotos.length,
        photoUri: result.assets[0].uri.substring(0, 50) + '...' // Truncate URI for logging
      });
    } else {
      logOnboardingInputChange('photos', 'photoPickCanceled', {
        source: 'gallery'
      });
    }
  };
  
  // Take a photo with camera
  const takePhoto = async () => {
    logOnboardingInputChange('photos', 'takePhotoAttempt', {
      source: 'camera',
      currentPhotoCount: photos.length
    });
    
    // Request permission
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      const errorInfo = {
        error: 'permission_denied',
        source: 'camera',
        permissionResult
      };
      
      logOnboardingInputChange('photos', 'permissionError', errorInfo);
      
      Alert.alert(
        "Permission Required", 
        "You need to allow access to your camera to continue.",
        [{ text: "OK" }]
      );
      return;
    }
    
    // Launch camera
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    
    if (!result.canceled) {
      // Add new photo to the array
      const newPhotos = [...photos, result.assets[0].uri];
      setPhotos(newPhotos);
      
      logOnboardingInputChange('photos', 'photoAdded', {
        source: 'camera',
        photoIndex: photos.length,
        totalPhotos: newPhotos.length,
        photoUri: result.assets[0].uri.substring(0, 50) + '...' // Truncate URI for logging
      });
    } else {
      logOnboardingInputChange('photos', 'photoCaptureCanceled', {
        source: 'camera'
      });
    }
  };
  
  // Remove a photo
  const removePhoto = (index: number) => {
    const photoToRemove = photos[index];
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    
    logOnboardingInputChange('photos', 'photoRemoved', {
      photoIndex: index,
      totalPhotosAfterRemoval: newPhotos.length,
      photoUri: photoToRemove.substring(0, 50) + '...' // Truncate URI for logging
    });
    
    setPhotos(newPhotos);
  };
  
  // Handle continue
  const handleContinue = () => {
    // Log completion of photos step
    logOnboardingStepComplete('photos', {
      photoCount: photos.length,
      isSkipped: photos.length === 0,
      photoUris: photos.map(uri => uri.substring(0, 30) + '...') // Truncate URIs for logging
    });
    
    // Pass the updated data back to the parent
    onContinue({
      photos: photos
    });
  };
  
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.description}>
        Add photos to help potential roommates get to know you better
      </Text>
      
      {/* Photo grid */}
      <View style={styles.photoGrid}>
        {photos.map((photo, index) => (
          <View key={index} style={styles.photoContainer}>
            <Image source={{ uri: photo }} style={styles.photo} />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removePhoto(index)}
            >
              <X size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ))}
        
        {/* Add photo button */}
        {photos.length < 6 && (
          <TouchableOpacity
            style={styles.addPhotoButton}
            onPress={pickImage}
          >
            <Plus size={24} color="#6366F1" />
            <Text style={styles.addPhotoText}>Add Photo</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {/* Photo options */}
      <View style={styles.photoOptions}>
        <TouchableOpacity
          style={styles.photoOption}
          onPress={takePhoto}
        >
          <Camera size={20} color="#6366F1" />
          <Text style={styles.photoOptionText}>Take Photo</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.photoOption}
          onPress={pickImage}
        >
          <Upload size={20} color="#6366F1" />
          <Text style={styles.photoOptionText}>Upload from Gallery</Text>
        </TouchableOpacity>
      </View>
      
      {/* Photo guidelines */}
      <View style={styles.guidelinesContainer}>
        <Text style={styles.guidelinesTitle}>Photo Guidelines:</Text>
        <Text style={styles.guidelineText}>• Clear, well-lit photos show you at your best</Text>
        <Text style={styles.guidelineText}>• Include at least one clear face photo</Text>
        <Text style={styles.guidelineText}>• Add photos that show your personality and lifestyle</Text>
        <Text style={styles.guidelineText}>• Photos with friends are great (just indicate which one is you)</Text>
      </View>
      
      {/* Continue button */}
      <TouchableOpacity
        style={[
          styles.continueButton,
          photos.length === 0 && styles.continueButtonDisabled
        ]}
        onPress={handleContinue}
        disabled={photos.length === 0}
      >
        <Text style={styles.continueButtonText}>
          {photos.length === 0 ? 'Skip for now' : 'Continue'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  description: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 24,
    lineHeight: 24,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  photoContainer: {
    width: '30%',
    aspectRatio: 1,
    margin: '1.66%',
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoButton: {
    width: '30%',
    aspectRatio: 1,
    margin: '1.66%',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
  },
  addPhotoText: {
    fontSize: 12,
    color: '#6366F1',
    marginTop: 4,
  },
  photoOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  photoOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  photoOptionText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '500',
    marginLeft: 8,
  },
  guidelinesContainer: {
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  guidelinesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  guidelineText: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 4,
    lineHeight: 20,
  },
  continueButton: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 40,
  },
  continueButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
