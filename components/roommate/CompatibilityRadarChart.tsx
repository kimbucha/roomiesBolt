import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Dimensions, Image } from 'react-native';
import Svg, { Circle, Polygon, Text as SvgText, G, Line, Defs, RadialGradient, Stop } from 'react-native-svg';

const { width: screenWidth } = Dimensions.get('window');
// More responsive chart sizing with min/max constraints
const chartSize = Math.min(Math.max(screenWidth * 0.65, 240), 320); // Min 240px, max 320px
const center = chartSize / 2;
const maxRadius = center - (screenWidth > 350 ? 40 : 35); // Adjust radius for smaller screens

interface CompatibilityRadarChartProps {
  userDimensions: {
    ei: number;
    sn: number;
    tf: number;
    jp: number;
  };
  roommateDimensions: {
    ei: number;
    sn: number;
    tf: number;
    jp: number;
  };
  primaryColor: string;
  secondaryColor: string;
  overallCompatibility?: number;
  userPersonalityType?: string; // User's actual personality type for accurate color
}

// Roommate-focused compatibility dimensions
const compatibilityDimensions = [
  {
    key: 'social',
    label: 'Social Energy',
    shortLabel: 'Social',
    image: require('../../assets/images/personalityGraph/socialEnergy.png'),
    userLabel: (value: number) => value >= 50 ? 'Quiet Space' : 'Social Hub',
    roommateLabel: (value: number) => value >= 50 ? 'Quiet Space' : 'Social Hub',
    getValue: (dims: any) => dims.ei,
    angle: 0, // Top
  },
  {
    key: 'routine',
    label: 'Daily Routine',
    shortLabel: 'Routine',
    image: require('../../assets/images/personalityGraph/dailyRoutine.png'),
    userLabel: (value: number) => value >= 50 ? 'Flexible' : 'Structured',
    roommateLabel: (value: number) => value >= 50 ? 'Flexible' : 'Structured',
    getValue: (dims: any) => dims.jp,
    angle: 60, // Top right
  },
  {
    key: 'communication',
    label: 'Communication',
    shortLabel: 'Comm.',
    image: require('../../assets/images/personalityGraph/communication.png'),
    userLabel: (value: number) => value >= 50 ? 'Empathetic' : 'Direct',
    roommateLabel: (value: number) => value >= 50 ? 'Empathetic' : 'Direct',
    getValue: (dims: any) => dims.tf,
    angle: 120, // Bottom right
  },
  {
    key: 'planning',
    label: 'Planning Style',
    shortLabel: 'Planning',
    image: require('../../assets/images/personalityGraph/planningStyle.png'),
    userLabel: (value: number) => value >= 50 ? 'Spontaneous' : 'Organized',
    roommateLabel: (value: number) => value >= 50 ? 'Spontaneous' : 'Organized',
    getValue: (dims: any) => 100 - dims.jp, // Invert for better UX
    angle: 180, // Bottom
  },
  {
    key: 'decisions',
    label: 'Decision Style',
    shortLabel: 'Decisions',
    image: require('../../assets/images/personalityGraph/decisionStyle.png'),
    userLabel: (value: number) => value >= 50 ? 'Heart-led' : 'Logic-led',
    roommateLabel: (value: number) => value >= 50 ? 'Heart-led' : 'Logic-led',
    getValue: (dims: any) => dims.tf,
    angle: 240, // Bottom left
  },
  {
    key: 'lifestyle',
    label: 'Lifestyle',
    shortLabel: 'Lifestyle',
    image: require('../../assets/images/personalityGraph/lifestyle.png'),
    userLabel: (value: number) => value >= 50 ? 'Creative' : 'Practical',
    roommateLabel: (value: number) => value >= 50 ? 'Creative' : 'Practical',
    getValue: (dims: any) => dims.sn,
    angle: 300, // Top left
  },
];

