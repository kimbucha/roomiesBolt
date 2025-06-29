import React, { ReactNode } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { Star } from 'lucide-react-native';
import Card from '../Card';
// Assuming Review type is correctly defined and exported from data/reviewsData
import type { Review } from '../../data/reviewsData'; 

interface ReviewsSectionProps {
  reviews: Review[];
  rating: { average: number; total: number };
  onSeeAllReviews: () => void;
  headerRight?: ReactNode;
}

// Helper to render stars with indigo color to match the image
const renderStars = (ratingValue: number) => {
  const stars = [];
  const fullStars = Math.floor(ratingValue);
  const halfStar = ratingValue % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  for (let i = 0; i < fullStars; i++) {
    stars.push(<Star key={`full-${i}`} size={18} color="#4F46E5" fill="#4F46E5" />);
  }
  if (halfStar) {
    // Note: Lucide doesn't have a half-star, using full as placeholder
    stars.push(<Star key="half" size={18} color="#4F46E5" fill="#4F46E5" />); 
  }
  for (let i = 0; i < emptyStars; i++) {
    stars.push(<Star key={`empty-${i}`} size={18} color="#E2E8F0" />);
  }
  return <View className="flex-row mr-2">{stars}</View>;
};

const ReviewsSection: React.FC<ReviewsSectionProps> = ({ reviews, rating, onSeeAllReviews, headerRight }) => {
  return (
    <Card variant="outlined" fullWidth>
      <View style={{ padding: 16, paddingBottom: 8 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Star size={20} color="#4F46E5" style={{ marginRight: 8 }} />
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937' }}>Rating and Reviews</Text>
          </View>
          {headerRight && (
            <View>{headerRight}</View>
          )}
        </View>
      </View>
      {rating.total > 0 ? (
        <View style={{ paddingLeft: 16, paddingRight: 16 }}>
          {/* Overall Rating */}
          <View className="flex-row items-center mb-2">
            {renderStars(rating.average)}
            <Text className="font-[Poppins-SemiBold] text-sm text-gray-800">{rating.average.toFixed(1)} ({rating.total} reviews)</Text>
          </View>
          
          <Text className="font-[Poppins-Regular] text-xs text-slate-400 mb-6">(Visible to the public after 2 ratings. <Text className="font-[Poppins-Medium] text-indigo-600">Learn more</Text>)</Text>
          
          {/* Reviews of User Header */}
          <Text className="font-[Poppins-SemiBold] text-sm text-gray-800 mb-4">Reviews of Test</Text>
          
          {/* Horizontal Scrolling Review Cards */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 4, paddingBottom: 8 }}
          >
            {reviews.map((review) => (
              <View key={review.id} className="bg-white rounded-xl px-4 pt-4 pb-1 mr-3 border border-gray-200 w-[260px] shadow-sm">
                <View className="flex-row items-center mb-3">
                  <Image
                    source={{ uri: review.reviewerImage || 'https://via.placeholder.com/40' }}
                    className="w-12 h-12 rounded-full mr-3"
                  />
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-gray-800 mb-0.5">{review.reviewerName}</Text>
                    <Text className="text-sm text-slate-400">{review.date}</Text>
                  </View>
                </View>
                
                <View className="mb-2">
                  {renderStars(review.rating)}
                </View>
                
                {review.comment && (
                  <Text className="text-sm leading-5 text-slate-600 mb-3" numberOfLines={1} ellipsizeMode="tail">{review.comment}</Text>
                )}
                
                <TouchableOpacity className="mb-3">
                  <Text className="text-sm font-medium text-indigo-600"> See more</Text>
                </TouchableOpacity>
                
                <TouchableOpacity className="mb-3">
                  <Text className="text-sm font-medium text-indigo-600">Like</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          {/* See All Reviews Button */}
          <TouchableOpacity
            className="mt-4 w-full px-4 py-2 bg-indigo-600 rounded-lg"
            onPress={onSeeAllReviews}
          >
            <Text className="font-[Poppins-Medium] text-base text-white text-center">See all reviews</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text className="text-sm text-slate-500 text-center py-5 px-5">No reviews yet.</Text>
      )}
    </Card>
  );
};

export default ReviewsSection; 