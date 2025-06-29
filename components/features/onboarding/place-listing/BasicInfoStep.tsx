import React, { forwardRef, useRef, useEffect } from 'react';
import { View, TextInput, Keyboard, Platform, Text } from 'react-native';
import { DollarSign, Home, Users, Building2 } from 'lucide-react-native';
import RoomTypeSelector from './RoomTypeSelector';
import PropertyCounter from './PropertyCounter';
import InputField from './InputField';
import { usePlaceDetails } from '../../../../contexts/PlaceDetailsContext';

interface BasicInfoStepProps {}

const BasicInfoStep = forwardRef<View, BasicInfoStepProps>(({}, ref) => {
  const { placeDetails, updatePlaceDetails } = usePlaceDetails();
  
  // Input refs for focus management
  const rentInputRef = useRef<TextInput>(null);
  const addressInputRef = useRef<TextInput>(null);
  
  // Auto-set bedroom/bathroom values for studio
  useEffect(() => {
    if (placeDetails.roomType === 'studio') {
      // Studio: 0 bedrooms (it's a studio), 1 bathroom (typical)
      updatePlaceDetails({ 
        bedrooms: 0, 
        bathrooms: 1 
      });
    } else if (placeDetails.roomType && placeDetails.bedrooms === 0) {
      // If switching away from studio, reset to reasonable defaults
      updatePlaceDetails({ 
        bedrooms: 2, // Default to 2BR house (most common shared housing)
        bathrooms: 1 
      });
    }
  }, [placeDetails.roomType]);
  
  // Get contextual description based on room type
  const getPropertyDescription = () => {
    switch (placeDetails.roomType) {
      case 'private':
        return 'Tell us about the house/apartment you\'re renting a room in:';
      case 'shared':
        return 'Tell us about the house/apartment where you\'ll share a room:';
      case 'studio':
        return 'Studio apartment details:';
      default:
        return 'Property details:';
    }
  };

  // Handle keyboard dismiss when tapping outside inputs - removed auto-blur on keyboard hide
  // This was causing the Address field to lose focus when KeyboardAwareScrollView adjusted the layout

  return (
    <View ref={ref}>
      <RoomTypeSelector
        selectedType={placeDetails.roomType}
        onSelectType={(type) => updatePlaceDetails({ roomType: type })}
      />
      
      {/* Only show property details after room type is selected */}
      {placeDetails.roomType && (
        <>
          {placeDetails.roomType === 'studio' ? (
            // For studio, show info instead of counters
            <View className="mb-4 bg-blue-50 rounded-lg p-3 border border-blue-200">
              <View className="flex-row items-center mb-2">
                <Building2 size={16} color="#3B82F6" />
                <Text className="text-sm font-medium text-blue-800 ml-2">Studio Apartment</Text>
              </View>
              <Text className="text-sm text-blue-700">
                Self-contained unit with combined living/sleeping area and private bathroom
              </Text>
            </View>
          ) : (
            // For private/shared rooms, show PROPERTY information
            <View className="mb-4">
              <View className="mb-3">
                <Text className="text-sm text-gray-600 mb-2">
                  {getPropertyDescription()}
                </Text>
              </View>
              
              <View className="flex-row justify-between mb-2">
                <View className="w-[48%]">
                  <PropertyCounter
                    label="Total Bedrooms"
                    value={placeDetails.bedrooms}
                    onIncrement={() => updatePlaceDetails({ bedrooms: placeDetails.bedrooms + 1 })}
                    onDecrement={() => updatePlaceDetails({ bedrooms: Math.max(1, placeDetails.bedrooms - 1) })}
                    minValue={1}
                  />
                </View>
                
                <View className="w-[48%]">
                  <PropertyCounter
                    label="Total Bathrooms"
                    value={placeDetails.bathrooms}
                    onIncrement={() => updatePlaceDetails({ bathrooms: placeDetails.bathrooms + 0.5 })}
                    onDecrement={() => updatePlaceDetails({ bathrooms: Math.max(0.5, placeDetails.bathrooms - 0.5) })}
                    minValue={0.5}
                  />
                </View>
              </View>
              
              {/* Helpful examples */}
              <View className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <View className="flex-row items-center mb-1">
                  <Home size={14} color="#6B7280" />
                  <Text className="text-xs font-medium text-gray-700 ml-1">Examples:</Text>
                </View>
                <Text className="text-xs text-gray-600">
                  {placeDetails.roomType === 'private' 
                    ? "• \"Private room in a 3BR/2BA house\"\n• \"Private room in a 4BR/2BA apartment\""
                    : "• \"Shared room in a 2BR/1BA apartment\"\n• \"Shared room in a 3BR/2BA house\""
                  }
                </Text>
              </View>
            </View>
          )}
        </>
      )}
      
      <InputField
        ref={rentInputRef}
        label="Monthly Rent"
        placeholder="Enter amount"
        value={placeDetails.monthlyRent}
        onChangeText={(text) => updatePlaceDetails({ monthlyRent: text })}
        keyboardType="numeric"
        icon={<DollarSign size={20} color="#6B7280" />}
        returnKeyType="next"
        onSubmitEditing={() => {
          // Small delay to ensure proper scrolling
          setTimeout(() => {
            addressInputRef.current?.focus();
          }, Platform.OS === 'ios' ? 100 : 50);
        }}
        blurOnSubmit={false}
      />
      
      <InputField
        ref={addressInputRef}
        label="Address"
        placeholder="Enter property address"
        value={placeDetails.address}
        onChangeText={(text) => updatePlaceDetails({ address: text })}
        returnKeyType="done"
        onSubmitEditing={() => {
          Keyboard.dismiss();
        }}
      />
    </View>
  );
});

BasicInfoStep.displayName = 'BasicInfoStep';

export default BasicInfoStep;
