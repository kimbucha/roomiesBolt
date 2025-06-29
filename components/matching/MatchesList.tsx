import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useMatchesStore, Match } from '../../store/matchesStore';
import { useSupabaseAuthStore } from '../../store/supabaseAuthStore';
import { useRoommateStore, RoommateProfile } from '../../store/roommateStore';
import { BlurView } from 'expo-blur';
import PremiumModal from '../premium/PremiumModal';
import { Lock } from 'lucide-react-native';

// Type definition for the pending like item
interface PendingLikeItem {
  userId: string;
  action: 'like' | 'superLike';
  timestamp: number;
}

const MatchesList: React.FC = () => {
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  
  const { user } = useSupabaseAuthStore();
  const { getMatches, getPendingLikes } = useMatchesStore();
  const { roommates } = useRoommateStore();
  
  const matches = getMatches();
  const pendingLikes = getPendingLikes().filter(item => item.action !== 'pass') as PendingLikeItem[];
  
  const getProfileById = (id: string): RoommateProfile | undefined => {
    return roommates.find((r: RoommateProfile) => r.id === id);
  };
  
  const renderPendingLikeItem = ({ item }: { item: PendingLikeItem }) => {
    const profile = getProfileById(item.userId);
    if (!profile) return null;
    
    const isPremium = user?.isPremium;
    
    return (
      <TouchableOpacity 
        style={styles.matchCard}
        onPress={() => {
          if (!isPremium) {
            setShowPremiumModal(true);
          } else {
            console.log('Navigate to profile of', profile.name);
          }
        }}
      >
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: profile.image }} 
            style={styles.profileImage} 
          />
          
          {!isPremium && (
            <>
              <BlurView intensity={70} tint="dark" style={StyleSheet.absoluteFill} />
              <View style={styles.premiumOverlay}>
                <View style={styles.likesContainer}>
                  <Text style={styles.likesCount}>2 likes</Text>
                  <Text style={styles.premiumText}>Premium</Text>
                </View>
              </View>
            </>
          )}
          
          {item.action === 'superLike' && (
            <View style={styles.superLikeBadge}>
              <Text style={styles.superLikeText}>★</Text>
            </View>
          )}
        </View>
        
        <Text style={styles.nameText}>
          {isPremium ? profile.name : '???'}
        </Text>
        
        <Text style={styles.statusText}>
          {item.action === 'superLike' ? 'Super Liked You!' : 'Liked You!'}
        </Text>
      </TouchableOpacity>
    );
  };
  
  const renderMatchItem = ({ item }: { item: Match }) => {
    const isUser1 = item.user1Id === user?.id;
    const matchedUserId = isUser1 ? item.user2Id : item.user1Id;
    const profile = getProfileById(matchedUserId);
    
    if (!profile) return null;
    
    let badgeText = '';
    if (item.status === 'superMatched') {
      badgeText = '★ Super Match!';
    } else if (item.status === 'mixedMatched') {
      badgeText = '⭐ Super Match!';
    }
    
    return (
      <TouchableOpacity 
        style={styles.matchCard}
        onPress={() => {
          // Navigate to conversation or profile
          console.log('Navigate to conversation with', profile.name);
        }}
      >
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: profile.image }} 
            style={styles.profileImage} 
          />
          
          {badgeText && (
            <View style={styles.matchBadge}>
              <Text style={styles.matchBadgeText}>{badgeText}</Text>
            </View>
          )}
        </View>
        
        <Text style={styles.nameText}>{profile.name}</Text>
        <Text style={styles.statusText}>
          {item.conversationId ? 'Message' : 'New Match!'}
        </Text>
      </TouchableOpacity>
    );
  };
  
  // Only show the "See who likes you" section to premium users or if there are likes to show
  const shouldShowPendingLikes = user?.isPremium || pendingLikes.length > 0;
  
  const handlePremiumUpgrade = async () => {
    // Handle premium upgrade using Supabase store
    const authStore = useSupabaseAuthStore.getState();
    await authStore.setPremiumStatus(true);
    
    // Also update matches store
    const matchesStore = useMatchesStore.getState();
    matchesStore.setPremiumStatus(true);
    
    setShowPremiumModal(false);
  };
  
  return (
    <View style={styles.container}>
      {shouldShowPendingLikes && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>People who like you</Text>
          <FlatList
            data={pendingLikes}
            renderItem={renderPendingLikeItem}
            keyExtractor={(item) => item.userId}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyStateContainer}>
                <Text style={styles.emptyStateText}>
                  {user?.isPremium 
                    ? "No one has liked you yet. Keep swiping!" 
                    : "Upgrade to Premium to see who likes you!"}
                </Text>
              </View>
            }
          />
        </View>
      )}
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your matches</Text>
        <FlatList
          data={matches}
          renderItem={renderMatchItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateText}>
                No matches yet. Start swiping to find matches!
              </Text>
            </View>
          }
        />
      </View>
      
      <PremiumModal
        visible={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        onUpgrade={handlePremiumUpgrade}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 16,
    marginBottom: 16,
    color: '#333',
    fontFamily: 'Poppins-SemiBold',
  },
  listContent: {
    paddingHorizontal: 16,
  },
  matchCard: {
    width: 160,
    marginRight: 16,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    padding: 8,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  superLikeBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#5e72e4',
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  superLikeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  matchBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(94, 114, 228, 0.9)',
    paddingVertical: 4,
    alignItems: 'center',
  },
  matchBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  nameText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    fontFamily: 'Poppins-SemiBold',
  },
  statusText: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
    marginBottom: 4,
  },
  emptyStateContainer: {
    width: 300,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  emptyStateText: {
    color: '#6B7280',
    fontSize: 14,
    textAlign: 'center',
    padding: 16,
    fontFamily: 'Poppins-Regular',
  },
  premiumOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  likesContainer: {
    alignItems: 'center',
  },
  likesCount: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    marginBottom: 4,
  },
  premiumText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    backgroundColor: 'rgba(79, 70, 229, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
});

export default MatchesList; 