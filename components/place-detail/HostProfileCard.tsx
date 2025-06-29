import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { CheckCircle, Star, Shield } from 'lucide-react-native';

interface HostProfileCardProps {
  host: {
    id: string;
    name: string;
    avatar: string;
    verified: boolean;
    rating?: number;
    responseTime?: string;
  };
  joinDate: string;
  responseRate: number;
  onViewProfile?: () => void;
}

export const HostProfileCard: React.FC<HostProfileCardProps> = ({
  host,
  joinDate,
  responseRate,
  onViewProfile
}) => {
  // Calculate compatibility score based on response rate
  const compatibilityScore = Math.min(responseRate, 100);
  
  const getCompatibilityColor = (score: number) => {
    if (score >= 90) return '#10B981'; // Green for excellent match
    if (score >= 75) return '#6366F1'; // Purple for good match
    if (score >= 60) return '#F59E0B'; // Amber for moderate match
    return '#6B7280'; // Gray for lower match
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>About the Host</Text>
        {onViewProfile && (
          <TouchableOpacity 
            onPress={onViewProfile}
            style={styles.viewProfileButton}
            activeOpacity={0.7}
          >
            <Text style={styles.viewProfileText}>View Profile</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.profileContainer}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: host.avatar }} style={styles.profileImage} />
          {host.verified && (
            <View style={styles.verificationBadge}>
              <CheckCircle size={14} color="#FFFFFF" fill="#10B981" />
            </View>
          )}
        </View>
        
        <View style={styles.profileInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.nameText}>{host.name}</Text>
            {host.verified && (
              <View style={styles.verifiedPill}>
                <CheckCircle size={14} color="#10B981" />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            )}
          </View>
          
          <View style={styles.universityRow}>
            <Shield size={14} color="#6B7280" />
            <Text style={styles.universityText}>Member since {joinDate}</Text>
          </View>
          
          <View style={styles.compatibilityContainer}>
            <View style={styles.compatibilityHeader}>
              <Star size={14} color={getCompatibilityColor(compatibilityScore)} />
              <Text style={[
                styles.compatibilityLabel,
                { color: getCompatibilityColor(compatibilityScore) }
              ]}>
                Response Rate
              </Text>
              <Text style={[
                styles.compatibilityScore,
                { color: getCompatibilityColor(compatibilityScore) }
              ]}>
                {compatibilityScore}%
              </Text>
            </View>
            <View style={styles.compatibilityBarContainer}>
              <View style={styles.compatibilityBar}>
                <View 
                  style={[
                    styles.compatibilityFill, 
                    { width: `${compatibilityScore}%`, backgroundColor: getCompatibilityColor(compatibilityScore) }
                  ]} 
                />
              </View>
            </View>
          </View>
        </View>
      </View>
      
      {(host.rating !== undefined || host.responseTime !== undefined) && (
        <View style={styles.statsContainer}>
          {host.rating !== undefined && (
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{host.rating.toFixed(1)}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
          )}
          {host.rating !== undefined && host.responseTime !== undefined && (
            <View style={styles.statDivider} />
          )}
          {host.responseTime !== undefined && (
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{host.responseTime}</Text>
              <Text style={styles.statLabel}>Response Time</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  viewProfileButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
  },
  viewProfileText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
  },
  profileContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: '#F3F4F6',
  },
  verificationBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#10B981',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  nameText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginRight: 8,
  },
  verifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
    marginLeft: 4,
  },
  universityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  universityText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 6,
  },
  compatibilityContainer: {
    marginTop: 4,
  },
  compatibilityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  compatibilityLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
    flex: 1,
  },
  compatibilityScore: {
    fontSize: 14,
    fontWeight: '700',
  },
  compatibilityBarContainer: {
    height: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 5,
    overflow: 'hidden',
  },
  compatibilityBar: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 5,
  },
  compatibilityFill: {
    height: '100%',
    borderRadius: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
    marginTop: 8,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },
  traitsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  traitBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  traitText: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
  }
});

export default HostProfileCard; 