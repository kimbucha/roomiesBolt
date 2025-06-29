import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface PropertyCounterProps {
  label: string;
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  minValue?: number;
  maxValue?: number;
}

const PropertyCounter: React.FC<PropertyCounterProps> = ({
  label,
  value,
  onIncrement,
  onDecrement,
  minValue = 0,
  maxValue = 10
}) => {
  return (
    <View className="mb-4">
      <Text className="text-base font-semibold text-gray-800 mb-2">{label}</Text>
      <View className="flex-row items-center">
        <TouchableOpacity
          className="w-8 h-8 bg-gray-100 rounded-lg items-center justify-center"
          onPress={onDecrement}
          disabled={value <= minValue}
          accessibilityLabel={`Decrease ${label}`}
          accessibilityRole="button"
        >
          <Text className={`text-base ${value <= minValue ? 'text-gray-300' : 'text-gray-700'}`}>-</Text>
        </TouchableOpacity>
        
        <View className="w-12 items-center">
          <Text className="text-base font-medium text-gray-800">{value}</Text>
        </View>
        
        <TouchableOpacity
          className="w-8 h-8 bg-gray-100 rounded-lg items-center justify-center"
          onPress={onIncrement}
          disabled={value >= maxValue}
          accessibilityLabel={`Increase ${label}`}
          accessibilityRole="button"
        >
          <Text className={`text-base ${value >= maxValue ? 'text-gray-300' : 'text-gray-700'}`}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PropertyCounter;
