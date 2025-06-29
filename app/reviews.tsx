import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { styled } from 'nativewind';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Star } from 'lucide-react-native';
import Avatar from '../components/Avatar';
import { useUserStore } from '../store/userStore';
import { REVIEWS, getUserReviews, calculateRatings, Review } from '../data/reviewsData';
import ApiService from '../services/ApiService';

// Styled components
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledSafeAreaView = styled(SafeAreaView);
const StyledTouchableOpacity = styled(TouchableOpacity);

// Theme color constants
const THEME = {
  primaryColor: '#4F46E5', // Indigo/purple color matching the Roomies logo
  starFill: '#4F46E5',
  starEmpty: '#E5E7EB',
  textDark: '#1F2937',
  textMedium: '#6B7280',
  textLight: '#9CA3AF',
  borderColor: 'rgba(0,0,0,0.05)',
};

// Component to render stars
const RatingStars = ({ rating }: { rating: number }) => {
  return (
    <StyledView className="flex-row">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={16}
          color={star <= rating ? THEME.starFill : THEME.starEmpty}
          fill={star <= rating ? THEME.starFill : 'transparent'}
        />
      ))}
    </StyledView>
  );
};

// Component to render the rating distribution bar
const RatingBar = ({ 
  starCount, 
  stars, 
  count, 
  maxValue 
}: { 
  starCount: number; 
  stars: number; 
  count: number; 
  maxValue: number; 
}) => {
  // Calculate percentage width (minimum 2% for visibility)
  const percentage = maxValue > 0 ? Math.max(2, (count / maxValue) * 100) : 2;
  
  return (
    <StyledView className="flex-row items-center mb-1.5">
      <StyledText className="font-[Poppins-Medium] text-sm text-gray-700 w-16">
        {stars} {stars === 1 ? 'star' : 'stars'}
      </StyledText>
      <StyledView className="flex-1 h-2 bg-gray-200 rounded-full mx-2">
        <StyledView 
          className="h-2 bg-indigo-600 rounded-full" 
          style={{ width: `${percentage}%` }} 
        />
      </StyledView>
      <StyledText className="font-[Poppins-Medium] text-sm text-gray-700 w-6 text-right">
        {count}
      </StyledText>
    </StyledView>
  );
};