export const CompatibilityRadarChart: React.FC<CompatibilityRadarChartProps> = ({
  userDimensions,
  roommateDimensions,
  primaryColor,
  secondaryColor,
  overallCompatibility,
  userPersonalityType,
}) => {
  const animatedValues = useRef(
    compatibilityDimensions.reduce((acc, dim) => {
      acc[dim.key] = {
        user: new Animated.Value(0),
        roommate: new Animated.Value(0),
      };
      return acc;
    }, {} as Record<string, { user: Animated.Value; roommate: Animated.Value }>)
  ).current;

  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate in the chart
    Animated.sequence([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.stagger(100, [
        ...compatibilityDimensions.map((dim, index) => 
          Animated.parallel([
            Animated.timing(animatedValues[dim.key].user, {
              toValue: dim.getValue(userDimensions),
              duration: 800,
              useNativeDriver: false,
            }),
            Animated.timing(animatedValues[dim.key].roommate, {
              toValue: dim.getValue(roommateDimensions),
              duration: 800,
              useNativeDriver: false,
            }),
          ])
        ),
      ]),
    ]).start();
  }, []);

  // Calculate compatibility percentage
  const calculateCompatibility = () => {
    let totalCompatibility = 0;
    compatibilityDimensions.forEach((dim) => {
      const userValue = dim.getValue(userDimensions);
      const roommateValue = dim.getValue(roommateDimensions);
      const difference = Math.abs(userValue - roommateValue);
      const compatibility = Math.max(0, 100 - difference);
      totalCompatibility += compatibility;
    });
    return Math.round(totalCompatibility / compatibilityDimensions.length);
  };

  // Convert polar coordinates to cartesian
  const polarToCartesian = (angle: number, radius: number) => {
    const angleRad = (angle - 90) * (Math.PI / 180);
    return {
      x: center + radius * Math.cos(angleRad),
      y: center + radius * Math.sin(angleRad),
    };
  };

  // Generate polygon points for user and roommate
  const generatePolygonPoints = (isUser: boolean) => {
    return compatibilityDimensions
      .map((dim) => {
        const value = isUser 
          ? dim.getValue(userDimensions) 
          : dim.getValue(roommateDimensions);
        const radius = (value / 100) * maxRadius;
        const point = polarToCartesian(dim.angle, radius);
        return `${point.x},${point.y}`;
      })
      .join(' ');
  };

  // Generate overlap polygon (minimum values at each point)
  const generateOverlapPolygonPoints = () => {
    return compatibilityDimensions
      .map((dim) => {
        const userValue = dim.getValue(userDimensions);
        const roommateValue = dim.getValue(roommateDimensions);
        const minValue = Math.min(userValue, roommateValue);
        const radius = (minValue / 100) * maxRadius;
        const point = polarToCartesian(dim.angle, radius);
        return `${point.x},${point.y}`;
      })
      .join(' ');
  };

  const compatibilityScore = calculateCompatibility();

  // Fix color logic: YOU should get YOUR personality color, THEM should get THEIR personality color
  const roommateColor = primaryColor; // THEM gets THEIR personality color (from primaryColor prop)
  const userColor = getCurrentUserPersonalityColor(userDimensions, userPersonalityType); // YOU get YOUR personality color

  // Calculate harmonized overlap color using color theory
  const overlapColor = calculateHarmonizedColor(userColor, roommateColor);

  // Function to calculate user's personality color - use actual personality type if available
  function getCurrentUserPersonalityColor(dimensions: any, actualPersonalityType?: string): string {
    console.log('[CompatibilityRadarChart] Getting user personality color with:', {
      dimensions,
      actualPersonalityType,
      userPersonalityTypeProp: userPersonalityType
    });
    
    // If we have the actual personality type, use it directly (more reliable than inference)
    if (actualPersonalityType) {
      const color = getPersonalityColorFromType(actualPersonalityType);
      console.log('[CompatibilityRadarChart] Using actual personality type:', actualPersonalityType, 'color:', color);
      return color;
    }
    
    // Fallback: Determine personality type from dimensions
    const personalityType = inferPersonalityTypeFromDimensions(dimensions);
    const color = getPersonalityColorFromType(personalityType);
    console.log('[CompatibilityRadarChart] Inferred personality type from dimensions:', personalityType, 'color:', color);
    return color;
  }

  // Infer MBTI type from personality dimensions
  function inferPersonalityTypeFromDimensions(dims: any): string {
    const e_i = dims.ei < 50 ? 'E' : 'I'; // Lower ei = more Extroverted
    const s_n = dims.sn < 50 ? 'S' : 'N'; // Lower sn = more Sensing  
    const t_f = dims.tf < 50 ? 'T' : 'F'; // Lower tf = more Thinking
    const j_p = dims.jp < 50 ? 'J' : 'P'; // Lower jp = more Judging
    return e_i + s_n + t_f + j_p;
  }

  // Get personality color from MBTI type
  function getPersonalityColorFromType(personalityType: string): string {
    const personalityColors: Record<string, string> = {
      'ISTJ': '#A6C4A2', 'ISFJ': '#F3B94D', 'INFJ': '#B1B9E3', 'INTJ': '#8B7EC8',
      'ISTP': '#D4C5A9', 'ISFP': '#F4A5B9', 'INFP': '#A8BFA8', 'INTP': '#9BB7D4', // Changed ISTP to beige/tan
      'ESTP': '#E8A87C', 'ESFP': '#F5C6A0', 'ENFP': '#F59E0B', 'ENTP': '#C8A8D8',
      'ESTJ': '#B8C5A8', 'ESFJ': '#E5B8A0', 'ENFJ': '#D4A5C8', 'ENTJ': '#A8B8D8'
    };
    return personalityColors[personalityType] || '#6366F1'; // Default purple if type not found
  }

  // Calculate harmonized color between two colors
  function calculateHarmonizedColor(color1: string, color2: string): string {
    // Convert hex to RGB
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);
    
    if (!rgb1 || !rgb2) return color1; // Fallback
    
    // Use color theory: blend the colors and darken slightly for better contrast
    const blendedR = Math.round((rgb1.r + rgb2.r) / 2);
    const blendedG = Math.round((rgb1.g + rgb2.g) / 2);
    const blendedB = Math.round((rgb1.b + rgb2.b) / 2);
    
    // Darken by 20% for better overlap visibility
    const darkenedR = Math.round(blendedR * 0.8);
    const darkenedG = Math.round(blendedG * 0.8);
    const darkenedB = Math.round(blendedB * 0.8);
    
    return rgbToHex(darkenedR, darkenedG, darkenedB);
  }

  // Helper function to convert hex to RGB
  function hexToRgb(hex: string): {r: number, g: number, b: number} | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  // Helper function to convert RGB to hex
  function rgbToHex(r: number, g: number, b: number): string {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  return (
    <View className="items-center py-4">
      {/* Compatibility Scores */}
      <View className="mb-3">
        <View className="items-center">
          {/* Show both scores if overall compatibility is provided */}
          {overallCompatibility ? (
            <View className={`flex-row items-center ${screenWidth > 350 ? 'space-x-6' : 'space-x-4'}`}>
              <View className="items-center">
                <Text 
                  className={`font-[Poppins-Bold] ${screenWidth > 350 ? 'text-xl' : 'text-lg'}`} 
                  style={{ color: primaryColor }}
                >
                  {overallCompatibility}%
                </Text>
                <Text className={`font-[Poppins-Medium] ${screenWidth > 350 ? 'text-xs' : 'text-[10px]'} text-gray-600`}>
                  Overall Match
                </Text>
              </View>
              <View className={`${screenWidth > 350 ? 'w-px h-8' : 'w-px h-6'} bg-gray-300`} />
              <View className="items-center">
                <Text 
                  className={`font-[Poppins-Bold] ${screenWidth > 350 ? 'text-xl' : 'text-lg'}`} 
                  style={{ color: primaryColor }}
                >
                  {compatibilityScore}%
                </Text>
                <Text className={`font-[Poppins-Medium] ${screenWidth > 350 ? 'text-xs' : 'text-[10px]'} text-gray-600`}>
                  Personality Match
                </Text>
              </View>
            </View>
          ) : (
            // Fallback to single score
            <View className="items-center">
              <Text className="font-[Poppins-Bold] text-2xl" style={{ color: primaryColor }}>
                {compatibilityScore}%
              </Text>
              <Text className="font-[Poppins-Medium] text-sm text-gray-600">
                Personality Match
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Radar Chart with Axis Labels */}
      <Animated.View style={{ opacity: opacityAnim }}>
        <View style={{ position: 'relative', marginBottom: 15 }}>
          <Svg width={chartSize} height={chartSize}>
            <Defs>
              {/* Gradient for user area */}
              <RadialGradient id="userGradient" cx="50%" cy="50%">
                <Stop offset="0%" stopColor={userColor} stopOpacity="0.4" />
                <Stop offset="100%" stopColor={userColor} stopOpacity="0.1" />
              </RadialGradient>
              
              {/* Gradient for roommate area */}
              <RadialGradient id="roommateGradient" cx="50%" cy="50%">
                <Stop offset="0%" stopColor={roommateColor} stopOpacity="0.4" />
                <Stop offset="100%" stopColor={roommateColor} stopOpacity="0.1" />
              </RadialGradient>

              {/* Darker gradient for overlap area */}
              <RadialGradient id="overlapGradient" cx="50%" cy="50%">
                <Stop offset="0%" stopColor={overlapColor} stopOpacity="0.9" />
                <Stop offset="50%" stopColor={overlapColor} stopOpacity="0.8" />
                <Stop offset="100%" stopColor={overlapColor} stopOpacity="0.6" />
              </RadialGradient>
            </Defs>

            {/* Grid lines */}
            {[0.2, 0.4, 0.6, 0.8, 1.0].map((scale, index) => (
              <Circle
                key={index}
                cx={center}
                cy={center}
                r={maxRadius * scale}
                fill="none"
                stroke="#E5E7EB"
                strokeWidth="1"
              />
            ))}

            {/* Axis lines */}
            {compatibilityDimensions.map((dim) => {
              const point = polarToCartesian(dim.angle, maxRadius);
              return (
                <Line
                  key={dim.key}
                  x1={center}
                  y1={center}
                  x2={point.x}
                  y2={point.y}
                  stroke="#E5E7EB"
                  strokeWidth="1"
                />
              );
            })}

            {/* User polygon */}
            <Polygon
              points={generatePolygonPoints(true)}
              fill="url(#userGradient)"
              stroke={userColor}
              strokeWidth="2"
              strokeOpacity="0.8"
            />

            {/* Roommate polygon */}
            <Polygon
              points={generatePolygonPoints(false)}
              fill="url(#roommateGradient)"
              stroke={roommateColor}
              strokeWidth="2"
              strokeOpacity="0.8"
            />

            {/* Overlap polygon with darker gradient */}
            <Polygon
              points={generateOverlapPolygonPoints()}
              fill="url(#overlapGradient)"
              stroke={overlapColor}
              strokeWidth="2.5"
              strokeOpacity="1.0"
            />

            {/* Data points */}
            {compatibilityDimensions.map((dim) => {
              const userValue = dim.getValue(userDimensions);
              const roommateValue = dim.getValue(roommateDimensions);
              
              const userPoint = polarToCartesian(dim.angle, (userValue / 100) * maxRadius);
              const roommatePoint = polarToCartesian(dim.angle, (roommateValue / 100) * maxRadius);

              return (
                <G key={dim.key}>
                  {/* User point */}
                  <Circle
                    cx={userPoint.x}
                    cy={userPoint.y}
                    r="4"
                    fill={userColor}
                    stroke="white"
                    strokeWidth="1.5"
                  />
                  
                  {/* Roommate point */}
                  <Circle
                    cx={roommatePoint.x}
                    cy={roommatePoint.y}
                    r="4"
                    fill={roommateColor}
                    stroke="white"
                    strokeWidth="1.5"
                  />
                </G>
              );
            })}
          </Svg>

          {/* Axis Labels positioned around the chart */}
          {compatibilityDimensions.map((dim) => {
            // Dynamic distance calculation with more precise control
            const baseDistance = maxRadius + (screenWidth > 350 ? 25 : 20);
            const containerWidth = screenWidth > 350 ? 90 : 80;
            const imageSize = screenWidth > 350 ? 34 : 30;
            
            // Choose appropriate label based on available space
            const displayLabel = screenWidth > 350 ? dim.label : dim.shortLabel;
            const labelLength = displayLabel.length;
            
            // More precise distance calculation based on specific positions
            let extraDistance = 0;
            const normalizedAngle = ((dim.angle % 360) + 360) % 360;
            
            // Specific adjustments for problematic positions
            if (normalizedAngle === 300) { // Lifestyle (top-left)
              extraDistance = 15; // Move significantly further out
            } else if (normalizedAngle === 180) { // Planning Style (bottom)
              extraDistance = -5; // Move closer to chart
            } else if (normalizedAngle === 60) { // Daily Routine (top-right)
              extraDistance = 15; // Move further out to clear rings completely
            } else {
              // General rule for other positions
              const isHorizontallyExtended = (normalizedAngle > 30 && normalizedAngle < 150) || 
                                           (normalizedAngle > 210 && normalizedAngle < 330);
              
              if (isHorizontallyExtended) {
                extraDistance = Math.max(0, (labelLength - 8) * 1.5); // Reduced multiplier
              }
              
              if (labelLength > 10) {
                extraDistance += 3; // Reduced bonus for long labels
              }
            }
            
            const labelDistance = baseDistance + extraDistance;
            const labelPoint = polarToCartesian(dim.angle, labelDistance);
            
            // More precise text alignment and positioning
            let textAlign: 'center' | 'left' | 'right' = 'center';
            let adjustedX = labelPoint.x;
            let adjustedY = labelPoint.y;
            
            // Specific adjustments for each angle range with better precision
            if (normalizedAngle >= 315 || normalizedAngle <= 45) {
              // Top area - center align
              textAlign = 'center';
              adjustedY -= 2;
            } else if (normalizedAngle > 45 && normalizedAngle <= 135) {
              // Right side - left align
              textAlign = 'left';
              adjustedX += 6;
            } else if (normalizedAngle > 135 && normalizedAngle <= 225) {
              // Bottom area - center align, but less downward push for Planning Style
              textAlign = 'center';
              if (normalizedAngle === 180) { // Planning Style specifically
                adjustedY += 1; // Much smaller adjustment
              } else {
                adjustedY += 3;
              }
            } else {
              // Left side - right align with more aggressive positioning for Lifestyle
              textAlign = 'right';
              if (normalizedAngle === 300) { // Lifestyle specifically
                adjustedX -= 12; // More aggressive leftward push
              } else {
                adjustedX -= 6;
              }
            }

            return (
              <View
                key={`label-${dim.key}`}
                style={{
                  position: 'absolute',
                  left: adjustedX - (containerWidth / 2),
                  top: adjustedY - 12,
                  width: containerWidth,
                  alignItems: textAlign === 'center' ? 'center' : textAlign === 'left' ? 'flex-start' : 'flex-end',
                }}
              >
                <Image source={dim.image} style={{ width: imageSize, height: imageSize }} />
                <Text 
                  className="font-[Poppins-Medium] text-xs text-gray-600"
                  style={{ 
                    fontSize: screenWidth > 350 ? 10 : 9,
                    lineHeight: screenWidth > 350 ? 11 : 10,
                    textAlign: textAlign,
                  }}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {displayLabel}
                </Text>
              </View>
            );
          })}
        </View>
      </Animated.View>

      {/* Legend - Separated from chart */}
      <View className={`flex-row justify-center mt-2 mb-4 ${screenWidth > 350 ? 'space-x-6' : 'space-x-4'}`}>
        <View className="flex-row items-center">
          <View 
            className={`${screenWidth > 350 ? 'w-3 h-3' : 'w-2.5 h-2.5'} rounded-full mr-2`}
            style={{ backgroundColor: userColor }}
          />
          <Text className={`font-[Poppins-Medium] ${screenWidth > 350 ? 'text-sm' : 'text-xs'} text-gray-700`}>You</Text>
        </View>
        <View className="flex-row items-center">
          <View 
            className={`${screenWidth > 350 ? 'w-3 h-3' : 'w-2.5 h-2.5'} rounded-full mr-2`}
            style={{ backgroundColor: roommateColor }}
          />
          <Text className={`font-[Poppins-Medium] ${screenWidth > 350 ? 'text-sm' : 'text-xs'} text-gray-700`}>Them</Text>
        </View>
      </View>

      {/* Compatibility Summary - Only show top matches */}
      <View className="w-full px-4">
        <Text className="font-[Poppins-SemiBold] text-sm text-gray-800 mb-2">
          Compatibility Highlights
        </Text>
        
        {compatibilityDimensions
          .map((dim) => {
            const userValue = dim.getValue(userDimensions);
            const roommateValue = dim.getValue(roommateDimensions);
            const difference = Math.abs(userValue - roommateValue);
            
            // Much more realistic compatibility thresholds
            const isGreatMatch = difference < 15;  // Very close values
            const isGoodMatch = difference < 25;   // Reasonably close
            const isOkayMatch = difference < 40;   // Some compatibility
            // difference >= 40 = Poor match
            
            return { 
              ...dim, 
              difference,
              matchLevel: isGreatMatch ? 'great' : isGoodMatch ? 'good' : isOkayMatch ? 'okay' : 'poor'
            };
          })
          .sort((a, b) => a.difference - b.difference) // Sort by best matches first
          .slice(0, 3) // Show top 3 dimensions regardless of match level
          .map((dim, index) => {
            const displayLabel = screenWidth > 350 ? dim.label : dim.shortLabel;
            
            // Dynamic match display based on actual compatibility
            const getMatchDisplay = (matchLevel: string) => {
              switch(matchLevel) {
                case 'great':
                  return { icon: '✨', text: 'Great Match', color: 'text-green-600' };
                case 'good':
                  return { icon: '👍', text: 'Good Match', color: 'text-blue-600' };
                case 'okay':
                  return { icon: '🤝', text: 'Different Styles', color: 'text-yellow-600' };
                default: // poor
                  return { icon: '⚖️', text: 'Opposite Styles', color: 'text-orange-600' };
              }
            };
            
            const matchDisplay = getMatchDisplay(dim.matchLevel);
            
            return (
              <View key={dim.key} className="flex-row items-center py-1">
                <Image source={dim.image} style={{ width: 28, height: 28, marginRight: 8 }} />
                <Text 
                  className="font-[Poppins-Medium] text-sm text-gray-700 flex-1"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {displayLabel}
                </Text>
                <View className="flex-row items-center">
                  <Text className="text-xs mr-1">{matchDisplay.icon}</Text>
                  <Text className={`font-[Poppins-SemiBold] text-xs ${matchDisplay.color}`}>
                    {matchDisplay.text}
                  </Text>
                </View>
              </View>
            );
          })
        }

        
        {/* Always show a positive summary line */}
        <Text className="font-[Poppins-Regular] text-xs text-gray-500 mt-2">
          Different strengths that could complement each other well
        </Text>
      </View>
    </View>
  );
}; 