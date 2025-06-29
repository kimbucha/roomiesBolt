import React from 'react';
import { View, Text } from 'react-native';
import { LucideIcon } from 'lucide-react-native';

interface InfoRowProps {
  icon: LucideIcon;
  label: string;
  value: string;
  className?: string;
}

export const InfoRow: React.FC<InfoRowProps> = ({ 
  icon: Icon, 
  label, 
  value,
  className = ''
}) => {
  return (
    <View className={`flex-row items-center ${className}`}>
      <View className="bg-indigo-100 p-2 rounded-full mr-2">
        <Icon size={14} color="#4F46E5" />
      </View>
      <View>
        <Text className="font-[Poppins-Medium] text-sm text-gray-800">{label}</Text>
        <Text className="font-[Poppins-Regular] text-sm text-gray-700 mt-1">{value}</Text>
      </View>
    </View>
  );
}; 