export default function ReviewsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ userId?: string }>();
  const { user: loggedInUser } = useUserStore();

  const viewUserId = params.userId; // ID of the profile being viewed (optional)
  const isOwnProfile = !viewUserId || viewUserId === loggedInUser?.id;

  const [profileName, setProfileName] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [ratings, setRatings] = useState<{ average: number; total: number; starCounts: number[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      let targetUserId = isOwnProfile ? loggedInUser?.id : viewUserId;
      let targetName = 'User'; // Default name

      if (!targetUserId) {
        // Handle case where no user ID is available (shouldn't happen ideally)
        console.error("No user ID available for reviews screen");
        setIsLoading(false);
        return;
      }

      try {
        // Fetch profile name if viewing someone else's reviews
        if (!isOwnProfile && viewUserId) {
          const profileResponse = await ApiService.getUserProfile(viewUserId);
          if (profileResponse.data) {
            targetName = profileResponse.data.name || 'User';
          }
        } else if (loggedInUser) {
          targetName = loggedInUser.name || 'User';
        }
        setProfileName(targetName);

        // Fetch reviews for the target user
        const fetchedReviews = getUserReviews(targetUserId); 
        setReviews(fetchedReviews);

        // Calculate ratings
        const calculated = calculateRatings(fetchedReviews);
        setRatings(calculated);

      } catch (error) {
        console.error("Error loading reviews data:", error);
        // Handle error state appropriately
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [viewUserId, loggedInUser?.id, isOwnProfile]);

  if (isLoading || !ratings || !profileName) {
    return (
      <StyledSafeAreaView className="flex-1 items-center justify-center bg-gray-50">
         <Stack.Screen options={{ title: 'Loading...' }} />
         <ActivityIndicator size="large" color={THEME.primaryColor} />
      </StyledSafeAreaView>
    );
  }
  
  // Get the maximum count for scaling bar widths
  const maxCount = Math.max(...ratings.starCounts);
  const screenTitle = `${profileName.split(' ')[0]}'s Reviews`;
  const summaryTitle = `${profileName}'s Rating Summary`;

  // Render each review item
  const renderReviewItem = ({ item }: { item: Review }) => (
    <StyledView className="bg-white p-4 rounded-xl mb-3 border border-gray-100">
      <StyledView className="flex-row items-center mb-2">
        <Avatar
          source={item.reviewerImage ? { uri: item.reviewerImage } : null}
          name={item.reviewerName}
          size="small"
          variant="circle"
          style={{ width: 36, height: 36 }}
        />
        <StyledView className="ml-3 flex-1">
          <StyledText className="font-[Poppins-Medium] text-sm text-gray-800">{item.reviewerName}</StyledText>
          <StyledText className="font-[Poppins-Regular] text-xs text-gray-500">{item.date}</StyledText>
        </StyledView>
      </StyledView>
      
      <RatingStars rating={item.rating} />
      
      {item.comment && (
        <StyledText className="mt-2 font-[Poppins-Regular] text-sm text-gray-700 leading-5">{item.comment}</StyledText>
      )}
      
      <StyledTouchableOpacity className="mt-2" activeOpacity={0.6}>
        <StyledText className="font-[Poppins-Regular] text-xs text-gray-500">Like</StyledText>
      </StyledTouchableOpacity>
    </StyledView>
  );

  return (
    <StyledSafeAreaView className="flex-1 bg-gray-50">
      <Stack.Screen 
        options={{
          title: screenTitle,
          headerShown: true,
          headerBackVisible: true,
          headerTintColor: THEME.primaryColor,
          headerTitleStyle: {
            fontFamily: 'Poppins-Medium',
          },
        }}
      />
      
      <StyledView className="flex-1 px-4 py-3">
        {/* Rating Summary */}
        <StyledView className="bg-white p-4 rounded-xl mb-3 border border-gray-100">
          <StyledView className="flex-row items-center mb-1">
            <Star size={18} color={THEME.primaryColor} className="mr-2" />
            <StyledText className="font-[Poppins-SemiBold] text-base text-gray-800">
              {summaryTitle}
            </StyledText>
          </StyledView>
          
          <StyledView className="flex-row items-center mt-2">
            <StyledView className="flex-row">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={18}
                  color={star <= ratings.average ? THEME.starFill : THEME.starEmpty}
                  fill={star <= ratings.average ? THEME.starFill : 'transparent'}
                />
              ))}
            </StyledView>
            <StyledText className="font-[Poppins-Bold] text-base text-gray-800 ml-2">
              {ratings.average.toFixed(1)} ({ratings.total} reviews)
            </StyledText>
          </StyledView>
          
          {/* Rating Distribution */}
          <StyledView className="mt-4">
            {[5, 4, 3, 2, 1].map((stars) => (
              <RatingBar
                key={stars}
                starCount={5}
                stars={stars}
                count={ratings.starCounts[stars - 1]}
                maxValue={maxCount}
              />
            ))}
          </StyledView>
          
          <StyledText className="text-xs text-gray-500 mt-2">
            (Visible to the public after 5 ratings. <StyledText className="text-indigo-600 font-medium">Learn more</StyledText>)
          </StyledText>
        </StyledView>
        
        {/* Reviews List */}
        {reviews.length > 0 ? (
          <FlatList
            data={reviews}
            renderItem={renderReviewItem}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        ) : (
          <StyledView className="bg-white p-5 rounded-xl items-center justify-center my-4">
            <StyledText className="font-[Poppins-Medium] text-base text-gray-500 text-center mb-2">
              No reviews yet for {profileName}
            </StyledText>
            <StyledText className="font-[Poppins-Regular] text-sm text-gray-400 text-center">
              Reviews will appear here once users start rating this profile.
            </StyledText>
          </StyledView>
        )}
      </StyledView>
    </StyledSafeAreaView>
  );
} 