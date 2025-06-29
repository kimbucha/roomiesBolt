import React from 'react';
import { View, Text } from 'react-native';

interface DetailSectionProps {
  icon: React.ReactElement;
  title: string;
  children: React.ReactNode; // Use children prop
  iconBgColor?: string;
}

const DetailSection: React.FC<DetailSectionProps> = ({
  icon,
  title,
  children, // Destructure children
  iconBgColor = 'bg-gray-100',
}) => {
  return (
    <View className="flex-row items-start mb-4">
      {/* Icon Container */}
      <View
        className={`w-8 h-8 rounded-full items-center justify-center mr-2 ${iconBgColor} p-2`}
      >
        {React.cloneElement(icon, { size: 14, color: '#4B5563' })}
      </View>

      {/* Text Content */}
      <View className="flex-1 ml-1">
        {/* Title - Increase weight */}
        <Text className="font-[Poppins-ExtraBold] text-sm text-gray-800 mb-0.5">
          {title}
        </Text>
        {/* Content - Render children */}
        {/* Apply default styling if children is just a string */}
        {typeof children === 'string' ? (
          <Text className="font-[Poppins-SemiBold] text-sm text-gray-800">
            {children}
          </Text>
        ) : (
          children // Render ReactNode children directly
        )}
      </View>
    </View>
  );
};

export default DetailSection; 