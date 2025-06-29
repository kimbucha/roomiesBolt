import { create } from 'zustand';
import { Message } from '../components/Chat';
import { useMessageStore } from '../store/messageStore';

// WebSocket connection states
export type WebSocketConnectionState = 'connecting' | 'open' | 'closing' | 'closed';

// WebSocket store interface
interface WebSocketState {
  socket: WebSocket | null;
  connectionState: WebSocketConnectionState;
  error: string | null;
  eventListeners: Record<string, Function>;
  
  // Actions
  connect: () => void;
  disconnect: () => void;
  sendMessage: (conversationId: string, text: string, senderId: string) => void;
}

// Mock WebSocket class for development
class MockWebSocket {
  private url: string;
  private listeners: Record<string, Function[]> = {
    open: [],
    message: [],
    close: [],
    error: [],
  };
  private intervalId: NodeJS.Timeout | null = null;
  public readyState: number = 0; // 0: connecting, 1: open, 2: closing, 3: closed

  constructor(url: string) {
    this.url = url;
    
    // Simulate connection delay
    setTimeout(() => {
      this.readyState = 1;
      this.triggerEvent('open', {});
      
      // Start sending mock messages
      this.startMockMessages();
    }, 1000);
  }

  addEventListener(event: string, callback: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  removeEventListener(event: string, callback: Function) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  send(data: string) {
    // Process the sent message
    try {
      const parsedData = JSON.parse(data);
      
      // Simulate message delivery
      setTimeout(() => {
        // Echo the message back as if it was delivered
        const response = {
          type: 'message_delivered',
          data: {
            ...parsedData,
            status: 'delivered',
            timestamp: new Date().toISOString(),
          },
        };
        
        this.triggerEvent('message', { data: JSON.stringify(response) });
        
        // Simulate message read after a delay
        setTimeout(() => {
          const readResponse = {
            type: 'message_read',
            data: {
              ...parsedData,
              status: 'read',
              timestamp: new Date().toISOString(),
            },
          };
          
          this.triggerEvent('message', { data: JSON.stringify(readResponse) });
        }, 3000);
      }, 1000);
    } catch (error) {
      // Silent error handling
    }
  }

  close() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    this.readyState = 3;
    this.triggerEvent('close', { code: 1000, reason: 'Normal closure' });
  }

  private triggerEvent(event: string, data: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  private startMockMessages() {
    // Simulate receiving messages every 30-60 seconds
    this.intervalId = setInterval(() => {
      const randomConversationId = `match-${Math.floor(Math.random() * 5) + 1}`;
      const messageTypes = ['text', 'question', 'greeting'];
      const messageType = messageTypes[Math.floor(Math.random() * messageTypes.length)];
      
      let messageText = '';
      switch (messageType) {
        case 'text':
          messageText = "Hey, just checking in. How's your apartment search going?";
          break;
        case 'question':
          messageText = 'What area of the city are you looking to live in?';
          break;
        case 'greeting':
          messageText = 'Hi there! I think we might be a good match as roommates. What do you think?';
          break;
      }
      
      const mockMessage = {
        type: 'new_message',
        data: {
          id: `msg-${Date.now()}`,
          conversationId: randomConversationId,
          senderId: `user-${randomConversationId}`,
          text: messageText,
          timestamp: new Date().toISOString(),
          status: 'sent',
        },
      };
      
      this.triggerEvent('message', { data: JSON.stringify(mockMessage) });
    }, Math.random() * 30000 + 30000); // Random interval between 30-60 seconds
  }
}

// Create WebSocket store
export const useWebSocketStore = create<WebSocketState>((set, get) => ({
  socket: null,
  connectionState: 'closed',
  error: null,
  eventListeners: {},
  
  connect: () => {
    // Close existing connection if any
    const { socket, eventListeners } = get();
    if (socket) {
      // Remove all existing event listeners
      if (eventListeners) {
        Object.entries(eventListeners).forEach(([event, callback]) => {
          socket.removeEventListener(event, callback as EventListener);
        });
      }
      socket.close();
    }
    
    set({ connectionState: 'connecting', error: null, eventListeners: {} });
    
    try {
      // In a real app, this would connect to a real WebSocket server
      // const newSocket = new WebSocket('wss://your-websocket-server.com');
      
      // For development, use our mock WebSocket
      const newSocket = new MockWebSocket('wss://mock-websocket-server.com') as unknown as WebSocket;
      
      // Store event listeners for later cleanup
      const newEventListeners: Record<string, Function> = {};
      
      // Open event handler
      const openHandler = () => {
        set({ connectionState: 'open' });
      };
      newSocket.addEventListener('open', openHandler);
      newEventListeners['open'] = openHandler;
      
      // Message event handler
      const messageHandler = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          const messageStore = useMessageStore.getState();
          
          switch (data.type) {
            case 'new_message':
              // Handle new incoming message
              if (data.data.conversationId && data.data.text) {
                messageStore.sendMessage(
                  data.data.conversationId,
                  data.data.text,
                  data.data.senderId
                );
              }
              break;
              
            case 'message_delivered':
            case 'message_read':
              // Update message status
              // This would update the message status in a real app
              break;
              
            default:
              // Silently handle unknown message types
              break;
          }
        } catch (error) {
          // Silent error handling
        }
      };
      newSocket.addEventListener('message', messageHandler);
      newEventListeners['message'] = messageHandler;
      
      // Close event handler
      const closeHandler = () => {
        set({ connectionState: 'closed' });
        
        // Attempt to reconnect after a delay
        setTimeout(() => {
          if (get().connectionState === 'closed') {
            get().connect();
          }
        }, 5000);
      };
      newSocket.addEventListener('close', closeHandler);
      newEventListeners['close'] = closeHandler;
      
      // Error event handler
      const errorHandler = (error: Event) => {
        set({ error: 'WebSocket connection error. Please try again.' });
      };
      newSocket.addEventListener('error', errorHandler);
      newEventListeners['error'] = errorHandler;
      
      set({ socket: newSocket, eventListeners: newEventListeners });
    } catch (error) {
      set({ 
        connectionState: 'closed', 
        error: 'Failed to establish WebSocket connection. Please try again.',
        eventListeners: {} 
      });
    }
  },
  
  disconnect: () => {
    const { socket, eventListeners } = get();
    if (socket) {
      // Remove all event listeners before closing
      if (eventListeners) {
        Object.entries(eventListeners).forEach(([event, callback]) => {
          socket.removeEventListener(event, callback as EventListener);
        });
      }
      socket.close();
    }
    set({ socket: null, connectionState: 'closed', eventListeners: {} });
  },
  
  sendMessage: (conversationId, text, senderId) => {
    const { socket, connectionState } = get();
    
    if (!socket || connectionState !== 'open') {
      set({ error: 'Not connected to server. Please try again.' });
      return;
    }
    
    try {
      const message = {
        type: 'send_message',
        data: {
          conversationId,
          text,
          senderId,
          timestamp: new Date().toISOString(),
        },
      };
      
      socket.send(JSON.stringify(message));
    } catch (error) {
      set({ error: 'Failed to send message. Please try again.' });
    }
  },
}));
