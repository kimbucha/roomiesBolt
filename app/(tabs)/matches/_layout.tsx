import React from 'react';
import { Stack } from 'expo-router';

export default function MatchesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[matchId]" />
    </Stack>
  );
}
