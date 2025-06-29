import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated, Easing, Alert, Platform, Modal, TouchableWithoutFeedback } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Camera, Plus, X, ArrowRight, ImageIcon, Calendar as CalendarIcon } from 'lucide-react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { format, subYears, isValid, parseISO } from 'date-fns';
import OnboardingTemplate from '../../components/features/onboarding/OnboardingTemplate';
import { useSupabaseUserStore } from '../../store/supabaseUserStore';
import { showToast } from '../../components/common/Toast';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { ImageSourcePropType } from 'react-native';
import { getStepNumber, getNextStep, getTotalSteps, ONBOARDING_STEPS } from '../../store/onboardingConfig';
import { SupabasePhotoUpload, PhotoUploadResult } from '../../services/supabasePhotoUpload';

// Define personality type as a type for better type safety
type PersonalityType = 
  | 'ISTJ' | 'ISFJ' | 'INFJ' | 'INTJ' 
  | 'ISTP' | 'ISFP' | 'INFP' | 'INTP' 
  | 'ESTP' | 'ESFP' | 'ENFP' | 'ENTP' 
  | 'ESTJ' | 'ESFJ' | 'ENFJ' | 'ENTJ';

// Import potato image for place listers
const potatoImage = require('../../assets/images/potato.png');

// Import all personality type images
// React Native requires static imports for images
const personalityImages: Record<PersonalityType, ImageSourcePropType> = {
  'ISTJ': require('../../assets/images/personality/ISTJ.png'),
  'ISFJ': require('../../assets/images/personality/ISFJ.png'),
  'INFJ': require('../../assets/images/personality/INFJ.png'),
  'INTJ': require('../../assets/images/personality/INTJ.png'),
  'ISTP': require('../../assets/images/personality/ISTP.png'),
  'ISFP': require('../../assets/images/personality/ISFP.png'),
  'INFP': require('../../assets/images/personality/INFP.png'),
  'INTP': require('../../assets/images/personality/INTP.png'),
  'ESTP': require('../../assets/images/personality/ESTP.png'),
  'ESFP': require('../../assets/images/personality/ESFP.png'),
  'ENFP': require('../../assets/images/personality/ENFP.png'),
  'ENTP': require('../../assets/images/personality/ENTP.png'),
  'ESTJ': require('../../assets/images/personality/ESTJ.png'),
  'ESFJ': require('../../assets/images/personality/ESFJ.png'),
  'ENFJ': require('../../assets/images/personality/ENFJ.png'),
  'ENTJ': require('../../assets/images/personality/ENTJ.png'),
};

