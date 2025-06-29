import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SplashScreen } from 'expo-router';
// Replace useUserStore with useSupabaseUserStore
import { useSupabaseUserStore } from '../store/supabaseUserStore';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useMessageStore } from '../store/messageStore';
// Import Supabase auth store
import { useSupabaseAuthStore } from '../store/supabaseAuthStore';
import { supabase, getCurrentSession, clearAllSessionsAndStorage } from '../services/supabaseClient';
// Import LoadingScreen to prevent white flashing
import LoadingScreen from '../components/common/LoadingScreen';
// Import AuthWrapper for Supabase integration
import AuthWrapper from '../components/AuthWrapper';
import { logCritical } from '../utils/onboardingDebugUtils';
// CONSOLIDATED: Use unified Supabase auth store only

// Keep splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// --- Header Title Component for Conversation Screen ---
const ConversationHeaderTitle = () => {
  const params = useLocalSearchParams<{ id: string }>();
  const conversationId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { getConversationById } = useMessageStore();
  const activeConversation = getConversationById(conversationId);
  const otherParticipant = activeConversation?.participants.find(p => p.id !== 'currentUser' && p.id !== 'current-user');

  if (!otherParticipant) {
    return <Text style={styles.headerTitleText}>Conversation</Text>;
  }

  return (
    <View style={styles.headerTitleContainer}>
      <Image 
        source={{ uri: otherParticipant.avatar || 'https://via.placeholder.com/40' }} 
        style={styles.headerAvatar} 
      />
      <Text style={styles.headerTitleText} numberOfLines={1}>
        {otherParticipant.name}
      </Text>
    </View>
  );
};
// --- End Header Title Component ---

export default function RootLayout() {
  // Use Supabase user store instead of the original user store
  const { user, isLoading } = useSupabaseUserStore();
  const { refreshUser, isLoading: supabaseLoading } = useSupabaseAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [authStateEvents, setAuthStateEvents] = useState<string[]>([]);
  const [lastRefreshTime, setLastRefreshTime] = useState(Date.now());
  const [stabilityTimer, setStabilityTimer] = useState<NodeJS.Timeout | null>(null);
  
  // Use a more robust approach to track when the app is fully ready
  // Only hide the loading screen when all initialization is complete and stable

  // Initialize Supabase session with improved loading state management
  useEffect(() => {
    const initializeSupabase = async () => {
      try {
        
        // CONSOLIDATED: Using production-ready supabaseAuthStore only
        
        // Development: Clear all storage on fresh starts (optional)
        // Uncomment the next line if you want truly fresh starts every time in development
        // if (__DEV__) {
        //   await clearAllSessionsAndStorage();
        //   console.log('[App] 🧹 Development mode: Cleared all storage for fresh start');
        // }
        
        setIsReady(true);
        
        // Set up auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          // Critical auth state change logging
          logCritical(`Auth state changed: ${event}`, session ? 'Session exists' : 'No session');
          
          if (event === 'INITIAL_SESSION') {
            // Handle initial session on app startup
            if (session) {
              logCritical('Valid session found on startup, fetching user profile');
              const userState = useSupabaseUserStore.getState();
              if (userState.fetchUserProfile) {
                await userState.fetchUserProfile();
              }
            }
          } else if (event === 'SIGNED_IN') {
            // Handle successful sign in
            logCritical('User signed in, fetching profile for data verification');
            const userState = useSupabaseUserStore.getState();
            if (userState.fetchUserProfile) {
              await userState.fetchUserProfile();
        }
          } else if (event === 'SIGNED_OUT') {
            // Handle sign out - clear user state
            logCritical('User signed out, clearing local state');
            const userState = useSupabaseUserStore.getState();
            // Clear user state manually since clearUser method doesn't exist
            useSupabaseUserStore.setState({ 
              user: null, 
              isAuthenticated: false,
              onboardingProgress: {
                currentStep: 'welcome',
                completedSteps: [],
                isComplete: false
              }
            });
          } else if (event === 'TOKEN_REFRESHED') {
            // Handle token refresh
          } else if (event === 'USER_UPDATED') {
            // Handle user update
          }
        });

        setIsInitialized(true);
        
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('[App] Supabase initialization failed:', error);
        setIsInitialized(true); // Still set ready to avoid infinite loading
          }
    };

    initializeSupabase();

    // Fallback timeout to ensure app becomes ready even if initialization fails
    const safetyTimeout = setTimeout(() => {
      setIsReady(true);
    }, 10000); // 10 seconds
    
    return () => clearTimeout(safetyTimeout);
  }, []);

  useEffect(() => {
    // Hide splash screen once the app is fully ready
    if (isReady && isInitialized) {
      SplashScreen.hideAsync();
    }
  }, [isReady, isInitialized]);

  // Show a proper loading screen until the app is fully ready
  // This prevents white flashing by ensuring a stable state before showing the UI
  if (!isReady || !isInitialized) {
    return (
      <SafeAreaProvider>
        <LoadingScreen message="Starting Roomies..." />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      {/* Wrap the entire app with AuthWrapper to handle Supabase authentication */}
      <AuthWrapper>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Stack 
            screenOptions={{
              headerShown: false,
              animation: 'fade',
              contentStyle: { backgroundColor: 'transparent' }
            }}
          >
            <Stack.Screen 
              name="index" 
              options={{ 
                headerShown: false,
              }} 
            />
            <Stack.Screen 
              name="(auth)" 
              options={{ 
                headerShown: false,
                animation: 'fade'
              }} 
            />
            <Stack.Screen 
              name="(tabs)" 
              options={{ 
                headerShown: false,
                animation: 'fade'
              }} 
            />
            <Stack.Screen 
              name="(onboarding)" 
              options={{ 
                headerShown: false,
                animation: 'slide_from_right'
              }} 
            />
            <Stack.Screen 
              name="place-detail" 
              options={{ 
                headerShown: false,
                animation: 'slide_from_right'
              }} 
            />
            <Stack.Screen 
              name="saved-places" 
              options={{ 
                headerShown: false,
                animation: 'slide_from_right'
              }} 
            />
            <Stack.Screen 
              name="chat-redirect" 
              options={{ 
                headerShown: false,
                animation: 'slide_from_right'
              }} 
            />
            <Stack.Screen 
              name="conversation"
              options={{ 
                headerShown: false,
                animation: 'slide_from_right'
              }}
            />
          </Stack>
          <StatusBar style="auto" />
        </GestureHandlerRootView>
      </AuthWrapper>
    </SafeAreaProvider>
  );
}

// Styles for the header title component
const styles = StyleSheet.create({
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  headerTitleText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
