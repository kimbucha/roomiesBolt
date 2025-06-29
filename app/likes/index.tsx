import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { ArrowLeft, Heart, Star } from 'lucide-react-native';
import { useMatchesStore } from '../../store/matchesStore';
import { useRoommateStore } from '../../store/roommateStore';

export default function ViewLikesScreen() {
  const router = useRouter();
  const { isPremium, getPendingLikes } = useMatchesStore();
  const { roommates } = useRoommateStore();
  const [pendingLikes, setPendingLikes] = useState<any[]>([]);

  useEffect(() => {
    // Check if user is premium
    if (!isPremium) {
      // If not premium, redirect back to matches
      router.replace('/');
      return;
    }
    
    // Get all pending likes
    const allPendingLikes = getPendingLikes();
    setPendingLikes(allPendingLikes);
  }, [isPremium]);

  // Get profile by ID
  const getProfileById = (id: string) => {
    return roommates.find(r => r.id === id);
  };

  // Render a person who liked you
  const renderLikeItem = ({ item }: { item: any }) => {
    const profile = getProfileById(item.userId);
    if (!profile) return null;

    // Determine if there's a super like
    const hasSuperLike = item.action === 'superLike';
    
    // Get match percentage (hardcoded for now)
    const matchPercentage = '75%';

    return (
      <TouchableOpacity 
        style={styles.likeCard}
        onPress={() => router.push(`/conversation/${item.userId}`)}
        activeOpacity={0.7}
      >
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: profile.image }}
            style={styles.profileImage}
            resizeMode="cover"
          />
          {hasSuperLike && (
            <View style={styles.superLikeBadge}>
              <Star size={16} color="#FFFFFF" />
            </View>
          )}
        </View>
        
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{profile.name}</Text>
          <Text style={styles.profileDetails}>{profile.age} • {profile.location}</Text>
          
          <View style={styles.matchContainer}>
            <View style={styles.matchBadge}>
              <Text style={styles.matchText}>{matchPercentage} Match</Text>
            </View>
            
            <Text style={styles.likedText}>
              Liked you {item.timestamp ? new Date(item.timestamp).toLocaleDateString() : 'recently'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>People Who Like You</Text>
        </View>

        <View style={styles.content}>
          {pendingLikes.length > 0 ? (
            <FlatList
              data={pendingLikes}
              renderItem={renderLikeItem}
              keyExtractor={(item, index) => `like-${item.userId}-${index}`}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <Heart size={40} color="#D1D5DB" />
              </View>
              <Text style={styles.emptyTitle}>No Likes Yet</Text>
              <Text style={styles.emptyText}>
                Keep swiping to get more visibility and increase your chances of matching!
              </Text>
            </View>
          )}
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#1F2937',
  },
  content: {
    flex: 1,
    paddingTop: 16,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  likeCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  superLikeBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#4F46E5',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#1F2937',
  },
  profileDetails: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
    marginBottom: 8,
  },
  matchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  matchBadge: {
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 8,
    marginBottom: 4,
  },
  matchText: {
    fontSize: 12,
    color: '#4F46E5',
    fontFamily: 'Poppins-Medium',
  },
  likedText: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
    textAlign: 'center',
  },
}); 