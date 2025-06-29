import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Home, Bed } from 'lucide-react-native';

type RoomType = 'private' | 'shared' | 'studio';

interface RoomTypeSelectorProps {
  selectedType: RoomType | undefined;
  onSelectType: (type: RoomType) => void;
}

const RoomTypeSelector: React.FC<RoomTypeSelectorProps> = ({ 
  selectedType, 
  onSelectType 
}) => {
  return (
    <View className="mb-4">
      <Text className="text-base font-semibold text-gray-800 mb-3">Room Type</Text>
      <View className="flex-row justify-between">
        <TouchableOpacity
          className={`w-[31%] bg-gray-100 rounded-lg py-2.5 px-2 items-center border ${
            selectedType === 'private' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'
          } h-[60px] justify-center`}
          onPress={() => onSelectType('private')}
          accessibilityLabel="Private Room"
          accessibilityRole="button"
          accessibilityState={{ selected: selectedType === 'private' }}
        >
          <Bed size={20} color={selectedType === 'private' ? '#6366F1' : '#6B7280'} />
          <Text className={`mt-1 text-xs ${
            selectedType === 'private' ? 'text-indigo-700 font-medium' : 'text-gray-600'
          } text-center`}>
            Private Room
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          className={`w-[31%] bg-gray-100 rounded-lg py-2.5 px-2 items-center border ${
            selectedType === 'shared' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'
          } h-[60px] justify-center`}
          onPress={() => onSelectType('shared')}
          accessibilityLabel="Shared Room"
          accessibilityRole="button"
          accessibilityState={{ selected: selectedType === 'shared' }}
        >
          <Bed size={20} color={selectedType === 'shared' ? '#6366F1' : '#6B7280'} />
          <Text className={`mt-1 text-xs ${
            selectedType === 'shared' ? 'text-indigo-700 font-medium' : 'text-gray-600'
          } text-center`}>
            Shared Room
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          className={`w-[31%] bg-gray-100 rounded-lg py-2.5 px-2 items-center border ${
            selectedType === 'studio' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'
          } h-[60px] justify-center`}
          onPress={() => onSelectType('studio')}
          accessibilityLabel="Studio/1BR"
          accessibilityRole="button"
          accessibilityState={{ selected: selectedType === 'studio' }}
        >
          <Home size={20} color={selectedType === 'studio' ? '#6366F1' : '#6B7280'} />
          <Text className={`mt-1 text-xs ${
            selectedType === 'studio' ? 'text-indigo-700 font-medium' : 'text-gray-600'
          } text-center`}>
            Studio/1BR
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default RoomTypeSelector;
