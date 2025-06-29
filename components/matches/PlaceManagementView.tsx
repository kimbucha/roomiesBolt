import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useConversationsStore } from '../../hooks/useConversationsStore';
import { useSupabaseAuthStore } from '../../store/supabaseAuthStore';
import { useSupabaseUserStore } from '../../store/supabaseUserStore';
import { useSupabasePlaceInterestStore, PlaceInterestWithProfile } from '../../store/supabasePlaceInterestStore';
import { Home, Users, MessageCircle, Eye, MapPin, DollarSign } from 'lucide-react-native';
import { DynamicSectionList, DynamicSectionData } from './DynamicSectionList';
import { MATCHES_SECTION_STYLES } from './MatchesSectionStyles';
import { InterestedUserCard } from './InterestedUserCard';


interface PlaceListing {
  id: string;
  title: string;
  location: string;
  budget: string;
  roomType: string;
  images: string[];
  viewCount: number;
  interestedCount: number;
  status: 'active' | 'paused' | 'filled';
}

export const PlaceManagementView: React.FC = () => {
  const router = useRouter();
  const { conversations, fetchConversations } = useConversationsStore();
  const { user: authUser } = useSupabaseAuthStore();
  const { user } = useSupabaseUserStore(); // Get full user profile data
  const { getInterestedUsers, isLoading } = useSupabasePlaceInterestStore();
  
  const [interestedUsers, setInterestedUsers] = useState<PlaceInterestWithProfile[]>([]);
  const [myListings, setMyListings] = useState<PlaceListing[]>([]);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      // Only need user from userStore, not authUser
      if (!user) {
        console.log('[PlaceManagementView] Waiting for user data to load...');
        return;
      }
      
      // CRITICAL DEBUG: Log complete user data structure
      console.log('[PlaceManagementView] === USER DATA DEBUG ===');
      console.log('[PlaceManagementView] user.id:', user.id);
      console.log('[PlaceManagementView] user.userRole:', user.userRole);
      console.log('[PlaceManagementView] user.hasPlace:', user.hasPlace);
      console.log('[PlaceManagementView] user.placeDetails exists:', !!user.placeDetails);
      console.log('[PlaceManagementView] user.placeDetails:', user.placeDetails);
      console.log('[PlaceManagementView] user.onboardingCompleted:', user.onboardingCompleted);
      console.log('[PlaceManagementView] ========================');
      
      try {
        // Fetch conversations
        await fetchConversations();
        
        // Create listing from user's place details
        if (user.placeDetails && user.hasPlace) {
          const listing: PlaceListing = {
            id: user.id, // Use user ID as listing ID
            title: user.placeDetails.description || `${user.placeDetails.roomType} Room Available`,
            location: user.placeDetails.address || 'San Francisco, CA',
            budget: user.placeDetails.monthlyRent ? `$${user.placeDetails.monthlyRent}/month` : 'Contact for price',
            roomType: user.placeDetails.roomType === 'private' ? 'Private Room' : 
                     user.placeDetails.roomType === 'shared' ? 'Shared Room' : 'Studio',
            images: user.placeDetails.photos && user.placeDetails.photos.length > 0 ? 
                   user.placeDetails.photos : 
                   ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=300'], // Fallback image
            viewCount: 12, // Mock view count for now
            interestedCount: 3, // Mock interested count for now  
            status: 'active'
          };
          
          setMyListings([listing]);
          
          // Fetch interested users for this listing (or use mock data for demo)
          try {
            const users = await getInterestedUsers(listing.id);
            if (users.length === 0) {
              // Add mock interested users for demo purposes
              const mockUsers: PlaceInterestWithProfile[] = [
                {
                  interest: {
                    id: 'mock-1',
                    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
                    action: 'saved',
                    status: 'new'
                  },
                  userProfile: {
                    name: 'Sarah Chen',
                    age: 24,
                    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face',
                    university: 'UC Berkeley'
                  }
                },
                {
                  interest: {
                    id: 'mock-2', 
                    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
                    action: 'messaged',
                    status: 'new'
                  },
                  userProfile: {
                    name: 'Alex Rodriguez',
                    age: 26,
                    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
                    university: 'Stanford'
                  }
                },
                {
                  interest: {
                    id: 'mock-3',
                    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
                    action: 'saved',
                    status: 'read'
                  },
                  userProfile: {
                    id: 'jamie-kim-user-id',
                    name: 'Jamie Kim',
                    age: 23,
                    image: require('../../assets/images/personality/ENFP.png'),
                    university: 'UCSF'
                  }
                }
              ];
              setInterestedUsers(mockUsers);
            } else {
              setInterestedUsers(users);
            }
          } catch (error) {
            console.error('[PlaceManagementView] Error fetching interested users:', error);
            setInterestedUsers([]);
          }
        } else {
          // No place details yet, empty listings
          console.log('[PlaceManagementView] No place details found - user.placeDetails:', user.placeDetails, 'user.hasPlace:', user.hasPlace);
          setMyListings([]);
        }
        
      } catch (error) {
        console.error('[PlaceManagementView] Error loading data:', error);
      }
    };

    loadData();
  }, [user, fetchConversations, getInterestedUsers]);

  // Interested Users Section - Card Style UI
  const renderInterestedUsersSection = () => {
    const handleUserPress = (user: PlaceInterestWithProfile) => {
      // Navigate to conversation lobby similar to New Matches flow
      const conversationId = `place-${user.interest.id}`; // Use interest ID as conversation identifier
      router.push({
        pathname: `/conversation/${conversationId}` as any,
        params: { 
          source: 'placeInterest',
          placeId: myListings[0]?.id || 'default',
          interestedUserId: user.userProfile.id || user.interest.id,
          userName: user.userProfile.name,
          userImage: typeof user.userProfile.image === 'string' ? user.userProfile.image : 'require_object'
        }
      });
    };

    if (interestedUsers.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Users size={48} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>No interested users yet</Text>
          <Text style={styles.emptySubtitle}>
            Users who save your place will appear here. You can reach out to promising candidates.
          </Text>
        </View>
      );
    }

    // Convert PlaceInterestWithProfile to InterestedUserData format
    const interestedUserCards = interestedUsers
      .filter(item => item.interest.action === 'saved') // Only show saved users in this section
      .map((item) => ({
        id: item.interest.id,
        userId: item.userProfile.id,
        placeId: myListings[0]?.id || 'default', // Use first listing ID
        userName: item.userProfile.name,
        userImage: item.userProfile.image,
        userAge: item.userProfile.age,
        userUniversity: item.userProfile.university,
        createdAt: item.interest.created_at,
        status: item.interest.status,
        hasUnreadMessage: item.interest.status === 'new'
      }));

    return (
      <View style={styles.cardsContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cardsScrollContainer}
        >
          {interestedUserCards.map((userData) => (
            <InterestedUserCard
              key={userData.id}
              user={userData}
              onPress={() => handleUserPress(interestedUsers.find(u => u.interest.id === userData.id)!)}
              placeTitle={myListings[0]?.title}
              listingImage={myListings[0]?.images?.[0]}
            />
          ))}
        </ScrollView>
      </View>
    );
  };

  // My Listings Section
  const renderMyListingsSection = () => {
    const handleListingPress = (listing: PlaceListing) => {
      router.push(`/place-detail?id=${listing.id}`);
    };

    const handleEditListing = (listing: PlaceListing) => {
      router.push(`/edit-listing?id=${listing.id}`);
    };

    if (myListings.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Home size={48} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>No active listings</Text>
          <Text style={styles.emptySubtitle}>
            Create your first place listing to start finding roommates.
          </Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => router.push('/create-listing')}
          >
            <Text style={styles.createButtonText}>Create Listing</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.listContainer}>
        {myListings.map((listing) => (
          <View key={listing.id} style={styles.listingItem}>
            <TouchableOpacity 
              style={styles.listingContent}
              onPress={() => handleListingPress(listing)}
            >
              <Image
                source={{ uri: listing.images[0] }}
                style={styles.listingImage}
              />
              
              <View style={styles.listingInfo}>
                <Text style={styles.listingTitle} numberOfLines={1}>
                  {listing.title}
                </Text>
                
                <View style={styles.listingDetails}>
                  <MapPin size={14} color="#6B7280" />
                  <Text style={styles.listingLocation} numberOfLines={1}>
                    {listing.location}
                  </Text>
                </View>
                
                <View style={styles.listingDetails}>
                  <Text style={styles.listingBudget}>
                    {listing.budget}
                  </Text>
                </View>
                
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Eye size={12} color="#6B7280" />
                    <Text style={styles.statText}>{listing.viewCount}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Users size={12} color="#6B7280" />
                    <Text style={styles.statText}>{listing.interestedCount}</Text>
                  </View>
                  <View style={[
                    styles.statusBadge,
                    listing.status === 'active' ? styles.activeBadge : styles.pausedBadge
                  ]}>
                    <Text style={[
                      styles.statusText,
                      listing.status === 'active' ? styles.activeText : styles.pausedText
                    ]}>
                      {listing.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => handleEditListing(listing)}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  };

  // Messages Section - Show conversations with place context
  const renderMessagesSection = () => {
    // Include both conversations and messaged users from interested users
    const messagedUsers = interestedUsers.filter(item => item.interest.action === 'messaged');
    const totalConversations = conversations.length + messagedUsers.length;

    if (totalConversations === 0) {
      return (
        <View style={styles.emptyContainer}>
          <MessageCircle size={48} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>No conversations yet</Text>
          <Text style={styles.emptySubtitle}>
            Start conversations with interested users to find your perfect roommate.
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.listContainer}>
        {/* Show messaged users from place interests */}
        {messagedUsers.map((item) => (
          <TouchableOpacity
            key={`interest-${item.interest.id}`}
            style={[
              styles.conversationItem,
              item.interest.status === 'new' && styles.unreadItem
            ]}
            onPress={() => {
              const conversationId = `place-${item.interest.id}`;
              router.push({
                pathname: `/conversation/${conversationId}` as any,
                params: { 
                  source: 'placeMessages',
                  placeId: myListings[0]?.id || 'default',
                  interestedUserId: item.userProfile.id,
                  userName: item.userProfile.name,
                  userImage: item.userProfile.image
                }
              });
            }}
          >
            <View style={styles.leftContent}>
              <Image
                source={{ uri: item.userProfile.image || 'https://via.placeholder.com/50' }}
                style={styles.profileImage}
              />
              <View style={styles.listingBadgeContainer}>
                <Image
                  source={{ 
                    uri: myListings[0]?.images?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=300'
                  }}
                  style={styles.listingBadgeImage}
                />
              </View>
            </View>
            
            <View style={styles.conversationInfo}>
              <View style={styles.conversationHeader}>
                <Text style={styles.conversationName} numberOfLines={1}>
                  {item.userProfile.name}
                </Text>
                <Text style={styles.conversationTime}>
                  {new Date(item.interest.created_at).toLocaleTimeString([], { 
                    hour: 'numeric', 
                    minute: '2-digit' 
                  })}
                </Text>
              </View>
              
              {/* Show age and profession below name */}
              <Text style={styles.userSubtext} numberOfLines={1}>
                {item.userProfile.age ? `${item.userProfile.age} • ` : ''}{item.userProfile.university || 'Student'}
              </Text>
              
              {/* Show listing title */}
              <Text style={styles.listingTitle} numberOfLines={1}>
                {myListings[0]?.title || 'Beautiful private master w on suite...'}
              </Text>
              
              {/* Show message preview instead of interested text */}
              <Text style={[
                styles.lastMessage,
                item.interest.status === 'new' && styles.unreadMessagePreview
              ]} numberOfLines={1}>
                Hey! I saw your listing and I'm wondering what the next steps are?
              </Text>
            </View>
            
            {item.interest.status === 'new' && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>1</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
        
        {/* Show existing conversations */}
        {conversations.slice(0, 5).map((conversation) => (
          <TouchableOpacity
            key={conversation.id}
            style={styles.conversationItem}
            onPress={() => router.push(`/conversation/${conversation.id}`)}
          >
            <Image
              source={{ uri: 'https://via.placeholder.com/50' }}
              style={styles.profileImage}
            />
            <View style={styles.conversationInfo}>
              <View style={styles.conversationHeader}>
                <Text style={styles.conversationName} numberOfLines={1}>
                  {conversation.participants?.[0]?.name || 'User'}
                </Text>
                <Text style={styles.conversationTime}>
                  {conversation.lastMessage?.timestamp ? 
                    new Date(conversation.lastMessage.timestamp).toLocaleTimeString([], { 
                      hour: 'numeric', 
                      minute: '2-digit' 
                    }) : 'Now'
                  }
                </Text>
              </View>
              <Text style={styles.lastMessage} numberOfLines={1}>
                {conversation.lastMessage?.content || 'No messages yet'}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // Prepare sections for SectionList using the shared styles and structure
  const sections = useMemo(() => {
    return [
      {
        title: 'My Listings',
        count: myListings.length,
        data: [{ type: 'myListings' }],
        renderContent: renderMyListingsSection,
      },
      {
        title: 'Interested Users',
        count: interestedUsers.filter(item => item.interest.action === 'saved').length,
        data: [{ type: 'interestedUsers' }],
        renderContent: renderInterestedUsersSection,
      },
      {
        title: 'Messages',
        count: conversations.length + interestedUsers.filter(item => item.interest.action === 'messaged').length,
        data: [{ type: 'messages' }],
        renderContent: renderMessagesSection,
      },
    ] as DynamicSectionData[];
  }, [interestedUsers, myListings, conversations]);

  return (
    <DynamicSectionList
      sections={sections}
      isLoading={isLoading}
      error={null}
      loadingText="Loading place management..."
      errorText="Error loading data"
    />
  );
};

// Use shared styles for consistent section appearance
const styles = StyleSheet.create({
  // Keep only the component-specific styles, section styles come from MATCHES_SECTION_STYLES
  listContainer: {
    paddingHorizontal: 16,
  },
  // Card-style layout for Interested Users
  cardsContainer: {
    paddingVertical: 8,
  },
  cardsScrollContainer: {
    paddingHorizontal: 16,
    paddingRight: 32, // Extra padding on right for last card
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F3F4F6',
    marginRight: 12,
  },
  listingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  listingContent: {
    flexDirection: 'row',
    flex: 1,
  },
  listingImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    marginRight: 12,
  },
  listingInfo: {
    flex: 1,
  },
  listingTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#1F2937',
    marginBottom: 2,
  },
  listingDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  listingLocation: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
    marginLeft: 4,
    flex: 1,
  },
  listingBudget: {
    fontSize: 14,
    color: '#059669',
    fontFamily: 'Poppins-SemiBold',
    marginLeft: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  statText: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
    marginLeft: 2,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  activeBadge: {
    backgroundColor: '#D1FAE5',
  },
  pausedBadge: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 10,
    fontFamily: 'Poppins-SemiBold',
  },
  activeText: {
    color: '#059669',
  },
  pausedText: {
    color: '#DC2626',
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
  },
  editButtonText: {
    fontSize: 12,
    color: '#4F46E5',
    fontFamily: 'Poppins-SemiBold',
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    backgroundColor: '#FFFFFF',
  },
  unreadItem: {
    backgroundColor: '#F9FAFB',
  },
  leftContent: {
    position: 'relative',
    marginRight: 12,
  },
  badgeContainer: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 3,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  listingBadgeContainer: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 1,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  listingBadgeImage: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  conversationInfo: {
    flex: 1,
    marginRight: 8,
  },
  conversationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  conversationName: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#1F2937',
    flex: 1,
  },
  userSubtext: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
    marginBottom: 2,
  },
  listingTitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#6366F1',
    marginBottom: 2,
  },
  placeTitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#4F46E5',
    marginBottom: 2,
  },
  lastMessage: {
    fontSize: 13,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
    marginTop: 2,
  },
  unreadMessagePreview: {
    color: '#1F2937',
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  conversationTime: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'Poppins-Regular',
  },
  unreadBadge: {
    backgroundColor: '#6366F1',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    marginLeft: 8,
    marginTop: 2,
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: 'Poppins-Bold',
    fontWeight: 'bold',
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
  createButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#4F46E5',
    borderRadius: 8,
  },
  createButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: 'Poppins-SemiBold',
  },
});

export default PlaceManagementView;