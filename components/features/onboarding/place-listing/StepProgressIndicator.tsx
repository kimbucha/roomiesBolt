import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing } from 'react-native';

interface StepProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepTitles?: string[];
  progressTextFormat?: string | ((current: number, total: number) => string);
  progressCalculation?: 'steps' | 'fraction'; // Default is 'steps'
}

const StepProgressIndicator: React.FC<StepProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
  stepTitles = [],
  progressTextFormat,
  progressCalculation = 'steps', // Default to original behavior
}) => {
  // Animation value for progress bar
  const progressAnim = useRef(new Animated.Value(0)).current;
  
  // Calculate progress percentage based on the chosen method
  let progressPercentage = 0;
  if (progressCalculation === 'fraction') {
    progressPercentage = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;
  } else { // 'steps' calculation (original)
    // Handle case where totalSteps might be 1 to avoid division by zero
    const denominator = totalSteps > 1 ? totalSteps - 1 : 1;
    progressPercentage = ((currentStep - 1) / denominator) * 100;
  }
  
  // Animate progress bar when currentStep or totalSteps change
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progressPercentage,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [currentStep, totalSteps, progressPercentage]); // Include totalSteps
  
  // Determine the text to display
  let displayText = '';
  if (typeof progressTextFormat === 'function') {
    displayText = progressTextFormat(currentStep, totalSteps);
  } else if (typeof progressTextFormat === 'string') {
    // Basic string replacement for placeholders
    displayText = progressTextFormat
      .replace('{current}', String(currentStep))
      .replace('{total}', String(totalSteps));
  } else if (stepTitles.length > 0 && currentStep > 0 && currentStep <= stepTitles.length) {
    // Use stepTitles if provided and format isn't specified
    displayText = stepTitles[currentStep - 1];
  } else {
    // Fallback default text
    displayText = `${currentStep} of ${totalSteps}`;
  }
  
  return (
    <View className="mb-6">
      <View className="flex-row justify-between mb-2">
        <Text className="text-sm text-gray-600">{displayText}</Text>
      </View>
      
      <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <Animated.View
          className="h-full bg-indigo-500 rounded-full"
          style={{
            width: progressAnim.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
            }),
          }}
        />
      </View>
    </View>
  );
};

export default StepProgressIndicator;
