import React from 'react';
import { View, Text } from 'react-native';
import { Heart } from 'lucide-react-native';
import { RoommateProfile } from '../../store/roommateStore';

interface RoommateHeaderContentProps {
  profile: RoommateProfile;
}

export const RoommateHeaderContent: React.FC<RoommateHeaderContentProps> = ({ profile }) => {
  return (
    <View className="flex-row justify-between items-center">
      <View className="flex-1">
        <Text className="font-[Poppins-SemiBold] text-lg text-gray-800">
          {profile.name}, {profile.age}
        </Text>
        <Text className="font-[Poppins-Medium] text-xs text-gray-600 mt-0.5">
          {profile.university}{profile.major ? `, ${profile.major}` : ''}
        </Text>
      </View>
      
      {/* Compatibility score */}
      {profile.compatibilityScore && (
        <View className="items-end">
          <View className="flex-row items-center">
            <Heart size={10} color="#4F46E5" className="mr-1" />
            <Text className="font-[Poppins-Medium] text-xs text-gray-800">
              {Math.round(profile.compatibilityScore)}%
            </Text>
          </View>
          <View className="h-1 bg-gray-200 rounded-full overflow-hidden w-16 mt-1">
            <View 
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
              style={{ width: `${profile.compatibilityScore}%` }}
            />
          </View>
        </View>
      )}
    </View>
  );
}; 