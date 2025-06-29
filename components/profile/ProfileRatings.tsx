import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { styled } from 'nativewind';
import { Star } from 'lucide-react-native';
import Avatar from '../Avatar';
import { useUserStore } from '../../store/userStore';

// Styled components
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledScrollView = styled(ScrollView);
const StyledTouchableOpacity = styled(TouchableOpacity);

// Types
interface Review {
  id: string;
  reviewerName: string;
  reviewerImage?: string | null;
  date: string;
  rating: number;
  comment?: string;
}

interface ProfileRatingsProps {
  averageRating: number;
  totalReviews: number;
  reviews: Review[];
  onSeeAllReviews?: () => void;
}

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

const ProfileRatings = ({ 
  averageRating = 0, 
  totalReviews = 0, 
  reviews = [], 
  onSeeAllReviews 
}: ProfileRatingsProps) => {
  // Get current user data from store
  const { user } = useUserStore();
  const currentUserName = user?.name || 'User';
  
  // Function to render stars
  const renderStars = (rating: number, size: number = 16) => {
    return (
      <StyledView className="flex-row">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            color={star <= rating ? THEME.starFill : THEME.starEmpty}
            fill={star <= rating ? THEME.starFill : 'transparent'}
          />
        ))}
      </StyledView>
    );
  };

  // Function to truncate comment with See More link
  const renderComment = (comment?: string) => {
    if (!comment) return null;
    
    // Conservative character limit to ensure two lines max
    const CHAR_LIMIT = 50;
    
    if (comment.length <= CHAR_LIMIT) {
      return (
        <StyledText className="mt-2 font-[Poppins-Regular] text-xs text-gray-700" numberOfLines={2}>
          {comment}
        </StyledText>
      );
    }
    
    // Find the last space before the limit to avoid cutting words
    let truncateIndex = CHAR_LIMIT;
    while (truncateIndex > 0 && comment[truncateIndex] !== ' ') {
      truncateIndex--;
    }
    
    // If no space found, use the exact limit
    if (truncateIndex === 0) truncateIndex = Math.min(CHAR_LIMIT, comment.length);
    
    return (
      <StyledView className="mt-2 flex-row flex-wrap">
        <StyledText className="font-[Poppins-Regular] text-xs text-gray-700" numberOfLines={1}>
          {comment.substring(0, truncateIndex)}...
        </StyledText>
        <StyledText 
          className="font-[Poppins-Medium] text-xs text-indigo-600"
          onPress={onSeeAllReviews}
        >
          {" See more"}
        </StyledText>
      </StyledView>
    );
  };

  return (
    <StyledView className="mt-4 mx-4">
      <StyledView className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
        <StyledView className="flex-row items-center mb-2">
          <Star size={18} color={THEME.primaryColor} className="mr-2" />
          <StyledText className="font-[Poppins-SemiBold] text-base text-gray-800">
            Rating and strengths
          </StyledText>
        </StyledView>

        {/* Rating Summary */}
        <StyledView className="flex-row items-center mb-1">
          {renderStars(averageRating, 18)}
          <StyledText className="ml-2 font-[Poppins-Bold] text-base text-gray-800">
            {averageRating.toFixed(1)} ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
          </StyledText>
        </StyledView>

        {/* Visibility note */}
        <StyledView className="mb-3">
          <StyledText className="text-xs text-gray-500">
            (Visible to the public after 2 ratings. <StyledText className="text-indigo-600 font-medium">Learn more</StyledText>)
          </StyledText>
        </StyledView>

        {/* Divider */}
        <StyledView className="h-[1px] bg-gray-100 my-3" />

        {/* Reviews Section */}
        <StyledView>
          <StyledText className="font-[Poppins-SemiBold] text-base text-gray-800 mb-2">
            Reviews of {currentUserName.split(' ')[0]}
          </StyledText>

          {/* Reviews List - Simple Horizontal Scrollable */}
          {reviews.length > 0 ? (
            <StyledScrollView 
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 16 }}
              className="mb-3"
            >
              {reviews.map((review) => (
                <StyledView 
                  key={review.id} 
                  className="mr-3 bg-white rounded-xl p-3 border border-gray-100"
                  style={{ width: 240 }}
                >
                  <StyledView className="flex-row items-center mb-2">
                    <Avatar
                      source={review.reviewerImage ? { uri: review.reviewerImage } : null}
                      name={review.reviewerName}
                      size="small"
                      variant="circle"
                      style={{ width: 32, height: 32 }}
                    />
                    <StyledView className="ml-2 flex-1">
                      <StyledText className="font-[Poppins-Medium] text-sm text-gray-800">{review.reviewerName}</StyledText>
                      <StyledText className="font-[Poppins-Regular] text-xs text-gray-500">{review.date}</StyledText>
                    </StyledView>
                  </StyledView>
                  
                  {renderStars(review.rating)}
                  
                  {renderComment(review.comment)}
                  
                  <StyledTouchableOpacity className="mt-2" activeOpacity={0.6}>
                    <StyledText className="font-[Poppins-Regular] text-xs text-gray-500">Like</StyledText>
                  </StyledTouchableOpacity>
                </StyledView>
              ))}
            </StyledScrollView>
          ) : (
            <StyledView className="items-center justify-center py-4">
              <StyledText className="text-sm text-gray-500 text-center">No reviews yet.</StyledText>
            </StyledView>
          )}

          {/* See All Reviews Button */}
          {reviews.length > 0 && (
            <StyledTouchableOpacity 
              className="bg-gray-100 py-2 rounded-lg items-center"
              onPress={onSeeAllReviews}
              activeOpacity={0.7}
            >
              <StyledText className="font-[Poppins-Medium] text-sm text-gray-800">See all reviews</StyledText>
            </StyledTouchableOpacity>
          )}
        </StyledView>
      </StyledView>
    </StyledView>
  );
};

export default ProfileRatings; 