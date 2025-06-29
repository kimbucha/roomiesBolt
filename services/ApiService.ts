/**
 * API Service for handling all API requests
 * This is a mock implementation that simulates API calls
 * In a real app, this would be replaced with actual API calls
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

// Mock delay to simulate network requests
const mockDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class ApiService {
  // Base API configuration
  private baseUrl: string = 'https://api.roomies.com';
  private defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Auth API
  async login(email: string, password: string): Promise<ApiResponse<any>> {
    try {
      // Simulate API call
      await mockDelay(1000);
      
      // Mock validation
      if (!email || !password) {
        return {
          data: null,
          error: 'Email and password are required',
          status: 400,
        };
      }

      // Test account for easy login during development
      if (email === 'test@roomies.com' && password === 'password') {
        const testUser = {
          id: '123',
          name: 'Test User',
          email: 'test@roomies.com',
          profileComplete: true,
          isPremium: false,
          isVerified: true,
          createdAt: new Date().toISOString(),
          bio: 'This is a test account for development purposes.',
          university: 'Test University',
          major: 'Computer Science',
          year: '3',
          location: 'San Francisco, CA',
          profilePicture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1760&q=80',
          interests: ['Coding', 'Movies', 'Music', 'Fitness'],
        };
        
        return {
          data: testUser,
          error: null,
          status: 200,
        };
      }

      console.log('[ApiService] Checking for existing user account with email:', email);
      
      // Check for existing user in AsyncStorage
      const userDataString = await AsyncStorage.getItem('roomies-user-storage');
      if (userDataString) {
        try {
          const userData = JSON.parse(userDataString);
          console.log('[ApiService] Found user data in storage:', userData.state?.user?.email);
          
          if (userData.state && userData.state.user && userData.state.user.email === email) {
            console.log('[ApiService] Found matching user account for:', email);
            
            // Make sure we have all required fields
            const user = userData.state.user;
            if (!user.signupDate) {
              user.signupDate = Date.now();
            }
            
            return {
              data: user,
              error: null,
              status: 200,
            };
          } else {
            console.log('[ApiService] No matching user found for email:', email);
          }
        } catch (parseError) {
          console.error('[ApiService] Error parsing user data:', parseError);
        }
      } else {
        console.log('[ApiService] No user data found in storage');
      }

      // If no existing user is found, return a generic account
      const newUser = {
        id: `user_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        name: 'New User',
        email,
        profileComplete: false,
        isPremium: false,
        isVerified: false,
        createdAt: new Date().toISOString(),
        signupDate: Date.now(),
      };
      
      console.log('[ApiService] Creating new generic user account for:', email);
      
      return {
        data: newUser,
        error: null,
        status: 200,
      };
    } catch (error) {
      return {
        data: null,
        error: 'Failed to login. Please try again.',
        status: 500,
      };
    }
  }

  async signup(name: string, email: string, password: string): Promise<ApiResponse<any>> {
    try {
      // Simulate API call
      await mockDelay(1000);
      
      // Mock validation
      if (!name || !email || !password) {
        return {
          data: null,
          error: 'Name, email, and password are required',
          status: 400,
        };
      }

      // Generate a unique ID for the new user
      const userId = `user_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      
      // Create user data with the provided information
      const userData = {
        id: userId,
        name,
        email,
        profileComplete: false,
        isPremium: false,
        isVerified: false,
        createdAt: new Date().toISOString(),
        signupDate: Date.now(),
      };
      
      // Save the user data to AsyncStorage directly
      try {
        // First check if we have existing user data
        const existingDataString = await AsyncStorage.getItem('roomies-user-storage');
        let existingData = existingDataString ? JSON.parse(existingDataString) : { state: { user: null } };
        
        // Update the user data
        existingData.state.user = userData;
        
        // Save back to AsyncStorage
        await AsyncStorage.setItem('roomies-user-storage', JSON.stringify(existingData));
        console.log('[ApiService] Saved new user account to AsyncStorage:', userData.email);
      } catch (storageError) {
        console.error('[ApiService] Failed to save user to AsyncStorage:', storageError);
      }
      
      // Log the created user for debugging
      console.log('[ApiService] Created new user account:', userData);
      
      // Mock successful response
      return {
        data: userData,
        error: null,
        status: 201,
      };
    } catch (error) {
      return {
        data: null,
        error: 'Failed to create account. Please try again.',
        status: 500,
      };
    }
  }

  async resetPassword(email: string): Promise<ApiResponse<any>> {
    try {
      // Simulate API call
      await mockDelay(1000);
      
      // Mock validation
      if (!email) {
        return {
          data: null,
          error: 'Email is required',
          status: 400,
        };
      }

      // Mock successful response
      return {
        data: { message: 'Password reset email sent' },
        error: null,
        status: 200,
      };
    } catch (error) {
      return {
        data: null,
        error: 'Failed to send reset email. Please try again.',
        status: 500,
      };
    }
  }

  // User API
  async getUserProfile(userId: string): Promise<ApiResponse<any>> {
    try {
      // Simulate API call
      await mockDelay(1000);
      
      // Mock successful response
      return {
        data: {
          id: userId,
          name: 'Alex Morgan',
          email: 'alex.morgan@example.com',
          profileComplete: true,
          isPremium: false,
          isVerified: false,
          bio: 'Computer Science student at Stanford University',
          university: 'Stanford University',
          major: 'Computer Science',
          year: 'Junior',
          location: 'Palo Alto, CA',
          interests: ['Coding', 'Hiking', 'Reading'],
          preferences: {
            budget: { min: 800, max: 1500 },
            roomType: 'Private',
            moveInDate: '2025-06-01',
            duration: '12 months',
            lifestyle: ['Non-smoker', 'Early riser', 'Clean'],
          },
          profilePicture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1760&q=80',
          createdAt: '2025-01-15T08:30:00.000Z',
        },
        error: null,
        status: 200,
      };
    } catch (error) {
      return {
        data: null,
        error: 'Failed to fetch user profile. Please try again.',
        status: 500,
      };
    }
  }

  async updateUserProfile(userId: string, profileData: any): Promise<ApiResponse<any>> {
    try {
      // Simulate API call
      await mockDelay(1000);
      
      // Mock successful response
      return {
        data: {
          ...profileData,
          id: userId,
          updatedAt: new Date().toISOString(),
        },
        error: null,
        status: 200,
      };
    } catch (error) {
      return {
        data: null,
        error: 'Failed to update profile. Please try again.',
        status: 500,
      };
    }
  }

  async verifyUser(userId: string): Promise<ApiResponse<any>> {
    try {
      // Simulate API call
      await mockDelay(1000);
      
      // Mock successful response
      return {
        data: {
          id: userId,
          isVerified: true,
          verifiedAt: new Date().toISOString(),
        },
        error: null,
        status: 200,
      };
    } catch (error) {
      return {
        data: null,
        error: 'Failed to verify user. Please try again.',
        status: 500,
      };
    }
  }

  async upgradeToPremium(userId: string): Promise<ApiResponse<any>> {
    try {
      // Simulate API call
      await mockDelay(1000);
      
      // Mock successful response
      return {
        data: {
          id: userId,
          isPremium: true,
          premiumSince: new Date().toISOString(),
          premiumUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        },
        error: null,
        status: 200,
      };
    } catch (error) {
      return {
        data: null,
        error: 'Failed to upgrade to premium. Please try again.',
        status: 500,
      };
    }
  }

  // Roommate API
  async getRoommateMatches(userId: string, page: number = 1, limit: number = 10): Promise<ApiResponse<any>> {
    try {
      // Simulate API call
      await mockDelay(1000);
      
      // Mock successful response
      return {
        data: {
          matches: Array(limit).fill(0).map((_, index) => ({
            id: `match-${index + (page - 1) * limit}`,
            name: `User ${index + (page - 1) * limit}`,
            university: 'Stanford University',
            major: 'Various Majors',
            year: ['Freshman', 'Sophomore', 'Junior', 'Senior'][Math.floor(Math.random() * 4)],
            bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
            compatibility: Math.floor(Math.random() * 50) + 50, // 50-100%
            isVerified: Math.random() > 0.5,
            isPremium: Math.random() > 0.7,
            lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(), // Within last 7 days
          })),
          total: 100,
          page,
          limit,
        },
        error: null,
        status: 200,
      };
    } catch (error) {
      return {
        data: null,
        error: 'Failed to fetch matches. Please try again.',
        status: 500,
      };
    }
  }

  // Support API
  async submitSupportRequest(userId: string, subject: string, message: string): Promise<ApiResponse<any>> {
    try {
      // Simulate API call
      await mockDelay(1000);
      
      // Mock validation
      if (!subject || !message) {
        return {
          data: null,
          error: 'Subject and message are required',
          status: 400,
        };
      }

      // Mock successful response
      return {
        data: {
          id: `ticket-${Date.now()}`,
          userId,
          subject,
          message,
          status: 'open',
          createdAt: new Date().toISOString(),
        },
        error: null,
        status: 201,
      };
    } catch (error) {
      return {
        data: null,
        error: 'Failed to submit support request. Please try again.',
        status: 500,
      };
    }
  }
}

export default new ApiService();
