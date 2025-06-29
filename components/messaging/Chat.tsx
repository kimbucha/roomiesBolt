import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { Send, Image as ImageIcon, Smile, Paperclip, ArrowLeft } from 'lucide-react-native';
import { Avatar } from '../common/Avatar';
import { formatRelativeTime } from '../../utils/dateUtils';

// Message interface
export interface Message {
  id: string;
  text: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: Date | string;
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  isMe: boolean;
}

interface ChatProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isLoading?: boolean;
  error?: string | null;
  recipient?: {
    id: string;
    name: string;
    avatar?: string;
  };
  onHeaderPress?: () => void;
  onBackPress?: () => void;
  hideHeader?: boolean;
}

const Chat: React.FC<ChatProps> = ({
  messages,
  onSendMessage,
  isLoading = false,
  error,
  recipient,
  onHeaderPress,
  onBackPress,
  hideHeader = false,
}) => {
  const [text, setText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 200);
    }
  }, [messages]);

  const handleSend = () => {
    if (text.trim()) {
      onSendMessage(text.trim());
      setText('');
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.isMe;

    return (
      <View
        style={[
          styles.messageContainer,
          isMe ? styles.myMessageContainer : styles.theirMessageContainer,
        ]}
      >
        {!isMe && (
          <View style={styles.avatarContainer}>
            <Avatar
              size="small"
              source={
                item.sender.avatar 
                  ? (typeof item.sender.avatar === 'string' 
                     ? { uri: item.sender.avatar } 
                     : item.sender.avatar)
                  : undefined
              }
              name={item.sender.name}
            />
          </View>
        )}
        <View
          style={[
            styles.messageBubble,
            isMe ? styles.myMessageBubble : styles.theirMessageBubble,
          ]}
        >
          <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.theirMessageText]}>
            {item.text}
          </Text>
          <View style={styles.messageFooter}>
            <Text style={styles.messageTime}>
              {formatRelativeTime(item.timestamp)}
            </Text>
            {isMe && (
              <View style={styles.messageStatus}>
                {item.status === 'sending' && (
                  <ActivityIndicator size="small" color="#9CA3AF" />
                )}
                {item.status === 'sent' && (
                  <Text style={styles.statusText}>✓</Text>
                )}
                {item.status === 'delivered' && (
                  <Text style={styles.statusText}>✓✓</Text>
                )}
                {item.status === 'read' && (
                  <Text style={[styles.statusText, styles.readStatus]}>✓✓</Text>
                )}
                {item.status === 'failed' && (
                  <Text style={[styles.statusText, styles.failedStatus]}>!</Text>
                )}
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderDay = (timestamp: Date | string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let dayText = '';
    if (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    ) {
      dayText = 'Today';
    } else if (
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear()
    ) {
      dayText = 'Yesterday';
    } else {
      dayText = date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      });
    }

    return (
      <View style={styles.dayContainer}>
        <View style={styles.dayLine} />
        <Text style={styles.dayText}>{dayText}</Text>
        <View style={styles.dayLine} />
      </View>
    );
  };

  const renderMessageList = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading messages...</Text>
        </View>
      );
    }

    if (messages.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No messages yet</Text>
          <Text style={styles.emptySubtext}>
            Send a message to start the conversation
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messageList}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      {!hideHeader && (
        <View style={styles.header}>
          {onBackPress && (
            <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
              <ArrowLeft size={24} color="#1F2937" />
            </TouchableOpacity>
          )}
          <Pressable
            style={styles.recipientInfoWrapper}
            onPress={onHeaderPress}
            disabled={!onHeaderPress}
          >
            <Avatar
              size="small"
              source={
                recipient?.avatar 
                  ? (typeof recipient.avatar === 'string' 
                     ? { uri: recipient.avatar } 
                     : recipient.avatar)
                  : undefined
              }
              name={recipient?.name}
            />
            <View style={styles.recipientTextInfo}>
              <Text style={styles.recipientName} numberOfLines={1}>{recipient?.name}</Text>
            </View>
          </Pressable>
          <View style={styles.headerRightPlaceholder} />
        </View>
      )}

      <View style={styles.messagesContainer}>{renderMessageList()}</View>

      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.attachButton}>
          <Paperclip size={20} color="#6B7280" />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={text}
          onChangeText={setText}
          multiline
          maxLength={500}
        />
        <TouchableOpacity style={styles.emojiButton}>
          <Smile size={20} color="#6B7280" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sendButton, !text.trim() && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!text.trim()}
        >
          <Send
            size={20}
            color={text.trim() ? '#FFFFFF' : '#9CA3AF'}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 15, // Increased from 50 to 60 for better spacing from dynamic island
    paddingBottom: 12,
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    padding: 8,
  },
  recipientInfoWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recipientTextInfo: {
    marginLeft: 8,
  },
  recipientName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1F2937',
    fontFamily: 'Poppins-SemiBold',
  },
  headerRightPlaceholder: {
    width: 40,
    height: 40,
  },
  messagesContainer: {
    flex: 1,
  },
  messageList: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingHorizontal: 6,
    width: '100%',
  },
  myMessageContainer: {
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  theirMessageContainer: {
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  avatarContainer: {
    marginRight: 8,
    alignSelf: 'flex-end',
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 18,
    padding: 12,
    paddingVertical: 10,
    marginHorizontal: 4,
  },
  myMessageBubble: {
    backgroundColor: '#4F46E5',
    borderBottomRightRadius: 4,
  },
  theirMessageBubble: {
    backgroundColor: '#F3F4F6',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: 'Poppins-Regular',
  },
  myMessageText: {
    color: '#FFFFFF',
  },
  theirMessageText: {
    color: '#1F2937',
  },
  messageFooter: {
    marginTop: 4,
    alignItems: 'flex-end',
  },
  messageTime: {
    fontSize: 11,
    color: '#9CA3AF',
    fontFamily: 'Poppins-Regular',
  },
  myMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  messageStatus: {
    marginLeft: 5,
  },
  statusText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  readStatus: {
    color: '#3B82F6',
  },
  failedStatus: {
    color: '#EF4444',
  },
  dayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  dayLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dayText: {
    marginHorizontal: 12,
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    paddingBottom: Platform.OS === 'ios' ? 30 : 10,
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  attachButton: {
    padding: 10,
    marginRight: 5,
  },
  input: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 5,
  },
  emojiButton: {
    padding: 10,
    marginRight: 5,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
  },
});

export { Chat };
