import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { MessageCircle, Home } from 'lucide-react-native';

interface IncomingInterest {
  id: string;
  placeOwner: {
    id: string;
    name: string;
    image?: string;
  };
  place: {
    id: string;
    title: string;
    location: string;
    budget: string;
  };
  message?: string;
  timestamp: string;
  status: 'new' | 'read' | 'responded';
}

interface IncomingInterestSectionProps {
  interests: IncomingInterest[];
  navigate: (path: string) => void;
  showHeader?: boolean;
}

export const IncomingInterestSection: React.FC<IncomingInterestSectionProps> = ({
  interests,
  navigate,
  showHeader = true
}) => {
  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return time.toLocaleDateString();
  };

  const handleInterestPress = (interest: IncomingInterest) => {
    // Navigate to conversation with place owner
    navigate(`/conversation/place-${interest.place.id}-${interest.placeOwner.id}`);
  };

  const renderInterestItem = (interest: IncomingInterest, index: number) => (
    <TouchableOpacity
      key={interest.id}
      style={[
        styles.interestItem,
        interest.status === 'new' && styles.unreadItem
      ]}
      onPress={() => handleInterestPress(interest)}
    >
      <View style={styles.leftContent}>
        <Image
          source={{ uri: interest.placeOwner.image || 'https://via.placeholder.com/50' }}
          style={styles.profileImage}
        />
        <View style={styles.badgeContainer}>
          <Home size={14} color="#4F46E5" />
        </View>
      </View>
      
      <View style={styles.middleContent}>
        <View style={styles.headerRow}>
          <Text style={styles.ownerName} numberOfLines={1}>
            {interest.placeOwner.name}
          </Text>
          <Text style={styles.timestamp}>
            {formatTimeAgo(interest.timestamp)}
          </Text>
        </View>
        
        <Text style={styles.placeTitle} numberOfLines={1}>
          {interest.place.title}
        </Text>
        
        <View style={styles.detailsRow}>
          <Text style={styles.placeDetails} numberOfLines={1}>
            {interest.place.location} • {interest.place.budget}
          </Text>
        </View>
        
        {interest.message && (
          <Text style={styles.messagePreview} numberOfLines={2}>
            "{interest.message}"
          </Text>
        )}
      </View>
      
      <View style={styles.rightContent}>
        <MessageCircle 
          size={20} 
          color={interest.status === 'new' ? '#4F46E5' : '#9CA3AF'} 
        />
        {interest.status === 'new' && <View style={styles.newIndicator} />}
      </View>
    </TouchableOpacity>
  );

  if (interests.length === 0) {
    return (
      <View style={styles.container}>
        {showHeader && (
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Incoming Interest</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>0</Text>
            </View>
          </View>
        )}
        <View style={styles.emptyContainer}>
          <Home size={48} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>No incoming interest yet</Text>
          <Text style={styles.emptySubtitle}>
            Place owners will be able to reach out to you when they're interested in your profile
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {showHeader && (
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Incoming Interest</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{interests.length}</Text>
          </View>
        </View>
      )}
      
      <View style={styles.listContainer}>
        {interests.map(renderInterestItem)}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: 'Poppins-Bold',
    fontWeight: 'bold',
    color: '#1F2937',
  },
  countBadge: {
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  countText: {
    fontSize: 12,
    color: '#4F46E5',
    fontFamily: 'Poppins-SemiBold',
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  interestItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  unreadItem: {
    backgroundColor: '#F9FAFB',
  },
  leftContent: {
    position: 'relative',
    marginRight: 12,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F3F4F6',
  },
  badgeContainer: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 3,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  middleContent: {
    flex: 1,
    marginRight: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  ownerName: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#1F2937',
    flex: 1,
  },
  timestamp: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
  },
  placeTitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#4F46E5',
    marginBottom: 2,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  placeDetails: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
  },
  messagePreview: {
    fontSize: 13,
    color: '#4B5563',
    fontFamily: 'Poppins-Regular',
    fontStyle: 'italic',
    marginTop: 2,
  },
  rightContent: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  newIndicator: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default IncomingInterestSection;