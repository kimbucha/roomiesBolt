import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type SubscriptionTier = 'free' | 'premium';

export interface SubscriptionFeature {
  id: string;
  name: string;
  description: string;
  availableOnFree: boolean;
  availableOnPremium: boolean;
}

export interface SubscriptionPlan {
  id: SubscriptionTier;
  name: string;
  price: number;
  billingPeriod: 'monthly' | 'yearly';
  features: string[]; // IDs of features included
}

interface SubscriptionState {
  currentTier: SubscriptionTier;
  subscriptionExpiry: string | null; // ISO date string
  paymentMethods: PaymentMethod[];
  subscriptionPlans: SubscriptionPlan[];
  features: SubscriptionFeature[];
  
  // Actions
  setSubscriptionTier: (tier: SubscriptionTier, expiryDate?: string) => void;
  addPaymentMethod: (method: PaymentMethod) => void;
  removePaymentMethod: (id: string) => void;
  setDefaultPaymentMethod: (id: string) => void;
  
  // Getters
  isFeatureAvailable: (featureId: string) => boolean;
  isPremium: () => boolean;
  getCurrentPlan: () => SubscriptionPlan;
  getAvailableFeatures: () => SubscriptionFeature[];
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'applepay' | 'googlepay';
  isDefault: boolean;
  lastFour?: string;
  expiryDate?: string;
  cardType?: 'visa' | 'mastercard' | 'amex' | 'discover';
  name?: string;
  email?: string;
}

// Default subscription features
const defaultFeatures: SubscriptionFeature[] = [
  {
    id: 'unlimited-matches',
    name: 'Unlimited Matches',
    description: 'Connect with as many potential roommates as you want',
    availableOnFree: false,
    availableOnPremium: true,
  },
  {
    id: 'advanced-filters',
    name: 'Advanced Filters',
    description: 'Filter potential roommates by lifestyle, habits, and more',
    availableOnFree: false,
    availableOnPremium: true,
  },
  {
    id: 'priority-matching',
    name: 'Priority Matching',
    description: 'Get shown to more potential roommates',
    availableOnFree: false,
    availableOnPremium: true,
  },
  {
    id: 'read-receipts',
    name: 'Read Receipts',
    description: 'See when your messages have been read',
    availableOnFree: false,
    availableOnPremium: true,
  },
  {
    id: 'basic-matching',
    name: 'Basic Matching',
    description: 'Find potential roommates in your area',
    availableOnFree: true,
    availableOnPremium: true,
  },
  {
    id: 'messaging',
    name: 'Messaging',
    description: 'Chat with your matches',
    availableOnFree: true,
    availableOnPremium: true,
  },
  {
    id: 'profile-creation',
    name: 'Profile Creation',
    description: 'Create and customize your profile',
    availableOnFree: true,
    availableOnPremium: true,
  },
];

// Default subscription plans
const defaultPlans: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    billingPeriod: 'monthly',
    features: defaultFeatures.filter(f => f.availableOnFree).map(f => f.id),
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 9.99,
    billingPeriod: 'monthly',
    features: defaultFeatures.filter(f => f.availableOnPremium).map(f => f.id),
  },
];

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      currentTier: 'free',  // CRITICAL: Always default to free
      subscriptionExpiry: null,
      paymentMethods: [],
      subscriptionPlans: defaultPlans,
      features: defaultFeatures,
      
      setSubscriptionTier: (tier, expiryDate) => set({
        currentTier: tier,
        subscriptionExpiry: expiryDate || null,
      }),
      
      addPaymentMethod: (method) => {
        const { paymentMethods } = get();
        const updatedMethods = [...paymentMethods];
        
        // If this is the first payment method, make it default
        if (updatedMethods.length === 0) {
          method.isDefault = true;
        }
        
        // If this method is set as default, update other methods
        if (method.isDefault) {
          updatedMethods.forEach(m => {
            m.isDefault = false;
          });
        }
        
        set({ paymentMethods: [...updatedMethods, method] });
      },
      
      removePaymentMethod: (id) => {
        const { paymentMethods } = get();
        const methodToRemove = paymentMethods.find(m => m.id === id);
        
        if (!methodToRemove) return;
        
        const updatedMethods = paymentMethods.filter(m => m.id !== id);
        
        // If we removed the default method, set a new default if possible
        if (methodToRemove.isDefault && updatedMethods.length > 0) {
          updatedMethods[0].isDefault = true;
        }
        
        set({ paymentMethods: updatedMethods });
      },
      
      setDefaultPaymentMethod: (id) => {
        const { paymentMethods } = get();
        const updatedMethods = paymentMethods.map(method => ({
          ...method,
          isDefault: method.id === id,
        }));
        
        set({ paymentMethods: updatedMethods });
      },
      
      isFeatureAvailable: (featureId) => {
        const { currentTier, features } = get();
        const feature = features.find(f => f.id === featureId);
        
        if (!feature) return false;
        
        return currentTier === 'premium' 
          ? feature.availableOnPremium 
          : feature.availableOnFree;
      },
      
      isPremium: () => {
        const { currentTier, subscriptionExpiry } = get();
        
        // Check if premium and not expired
        if (currentTier === 'premium' && subscriptionExpiry) {
          const expiryDate = new Date(subscriptionExpiry);
          const now = new Date();
          return expiryDate > now;
        }
        
        return false;
      },
      
      getCurrentPlan: () => {
        const { currentTier, subscriptionPlans } = get();
        return subscriptionPlans.find(plan => plan.id === currentTier) || subscriptionPlans[0];
      },
      
      getAvailableFeatures: () => {
        const { currentTier, features } = get();
        
        return features.filter(feature => 
          currentTier === 'premium' 
            ? feature.availableOnPremium 
            : feature.availableOnFree
        );
      },
    }),
    {
      name: 'roomies-subscription-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
