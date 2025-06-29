import React from 'react';
import { SvgXml } from 'react-native-svg';
import logoSvg from '../assets/images/logo-svg';

interface LogoProps {
  width?: number;
  height?: number;
}

const Logo: React.FC<LogoProps> = ({ width = 80, height = 80 }) => {
  return <SvgXml xml={logoSvg} width={width} height={height} />;
};

export default Logo;
