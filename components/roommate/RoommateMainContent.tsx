import React from 'react';
import { View, Text } from 'react-native';
import { Heart, Home } from 'lucide-react-native';
import { RoommateProfile } from '../../store/roommateStore';

interface RoommateMainContentProps {
  profile: RoommateProfile;
}

export const RoommateMainContent: React.FC<RoommateMainContentProps> = ({ profile }) => {
  // Determine if showing school or work info
  const showWorkInfo = profile.company && profile.role;
  const showSchoolInfo = profile.university || profile.major;
  
  return (
    <>
      <View className="flex-row justify-between items-center mb-1">
        <View className="flex-1">
          <Text className="font-[Poppins-SemiBold] text-2xl text-white shadow-black shadow-md">
            {profile.name}, {profile.age}
          </Text>
          
          {/* Place availability badge */}
          {profile.hasPlace && (
            <View className="flex-row items-center mt-1">
              <View className="bg-green-500/90 rounded-full px-2 py-0.5 flex-row items-center">
                <Home size={12} color="#fff" className="mr-1" />
                <Text className="font-[Poppins-Medium] text-xs text-white">
                  Has Place Available
                </Text>
              </View>
            </View>
          )}
        </View>
        
        {/* Compatibility score */}
        {profile.compatibilityScore && (
          <View className="flex-row items-center">
            <Heart size={14} color="#fff" className="mr-1" />
            <Text className="font-[Poppins-Medium] text-sm text-white">
              {Math.round(profile.compatibilityScore)}%
            </Text>
          </View>
        )}
      </View>
      
      {/* University/Company and major/role - tighter spacing for better grouping */}
      {(showSchoolInfo || showWorkInfo) && (
        <View className="mb-1.5">
          {showWorkInfo ? (
            <>
              <Text className="font-[Poppins-Medium] text-lg text-white shadow-black shadow-md" style={{ lineHeight: 20, marginBottom: -2 }}>
                {profile.company}
              </Text>
              {profile.role && (
                <Text className="font-[Poppins-Regular] text-base text-white shadow-black shadow-md" style={{ lineHeight: 18 }}>
                  {profile.role}
                </Text>
              )}
            </>
          ) : (
            <>
              <Text className="font-[Poppins-Medium] text-lg text-white shadow-black shadow-md" style={{ lineHeight: 20, marginBottom: -2 }}>
                {profile.university}
              </Text>
              {profile.major && (
                <Text className="font-[Poppins-Regular] text-base text-white shadow-black shadow-md" style={{ lineHeight: 18 }}>
                  {profile.major}
                </Text>
              )}
            </>
          )}
        </View>
      )}
      
      {/* Location and neighborhood - shown for all profiles */}
      <View className="mb-2">
        <Text className="font-[Poppins-Medium] text-sm text-white mb-0.5 shadow-black shadow-md">
          {profile.location}
          {profile.neighborhood && (
            <Text className="font-[Poppins-Regular] text-sm text-white/80"> • {profile.neighborhood}</Text>
          )}
        </Text>
      </View>
    </>
  );
}; 