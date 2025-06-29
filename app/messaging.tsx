import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  Image, 
  KeyboardAvoidingView, 
  Platform, 
  SafeAreaView 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Send, Paperclip } from 'lucide-react-native';

// Mock message data structure
interface Message {
  id: string;
  text: string;
  timestamp: Date;
  isSender: boolean;
}

export default function MessagingScreen() {
  console.log("====== MESSAGING SCREEN ======");
  
  const params = useLocalSearchParams();
  console.log("[Messaging] Received params:", JSON.stringify(params, null, 2));
  
  const userId = typeof params.userId === 'string' ? params.userId : '';
  const name = typeof params.name === 'string' ? params.name : 'User';
  const image = typeof params.image === 'string' ? params.image : '';
  
  console.log("[Messaging] Parsed params:", { userId, name, image });
  
  const router = useRouter();
  
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>(getMockMessages(name));
  const flatListRef = useRef<FlatList>(null);
  
  useEffect(() => {
    console.log("[Messaging] Component mounted");
    // Scroll to bottom when component mounts
    if (flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 100);
    }
  }, []);
  
  const handleSendMessage = () => {
    if (message.trim() === '') return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      text: message,
      timestamp: new Date(),
      isSender: true
    };
    
    setMessages([...messages, newMessage]);
    setMessage('');
    
    // Simulate reply after a short delay
    setTimeout(() => {
      const replyMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: getAutoReply(message, name),
        timestamp: new Date(),
        isSender: false
      };
      
      setMessages(prev => [...prev, replyMessage]);
      
      // Scroll to bottom
      if (flatListRef.current) {
        flatListRef.current.scrollToEnd({ animated: true });
      }
    }, 1000);
  };
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        
        <View style={styles.profileContainer}>
          <Image 
            source={{ uri: image || 'https://via.placeholder.com/50' }} 
            style={styles.avatar} 
          />
          <View style={styles.nameContainer}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.status}>Online</Text>
          </View>
        </View>
      </View>
      
      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesContainer}
        renderItem={({ item, index }) => {
          // Check if we need to display the date
          let showDate = false;
          if (index === 0) {
            showDate = true;
          } else {
            const prevMessage = messages[index - 1];
            const prevDate = new Date(prevMessage.timestamp);
            const currentDate = new Date(item.timestamp);
            
            if (prevDate.toDateString() !== currentDate.toDateString()) {
              showDate = true;
            }
          }
          
          return (
            <>
              {showDate && (
                <View style={styles.dateContainer}>
                  <Text style={styles.dateText}>{formatDate(new Date(item.timestamp))}</Text>
                </View>
              )}
              
              <View style={[
                styles.messageBubble, 
                item.isSender ? styles.senderBubble : styles.receiverBubble
              ]}>
                <Text style={[
                  styles.messageText,
                  item.isSender ? styles.senderText : styles.receiverText
                ]}>
                  {item.text}
                </Text>
                <Text style={styles.timestamp}>{formatTime(new Date(item.timestamp))}</Text>
              </View>
            </>
          );
        }}
      />
      
      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        style={styles.inputContainer}
      >
        <TouchableOpacity style={styles.attachButton}>
          <Paperclip size={24} color="#6B7280" />
        </TouchableOpacity>
        
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={message}
          onChangeText={setMessage}
          multiline
          maxLength={500}
        />
        
        <TouchableOpacity 
          style={[
            styles.sendButton,
            message.trim() === '' ? styles.disabledButton : styles.activeButton
          ]}
          onPress={handleSendMessage}
          disabled={message.trim() === ''}
        >
          <Send size={22} color={message.trim() === '' ? "#9CA3AF" : "#FFFFFF"} />
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Helper function to generate mock messages
function getMockMessages(hostName: string): Message[] {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const twoDaysAgo = new Date(now);
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  
  return [
    {
      id: '1',
      text: `Hi! I'm interested in your place. Is it still available?`,
      timestamp: twoDaysAgo,
      isSender: true
    },
    {
      id: '2',
      text: `Hi there! Yes, it's still available. Are you looking to move in soon?`,
      timestamp: new Date(twoDaysAgo.getTime() + 30 * 60000),
      isSender: false
    },
    {
      id: '3',
      text: 'Yes! I was hoping to move in within the next month or so.',
      timestamp: new Date(twoDaysAgo.getTime() + 45 * 60000),
      isSender: true
    },
    {
      id: '4',
      text: 'That works with my timeline. Would you like to see the place in person?',
      timestamp: yesterday,
      isSender: false
    },
    {
      id: '5',
      text: 'Definitely! When would be a good time for a viewing?',
      timestamp: new Date(yesterday.getTime() + 20 * 60000),
      isSender: true
    },
    {
      id: '6',
      text: 'I could do tomorrow evening around 6pm, or this weekend on Saturday?',
      timestamp: new Date(yesterday.getTime() + 35 * 60000),
      isSender: false
    },
    {
      id: '7',
      text: 'Saturday would be perfect! Around what time?',
      timestamp: new Date(now.getTime() - 120 * 60000),
      isSender: true
    },
    {
      id: '8',
      text: 'Great! How about 11am on Saturday? The address is 123 Campus Drive.',
      timestamp: new Date(now.getTime() - 60 * 60000),
      isSender: false
    }
  ];
}

// Generate automatic replies based on message content
function getAutoReply(message: string, hostName: string): string {
  const lowerMsg = message.toLowerCase();
  
  if (lowerMsg.includes('price') || lowerMsg.includes('cost') || lowerMsg.includes('rent')) {
    return `The monthly rent is $1200, utilities included. Let me know if you have any other questions about the pricing!`;
  }
  
  if (lowerMsg.includes('tour') || lowerMsg.includes('visit') || lowerMsg.includes('see the place')) {
    return `I'd be happy to show you around! I'm available most evenings after 6pm and weekends. When works best for you?`;
  }
  
  if (lowerMsg.includes('roommate') || lowerMsg.includes('live with')) {
    return `There would be two other roommates in the apartment. Both are students - one studying Computer Science and the other in Engineering.`;
  }
  
  if (lowerMsg.includes('available') || lowerMsg.includes('move in')) {
    return `The room is available starting October 15. How soon were you looking to move in?`;
  }
  
  if (lowerMsg.includes('thank')) {
    return `You're welcome! Let me know if you have any other questions.`;
  }
  
  // Default response
  return `Thanks for your message! I'll get back to you as soon as possible. Feel free to ask any specific questions about the place.`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  nameContainer: {
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  status: {
    fontSize: 12,
    color: '#10B981',
  },
  messagesContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  dateContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  dateText: {
    fontSize: 14,
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  senderBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#4F46E5',
    borderBottomRightRadius: 4,
  },
  receiverBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    marginBottom: 4,
  },
  senderText: {
    color: '#FFFFFF',
  },
  receiverText: {
    color: '#1F2937',
  },
  timestamp: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    alignItems: 'center',
  },
  attachButton: {
    padding: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 8,
    maxHeight: 120,
    fontSize: 16,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: '#4F46E5',
  },
  disabledButton: {
    backgroundColor: '#E5E7EB',
  },
}); 