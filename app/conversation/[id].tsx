import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { Chat } from '../../components/messaging/Chat';
import { useSupabaseAuthStore } from '../../store/supabaseAuthStore';
import { useRoommateStore } from '../../store/roommateStore';
import { useSupabaseMatchesStore } from '../../store/supabaseMatchesStore';
import { ConversationRepository } from '../../repositories/ConversationRepository';
import { MessageRepository } from '../../repositories/MessageRepository';

export default function ConversationScreen() {
  const params = useLocalSearchParams();
  const { user } = useSupabaseAuthStore();
  const { profiles: availableRoommates } = useRoommateStore();
  const { matches } = useSupabaseMatchesStore();
  
  const [conversation, setConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [otherParticipant, setOtherParticipant] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const matchId = params.id as string;
  const currentUserId = user?.id || 'currentUser';

  const conversationRepo = new ConversationRepository();
  const messageRepo = new MessageRepository();

  console.log('====== CONVERSATION SCREEN (SUPABASE-FIRST) ======');
  console.log('[Conversation] Match ID:', matchId);

  // Load conversation and messages
  useEffect(() => {
    loadConversationData();
  }, [matchId]);

  // Find participant profile from conversation or match data
  useEffect(() => {
    if (availableRoommates.length > 0) {
      if (conversation) {
        console.log('[Conversation] Looking for participant in conversation:', conversation);
        
        // Find the other participant (not the current user)
        const otherParticipantData = conversation.participants?.find((p: any) => 
          p.user_id !== currentUserId
        ) || conversation.participant_profiles?.find((p: any) => 
          p.id !== currentUserId
        );
        
        if (otherParticipantData) {
          const participantId = otherParticipantData.user_id || otherParticipantData.id;
          console.log('[Conversation] Found other participant ID:', participantId);
          
          const profile = availableRoommates.find((p: any) => p.id === participantId);
            
          if (profile) {
            setOtherParticipant({
              id: profile.id,
              name: profile.name,
              avatar: profile.image
            });
            console.log('[Conversation] Set participant profile:', profile.name);
          } else {
            console.log('[Conversation] Profile not found for participant ID:', participantId);
            // Fallback: use participant data from conversation
            setOtherParticipant({
              id: participantId,
              name: otherParticipantData.name || 'Other User',
              avatar: otherParticipantData.avatar_url || otherParticipantData.image
            });
          }
        }
      } else {
        // No conversation exists yet, try to load participant from match data
        console.log('[Conversation] No conversation exists, loading participant from match data for:', matchId);
        loadParticipantFromMatch();
      }
    }
  }, [conversation, availableRoommates, currentUserId, matchId]);

  const loadParticipantFromMatch = async () => {
    try {
      // Check if this is a place-based conversation using params
      const source = params.source as string;
      if (source === 'placeInterest' || source === 'placeMessages') {
        console.log('[Conversation] Loading place-based conversation participant');
        
        // Handle the avatar - if it's a require object, use the original object
        let avatarImage = params.userImage as string;
        if (avatarImage === 'require_object') {
          // For Jamie Kim with ENFP image, we need to use the require directly
          const userName = params.userName as string;
          if (userName === 'Jamie Kim') {
            avatarImage = require('../../assets/images/personality/ENFP.png');
          }
        }
        
        setOtherParticipant({
          id: params.interestedUserId as string,
          name: params.userName as string,
          avatar: avatarImage
        });
        console.log('[Conversation] Set participant from place params:', params.userName);
        return;
      }

      // Original match-based logic
      console.log('[Conversation] Looking for match data in store, matchId:', matchId);
      console.log('[Conversation] Available matches:', matches.length);
      
      const matchData = matches.find((m: any) => m.id === matchId);
      if (matchData) {
        const otherUserId = matchData.user1Id === currentUserId ? matchData.user2Id : matchData.user1Id;
        console.log('[Conversation] Found other user ID from match:', otherUserId);
        
        const profile = availableRoommates.find((p: any) => p.id === otherUserId);
        if (profile) {
          setOtherParticipant({
            id: profile.id,
            name: profile.name,
            avatar: profile.image
          });
          console.log('[Conversation] Set participant profile from match:', profile.name);
        }
      } else {
        console.log('[Conversation] Match data not found for:', matchId);
      }
    } catch (error) {
      console.error('[Conversation] Error loading participant from match:', error);
    }
  };

  const loadConversationData = async () => {
    try {
      setLoading(true);
      console.log('[Conversation] Loading conversation for match:', matchId);

      // Try to find existing conversation first
      let existingConversation = await conversationRepo.findByMatchId(matchId);
      
      if (!existingConversation) {
        console.log('[Conversation] No existing conversation found - showing message lobby without creating conversation yet');
        // DON'T create conversation yet! Only create when first message is sent.
        // For now, set up a placeholder conversation object for the UI
        setConversation(null); // No conversation exists yet
        setMessages([]); // No messages yet
        setLoading(false);
        return;
      }

      setConversation(existingConversation);
      console.log('[Conversation] Conversation loaded:', existingConversation.id);
      console.log('[Conversation] Conversation data:', {
        participants: existingConversation.participants,
        participant_profiles: existingConversation.participant_profiles
      });

      // Load messages for this conversation
      const conversationMessages = await messageRepo.findByConversationId(existingConversation.id, 50);
      
      // Format messages for Chat component
      const formattedMessages = conversationMessages.map((msg: any) => ({
        id: msg.id,
        text: msg.content, // Chat component expects 'text' property
        timestamp: msg.created_at,
        sender: {
          id: msg.sender_id,
          name: msg.sender_id === currentUserId ? 'You' : 'Other'
        },
        isMe: msg.sender_id === currentUserId
      })).reverse(); // Chat expects newest first

      setMessages(formattedMessages);
      console.log('[Conversation] Messages loaded:', formattedMessages.length);

    } catch (error) {
      console.error('[Conversation] Error loading conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    try {
      let currentConversation = conversation;

      // If no conversation exists yet, create it now (on first message)
      if (!currentConversation) {
        console.log('[Conversation] Creating conversation on first message send');
        currentConversation = await conversationRepo.ensureFromMatch(matchId, currentUserId);
        setConversation(currentConversation);
        console.log('[Conversation] New conversation created:', currentConversation.id);
      }

      console.log('[Conversation] Sending message to conversation:', currentConversation.id);

      // Send message using repository
      const newMessage = await messageRepo.create({
        conversation_id: currentConversation.id,
        content
      });

      console.log('[Conversation] Message sent successfully:', newMessage.id);

      // Add to local messages immediately for instant UI update
      const formattedMessage = {
        id: newMessage.id,
        text: newMessage.content, // Chat component expects 'text' property
        timestamp: newMessage.created_at,
        sender: {
          id: currentUserId,
          name: 'You'
        },
        isMe: true
      };

      setMessages(prev => [formattedMessage, ...prev]);

    } catch (error) {
      console.error('[Conversation] Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  };

  const handleBackPress = () => {
    router.back();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar style="dark" />
      <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <Chat
        recipient={otherParticipant || { 
          id: 'unknown', 
          name: 'Loading...', 
          avatar: undefined 
        }}
        messages={messages}
        onSendMessage={handleSendMessage}
        onBackPress={handleBackPress}
        isLoading={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
