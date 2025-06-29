import { Stack } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';

export default function OnboardingLayout() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: '#fff' },
          gestureEnabled: true,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="welcome" />
        <Stack.Screen name="account" />
        <Stack.Screen name="budget" />
        <Stack.Screen name="lifestyle" />
        <Stack.Screen name="personality/intro" />
        <Stack.Screen name="personality/quiz" />
        <Stack.Screen name="personality/results" />
        <Stack.Screen name="goals" />
        <Stack.Screen name="preferences" />
        <Stack.Screen name="about-you" />
        <Stack.Screen name="education" />
        <Stack.Screen name="photos" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="get-started" />
        <Stack.Screen name="place-details" />
      </Stack>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});