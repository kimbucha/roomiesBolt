import React from 'react';
import { View, Text } from 'react-native';
import { LucideIcon } from 'lucide-react-native';

interface DetailSectionProps {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const DetailSection: React.FC<DetailSectionProps> = ({ 
  icon: Icon, 
  title, 
  children,
  className = ''
}) => {
  return (
    <View className={`mb-4 ${className}`}>
      <View className="flex-row items-center mb-1.5">
        <View className="bg-indigo-100 p-2 rounded-full mr-2">
          <Icon size={14} color="#4F46E5" />
        </View>
        <Text className="font-[Poppins-Medium] text-sm text-gray-800">{title}</Text>
      </View>
      <View className="ml-9">
        {children}
      </View>
    </View>
  );
}; 