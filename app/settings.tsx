import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { 
  ChevronLeft, 
  Bell, 
  Shield, 
  Lock, 
  LogOut, 
  ChevronRight,
  User,
  CreditCard,
  HelpCircle,
  Crown
} from 'lucide-react-native';
import { useSupabaseUserStore } from '../store/supabaseUserStore';
import { useSupabaseAuthStore } from '../store/supabaseAuthStore';
import { useSubscriptionStore } from '../store/subscriptionStore';
import { PremiumBadge } from '../components';
import UserAvatar from '../components/UserAvatar';

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

interface SettingsItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  showChevron?: boolean;
}

const SettingsSection = ({ title, children }: SettingsSectionProps) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.sectionContent}>
      {children}
    </View>
  </View>
);

const SettingsItem = ({ 
  icon, 
  title, 
  subtitle, 
  onPress, 
  rightElement,
  showChevron = true
}: SettingsItemProps) => (
  <TouchableOpacity 
    style={styles.settingsItem}
    onPress={onPress}
    disabled={!onPress}
  >
    <View style={styles.settingsItemLeft}>
      <View style={styles.iconContainer}>
        {icon}
      </View>
      <View style={styles.settingsItemContent}>
        <Text style={styles.settingsItemTitle}>{title}</Text>
        {subtitle && (
          <Text style={styles.settingsItemSubtitle}>{subtitle}</Text>
        )}
      </View>
    </View>
    
    <View style={styles.settingsItemRight}>
      {rightElement}
      {showChevron && onPress && <ChevronRight size={20} color="#9CA3AF" />}
    </View>
  </TouchableOpacity>
);

