import React, { forwardRef } from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';

interface InputFieldProps extends TextInputProps {
  label: string;
  icon?: React.ReactNode;
  error?: string;
}

const InputField = forwardRef<TextInput, InputFieldProps>(
  ({ label, icon, error, ...props }, ref) => {
    return (
      <View className="mb-4">
        <Text className="text-base font-semibold text-gray-800 mb-2">{label}</Text>
        <View 
          className={`flex-row items-center border rounded-lg px-3 py-2.5 ${
            error ? 'border-red-500' : 'border-gray-200'
          } bg-white`}
        >
          {icon && <View className="mr-2">{icon}</View>}
          <TextInput
            ref={ref}
            className="flex-1 text-base text-gray-800"
            placeholderTextColor="#9CA3AF"
            {...props}
          />
        </View>
        {error && (
          <Text className="text-red-500 text-xs mt-1">{error}</Text>
        )}
      </View>
    );
  }
);

export default InputField;
