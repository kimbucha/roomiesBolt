import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import {
  Settings,
  User as UserIcon,
  Shield,
  CreditCard,
  Bell,
  CircleHelp as HelpCircle,
  LogOut,
  ChevronRight,
  Star,
  Check,
  Home,
  Sparkles
} from 'lucide-react-native';
import { useSupabaseUserStore } from '../../../store/supabaseUserStore';
import { useSupabaseAuthStore } from '../../../store/supabaseAuthStore';
import { REVIEWS, calculateRatings } from '../../../data/reviewsData';
import { Button, Card, Badge, TabScreenHeader } from '../../../components';
import UserAvatar from '../../../components/UserAvatar';
import ReviewsSection from '../../../components/profile-view/ReviewsSection';

// Import our new dynamic profile components
import ProfileStrengthIndicator from '../../../components/profile/ProfileStrengthIndicator';
import AboutMeSection from '../../../components/profile/AboutMeSection';
import EducationSection from '../../../components/profile/EducationSection';
import LifestylePreferencesSection from '../../../components/profile/LifestylePreferencesSection';
import PersonalitySection from '../../../components/profile/PersonalitySection';

export default function ProfileTabScreen() {
  const router = useRouter();
  const { user, isLoading, fetchUserProfile } = useSupabaseUserStore();
  const { logout } = useSupabaseAuthStore();
  const [notificationsEnabled, setNotificationsEnabled] = useState(user?.preferences?.notifications ?? true);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => { logout(); router.replace('/(auth)/login'); } }
      ]
    );
  };

  const handleEditProfile = () => router.push('/edit-profile');
  const handleVerifyProfile = () =>
    Alert.alert('Verify Profile', 'Send verification email?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Continue', onPress: async () => {
          try { 
            // TODO: Implement verifyUser function
            Alert.alert('Email Sent', 'Check your inbox.'); 
          }
          catch { Alert.alert('Error', 'Failed to send verification email.'); }
        }
      }
    ]);
  const handleUpgradeToPremium = () => router.push('/premium-features');
  const toggleNotifications = () => setNotificationsEnabled(v => !v);
  const handleSupport = () => router.push('/support');
  const handlePrivacySecurity = () => router.push('/privacy-security');
  const handlePaymentMethods = () => router.push('/payment-methods');
  const handleRoommatePreferences = () => router.push('/edit-profile?section=preferences');

  // Debug: Log user data to see what we're getting
  console.log('[Profile Debug] User data from SupabaseUserStore:', user);
  console.log('[Profile Debug] isLoading:', isLoading);

  // Fetch user profile if not loaded
  useEffect(() => {
    if (!user && !isLoading) {
      console.log('[Profile] No user data found, fetching profile...');
      fetchUserProfile();
    }
  }, [user, isLoading, fetchUserProfile]);

  // Show loading state if user data is still being fetched
  // Add a timeout to prevent infinite loading
  const [loadingTimeout, setLoadingTimeout] = React.useState(false);
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setLoadingTimeout(true);
    }, 5000); // 5 second timeout
    
    return () => clearTimeout(timer);
  }, []);

  if (isLoading && !loadingTimeout) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <Text className="text-gray-600">Loading profile...</Text>
      </View>
    );
  }

  // If user is still null after timeout, show error
  if (!user && loadingTimeout) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center p-6">
        <Text className="text-red-600 text-center">Failed to load profile. Please try logging out and logging back in.</Text>
      </View>
    );
  }

  // Get user profile data directly from the user store
  const userProfile = {
    name: user?.name ?? 'User',
    isPremium: user?.isPremium ?? false,
    isVerified: user?.isVerified ?? false,
  };
  
  // Get reviews for the current user
  const reviews = REVIEWS.slice(0, 3);
  const rating = calculateRatings(reviews);
  
  const handleSeeAllReviews = () => {
    router.push('/reviews');
  };

  return (
    <View className="flex-1 bg-gray-50">
      <TabScreenHeader logoAlignment="left" rightContent={
        <TouchableOpacity className="p-2" onPress={() => router.push('/settings')}>
          <Settings size={24} color="#1F2937" />
        </TouchableOpacity>
      } />
      <ScrollView className="flex-1">
        <View className="p-6 bg-white">
          <View className="flex-row items-center">
            <UserAvatar user={user as any} size="large" variant="circle" />
            <View className="flex-1 ml-4">
              <View className="flex-row items-center">
                <Text className="font-[Poppins-Bold] text-xl text-gray-900">{userProfile.name}</Text>
                {userProfile.isPremium && (
                  <View className="bg-amber-500 px-2 py-0.5 rounded-lg ml-2 flex-row items-center">
                    <Star size={12} color="#FFFFFF" />
                    <Text className="font-[Poppins-Bold] text-xs text-white ml-1">PRO</Text>
                  </View>
                )}
              </View>
              {(() => {
                // Determine what to display based on current user data (same logic as EducationSection)
                const hasSchoolInfo = user?.university || user?.major || user?.year;
                const hasJobInfo = user?.company || user?.role;
                const displayType = hasSchoolInfo ? 'school' : hasJobInfo ? 'job' : 'school';
                
                                 if (displayType === 'school') {
                   return (
                     <>
                       <Text className="font-[Poppins-SemiBold] text-base text-gray-700">
                         {user?.university || 'Add your university'}
                       </Text>
                       <Text className="font-[Poppins-Regular] text-sm text-gray-500">
                         {user?.major || 'Add your major'}{user?.year ? `, ${user.year}` : ''}
                       </Text>
                     </>
                   );
                 } else {
                   return (
                     <>
                       <Text className="font-[Poppins-SemiBold] text-base text-gray-700">
                         {user?.company || 'Add your workplace'}
                       </Text>
                       <Text className="font-[Poppins-Regular] text-sm text-gray-500">
                         {user?.role || 'Add your role'}
                       </Text>
                     </>
                   );
                 }
              })()}
              {userProfile.isVerified ? (
                <View className="mt-2">
                  <Badge label="Verified" variant="success" size="small" leftIcon={<Check size={12} color="#10B981" />} />
                </View>
              ) : (
                <TouchableOpacity onPress={handleVerifyProfile}>
                  <Text className="font-[Poppins-Medium] text-xs text-indigo-600 mt-2">Verify your profile</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
          <Button title="Edit Profile" onPress={handleEditProfile} variant="outline" style={{ marginTop: 16 }} leftIcon={<UserIcon size={16} color="#4F46E5" />} />
          {/* Replace hardcoded profile strength with dynamic component */}
          <ProfileStrengthIndicator />
        </View>
        {!userProfile.isPremium && (
          <Card variant="elevated" style={{ marginHorizontal: 16, marginTop: 16, backgroundColor: '#4F46E5' }} onPress={handleUpgradeToPremium}>
            <View className="flex-row items-center">
              <View className="bg-amber-500 p-2 rounded-lg mr-3">
                <Sparkles size={18} color="#FFFFFF" />
              </View>
              <View className="flex-1">
                <Text className="font-[Poppins-Bold] text-base text-white mb-1">Upgrade to Premium</Text>
                <Text className="font-[Poppins-Regular] text-sm text-white/80 leading-5">
                  Get unlimited matches, see who likes you, and boost your profile visibility!
                </Text>
              </View>
            </View>
          </Card>
        )}
        {/* Replace hardcoded About Me section with dynamic component */}
        <Card variant="outlined" style={{ marginHorizontal: 16, marginTop: 16 }}>
          <AboutMeSection />
        </Card>
        <View style={{ marginHorizontal: 16, marginTop: 16 }}>
          <ReviewsSection 
            reviews={reviews} 
            rating={rating} 
            onSeeAllReviews={handleSeeAllReviews} 
            headerRight={userProfile.name === user?.name ? undefined : (
              <TouchableOpacity onPress={() => router.push('/write-review')}>
                <Text className="font-[Poppins-Medium] text-xs text-indigo-600">Leave review</Text>
              </TouchableOpacity>
            )}
          />
        </View>
        {/* Replace hardcoded Education section with dynamic component */}
        <Card variant="outlined" style={{ marginHorizontal: 16, marginTop: 16 }}>
          <EducationSection />
        </Card>
        
        {/* Add Personality Section */}
        {user?.personalityType && (
          <Card variant="outlined" style={{ marginHorizontal: 16, marginTop: 16 }}>
            <PersonalitySection />
          </Card>
        )}
        
        {/* Replace hardcoded Lifestyle & Traits section with dynamic component */}
        <Card variant="outlined" style={{ marginHorizontal: 16, marginTop: 16 }}>
          <LifestylePreferencesSection />
        </Card>
        <Card variant="outlined" style={{ marginHorizontal: 16, marginTop: 16, overflow: 'hidden' }}>
          <View style={{ padding: 16, paddingBottom: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Settings size={20} color="#4F46E5" style={{ marginRight: 8 }} />
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937' }}>Account Settings</Text>
              </View>
            </View>
          </View>
          <View style={{ paddingLeft: 16 }}>
            <TouchableOpacity className="flex-row items-center py-3 px-4" onPress={handlePrivacySecurity}>
              <Shield size={20} color="#4F46E5" className="mr-4" />
              <Text className="font-[Poppins-Medium] text-base text-gray-900 flex-1">Privacy & Security</Text>
              <ChevronRight size={20} color="#9CA3AF" />
            </TouchableOpacity>
            <View className="h-px bg-gray-100 mx-4" />
            <TouchableOpacity className="flex-row items-center py-3 px-4" onPress={handlePaymentMethods}>
              <CreditCard size={20} color="#4F46E5" className="mr-4" />
              <Text className="font-[Poppins-Medium] text-base text-gray-900 flex-1">Payment Methods</Text>
              <ChevronRight size={20} color="#9CA3AF" />
            </TouchableOpacity>
            <View className="h-px bg-gray-100 mx-4" />
            <View className="flex-row items-center py-3 px-4">
              <Bell size={20} color="#4F46E5" className="mr-4" />
              <Text className="font-[Poppins-Medium] text-base text-gray-900 flex-1">Notifications</Text>
              <Switch value={notificationsEnabled} onValueChange={toggleNotifications} trackColor={{false:'#E5E7EB',true:'#4F46E5'}} thumbColor="#FFFFFF" />
            </View>
          </View>
        </Card>
        <Card variant="outlined" style={{ marginHorizontal: 16, marginTop: 16, overflow: 'hidden' }}>
          <View style={{ padding: 16, paddingBottom: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <UserIcon size={20} color="#4F46E5" style={{ marginRight: 8 }} />
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937' }}>Support</Text>
              </View>
            </View>
          </View>
          <View style={{ paddingLeft: 16 }}>
            <TouchableOpacity className="flex-row items-center py-3 px-4" onPress={handleSupport}>
              <HelpCircle size={20} color="#4F46E5" className="mr-4" />
              <Text className="font-[Poppins-Medium] text-base text-gray-900 flex-1">Help Center</Text>
              <ChevronRight size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </Card>
        <Button title="Log Out" onPress={handleLogout} loading={isLoading} variant="danger" style={{ marginTop: 32, marginHorizontal: 16, marginBottom: 16 }} leftIcon={<LogOut size={20} color="#FFFFFF"/>} />
        <View className="items-center p-6">
          <Text className="font-[Poppins-Regular] text-sm text-gray-400">
            Roomies v{Constants.manifest?.version || Constants.expoConfig?.version || Constants.version || '1.0.0'}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
