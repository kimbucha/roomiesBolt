import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { Stack } from 'expo-router';
import ConversationRedirect from '../components/ConversationRedirect';

export default function ChatRedirectScreen() {
  console.log("====== CHAT REDIRECT SCREEN ======");
  const params = useLocalSearchParams();
  console.log("[ChatRedirect] Received params:", JSON.stringify(params, null, 2));
  
  // Extract the params
  const id = typeof params.id === 'string' ? params.id : undefined;
  const userId = typeof params.userId === 'string' ? params.userId : undefined;
  const name = typeof params.name === 'string' ? params.name : undefined;
  const image = typeof params.image === 'string' ? params.image : undefined;
  
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ConversationRedirect id={id} userId={userId} name={name} image={image} />
    </>
  );
} 