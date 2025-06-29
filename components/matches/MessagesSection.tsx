import React, { useState } from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { RoommateProfile } from '../../store/roommateStore';
import { formatRelativeTime } from '../../utils/dateUtils';
import ContextMenu, { ContextMenuItem } from '../common/ContextMenu';
import { ConversationCardItem } from './ConversationCardItem';
import { useSupabaseAuthStore } from '../../store/supabaseAuthStore';

interface Participant {
  id: string;
  name: string;
  avatar?: string;
  [key: string]: any;
}

interface Conversation {
  id: string;
  participants: Participant[];
  lastMessage?: any;
  unreadCount: number;
  updatedAt: Date | string;
  hasUnreadMessages?: boolean;
  [key: string]: any;
}

interface MessagesSectionProps {
  conversations: Conversation[];
  getProfileById: (id: string) => RoommateProfile | undefined;
  navigate: any; // Using any since router.push has complex typing
  showHeader?: boolean;
  hasNewMatches: boolean;
  fetchConversations?: () => Promise<void>;
}

const MessagesSection: React.FC<MessagesSectionProps> = ({ 
  conversations, 
  getProfileById, 
  navigate,
  showHeader = true,
  hasNewMatches,
  fetchConversations
}) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{x:number; y:number}>({ x: 0, y: 0 });
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const { user } = useSupabaseAuthStore();

  // Fix the "User undefined" issue by ensuring participants have proper names
  const enhancedConversations = [...conversations]
    .filter(conversation => {
      // CRITICAL FIX: Filter out conversations with invalid or unresolvable participants
      if (!conversation || !conversation.participants || !Array.isArray(conversation.participants)) {
        console.warn("[MessagesSection] Filtering out conversation with invalid participants:", conversation);
        return false;
      }
      
      // Check if we can find at least one valid other participant (not the current user)
      const otherParticipant = conversation.participants.find(p => 
        p && p.id && p.id !== 'current-user' && p.id !== 'undefined' && p.id !== 'null' && p.name !== 'You'
      );
      
      if (!otherParticipant) {
        console.warn("[MessagesSection] Filtering out conversation with no valid other participant:", conversation);
        return false;
      }
      
      // Additional check: if it's a newly created conversation with no messages, only show it if the participant can be resolved
      const hasMessages = conversation.lastMessage || conversation.unreadCount > 0;
      if (!hasMessages) {
        const canResolveParticipant = getProfileById(otherParticipant.id) || 
          (otherParticipant.name && otherParticipant.name !== 'Chat Partner' && otherParticipant.name !== 'You');
        if (!canResolveParticipant) {
          console.warn("[MessagesSection] Filtering out empty conversation with unresolvable participant:", conversation);
          return false;
        }
      }
      
      return true;
    })
    .map(conversation => {
    // Create a new array of participants with updated names if needed
    const updatedParticipants = conversation.participants.map((participant: Participant) => {
      // CRITICAL FIX: Add validation to prevent undefined/null IDs
      if (!participant || !participant.id || participant.id === 'undefined' || participant.id === 'null') {
        console.warn("[MessagesSection] Found participant with invalid ID:", participant);
        return participant; // Return as-is, don't call getProfileById
      }
      
      // Skip the current user - we want to show the OTHER participant
      if (participant.id === 'current-user' || participant.name === 'You') {
        return participant; // Return as-is for current user
      }
      
      // If this participant doesn't have a proper name, try to get it from roommates
      if (participant.id !== 'current-user' && (!participant.name || participant.name === 'undefined' || participant.name === 'Chat Partner')) {
        const profile = getProfileById(participant.id);
        if (profile) {
          return {
            ...participant,
            name: profile.name,
            avatar: profile.image
          };
        }
      }
      return participant;
    });
    
    return {
      ...conversation,
      participants: updatedParticipants
    };
  });
  
  // Note: Using passed conversations data directly instead of modifying store
  // The conversations are already enhanced in the parent component

  // Function to render a single conversation item using the new ConversationCardItem
  const renderConversationItem = (conversation: Conversation) => {
    const otherParticipant = conversation.participants.find(p => p.id !== 'current-user');
    
    if (!otherParticipant) return null;
    
    // Transform conversation data to match ConversationCardItem interface
    const conversationData = {
      id: conversation.id,
      participant: {
        id: otherParticipant.id,
        name: otherParticipant.name,
        image: otherParticipant.avatar
      },
      lastMessage: conversation.lastMessage ? {
        text: conversation.lastMessage.content || '',
        timestamp: conversation.lastMessage.timestamp || new Date().toISOString(),
        senderId: conversation.lastMessage.senderId || ''
      } : undefined,
      unreadCount: conversation.unreadCount || 0,
      hasUnreadMessages: conversation.hasUnreadMessages || false,
      contextType: (conversation as any).contextTitle ? 'place' as const : 'roommate' as const,
      contextData: {
        title: (conversation as any).contextTitle,
        location: (conversation as any).contextLocation,
        budget: (conversation as any).contextBudget,
        listingImage: (conversation as any).contextListingImage
      }
    };
    
    return (
      <ConversationCardItem
        key={conversation.id}
        conversation={conversationData}
        currentUserId={user?.id}
        onPress={(conversationId) => {
          // CRITICAL FIX: Use match_id instead of conversation.id
          const targetId = conversation.match_id || conversationId;
          console.log('[MessagesSection] Navigating to conversation:', {
            conversationId,
            matchId: conversation.match_id,
            targetId,
            participant: otherParticipant.name
          });
          
          navigate({
            pathname: '/conversation/[id]',
            params: { id: targetId }
          });
        }}
      />
    );
  };

  return (
    <View className="bg-white">
      {showHeader && (
        <View className="flex-row justify-between items-center py-3 px-4 bg-white border-b border-gray-100">
          <Text className="text-[22px] font-[Poppins-Bold] text-gray-800 tracking-[-0.3px] font-extrabold">
            Messages
            {conversations.length > 0 && (
              <View className="bg-indigo-50 rounded-xl px-2 py-0.5 ml-2 inline-block">
                <Text className="text-[12px] text-indigo-600 font-semibold">{conversations.length}</Text>
              </View>
            )}
          </Text>
          <View className="flex-row items-center">
            {fetchConversations && (
              <Pressable 
                className="p-2 rounded-full bg-gray-50"
                onPress={fetchConversations}
              >
                <Text style={{ fontSize: 16 }}>↻</Text>
              </Pressable>
            )}
          </View>
        </View>
      )}
      
      {conversations.length === 0 ? (
        <View className="items-center justify-center py-12 px-6 bg-white rounded-xl mx-2 my-4 shadow-sm" 
              style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 1 }, elevation: 1 }}>
          <View className="w-20 h-20 rounded-full items-center justify-center mb-6 bg-indigo-50">
            <Image
              source={require('../../assets/images/hi.png')}
              style={{ width: 90, height: 90, borderRadius: 45 }}
              resizeMode="contain"
            />
          </View>
          <Text className="text-[24px] font-[Poppins-Bold] text-gray-800 mb-2">Say Hello</Text>
          <Text className="text-[16px] font-[Poppins-Regular] text-gray-500 text-center">
            {hasNewMatches
              ? 'Tap on a new match above to send a message.'
              : 'No matches yet. Swipe around to find a match.'}
          </Text>
        </View>
      ) : (
        <View className="bg-white">
          {enhancedConversations.map(renderConversationItem)}
        </View>
      )}
      <ContextMenu
        isVisible={menuVisible}
        targetPosition={menuPosition}
        items={[
          {
            text: 'View Profile',
            onPress: () => {
              if (selectedConversation) {
                const other = selectedConversation.participants.find(p => p.id !== 'current-user');
                if (other) navigate(`/profile/${other.id}`);
              }
              setMenuVisible(false);
            },
          },
          {
            text: 'View Conversation',
            onPress: () => {
              if (selectedConversation) {
                navigate({
                  pathname: '/conversation/[id]',
                  params: { id: selectedConversation.id }
                });
              }
              setMenuVisible(false);
            },
          },
        ] as ContextMenuItem[]}
        onClose={() => setMenuVisible(false)}
      />
    </View>
  );
};

export default MessagesSection; 