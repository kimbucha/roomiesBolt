import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  StatusBar,
  Animated,
  TextInput,
  Modal,
  Switch,
  Platform,
  Dimensions
} from 'react-native';
import { 
  PanGestureHandler, 
  TapGestureHandler, 
  State,
  PanGestureHandlerGestureEvent,
  TapGestureHandlerGestureEvent
} from 'react-native-gesture-handler';
import Reanimated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { 
  X, 
  Camera, 
  User, 
  MapPin, 
  GraduationCap, 
  Building, 
  Calendar,
  Instagram,
  Twitter,
  Facebook,
  Music,
  Linkedin,
  Youtube,
  AtSign,
  Briefcase,
  Heart,
  Moon,
  Volume2,
  Users,
  Sparkles,
  UserPlus,
  Check,
  ChevronRight,
  Edit3,
  Save,
  Plus
} from 'lucide-react-native';
import { useSupabaseUserStore } from '../store/supabaseUserStore';
import { Button, Input, EditProfileSection, SectionField, SectionHeader, SectionFooter, CharacterCounter, HintText } from '../components';
import UserAvatar from '../components/UserAvatar';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';

const { width, height } = Dimensions.get('window');

interface EditSection {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  component: () => JSX.Element;
}

const EditProfileScreen = () => {
  const router = useRouter();
  const { user, updateUserAndProfile, isLoading } = useSupabaseUserStore();
  
  // Modal and section state
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  // Simple edit modals (industry standard approach)
  const [editingBio, setEditingBio] = useState(false);
  const [editingName, setEditingName] = useState(false);
  
  // Form states - Basic Info
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  
  // Education/Work states
  const [university, setUniversity] = useState(user?.university || '');
  const [major, setMajor] = useState(user?.major || '');
  const [year, setYear] = useState(user?.year?.toString() || '');
  const [company, setCompany] = useState(user?.company || '');
  const [role, setRole] = useState(user?.role || '');
  const [educationType, setEducationType] = useState<'school' | 'work'>(
    user?.university ? 'school' : user?.company ? 'work' : 'school'
  );
  
  // Social Media states
  const [socialMedia, setSocialMedia] = useState({
    instagram: '',
    twitter: '',
    facebook: '',
    spotify: '',
    linkedin: '',
    youtube: '',
    tiktok: ''
  });
  
  // Lifestyle states
  const [lifestylePreferences, setLifestylePreferences] = useState({
    cleanliness: user?.lifestylePreferences?.cleanliness || 3,
    noise: user?.lifestylePreferences?.noise || 3,
    guestFrequency: user?.lifestylePreferences?.guestFrequency || 3,
    smoking: user?.lifestylePreferences?.smoking || false,
    pets: user?.lifestylePreferences?.pets || false,
    drinking: user?.lifestylePreferences?.drinking || false,
    earlyRiser: user?.lifestylePreferences?.earlyRiser || false,
    nightOwl: user?.lifestylePreferences?.nightOwl || false
  });
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(height)).current;
  
  // Reanimated values for gestures
  const translateY = useSharedValue(height);
  const overlayOpacity = useSharedValue(0);
  const isModalVisible = useSharedValue(false);
  
  // Get the header height to position modal correctly
  const headerHeight = Platform.OS === 'ios' ? 100 : 80;
  
  useEffect(() => {
    // Animate in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);
  
  useEffect(() => {
    if (modalVisible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [modalVisible]);

  const handleClose = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      router.back();
    });
  };

  const openSection = (sectionId: string) => {
    console.log('🚀 Opening section:', sectionId, 'modal currently:', modalVisible);
    setActiveSection(sectionId);
    setModalVisible(true);
    isModalVisible.value = true;
    
    // Set initial position and animate modal in with reduced bounce
    translateY.value = height;
    translateY.value = withSpring(0, {
      damping: 35,  // Increased damping to reduce bounce
      stiffness: 300,  // Increased stiffness for snappier feel
      mass: 0.8,  // Reduced mass for less overshoot
    });
    overlayOpacity.value = withTiming(1, { duration: 300 });
    console.log('🎬 Modal animation started');
  };

  const closeModal = () => {
    console.log('🚪 closeModal called, current state:', { modalVisible, activeSection });
    // Animate modal out with controlled spring
    translateY.value = withSpring(height, {
      damping: 35,  // Increased damping to reduce bounce
      stiffness: 300,  // Increased stiffness for snappier feel
      mass: 0.8,  // Reduced mass for less overshoot
    });
    overlayOpacity.value = withTiming(0, { duration: 300 });
    
    setTimeout(() => {
      console.log('⏰ setTimeout cleanup executing');
      setModalVisible(false);
      setActiveSection(null);
      isModalVisible.value = false;
    }, 300);
  };

  // Modal cleanup function - stable reference
  const cleanupModal = React.useCallback(() => {
    console.log('🧹 cleanupModal called');
    setModalVisible(false);
    setActiveSection(null);
  }, []);

  // Simple gesture handlers with targeted debugging
  const panGestureHandler = useAnimatedGestureHandler({
    onStart: () => {
      console.log('👆 Pan started');
    },
    onActive: (event) => {
      // Constrain drag to only downward movement - prevent detachment
      const newY = Math.max(0, Math.min(height * 0.8, event.translationY));
      translateY.value = newY;
      
      // Update opacity based on drag
      const progress = newY / (height * 0.3);
      overlayOpacity.value = Math.max(0.3, 1 - progress * 0.7);
    },
    onEnd: (event) => {
      console.log('🏁 Pan ended, translationY:', event.translationY);
      const shouldClose = event.translationY > height * 0.25 || event.velocityY > 1000;
      
      if (shouldClose) {
        console.log('❌ Should close modal');
        // Close modal with controlled spring
        translateY.value = withSpring(height, {
          damping: 35,
          stiffness: 300,
          mass: 0.8,
        });
        overlayOpacity.value = withTiming(0);
        
        console.log('📞 About to call runOnJS');
        runOnJS(cleanupModal)();
        console.log('✅ runOnJS called');
      } else {
        console.log('↩️ Snapping back');
        // Snap back with heavily controlled spring - minimal bounce
        translateY.value = withSpring(0, {
          damping: 50,  // Very high damping to minimize bounce
          stiffness: 400,  // High stiffness for quick return
          mass: 0.6,  // Very low mass to prevent overshoot
        });
        overlayOpacity.value = withTiming(1);
      }
    },
  });

  const handleBackgroundTap = () => {
    console.log('🫴 Background tap - closing modal');
    closeModal();
  };

  const tapGestureHandler = useAnimatedGestureHandler<TapGestureHandlerGestureEvent>({
    onEnd: () => {
      console.log('🔘 Tap gesture ended');
      runOnJS(handleBackgroundTap)();
    },
  });

  // Animated styles
  const overlayAnimatedStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const modalAnimatedStyle = useAnimatedStyle(() => ({
    // Ensure modal never goes above its starting position to prevent detachment
    transform: [{ translateY: Math.max(0, translateY.value) }],
  }));

  const handleSave = async () => {
    try {
      const updateData: any = {
        name,
        bio,
      };

      // Add education/work data
      if (educationType === 'school') {
        updateData.university = university;
        updateData.major = major;
        updateData.year = year;
        updateData.company = '';
        updateData.role = '';
      } else {
        updateData.company = company;
        updateData.role = role;
        updateData.university = '';
        updateData.major = '';
        updateData.year = '';
      }

      // Add lifestyle preferences
      updateData.lifestylePreferences = lifestylePreferences;

      // Add social media (only non-empty values)
      const socialMediaData: any = {};
      Object.entries(socialMedia).forEach(([key, value]) => {
        if (value.trim()) {
          socialMediaData[key] = value.trim();
        }
      });
      if (Object.keys(socialMediaData).length > 0) {
        updateData.socialMedia = socialMediaData;
      }

      await updateUserAndProfile(updateData, { validate: false });
      
      Alert.alert(
        'Profile Updated',
        'Your profile has been successfully updated.',
        [{ text: 'OK', onPress: handleClose }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  const handlePhotoUpload = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        // In a real app, you'd upload this to your storage service
        // For now, we'll just update the profile picture URL
        await updateUserAndProfile({ 
          profilePicture: result.assets[0].uri 
        }, { validate: false });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload photo. Please try again.');
    }
  };

  // Helper functions for lifestyle preferences
  const getCleanlinessText = (value: number) => {
    if (value <= 1) return 'Very clean';
    if (value <= 2) return 'Clean';
    if (value <= 3) return 'Moderate';
    return 'Relaxed';
  };

  const getNoiseLevelText = (value: number) => {
    if (value <= 1) return 'Quiet';
    if (value <= 2) return 'Moderate';
    return 'Social';
  };

  const getGuestFrequencyText = (value: number) => {
    if (value <= 1) return 'Rarely';
    if (value <= 2) return 'Occasionally';
    return 'Frequently';
  };

  // Section components - Simple fix for TextInput focus
  const BasicInfoSection = () => (
    <EditProfileSection
      description="Let others know who you are! Your name and bio are the first things potential roommates will see."
    >
      <SectionField>
        <TouchableOpacity 
          style={styles.editableField}
          onPress={() => setEditingName(true)}
        >
          <View style={styles.fieldLabel}>
            <User size={20} color="#6B7280" />
            <Text style={styles.fieldLabelText}>Full Name</Text>
          </View>
          <Text style={styles.fieldValue}>{name || 'Add your full name'}</Text>
        </TouchableOpacity>
      </SectionField>
      
      <SectionField>
        <SectionHeader
          title="Bio"
          tip="Mention your interests, hobbies, or lifestyle!"
        />
        
        <TouchableOpacity 
          style={styles.editableField}
          onPress={() => setEditingBio(true)}
        >
          <View style={styles.fieldLabel}>
            <Edit3 size={20} color="#6B7280" />
            <Text style={styles.fieldLabelText}>Bio</Text>
          </View>
          <Text style={[styles.fieldValue, { minHeight: 60 }]}>
            {bio || 'Tell people about yourself...'}
          </Text>
          <Text style={styles.simpleCharCount}>{bio.length}/300 characters</Text>
        </TouchableOpacity>
        
        <SectionFooter>
          <CharacterCounter 
            current={bio.length} 
            max={300} 
            warningThreshold={0.83}
          />
        </SectionFooter>
        
        <HintText
          text="Add more details to make your profile stand out!"
          type="warning"
          show={bio.length < 50}
        />
      </SectionField>
      
      <SectionField spacing="large">
        <View style={styles.previewSection}>
          <Text style={styles.previewLabel}>Preview:</Text>
          <View style={styles.previewCard}>
            <Text style={styles.previewName}>{name || 'Your Name'}</Text>
            <Text style={styles.previewBio} numberOfLines={3}>
              {bio || 'Your bio will appear here...'}
            </Text>
          </View>
        </View>
      </SectionField>
    </EditProfileSection>
  );

  const EducationSection = () => (
    <EditProfileSection
      description="Share your educational background or work experience to help potential roommates get to know you better."
      showTips={true}
      tips={[
        "Students: Include your university, major, and year to connect with fellow students",
        "Professionals: Share your company and role to find career-focused roommates"
      ]}
    >
      <SectionField>
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleButton, educationType === 'school' && styles.toggleButtonActive]}
            onPress={() => setEducationType('school')}
          >
            <GraduationCap size={20} color={educationType === 'school' ? '#FFFFFF' : '#6B7280'} />
            <Text style={[styles.toggleText, educationType === 'school' && styles.toggleTextActive]}>
              Student
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, educationType === 'work' && styles.toggleButtonActive]}
            onPress={() => setEducationType('work')}
          >
            <Briefcase size={20} color={educationType === 'work' ? '#FFFFFF' : '#6B7280'} />
            <Text style={[styles.toggleText, educationType === 'work' && styles.toggleTextActive]}>
              Professional
            </Text>
          </TouchableOpacity>
        </View>
      </SectionField>

      {educationType === 'school' ? (
        <>
          <SectionField>
            <Input
              label="University"
              value={university}
              onChangeText={setUniversity}
              placeholder="Enter your university"
              leftIcon={<GraduationCap size={20} color="#6B7280" />}
            />
          </SectionField>
          <SectionField>
            <Input
              label="Major"
              value={major}
              onChangeText={setMajor}
              placeholder="Enter your major"
              leftIcon={<Building size={20} color="#6B7280" />}
            />
          </SectionField>
          <SectionField>
            <Input
              label="Year"
              value={year}
              onChangeText={setYear}
              placeholder="e.g., Sophomore, Junior"
              leftIcon={<Calendar size={20} color="#6B7280" />}
            />
          </SectionField>
        </>
      ) : (
        <>
          <SectionField>
            <Input
              label="Company"
              value={company}
              onChangeText={setCompany}
              placeholder="Enter your company"
              leftIcon={<Building size={20} color="#6B7280" />}
            />
          </SectionField>
          <SectionField>
            <Input
              label="Role"
              value={role}
              onChangeText={setRole}
              placeholder="Enter your job title"
              leftIcon={<Briefcase size={20} color="#6B7280" />}
            />
          </SectionField>
        </>
      )}
    </EditProfileSection>
  );

  const SocialMediaSection = () => (
    <EditProfileSection
      description="Add your social media handles to let potential roommates connect with you and see your interests."
      showTips={true}
      tips={[
        "Add your most active social media accounts to help roommates connect",
        "Include usernames without the @ symbol for easier copying",
        "Your Spotify can show music compatibility with potential roommates"
      ]}
    >
      <SectionField>
        <Input
          label="Instagram"
          value={socialMedia.instagram}
          onChangeText={(value: string) => setSocialMedia(prev => ({ ...prev, instagram: value }))}
          placeholder="username (without @)"
          leftIcon={<Instagram size={20} color="#E4405F" />}
        />
      </SectionField>
      
      <SectionField>
        <Input
          label="Twitter/X"
          value={socialMedia.twitter}
          onChangeText={(value: string) => setSocialMedia(prev => ({ ...prev, twitter: value }))}
          placeholder="username (without @)"
          leftIcon={<Twitter size={20} color="#1DA1F2" />}
        />
      </SectionField>
      
      <SectionField>
        <Input
          label="TikTok"
          value={socialMedia.tiktok}
          onChangeText={(value: string) => setSocialMedia(prev => ({ ...prev, tiktok: value }))}
          placeholder="username (without @)"
          leftIcon={<AtSign size={20} color="#000000" />}
        />
      </SectionField>
      
      <SectionField>
        <Input
          label="Spotify"
          value={socialMedia.spotify}
          onChangeText={(value: string) => setSocialMedia(prev => ({ ...prev, spotify: value }))}
          placeholder="Your Spotify username"
          leftIcon={<Music size={20} color="#1DB954" />}
        />
        <HintText
          text="🎵 Great for finding roommates with similar music taste!"
          type="info"
          show={socialMedia.spotify.length > 0}
        />
      </SectionField>
      
      <SectionField>
        <Input
          label="LinkedIn"
          value={socialMedia.linkedin}
          onChangeText={(value: string) => setSocialMedia(prev => ({ ...prev, linkedin: value }))}
          placeholder="Profile URL or username"
          leftIcon={<Linkedin size={20} color="#0A66C2" />}
        />
        <HintText
          text="💼 Perfect for professional roommate connections"
          type="info"
          show={socialMedia.linkedin.length > 0}
        />
      </SectionField>
      
      <SectionField>
        <Input
          label="Facebook"
          value={socialMedia.facebook}
          onChangeText={(value: string) => setSocialMedia(prev => ({ ...prev, facebook: value }))}
          placeholder="Profile name or username"
          leftIcon={<Facebook size={20} color="#1877F2" />}
        />
      </SectionField>
    </EditProfileSection>
  );

  const LifestyleSection = () => (
    <EditProfileSection
      description="Help potential roommates understand your living style and preferences to find the perfect match."
      showTips={true}
      tips={[
        "Be honest about your preferences - it leads to better roommate matches",
        "Sleep schedule compatibility is crucial for peaceful cohabitation",
        "Cleanliness and noise levels are major factors in roommate satisfaction"
      ]}
    >
      {/* Sleep Schedule */}
      <SectionField>
        <SectionHeader
          title="Sleep Schedule"
          subtitle="When are you most active?"
        />
        <View style={styles.sleepScheduleContainer}>
          <TouchableOpacity
            style={[styles.sleepOption, lifestylePreferences.earlyRiser && styles.sleepOptionActive]}
            onPress={() => setLifestylePreferences(prev => ({ 
              ...prev, 
              earlyRiser: !prev.earlyRiser,
              nightOwl: prev.earlyRiser ? prev.nightOwl : false
            }))}
          >
            <Text style={[styles.sleepOptionText, lifestylePreferences.earlyRiser && styles.sleepOptionTextActive]}>
              🌅 Early Riser
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sleepOption, lifestylePreferences.nightOwl && styles.sleepOptionActive]}
            onPress={() => setLifestylePreferences(prev => ({ 
              ...prev, 
              nightOwl: !prev.nightOwl,
              earlyRiser: prev.nightOwl ? prev.earlyRiser : false
            }))}
          >
            <Text style={[styles.sleepOptionText, lifestylePreferences.nightOwl && styles.sleepOptionTextActive]}>
              🦉 Night Owl
            </Text>
          </TouchableOpacity>
        </View>
      </SectionField>

      {/* Cleanliness */}
      <SectionField>
        <SectionHeader
          title="Cleanliness Level"
          subtitle={`Current: ${getCleanlinessText(lifestylePreferences.cleanliness)}`}
        />
        <View style={styles.sliderContainer}>
          <Text style={styles.sliderLabel}>Very clean</Text>
          <View style={styles.slider}>
            <View style={[styles.sliderTrack, { width: `${(lifestylePreferences.cleanliness / 4) * 100}%` }]} />
            <View
              style={[styles.sliderThumb, { left: `${(lifestylePreferences.cleanliness / 4) * 100 - 2}%` }]}
            />
          </View>
          <Text style={styles.sliderLabel}>Relaxed</Text>
        </View>
        <HintText
          text="✨ Cleanliness compatibility reduces future conflicts"
          type="info"
          show={true}
        />
      </SectionField>

      {/* Noise Level */}
      <SectionField>
        <SectionHeader
          title="Noise Preference"
          subtitle={`Preference: ${getNoiseLevelText(lifestylePreferences.noise)}`}
        />
        <HintText
          text="🔊 Consider your study/work-from-home needs"
          type="info"
          show={true}
        />
      </SectionField>

      {/* Guest Frequency */}
      <SectionField>
        <SectionHeader
          title="Having Guests Over"
          subtitle={`Frequency: ${getGuestFrequencyText(lifestylePreferences.guestFrequency)}`}
        />
        <HintText
          text="👥 Important for roommates who value privacy vs. social spaces"
          type="info"
          show={true}
        />
      </SectionField>

      {/* Lifestyle Choices */}
      <SectionField spacing="large">
        <SectionHeader
          title="Lifestyle Choices"
          subtitle="Select what applies to you"
        />
        <View style={styles.switchContainer}>
          <View style={styles.switchItem}>
            <Text style={styles.switchLabel}>🚭 Smoking Friendly</Text>
            <Switch
              value={lifestylePreferences.smoking}
              onValueChange={(value) => setLifestylePreferences(prev => ({ ...prev, smoking: value }))}
              trackColor={{ false: '#E5E7EB', true: '#4F46E5' }}
              thumbColor="#FFFFFF"
            />
          </View>
          <View style={styles.switchItem}>
            <Text style={styles.switchLabel}>🐾 Pet Friendly</Text>
            <Switch
              value={lifestylePreferences.pets}
              onValueChange={(value) => setLifestylePreferences(prev => ({ ...prev, pets: value }))}
              trackColor={{ false: '#E5E7EB', true: '#4F46E5' }}
              thumbColor="#FFFFFF"
            />
          </View>
          <View style={styles.switchItem}>
            <Text style={styles.switchLabel}>🍷 Drinking Friendly</Text>
            <Switch
              value={lifestylePreferences.drinking}
              onValueChange={(value) => setLifestylePreferences(prev => ({ ...prev, drinking: value }))}
              trackColor={{ false: '#E5E7EB', true: '#4F46E5' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
      </SectionField>
    </EditProfileSection>
  );

  const sections: EditSection[] = [
    {
      id: 'basic',
      title: 'Basic Information',
      icon: User,
      component: BasicInfoSection,
    },
    {
      id: 'education',
      title: 'Education & Work',
      icon: GraduationCap,
      component: EducationSection,
    },
    {
      id: 'social',
      title: 'Social Media',
      icon: Instagram,
      component: SocialMediaSection,
    },
    {
      id: 'lifestyle',
      title: 'Lifestyle & Preferences',
      icon: Heart,
      component: LifestyleSection,
    },
  ];

  const renderSectionModal = () => {
    const section = sections.find(s => s.id === activeSection);
    if (!section) return null;

    return (
      <Modal
        visible={modalVisible}
        transparent
        animationType="none"
        onRequestClose={closeModal}
        statusBarTranslucent
      >
        <View style={styles.modalContainer}>
          {/* Tap to dismiss overlay */}
          <TapGestureHandler onGestureEvent={tapGestureHandler}>
            <Reanimated.View style={[styles.modalOverlay, overlayAnimatedStyle]} />
          </TapGestureHandler>

          {/* Modal content */}
          <Reanimated.View 
            style={[styles.modalContent, modalAnimatedStyle, { top: headerHeight }]}
          >
            {/* Draggable header */}
            <PanGestureHandler onGestureEvent={panGestureHandler}>
              <Reanimated.View style={styles.modalHeaderContainer}>
                <View style={styles.modalDragIndicator} />
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={closeModal} style={styles.modalCloseButton}>
                    <X size={24} color="#6B7280" />
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>{section.title}</Text>
                  <TouchableOpacity onPress={handleSave} style={styles.modalSaveButton}>
                    <Check size={24} color="#4F46E5" />
                  </TouchableOpacity>
                </View>
              </Reanimated.View>
            </PanGestureHandler>

            {/* Scrollable content */}
            <ScrollView 
              style={styles.modalScrollView} 
              showsVerticalScrollIndicator={false}
              bounces={false}
              contentContainerStyle={styles.modalScrollContent}
            >
              <section.component />
              {/* Bottom padding for better UX */}
              <View style={styles.modalBottomPadding} />
            </ScrollView>
          </Reanimated.View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Header */}
        <LinearGradient
          colors={['#4F46E5', '#7C3AED']}
          style={styles.header}
        >
          <TouchableOpacity onPress={handleClose} style={styles.headerButton}>
            <X size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
            <Save size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </LinearGradient>

        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Profile Photo Section */}
          <View style={styles.photoSection}>
            <View style={styles.photoContainer}>
              <UserAvatar user={user as any} size="xxl" />
              <TouchableOpacity style={styles.photoEditButton} onPress={handlePhotoUpload}>
                <Camera size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <Text style={styles.photoHint}>Tap to change photo</Text>
          </View>

          {/* Quick Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>85%</Text>
              <Text style={styles.statLabel}>Complete</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user?.photos?.length || 0}</Text>
              <Text style={styles.statLabel}>Photos</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user?.isVerified ? 'Yes' : 'No'}</Text>
              <Text style={styles.statLabel}>Verified</Text>
            </View>
          </View>

          {/* Edit Sections */}
          <View style={styles.sectionsContainer}>
            {sections.map((section, index) => (
              <TouchableOpacity
                key={section.id}
                style={styles.sectionCard}
                onPress={() => openSection(section.id)}
                activeOpacity={0.7}
              >
                <View style={styles.sectionIconContainer}>
                  <section.icon size={24} color="#4F46E5" />
                </View>
                <View style={styles.sectionInfo}>
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                  <Text style={styles.sectionSubtitle}>
                    {section.id === 'basic' && 'Name, bio, and personal info'}
                    {section.id === 'education' && (user?.university ? 'Student information' : user?.company ? 'Work information' : 'Add your background')}
                    {section.id === 'social' && 'Connect your social accounts'}
                    {section.id === 'lifestyle' && 'Living preferences and habits'}
                  </Text>
                </View>
                <ChevronRight size={20} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </View>

          {/* Footer spacing */}
          <View style={styles.footerSpacing} />
        </ScrollView>
      </Animated.View>

      {renderSectionModal()}
      
      {/* Simple Name Edit Modal (industry standard approach) */}
      <Modal
        visible={editingName}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setEditingName(false)}
      >
        <View style={styles.simpleModalContainer}>
          <View style={styles.simpleModalContent}>
            <Text style={styles.simpleModalTitle}>Edit Name</Text>
            
            <TextInput
              style={styles.simpleInput}
              value={name}
              onChangeText={setName}
              placeholder="Enter your full name"
              autoFocus={true}
            />
            
            <View style={styles.simpleButtonContainer}>
              <TouchableOpacity 
                style={[styles.simpleButton, styles.simpleCancelButton]} 
                onPress={() => setEditingName(false)}
              >
                <Text style={styles.simpleCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.simpleButton, styles.simpleSaveButton]} 
                onPress={() => setEditingName(false)}
              >
                <Text style={styles.simpleSaveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Simple Bio Edit Modal (industry standard approach) */}
      <Modal
        visible={editingBio}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setEditingBio(false)}
      >
        <View style={styles.simpleModalContainer}>
          <View style={styles.simpleModalContent}>
            <Text style={styles.simpleModalTitle}>Edit Bio</Text>
            
            <TextInput
              style={styles.simpleBioInput}
              value={bio}
              onChangeText={setBio}
              placeholder="Tell people about yourself..."
              multiline
              maxLength={300}
              autoFocus={true}
            />
            
            <Text style={styles.simpleCharCount}>
              {bio.length}/300 characters
            </Text>
            
            <View style={styles.simpleButtonContainer}>
              <TouchableOpacity 
                style={[styles.simpleButton, styles.simpleCancelButton]} 
                onPress={() => setEditingBio(false)}
              >
                <Text style={styles.simpleCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.simpleButton, styles.simpleSaveButton]} 
                onPress={() => setEditingBio(false)}
              >
                <Text style={styles.simpleSaveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Poppins-Bold',
  },
  scrollContainer: {
    flex: 1,
  },
  photoSection: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  photoContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  photoEditButton: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: '#4F46E5',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  photoHint: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Poppins-Medium',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    fontFamily: 'Poppins-Bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Poppins-Medium',
  },
  sectionsContainer: {
    paddingHorizontal: 16,
  },
  sectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  sectionInfo: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
  },
  footerSpacing: {
    height: 32,
  },
  
  // Modal styles
  modalContainer: {
    flex: 1,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: height * 0.7,
    maxHeight: height * 0.9,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 16,
  },
  modalHeaderContainer: {
    paddingTop: 12,
    paddingBottom: 8,
  },
  modalDragIndicator: {
    width: 36,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalCloseButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  modalSaveButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    fontFamily: 'Poppins-Bold',
  },
  modalScrollView: {
    flex: 1,
  },
  modalScrollContent: {
    paddingBottom: 40,
  },
  modalBottomPadding: {
    height: 100,
  },
  
  // Section content styles
  sectionContent: {
    padding: 20,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
    marginBottom: 24,
    lineHeight: 20,
  },
  input: {
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
    fontFamily: 'Poppins-Medium',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
    minHeight: 100,
  },
  charCount: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 8,
    fontFamily: 'Poppins-Regular',
  },
  
  // New BasicInfo section styles
  formSection: {
    gap: 20,
  },
  bioContainer: {
    marginBottom: 20,
  },
  bioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bioTip: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
    fontFamily: 'Poppins-Regular',
    flex: 1,
    textAlign: 'right',
    marginLeft: 16,
  },
  bioInputContainer: {
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  bioFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  bioHint: {
    fontSize: 12,
    color: '#F59E0B',
    fontFamily: 'Poppins-Regular',
    fontStyle: 'italic',
  },
  previewSection: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 12,
    fontFamily: 'Poppins-SemiBold',
  },
  previewCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  previewName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
    fontFamily: 'Poppins-SemiBold',
  },
  previewBio: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    fontFamily: 'Poppins-Regular',
  },
  
  // Education section styles
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  toggleButtonActive: {
    backgroundColor: '#4F46E5',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginLeft: 8,
    fontFamily: 'Poppins-Medium',
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  
  // Lifestyle section styles
  preferenceGroup: {
    marginBottom: 24,
  },
  preferenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  preferenceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
    fontFamily: 'Poppins-SemiBold',
  },
  preferenceValue: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '500',
    marginBottom: 12,
    fontFamily: 'Poppins-Medium',
  },
  sleepScheduleContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  sleepOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  sleepOptionActive: {
    borderColor: '#4F46E5',
    backgroundColor: '#EEF2FF',
  },
  sleepOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    fontFamily: 'Poppins-Medium',
  },
  sleepOptionTextActive: {
    color: '#4F46E5',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  sliderLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'Poppins-Regular',
  },
  slider: {
    flex: 1,
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    marginHorizontal: 12,
    position: 'relative',
  },
  sliderTrack: {
    height: 6,
    backgroundColor: '#4F46E5',
    borderRadius: 3,
  },
  sliderThumb: {
    position: 'absolute',
    top: -6,
    width: 18,
    height: 18,
    backgroundColor: '#4F46E5',
    borderRadius: 9,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  switchContainer: {
    marginTop: 8,
  },
  switchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  switchLabel: {
    fontSize: 16,
    color: '#1F2937',
    fontFamily: 'Poppins-Medium',
  },
  
  // Editable field styles (like working AboutMe section)
  editableField: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  fieldLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  fieldLabelText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginLeft: 8,
    fontFamily: 'Poppins-Medium',
  },
  fieldValue: {
    fontSize: 16,
    color: '#1F2937',
    fontFamily: 'Poppins-Regular',
  },
  
  // Simple modal styles (matching AboutMe)
  simpleModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  simpleModalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  simpleModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#111827',
    textAlign: 'center',
    fontFamily: 'Poppins-SemiBold',
  },
  simpleInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  simpleBioInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    height: 150,
    textAlignVertical: 'top',
    fontFamily: 'Poppins-Regular',
  },
  simpleCharCount: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'right',
    marginTop: 4,
    marginBottom: 16,
    fontFamily: 'Poppins-Regular',
  },
  simpleButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  simpleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  simpleCancelButton: {
    backgroundColor: '#F3F4F6',
  },
  simpleSaveButton: {
    backgroundColor: '#4F46E5',
  },
  simpleCancelButtonText: {
    color: '#4B5563',
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  simpleSaveButtonText: {
    color: 'white',
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
});

export default EditProfileScreen;
