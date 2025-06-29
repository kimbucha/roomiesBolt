import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator, 
  Alert, 
  FlatList,
  Image,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Pressable
} from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import ApiService from '../../../services/ApiService';
import { User } from '../../../store/userStore';
import { MessageCircle, MoreHorizontal, Image as ImageIcon, CheckCircle, Smile, Droplet, Users, Moon, Volume2, Cigarette, Dog, Star, ChevronRight, Home, Bed, Bath, DollarSign, ArrowRight, Check, BarChart } from 'lucide-react-native'; // Import icons and Check icon for Badge
import { Tag } from '../../../components/shared/Tag';
// Import review data and functions
import { Review, calculateRatings } from '../../../data/reviewsData'; 
// Import standard components
import Avatar from '../../../components/Avatar'; 
import Badge from '../../../components/Badge';
import { useUserStore } from '../../../store/userStore'; // Import user store for block/unmatch actions
import { useMatchesStore } from '../../../store/matchesStore'; // Import matches store
import { useReviewStore } from '../../../store/reviewStore';
import { useMessageStore } from '../../../store/messageStore';
import { useRoommateStore } from '../../../store/roommateStore'; // Import roommate store
import ProfileViewHeader from '../../../components/profile-view/ProfileViewHeader'; // Import custom header
import ProfileSummary from '../../../components/profile-view/ProfileSummary'; // Import ProfileSummary
import ProfileSection from '../../../components/profile-view/ProfileSection'; // Import ProfileSection
import PhotoCarousel from '../../../components/profile-view/PhotoCarousel'; // CORRECTED Import PhotoCarousel
import AboutSection from '../../../components/profile-view/AboutSection'; // Import AboutSection
import PersonalityLifestyleSection from '../../../components/profile-view/PersonalityLifestyleSection'; // Import PersonalityLifestyleSection
import ReviewsSection from '../../../components/profile-view/ReviewsSection'; // Import ReviewsSection
import ListingPreviewSection from '../../../components/profile-view/ListingPreviewSection'; // Import ListingPreviewSection
// Correct import for StatusBar
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';

const { width: screenWidth } = Dimensions.get('window');

// Helper function to format dimension scores
const formatDimension = (key: string, value: number): string => {
   switch(key) {
      case 'ei': return value < 50 ? `Extraversion (${value}%)` : `Introversion (${100-value}%)`;
      case 'sn': return value < 50 ? `Sensing (${value}%)` : `Intuition (${100-value}%)`;
      case 'tf': return value < 50 ? `Thinking (${value}%)` : `Feeling (${100-value}%)`;
      case 'jp': return value < 50 ? `Judging (${value}%)` : `Perceiving (${100-value}%)`;
      default: return '';
   }
};

