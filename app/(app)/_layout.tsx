import React from 'react';
import { Stack, useRouter, usePathname } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: '#FFFFFF' },
        presentation: 'card',
      }}
    >
      <Stack.Screen
        name="match-profile/[matchId]"
        options={{
          headerShown: false,
          animation: 'slide_from_right',
          presentation: 'card',
          contentStyle: { backgroundColor: '#FFFFFF' },
        }}
      />
      <Stack.Screen
        name="profile/[userId]"
        options={{
          headerShown: false,
          animation: 'slide_from_right',
          presentation: 'card',
        }}
      />
    </Stack>
  );
}
