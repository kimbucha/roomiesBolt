// Define the Review type
export interface Review {
  id: string;
  reviewerName: string;
  reviewerImage?: string;
  date: string;
  rating: number;
  comment?: string;
}

// Shared reviews data across the application
export const REVIEWS: Review[] = [
  {
    id: '1',
    reviewerName: 'Angeline',
    reviewerImage: 'https://randomuser.me/api/portraits/women/65.jpg',
    date: 'Dec 3, 2024',
    rating: 5,
    comment: 'Great roommate! Very clean and respectful of shared spaces. Would definitely recommend.'
  },
  {
    id: '2',
    reviewerName: 'Tuan',
    reviewerImage: 'https://randomuser.me/api/portraits/men/72.jpg',
    date: 'Nov 28, 2024',
    rating: 1,
    comment: 'Was looking for someone with a similar sleep schedule. Great person otherwise!'
  },
  {
    id: '3',
    reviewerName: 'Marco',
    reviewerImage: 'https://randomuser.me/api/portraits/men/32.jpg',
    date: 'Nov 15, 2024',
    rating: 4,
    comment: 'Really good communication and always paid rent on time!'
  },
  {
    id: '4',
    reviewerName: 'Jessica',
    reviewerImage: 'https://randomuser.me/api/portraits/women/44.jpg',
    date: 'Oct 27, 2024',
    rating: 3,
    comment: 'Decent roommate. Sometimes a bit too loud in the evenings, but otherwise fine.'
  }
];

// Helper function to calculate ratings
export const calculateRatings = (reviews: Review[]) => {
  // Calculate star distribution counts
  const starCounts = Array(5).fill(0);
  reviews.forEach((review) => {
    // Ensure the rating is a valid index (1-5)
    const ratingIndex = Math.max(1, Math.min(5, Math.round(review.rating))) - 1;
    starCounts[ratingIndex]++;
  });
  
  // Total reviews is the sum of all star counts
  const totalReviewCount = starCounts.reduce((sum, count) => sum + count, 0);
  
  // Calculate weighted average rating directly from the distribution
  const calculatedAverage = starCounts.reduce((sum, count, index) => {
    return sum + (count * (index + 1));
  }, 0) / Math.max(1, totalReviewCount); // Avoid division by zero
  
  return {
    average: calculatedAverage,
    total: totalReviewCount,
    starCounts // Return star distribution for visualizations
  };
};

// In a real app, this would fetch from an API
export const getUserReviews = (userId?: string) => {
  // In production, this would filter by userId
  return REVIEWS;
}; 