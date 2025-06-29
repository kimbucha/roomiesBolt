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
  BackHandler,
  Image
} from 'react-native';
import { useLocalSearchParams, Stack, useRouter, useNavigation } from 'expo-router';
import { styled } from 'nativewind';
import { useMatchesStore, Match } from '../../../store/matchesStore';
import { useUserStore, User } from '../../../store/userStore';
import { useRoommateStore, RoommateProfile } from '../../../store/roommateStore';
import { useMessageStore } from '../../../store/messageStore';
import { MessageCircle, MoreHorizontal, Moon, Sun, Sparkles, Volume2, VolumeX, Users, UserX, DollarSign, MapPin, Building, Bed, Bath, Calendar, Clock, Home, CheckCircle, XCircle, Wifi, Car, Dumbbell, Coffee } from 'lucide-react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';

// Import radar chart and personality components
import { CompatibilityRadarChart } from '../../../components/roommate/CompatibilityRadarChart';

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

// Personality type definitions and helpers
type PersonalityType = 
  | 'ISTJ' | 'ISFJ' | 'INFJ' | 'INTJ'
  | 'ISTP' | 'ISFP' | 'INFP' | 'INTP'
  | 'ESTP' | 'ESFP' | 'ENFP' | 'ENTP'
  | 'ESTJ' | 'ESFJ' | 'ENFJ' | 'ENTJ';

// Personality images mapping
const personalityImages: Record<PersonalityType, any> = {
  'ISTJ': require('../../../assets/images/personality/ISTJ.png'),
  'ISFJ': require('../../../assets/images/personality/ISFJ.png'),
  'INFJ': require('../../../assets/images/personality/INFJ.png'),
  'INTJ': require('../../../assets/images/personality/INTJ.png'),
  'ISTP': require('../../../assets/images/personality/ISTP.png'),
  'ISFP': require('../../../assets/images/personality/ISFP.png'),
  'INFP': require('../../../assets/images/personality/INFP.png'),
  'INTP': require('../../../assets/images/personality/INTP.png'),
  'ESTP': require('../../../assets/images/personality/ESTP.png'),
  'ESFP': require('../../../assets/images/personality/ESFP.png'),
  'ENFP': require('../../../assets/images/personality/ENFP.png'),
  'ENTP': require('../../../assets/images/personality/ENTP.png'),
  'ESTJ': require('../../../assets/images/personality/ESTJ.png'),
  'ESFJ': require('../../../assets/images/personality/ESFJ.png'),
  'ENFJ': require('../../../assets/images/personality/ENFJ.png'),
  'ENTJ': require('../../../assets/images/personality/ENTJ.png'),
};

// Personality colors mapping (same as CompatibilityRadarChart)
const personalityColors: Record<PersonalityType, string> = {
  'ISTJ': '#A6C4A2', 'ISFJ': '#F3B94D', 'INFJ': '#B1B9E3', 'INTJ': '#8B7EC8',
  'ISTP': '#D4C5A9', 'ISFP': '#F4A5B9', 'INFP': '#A8BFA8', 'INTP': '#9BB7D4',
  'ESTP': '#E8A87C', 'ESFP': '#F5C6A0', 'ENFP': '#F59E0B', 'ENTP': '#C8A8D8',
  'ESTJ': '#B8C5A8', 'ESFJ': '#E5B8A0', 'ENFJ': '#D4A5C8', 'ENTJ': '#A8B8D8'
};

// Personality descriptions mapping
const personalityDescriptions: Record<PersonalityType, string> = {
  'ISTJ': 'The Inspector', 'ISFJ': 'The Protector', 'INFJ': 'The Advocate', 'INTJ': 'The Architect',
  'ISTP': 'The Craftsman', 'ISFP': 'The Artist', 'INFP': 'The Mediator', 'INTP': 'The Thinker',
  'ESTP': 'The Dynamo', 'ESFP': 'The Entertainer', 'ENFP': 'The Campaigner', 'ENTP': 'The Innovator',
  'ESTJ': 'The Supervisor', 'ESFJ': 'The Provider', 'ENFJ': 'The Protagonist', 'ENTJ': 'The Commander'
};

