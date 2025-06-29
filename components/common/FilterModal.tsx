import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Switch, Animated, Easing } from 'react-native';
import { BlurView } from 'expo-blur';
import { X, Wifi, ChefHat, Car, Dog, Wind, Dumbbell, Waves, Home, Sofa } from 'lucide-react-native';
import Slider from '@react-native-community/slider';
import { Button } from './Button';
import RangeSlider from '../RangeSlider';
import { SearchFilters, usePreferencesStore } from '../../store/preferencesStore';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
}

// Helper component for filter sections
const FilterSection: React.FC<{ title: string; children: React.ReactNode; isFirst?: boolean }> = ({ title, children, isFirst = false }) => (
  <View style={[styles.filterSection, isFirst && styles.filterSectionFirst]}>
    <Text style={[styles.sectionTitle, isFirst && styles.sectionTitleFirst]}>{title}</Text>
    {children}
  </View>
);

// Helper component for row items (like toggles)
const FilterRowItem: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <View style={styles.rowItem}>
    <Text style={styles.rowLabel}>{label}</Text>
    {children}
  </View>
);

// Helper for Segmented Controls
const SegmentedControl: React.FC<{
  options: { label: string; value: any }[];
  selectedValue: any;
  onValueChange: (value: any) => void;
}> = ({ options, selectedValue, onValueChange }) => (
  <View style={styles.radioGroup}>
    {options.map((option) => (
      <TouchableOpacity
        key={option.value}
        style={[
          styles.radioButton,
          selectedValue === option.value && styles.radioButtonActive,
        ]}
        onPress={() => onValueChange(option.value)}
      >
        <Text
          style={[
            styles.radioLabel,
            selectedValue === option.value && styles.radioLabelActive,
          ]}
        >
          {option.label}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
);

export const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
}) => {
  const { searchFilters, updateSearchFilters, resetSearchFilters } = usePreferencesStore();
  
  // Initialize local state with defaults if not present in searchFilters
  const [localFilters, setLocalFilters] = useState<SearchFilters>(() => {
     const defaults: SearchFilters = {
        lookingFor: 'roommate',
        gender: 'any',
        hasPlace: false, // Default filter state for 'listing available'
        budget: { min: 0, max: 3500 },
        maxDistance: 20,
        ageRange: { min: 18, max: 35 },
        lifestyle: { nonSmoker: undefined, petFriendly: undefined }, // Use undefined for optional toggles
        account: { verifiedOnly: false },
        placeDetails: { roomType: 'any', furnished: undefined },
        university: [], // Ensure all keys from SearchFilters are here
        location: [],   // Ensure all keys from SearchFilters are here
        // Add any other top-level keys from SearchFilters interface if they exist
    };

    // Start with defaults
    let initialFilters = { ...defaults };

    // Merge top-level keys from global state if they exist and are not objects/arrays needing deep merge
    for (const key in searchFilters) {
        const typedKey = key as keyof SearchFilters;
        if (typedKey in initialFilters && typeof initialFilters[typedKey] !== 'object' && typeof (searchFilters as any)[typedKey] !== 'undefined') {
            (initialFilters as any)[typedKey] = (searchFilters as any)[typedKey];
        }
    }

    // Carefully merge nested objects, preserving defaults if global state is missing keys
    initialFilters.budget = { ...defaults.budget, ...(searchFilters.budget || {}) };
    initialFilters.budget.max = Math.min(initialFilters.budget.max, defaults.budget.max);
    initialFilters.ageRange = { ...defaults.ageRange, ...(searchFilters.ageRange || {}) };
    initialFilters.ageRange.max = Math.min(initialFilters.ageRange.max, defaults.ageRange.max);
    initialFilters.lifestyle = { ...defaults.lifestyle, ...(searchFilters.lifestyle || {}) };
    initialFilters.account = { ...defaults.account, ...(searchFilters.account || {}) };
    initialFilters.placeDetails = { ...defaults.placeDetails, ...(searchFilters.placeDetails || {}) };

    // Merge arrays specifically
    if (searchFilters.university && Array.isArray(searchFilters.university)) {
        initialFilters.university = [...searchFilters.university];
    }
    if (searchFilters.location && Array.isArray(searchFilters.location)) {
        initialFilters.location = [...searchFilters.location];
    }

    // Log the final initialized state for debugging
    console.log("[FilterModal] Initialized localFilters:", JSON.stringify(initialFilters, null, 2));

    return initialFilters;
});

  // Animation values
  const [blurVisible, setBlurVisible] = useState(false);
  const slideAnim = useState(new Animated.Value(0))[0];
  const blurAnim = useState(new Animated.Value(0))[0];
  
  useEffect(() => {
    if (visible) {
      // First show the blur
      setBlurVisible(true);
      Animated.timing(blurAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease)
      }).start(() => {
        // Then slide up the sheet
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease)
        }).start();
      });
    } else {
      // First slide down the sheet
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.in(Easing.ease)
      }).start(() => {
        // Then fade out the blur
        Animated.timing(blurAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
          easing: Easing.in(Easing.ease)
        }).start(() => {
          setBlurVisible(false);
        });
      });
    }
  }, [visible]);
  
  // Create a ref to track initial render
  const isInitialRender = React.useRef(true);
  
  // REMOVED: The useEffect that was causing infinite loops
  
  // Effect to handle lookingFor changes
  useEffect(() => {
    if (localFilters.lookingFor === 'place') {
      // When switching to place, automatically set hasPlace to true
      updateNestedFilter(['hasPlace'], true);
      console.log('[FilterModal] Set hasPlace to true when switching to place listings');
    }
  }, [localFilters.lookingFor]);
  
  // Instead, we'll sync the localFilters with searchFilters only when the modal becomes visible
  useEffect(() => {
    if (visible) {
      console.log("[FilterModal] Modal became visible, syncing with global filters");
      
      // If looking for places, make sure hasPlace is true
      if (localFilters.lookingFor === 'place') {
        setLocalFilters(prev => ({
          ...prev,
          hasPlace: true
        }));
        console.log('[FilterModal] Auto-set hasPlace to true for place listings');
      }
      // Only update localFilters when the modal becomes visible
      const defaults: SearchFilters = {
        lookingFor: 'roommate',
        gender: 'any',
        hasPlace: false,
        budget: { min: 0, max: 3500 },
        maxDistance: 20,
        ageRange: { min: 18, max: 35 },
        lifestyle: { nonSmoker: undefined, petFriendly: undefined },
        account: { verifiedOnly: false },
        placeDetails: { roomType: 'any', furnished: undefined },
        university: [],
        location: [],
      };

      // Create a new filters object from defaults and current searchFilters
      const newFilters = { ...defaults };
      
      // Merge top-level keys
      for (const key in searchFilters) {
        const typedKey = key as keyof SearchFilters;
        if (typedKey in newFilters && typeof newFilters[typedKey] !== 'object' && typeof (searchFilters as any)[typedKey] !== 'undefined') {
          (newFilters as any)[typedKey] = (searchFilters as any)[typedKey];
        }
      }
      
      // Merge nested objects
      newFilters.budget = { ...defaults.budget, ...(searchFilters.budget || {}) };
      newFilters.budget.max = Math.min(newFilters.budget.max, defaults.budget.max);
      newFilters.ageRange = { ...defaults.ageRange, ...(searchFilters.ageRange || {}) };
      newFilters.ageRange.max = Math.min(newFilters.ageRange.max, defaults.ageRange.max);
      newFilters.lifestyle = { ...defaults.lifestyle, ...(searchFilters.lifestyle || {}) };
      newFilters.account = { ...defaults.account, ...(searchFilters.account || {}) };
      newFilters.placeDetails = { ...defaults.placeDetails, ...(searchFilters.placeDetails || {}) };
      
      // Merge arrays
      if (searchFilters.university && Array.isArray(searchFilters.university)) {
        newFilters.university = [...searchFilters.university];
      }
      if (searchFilters.location && Array.isArray(searchFilters.location)) {
        newFilters.location = [...searchFilters.location];
      }
      
      // Set the local filters
      setLocalFilters(newFilters);
    }
  }, [visible]); // Only depend on the visible prop, not searchFilters

  const sectionHeaderIndices = useMemo(() => {
    const indices: number[] = [0, 1];
    if (localFilters.lookingFor === 'place') {
      // 'Place Details' at index 2 and 'Lifestyle & Account' at 3
      indices.push(2, 3);
    } else {
      // 'Lifestyle & Account' at index 2
      indices.push(2);
    }
    return indices;
  }, [localFilters.lookingFor]);

  const handleSave = () => {
    // Ensure hasPlace is set correctly based on lookingFor
    const updatedFilters = { ...localFilters };
    if (updatedFilters.lookingFor === 'place') {
      updatedFilters.hasPlace = true;
      console.log('[FilterModal] Auto-setting hasPlace to true for place listings on save');
    }
    
    // Update the filters in the store
    updateSearchFilters(updatedFilters);
    
    // Close the modal
    onClose();
  };
  
  const handleReset = () => {
    resetSearchFilters();
  };
  
  const updateNestedFilter = (keys: string[], value: any) => {
    setLocalFilters(prev => {
      const newState = JSON.parse(JSON.stringify(prev));
      let currentLevel: any = newState;
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (currentLevel[key] === undefined || currentLevel[key] === null || typeof currentLevel[key] !== 'object') {
             currentLevel[key] = {};
        }
        currentLevel = currentLevel[key];
      }
      currentLevel[keys[keys.length - 1]] = value;

      // Add specific logic for range sliders to prevent min > max or max < min
      if (keys[0] === 'budget' || keys[0] === 'ageRange') {
          const rangeKey = keys[0];
          const typeKey = keys[1] as 'min' | 'max';
          const currentValue = value;
          const otherTypeKey = typeKey === 'min' ? 'max' : 'min';
          const otherValue = newState[rangeKey][otherTypeKey];
          if (typeKey === 'min' && currentValue > otherValue) {
              newState[rangeKey][otherTypeKey] = currentValue; // Max follows Min
          } else if (typeKey === 'max' && currentValue < otherValue) {
               newState[rangeKey][otherTypeKey] = currentValue; // Min follows Max
          }
      }
      return newState;
    });
  };
  
  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={blurVisible}
      onRequestClose={onClose}
    >
      <Animated.View 
        style={[styles.modalContainer, { opacity: blurAnim }]}
      >
        <BlurView
          intensity={20}
          style={styles.blurView}
          tint="dark"
        />
        <TouchableOpacity 
          style={styles.blurTouchable} 
          activeOpacity={1} 
          onPress={onClose}
        />
        <Animated.View 
          style={[styles.modalContent, {
            transform: [{
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [600, 0]
              })
            }]
          }]}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filters</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#4B5563" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            <FilterSection title="Looking For" isFirst={true}>
              <SegmentedControl
                options={[
                  { label: 'Roommate', value: 'roommate' },
                  { label: 'Place', value: 'place' },
                ]}
                selectedValue={localFilters.lookingFor}
                onValueChange={(value) => updateNestedFilter(['lookingFor'], value)}
              />
            </FilterSection>
            
            <FilterSection title="Preferences">
              {(localFilters.lookingFor === 'roommate' || localFilters.lookingFor === 'place') && (
                <View style={styles.subSection}>
                  <Text style={styles.subSectionTitle}>Maximum Distance</Text>
                  <Text style={styles.valueText}>{localFilters.maxDistance} miles</Text>
                  <Slider
                    style={styles.slider}
                    minimumValue={1}
                    maximumValue={50}
                    step={1}
                    value={localFilters.maxDistance}
                    onValueChange={(value) => updateNestedFilter(['maxDistance'], value)}
                    minimumTrackTintColor="#4F46E5"
                    maximumTrackTintColor="#D1D5DB"
                    thumbTintColor="#4F46E5"
                  />
                </View>
              )}
              {(localFilters.lookingFor === 'roommate' || localFilters.lookingFor === 'place') && (
                <View style={styles.dividerLine} />
              )}
              <View style={styles.subSection}>
                <Text style={styles.subSectionTitle}>Budget Range</Text>
                <RangeSlider 
                    minValue={0}
                    maxValue={3500} 
                    step={100}
                    initialLowValue={localFilters.budget.min}
                    initialHighValue={localFilters.budget.max}
                    onValueChange={(low, high) => {
                        setLocalFilters(prev => ({
                            ...prev,
                            budget: { min: low, max: high }
                        }));
                    }}
                />
              </View>
              {localFilters.lookingFor === 'roommate' && (
                <View style={styles.dividerLine} />
              )}
              {localFilters.lookingFor === 'roommate' && (
                <View style={styles.subSection}>
                  <Text style={styles.subSectionTitle}>Age Range</Text>
                  <RangeSlider
                      minValue={18}
                      maxValue={35}
                      step={1}
                      initialLowValue={localFilters.ageRange.min}
                      initialHighValue={localFilters.ageRange.max}
                      onValueChange={(low, high) => {
                           setLocalFilters(prev => ({
                              ...prev,
                              ageRange: { min: low, max: high }
                          }));
                      }}
                      label="Age"
                      unit=""
                  />
                </View>
              )}
              {localFilters.lookingFor === 'roommate' && (
                <>
                  <View style={styles.subSection}>
                    <Text style={styles.subSectionTitle}>Gender</Text>
                    <SegmentedControl
                      options={[
                        { label: 'Male', value: 'male' },
                        { label: 'Female', value: 'female' },
                        { label: 'Any', value: 'any' },
                      ]}
                      selectedValue={localFilters.gender}
                      onValueChange={(value) => updateNestedFilter(['gender'], value)}
                    />
                  </View>
                  
                  <View style={styles.subSection}>
                    <Text style={styles.subSectionTitle}>Profile Type</Text>
                    <SegmentedControl
                      options={[
                        { label: 'Student', value: 'student' },
                        { label: 'Professional', value: 'professional' },
                        { label: 'Any', value: 'any' },
                      ]}
                      selectedValue={(localFilters as any).profileType || 'any'}
                      onValueChange={(value) => updateNestedFilter(['profileType'], value)}
                    />
                  </View>
                </>
              )}
            </FilterSection>
            
            {/* Place-specific filters - Only show when looking for places */}
            {localFilters.lookingFor === 'place' && (
              <>
                {/* Room Type section */}
                <FilterSection title="Room Type">
                  <SegmentedControl
                    options={[
                      { label: 'Private', value: 'private' },
                      { label: 'Shared', value: 'shared' },
                      { label: 'Any', value: 'any' },
                    ]}
                    selectedValue={localFilters.placeDetails.roomType}
                    onValueChange={(value) => updateNestedFilter(['placeDetails', 'roomType'], value)}
                  />
                </FilterSection>

                {/* Beds and Baths section */}
                <FilterSection title="Beds and Baths">
                  <View style={styles.counterSectionCompact}>
                    <View style={styles.counterRow}>
                      <Text style={styles.counterLabel}>Bedrooms</Text>
                      <View style={styles.counterContainer}>
                        <TouchableOpacity 
                          style={[styles.counterButton, (localFilters.placeDetails?.bedrooms || 0) <= 0 && styles.counterButtonDisabled]}
                          onPress={() => updateNestedFilter(['placeDetails', 'bedrooms'], Math.max(0, (localFilters.placeDetails?.bedrooms || 0) - 1))}
                          disabled={(localFilters.placeDetails?.bedrooms || 0) <= 0}
                        >
                          <Text style={[styles.counterButtonText, (localFilters.placeDetails?.bedrooms || 0) <= 0 && styles.counterButtonTextDisabled]}>−</Text>
                        </TouchableOpacity>
                        <Text style={styles.counterValue}>{localFilters.placeDetails?.bedrooms || 'Any'}</Text>
                        <TouchableOpacity 
                          style={styles.counterButton}
                          onPress={() => updateNestedFilter(['placeDetails', 'bedrooms'], (localFilters.placeDetails?.bedrooms || 0) + 1)}
                        >
                          <Text style={styles.counterButtonText}>+</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    
                    <View style={styles.counterRow}>
                      <Text style={styles.counterLabel}>Bathrooms</Text>
                      <View style={styles.counterContainer}>
                        <TouchableOpacity 
                          style={[styles.counterButton, (localFilters.placeDetails?.bathrooms || 0) <= 0 && styles.counterButtonDisabled]}
                          onPress={() => updateNestedFilter(['placeDetails', 'bathrooms'], Math.max(0, (localFilters.placeDetails?.bathrooms || 0) - 1))}
                          disabled={(localFilters.placeDetails?.bathrooms || 0) <= 0}
                        >
                          <Text style={[styles.counterButtonText, (localFilters.placeDetails?.bathrooms || 0) <= 0 && styles.counterButtonTextDisabled]}>−</Text>
                        </TouchableOpacity>
                        <Text style={styles.counterValue}>{localFilters.placeDetails?.bathrooms || 'Any'}</Text>
                        <TouchableOpacity 
                          style={styles.counterButton}
                          onPress={() => updateNestedFilter(['placeDetails', 'bathrooms'], (localFilters.placeDetails?.bathrooms || 0) + 1)}
                        >
                          <Text style={styles.counterButtonText}>+</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </FilterSection>

                {/* Move-in Timing section */}
                <FilterSection title="Move-in Timing">
                  <SegmentedControl
                    options={[
                      { label: 'ASAP', value: 'asap' },
                      { label: 'Within 1 month', value: 'within_month' },
                      { label: 'Flexible', value: 'flexible' },
                    ]}
                    selectedValue={(localFilters.placeDetails as any).moveInTiming || 'flexible'}
                    onValueChange={(value) => updateNestedFilter(['placeDetails', 'moveInTiming'], value)}
                  />
                </FilterSection>

                {/* Amenities section */}
                <FilterSection title="Amenities">
                  <View style={styles.amenitiesGrid}>
                    {[
                      { id: 'wifi', label: 'Wifi', icon: Wifi },
                      { id: 'kitchen', label: 'Kitchen', icon: ChefHat },
                      { id: 'parking', label: 'Parking', icon: Car },
                      { id: 'pets', label: 'Allows pets', icon: Dog },
                      { id: 'ac', label: 'Air conditioning', icon: Wind },
                      { id: 'gym', label: 'Gym', icon: Dumbbell },
                      { id: 'pool', label: 'Pool', icon: Waves },
                      { id: 'laundry', label: 'Laundry', icon: Home },
                      { id: 'furnished', label: 'Furnished', icon: Sofa },
                    ].map((amenity) => {
                      const IconComponent = amenity.icon;
                      const isSelected = (localFilters.placeDetails as any)?.[amenity.id];
                      return (
                        <TouchableOpacity
                          key={amenity.id}
                          style={[
                            styles.amenityChip,
                            isSelected && styles.amenityChipSelected
                          ]}
                          onPress={() => updateNestedFilter(['placeDetails', amenity.id], !isSelected)}
                        >
                          <IconComponent 
                            size={18} 
                            color={isSelected ? '#4F46E5' : '#6B7280'} 
                            style={styles.amenityIconSpacing}
                          />
                          <Text style={[
                            styles.amenityLabel,
                            isSelected && styles.amenityLabelSelected
                          ]}>
                            {amenity.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </FilterSection>
              </>
            )}


            
            <FilterSection title="Lifestyle & Compatibility">
              {localFilters.lookingFor === 'roommate' && (
                <>
                  <View style={styles.subSection}>
                    <Text style={styles.subSectionTitle}>Cleanliness Level</Text>
                    <SegmentedControl
                      options={[
                        { label: 'Relaxed', value: 'relaxed' },
                        { label: 'Moderate', value: 'moderate' },
                        { label: 'Very Clean', value: 'very_clean' },
                      ]}
                      selectedValue={(localFilters.lifestyle as any).cleanliness || 'moderate'}
                      onValueChange={(value) => updateNestedFilter(['lifestyle', 'cleanliness'], value)}
                    />
                  </View>
                  
                  <View style={styles.subSection}>
                    <Text style={styles.subSectionTitle}>Social Level</Text>
                    <SegmentedControl
                      options={[
                        { label: 'Quiet', value: 'quiet' },
                        { label: 'Social', value: 'social' },
                        { label: 'Very Social', value: 'very_social' },
                      ]}
                      selectedValue={(localFilters.lifestyle as any).socialLevel || 'social'}
                      onValueChange={(value) => updateNestedFilter(['lifestyle', 'socialLevel'], value)}
                    />
                  </View>
                </>
              )}
              
              <FilterRowItem label="Non-Smoker Preferred">
                <Switch
                  value={localFilters.lifestyle.nonSmoker}
                  onValueChange={(value) => updateNestedFilter(['lifestyle', 'nonSmoker'], value)}
                  trackColor={{ false: '#D1D5DB', true: '#818CF8' }}
                  thumbColor={localFilters.lifestyle.nonSmoker ? '#4F46E5' : '#f4f3f4'}
                />
              </FilterRowItem>
              <FilterRowItem label="Pet-Friendly">
                <Switch
                  value={localFilters.lifestyle.petFriendly}
                  onValueChange={(value) => updateNestedFilter(['lifestyle', 'petFriendly'], value)}
                  trackColor={{ false: '#D1D5DB', true: '#818CF8' }}
                  thumbColor={localFilters.lifestyle.petFriendly ? '#4F46E5' : '#f4f3f4'}
                />
              </FilterRowItem>
              <FilterRowItem label="Verified Profiles Only">
                <Switch
                  value={localFilters.account.verifiedOnly}
                  onValueChange={(value) => updateNestedFilter(['account', 'verifiedOnly'], value)}
                  trackColor={{ false: '#D1D5DB', true: '#818CF8' }}
                  thumbColor={localFilters.account.verifiedOnly ? '#4F46E5' : '#f4f3f4'}
                />
              </FilterRowItem>
            </FilterSection>
          </ScrollView>
          
          <View style={styles.modalFooter}>
            <Button
              title="Reset"
              onPress={handleReset}
              variant="secondary"
              style={styles.footerButton}
            />
            <Button
              title="Apply"
              onPress={handleSave}
              variant="primary"
              style={styles.footerButton}
            />
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  blurTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  blurView: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 0,
    paddingTop: 8,
    paddingBottom: 10,
    maxHeight: '85%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    position: 'relative',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Poppins-SemiBold',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -14 }],
    padding: 6,
  },
  modalBody: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  filterSection: {
    marginBottom: 32,
  },
  filterSectionFirst: {
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 20,
    marginTop: 8,
    fontFamily: 'Poppins-SemiBold',
  },
  sectionTitleFirst: {
    marginTop: 0,
  },
  subSection: {
    marginBottom: 12,
  },
    subSectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
    marginBottom: 8,
    fontFamily: 'Poppins-Regular',
  },
  valueText: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'Poppins-Medium',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  radioGroup: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    padding: 4,
  },
  radioButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  radioButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  radioLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#4B5563',
    fontFamily: 'Poppins-Regular',
  },
  radioLabelActive: {
    color: '#4F46E5',
    fontWeight: '600',
    fontFamily: 'Poppins-Medium',
  },
  rowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  rowLabel: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
    marginRight: 10,
    fontFamily: 'Poppins-Regular',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  noteText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginVertical: 10,
    fontStyle: 'italic',
  },
  footerButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  // Counter styles for bedrooms/bathrooms
  counterSection: {
    marginVertical: 8,
  },
  counterSectionCompact: {
    marginVertical: 4,
  },
  counterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  counterLabel: {
    fontSize: 16,
    color: '#1F2937',
    fontFamily: 'Poppins-Regular',
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  counterButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  counterButtonDisabled: {
    borderColor: '#F3F4F6',
    backgroundColor: '#F9FAFB',
  },
  counterButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  counterButtonTextDisabled: {
    color: '#D1D5DB',
  },
  counterValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginHorizontal: 16,
    minWidth: 32,
    textAlign: 'center',
    fontFamily: 'Poppins-Medium',
  },
  // Amenities styles
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  amenityChip: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  amenityChipSelected: {
    borderColor: '#4F46E5',
    backgroundColor: '#EEF2FF',
  },
  amenityIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  amenityIconSpacing: {
    marginRight: 8,
  },
  amenityLabel: {
    fontSize: 14,
    color: '#374151',
    fontFamily: 'Poppins-Regular',
  },
  amenityLabelSelected: {
    color: '#4F46E5',
    fontFamily: 'Poppins-Medium',
  },
     dividerLine: {
     height: 1,
     backgroundColor: '#F3F4F6',
     marginVertical: 12,
   },
});
