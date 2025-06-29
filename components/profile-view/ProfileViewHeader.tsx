import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Platform } from 'react-native';
import { MessageCircle, MoreHorizontal } from 'lucide-react-native';
import Constants from 'expo-constants';

interface ProfileViewHeaderProps {
  onSendMessage: () => void;
  onMoreOptions: () => void;
}

const ProfileViewHeader: React.FC<ProfileViewHeaderProps> = ({
  onSendMessage,
  onMoreOptions,
}) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.logoText}>roomies</Text>
        <View style={styles.actionsContainer}>
          <TouchableOpacity onPress={onSendMessage} style={styles.actionButton}>
            <MessageCircle size={24} color="#4F46E5" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onMoreOptions} style={styles.actionButton}>
            <MoreHorizontal size={24} color="#4F46E5" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#FFFFFF', // Match background or make transparent
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? Constants.statusBarHeight + 10 : 10, // Adjust top padding
    paddingBottom: 10,
    height: Platform.OS === 'android' ? 56 + Constants.statusBarHeight : 56, // Standard header height
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4F46E5', // Theme color
    // Add font family if needed: fontFamily: 'Poppins-Bold'
  },
  actionsContainer: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
});

export default ProfileViewHeader; 