export default function MatchProfileScreen() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  
  // Handle hardware back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.goBack();
      return true;
    });

    return () => backHandler.remove();
  }, [navigation]);
  
  // Get stores
  const { matches, deleteMatch } = useMatchesStore();
  const { roommates } = useRoommateStore();
  const { fetchConversations, createConversation } = useMessageStore();
  
  // Get current user for personality comparison
  const { user: currentUser } = useUserStore();
  
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
      // Create a User object with type assertion to avoid TypeScript errors
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
          smoking: false,
          pets: profileData.personalPreferences?.petPreference !== 'no_pets',
        },
        preferences: {
          notifications: true,
          darkMode: false,
          language: 'en',
          roomType: 'private',
          budget: { min: 800, max: 1200 },
          moveInDate: 'Flexible',
          duration: '12 months',
        },
        // Add any additional properties needed for the profile
        // TypeScript will ignore these with the type assertion
      } as User);
      
      setIsLoading(false);
    } catch (error) {
      console.error('[MatchProfile] Error loading match profile:', error);
      setError('Error loading profile. Please try again.');
      setIsLoading(false);
    }
  }, [matchId, matches, roommates]);

  // Handle actions
  const handleSendMessage = useCallback(async () => {
    if (!match) return;
    
    try {
      // Get the other user's ID (not the current user)
      const otherUserId = match.user1Id === 'currentUser' ? match.user2Id : match.user1Id;
      
      // Create a conversation if it doesn't exist, passing the match ID
      const conversationId = await createConversation(['currentUser', otherUserId], match.id);
      console.log(`Created conversation with ID: ${conversationId}`);
      
      // Refresh conversations to ensure the UI updates
      await fetchConversations();
      
      // Navigate to the conversation screen using the returned conversation ID
      if (conversationId) {
        router.push({
          pathname: '/conversation/[id]',
          params: { 
            id: conversationId,
            source: 'matchProfile',
            matchId: matchId
          }
        });
      } else {
        throw new Error('Failed to create conversation');
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      Alert.alert('Error', 'Could not start conversation. Please try again.');
    }
  }, [match, router, createConversation, fetchConversations]);
  
  const handleMoreOptions = useCallback(() => {
    if (!profile) return;
    
    Alert.alert(
      'Options',
      `What would you like to do with ${profile.name}?`,
      [
        {
          text: 'Report',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Report', 'User has been reported.');
          },
        },
        {
          text: 'Unmatch',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Unmatch',
              `Are you sure you want to unmatch with ${profile.name}?`,
              [
                {
                  text: 'Cancel',
                  style: 'cancel',
                },
                {
                  text: 'Unmatch',
                  style: 'destructive',
                  onPress: () => {
                    if (match) {
                      deleteMatch(match.id);
                      router.back();
                    }
                  },
                },
              ],
            );
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
    );
  }, [profile, match, deleteMatch, router]);

  // Loading state
  if (isLoading) {
    return (
      <StyledView className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#4F46E5" />
        <StyledText className="text-base text-gray-600 mt-4">Loading profile...</StyledText>
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
        
        {/* Enhanced Personality Type Section with Radar Chart */}
        <ProfileSection title="Personality Compatibility">
          <StyledView className="px-5 py-4">
            {(() => {
              const matchedPersonalityType = (profile.personalityType || 'ENFJ') as PersonalityType;
              const currentPersonalityType = (currentUser?.personalityType || 'ISTP') as PersonalityType;
              const matchedPersonalityColor = personalityColors[matchedPersonalityType];
              const currentPersonalityColor = personalityColors[currentPersonalityType];
              
              // Use actual personality dimensions or fallback
              const matchedDimensions = profile.personalityDimensions || userProfile?.personalityDimensions || {
                ei: 25, sn: 75, tf: 80, jp: 85 // ENFP default
              };
              
              const currentDimensions = currentUser?.personalityDimensions || {
                ei: 72, sn: 35, tf: 25, jp: 30 // ISTP default
              };
              
              console.log(`[MatchProfile] Personality comparison:`, {
                matched: { type: matchedPersonalityType, color: matchedPersonalityColor },
                current: { type: currentPersonalityType, color: currentPersonalityColor }
              });
              
              return (
                <>
                  {/* Personality Type Header with Image */}
                  <StyledView className="items-center mb-6">
                    <StyledView className="relative mb-4">
                      <Image
                        source={personalityImages[matchedPersonalityType]}
                        className="w-24 h-24 rounded-full"
                        style={{ 
                          borderWidth: 3, 
                          borderColor: matchedPersonalityColor,
                          backgroundColor: matchedPersonalityColor + '20' 
                        }}
                      />
                    </StyledView>
                    <StyledText 
                      className="text-3xl font-bold mb-1"
                      style={{ color: matchedPersonalityColor }}
                    >
                      {matchedPersonalityType}
                    </StyledText>
                    <StyledText className="text-base text-gray-500">
                      {personalityDescriptions[matchedPersonalityType]}
                    </StyledText>
                  </StyledView>

                  {/* Radar Chart Comparison */}
                  <StyledView className="items-center mb-6">
                    <CompatibilityRadarChart
                      userDimensions={currentDimensions}
                      roommateDimensions={matchedDimensions}
                      primaryColor={matchedPersonalityColor}
                      secondaryColor={currentPersonalityColor}
                      userPersonalityType={currentPersonalityType}
                    />
                  </StyledView>

                  {/* Personality Comparison Labels */}
                  <StyledView className="flex-row justify-around mb-4">
                    <StyledView className="items-center flex-1">
                      <StyledView 
                        className="w-4 h-4 rounded-full mb-2"
                        style={{ backgroundColor: currentPersonalityColor }}
                      />
                      <StyledText className="text-sm font-semibold text-gray-700">You</StyledText>
                      <StyledText className="text-xs text-gray-500">{currentPersonalityType}</StyledText>
                    </StyledView>
                    <StyledView className="items-center flex-1">
                      <StyledView 
                        className="w-4 h-4 rounded-full mb-2"
                        style={{ backgroundColor: matchedPersonalityColor }}
                      />
                      <StyledText className="text-sm font-semibold text-gray-700">{profile.name}</StyledText>
                      <StyledText className="text-xs text-gray-500">{matchedPersonalityType}</StyledText>
                    </StyledView>
                  </StyledView>
                </>
              );
            })()}
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
        
        {/* Looking For */}
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
            <StyledText className="text-base text-gray-500 text-center">
              No reviews yet. Be the first to leave a review after you become roommates!
            </StyledText>
          </StyledView>
        </ProfileSection>
        
        {/* Bottom Spacing for tab bar */}
        <StyledView className="h-24" />
      </StyledScrollView>
    </StyledView>
  );
}
