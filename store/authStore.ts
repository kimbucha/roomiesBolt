import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  isPremium: boolean;
  signupDate: number;
  // Additional user fields as needed
}

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  
  // Auth actions
  login: (user: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  setPremiumStatus: (isPremium: boolean) => void;
  initializeDevUser: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoggedIn: false,
      isLoading: true,
      
      login: (user) => {
        set({ user, isLoggedIn: true, isLoading: false });
      },
      
      logout: () => {
        set({ user: null, isLoggedIn: false });
      },
      
      updateUser: (updates) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null
        }));
      },
      
      setPremiumStatus: (isPremium) => {
        set((state) => ({
          user: state.user ? { ...state.user, isPremium } : null
        }));
      },
      
      // CRITICAL FIX: Initialize with development user if in dev mode and no user exists
      initializeDevUser: () => {
        if (__DEV__ && !get().user) {
          const devUser: User = {
            id: 'temp-1748363625559',
            name: 'You',
            email: 'dev@roomies.app',
            profileImage: 'https://randomuser.me/api/portraits/men/32.jpg', // Default dev user avatar
            isPremium: false,
            signupDate: Date.now()
          };
          set({ user: devUser, isLoggedIn: true, isLoading: false });
        }
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
); 