export default function UserProfileScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const router = useRouter();
  const { user: loggedInUser, blockUser } = useUserStore(); // Get blockUser action
  const { matches, deleteMatch } = useMatchesStore(); // Get matches and deleteMatch action
  const { roommates } = useRoommateStore(); // Get roommates store
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [compatibilityScore, setCompatibilityScore] = useState<number | null>(null);
  const reviews = useReviewStore((state) => state.reviewsByUser[userId] ?? []);
  const fetchReviews = useReviewStore((state) => state.fetchReviews);
  const fetchConversations = useMessageStore((state) => state.fetchConversations);
  const conversations = useMessageStore((state) => state.conversations);
  const rating = calculateRatings(reviews);

  // TODO: Add block/unmatch logic to userStore or matchesStore

  // Action Handlers with Navigation
  const handleSendMessage = () => {
    if (!userId) {
        console.error("Cannot send message, userId is missing.");
        return;
    }
    console.log(`[Profile Screen] Navigating to chat-redirect for user: ${userId}`);
    // Use the chat-redirect route like in NewMatchesSection
    router.push({
        pathname: "/chat-redirect",
        params: { userId: userId }
    });
  };

  const handleMoreOptions = () => {
    if (!userProfile || !loggedInUser) return;

    // Find if there is an active match between these users
    const match = matches.find(
        m => ((m.user1Id === loggedInUser.id && m.user2Id === userProfile.id) || 
              (m.user1Id === userProfile.id && m.user2Id === loggedInUser.id)) &&
             (m.status === 'matched' || m.status === 'superMatched' || m.status === 'mixedMatched')
    );
    const matchId = match?.id;

    // --- Define Actions --- 
    const reportAction = () => {
        // TODO: Implement actual reporting API call
        Alert.alert('Report Submitted', `Thank you for reporting ${userProfile.name}. We will review this shortly.`);
    };

    const blockAction = () => {
        blockUser(userProfile.id);
        // Also unmatch if currently matched
        if (matchId) {
           deleteMatch(matchId);
        }
        Alert.alert('User Blocked', `${userProfile.name} has been blocked and unmatched.`);
        router.back(); // Navigate away after blocking
    };

    const unmatchAction = () => {
        if (!matchId) return; // Should not happen if button is shown correctly
        deleteMatch(matchId);
        Alert.alert('Unmatched', `You have unmatched ${userProfile.name}.`);
        router.back(); // Navigate away after unmatching
    };
    
    // --- Build Options Array --- 
    // Explicitly type the style for clarity
    const options: { text: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive' }[] = [
      {
        text: 'Report User',
        onPress: () => {
           Alert.alert('Confirm Report', `Are you sure you want to report ${userProfile.name}?`, [
              { text: 'Cancel' }, 
              { text: 'Report', onPress: reportAction, style: 'destructive' },
           ]);
        },
        style: 'default', // Use default style
      },
      {
        text: 'Block User',
        onPress: () => {
           Alert.alert('Confirm Block', `Are you sure you want to block ${userProfile.name}? This will also unmatch you.`, [
              { text: 'Cancel' }, 
              { text: 'Block', onPress: blockAction, style: 'destructive' },
           ]);
        },
        style: 'destructive', // Use destructive style
      },
    ];

    // Conditionally add Unmatch option
    if (matchId) {
      options.push({
        text: 'Unmatch User',
        onPress: () => {
           Alert.alert('Confirm Unmatch', `Are you sure you want to unmatch ${userProfile.name}?`, [
              { text: 'Cancel' }, 
              { text: 'Unmatch', onPress: unmatchAction, style: 'destructive' },
           ]);
        },
        style: 'destructive', // Use destructive style
      });
    }

    // Add Cancel option to main list
    options.push({
      text: 'Cancel',
      style: 'cancel', // Use cancel style
    });

    // Show Action Sheet / Alert
    Alert.alert(
      'Options', 
      `Manage your connection with ${userProfile.name}.`,
      options,
      { cancelable: true }
    );
  };

  const handleSeeAllReviews = () => {
    // Navigate to the reviews screen, passing userId to filter
    router.push(`/reviews?userId=${userId}`);
  };

  const handleWriteReview = useCallback(() => {
    if (!userId) return;
    router.push({ pathname: '/write-review', params: { revieweeId: userId } });
  }, [router, userId]);

  const handleViewListing = () => {
    // Navigate to place detail screen using the user ID as listing ID
    if (userProfile?.id) {
       router.push(`/place-detail?id=${userProfile.id}`);
    } else {
       console.warn('No user ID found for listing navigation.');
       Alert.alert('Error', 'Could not find listing details.');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) {
        setError('User ID is missing.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        console.log(`[Profile] Looking up user profile for ID: ${userId}`);
        console.log(`[Profile] Available roommates:`, roommates.map(r => ({ id: r.id, name: r.name })));
        
        // Find the roommate profile from the store instead of using ApiService
        const roommateProfile = roommates.find(r => r.id === userId);
        
        if (!roommateProfile) {
          console.error(`[Profile] Roommate profile not found for user ID: ${userId}`);
          setError(`Profile not found for user ${userId}.`);
          setUserProfile(null);
          setIsLoading(false);
          return;
        }

        console.log(`[Profile] Found roommate profile:`, { 
          id: roommateProfile.id, 
          name: roommateProfile.name, 
          university: roommateProfile.university,
          image: roommateProfile.image
        });

        // Convert RoommateProfile to User format for compatibility with components
        const fetchedUserProfile: User = {
          id: roommateProfile.id,
          name: roommateProfile.name,
          email: '', // Not available in roommate profile
          profilePicture: roommateProfile.image,
          photos: [roommateProfile.image], // Use main image as first photo
          isVerified: roommateProfile.verified || false,
          university: roommateProfile.university,
          major: roommateProfile.major || '',
          year: '',
          bio: roommateProfile.bio || '',
          personalityTraits: roommateProfile.traits || [],
          // Add mock personality data for MBTI display
          personalityType: 'ENFJ', // Mock personality type
          personalityDimensions: {
            ei: 30, // More Extraverted
            sn: 60, // More Intuitive
            tf: 40, // More Feeling
            jp: 70  // More Judging
          },
          lifestylePreferences: {
            cleanliness: roommateProfile.lifestylePreferences?.cleanliness === 'very_clean' ? 5 : 
                        roommateProfile.lifestylePreferences?.cleanliness === 'clean' ? 4 : 
                        roommateProfile.lifestylePreferences?.cleanliness === 'moderate' ? 3 : 2,
            noise: roommateProfile.lifestylePreferences?.noiseLevel === 'quiet' ? 2 : 
                   roommateProfile.lifestylePreferences?.noiseLevel === 'moderate' ? 3 : 4,
            guestFrequency: roommateProfile.lifestylePreferences?.guestPolicy === 'rarely' ? 2 : 
                           roommateProfile.lifestylePreferences?.guestPolicy === 'occasionally' ? 3 : 4,
            smoking: roommateProfile.lifestylePreferences?.substancePolicy === 'smoking_ok' || 
                    roommateProfile.lifestylePreferences?.substancePolicy === 'all_ok',
            pets: roommateProfile.personalPreferences?.petPreference === 'all_pets_ok' || 
                  roommateProfile.personalPreferences?.petPreference === 'cats_only' || 
                  roommateProfile.personalPreferences?.petPreference === 'dogs_only'
          },
          preferences: {
            notifications: true,
            darkMode: false,
            language: 'en',
            budget: roommateProfile.budget ? { min: 0, max: 3000 } : undefined,
            moveInDate: roommateProfile.moveInDate,
            duration: roommateProfile.leaseDuration,
            roomType: roommateProfile.roomType as any
          },
          // Place details for navigation
          placeDetails: roommateProfile.placeDetails as any,
        };
        
        setUserProfile(fetchedUserProfile);
        
        // --- Calculate Compatibility Score --- 
        if (loggedInUser && fetchedUserProfile) {
           // TODO: Implement actual compatibility calculation here
           // This function would compare loggedInUser and fetchedUserProfile
           // const score = calculateCompatibilityScore(loggedInUser, fetchedUserProfile);
           
           // Using placeholder random score for now
           const randomScore = Math.floor(Math.random() * (95 - 70 + 1)) + 70; 
           setCompatibilityScore(randomScore);
        } else {
           setCompatibilityScore(null); // Cannot calculate without both users
        }
        // --- End Compatibility Score ---

        // --- Fetch Reviews ---
        fetchReviews(userId);
        // --- End Fetch Reviews ---
        
        console.log(`[Profile] Successfully loaded profile for ${roommateProfile.name}`);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('An unexpected error occurred.');
        setUserProfile(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData(); // Renamed from fetchUserProfile
  }, [userId, loggedInUser, fetchReviews, fetchConversations, roommates]);

  const hasSpoken = useMemo(() => {
    if (!loggedInUser?.id) return false;
    return conversations.some(c => {
      const ids = c.participants.map(p => p.id);
      return ids.includes(userId) && ids.includes(loggedInUser.id);
    });
  }, [conversations, userId, loggedInUser?.id]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Stack.Screen options={{ title: 'Error' }} />
        <Text style={styles.errorText}>Error loading profile:</Text>
        <Text style={styles.errorText}>{error}</Text>
        {/* Optionally add a retry button */}
      </View>
    );
  }

  if (!userProfile) {
    return (
      <View style={styles.errorContainer}>
         <Stack.Screen options={{ title: 'Profile Not Found' }} />
        <Text style={styles.errorText}>User profile could not be loaded.</Text>
      </View>
    );
  }

  // MOCK DATA for Personality Dimensions - This needs to be passed down
  const mockPersonalityDimensions: { dimension: string; score: number }[] = [
    { dimension: 'Openness', score: 75 },
    { dimension: 'Conscientiousness', score: 60 },
    { dimension: 'Extraversion', score: 85 },
    { dimension: 'Agreeableness', score: 70 },
    { dimension: 'Neuroticism', score: 40 },
  ];

  return (
    <SafeAreaView style={styles.screenContainer}> 
      <ExpoStatusBar style="dark" backgroundColor="white" translucent={false} />
      <ProfileViewHeader 
        onSendMessage={handleSendMessage}
        onMoreOptions={handleMoreOptions}
      />
      <ScrollView style={styles.container}>
        {/* --- Profile Summary --- */}
        <ProfileSummary 
          userProfile={userProfile}
          compatibilityScore={compatibilityScore}
        />

        {/* === Photo Carousel Section === */}
        <PhotoCarousel photos={userProfile.photos} />

        {/* === About Me Section === */}
        <AboutSection bio={userProfile.bio} />

        {/* === Personality & Lifestyle Section === */}
        <PersonalityLifestyleSection 
            userProfile={userProfile}
            mockPersonalityDimensions={mockPersonalityDimensions} // Pass mock data
        />

        {/* --- Ratings & Reviews Section --- */}
        <ReviewsSection
          reviews={reviews}
          rating={rating}
          onSeeAllReviews={handleSeeAllReviews}
          headerRight={
            loggedInUser?.id !== userId && hasSpoken && (
              <Pressable style={styles.writeReviewButton} onPress={handleWriteReview}>
                <Text style={styles.writeReviewText}>Write a Review</Text>
                <ChevronRight size={18} color="#4F46E5" />
              </Pressable>
            )
          }
        />

        {/* --- Listing Section (Conditional) --- */}
        <ListingPreviewSection 
            userProfile={userProfile}
            onViewListing={handleViewListing}
        />

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screenContainer: { 
    flex: 1,
    backgroundColor: '#FFFFFF', // Explicitly set white background
  },
  container: { 
    flex: 1,
    // Remove background color if previously set here, let screenContainer handle it
  },
  loadingContainer: { 
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF', // Match screen background
  },
  errorContainer: { 
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF', // Match screen background
   },
  errorText: { 
    fontSize: 16,
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 10,
   },
  photoSection: {
    marginTop: 10,
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  photoSectionPlaceholder: {
    marginTop: 10,
    backgroundColor: '#FFFFFF',
    paddingVertical: 30, 
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    minHeight: 150, 
  },
  photoListContainer: {
    paddingHorizontal: 20,
  },
  photoItem: {
    width: screenWidth * 0.7,
    height: screenWidth * 0.8,
    borderRadius: 12,
    marginRight: 15,
    backgroundColor: '#E2E8F0',
  },
  placeholderText: {
      marginTop: 10,
      fontSize: 14,
      color: '#64748B',
  },
  infoBlock: {
    marginBottom: 25, 
  },
  bioText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#475569',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 15,
    color: '#334155',
    fontWeight: '500',
    textAlign: 'right',
    flexShrink: 1,
  },
  mbtiContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  mbtiText: {
    fontSize: 15,
    color: '#4338CA',
    fontWeight: '500',
  },
  mbtiValue: {
    fontSize: 15,
    color: '#4338CA',
    fontWeight: 'bold',
  },
  dimensionsContainer: {
     marginTop: 15,
     marginBottom: 20,
     backgroundColor: '#F8FAFC',
     borderRadius: 8,
     padding: 15,
     borderWidth: 1,
     borderColor: '#E2E8F0',
  },
  dimensionsHeader: {
     flexDirection: 'row',
     alignItems: 'center',
     marginBottom: 10,
  },
  dimensionsTitle: {
     fontSize: 15,
     fontWeight: '600',
     color: '#475569',
  },
  dimensionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  dimensionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  dimensionValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap', 
    marginTop: 5,
  },
  lifestyleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12, 
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
   },
  lifestyleLabelContainer: {
     flexDirection: 'row',
     alignItems: 'center',
     maxWidth: '60%', 
  },
  lifestyleLabel: {
    fontSize: 15,
    color: '#475569', 
    fontWeight: '500',
    marginLeft: 10,
    flexShrink: 1,
  },
  lifestyleValue: {
    fontSize: 15,
    color: '#334155',
    fontWeight: '600',
    textAlign: 'right',
    flexShrink: 1,
    marginLeft: 10, 
  },
  ratingSummaryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  starContainer: {
    flexDirection: 'row',
  },
  ratingAverageText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginLeft: 8,
  },
  ratingTotalText: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 5,
  },
  reviewListContainer: {
     // Container for individual reviews
  },
  reviewSnippetContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  reviewHeader: {
     flexDirection: 'row',
     alignItems: 'center',
     marginBottom: 10,
  },
  reviewerAvatar: {
     width: 40,
     height: 40,
     borderRadius: 20,
     marginRight: 10,
     backgroundColor: '#E2E8F0',
  },
  reviewerInfo: {
     flex: 1,
  },
  reviewerName: {
     fontSize: 15,
     fontWeight: '600',
     color: '#334155',
     marginBottom: 2,
  },
  reviewDate: {
     fontSize: 12,
     color: '#94A3B8',
  },
  reviewText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#475569',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  seeAllButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4F46E5',
    marginRight: 5,
  },
  noReviewsText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    paddingVertical: 20,
  },
  writeReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  writeReviewText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4F46E5',
    marginRight: 8,
  },
}); 