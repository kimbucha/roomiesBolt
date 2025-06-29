import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import EnhancedAvatar from '../../components/EnhancedAvatar';
import Badge from '../../components/Badge';  // Adjust path if necessary
import { Check } from 'lucide-react-native';
import { User } from '../../store/userStore'; // Import User type

interface ProfileSummaryProps {
  userProfile: User | null;
  compatibilityScore: number | null;
}

const ProfileSummary: React.FC<ProfileSummaryProps> = ({
  userProfile,
  compatibilityScore,
}) => {
  if (!userProfile) return null; // Don't render if no profile

  return (
    <View style={styles.profileSummaryContainer}>
      <View style={styles.avatarContainer}>
        <EnhancedAvatar 
          user={userProfile}
          size="xxl"
          variant="circle"
          style={styles.avatar} 
        />
      </View> 
      
      <View style={styles.headerTextContainer}>
        <View style={styles.nameContainer}>
            <Text style={styles.nameText}>{userProfile.name}</Text>
            {userProfile.isVerified && (
              <Badge 
                label="Verified"
                variant="success"
                size="small"
                leftIcon={<Check size={12} color="#10B981" />}
                style={styles.verifiedBadgeStyle} 
              />
            )}
        </View>
        <Text style={styles.detailsText}>
          {userProfile.university}{userProfile.major ? ` - ${userProfile.major}` : ''}{userProfile.year ? ` (${userProfile.year})` : ''}
        </Text>
      </View>

      {compatibilityScore !== null && (
        <Badge
          label={`${compatibilityScore}% Match`}
          variant="primary"
          size="medium"
          style={styles.scoreBadgeStyle} 
        />
      )}
    </View>
  );
};

// Copy relevant styles from UserProfileScreen.styles
const styles = StyleSheet.create({
  profileSummaryContainer: {
    paddingTop: 20,
    paddingBottom: 15, 
    paddingHorizontal: 20,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  avatarContainer: {
     marginBottom: 15,
     shadowColor: '#000',
     shadowOffset: { width: 0, height: 1 },
     shadowOpacity: 0.08,
     shadowRadius: 2,
     elevation: 1,
  },
  avatar: { 
     width: 120, 
     height: 120, 
     borderRadius: 60,
     borderWidth: 0,
     backgroundColor: 'transparent',
  },
  headerTextContainer: {
    alignItems: 'center',
    marginBottom: 5, 
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  verifiedBadgeStyle: { 
    marginLeft: 8, 
  },
  detailsText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  scoreBadgeStyle: { 
    position: 'absolute',
    top: 15, 
    left: 15,
  },
});

export default ProfileSummary; 