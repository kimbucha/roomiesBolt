import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Avatar } from '../common/Avatar';
import { Badge } from '../common/Badge';
import { formatRelativeTime } from '../../utils/dateUtils';
import { useMessageStore } from '../../store/messageStore';
import { Conversation } from '../../store/messageStore';
import { useUserStore } from '../../store/userStore';
import { formatDistanceToNow } from 'date-fns';

interface ConversationsListProps {
  onConversationPress?: (conversationId: string) => void;
  variant?: 'matches' | 'messages';
}

export default function ConversationsList({ onConversationPress, variant = 'messages' }: ConversationsListProps) {
  const router = useRouter();
  const { 
    conversations, 
    fetchConversations, 
    isLoading, 
    error,
    setActiveConversation,
    getUnreadCount
  } = useMessageStore();
  const { user } = useUserStore();
  
  const handleConversationPress = (conversationId: string) => {
    if (onConversationPress) {
      onConversationPress(conversationId);
    } else {
      setActiveConversation(conversationId);
      router.push(`/conversation/${conversationId}`);
    }
  };
  
  const calculateCompatibility = (conversation: Conversation) => {
    if (!user || !user.preferences) {
      return 75;
    }
    
    const otherParticipant = conversation.participants.find(p => p.id !== 'current-user');
    if (!otherParticipant || !otherParticipant.preferences) {
      return 75;
    }
    
    let matchingPreferences = 0;
    let totalPreferences = 0;
    
    if (user.preferences.budget && otherParticipant.preferences.budget) {
      const userBudgetAvg = (user.preferences.budget.min + user.preferences.budget.max) / 2;
      const otherBudgetAvg = (otherParticipant.preferences.budget.min + otherParticipant.preferences.budget.max) / 2;
      const budgetDiff = Math.abs(userBudgetAvg - otherBudgetAvg);
      if (budgetDiff < 200) matchingPreferences += 1;
      totalPreferences += 1;
    }
    
    if (user.preferences.roomType && otherParticipant.preferences.roomType &&
        user.preferences.roomType === otherParticipant.preferences.roomType) {
      matchingPreferences += 1;
    }
    totalPreferences += 1;
    
    const compatibility = Math.round((matchingPreferences / totalPreferences) * 100);
    return Math.min(100, Math.max(60, compatibility));
  };
  
  const hasUnreadMessages = (conversation: Conversation) => {
    return conversation.hasUnreadMessages || false;
  };
  
  const renderConversation = ({ item }: { item: Conversation }) => {
    const otherParticipant = item.participants.find(p => p.id !== 'current-user');
    
    if (!otherParticipant) return null;
    
    const compatibility = calculateCompatibility(item);
    const isUnread = hasUnreadMessages(item);
    
    return (
      <TouchableOpacity
        style={styles.conversationContainer}
        onPress={() => handleConversationPress(item.id)}
      >
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: otherParticipant.avatar }}
            style={styles.avatar}
          />
          {isUnread && <View style={styles.unreadIndicator} />}
        </View>
        <View style={styles.contentContainer}>
          <View style={styles.conversationHeader}>
            <Text style={styles.conversationName}>{otherParticipant.name}</Text>
            {variant === 'matches' ? (
              <View style={[styles.compatibilityBadge, { 
                backgroundColor: compatibility > 85 ? '#E0F2FE' : '#F3E8FF' 
              }]}>
                <Text style={[styles.compatibilityText, { 
                  color: compatibility > 85 ? '#0369A1' : '#7E22CE' 
                }]}>
                  {compatibility}% Match
                </Text>
              </View>
            ) : (
              <View style={styles.timeContainer}>
                {isUnread && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>New</Text>
                  </View>
                )}
                <Text style={styles.time}>
                  {item.lastMessage ? formatRelativeTime(item.lastMessage.timestamp) : ''}
                </Text>
              </View>
            )}
          </View>
          <Text
            style={[styles.previewText, isUnread && styles.unreadPreviewText]}
            numberOfLines={1}
          >
            {item.lastMessage ? item.lastMessage.content : ''}
          </Text>
        </View>
        <ChevronRight size={16} color="#9CA3AF" />
      </TouchableOpacity>
    );
  };
  
  if (isLoading && conversations.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading conversations...</Text>
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchConversations}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  if (conversations.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No conversations yet</Text>
        <Text style={styles.emptyText}>
          When you match with other users, your conversations will appear here.
        </Text>
      </View>
    );
  }
  
  return (
    <FlatList
      data={conversations}
      keyExtractor={(item) => item.id}
      renderItem={renderConversation}
      contentContainerStyle={styles.listContent}
      refreshing={isLoading}
      onRefresh={fetchConversations}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
  },
  conversationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  contentContainer: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    fontFamily: 'Poppins-SemiBold',
  },
  conversationTime: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
  },
  previewText: {
    fontSize: 14,
    color: '#4B5563',
    fontFamily: 'Poppins-Regular',
  },
  unreadPreviewText: {
    fontWeight: '600',
    color: '#1F2937',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: 'Poppins-Medium',
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Poppins-SemiBold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    fontFamily: 'Poppins-Bold',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: 'Poppins-Regular',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  time: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#6B7280',
  },
  compatibilityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  compatibilityText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
  },
  unreadText: {
    fontFamily: 'Poppins-Medium',
    color: '#FFFFFF',
    fontSize: 10,
  },
  unreadBadge: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 6,
  },
  unreadIndicator: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4F46E5',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  }
});
