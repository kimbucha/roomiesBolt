import React from 'react';
import { ViewStyle } from 'react-native';
import Svg, { Rect, Path } from 'react-native-svg';

interface PassEmojiProps {
  size?: number;
  style?: ViewStyle;
  color?: string;
}

/**
 * PassEmoji - Component for left swipe emoji
 */
const PassEmoji: React.FC<PassEmojiProps> = ({
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
      
      {/* Frown */}
      <Path d="M16.6,15.75A8.622,8.622,0,0,0,12,14.479,8.622,8.622,0,0,0,7.4,15.75s-.451.273-.169-.273,1.867-.93,1.882-1.133a4.862,4.862,0,0,1,5.782,0c.015.2,1.6.586,1.882,1.133S16.6,15.75,16.6,15.75Z" fill={eyesColor} />
    </Svg>
  );
};

export default PassEmoji; 