export default function SettingsScreen() {
  const router = useRouter();
  const { user } = useSupabaseUserStore();
  const { logout } = useSupabaseAuthStore();
  const { isPremium } = useSubscriptionStore();
  
  const [notificationSettings, setNotificationSettings] = useState({
    newMatches: true,
    messages: true,
    appUpdates: false,
    emailNotifications: true,
  });
  
  const [privacySettings, setPrivacySettings] = useState({
    locationSharing: true,
    profileVisibility: true,
    activityStatus: true,
  });
  
  const handleToggle = (setting: string, section: 'notifications' | 'privacy') => {
    if (section === 'notifications') {
      setNotificationSettings({
        ...notificationSettings,
        [setting]: !notificationSettings[setting as keyof typeof notificationSettings],
      });
    } else {
      setPrivacySettings({
        ...privacySettings,
        [setting]: !privacySettings[setting as keyof typeof privacySettings],
      });
    }
  };
  
  const handleLogout = () => {
    logout();
    router.replace('/');
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerRight} />
      </View>
      
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.profileSection}>
          <View style={styles.profileInfo}>
            <UserAvatar
              user={user}
              size="large"
            />
            <View style={styles.profileDetails}>
              <Text style={styles.profileName}>{user?.name || 'User'}</Text>
              <Text style={styles.profileEmail}>{user?.email || 'user@example.com'}</Text>
              
              {isPremium() && (
                <View style={styles.premiumBadgeContainer}>
                  <PremiumBadge size="sm" />
                </View>
              )}
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.editProfileButton}
            onPress={() => router.push('/profile/edit')}
          >
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
        
        <SettingsSection title="Account">
          <SettingsItem
            icon={<User size={20} color="#4B5563" />}
            title="Personal Information"
            onPress={() => router.push('/profile/edit')}
          />
          
          <SettingsItem
            icon={<Crown size={20} color="#F59E0B" />}
            title="Premium"
            subtitle={isPremium() ? "You're a premium member" : "Upgrade to premium"}
            onPress={() => router.push('/premium')}
          />
          
          <SettingsItem
            icon={<CreditCard size={20} color="#4B5563" />}
            title="Payment Methods"
            onPress={() => router.push('/payment')}
          />
        </SettingsSection>
        
        <SettingsSection title="Notifications">
          <SettingsItem
            icon={<Bell size={20} color="#4B5563" />}
            title="New Matches"
            showChevron={false}
            rightElement={
              <Switch
                value={notificationSettings.newMatches}
                onValueChange={() => handleToggle('newMatches', 'notifications')}
                trackColor={{ false: '#E5E7EB', true: '#4F46E5' }}
                thumbColor="#FFFFFF"
              />
            }
          />
          
          <SettingsItem
            icon={<Bell size={20} color="#4B5563" />}
            title="Messages"
            showChevron={false}
            rightElement={
              <Switch
                value={notificationSettings.messages}
                onValueChange={() => handleToggle('messages', 'notifications')}
                trackColor={{ false: '#E5E7EB', true: '#4F46E5' }}
                thumbColor="#FFFFFF"
              />
            }
          />
          
          <SettingsItem
            icon={<Bell size={20} color="#4B5563" />}
            title="App Updates"
            showChevron={false}
            rightElement={
              <Switch
                value={notificationSettings.appUpdates}
                onValueChange={() => handleToggle('appUpdates', 'notifications')}
                trackColor={{ false: '#E5E7EB', true: '#4F46E5' }}
                thumbColor="#FFFFFF"
              />
            }
          />
          
          <SettingsItem
            icon={<Bell size={20} color="#4B5563" />}
            title="Email Notifications"
            showChevron={false}
            rightElement={
              <Switch
                value={notificationSettings.emailNotifications}
                onValueChange={() => handleToggle('emailNotifications', 'notifications')}
                trackColor={{ false: '#E5E7EB', true: '#4F46E5' }}
                thumbColor="#FFFFFF"
              />
            }
          />
        </SettingsSection>
        
        <SettingsSection title="Privacy">
          <SettingsItem
            icon={<Shield size={20} color="#4B5563" />}
            title="Location Sharing"
            showChevron={false}
            rightElement={
              <Switch
                value={privacySettings.locationSharing}
                onValueChange={() => handleToggle('locationSharing', 'privacy')}
                trackColor={{ false: '#E5E7EB', true: '#4F46E5' }}
                thumbColor="#FFFFFF"
              />
            }
          />
          
          <SettingsItem
            icon={<Shield size={20} color="#4B5563" />}
            title="Profile Visibility"
            showChevron={false}
            rightElement={
              <Switch
                value={privacySettings.profileVisibility}
                onValueChange={() => handleToggle('profileVisibility', 'privacy')}
                trackColor={{ false: '#E5E7EB', true: '#4F46E5' }}
                thumbColor="#FFFFFF"
              />
            }
          />
          
          <SettingsItem
            icon={<Shield size={20} color="#4B5563" />}
            title="Activity Status"
            showChevron={false}
            rightElement={
              <Switch
                value={privacySettings.activityStatus}
                onValueChange={() => handleToggle('activityStatus', 'privacy')}
                trackColor={{ false: '#E5E7EB', true: '#4F46E5' }}
                thumbColor="#FFFFFF"
              />
            }
          />
          
          <SettingsItem
            icon={<Lock size={20} color="#4B5563" />}
            title="Blocked Users"
            onPress={() => router.push('/blocked-users')}
          />
        </SettingsSection>
        
        <SettingsSection title="Support">
          <SettingsItem
            icon={<HelpCircle size={20} color="#4B5563" />}
            title="Contact Support"
            onPress={() => router.push('/support')}
          />
          
          {/* Debug link - only visible in development */}
          {__DEV__ && (
            <SettingsItem
              icon={<HelpCircle size={20} color="#10B981" />}
              title="Profile Data Test"
              subtitle="Debug tools for profile data"
              onPress={() => router.push('/(debug)/profile-data-test')}
            />
          )}
        </SettingsSection>
        
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <LogOut size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
        
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    fontFamily: 'Poppins-Bold',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  profileSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 16,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  profileInitials: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Poppins-Bold',
  },
  profileDetails: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
    fontFamily: 'Poppins-Bold',
  },
  profileEmail: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
  },
  premiumBadgeContainer: {
    marginTop: 8,
  },
  editProfileButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  editProfileText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4B5563',
    fontFamily: 'Poppins-SemiBold',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6B7280',
    marginLeft: 16,
    marginBottom: 8,
    fontFamily: 'Poppins-SemiBold',
  },
  sectionContent: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsItemContent: {
    marginLeft: 8,
    flex: 1,
  },
  settingsItemTitle: {
    fontSize: 16,
    color: '#1F2937',
    fontFamily: 'Poppins-Medium',
  },
  settingsItemSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
  },
  settingsItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 16,
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 16,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#EF4444',
    marginLeft: 8,
    fontFamily: 'Poppins-SemiBold',
  },
  versionText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
  },
});
