import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing } from 'react-native';

interface StepProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepTitles?: string[];
}

const StepProgressIndicator: React.FC<StepProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
  stepTitles = [],
}) => {
  // Animation value for progress bar
  const progressAnim = useRef(new Animated.Value(0)).current;
  
  // Calculate progress percentage
  const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;
  
  // Animate progress bar when currentStep changes
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progressPercentage,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [currentStep, progressPercentage]);
  
  // Get current step title
  const currentStepTitle = stepTitles[currentStep - 1] || `${currentStep} of ${totalSteps}`;
  
  return (
    <View className="mb-6">
      <View className="flex-row justify-between mb-2">
        <Text className="text-sm text-gray-600">{currentStepTitle}</Text>
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
