import React, { forwardRef, useRef } from 'react';
import { View, TextInput } from 'react-native';
import { DollarSign } from 'lucide-react-native';
import RoomTypeSelector from './RoomTypeSelector';
import PropertyCounter from './PropertyCounter';
import InputField from './InputField';
import { usePlaceDetails } from '../../../contexts/PlaceDetailsContext';

const BasicInfoStep = forwardRef<View>((_, ref) => {
  const { placeDetails, updatePlaceDetails } = usePlaceDetails();
  
  // Input refs for focus management
  const rentInputRef = useRef<TextInput>(null);
  const addressInputRef = useRef<TextInput>(null);
  
  return (
    <View ref={ref}>
      <RoomTypeSelector
        selectedType={placeDetails.roomType}
        onSelectType={(type) => updatePlaceDetails({ roomType: type })}
      />
      
      <View className="flex-row justify-between mb-4">
        <View className="w-[48%]">
          <PropertyCounter
            label="Bedrooms"
            value={placeDetails.bedrooms}
            onIncrement={() => updatePlaceDetails({ bedrooms: placeDetails.bedrooms + 1 })}
            onDecrement={() => updatePlaceDetails({ bedrooms: Math.max(1, placeDetails.bedrooms - 1) })}
            minValue={1}
          />
        </View>
        
        <View className="w-[48%]">
          <PropertyCounter
            label="Bathrooms"
            value={placeDetails.bathrooms}
            onIncrement={() => updatePlaceDetails({ bathrooms: placeDetails.bathrooms + 1 })}
            onDecrement={() => updatePlaceDetails({ bathrooms: Math.max(1, placeDetails.bathrooms - 1) })}
            minValue={1}
          />
        </View>
      </View>
      
      <InputField
        ref={rentInputRef}
        label="Monthly Rent ($)"
        placeholder="Enter amount"
        value={placeDetails.monthlyRent}
        onChangeText={(text) => updatePlaceDetails({ monthlyRent: text })}
        keyboardType="numeric"
        icon={<DollarSign size={20} color="#6B7280" />}
        onFocus={() => {}}
        returnKeyType="next"
        onSubmitEditing={() => addressInputRef.current?.focus()}
      />
      
      <InputField
        ref={addressInputRef}
        label="Address"
        placeholder="Enter property address"
        value={placeDetails.address}
        onChangeText={(text) => updatePlaceDetails({ address: text })}
        onFocus={() => {}}
        returnKeyType="done"
      />
    </View>
  );
});

BasicInfoStep.displayName = 'BasicInfoStep';

export default BasicInfoStep;
