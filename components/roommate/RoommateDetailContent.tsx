import React from 'react';
import { View, Text } from 'react-native';
import { 
  DollarSign, 
  MapPin, 
  BookOpen, 
  Users, 
  Wine, 
  Heart, 
  Home 
} from 'lucide-react-native';
import { RoommateProfile } from '../../store/roommateStore';
import { DetailSection, Tag, InfoRow } from '../shared';
import { SocialMediaSection } from '../DetailCard/components';
import { PersonalityDetailSection } from './PersonalityDetailSection';

interface RoommateDetailContentProps {
  profile: RoommateProfile;
}

export const RoommateDetailContent: React.FC<RoommateDetailContentProps> = ({ profile }) => {
  return (
    <>
      {/* Two-column layout for key info */}
      <View className="flex-row justify-between mt-2 mb-4">
        <InfoRow 
          icon={DollarSign}
          label="Budget"
          value={profile.budget}
          className="w-[48%]"
        />
        
        <InfoRow 
          icon={MapPin}
          label="Location"
          value={profile.location}
          className="w-[48%]"
        />
      </View>

      {/* About */}
      {profile.bio && (
        <DetailSection icon={BookOpen} title="About">
          <Text className="font-[Poppins-Regular] text-sm text-gray-700" numberOfLines={3}>
            {profile.bio}
          </Text>
        </DetailSection>
      )}

      {/* Personality Profile Section */}
      <PersonalityDetailSection profile={profile} />

      {/* Traits */}
      {profile.traits && profile.traits.length > 0 && (
        <DetailSection icon={Users} title="Traits">
          <View className="flex-row flex-wrap">
            {profile.traits.map((trait, index) => (
              <Tag key={index} label={trait} />
            ))}
          </View>
        </DetailSection>
      )}
      
      {/* Lifestyle */}
      {profile.lifestylePreferences && (
        <DetailSection icon={Wine} title="Lifestyle">
          <View className="flex-row flex-wrap">
            {profile.lifestylePreferences.sleepSchedule && (
              <Tag 
                label={formatLifestylePreference(profile.lifestylePreferences.sleepSchedule)} 
                className="mr-2"
              />
            )}
            {profile.lifestylePreferences.cleanliness && (
              <Tag 
                label={formatLifestylePreference(profile.lifestylePreferences.cleanliness)} 
                className="mr-2"
              />
            )}
            {profile.lifestylePreferences.noiseLevel && (
              <Tag 
                label={formatLifestylePreference(profile.lifestylePreferences.noiseLevel)} 
              />
            )}
          </View>
        </DetailSection>
      )}
      
      {/* Room Photos */}
      {profile.roomPhotos && profile.roomPhotos.length > 0 && (
        <DetailSection icon={Home} title={`Room Photos (${profile.roomPhotos.length})`}>
          <Text className="font-[Poppins-Regular] text-sm text-gray-700">
            {profile.hasPlace ? 'Has a place' : 'Looking for a place'}
          </Text>
        </DetailSection>
      )}
      
      {/* Social Media Section */}
      {profile.socialMedia && (
        <SocialMediaSection
          instagramHandle={profile.socialMedia.instagram}
          twitterHandle={profile.socialMedia.twitter}
          facebookHandle={profile.socialMedia.facebook}
          spotifyUsername={profile.socialMedia.spotify}
        />
      )}
    </>
  );
};

// Helper function to format lifestyle preferences
function formatLifestylePreference(value: string): string {
  switch (value) {
    case 'early_bird':
      return 'Early Bird';
    case 'night_owl':
      return 'Night Owl';
    case 'flexible':
      return 'Flexible Schedule';
    case 'very_clean':
      return 'Very Clean';
    case 'clean':
      return 'Clean';
    case 'moderate':
      return 'Moderately Clean';
    case 'relaxed':
      return 'Relaxed Cleanliness';
    case 'quiet':
      return 'Quiet';
    case 'loud':
      return 'Loud';
    default:
      return value.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }
} 