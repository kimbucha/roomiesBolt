import React from 'react';
import { View, Text } from 'react-native';

interface TagProps {
  label: string;
  className?: string;
}

export const Tag: React.FC<TagProps> = ({ 
  label, 
  className = '' 
}) => {
  return (
    <View className={`bg-indigo-100 px-3 py-1 rounded-full mr-2 mb-2 ${className}`} style={{
      borderWidth: 0.5,
      borderColor: 'rgba(79, 70, 229, 0.2)',
    }}>
      <Text className="font-[Poppins-Regular] text-[11px] text-indigo-700">
        {label}
      </Text>
    </View>
  );
}; 