export default function Photos() {
  const router = useRouter();
  const { type, userRole: paramUserRole } = useLocalSearchParams<{ type: string; userRole: string }>();
  const typeFromParams = type as PersonalityType | undefined;
  const { updateOnboardingProgress, onboardingProgress, updateUserAndProfile, user } = useSupabaseUserStore();
  // Initialize photos state with user photos or empty array if none exist
  const [photos, setPhotos] = useState<string[]>(user?.photos || []);
  
  // Load user's existing photos on mount
  useEffect(() => {
    if (user && user.photos && user.photos.length > 0) {
      // KEEP: Essential for data persistence testing
      console.log('[DATA PERSISTENCE TEST] Loading existing photos from user:', user.photos.length);
      setPhotos(user.photos);
    }
  }, [user]);

  const [hasPersonalityImage, setHasPersonalityImage] = useState(false);
  const [personalityImage, setPersonalityImage] = useState<ImageSourcePropType | null>(null);
  const [personalityType, setPersonalityType] = useState<PersonalityType | undefined>(undefined);
  const [showPotatoDefault, setShowPotatoDefault] = useState(false);
  // Initialize profile photo index from user data if available
  const [profilePhotoIndex, setProfilePhotoIndex] = useState<number | null>(user?.profilePhotoIndex !== undefined ? user.profilePhotoIndex : null);
  
  // Debug flag to help troubleshoot personality image issues - always enabled
  const DEBUG_PERSONALITY = true;
  
  // Log available personality types on component mount
  useEffect(() => {
    if (!user) {
      console.log('[Photos] User data not loaded yet, waiting...');
      return;
    }
    
    console.log('[Photos] Component mounted, debugging values:');
    console.log('[Photos] - userExists:', !!user);
    console.log('[Photos] - user?.userRole:', user?.userRole);
    console.log('[Photos] - user?.personalityType:', user?.personalityType);
    console.log('[Photos] - typeFromParams:', typeFromParams);
    console.log('[Photos] - hasPersonalityImage state:', hasPersonalityImage);
    console.log('[Photos] - showPotatoDefault state:', showPotatoDefault);
    
         // SPECIAL CASE: Place listers should get potato as default photo, regardless of personality type
     // This is because place listers enter through the listing flow, not the roommate seeker flow
     if (effectiveUserRole === 'place_lister') {
       console.log('[Photos] ✅ PLACE LISTER DETECTED - Using potato default');
       console.log('[Photos] - User role:', user?.userRole);
       console.log('[Photos] - Personality type:', user?.personalityType, '(will be ignored for place listers)');
       setHasPersonalityImage(false);
       setPersonalityImage(null);
       setPersonalityType(undefined);
       setShowPotatoDefault(true);
       setProfilePhotoIndex(-2); // Set potato as profile photo (-2 = potato, -1 = personality)
       return; // Exit early to prevent any other logic from running
     }
    
    // First priority: Check URL params for personality type (most reliable source)
    if (typeFromParams && Object.keys(personalityImages).includes(typeFromParams)) {
      setPersonalityType(typeFromParams);
      setHasPersonalityImage(true);
      setPersonalityImage(personalityImages[typeFromParams]);
      setShowPotatoDefault(false); // Make sure potato is disabled when we have personality
      
      // Update the user store with the type from params only if it's different
      if (user && user.personalityType !== typeFromParams) {
        // Update user with personality type from params
        updateUserAndProfile({
          personalityType: typeFromParams
        }, { validate: false });
      }
    }
    // Second priority: Check user store for personality type
    else if (user?.personalityType && personalityImages[user.personalityType as PersonalityType]) {
      setPersonalityType(user.personalityType as PersonalityType);
      setHasPersonalityImage(true);
      setPersonalityImage(personalityImages[user.personalityType as PersonalityType]);
      setShowPotatoDefault(false); // Make sure potato is disabled when we have personality
    }
    // If no personality type is found and not a place lister, redirect to quiz
    else {
      setHasPersonalityImage(false);
      setPersonalityImage(null);
      setShowPotatoDefault(false);
      
      // For regular roommate seekers, redirect to the personality quiz to get a valid personality type
      router.replace('/(onboarding)/personality/quiz');
    }
  }, [user, typeFromParams, paramUserRole, effectiveUserRole]); // Add dependencies so it re-runs when user data loads
  
  // Date of Birth state
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(
    user?.dateOfBirth && isValid(parseISO(user.dateOfBirth)) ? parseISO(user.dateOfBirth) : null
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Animation values for the complete button
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(0.9)).current;
  
  // Define minimum and maximum allowable dates (e.g., 18 years old minimum)
  const eighteenYearsAgo = subYears(new Date(), 18);
  const hundredYearsAgo = subYears(new Date(), 100);

  // Use onboarding config for accurate step numbers
  const effectiveUserRole = paramUserRole || user?.userRole;
  const isPlaceLister = effectiveUserRole === 'place_lister';
  const currentStepIndex = getStepNumber('photos', effectiveUserRole);
  const totalSteps = getTotalSteps(effectiveUserRole);
  
  console.log('[Photos] Step calculation debug:', {
    userRole: effectiveUserRole,
    paramUserRole,
    storeUserRole: user?.userRole,
    isPlaceLister,
    currentStepIndex,
    totalSteps
  });

  // Watch for changes in the personality type state
  useEffect(() => {
    if (personalityType) {
      setHasPersonalityImage(true);
      setPersonalityImage(personalityImages[personalityType]);
      
      // Make sure user store is updated with this personality type
      if (user && user.personalityType !== personalityType) {
        // Sync user and roommate profile with current personality type
        updateUserAndProfile({
          personalityType: personalityType
        }, { validate: false });
      }
    } else {
      // If personality type is cleared, make sure we don't show a personality image
      setHasPersonalityImage(false);
      setPersonalityImage(null);
    }
  }, [personalityType]); // Re-run when personality type changes

  // No backup calculation - we always require a valid personality type
  // If there's no personality type, the user will be redirected to the quiz

  useEffect(() => {
    // Update onboarding progress
    const updatedCompletedSteps = [...(onboardingProgress?.completedSteps || [])];
    if (!updatedCompletedSteps.includes('about-you')) {
      updatedCompletedSteps.push('about-you');
    }
    
    updateOnboardingProgress({
      currentStep: 'photos',
      completedSteps: updatedCompletedSteps
    });
    
    // Initial button animation check
    if (isFormReady()) {
      animateButtonIn();
    }
  }, []);
  
  // Check if form is ready (at least one photo AND date of birth selected)
  const isFormReady = () => {
    // Consider personality image OR potato default as a valid photo
    const hasValidPhoto = photos.length > 0 || 
                         (hasPersonalityImage && personalityImage !== null) ||
                         showPotatoDefault;
    const hasValidDOB = dateOfBirth !== null;
    
    return hasValidPhoto && hasValidDOB;
  };

  // Re-animate button when readiness changes
  useEffect(() => {
    if (isFormReady()) {
      animateButtonIn();
    } else {
      animateButtonOut();
    }
  }, [photos, hasPersonalityImage, dateOfBirth, showPotatoDefault]);
  
  const animateButtonIn = () => {
    Animated.parallel([
      Animated.timing(buttonOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic)
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic)
      })
    ]).start();
  };
  
  const animateButtonOut = () => {
    Animated.parallel([
      Animated.timing(buttonOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.in(Easing.cubic)
      }),
      Animated.timing(buttonScale, {
        toValue: 0.9,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.in(Easing.cubic)
      })
    ]).start();
  };

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Sorry, we need camera roll permissions to make this work!');
        return false;
      }
      return true;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;
    
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const localUri = result.assets[0].uri;
        
        // Upload to Supabase Storage
        if (user?.id) {
          showToast('Uploading photo...', 'info');
          const uploadResult = await SupabasePhotoUpload.uploadUserPhoto(localUri, user.id, {
            compress: true,
            quality: 0.8,
            maxWidth: 1200,
            maxHeight: 1200
          });
          
          if (uploadResult.success && uploadResult.url) {
            setPhotos([...photos, uploadResult.url]);
            showToast('Photo uploaded successfully!', 'success');
          } else {
            console.error('Error uploading photo:', uploadResult.error);
            Alert.alert('Upload Error', uploadResult.error || 'Failed to upload photo. Please try again.');
          }
        } else {
          Alert.alert('Error', 'User not found. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'There was an error selecting your image. Please try again.');
    }
  };
  
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Sorry, we need camera permissions to make this work!');
      return;
    }
    
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const localUri = result.assets[0].uri;
        
        // Upload to Supabase Storage
        if (user?.id) {
          showToast('Uploading photo...', 'info');
          const uploadResult = await SupabasePhotoUpload.uploadUserPhoto(localUri, user.id, {
            compress: true,
            quality: 0.8,
            maxWidth: 1200,
            maxHeight: 1200
          });
          
          if (uploadResult.success && uploadResult.url) {
            setPhotos([...photos, uploadResult.url]);
            showToast('Photo uploaded successfully!', 'success');
          } else {
            console.error('Error uploading photo:', uploadResult.error);
            Alert.alert('Upload Error', uploadResult.error || 'Failed to upload photo. Please try again.');
          }
        } else {
          Alert.alert('Error', 'User not found. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'There was an error taking your photo. Please try again.');
    }
  };
  
  const addPhoto = () => {
    Alert.alert(
      'Add Photo',
      'Choose a method to add your photo',
      [
        {
          text: 'Take Photo',
          onPress: takePhoto
        },
        {
          text: 'Choose from Library',
          onPress: pickImage
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };
  
  const removePhoto = async (index: number) => {
    const photoUrl = photos[index];
    
    // If this is a Supabase Storage URL, delete it from storage
    if (photoUrl && photoUrl.includes('supabase.co/storage')) {
      try {
        // Extract bucket and path from URL
        const { SupabasePhotoUpload, parseSupabaseUrl } = require('../../services/supabasePhotoUpload');
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
    
    // If removing the profile photo, reset the profile photo index
    if (profilePhotoIndex === index) {
      setProfilePhotoIndex(null);
    } else if (profilePhotoIndex !== null && profilePhotoIndex > index) {
      // If removing a photo before the profile photo, adjust the index
      setProfilePhotoIndex(profilePhotoIndex - 1);
    }
    setPhotos(photos.filter((_, i) => i !== index));
  };
  
  const removePersonalityPhoto = () => {
    setHasPersonalityImage(false);
    setPersonalityImage(null);
    // If personality image was the profile photo, reset profile photo index
    if (profilePhotoIndex === -1) {
      setProfilePhotoIndex(null);
    }
  };
  
  // Set a photo as the profile photo
  const setAsProfilePhoto = (index: number) => {
    // -1 represents the personality image
    setProfilePhotoIndex(index);
  };
  
  // Set initial profile photo if none is set
  useEffect(() => {
    // If we have a personality image and no profile photo is set yet, automatically set it as profile
    if (hasPersonalityImage && personalityImage && profilePhotoIndex === null) {
      setProfilePhotoIndex(-1);
    } else if (showPotatoDefault && profilePhotoIndex === null) {
      // If showing potato default and no profile set, use potato
      setProfilePhotoIndex(-2);
    } else if (!hasPersonalityImage && !showPotatoDefault && photos.length > 0 && profilePhotoIndex === null) {
      // If no personality image or potato but we have photos and no profile set, use the first photo
      setProfilePhotoIndex(0);
    }
  }, [hasPersonalityImage, personalityImage, photos, profilePhotoIndex, showPotatoDefault]);

  // Date Picker handler
  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    // For Android, the picker closes automatically. For iOS spinner, we close manually via Done button.
    // However, if the type is 'dismissed' on Android, we should hide our state variable too.
    if (Platform.OS === 'android' && event.type === 'dismissed') {
        setShowDatePicker(false);
        return;
    }

    const currentDate = selectedDate;
    // Don't hide picker automatically on iOS spinner change
    // setShowDatePicker(Platform.OS === 'ios'); 

    if (currentDate) {
      if (currentDate > new Date()) {
          // Alert handled, but don't automatically close picker yet on iOS
          Alert.alert("Invalid Date", "Date of birth cannot be in the future.");
      } else if (currentDate > eighteenYearsAgo) {
          Alert.alert("Age Requirement", "You must be at least 18 years old to use Roomies.");
      } else {
          // Update the date state, picker remains open on iOS until Done
          setDateOfBirth(currentDate); 
      }
    } else {
        // If selectedDate is undefined (can happen), maybe close picker or do nothing
        // setShowDatePicker(false); // Cautious about closing automatically
    }
  };
  
  // Function to show the date picker (modal or default)
  const showDatepickerModal = () => {
    setShowDatePicker(true);
  };

  // Function to hide picker and update state if needed (called by Done button on iOS)
  const handleDatePickerDone = () => {
      // Potentially re-validate or just close
      setShowDatePicker(false);
      // The dateOfBirth state should already be updated by onDateChange
  }

  const handleContinue = async () => {
    // Check if requirements are met
    if (!isFormReady()) {
       if (photos.length === 0 && !hasPersonalityImage && !showPotatoDefault) {
         Alert.alert('Photo Required', 'Please add at least one photo.');
       } else if (!dateOfBirth) {
         Alert.alert('Date of Birth Required', 'Please enter your date of birth.');
       }
       return;
    }
    
    // Use the new ProfileImageService to determine the profile picture
    const { ProfileImageService, ProfileImageType } = require('../../utils/profileImageService');
    
    let profilePictureIdentifier: string | undefined = undefined;
    
    if (profilePhotoIndex === -1) {
      // User selected the personality image as profile picture
      profilePictureIdentifier = ProfileImageService.getDatabaseIdentifier({
        type: ProfileImageType.PERSONALITY_IMAGE,
        source: null
      });
    } else if (profilePhotoIndex === -2) {
      // User has potato default as profile picture
      profilePictureIdentifier = ProfileImageService.getDatabaseIdentifier({
        type: ProfileImageType.POTATO_DEFAULT,
        source: null
      });
    } else if (profilePhotoIndex !== null && profilePhotoIndex >= 0 && profilePhotoIndex < photos.length) {
      // User selected one of their uploaded photos
      profilePictureIdentifier = photos[profilePhotoIndex];
    } else if (hasPersonalityImage && photos.length === 0) {
      // Only personality image available, use it as default
      profilePictureIdentifier = ProfileImageService.getDatabaseIdentifier({
        type: ProfileImageType.PERSONALITY_IMAGE,
        source: null
      });
    } else if (showPotatoDefault && photos.length === 0) {
      // Place lister with no personality type and no uploaded photos - use potato
      profilePictureIdentifier = ProfileImageService.getDatabaseIdentifier({
        type: ProfileImageType.POTATO_DEFAULT,
        source: null
      });
    } else if (photos.length > 0) {
      // Default to first photo if no specific selection
      profilePictureIdentifier = photos[0];
    }

    // Update user profile with photos and profile picture
    updateUserAndProfile({
      photos: photos,
      profilePhotoIndex: profilePhotoIndex,
      profilePicture: profilePictureIdentifier, // Store the selected profile picture
      dateOfBirth: dateOfBirth ? dateOfBirth.toISOString() : undefined
    }, { validate: true });

    // Update profile strength
    if (user?.id) {
      try {
        const { SupabaseOnboardingProfileUpdater } = require('../../utils/supabaseOnboardingProfileUpdater');
        const stepData = {
          profile_picture_url: profilePictureIdentifier,
          additional_photos: photos,
          date_of_birth: dateOfBirth ? dateOfBirth.toISOString() : null
        };
        
        // Update profile strength asynchronously
        SupabaseOnboardingProfileUpdater.updateAfterStep(user.id, 'photos', stepData);
        console.log('[Photos] Updating profile strength after completing photos step');
        console.log('[Photos] Using ProfileImageService for consistent profile picture handling');
      } catch (error) {
        console.error('[Photos] Error updating profile strength:', error);
      }
    }
    
    // Toast notification removed
    
    console.log('Saved user data with photos:', {
      photoCount: photos.length,
      personalityType: user?.personalityType,
      profilePictureIdentifier: profilePictureIdentifier
    });
    
    // Update onboarding progress for Social Proof step
    const updatedCompletedSteps = [...(onboardingProgress?.completedSteps || [])];
    if (!updatedCompletedSteps.includes('photos')) {
      updatedCompletedSteps.push('photos');
    }
    
    updateOnboardingProgress({
      currentStep: 'notifications', // NEW: Skip social-proof, go directly to notifications
      completedSteps: updatedCompletedSteps,
      isComplete: false
    });
    
    // Refresh user profile to get updated data including place details
    const { fetchUserProfile } = useSupabaseUserStore.getState();
    await fetchUserProfile();
    
    // Navigate to next step using onboarding config
    const nextStep = getNextStep('photos', effectiveUserRole);
    if (nextStep) {
      router.push(`/(onboarding)/${nextStep}` as any);
    } else {
      // If no next step, onboarding is complete - go to main app
      router.replace('/(tabs)/');
    }
  };
  
  const handleBack = () => {
    router.back();
  };
  
  // Define photo grid data types
  type PhotoGridItem = 
    | { type: 'potato'; key: string }
    | { type: 'personality'; key: string }
    | { type: 'photo'; uri: string; index: number; key: string }
    | { type: 'add_photo'; key: string };

  // Render the photo grid with drag and drop functionality
  const renderPhotoGrid = () => {
    // Prepare data for the draggable list
    const gridItems: PhotoGridItem[] = [];
    
    // Add potato default if showing (for place listers)
    if (showPotatoDefault && !personalityImage && photos.length === 0) {
      gridItems.push({ type: 'potato', key: 'potato-default' });
    }
    
    // Add personality image if showing and no uploaded photos
    if (personalityImage && photos.length === 0) {
      gridItems.push({ type: 'personality', key: 'personality-image' });
    }
    
    // Add uploaded photos (these are draggable)
    photos.forEach((photo, index) => {
      gridItems.push({ 
        type: 'photo', 
        uri: photo, 
        index, 
        key: `photo-${index}-${photo.substring(photo.length - 10)}` 
      });
    });
    
    // Add photo button if under limit
    if ((photos.length + (hasPersonalityImage || showPotatoDefault ? 1 : 0)) < 5) {
      gridItems.push({ type: 'add_photo', key: 'add-photo-button' });
    }
    
    const renderPhotoItem = ({ item, drag, isActive }: RenderItemParams<PhotoGridItem>) => {
      if (item.type === 'potato') {
        return (
          <View style={[
            styles.photoContainer, 
            styles.personalityContainer,
            profilePhotoIndex === -2 && styles.profilePhotoContainer
          ]}>
            <Image 
              source={potatoImage} 
              style={[styles.personalityImage, styles.defaultProfilePhoto]} 
              resizeMode="contain"
            />
            <View style={styles.profileBadge}>
              <Text style={styles.profileBadgeText}>Profile</Text>
            </View>
          </View>
        );
      }
      
      if (item.type === 'personality') {
        return (
          <View style={[
            styles.photoContainer, 
            styles.personalityContainer,
            profilePhotoIndex === -1 && styles.profilePhotoContainer
          ]}>
            <Image 
              source={personalityImage} 
              style={[styles.personalityImage, styles.defaultProfilePhoto]} 
              resizeMode="contain"
            />
            {photos.length > 0 && (
              <TouchableOpacity
                style={styles.removeButton}
                onPress={removePersonalityPhoto}
              >
                <X size={16} color="#FFFFFF" />
              </TouchableOpacity>
            )}
            <View style={styles.profileBadge}>
              <Text style={styles.profileBadgeText}>Profile</Text>
            </View>
          </View>
        );
      }
      
      if (item.type === 'photo') {
        const isFirstPhoto = item.index === 0;
        return (
          <View style={[
            styles.photoContainer,
            isFirstPhoto && styles.profilePhotoContainer,
            isActive && { opacity: 0.7, transform: [{ scale: 1.05 }] }
          ]}>
            <TouchableOpacity
              onLongPress={drag}
              disabled={isActive}
              style={{ flex: 1 }}
            >
              <Image source={{ uri: item.uri }} style={styles.photo} />
              {isFirstPhoto && (
                <View style={styles.profileBadge}>
                  <Text style={styles.profileBadgeText}>Profile</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removePhoto(item.index)}
            >
              <X size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        );
      }
      
      if (item.type === 'add_photo') {
        return (
          <TouchableOpacity
            style={styles.addPhotoButton}
            onPress={addPhoto}
          >
            <ImageIcon size={24} color="#6366F1" />
            <Text style={styles.addPhotoText}>Add Photo</Text>
          </TouchableOpacity>
        );
      }
      
      return null;
    };
    
    // Handle drag end for photos only
    const handleDragEnd = ({ data }: { data: PhotoGridItem[] }) => {
      // Extract only photo items from the reordered data
      const photoItems = data.filter((item): item is Extract<PhotoGridItem, { type: 'photo' }> => 
        item.type === 'photo'
      );
      const reorderedPhotos = photoItems.map(item => item.uri);
      
      if (reorderedPhotos.length > 0) {
        handleReorderPhotos(reorderedPhotos);
      }
    };
    
    return (
      <View style={styles.photoGrid}>
        <DraggableFlatList
          data={gridItems}
          renderItem={renderPhotoItem}
          keyExtractor={(item) => item.key}
          onDragEnd={handleDragEnd}
          numColumns={3}
          scrollEnabled={false}
          contentContainerStyle={styles.draggableContainer}
        />
      </View>
    );
  };

  // Determine the actual picker component to render
  const renderDatePicker = () => {
      const pickerProps: any = {
          testID: "dateTimePicker",
          value: dateOfBirth || eighteenYearsAgo,
          mode: "date",
          display: Platform.OS === 'ios' ? 'spinner' : 'default',
          onChange: onDateChange,
          maximumDate: eighteenYearsAgo,
          minimumDate: hundredYearsAgo,
          style: Platform.OS === 'ios' ? styles.iosSpinnerPicker : {},
      };

      if (Platform.OS === 'ios') {
          pickerProps.theme = 'light'; // Keep just in case
          // Explicitly set text color for iOS
          pickerProps.textColor = '#000000'; 
      }

      // Cast props to any to bypass TypeScript error for the theme/textColor prop
      return <DateTimePicker {...pickerProps as any} />;
  };

  return (
    <OnboardingTemplate
      step={currentStepIndex}
      totalSteps={totalSteps}
      onBackPress={handleBack}
      onContinuePress={handleContinue}
      continueDisabled={!isFormReady()}
      title="Show Your Best Self"
      subtitle="Add photos and confirm your age"
      greeting={`Hey ${user?.name ? user.name : 'there'}`}
      buttonPosition="relative"
      disableScroll={false}
    >
      <View style={styles.container}>
        {/* Photo Upload Section */}
        <Text style={styles.sectionTitle}>Your Photos</Text>
        <Text style={styles.description}>
          Add at least one photo that represents your personality.
        </Text>
        
        <View style={styles.photoGrid}>
          {/* Potato Default Image - Show for place listers without personality type */}
          {showPotatoDefault && !personalityImage && (
            <View style={[
              styles.photoContainer, 
              styles.personalityContainer,
              profilePhotoIndex === -2 && styles.profilePhotoContainer
            ]}>
              <Image 
                source={potatoImage} 
                style={[styles.personalityImage, styles.defaultProfilePhoto]} 
                resizeMode="contain"
              />
              {/* Show Profile badge - potato is always the default for place listers */}
              <View style={styles.profileBadge}>
                <Text style={styles.profileBadgeText}>Profile</Text>
              </View>
            </View>
          )}

          {/* Personality Image - Only show if we have a valid one */}
          {personalityImage && (
            <View style={[
              styles.photoContainer, 
              styles.personalityContainer,
              profilePhotoIndex === -1 && styles.profilePhotoContainer
            ]}>
              <Image 
                source={personalityImage} 
                style={[styles.personalityImage, styles.defaultProfilePhoto]} 
                resizeMode="contain"
              />
              {/* Only show remove button if user has other photos */}
              {photos.length > 0 && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={removePersonalityPhoto}
                >
                  <X size={16} color="#FFFFFF" />
                </TouchableOpacity>
              )}
              {/* Show Profile badge if this is the profile photo */}
              {profilePhotoIndex === -1 ? (
                <View style={styles.profileBadge}>
                  <Text style={styles.profileBadgeText}>Profile</Text>
                </View>
              ) : (
                /* Only show Set as Profile button if there are multiple photos */
                photos.length > 0 && (
                  <TouchableOpacity 
                    style={styles.setProfileButton}
                    onPress={() => setAsProfilePhoto(-1)}
                  >
                    <Text style={styles.setProfileText}>Set as Profile</Text>
                  </TouchableOpacity>
                )
              )}
            </View>
          )}

          {/* User Uploaded Photos */}
          {photos.map((photo, index) => (
            <View 
              key={index} 
              style={[
                styles.photoContainer,
                profilePhotoIndex === index && styles.profilePhotoContainer
              ]}
            >
              <Image source={{ uri: photo }} style={styles.photo} />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removePhoto(index)}
              >
                <X size={16} color="#FFFFFF" />
              </TouchableOpacity>
              
              {/* Show Profile badge if this is the profile photo */}
              {profilePhotoIndex === index ? (
                <View style={styles.profileBadge}>
                  <Text style={styles.profileBadgeText}>Profile</Text>
                </View>
              ) : (
                /* Only show Set as Profile button if there are multiple photos total */
                (photos.length > 1 || hasPersonalityImage) && (
                  <TouchableOpacity 
                    style={styles.setProfileButton}
                    onPress={() => setAsProfilePhoto(index)}
                  >
                    <Text style={styles.setProfileText}>Set as Profile</Text>
                  </TouchableOpacity>
                )
              )}
            </View>
          ))}
          
          {/* Add Photo Button */}
          {(photos.length + (hasPersonalityImage ? 1 : 0)) < 5 && ( // Limit total photos
            <TouchableOpacity
              style={styles.addPhotoButton}
              onPress={addPhoto}
            >
              <ImageIcon size={24} color="#6366F1" />
              <Text style={styles.addPhotoText}>Add Photo</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {/* Help text for profile photo selection - only show when multiple photos exist */}
        {((photos.length > 1) || (photos.length > 0 && hasPersonalityImage)) && (
          <View style={styles.helpTextContainer}>
            <Text style={styles.helpText}>
              Tap 'Set as Profile' to change your profile photo
            </Text>
          </View>
        )}
        
        <Text style={styles.sectionTitle}>Date of Birth</Text>
        <TouchableOpacity onPress={showDatepickerModal} style={styles.dateInput}>
            <CalendarIcon size={20} color="#6B7280" style={styles.dateIcon} />
            <Text style={[styles.dateText, !dateOfBirth && styles.placeholderText]}>
                {dateOfBirth ? format(dateOfBirth, 'MMMM d, yyyy') : 'Select your date of birth'}
            </Text>
        </TouchableOpacity>

        {/* Render Android picker directly if visible */}
        {Platform.OS === 'android' && showDatePicker && renderDatePicker()}
      </View>

      {/* iOS Date Picker Modal */}
      {Platform.OS === 'ios' && (
          <Modal
              transparent={true}
              animationType="fade"
              visible={showDatePicker}
              onRequestClose={handleDatePickerDone}
          >
              {/* Outer Touchable handles closing on overlay tap */}
              <TouchableWithoutFeedback onPress={handleDatePickerDone}> 
                  <View style={styles.modalOverlay}> 
                      {/* Add touch handlers directly to the container View */}
                      <View 
                          style={styles.modalPickerContainer}
                          onStartShouldSetResponder={() => true} // Prevent scroll etc. from triggering press
                          onTouchEnd={(e) => { e.stopPropagation(); }} // Stop tap from propagating to overlay
                      >
                          {renderDatePicker()} 
                          <TouchableOpacity onPress={handleDatePickerDone} style={styles.iosPickerDoneButton}>
                              <Text style={styles.iosPickerDoneText}>Done</Text>
                          </TouchableOpacity>
                      </View>
                  </View>
              </TouchableWithoutFeedback>
          </Modal>
      )}
    </OnboardingTemplate>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
    marginBottom: 24,
    justifyContent: 'flex-start',
  },
  photoContainer: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  profilePhotoContainer: {
    borderWidth: 3,
    borderColor: '#6366F1', // Indigo color for the profile photo border
  },
  personalityContainer: {
    backgroundColor: '#F9FAFB',
  },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  personalityImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  defaultProfilePhoto: {
    backgroundColor: '#F3F4F6',
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
  profileBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#6366F1',
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderTopLeftRadius: 4,
    alignItems: 'center',
  },
  profileBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  setProfileButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: 3,
    alignItems: 'center',
  },
  setProfileText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  addPhotoButton: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 12,
    backgroundColor: '#F9FAFB',
  },
  addPhotoText: {
    marginTop: 8,
    fontSize: 12,
    color: '#6366F1',
  },
  helpTextContainer: {
    marginBottom: 16,
    marginTop: 8,
    alignItems: 'center',
  },
  helpText: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 8,
    color: '#111827',
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    backgroundColor: '#F9FAFB',
  },
  dateIcon: {
    marginRight: 12,
  },
  dateText: {
    fontSize: 16,
    color: '#111827',
  },
  placeholderText: {
    color: '#9CA3AF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalPickerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    width: '80%',
    maxWidth: 400,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 16,
  },
  iosSpinnerPicker: {
    height: 200,
    alignSelf: 'stretch',
  },
  iosPickerDoneButton: {
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 8,
    backgroundColor: '#6366F1',
    borderRadius: 8,
  },
  iosPickerDoneText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 24,
  },
  draggableContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
