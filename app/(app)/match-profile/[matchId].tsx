import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  ActivityIndicator, 
  Alert, 
  Dimensions,
  StatusBar,
  Pressable,
  BackHandler
} from 'react-native';
import { useLocalSearchParams, Stack, useRouter, useNavigation, usePathname } from 'expo-router';
import { styled } from 'nativewind';
import { useMatchesStore, Match } from '../../../store/matchesStore';
import { useUserStore, User } from '../../../store/userStore';
import { useRoommateStore, RoommateProfile } from '../../../store/roommateStore';
import { useMessageStore } from '../../../store/messageStore';
import { MessageCircle, MoreHorizontal, Moon, Sun, Sparkles, Volume2, VolumeX, Users, UserX, DollarSign, MapPin, Building, Bed, Bath, Calendar, Clock, Home, CheckCircle, XCircle, Wifi, Car, Dumbbell, Coffee } from 'lucide-react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';

// Import profile components
import ProfileViewHeader from '../../../components/profile-view/ProfileViewHeader';
import ProfileSummary from '../../../components/profile-view/ProfileSummary';
import ProfileSection from '../../../components/profile-view/ProfileSection';
import PhotoCarousel from '../../../components/profile-view/PhotoCarousel';
import AboutSection from '../../../components/profile-view/AboutSection';
import PersonalityLifestyleSection from '../../../components/profile-view/PersonalityLifestyleSection';
import ReviewsSection from '../../../components/profile-view/ReviewsSection';
import ListingPreviewSection from '../../../components/profile-view/ListingPreviewSection';

// Styled components
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledScrollView = styled(ScrollView);
const StyledPressable = styled(Pressable);

const { width: screenWidth } = Dimensions.get('window');

