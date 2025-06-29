import React from 'react';
import { SvgXml } from 'react-native-svg';
import { View, Text } from 'react-native';

const grainSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
  <filter id="grainy">
    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch" />
    <feColorMatrix type="saturate" values="0" />
  </filter>
  <rect width="100%" height="100%" filter="url(#grainy)" />
</svg>
`;

/**
 * A subtle, tileable grain overlay component for backgrounds.
 */
export default function BackgroundGrain() {
  return (
    <View className="absolute inset-0 z-[-1] pointer-events-none opacity-15">
      <SvgXml xml={grainSvg} width="100%" height="100%" />
    </View>
  );
}
