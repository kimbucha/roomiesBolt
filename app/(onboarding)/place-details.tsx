console.log('[PlaceDetails] Module Loaded');

import React, { useRef, useEffect } from 'react';
import { View, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import OnboardingTemplate from '../../components/features/onboarding/OnboardingTemplate';
import { useSupabaseUserStore } from '../../store/supabaseUserStore';
import { showToast } from '../../components/common/Toast';
import { PlaceDetailsProvider, usePlaceDetails } from '../../contexts/PlaceDetailsContext';
import { getStepNumber, getTotalSteps, ONBOARDING_STEPS } from '../../store/onboardingConfig';
import { StepProgressIndicator } from '../../components/features/onboarding/place-listing';
import BasicInfoStep from '../../components/features/onboarding/place-listing/BasicInfoStep';
import LeaseInfoStep from '../../components/features/onboarding/place-listing/LeaseInfoStep';
import UtilitiesStep from '../../components/features/onboarding/place-listing/UtilitiesStep';
import AmenitiesStep from '../../components/features/onboarding/place-listing/AmenitiesStep';
import PhotosDescriptionStep from '../../components/features/onboarding/place-listing/PhotosDescriptionStep';
import { SupabasePlaceDetailsSync } from '../../services/supabasePlaceDetailsSync';

// Step titles for the progress indicator - updated to 5 steps
const STEP_TITLES = [
  '1 of 5 - Basic Information',
  '2 of 5 - Availability & Lease Terms', 
  '3 of 5 - Utilities',
  '4 of 5 - Amenities',
  '5 of 5 - Photos & Description'
];

/**
 * Main content component for the place details screen
 * Uses the PlaceDetailsContext for state management
 */
function PlaceDetailsContent() {
  const router = useRouter();
  const { userRole: paramUserRole } = useLocalSearchParams();
  const { user, updateUserAndProfile, updateOnboardingProgress, onboardingProgress } = useSupabaseUserStore();
  const { currentStep, nextStep, prevStep, isStepComplete, placeDetails } = usePlaceDetails();
  
  // Use userRole from navigation params if available, fallback to user store
  const effectiveUserRole = paramUserRole || user?.userRole;
  
  // Place details is step 1 of the simplified place lister flow
  const currentStepNumber = getStepNumber('place-details', effectiveUserRole);
  const totalSteps = getTotalSteps(effectiveUserRole); // Gets correct total for user's flow
  
  // Use useEffect to prevent infinite re-renders from console.log statements
  useEffect(() => {
    console.log('[PlaceDetails] PlaceDetailsContent Rendered, Step:', currentStep);
    console.log('[PlaceDetails] User Role from store:', user?.userRole);
    console.log('[PlaceDetails] User Role from params:', paramUserRole);
    console.log('[PlaceDetails] Effective User Role:', effectiveUserRole);
    console.log('[PlaceDetails] Current Step Number:', currentStepNumber);
    console.log('[PlaceDetails] Total Steps:', totalSteps);
  }, [currentStep, user?.userRole, paramUserRole, effectiveUserRole, currentStepNumber, totalSteps]);

  // Handle continue button press
  const handleContinue = async () => {
    console.log('[PlaceDetails] handleContinue called, currentStep:', currentStep);
    console.log('[PlaceDetails] Step 5 complete:', isStepComplete(5));
    console.log('[PlaceDetails] Photos:', placeDetails.photos.length, 'Description:', placeDetails.description);
    
    if (currentStep < 5) {
      nextStep();
    } else {
      // Save place details to user profile and sync with roommate profile
      // Update user preferences with room type
      const preferences = user?.preferences || {
        notifications: true,
        darkMode: false,
        language: 'en'
      };
      
      // Save place details to user profile and sync with roommate profile
      const result = await updateUserAndProfile({
        userRole: 'place_lister',
        hasPlace: true,
        preferences: {
          ...preferences,
          roomType: placeDetails.roomType
        },
        placeDetails: {
          bedrooms: placeDetails.bedrooms,
          bathrooms: placeDetails.bathrooms,
          monthlyRent: placeDetails.monthlyRent,
          address: placeDetails.address,
          moveInDate: placeDetails.moveInDate,
          leaseDuration: placeDetails.leaseDuration,
          utilitiesIncluded: placeDetails.utilitiesIncluded,
          estimatedUtilitiesCost: placeDetails.estimatedUtilitiesCost,
          amenities: placeDetails.amenities,
          photos: placeDetails.photos,
          description: placeDetails.description
        }
      }, { validate: true });
      
      if (!result.success) {
        showToast('Error saving place details: ' + result.error, 'error');
        return;
      }
      
      // NEW: Sync place details to Supabase roommate_profiles table
      const syncResult = await SupabasePlaceDetailsSync.syncPlaceDetailsToProfile(user?.id!, placeDetails);
      if (!syncResult.success) {
        console.warn('[PlaceDetails] Failed to sync to roommate profile:', syncResult.error);
        // Don't block user flow, but log the error
        showToast('Place details saved (sync pending)', 'info');
      } else {
        showToast('Place details saved successfully!', 'success');
      }
      
      // Update onboarding progress
      console.log('[PlaceDetails] Updating onboarding progress and navigating...');
      const updatedCompletedSteps = [...(onboardingProgress?.completedSteps || [])];
      if (!updatedCompletedSteps.includes('place-details')) {
        updatedCompletedSteps.push('place-details');
      }
      
      const progressResult = await updateOnboardingProgress({
        currentStep: 'photos', // Navigate to photos (step 2 for place listers)
        completedSteps: updatedCompletedSteps
      });
      
      console.log('[PlaceDetails] Onboarding progress updated:', progressResult);
      
      // Navigate to photos page (step 2 for place listers)
      console.log('[PlaceDetails] Navigating to photos...');
      router.push({
        pathname: '/(onboarding)/photos',
        params: { userRole: effectiveUserRole }
      });
    }
  };

  // Handle back button press
  const handleBack = () => {
    if (currentStep > 1) {
      prevStep();
    } else {
      router.back();
    }
  };

  // Render the current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <BasicInfoStep />;
      case 2:
        return <LeaseInfoStep />;
      case 3:
        return <UtilitiesStep />;
      case 4:
        return <AmenitiesStep />;
      case 5:
        return <PhotosDescriptionStep />;
      default:
        return null;
    }
  };

  return (
    <OnboardingTemplate
      step={currentStepNumber}
      totalSteps={totalSteps}
      onBackPress={handleBack}
      onContinuePress={handleContinue}
      continueDisabled={!isStepComplete(currentStep)}
      title="Tell us about your place"
      subtitle="Help potential roommates find your listing"
      greeting={`Hey ${user?.name ? user.name : 'there'}`}
      buttonPosition="relative"
    >
      <View style={{ flex: 1 }}>
        <StepProgressIndicator 
          currentStep={currentStep} 
          totalSteps={5} 
          stepTitles={STEP_TITLES} 
        />
        
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAwareScrollView 
            style={{ flex: 1 }}
          contentContainerStyle={{ 
            paddingHorizontal: 16, 
              paddingBottom: 20
          }}
          keyboardShouldPersistTaps="handled"
          enableOnAndroid={true}
          enableAutomaticScroll={true}
          extraScrollHeight={20}
          extraHeight={20}
          keyboardDismissMode="interactive"
          keyboardOpeningTime={0}
          enableResetScrollToCoords={false}
            scrollIndicatorInsets={{ right: 1 }}
            showsVerticalScrollIndicator={true}
        >
          {renderStepContent()}
        </KeyboardAwareScrollView>
      </TouchableWithoutFeedback>
      </View>
    </OnboardingTemplate>
  );
}

/**
 * Wrapper component that provides the PlaceDetailsContext
 * This is the default export used by the router
 */
export default function PlaceDetailsScreen() {
  return (
    <PlaceDetailsProvider>
      <PlaceDetailsContent />
    </PlaceDetailsProvider>
  );
}