export default function MatchProfileScreen() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const pathname = usePathname();
  
  // Handle hardware back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      router.back();
      return true;
    });
    
    return () => backHandler.remove();
  }, [router]);
  
  // Set up a listener for when the user taps the matches tab again
  useEffect(() => {
    // This is a simpler approach that doesn't rely on navigation events
    // We'll just use the back handler to go back when the user presses back
    // The tab navigation in (tabs)/_layout.tsx will handle the tab press
    return () => {
      console.log('Match profile screen unmounted');
    };
  }, []);
  
  // Get stores
  const { matches, deleteMatch } = useMatchesStore();
  const { roommates } = useRoommateStore();
  const { fetchConversations } = useMessageStore();
  
  // State
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [match, setMatch] = useState<Match | null>(null);
  const [profile, setProfile] = useState<RoommateProfile | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);

  // Load match and profile data
  useEffect(() => {
    console.log(`[MatchProfile] Loading match profile for matchId: ${matchId}`);
    console.log(`[MatchProfile] Available matches:`, matches.map(m => ({ id: m.id, user1Id: m.user1Id, user2Id: m.user2Id })));
    
    if (!matchId) {
      console.error('[MatchProfile] Match ID is missing.');
      setError('Match ID is missing.');
      setIsLoading(false);
      return;
    }

    try {
      // Find the match
      const matchData = matches.find(m => m.id === matchId);
      if (!matchData) {
        console.error(`[MatchProfile] Match not found for ID: ${matchId}`);
        setError('Match not found.');
        setIsLoading(false);
        return;
      }
      console.log(`[MatchProfile] Found match:`, matchData);
      setMatch(matchData);

      // Get the other user's ID (not the current user)
      const otherUserId = matchData.user1Id === 'currentUser' ? matchData.user2Id : matchData.user1Id;
      console.log(`[MatchProfile] Other user ID: ${otherUserId}`);
      console.log(`[MatchProfile] Available roommates:`, roommates.map(r => ({ id: r.id, name: r.name })));
      
      // Find the profile
      const profileData = roommates.find(r => r.id === otherUserId);
      if (!profileData) {
        console.error(`[MatchProfile] Profile not found for user ID: ${otherUserId}`);
        setError('Profile not found.');
        setIsLoading(false);
        return;
      }
      console.log(`[MatchProfile] Found profile:`, { 
        id: profileData.id, 
        name: profileData.name, 
        image: profileData.image,
        university: profileData.university,
        bio: profileData.bio
      });
      setProfile(profileData);
      
      // Create a User object from the RoommateProfile for compatibility with components
      setUserProfile({
        id: profileData.id,
        name: profileData.name,
        email: '',
        profilePicture: profileData.image,
        photos: [profileData.image], // Add user photo as first photo
        isVerified: profileData.verified || false,
        university: profileData.university,
        major: profileData.major || '',
        year: '',
        bio: profileData.bio || '',
        personalityTraits: profileData.traits || [],
        // Add mock personality data for MBTI display
        personalityType: 'ENFJ', // Mock personality type
        personalityDimensions: {
          ei: 30, // More Extraverted
          sn: 60, // More Intuitive
          tf: 40, // More Feeling
          jp: 70  // More Judging
        },
        lifestylePreferences: {
          cleanliness: profileData.lifestylePreferences?.cleanliness === 'very_clean' ? 5 : 
                      profileData.lifestylePreferences?.cleanliness === 'clean' ? 4 : 
                      profileData.lifestylePreferences?.cleanliness === 'moderate' ? 3 : 2,
          noise: profileData.lifestylePreferences?.noiseLevel === 'quiet' ? 2 : 
                 profileData.lifestylePreferences?.noiseLevel === 'moderate' ? 3 : 4,
          guestFrequency: profileData.lifestylePreferences?.guestPolicy === 'rarely' ? 2 : 
                         profileData.lifestylePreferences?.guestPolicy === 'occasionally' ? 3 : 4,
          smoking: profileData.lifestylePreferences?.substancePolicy === 'smoking_ok' || 
                  profileData.lifestylePreferences?.substancePolicy === 'all_ok',
          pets: profileData.personalPreferences?.petPreference === 'all_pets_ok' || 
                profileData.personalPreferences?.petPreference === 'cats_only' || 
                profileData.personalPreferences?.petPreference === 'dogs_only'
        },
        preferences: {
          notifications: true,
          darkMode: false,
          language: 'en',
          budget: profileData.budget ? { min: 0, max: 3000 } : undefined,
          moveInDate: profileData.moveInDate,
          duration: profileData.leaseDuration,
          roomType: profileData.roomType as any
        }
      });
      
      console.log('[MatchProfile] Successfully loaded match profile data');
      setIsLoading(false);
    } catch (err) {
      console.error('[MatchProfile] Error loading match profile:', err);
      setError('Failed to load profile data.');
      setIsLoading(false);
    }
  }, [matchId, matches, roommates]);

  // Action Handlers
  const handleSendMessage = useCallback(() => {
    if (!matchId || !profile) {
      console.error("Cannot send message, matchId or profile is missing.");
      return;
    }
    
    console.log(`[Match Profile Screen] Navigating to chat for match: ${matchId}`);
    router.push({
      pathname: "/chat-redirect",
      params: { matchId: matchId }
    });
  }, [matchId, profile, router]);

  const handleMoreOptions = useCallback(() => {
    if (!profile || !match) return;

    // Define Actions
    const reportAction = () => {
      Alert.alert('Report Submitted', `Thank you for reporting ${profile.name}. We will review this shortly.`);
    };

    const unmatchAction = () => {
      deleteMatch(matchId as string);
      Alert.alert('Unmatched', `You have unmatched ${profile.name}.`);
      router.back(); // Navigate back to matches screen
    };
    
    // Build Options Array
    const options: { text: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive' }[] = [
      {
        text: 'Report User',
        onPress: () => {
          Alert.alert('Confirm Report', `Are you sure you want to report ${profile.name}?`, [
            { text: 'Cancel' }, 
            { text: 'Report', onPress: reportAction, style: 'destructive' },
          ]);
        },
        style: 'default',
      },
      {
        text: 'Unmatch User',
        onPress: () => {
          Alert.alert('Confirm Unmatch', `Are you sure you want to unmatch ${profile.name}?`, [
            { text: 'Cancel' }, 
            { text: 'Unmatch', onPress: unmatchAction, style: 'destructive' },
          ]);
        },
        style: 'destructive',
      },
      {
        text: 'Cancel',
        style: 'cancel',
      }
    ];

    // Show Action Sheet / Alert
    Alert.alert(
      'Options', 
      `Manage your connection with ${profile.name}.`,
      options,
      { cancelable: true }
    );
  }, [profile, match, matchId, deleteMatch, router]);

  // Loading state
  if (isLoading) {
    console.log('[MatchProfile] Rendering loading state');
    return (
      <StyledView className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#4F46E5" />
        <StyledText className="mt-4 text-base text-indigo-600">Loading profile...</StyledText>
      </StyledView>
    );
  }

  // Error state
  if (error || !profile) {
    console.log(`[MatchProfile] Rendering error state: ${error || 'Profile not found'}`);
    return (
      <StyledView className="flex-1 justify-center items-center bg-white p-5">
        <StyledText className="text-base text-red-600 mb-5 text-center">{error || 'Profile not found'}</StyledText>
        <StyledPressable 
          className="bg-indigo-600 py-3 px-6 rounded-lg"
          onPress={() => router.back()}
        >
          <StyledText className="text-white text-base font-semibold">Go Back</StyledText>
        </StyledPressable>
      </StyledView>
    );
  }

  // Determine if the match has a super like
  const hasSuperLike = match?.user1Action === 'superLike' || match?.user2Action === 'superLike';
  
  console.log(`[MatchProfile] Rendering profile for ${profile.name} (ID: ${profile.id})`);
  console.log(`[MatchProfile] Profile image: ${profile.image}`);
  console.log(`[MatchProfile] Has super like: ${hasSuperLike}`);
  console.log(`[MatchProfile] University: ${profile.university}`);
  console.log(`[MatchProfile] Bio: ${profile.bio?.substring(0, 50)}...`);

  return (
    <StyledView className="flex-1 bg-white">
      <ExpoStatusBar style="dark" />
      <Stack.Screen 
        options={{
          headerShown: false,
        }}
      />
      
      <ProfileViewHeader 
        onSendMessage={handleSendMessage}
        onMoreOptions={handleMoreOptions}
      />
      
      <StyledScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Profile Summary */}
        <ProfileSummary 
          userProfile={userProfile}
          compatibilityScore={profile.compatibilityScore || null}
        />
        
        {/* User Photos */}
        <PhotoCarousel photos={[profile.image]} />
        
        {/* About */}
        <AboutSection 
          bio={profile.bio || ''}
        />
        
        {/* Traits */}
        {profile.traits && profile.traits.length > 0 && (
          <ProfileSection title="Traits">
            <StyledView className="flex-row flex-wrap px-5 py-2.5">
              {profile.traits.map((trait, index) => (
                <StyledView key={index} className="bg-indigo-50 px-3 py-1.5 rounded-2xl mr-2 mb-2">
                  <StyledText className="text-indigo-600 text-sm font-medium">{trait}</StyledText>
                </StyledView>
              ))}
            </StyledView>
          </ProfileSection>
        )}
        
        {/* Personality Type (MBTI) */}
        <ProfileSection title="Personality Type">
          <StyledView className="px-5 py-1.5">
            <StyledView className="items-center mb-5">
              <StyledText className="text-3xl font-bold text-indigo-600 mb-1">{userProfile?.personalityType || 'ENFJ'}</StyledText>
              <StyledText className="text-base text-gray-500">The Protagonist</StyledText>
            </StyledView>
            
            {userProfile?.personalityDimensions && (
              <StyledView className="mt-2.5">
                <StyledView className="mb-4">
                  <StyledText className="text-sm text-gray-600 mb-1.5">Extraversion - Introversion</StyledText>
                  <StyledView className="h-2 bg-gray-200 rounded overflow-hidden">
                    <StyledView style={{ width: `${userProfile.personalityDimensions.ei}%` }} className="h-full bg-indigo-600 rounded" />
                  </StyledView>
                  <StyledView className="flex-row justify-between mt-1">
                    <StyledText className="text-xs text-gray-500 font-semibold">E</StyledText>
                    <StyledText className="text-xs text-gray-500 font-semibold">I</StyledText>
                  </StyledView>
                </StyledView>
                
                <StyledView className="mb-4">
                  <StyledText className="text-sm text-gray-600 mb-1.5">Sensing - Intuition</StyledText>
                  <StyledView className="h-2 bg-gray-200 rounded overflow-hidden">
                    <StyledView style={{ width: `${userProfile.personalityDimensions.sn}%` }} className="h-full bg-indigo-600 rounded" />
                  </StyledView>
                  <StyledView className="flex-row justify-between mt-1">
                    <StyledText className="text-xs text-gray-500 font-semibold">S</StyledText>
                    <StyledText className="text-xs text-gray-500 font-semibold">N</StyledText>
                  </StyledView>
                </StyledView>
                
                <StyledView className="mb-4">
                  <StyledText className="text-sm text-gray-600 mb-1.5">Thinking - Feeling</StyledText>
                  <StyledView className="h-2 bg-gray-200 rounded overflow-hidden">
                    <StyledView style={{ width: `${userProfile.personalityDimensions.tf}%` }} className="h-full bg-indigo-600 rounded" />
                  </StyledView>
                  <StyledView className="flex-row justify-between mt-1">
                    <StyledText className="text-xs text-gray-500 font-semibold">T</StyledText>
                    <StyledText className="text-xs text-gray-500 font-semibold">F</StyledText>
                  </StyledView>
                </StyledView>
                
                <StyledView className="mb-4">
                  <StyledText className="text-sm text-gray-600 mb-1.5">Judging - Perceiving</StyledText>
                  <StyledView className="h-2 bg-gray-200 rounded overflow-hidden">
                    <StyledView style={{ width: `${userProfile.personalityDimensions.jp}%` }} className="h-full bg-indigo-600 rounded" />
                  </StyledView>
                  <StyledView className="flex-row justify-between mt-1">
                    <StyledText className="text-xs text-gray-500 font-semibold">J</StyledText>
                    <StyledText className="text-xs text-gray-500 font-semibold">P</StyledText>
                  </StyledView>
                </StyledView>
              </StyledView>
            )}
          </StyledView>
        </ProfileSection>
        
        {/* Lifestyle Preferences */}
        {profile.lifestylePreferences && (
          <ProfileSection title="Lifestyle Preferences">
            <StyledView className="px-5 py-1.5">
              {profile.lifestylePreferences.sleepSchedule && (
                <StyledView className="flex-row bg-gray-50 rounded-lg p-3 mb-2 shadow-sm">
                  <StyledView className="mr-3 justify-center">
                    {profile.lifestylePreferences.sleepSchedule === 'early_bird' ? (
                      <Sun size={20} color="#4F46E5" />
                    ) : profile.lifestylePreferences.sleepSchedule === 'night_owl' ? (
                      <Moon size={20} color="#4F46E5" />
                    ) : (
                      <Clock size={20} color="#4F46E5" />
                    )}
                  </StyledView>
                  <StyledView className="flex-1">
                    <StyledText className="text-sm font-semibold text-gray-800 mb-0.5">Sleep Schedule</StyledText>
                    <StyledText className="text-sm text-gray-600 capitalize">
                      {profile.lifestylePreferences.sleepSchedule.replace('_', ' ')}
                    </StyledText>
                  </StyledView>
                </StyledView>
              )}
              
              {profile.lifestylePreferences.cleanliness && (
                <StyledView className="flex-row bg-gray-50 rounded-lg p-3 mb-2 shadow-sm">
                  <StyledView className="mr-3 justify-center">
                    <Sparkles size={20} color="#4F46E5" />
                  </StyledView>
                  <StyledView className="flex-1">
                    <StyledText className="text-sm font-semibold text-gray-800 mb-0.5">Cleanliness</StyledText>
                    <StyledText className="text-sm text-gray-600 capitalize">
                      {profile.lifestylePreferences.cleanliness.replace('_', ' ')}
                    </StyledText>
                  </StyledView>
                </StyledView>
              )}
              
              {profile.lifestylePreferences.noiseLevel && (
                <StyledView className="flex-row bg-gray-50 rounded-lg p-3 mb-2 shadow-sm">
                  <StyledView className="mr-3 justify-center">
                    {profile.lifestylePreferences.noiseLevel === 'quiet' ? (
                      <VolumeX size={20} color="#4F46E5" />
                    ) : (
                      <Volume2 size={20} color="#4F46E5" />
                    )}
                  </StyledView>
                  <StyledView className="flex-1">
                    <StyledText className="text-sm font-semibold text-gray-800 mb-0.5">Noise Level</StyledText>
                    <StyledText className="text-sm text-gray-600 capitalize">
                      {profile.lifestylePreferences.noiseLevel}
                    </StyledText>
                  </StyledView>
                </StyledView>
              )}
              
              {profile.lifestylePreferences.guestPolicy && (
                <StyledView className="flex-row bg-gray-50 rounded-lg p-3 mb-2 shadow-sm">
                  <StyledView className="mr-3 justify-center">
                    {profile.lifestylePreferences.guestPolicy === 'rarely' ? (
                      <UserX size={20} color="#4F46E5" />
                    ) : (
                      <Users size={20} color="#4F46E5" />
                    )}
                  </StyledView>
                  <StyledView className="flex-1">
                    <StyledText className="text-sm font-semibold text-gray-800 mb-0.5">Guest Policy</StyledText>
                    <StyledText className="text-sm text-gray-600 capitalize">
                      {profile.lifestylePreferences.guestPolicy}
                    </StyledText>
                  </StyledView>
                </StyledView>
              )}
              
              {profile.personalPreferences && profile.personalPreferences.petPreference && (
                <StyledView className="flex-row bg-gray-50 rounded-lg p-3 mb-2 shadow-sm">
                  <StyledView className="mr-3 justify-center">
                    {profile.personalPreferences.petPreference === 'no_pets' ? (
                      <XCircle size={20} color="#4F46E5" />
                    ) : (
                      <CheckCircle size={20} color="#4F46E5" />
                    )}
                  </StyledView>
                  <StyledView className="flex-1">
                    <StyledText className="text-sm font-semibold text-gray-800 mb-0.5">Pets</StyledText>
                    <StyledText className="text-sm text-gray-600 capitalize">
                      {profile.personalPreferences.petPreference.replace('_', ' ')}
                    </StyledText>
                  </StyledView>
                </StyledView>
              )}
            </StyledView>
          </ProfileSection>
        )}
        
        {/* Listing Preview (if they have a place) */}
        {profile.hasPlace && (
          <ProfileSection title="Place Details">
            <StyledView className="px-5 py-1.5">
              <StyledView className="flex-row flex-wrap justify-between mb-4">
                <StyledView className="flex-row bg-gray-50 rounded-lg p-3 mb-2 w-[48%] shadow-sm">
                  <StyledView className="mr-3 justify-center">
                    <Home size={20} color="#4F46E5" />
                  </StyledView>
                  <StyledView className="flex-1">
                    <StyledText className="text-sm font-semibold text-gray-800 mb-0.5">Room Type</StyledText>
                    <StyledText className="text-sm text-gray-600">{profile.roomType || 'Not specified'}</StyledText>
                  </StyledView>
                </StyledView>
                
                <StyledView className="flex-row bg-gray-50 rounded-lg p-3 mb-2 w-[48%] shadow-sm">
                  <StyledView className="mr-3 justify-center">
                    <DollarSign size={20} color="#4F46E5" />
                  </StyledView>
                  <StyledView className="flex-1">
                    <StyledText className="text-sm font-semibold text-gray-800 mb-0.5">Budget</StyledText>
                    <StyledText className="text-sm text-gray-600">{profile.budget || 'Not specified'}</StyledText>
                  </StyledView>
                </StyledView>
                
                <StyledView className="flex-row bg-gray-50 rounded-lg p-3 mb-2 w-[48%] shadow-sm">
                  <StyledView className="mr-3 justify-center">
                    <MapPin size={20} color="#4F46E5" />
                  </StyledView>
                  <StyledView className="flex-1">
                    <StyledText className="text-sm font-semibold text-gray-800 mb-0.5">Location</StyledText>
                    <StyledText className="text-sm text-gray-600">{profile.location || 'Not specified'}</StyledText>
                  </StyledView>
                </StyledView>
                
                {profile.neighborhood && (
                  <StyledView className="flex-row bg-gray-50 rounded-lg p-3 mb-2 w-[48%] shadow-sm">
                    <StyledView className="mr-3 justify-center">
                      <Building size={20} color="#4F46E5" />
                    </StyledView>
                    <StyledView className="flex-1">
                      <StyledText className="text-sm font-semibold text-gray-800 mb-0.5">Neighborhood</StyledText>
                      <StyledText className="text-sm text-gray-600">{profile.neighborhood}</StyledText>
                    </StyledView>
                  </StyledView>
                )}
                
                {profile.bedrooms && (
                  <StyledView className="flex-row bg-gray-50 rounded-lg p-3 mb-2 w-[48%] shadow-sm">
                    <StyledView className="mr-3 justify-center">
                      <Bed size={20} color="#4F46E5" />
                    </StyledView>
                    <StyledView className="flex-1">
                      <StyledText className="text-sm font-semibold text-gray-800 mb-0.5">Bedrooms</StyledText>
                      <StyledText className="text-sm text-gray-600">{profile.bedrooms}</StyledText>
                    </StyledView>
                  </StyledView>
                )}
                
                {profile.bathrooms && (
                  <StyledView className="flex-row bg-gray-50 rounded-lg p-3 mb-2 w-[48%] shadow-sm">
                    <StyledView className="mr-3 justify-center">
                      <Bath size={20} color="#4F46E5" />
                    </StyledView>
                    <StyledView className="flex-1">
                      <StyledText className="text-sm font-semibold text-gray-800 mb-0.5">Bathrooms</StyledText>
                      <StyledText className="text-sm text-gray-600">{profile.bathrooms}</StyledText>
                    </StyledView>
                  </StyledView>
                )}
                
                {profile.moveInDate && (
                  <StyledView className="flex-row bg-gray-50 rounded-lg p-3 mb-2 w-[48%] shadow-sm">
                    <StyledView className="mr-3 justify-center">
                      <Calendar size={20} color="#4F46E5" />
                    </StyledView>
                    <StyledView className="flex-1">
                      <StyledText className="text-sm font-semibold text-gray-800 mb-0.5">Move-in Date</StyledText>
                      <StyledText className="text-sm text-gray-600">{profile.moveInDate}</StyledText>
                    </StyledView>
                  </StyledView>
                )}
              </StyledView>
              
              {profile.amenities && profile.amenities.length > 0 && (
                <StyledView className="mt-2 mb-4">
                  <StyledText className="text-base font-semibold text-gray-800 mb-3">Amenities</StyledText>
                  <StyledView className="flex-row flex-wrap">
                    {profile.amenities.map((amenity, index) => {
                      let icon = <Sparkles size={16} color="#4F46E5" />;
                      
                      // Assign appropriate icons based on amenity type
                      if (amenity.toLowerCase().includes('wifi') || amenity.toLowerCase().includes('internet')) {
                        icon = <Wifi size={16} color="#4F46E5" />;
                      } else if (amenity.toLowerCase().includes('parking')) {
                        icon = <Car size={16} color="#4F46E5" />;
                      } else if (amenity.toLowerCase().includes('gym')) {
                        icon = <Dumbbell size={16} color="#4F46E5" />;
                      } else if (amenity.toLowerCase().includes('coffee') || amenity.toLowerCase().includes('cafe')) {
                        icon = <Coffee size={16} color="#4F46E5" />;
                      }
                      
                      return (
                        <StyledView key={index} className="flex-row items-center bg-indigo-50 px-3 py-2 rounded-xl mr-2 mb-2">
                          {icon}
                          <StyledText className="text-indigo-600 text-xs ml-1.5">{amenity}</StyledText>
                        </StyledView>
                      );
                    })}
                  </StyledView>
                </StyledView>
              )}
              
              <StyledPressable 
                className="bg-indigo-600 py-3 px-5 rounded-lg self-center mt-4 flex-row items-center justify-center"
                onPress={() => {
                  // Navigate to place detail if implemented
                  Alert.alert('View Listing', 'Listing details would open here');
                }}
              >
                <StyledText className="text-white text-base font-semibold ml-2">View Full Listing</StyledText>
              </StyledPressable>
            </StyledView>
          </ProfileSection>
        )}
        
        {/* Roommate Preferences */}
        <ProfileSection title="Looking For">
          <StyledView className="px-5 py-1.5">
            <StyledView className="flex-row flex-wrap justify-between mb-4">
              {/* Room Type Preference */}
              <StyledView className="flex-row bg-gray-50 rounded-lg p-3 mb-2 w-[48%] shadow-sm">
                <StyledView className="mr-3 justify-center">
                  <Home size={20} color="#4F46E5" />
                </StyledView>
                <StyledView className="flex-1">
                  <StyledText className="text-sm font-semibold text-gray-800 mb-0.5">Room Type</StyledText>
                  <StyledText className="text-sm text-gray-600">Private room</StyledText>
                </StyledView>
              </StyledView>
              
              {/* Budget Preference */}
              <StyledView className="flex-row bg-gray-50 rounded-lg p-3 mb-2 w-[48%] shadow-sm">
                <StyledView className="mr-3 justify-center">
                  <DollarSign size={20} color="#4F46E5" />
                </StyledView>
                <StyledView className="flex-1">
                  <StyledText className="text-sm font-semibold text-gray-800 mb-0.5">Budget</StyledText>
                  <StyledText className="text-sm text-gray-600">$800 - $1,200</StyledText>
                </StyledView>
              </StyledView>
              
              {/* Location Preference */}
              <StyledView className="flex-row bg-gray-50 rounded-lg p-3 mb-2 w-[48%] shadow-sm">
                <StyledView className="mr-3 justify-center">
                  <MapPin size={20} color="#4F46E5" />
                </StyledView>
                <StyledView className="flex-1">
                  <StyledText className="text-sm font-semibold text-gray-800 mb-0.5">Location</StyledText>
                  <StyledText className="text-sm text-gray-600">
                    {profile.location || 'Any'}
                  </StyledText>
                </StyledView>
              </StyledView>
              
              {/* Distance Preference */}
              <StyledView className="flex-row bg-gray-50 rounded-lg p-3 mb-2 w-[48%] shadow-sm">
                <StyledView className="mr-3 justify-center">
                  <MapPin size={20} color="#4F46E5" />
                </StyledView>
                <StyledView className="flex-1">
                  <StyledText className="text-sm font-semibold text-gray-800 mb-0.5">Distance</StyledText>
                  <StyledText className="text-sm text-gray-600">Within 5 miles</StyledText>
                </StyledView>
              </StyledView>
              
              {/* Move-in Date Preference */}
              <StyledView className="flex-row bg-gray-50 rounded-lg p-3 mb-2 w-[48%] shadow-sm">
                <StyledView className="mr-3 justify-center">
                  <Calendar size={20} color="#4F46E5" />
                </StyledView>
                <StyledView className="flex-1">
                  <StyledText className="text-sm font-semibold text-gray-800 mb-0.5">Move-in Date</StyledText>
                  <StyledText className="text-sm text-gray-600">Flexible</StyledText>
                </StyledView>
              </StyledView>
              
              {/* Lease Duration Preference */}
              <StyledView className="flex-row bg-gray-50 rounded-lg p-3 mb-2 w-[48%] shadow-sm">
                <StyledView className="mr-3 justify-center">
                  <Clock size={20} color="#4F46E5" />
                </StyledView>
                <StyledView className="flex-1">
                  <StyledText className="text-sm font-semibold text-gray-800 mb-0.5">Lease Duration</StyledText>
                  <StyledText className="text-sm text-gray-600">12 months</StyledText>
                </StyledView>
              </StyledView>
            </StyledView>
          </StyledView>
        </ProfileSection>
        
        {/* Reviews Section */}
        <ProfileSection title="Reviews">
          <StyledView className="px-5 py-4 items-center">
            <StyledText className="text-gray-500 mb-4">No reviews yet</StyledText>
            <StyledPressable 
              className="bg-indigo-600 py-2 px-4 rounded-lg"
              onPress={() => {
                // Navigate to write review screen if implemented
                Alert.alert('Write Review', 'Write review screen would open here');
              }}
            >
              <StyledText className="text-white font-medium">Write a Review</StyledText>
            </StyledPressable>
          </StyledView>
        </ProfileSection>
        
              {/* Bottom Spacing */}
      <StyledView className="h-24" />
    </StyledScrollView>
  </StyledView>
);
}

// All styles have been converted to Tailwind classes
