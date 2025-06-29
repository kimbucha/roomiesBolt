import React from 'react';
import { ViewStyle } from 'react-native';
import Svg, { Rect, Path } from 'react-native-svg';

interface YuupEmojiProps {
  size?: number;
  style?: ViewStyle;
  color?: string;
}

/**
 * YuupEmoji - Component for up swipe emoji
 */
const YuupEmoji: React.FC<YuupEmojiProps> = ({
  size = 80,
  style,
  color
}) => {
  // Use the original SVG colors
  const faceColor = '#f8de40'; // Original yellow face color
  const shadowColor = '#e7c930'; // Original shadow color
  const heartColor = '#f06880'; // Original heart color
  const mouthColor = '#864e20'; // Original mouth color
  
  return (
    <Svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24"
      style={style}
    >
      {/* Face */}
      <Rect x="1" y="1" width="22" height="22" rx="7.656" fill={faceColor} />
      
      {/* Shadow/Bottom part */}
      <Path d="M23,13.938a14.69,14.69,0,0,1-12.406,6.531c-5.542,0-6.563-1-9.142-2.529A7.66,7.66,0,0,0,8.656,23h6.688A7.656,7.656,0,0,0,23,15.344Z" fill={shadowColor} />
      
      {/* Left Heart */}
      <Path d="M9.58,6.983A1.528,1.528,0,0,0,7.5,7.1l-.449.45L6.6,7.1a1.529,1.529,0,0,0-2.083-.113,1.472,1.472,0,0,0-.058,2.136L6.68,11.34a.518.518,0,0,0,.737,0l2.22-2.221A1.471,1.471,0,0,0,9.58,6.983Z" fill={heartColor} />
      
      {/* Right Heart */}
      <Path d="M19.483,6.983A1.528,1.528,0,0,0,17.4,7.1l-.449.45L16.5,7.1a1.529,1.529,0,0,0-2.083-.113,1.471,1.471,0,0,0-.057,2.136l2.221,2.221a.517.517,0,0,0,.736,0l2.221-2.221A1.472,1.472,0,0,0,19.483,6.983Z" fill={heartColor} />
      
      {/* Mouth */}
      <Path d="M16.666,12.583H7.334a.493.493,0,0,0-.492.544c.123,1.175.875,3.842,5.158,3.842s5.035-2.667,5.158-3.842A.493.493,0,0,0,16.666,12.583Z" fill={mouthColor} />
      
      {/* Tongue */}
      <Path d="M12,16.969a6.538,6.538,0,0,0,2.959-.6,1.979,1.979,0,0,0-1.209-.853c-1.344-.3-1.75.109-1.75.109s-.406-.406-1.75-.109a1.979,1.979,0,0,0-1.209.853A6.538,6.538,0,0,0,12,16.969Z" fill={heartColor} />
    </Svg>
  );
};

export default YuupEmoji; 