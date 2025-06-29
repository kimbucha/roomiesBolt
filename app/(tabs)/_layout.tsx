import React, { useEffect, useRef } from 'react';
import { Tabs } from 'expo-router';
import { Users, MessageCircle } from 'lucide-react-native';
import { View, Text, Animated, Pressable, Image } from 'react-native';
import { styled } from 'nativewind';
import type { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { useMessageStore } from '../../store/messageStore';
import { useWebSocketStore } from '../../services/WebSocketService';
import { useUserStore } from '../../store/userStore';
import { useSupabaseUserStore } from '../../store/supabaseUserStore';
import { useSupabaseAuthStore } from '../../store/supabaseAuthStore';
import UserAvatar from '../../components/UserAvatar';
import AppLogo from '../../components/common/AppLogo';
import { SCREEN_WIDTH } from '../../constants/screenDimensions';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ApiService from '../../services/ApiService';

// Styled components
const StyledView = styled(View);
const StyledAnimatedView = styled(Animated.View);

// Debug function removed to reduce console noise during data persistence testing

// Type definitions for the custom tab bar
type CustomTabBarProps = {
  state: any;
  descriptors: any;
  navigation: any;
};

// Custom tab bar component that only shows the tabs we want
function CustomTabBar({ state, descriptors, navigation }: CustomTabBarProps) {
  const insets = useSafeAreaInsets();
  // Move hook to top level of component to fix React Hook error
  const { user: supabaseUser } = useSupabaseUserStore();
  
  // Only show these three tabs - moved discover to the left
  const visibleRoutes = ['index', 'matches', 'profile'];
  
  return (
    <View style={{
      flexDirection: 'row',
      backgroundColor: '#FFFFFF',
      paddingBottom: 10 + insets.bottom,
      paddingTop: 8,
      borderTopWidth: 0,
    }}>
      {state.routes.map((route: any, index: number) => {
        // Skip rendering tabs that aren't in our visibleRoutes list
        if (!visibleRoutes.includes(route.name)) {
          return null;
        }
        
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        
        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };
        
        // Get the tab bar icon based on the route name
        let icon = null;
        if (route.name === 'index') {
          icon = <Users size={24} color={isFocused ? '#4F46E5' : '#9CA3AF'} />;
        } else if (route.name === 'matches') {
          icon = <MessageCircle size={24} color={isFocused ? '#4F46E5' : '#9CA3AF'} />;
        } else if (route.name === 'profile') {
          const { getProfilePicture } = require('../../utils/profilePictureHelper');
          const profileImage = getProfilePicture(supabaseUser);
          
          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={{ flex: 1, alignItems: 'center' }}
            >
              <View style={{
                width: 30,
                height: 30,
                borderRadius: 15,
                borderWidth: isFocused ? 2 : 0,
                borderColor: isFocused ? '#4F46E5' : 'transparent',
                overflow: 'hidden',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#F3F4F6',
              }}>
                {profileImage ? (
                  <Image 
                    source={profileImage}
                    style={{ width: 28, height: 28, borderRadius: 14 }} 
                    resizeMode="cover"
                  />
                ) : (
                  <Text style={{ 
                    fontSize: 12, 
                    fontWeight: 'bold', 
                    color: '#4F46E5' 
                  }}>
                    {supabaseUser?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </Text>
                )}
              </View>
            </Pressable>
          );
        }
        
        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            style={{ flex: 1, alignItems: 'center' }}
          >
            <View style={{ 
              padding: 8,
              borderRadius: 8
            }}>
              {icon}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  const { user, updateUser } = useUserStore();
  const { user: supabaseUser, fetchUserProfile } = useSupabaseUserStore();
  const { unreadCount } = useMessageStore();
  const { connect, disconnect } = useWebSocketStore();
  
  // Debug logging removed to reduce console noise during data persistence testing
  
  // Fetch user profile when entering the main app
  useEffect(() => {
    const { user: authUser } = useSupabaseAuthStore.getState();
    if (authUser && !supabaseUser) {
      console.log('[TabLayout] Authenticated user found, fetching profile from Supabase...');
      fetchUserProfile();
    }
  }, [supabaseUser, fetchUserProfile]);
  
  // Also fetch profile immediately when TabLayout mounts if user is authenticated
  useEffect(() => {
    const { user: authUser, isLoggedIn } = useSupabaseAuthStore.getState();
    if (isLoggedIn && authUser) {
      console.log('[TabLayout] Initial mount - fetching user profile...');
      fetchUserProfile();
    }
  }, []);
  
  // Connect to WebSocket when tab layout mounts
  useEffect(() => {
    try {
      // Only connect if user is authenticated
      if (user?.id) {
        connect();
        
        // Disconnect when component unmounts
        return () => {
          disconnect();
        };
      }
    } catch (error) {
      console.error('[TabLayout] Error in useEffect:', error);
    }
  }, []);

  // Debug: subscribe to user store changes
  useEffect(() => {
    // Monitor user state changes
    const unsubscribe = useUserStore.subscribe(state => {
      console.log('[TabLayout] User state updated');
    });
    return unsubscribe;
  }, []);

  // We no longer need to fetch the profile picture separately as we're using UserAvatar

  // Create navigation options
  const navigationOptions = {
    headerTitle: (props: any) => {
      return <AppLogo size="small" variant="default" />;
    },
    headerShadowVisible: false,
    headerBackground: function HeaderBackground() {
      return <View style={{ backgroundColor: '#FFFFFF', flex: 1 }} />;
    }
  };
  
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          display: 'none', // Hide the default tab bar
        },
      }}
      tabBar={props => <CustomTabBar {...props} />}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Discover',
          ...navigationOptions,
        }}
      />

      <Tabs.Screen
        name="discover/hooks/useSwipeIndicator"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="matches"
        options={{
          title: 'Matches',
          ...navigationOptions,
          tabBarIcon: ({ color, focused }) => (
            <View>
              <MessageCircle size={24} color={focused ? '#4F46E5' : '#9CA3AF'} />
              {unreadCount > 0 && (
                <View style={{
                  position: 'absolute',
                  top: -4,
                  right: -4,
                  backgroundColor: '#EF4444',
                  borderRadius: 10,
                  width: 18,
                  height: 18,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                  <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: 'bold' }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          ...navigationOptions,
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              width: 30,
              height: 30,
              borderRadius: 15,
              borderWidth: focused ? 2 : 0,
              borderColor: focused ? '#4F46E5' : 'transparent',
              overflow: 'hidden',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: '#F3F4F6',
            }}>
              {(() => {
                const { getProfilePicture } = require('../../utils/profilePictureHelper');
                const profileImage = getProfilePicture(supabaseUser);
                return profileImage ? (
                  <Image 
                    source={profileImage}
                    style={{ width: 28, height: 28, borderRadius: 14 }} 
                    resizeMode="cover"
                  />
                ) : (
                  <Text style={{ 
                    fontSize: 12, 
                    fontWeight: 'bold', 
                    color: '#4F46E5' 
                  }}>
                    {supabaseUser?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </Text>
                );
              })()}
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
