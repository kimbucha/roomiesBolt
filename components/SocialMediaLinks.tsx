import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Svg, Path } from 'react-native-svg';

interface SocialMediaLinksProps {
  instagram?: string;
  twitter?: string;
  facebook?: string;
  spotify?: string;
  onPress?: (platform: 'instagram' | 'twitter' | 'facebook' | 'spotify', url: string) => void;
}

export const SocialMediaLinks: React.FC<SocialMediaLinksProps> = ({
  instagram,
  twitter,
  facebook,
  spotify,
  onPress
}) => {
  // Function to handle icon press
  const handlePress = (platform: 'instagram' | 'twitter' | 'facebook' | 'spotify', url?: string) => {
    if (url && onPress) {
      onPress(platform, url);
    }
  };

  return (
    <View className="flex-row flex-wrap justify-between mt-1">
      {/* Instagram Icon */}
      <TouchableOpacity 
        className={`items-center w-[23%] py-2 px-1 rounded-lg ${!instagram ? 'opacity-50' : ''}`}
        style={{
          backgroundColor: 'rgba(248, 248, 252, 0.9)',
          borderWidth: 0.5,
          borderColor: 'rgba(200, 200, 200, 0.5)',
        }}
        onPress={() => handlePress('instagram', instagram)}
        disabled={!instagram}
      >
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"
            fill={instagram ? "#E4405F" : "#888888"}
          />
        </Svg>
        <Text className={`text-xs mt-1 text-center ${!instagram ? 'text-gray-500' : 'text-gray-800'}`}>Instagram</Text>
      </TouchableOpacity>

      {/* X (Twitter) Icon */}
      <TouchableOpacity 
        className={`items-center w-[23%] py-2 px-1 rounded-lg ${!twitter ? 'opacity-50' : ''}`}
        style={{
          backgroundColor: 'rgba(248, 248, 252, 0.9)',
          borderWidth: 0.5,
          borderColor: 'rgba(200, 200, 200, 0.5)',
        }}
        onPress={() => handlePress('twitter', twitter)}
        disabled={!twitter}
      >
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path
            d="M19.9853 7.47751C19.9952 7.65334 19.9952 7.82916 19.9952 8.00499C19.9952 13.8474 15.8205 20.5548 7.79021 20.5548C5.36732 20.5548 3.10407 19.8459 1.19067 18.6125C1.52645 18.6518 1.85237 18.6616 2.198 18.6616C4.18071 18.6616 6.00913 17.9723 7.48646 16.8029C5.61265 16.7635 4.04466 15.5301 3.5083 13.838C3.76324 13.8772 4.01817 13.9067 4.28298 13.9067C4.64833 13.9067 5.01368 13.8478 5.35931 13.7494C3.40747 13.3448 1.93999 11.6233 1.93999 9.55026V9.50107C2.49607 9.8072 3.13259 9.99287 3.80827 10.0126C2.6577 9.23423 1.93013 7.95153 1.93013 6.50372C1.93013 5.70568 2.13643 4.97736 2.50179 4.3472C4.58582 6.93689 7.73153 8.6093 11.2365 8.78498C11.1673 8.4788 11.1278 8.16277 11.1278 7.84674C11.1278 5.47085 13.0416 3.5465 15.4249 3.5465C16.6646 3.5465 17.7756 4.07212 18.5652 4.91097C19.5376 4.73514 20.4703 4.38831 21.2993 3.9149C20.9932 4.87132 20.3172 5.70567 19.4438 6.23129C20.2927 6.14276 21.1121 5.91627 21.871 5.60024C21.2993 6.44409 20.5887 7.19182 19.7844 7.80184L19.9853 7.47751Z"
            fill={twitter ? "#1DA1F2" : "#888888"}
          />
        </Svg>
        <Text className={`text-xs mt-1 text-center ${!twitter ? 'text-gray-500' : 'text-gray-800'}`}>Twitter</Text>
      </TouchableOpacity>

      {/* Facebook Icon */}
      <TouchableOpacity 
        className={`items-center w-[23%] py-2 px-1 rounded-lg ${!facebook ? 'opacity-50' : ''}`}
        style={{
          backgroundColor: 'rgba(248, 248, 252, 0.9)',
          borderWidth: 0.5,
          borderColor: 'rgba(200, 200, 200, 0.5)',
        }}
        onPress={() => handlePress('facebook', facebook)}
        disabled={!facebook}
      >
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path
            d="M24 12.0733C24 5.40541 18.6274 0 12 0C5.37258 0 0 5.40541 0 12.0733C0 18.0995 4.38823 23.0943 10.125 24V15.5633H7.07813V12.0733H10.125V9.41343C10.125 6.38755 11.9165 4.71615 14.6576 4.71615C15.9705 4.71615 17.3438 4.95195 17.3438 4.95195V7.92313H15.8306C14.3399 7.92313 13.875 8.85379 13.875 9.80864V12.0733H17.2031L16.6711 15.5633H13.875V24C19.6118 23.0943 24 18.0995 24 12.0733Z"
            fill={facebook ? "#1877F2" : "#888888"}
          />
        </Svg>
        <Text className={`text-xs mt-1 text-center ${!facebook ? 'text-gray-500' : 'text-gray-800'}`}>Facebook</Text>
      </TouchableOpacity>

      {/* Spotify Icon */}
      <TouchableOpacity 
        className={`items-center w-[23%] py-2 px-1 rounded-lg ${!spotify ? 'opacity-50' : ''}`}
        style={{
          backgroundColor: 'rgba(248, 248, 252, 0.9)',
          borderWidth: 0.5,
          borderColor: 'rgba(200, 200, 200, 0.5)',
        }}
        onPress={() => handlePress('spotify', spotify)}
        disabled={!spotify}
      >
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 0C5.4 0 0 5.4 0 12C0 18.6 5.4 24 12 24C18.6 24 24 18.6 24 12C24 5.4 18.66 0 12 0ZM17.521 17.34C17.281 17.699 16.861 17.82 16.5 17.58C13.68 15.84 10.14 15.479 5.939 16.439C5.521 16.561 5.16 16.26 5.04 15.9C4.92 15.479 5.22 15.12 5.581 15C10.14 13.979 14.1 14.399 17.28 16.319C17.639 16.5 17.76 16.979 17.521 17.34ZM18.961 14.04C18.66 14.46 18.12 14.64 17.7 14.34C14.46 12.36 9.54 11.76 5.76 12.9C5.281 13.08 4.741 12.84 4.56 12.36C4.38 11.88 4.62 11.34 5.1 11.16C9.48 9.9 14.94 10.56 18.66 12.84C19.08 13.08 19.26 13.68 18.961 14.04ZM19.081 10.68C15.24 8.4 8.82 8.16 5.16 9.29C4.56 9.48 3.96 9.12 3.78 8.52C3.59 7.92 3.96 7.32 4.56 7.14C8.82 5.88 15.9 6.16 20.34 8.82C20.879 9.12 21.06 9.84 20.76 10.38C20.46 10.86 19.74 11.04 19.081 10.68Z"
            fill={spotify ? "#1DB954" : "#888888"}
          />
        </Svg>
        <Text className={`text-xs mt-1 text-center ${!spotify ? 'text-gray-500' : 'text-gray-800'}`}>Spotify</Text>
      </TouchableOpacity>
    </View>
  );
}; 