import React from 'react';
import { StyleSheet } from 'react-native';
import { Stack } from 'expo-router';

// Global variable to track if we've already initialized the conversation layout
let LAYOUT_INITIALIZED = false;

/**
 * Simplified conversation layout to prevent navigation conflicts
 * This layout now just provides the Stack navigator without any additional logic
 * All conversation management is handled in the [id].tsx file
 */
export default function ConversationLayout() {
  console.log("====== CONVERSATION LAYOUT ======");
  
  // Only log once to reduce console noise
  if (!LAYOUT_INITIALIZED) {
    console.log("[ConversationLayout] Using simplified layout to prevent navigation conflicts");
    LAYOUT_INITIALIZED = true;
  }
  
  return (
    <Stack screenOptions={{
      headerShown: false,
      animation: 'slide_from_right'
    }}>
      <Stack.Screen
        name="[id]"
      />
    </Stack>
  );
}

// Define styles even if not used to prevent StyleSheet reference errors
const styles = StyleSheet.create({
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerName: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#1F2937',
    marginLeft: 8,
  },
  backButton: {
    padding: 8,
  },
});
