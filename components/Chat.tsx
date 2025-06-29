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
} from 'react-native';
import { Send, Image as ImageIcon, Smile, Paperclip } from 'lucide-react-native';
import { Avatar } from './Avatar';
import { formatRelativeTime } from '../utils/dateUtils';

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
    isOnline?: boolean;
    lastActive?: Date | string;
  };
}

const Chat: React.FC<ChatProps> = ({
  messages,
  onSendMessage,
  isLoading = false,
  error,
  recipient,
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
              size="sm"
              source={item.sender.avatar ? { uri: item.sender.avatar } : undefined}
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
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}>
        <View style={styles.recipientInfo}>
          <Avatar
            size="md"
            source={recipient?.avatar ? { uri: recipient.avatar } : undefined}
            name={recipient?.name}
          />
          <View style={styles.recipientTextInfo}>
            <Text style={styles.recipientName}>{recipient?.name}</Text>
            <Text style={styles.recipientStatus}>
              {recipient?.isOnline
                ? 'Online'
                : recipient?.lastActive
                ? `Last active ${formatRelativeTime(recipient.lastActive)}`
                : 'Offline'}
            </Text>
          </View>
        </View>
      </View>

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
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  recipientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recipientTextInfo: {
    marginLeft: 12,
  },
  recipientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  recipientStatus: {
    fontSize: 12,
    color: '#6B7280',
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  messageList: {
    paddingBottom: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    maxWidth: '80%',
  },
  myMessageContainer: {
    alignSelf: 'flex-end',
  },
  theirMessageContainer: {
    alignSelf: 'flex-start',
  },
  avatarContainer: {
    marginRight: 8,
    alignSelf: 'flex-end',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    maxWidth: '100%',
  },
  myMessageBubble: {
    backgroundColor: '#3B82F6',
    borderBottomRightRadius: 4,
  },
  theirMessageBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
  },
  myMessageText: {
    color: '#FFFFFF',
  },
  theirMessageText: {
    color: '#1F2937',
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 4,
  },
  messageTime: {
    fontSize: 10,
    color: '#9CA3AF',
    marginRight: 4,
  },
  messageStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 10,
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
  },
  dayLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dayText: {
    fontSize: 12,
    color: '#6B7280',
    marginHorizontal: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  attachButton: {
    padding: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    marginHorizontal: 8,
  },
  emojiButton: {
    padding: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
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
    marginTop: 8,
    fontSize: 14,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4B5563',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default Chat;
