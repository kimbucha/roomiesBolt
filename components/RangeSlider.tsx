import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import MultiSlider from '@ptomasroos/react-native-multi-slider';

interface RangeSliderProps {
  minValue: number;
  maxValue: number;
  step: number;
  initialLowValue?: number;
  initialHighValue?: number;
  onValueChange?: (low: number, high: number) => void;
  /** Label to display before range text (default 'Rent') */
  label?: string;
  /** Unit prefix for values (default '$') */
  unit?: string;
}

// Format numeric value without currency prefix
const formatValue = (value: number): string => value.toLocaleString();

const RangeSlider: React.FC<RangeSliderProps> = ({
  minValue,
  maxValue,
  step,
  initialLowValue = 0,
  initialHighValue = 0,
  onValueChange,
  label = 'Rent',
  unit = '$',
}) => {
  const [values, setValues] = useState([
    initialLowValue || minValue,
    initialHighValue || maxValue
  ]);

  const getDisplayText = (): string => {
    if (values[0] === minValue && values[1] === maxValue) {
      return `${label}: Any`;
    } else if (values[0] === minValue) {
      return `${label}: Up to ${unit}${formatValue(values[1])}`;
    } else if (values[1] === maxValue) {
      return `${label}: ${unit}${formatValue(values[0])} or more`;
    } else {
      return `${label}: ${unit}${formatValue(values[0])} - ${unit}${formatValue(values[1])}`;
    }
  };

  const handleValuesChange = (newValues: number[]) => {
    setValues(newValues);
    if (onValueChange) {
      onValueChange(newValues[0], newValues[1]);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={styles.rangeLabel}>{getDisplayText()}</Text>
      </View>
      
      <View style={styles.sliderContainer}>
        <MultiSlider
          values={values}
          min={minValue}
          max={maxValue}
          step={step}
          sliderLength={Dimensions.get('window').width - 80}
          onValuesChange={handleValuesChange}
          selectedStyle={{
            backgroundColor: '#6366f1', // Purple color for the selected range
          }}
          unselectedStyle={{
            backgroundColor: '#E5E7EB', // Light gray for unselected parts
          }}
          containerStyle={{
            height: 40,
            marginHorizontal: 0,
            width: '100%',
          }}
          trackStyle={{
            height: 6,
            borderRadius: 3,
          }}
          markerStyle={{
            height: 24,
            width: 24,
            borderRadius: 12,
            backgroundColor: '#fff',
            borderWidth: 2,
            borderColor: '#6366f1',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 2,
            elevation: 2,
          }}
          pressedMarkerStyle={{
            height: 28,
            width: 28,
            borderRadius: 14,
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 8,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  sliderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 8,
  },
  rangeLabel: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'Poppins-Medium',
  },
});

export default RangeSlider;
