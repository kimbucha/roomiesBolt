import React from 'react';
import { View, Text, Image } from 'react-native';
import { styled } from 'nativewind';
import { RoommateProfile } from '../store/roommateStore';
import { Check } from 'lucide-react-native';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledImage = styled(Image);

interface ProfileCardProps {
  profile: RoommateProfile;
  showDetails?: boolean;
}



export const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  showDetails = true,
}) => {
  return (
    <StyledView className="w-[calc(100%-32px)] bg-white rounded-4 shadow-md overflow-hidden">
      <StyledImage
        source={{ uri: profile.image }}
        className="w-full h-[260px] object-cover"
      />
      
      <StyledView className="p-4">
        <StyledView className="mb-3">
          <StyledView className="flex-row items-center mb-1">
            <StyledText className="text-lg font-bold text-gray-800 mr-1">
              {profile.name}, {profile.age}
            </StyledText>
            {profile.verified && (
              <StyledView className="bg-indigo-600 rounded-full w-[16px] h-[16px] items-center justify-center">
                <Check size={12} color="#fff" />
              </StyledView>
            )}
          </StyledView>
          <StyledText className="text-gray-600 font-medium">
            {profile.university}
          </StyledText>
          {profile.major && (
            <StyledText className="text-gray-500 text-sm">
              {profile.major}
            </StyledText>
          )}
        </StyledView>
        
        {showDetails && (
          <>
            <StyledView className="flex-row justify-between mb-4">
              <StyledView className="flex-row items-center">
                <StyledText className="text-gray-500 mr-1">Budget:</StyledText>
                <StyledText className="text-gray-800 font-medium">{profile.budget}</StyledText>
              </StyledView>
              <StyledView className="flex-row items-center">
                <StyledText className="text-gray-500 mr-1">Location:</StyledText>
                <StyledText className="text-gray-800 font-medium">{profile.location}</StyledText>
              </StyledView>
            </StyledView>
            
            <StyledView className="flex-row flex-wrap mb-3">
              {profile.traits.map((trait, index) => (
                <StyledView key={index} className="bg-gray-100 rounded-full px-3 py-1 mr-2 mb-2">
                  <StyledText className="text-gray-700 text-xs">{trait}</StyledText>
                </StyledView>
              ))}
            </StyledView>
            
            <StyledText className="text-gray-700 mb-4 leading-5">{profile.bio}</StyledText>
            
            {profile.compatibilityScore && (
              <StyledView className="flex-row items-center justify-between mt-2">
                <StyledText className="text-gray-600 font-medium">Compatibility</StyledText>
                <StyledView className="bg-green-100 rounded-full px-3 py-1">
                  <StyledText className="text-green-700 font-bold">
                    {profile.compatibilityScore}%
                  </StyledText>
                </StyledView>
              </StyledView>
            )}
          </>
        )}
      </StyledView>
    </StyledView>
  );
};


