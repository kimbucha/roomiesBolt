import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persist, createJSONStorage } from 'zustand/middleware';

interface ProfileOverlayState {
  // Whether the user has seen the profile stats overlay
  hasSeenProfileOverlay: boolean;
  
  // Actions
  setHasSeenProfileOverlay: (seen: boolean) => void;
  resetOverlayState: () => void;
}

export const useProfileOverlayStore = create<ProfileOverlayState>()(
  persist(
    (set) => ({
      hasSeenProfileOverlay: false,
      
      setHasSeenProfileOverlay: (seen) => set({
        hasSeenProfileOverlay: seen,
      }),
      
      resetOverlayState: () => set({
        hasSeenProfileOverlay: false,
      }),
    }),
    {
      name: 'profile-overlay-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
); 