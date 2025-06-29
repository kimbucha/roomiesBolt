import React from 'react';
import { View, Linking, Alert } from 'react-native';
import { Link } from 'lucide-react-native';
import { SocialMediaLinks } from '../../SocialMediaLinks';
import { DetailSection } from '../../shared';

interface SocialMediaSectionProps {
  // These would come from the user's profile data
  instagramHandle?: string;
  twitterHandle?: string;
  facebookHandle?: string;
  spotifyUsername?: string;
}

export const SocialMediaSection: React.FC<SocialMediaSectionProps> = ({
  instagramHandle,
  twitterHandle,
  facebookHandle,
  spotifyUsername
}) => {
  // Convert handles to URLs
  const instagramUrl = instagramHandle ? `https://instagram.com/${instagramHandle}` : undefined;
  const twitterUrl = twitterHandle ? `https://twitter.com/${twitterHandle}` : undefined;
  const facebookUrl = facebookHandle ? `https://facebook.com/${facebookHandle}` : undefined;
  const spotifyUrl = spotifyUsername ? `https://open.spotify.com/user/${spotifyUsername}` : undefined;

  // Handle social media link press
  const handleSocialMediaPress = (platform: string, url: string) => {
    // In a real app, you'd want to validate the URL and handle errors
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert(`Cannot open ${platform} link`, `The URL ${url} cannot be opened.`);
      }
    });
  };

  // Only render if at least one social media handle is provided
  if (!instagramHandle && !twitterHandle && !facebookHandle && !spotifyUsername) {
    return null;
  }

  return (
    <DetailSection icon={Link} title="Socials">
      <SocialMediaLinks
        instagram={instagramUrl}
        twitter={twitterUrl}
        facebook={facebookUrl}
        spotify={spotifyUrl}
        onPress={handleSocialMediaPress}
      />
    </DetailSection>
  );
}; 