import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useMessageStore } from '../store/messageStore';
import { useRoommateStore } from '../store/roommateStore';

interface ConversationRedirectProps {
  id?: string;
  userId?: string;
  name?: string;
  image?: string;
}

export default function ConversationRedirect({ 
  id, 
  userId, 
  name, 
  image 
}: ConversationRedirectProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(true);
  
  // Get conversation functions
  const { 
    getConversationById, 
    createConversation, 
    sendMessage 
  } = useMessageStore();
  
  // Get roommate functions
  const roommateStore = useRoommateStore();
  
  useEffect(() => {
    const targetId = id || userId;
    console.log("[ConversationRedirect] Redirecting with ID:", targetId);
    
    if (!targetId) {
      setError("No conversation ID provided");
      setIsRedirecting(false);
      return;
    }
    
    const redirectToConversation = async () => {
      try {
        // Check if this conversation already exists
        const existingConversation = getConversationById(targetId);
        
        if (existingConversation) {
          // Navigate to existing conversation
          console.log("[ConversationRedirect] Found existing conversation:", targetId);
          router.replace({
            pathname: '/conversation/[id]',
            params: { id: targetId }
          });
          return;
        }
        
        // Get the profile if available
        const profile = roommateStore.getById ? roommateStore.getById(targetId) : null;
        console.log("[ConversationRedirect] Profile found:", !!profile, profile?.name);
        
        // Create a new conversation with this user
        console.log("[ConversationRedirect] Creating new conversation with ID:", targetId);
        const newConversationId = await createConversation([targetId]);
        
        if (newConversationId) {
          // Redirect to the new conversation without sending an initial message
          console.log("[ConversationRedirect] Redirecting to new conversation:", newConversationId);
          router.replace({
            pathname: '/conversation/[id]',
            params: { id: newConversationId }
          });
        } else {
          setError("Failed to create conversation");
          setIsRedirecting(false);
        }
      } catch (err) {
        console.error("[ConversationRedirect] Error:", err);
        setError("An error occurred while creating conversation");
        setIsRedirecting(false);
      }
    };
    
    // Start redirect process
    redirectToConversation();
  }, [id, userId, router]);
  
  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <Text 
          style={styles.backLink}
          onPress={() => router.back()}
        >
          Go Back
        </Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#4F46E5" />
      <Text style={styles.text}>
        {isRedirecting ? "Opening conversation..." : "Creating conversation..."}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    marginBottom: 16,
    fontFamily: 'Poppins-Medium',
  },
  backLink: {
    fontSize: 16,
    color: '#4F46E5',
    fontFamily: 'Poppins-Medium',
    textDecorationLine: 'underline',
  },
}); 