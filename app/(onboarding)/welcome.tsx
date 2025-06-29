import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions, 
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  UIManager,
  LayoutAnimation,
  Animated,
  Easing,
  KeyboardAvoidingView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { User } from 'lucide-react-native';
import { Video, ResizeMode } from 'expo-av';
import { useUserStore } from '../../store/userStore';
import AppLogo from '../../components/common/AppLogo';
import { logOnboardingStepEntry, logOnboardingInputChange, logOnboardingStepComplete, logOnboardingNavigation } from '../../utils/onboardingDebugUtils';
import { BoltBadge } from '../../components/common/BoltBadge';

const { width, height } = Dimensions.get('window');

export default function Welcome() {
  // Enable LayoutAnimation for Android
  if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }
  
  const router = useRouter();
  const { user, updateUser, updateOnboardingProgress, onboardingProgress } = useUserStore();
  const [name, setName] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [initialTap, setInitialTap] = useState(false);
  const videoRef = useRef<Video>(null);
  const inputRef = useRef<TextInput>(null);
  
  // Animation values
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const inputContainerOpacity = useRef(new Animated.Value(0)).current;
  const namePromptOpacity = useRef(new Animated.Value(0)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const inputSectionPosition = useRef(new Animated.Value(0)).current; // For repositioning animation
  
  // Listen for keyboard events
  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
        
        if (name.trim()) {
          animateButtonIn();
        }
      }
    );
    
    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
        
        if (!name.trim()) {
          animateButtonOut();
        }
      }
    );
    
    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, [name]);
  
  // Start animations and update onboarding progress
  useEffect(() => {
    // Log entry to welcome step
    logOnboardingStepEntry('welcome', { initialName: name });
    
    updateOnboardingProgress({
      currentStep: '1',
    });
    
    // Sequence of animations for initial load
    Animated.sequence([
      // First animate the logo
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      // Then animate the name prompt and input container together
      Animated.parallel([
        Animated.timing(namePromptOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(inputContainerOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        })
      ])
    ]).start();
  }, []);

  // Handle initial tap to focus input
  const handleInitialTap = () => {
    if (!initialTap) {
      setInitialTap(true);
      
      // Focus the input
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  // Animate button in
  const animateButtonIn = () => {
    Animated.timing(buttonOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
      easing: Easing.linear, // Simple linear easing
    }).start();
  };
  
  // Animate button out
  const animateButtonOut = () => {
    Animated.timing(buttonOpacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
      easing: Easing.linear, // Simple linear easing
    }).start();
  };

  // Play video when ready
  const handleVideoReady = () => {
    if (videoRef.current) {
      videoRef.current.playAsync();
    }
  };

  // Handle input focus
  const handleFocus = () => {
    setIsFocused(true);
    // Directly animate position change when focused
    Animated.timing(inputSectionPosition, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
      easing: Easing.linear,
    }).start();
  };

  // Handle input blur
  const handleBlur = () => {
    setIsFocused(false);
    // Only animate back if keyboard is hidden
    if (!keyboardVisible) {
      Animated.timing(inputSectionPosition, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
        easing: Easing.linear,
      }).start();
    }
  };

  // Handle screen press
  const handleScreenPress = () => {
    if (!initialTap) {
      handleInitialTap();
    } else {
      Keyboard.dismiss();
    }
  };

  // Handle name input
  const handleNameChange = (text: string) => {
    setName(text);
    // Log name input change
    logOnboardingInputChange('welcome', 'name', text);
    
    // Show or hide button based on text content
    if (text.trim()) {
      animateButtonIn();
    } else {
      animateButtonOut();
    }
  };

  // Focus the input field when container is pressed
  const handleInputContainerPress = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Handle continue button press
  const handleContinue = () => {
    if (!name.trim()) {
      return;
    }

    // Log completed data for welcome step
    logOnboardingStepComplete('welcome', { name: name.trim() });

    // Save name to user store
    const updatedUser = {
      ...user,
      name: name.trim(),
    };
    updateUser(updatedUser);

    // Update onboarding progress for Account step (back to original flow)
    const updatedCompletedSteps = [...(onboardingProgress?.completedSteps || [])];
    if (!updatedCompletedSteps.includes('welcome')) {
      updatedCompletedSteps.push('welcome');
    }
    const updatedProgress = {
      currentStep: 'account', // Next step is account (email/password)
      completedSteps: updatedCompletedSteps
    };
    updateOnboardingProgress(updatedProgress);

    // Log navigation to next step
    logOnboardingNavigation('welcome', 'account', { user: updatedUser, progress: updatedProgress });

    // Navigate to the account screen (email/password intake)
    router.push('/(onboarding)/account'); 
  };

  // Calculate the input section position based on keyboard visibility
  const inputSectionTranslateY = inputSectionPosition.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -5], // Very subtle movement
  });

  return (
    <TouchableWithoutFeedback onPress={handleScreenPress}>
      <View style={styles.mainContainer}>
        {/* Video Background */}
        <Video
          ref={videoRef}
          source={require('../../assets/videos/roomies.mp4')}
          style={styles.backgroundVideo}
          resizeMode={ResizeMode.COVER}
          shouldPlay={true}
          isLooping={true}
          isMuted={true}
          onReadyForDisplay={handleVideoReady}
        />
        
        {/* Light Dark Overlay */}
        <View style={styles.lightOverlay} />
        
        {/* Bolt Badge */}
        <BoltBadge />
        
        {/* Gradient Overlay */}
        <LinearGradient
          colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.5)']}
          locations={[0, 0.5, 1]}
          style={styles.gradient}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoidView}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
          >
            <View style={styles.contentContainer}>
              {/* Animated Logo */}
              <Animated.View style={[styles.logoContainer, { opacity: logoOpacity }]}>
                <AppLogo variant="login" size="large" />
              </Animated.View>
              
              {/* Spacer */}
              <View style={styles.spacer} />
              
              {/* Input Section - Animated for repositioning */}
              <Animated.View 
                style={[
                  styles.inputSection,
                  {
                    transform: [{ translateY: inputSectionTranslateY }]
                  }
                ]}
              >
                {/* Animated Name Prompt */}
                <Animated.View 
                  style={{
                    opacity: namePromptOpacity,
                    transform: [
                      {
                        translateY: namePromptOpacity.interpolate({
                          inputRange: [0, 1],
                          outputRange: [20, 0]
                        })
                      }
                    ]
                  }}
                >
                  <Text style={styles.namePrompt}>What's your name?</Text>
                </Animated.View>
                
                {/* Animated Input Container */}
                <Animated.View
                  style={{
                    opacity: inputContainerOpacity,
                    transform: [
                      {
                        translateY: inputContainerOpacity.interpolate({
                          inputRange: [0, 1],
                          outputRange: [30, 0]
                        })
                      }
                    ],
                    marginTop: 16,
                    width: '100%'
                  }}
                >
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={[styles.inputContainer, isFocused && styles.inputContainerFocused]}
                    onPress={handleInputContainerPress}
                  >
                    <User size={20} color={isFocused ? '#FFFFFF' : 'rgba(255,255,255,0.7)'} />
                    <TextInput
                      ref={inputRef}
                      style={styles.input}
                      placeholder="Enter your name"
                      placeholderTextColor="rgba(255,255,255,0.7)"
                      value={name}
                      onChangeText={handleNameChange}
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                      autoCapitalize="words"
                      autoCorrect={false}
                    />
                  </TouchableOpacity>
                </Animated.View>
                
                {/* Animated Get Started Button */}
                <Animated.View
                  style={{
                    opacity: buttonOpacity,
                    transform: [
                      { 
                        scale: buttonOpacity.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.95, 1]
                        }) 
                      }
                    ],
                    marginTop: 16,
                    width: '100%'
                  }}
                >
                  <TouchableOpacity
                    style={styles.getStartedButton}
                    onPress={handleContinue}
                    disabled={!name.trim()}
                  >
                    <Text style={styles.getStartedButtonText}>
                      Get Started
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              </Animated.View>
            </View>
          </KeyboardAvoidingView>
        </LinearGradient>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: width,
    height: height,
  },
  lightOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)', // Lighter overlay
  },
  gradient: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  keyboardAvoidView: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    padding: 24,
    paddingTop: 60,
    paddingBottom: Platform.OS === 'ios' ? 10 : 5,
  },
  logoContainer: {
    alignItems: 'center',
  },
  spacer: {
    flex: 1,
  },
  inputSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: Platform.OS === 'ios' ? 8 : 5,
  },
  namePrompt: {
    fontSize: 20,
    fontWeight: '600', 
    color: 'white',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    width: '100%',
  },
  inputContainerFocused: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderColor: 'rgba(255, 255, 255, 0.5)',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#FFFFFF',
    height: '100%',
  },
  getStartedButton: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    width: '100%',
  },
  getStartedButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
