import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { MessageCircle, Home, User } from 'lucide-react-native';

interface ConversationData {
  id: string;
  participant: {
    id: string;
    name: string;
    image?: string;
  };
  lastMessage?: {
    text: string;
    timestamp: string;
    senderId: string;
  };
  unreadCount: number;
  hasUnreadMessages: boolean;
  contextType?: 'place' | 'roommate'; // For place-related conversations
  contextData?: {
    title?: string;
    location?: string;
    budget?: string;
    listingImage?: string;
  };
}

interface ConversationCardItemProps {
  conversation: ConversationData;
  onPress: (conversationId: string) => void;
  currentUserId?: string;
}

export const ConversationCardItem: React.FC<ConversationCardItemProps> = ({
  conversation,
  onPress,
  currentUserId
}) => {
  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return time.toLocaleDateString();
  };

  const isFromCurrentUser = conversation.lastMessage?.senderId === currentUserId;
  const messagePreview = conversation.lastMessage?.text || 'No messages yet';
  const timestamp = conversation.lastMessage?.timestamp || new Date().toISOString();

  return (
    <TouchableOpacity
      style={[
        styles.conversationItem,
        conversation.hasUnreadMessages && styles.unreadItem
      ]}
      onPress={() => onPress(conversation.id)}
    >
      <View style={styles.leftContent}>
        <Image
          source={{ 
            uri: conversation.participant.image || 'https://via.placeholder.com/50' 
          }}
          style={styles.profileImage}
        />
        <View style={styles.badgeContainer}>
          {conversation.contextType === 'place' && conversation.contextData?.listingImage ? (
            <Image
              source={{ uri: conversation.contextData.listingImage }}
              style={styles.listingBadgeImage}
            />
          ) : conversation.contextType === 'place' ? (
            <Home size={14} color="#4F46E5" />
          ) : (
            <User size={14} color="#4F46E5" />
          )}
        </View>
      </View>
      
      <View style={styles.middleContent}>
        <View style={styles.headerRow}>
          <Text style={styles.participantName} numberOfLines={1}>
            {conversation.participant.name}
          </Text>
          <Text style={styles.timestamp}>
            {formatTimeAgo(timestamp)}
          </Text>
        </View>
        
        {/* Show place context if it's a place-related conversation */}
        {conversation.contextType === 'place' && conversation.contextData && (
          <Text style={styles.contextTitle} numberOfLines={1}>
            {conversation.contextData.title}
          </Text>
        )}
        
        {conversation.contextData && (
          <View style={styles.detailsRow}>
            <Text style={styles.contextDetails} numberOfLines={1}>
              {conversation.contextData.location}
              {conversation.contextData.budget && ` • ${conversation.contextData.budget}`}
            </Text>
          </View>
        )}
        
        {/* Message preview */}
        <Text style={[
          styles.messagePreview,
          conversation.hasUnreadMessages && styles.unreadMessagePreview
        ]} numberOfLines={2}>
          {isFromCurrentUser ? `You: ${messagePreview}` : `"${messagePreview}"`}
        </Text>
      </View>
      
      {/* Notification badge positioned to the right of timestamp */}
      <View style={styles.rightContent}>
        {conversation.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>
              {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    backgroundColor: '#FFFFFF',
  },
  unreadItem: {
    backgroundColor: '#F9FAFB',
  },
  leftContent: {
    position: 'relative',
    marginRight: 12,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F3F4F6',
  },
  badgeContainer: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 3,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  listingBadgeImage: {
    width: 14,
    height: 14,
    borderRadius: 3,
  },
  middleContent: {
    flex: 1,
    marginRight: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  participantName: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#1F2937',
    flex: 1,
  },
  timestamp: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
  },
  contextTitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#4F46E5',
    marginBottom: 2,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  contextDetails: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
  },
  messagePreview: {
    fontSize: 13,
    color: '#4B5563',
    fontFamily: 'Poppins-Regular',
    marginTop: 2,
  },
  unreadMessagePreview: {
    color: '#1F2937',
    fontWeight: '500',
  },
  rightContent: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginLeft: 8,
    paddingTop: 2,
  },
  unreadBadge: {
    backgroundColor: '#6366F1',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: 'Poppins-Bold',
    fontWeight: 'bold',
  },
});

export default ConversationCardItem;