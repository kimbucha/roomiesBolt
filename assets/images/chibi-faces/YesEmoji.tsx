import React from 'react';
import { ViewStyle } from 'react-native';
import Svg, { Rect, Path } from 'react-native-svg';

interface YesEmojiProps {
  size?: number;
  style?: ViewStyle;
  color?: string;
}

/**
 * YesEmoji - Component for right swipe emoji
 */
const YesEmoji: React.FC<YesEmojiProps> = ({
  size = 80,
  style,
  color
}) => {
  // Use the original SVG colors
  const faceColor = '#f8de40'; // Original yellow face color
  const shadowColor = '#e7c930'; // Original shadow color
  const eyesColor = '#864e20'; // Original eyes/mouth color
  
  return (
    <Svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24"
      style={style}
    >
      {/* Face */}
      <Rect x="1" y="1" width="22" height="22" rx="7.656" fill={faceColor} />
      
      {/* Left Eye */}
      <Path d="M7.055,7.313A1.747,1.747,0,1,0,8.8,9.059,1.747,1.747,0,0,0,7.055,7.313Z" fill={eyesColor} />
      
      {/* Right Eye */}
      <Path d="M16.958,7.313A1.747,1.747,0,1,0,18.7,9.059,1.747,1.747,0,0,0,16.958,7.313Z" fill={eyesColor} />
      
      {/* Shadow/Bottom part */}
      <Path d="M23,13.938a14.69,14.69,0,0,1-12.406,6.531c-5.542,0-6.563-1-9.142-2.529A7.66,7.66,0,0,0,8.656,23h6.688A7.656,7.656,0,0,0,23,15.344Z" fill={shadowColor} />
      
      {/* Smile */}
      <Path d="M16.6,12.25A8.622,8.622,0,0,1,12,13.521,8.622,8.622,0,0,1,7.4,12.25s-.451-.273-.169.273,1.867.93,1.882,1.133a4.862,4.862,0,0,0,5.782,0c.015-.2,1.6-.586,1.882-1.133S16.6,12.25,16.6,12.25Z" fill={eyesColor} />
      
      {/* Tongue */}
      <Path d="M14.422,14.961a4.8,4.8,0,0,1-4.844,0c-.424-.228-.476.164.352.656a4.093,4.093,0,0,0,2.07.656,4.093,4.093,0,0,0,2.07-.656C14.9,15.125,14.846,14.733,14.422,14.961Z" fill={shadowColor} />
    </Svg>
  );
};

export default YesEmoji; 