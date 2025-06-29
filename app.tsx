import { useEffect } from 'react';
import { StyleSheet, View, AppState } from 'react-native';
import { withExpoSnack } from 'nativewind';
// Toast notifications have been removed
import { useWebSocketStore } from './services/WebSocketService';
import { useUserStore } from './store/userStore';

// This file is used to setup NativeWind with React Native
// It's imported by the entry point of the app

function App() {
  const { connect, disconnect } = useWebSocketStore();
  const { user } = useUserStore();
  
  // Initialize WebSocket connection when user is logged in
  useEffect(() => {
    if (user) {
      connect();
    } else {
      // Disconnect if user logs out
      disconnect();
    }
    
    // Cleanup WebSocket connection when component unmounts
    return () => {
      disconnect();
    };
  }, [user?.id]);
  
  // Handle app state changes (background/foreground)
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active' && user) {
        // Reconnect when app comes to foreground and user is logged in
        connect();
      } else if (nextAppState === 'background' || nextAppState === 'inactive') {
        // Disconnect when app goes to background
        disconnect();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Cleanup event listener when component unmounts
    return () => {
      subscription.remove();
    };
  }, [user]);
  
  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Toast notifications have been removed */}
    </View>
  );
}

export default withExpoSnack(App);
