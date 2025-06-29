import { create } from 'zustand';
import { Review, getUserReviews } from '../data/reviewsData';
import { useUserStore } from './userStore';

interface ReviewState {
  reviewsByUser: Record<string, Review[]>;
  fetchReviews: (revieweeId: string) => void;
  addReview: (revieweeId: string, rating: number, comment?: string) => void;
}

export const useReviewStore = create<ReviewState>((set) => ({
  reviewsByUser: {},

  fetchReviews: (revieweeId: string) => {
    const reviews = getUserReviews(revieweeId);
    set((state) => ({
      reviewsByUser: {
        ...state.reviewsByUser,
        [revieweeId]: reviews,
      },
    }));
  },

  addReview: (revieweeId: string, rating: number, comment?: string) => {
    const currentUser = useUserStore.getState().user;
    const reviewerName = currentUser?.name || 'Anonymous';
    const reviewerImage = currentUser?.profilePicture;
    const newReview: Review = {
      id: Date.now().toString(),
      reviewerName,
      reviewerImage,
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      rating,
      comment,
    };
    set((state) => ({
      reviewsByUser: {
        ...state.reviewsByUser,
        [revieweeId]: [newReview, ...(state.reviewsByUser[revieweeId] || [])],
      },
    }));
  },
}));
