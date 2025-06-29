import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Video, ResizeMode } from 'expo-av';
import { useSupabaseAuthStore } from '../store/supabaseAuthStore';
import { useSupabaseUserStore } from '../store/supabaseUserStore';
import { logCritical } from '../utils/onboardingDebugUtils';
import { BoltBadge } from '../components/common/BoltBadge';

export default function Index() {
  const router = useRouter();
  const videoRef = useRef<Video>(null);
  const { user: authUser, isLoggedIn } = useSupabaseAuthStore();
  const { user: userProfile } = useSupabaseUserStore();

  const handleVideoReady = () => {
    if (videoRef.current) {
      videoRef.current.playAsync();
    }
  };

  // Automatically redirect authenticated users
  useEffect(() => {
    const redirectIfAuthenticated = async () => {
      if (isLoggedIn && authUser) {
        logCritical('User is authenticated, fetching profile...');
        
        // Fetch user profile if not already loaded
        if (!userProfile) {
          const { fetchUserProfile } = useSupabaseUserStore.getState();
          const result = await fetchUserProfile();
          
          if (result.success) {
            const { user: fetchedUser } = useSupabaseUserStore.getState();
            
            if (fetchedUser?.onboardingCompleted) {
              logCritical('✅ REDIRECTING TO MAIN APP - data persisted correctly');
              router.replace('/(tabs)');
            } else {
              logCritical('❌ REDIRECTING TO ONBOARDING - data not persisted or incomplete');
              router.replace('/(onboarding)/welcome');
            }
          } else {
            logCritical('❌ Error fetching profile, redirecting to onboarding');
            router.replace('/(onboarding)/welcome');
          }
        } else {
          // Profile already loaded
          if (userProfile.onboardingCompleted) {
            logCritical('✅ REDIRECTING TO MAIN APP - data already loaded');
            router.replace('/(tabs)');
          } else {
            logCritical('❌ REDIRECTING TO ONBOARDING - profile incomplete');
            router.replace('/(onboarding)/welcome');
          }
        }
      }
    };

    // Small delay to ensure auth state is stable
    const timer = setTimeout(redirectIfAuthenticated, 500);
    
    return () => clearTimeout(timer);
  }, [isLoggedIn, authUser, userProfile, router]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Bolt Badge */}
      <BoltBadge />
      
      <Video
        ref={videoRef}
        source={require('../assets/videos/roomiesIntro.mp4')}
        style={styles.backgroundImage}
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping
        isMuted
        onReadyForDisplay={handleVideoReady}
      />
      <LinearGradient
        colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,0.9)']}
        style={styles.gradient}
      />
      
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>Roomies</Text>
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.title}>Find Your Perfect Roommate</Text>
          <Text style={styles.subtitle}>
            Connect with compatible roommates based on lifestyle, budget, and personality.
          </Text>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.loginButtonText}>Log In</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.signupButton}
            onPress={() => router.push('/(onboarding)/welcome')}
          >
            <Text style={styles.signupButtonText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '100%',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 24,
    paddingTop: 60,
    paddingBottom: 60,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoText: {
    fontWeight: 'bold',
    fontSize: 36,
    color: '#fff',
    letterSpacing: 1,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 32,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    marginTop: 40,
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signupButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  signupButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
