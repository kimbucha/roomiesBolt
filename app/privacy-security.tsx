import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { X, ChevronRight, Lock, Eye, Bell, Shield, Trash2 } from 'lucide-react-native';
import { Button, Card } from '../components';
import { useUserStore } from '../store/userStore';

const PrivacySecurityScreen = () => {
  const router = useRouter();
  const { user } = useUserStore();
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [profileVisible, setProfileVisible] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);

  const handleClose = () => {
    router.back();
  };

  const handleChangePassword = () => {
    Alert.alert(
      'Change Password',
      'We will send you an email with instructions to change your password.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Send Email',
          onPress: () => {
            Alert.alert('Email Sent', 'Check your inbox for password reset instructions.');
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => {
            Alert.alert(
              'Confirm Deletion',
              'Please confirm that you want to permanently delete your account and all associated data.',
              [
                {
                  text: 'Cancel',
                  style: 'cancel',
                },
                {
                  text: 'Confirm Delete',
                  onPress: () => {
                    // In a real app, this would call an API to delete the account
                    router.replace('/(auth)/login');
                  },
                  style: 'destructive',
                },
              ]
            );
          },
          style: 'destructive',
        },
      ]
    );
  };

  const toggleTwoFactor = () => {
    if (!twoFactorEnabled) {
      Alert.alert(
        'Enable Two-Factor Authentication',
        'We will send you a verification code to set up two-factor authentication.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Continue',
            onPress: () => {
              setTwoFactorEnabled(true);
              Alert.alert('Two-Factor Authentication Enabled', 'Your account is now more secure.');
            },
          },
        ]
      );
    } else {
      setTwoFactorEnabled(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <X size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy & Security</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Security</Text>
          
          <Card variant="outlined" style={styles.menuList}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={handleChangePassword}
            >
              <Lock size={20} color="#4F46E5" style={styles.menuIcon} />
              <Text style={styles.menuText}>Change Password</Text>
              <ChevronRight size={20} color="#9CA3AF" style={styles.menuArrow} />
            </TouchableOpacity>
            
            <View style={styles.menuDivider} />
            
            <View style={styles.menuItemWithSwitch}>
              <Shield size={20} color="#4F46E5" style={styles.menuIcon} />
              <Text style={styles.menuText}>Two-Factor Authentication</Text>
              <Switch
                value={twoFactorEnabled}
                onValueChange={toggleTwoFactor}
                trackColor={{ false: '#E5E7EB', true: '#4F46E5' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy</Text>
          
          <Card variant="outlined" style={styles.menuList}>
            <View style={styles.menuItemWithSwitch}>
              <Eye size={20} color="#4F46E5" style={styles.menuIcon} />
              <Text style={styles.menuText}>Profile Visibility</Text>
              <Switch
                value={profileVisible}
                onValueChange={setProfileVisible}
                trackColor={{ false: '#E5E7EB', true: '#4F46E5' }}
                thumbColor="#FFFFFF"
              />
            </View>
            
            <View style={styles.menuDivider} />
            
            <View style={styles.menuItemWithSwitch}>
              <Bell size={20} color="#4F46E5" style={styles.menuIcon} />
              <Text style={styles.menuText}>Location Services</Text>
              <Switch
                value={locationEnabled}
                onValueChange={setLocationEnabled}
                trackColor={{ false: '#E5E7EB', true: '#4F46E5' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <Card variant="outlined" style={styles.menuList}>
            <View style={styles.menuItemWithSwitch}>
              <Bell size={20} color="#4F46E5" style={styles.menuIcon} />
              <Text style={styles.menuText}>Push Notifications</Text>
              <Switch
                value={pushNotifications}
                onValueChange={setPushNotifications}
                trackColor={{ false: '#E5E7EB', true: '#4F46E5' }}
                thumbColor="#FFFFFF"
              />
            </View>
            
            <View style={styles.menuDivider} />
            
            <View style={styles.menuItemWithSwitch}>
              <Bell size={20} color="#4F46E5" style={styles.menuIcon} />
              <Text style={styles.menuText}>Email Notifications</Text>
              <Switch
                value={emailNotifications}
                onValueChange={setEmailNotifications}
                trackColor={{ false: '#E5E7EB', true: '#4F46E5' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </Card>
        </View>

        <View style={styles.dangerSection}>
          <Button
            title="Delete Account"
            onPress={handleDeleteAccount}
            variant="danger"
            leftIcon={<Trash2 size={20} color="#FFFFFF" />}
          />
          <Text style={styles.dangerText}>
            Permanently delete your account and all of your data. This action cannot be undone.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
    color: '#1F2937',
  },
  closeButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
    color: '#1F2937',
    marginBottom: 12,
  },
  menuList: {
    padding: 0,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  menuItemWithSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  menuIcon: {
    marginRight: 16,
  },
  menuText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: '#1F2937',
    flex: 1,
  },
  menuArrow: {
    marginLeft: 'auto',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dangerSection: {
    marginTop: 24,
    marginBottom: 40,
    padding: 24,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  dangerText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#B91C1C',
    marginTop: 12,
    textAlign: 'center',
  },
});

export default PrivacySecurityScreen;
