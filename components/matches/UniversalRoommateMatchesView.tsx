import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useConversationsStore } from '../../hooks/useConversationsStore';
import { useSupabaseMatchesStore } from '../../store/supabaseMatchesStore';
import { useRoommateStore, RoommateProfile } from '../../store/roommateStore';
import { useSupabaseAuthStore } from '../../store/supabaseAuthStore';
import { useSupabaseUserStore } from '../../store/supabaseUserStore';
import { useUserStore } from '../../store/userStore';
import { useSupabasePlaceInterestStore } from '../../store/supabasePlaceInterestStore';
import { ProfileWithMatch, PendingLikeWithProfile } from './NewMatchesSection';
import { DynamicSectionList } from './DynamicSectionList';
import { buildSections, ROLE_SECTIONS } from './SectionRegistry';


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

export const UniversalRoommateMatchesView: React.FC = () => {
  const router = useRouter();
  const { conversations, fetchConversations } = useConversationsStore();
  const { 
    getMatchesWithProfiles,
    getPendingLikesWithProfiles,
    isPremium, 
    isLoading,
    error
  } = useSupabaseMatchesStore();
  
  // Get saved places from the roommate store
  const { getSavedPlaces } = useRoommateStore();
  const [savedPlaces, setSavedPlaces] = useState<RoommateProfile[]>([]);
  
  // Mock incoming interests for now (will be replaced with real data)
  const [incomingInterests, setIncomingInterests] = useState<IncomingInterest[]>([]);
  
  // Get user from Supabase user store for profile data, auth store for auth only
  const { user: authUser } = useSupabaseAuthStore();
  const { user } = useSupabaseUserStore();
  const regularUser = useUserStore((state) => state.user);
  
  // Debug user object on mount and when it changes
  useEffect(() => {
    console.log('[UniversalRoommateMatchesView] User object changed:');
    console.log('- User exists:', !!user);
    console.log('- User email:', user?.email);
    console.log('- User name:', user?.name);
    console.log('- User role:', user?.userRole);
    console.log('- Full user object keys:', user ? Object.keys(user) : 'no user');
  }, [user]);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      if (!authUser) return;
      
      try {
        // Get saved places
        const places = getSavedPlaces();
        setSavedPlaces(places);
        
        // Fetch conversations
        await fetchConversations();
        
        // TODO: Fetch incoming interests from place interest store
        // For now, using mock data
        setIncomingInterests([
          {
            id: '1',
            placeOwner: {
              id: 'owner1',
              name: 'Sarah Wilson',
              image: 'https://images.unsplash.com/photo-1494790108755-2616b9a1453d?w=150'
            },
            place: {
              id: 'place1',
              title: 'Cozy 2BR in Mission District',
              location: 'Mission District, SF',
              budget: '$1,800/month'
            },
            message: 'Hi! I saw your profile and think you would be a great fit for our place. Would love to chat!',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
            status: 'new'
          },
          {
            id: '2',
            placeOwner: {
              id: 'owner2',
              name: 'Mike Johnson',
              image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
            },
            place: {
              id: 'place2',
              title: 'Modern Studio Near Campus',
              location: 'Berkeley, CA',
              budget: '$1,200/month'
            },
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
            status: 'read'
          }
        ]);
        
      } catch (error) {
        console.error('[UniversalRoommateMatchesView] Error loading data:', error);
      }
    };

    loadData();
  }, [user, getSavedPlaces, fetchConversations]);

  // Get matches and pending likes with profiles
  const rawMatchesWithProfiles = getMatchesWithProfiles();
  const rawPendingLikesWithProfiles = getPendingLikesWithProfiles();

  // Transform matches to include full RoommateProfile (simplified from original)
  const matchesWithProfiles = useMemo(() => {
    return rawMatchesWithProfiles.map((matchItem) => ({
      match: matchItem.match,
      profile: matchItem.profile as RoommateProfile
    }));
  }, [rawMatchesWithProfiles]);

  // Transform pending likes (simplified from original)
  const pendingLikesWithProfiles = useMemo(() => {
    return rawPendingLikesWithProfiles.map(likeItem => ({
      action: likeItem.action,
      profile: likeItem.profile as RoommateProfile,
      timestamp: likeItem.timestamp
    }));
  }, [rawPendingLikesWithProfiles]);

  // Filter new matches (those without conversations)
  const newMatchesOnly = useMemo(() => {
    return matchesWithProfiles.filter((matchItem) => {
      const matchId = matchItem.match.id;
      const conversationId = matchItem.match.conversationId;
      
      // Check if there's a conversation for this match
      const conversation = conversations.find(c => 
        c.id === matchId || 
        c.id === conversationId ||
        c.match_id === matchId || 
        (c as any).matchId === matchId
      );
      
      // If there's no conversation or no messages yet, keep it in new matches
      return !conversation;
    });
  }, [matchesWithProfiles, conversations]);

  // Prepare section data for dynamic sections
  const sectionData = useMemo(() => {
    const userRole = user?.userRole || 'roommate_seeker';
    const hasNewMatches = newMatchesOnly.length > 0;
    
    // Create mock data for place listers
    let mockMatches = newMatchesOnly;
    let mockConversations = conversations;
    
    if (userRole === 'place_lister') {
      // Get real listing data from user stores
      const placeData = regularUser?.placeDetails || user?.placeDetails;
      const realLocation = placeData?.address || user?.location?.city || user?.location?.address || '123 Main St';
      const realPrice = placeData?.monthlyRent ? `$${placeData.monthlyRent}/month` : '$1200/month';
      const realTitle = placeData && placeData.bedrooms && placeData.bathrooms 
        ? `${placeData.bedrooms}bd ${placeData.bathrooms}ba in ${realLocation.split(',')[0]}`
        : '2bd 1ba in Mission District';
      
      // For local file paths, we need to use a placeholder for the badge
      const firstPhoto = placeData?.photos && placeData.photos.length > 0 ? placeData.photos[0] : null;
      const isLocalFile = firstPhoto && firstPhoto.startsWith('file://');
      const realListingImage = isLocalFile 
        ? 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=150&h=150&fit=crop' // Use placeholder for local files in badges
        : (firstPhoto || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=150&h=150&fit=crop');

      // Mock interested users for place listers
      mockMatches = [
        {
          match: {
            id: 'match-sarah-001',
            user1Id: authUser?.id || 'current-user',
            user2Id: 'sarah-wilson-001',
            user1Action: 'like',
            user2Action: 'like',
            status: 'active',
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
            conversationId: 'conv-sarah-001'
          },
          profile: {
            id: 'sarah-wilson-001',
            name: 'Sarah Wilson',
            image: 'https://images.unsplash.com/photo-1494790108755-2616b9a1453d?w=150&h=150&fit=crop&crop=face',
            age: 24,
            university: 'UCSF',
            major: 'Medicine',
            bio: 'Medical student looking for a quiet place to study',
            lookingFor: 'place',
            hasPlace: false
          }
        },
        {
          match: {
            id: 'match-mike-002',
            user1Id: authUser?.id || 'current-user',
            user2Id: 'mike-johnson-002',
            user1Action: 'like',
            user2Action: 'like',
            status: 'active',
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
            conversationId: 'conv-mike-002'
          },
          profile: {
            id: 'mike-johnson-002',
            name: 'Mike Johnson',
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
            age: 28,
            university: 'UC Berkeley',
            major: 'Engineering',
            bio: 'Software engineer, clean and responsible',
            lookingFor: 'place',
            hasPlace: false
          }
        }
      ];
      
      // Mock conversations for place listers with place context
      mockConversations = [
        {
          id: 'conv-sarah-001',
          match_id: 'match-sarah-001',
          participants: [
            { id: 'current-user', name: 'You', avatar: user?.profilePicture },
            { id: 'sarah-wilson-001', name: 'Sarah Wilson', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b9a1453d?w=150&h=150&fit=crop&crop=face' }
          ],
          lastMessage: {
            content: 'Hi! I saw your listing and think it would be perfect for my studies. Would love to chat!',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            senderId: 'sarah-wilson-001'
          },
          unreadCount: 1,
          hasUnreadMessages: true,
          updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          contextTitle: realTitle,
          contextLocation: realLocation,
          contextBudget: realPrice,
          contextListingImage: realListingImage
        },
        {
          id: 'conv-mike-002',
          match_id: 'match-mike-002',
          participants: [
            { id: 'current-user', name: 'You', avatar: user?.profilePicture },
            { id: 'mike-johnson-002', name: 'Mike Johnson', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' }
          ],
          lastMessage: {
            content: 'Thanks for accepting my interest! When would be a good time to schedule a viewing?',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            senderId: 'mike-johnson-002'
          },
          unreadCount: 0,
          hasUnreadMessages: false,
          updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          contextTitle: realTitle,
          contextLocation: realLocation,
          contextBudget: realPrice,
          contextListingImage: realListingImage
        }
      ];
    }
    
    return {
      matches: mockMatches,
      pendingLikes: pendingLikesWithProfiles,
      isPremium,
      onPremiumInfoRequest: () => {},
      savedPlaces,
      incomingInterests,
      conversations: mockConversations,
      getProfileById: () => null, // Simplified for now
      hasNewMatches: mockMatches.length > 0,
      fetchConversations
    };
  }, [newMatchesOnly, pendingLikesWithProfiles, isPremium, savedPlaces, incomingInterests, conversations, fetchConversations, user, regularUser]);
  
  // Build sections dynamically using section registry
  const sections = useMemo(() => {
    const userRole = user?.userRole || 'roommate_seeker';
    const sectionKeys = ROLE_SECTIONS[userRole] || ROLE_SECTIONS.default;
    
    // Debug logging
    console.log('[UniversalRoommateMatchesView] Building sections with:');
    console.log('- User:', user?.email, user?.name);
    console.log('- User role:', userRole);
    console.log('- Available ROLE_SECTIONS:', Object.keys(ROLE_SECTIONS));
    console.log('- Section keys for role:', sectionKeys);
    console.log('- Will build sections:', sectionKeys);
    
    return buildSections(sectionKeys, sectionData, router.push);
  }, [sectionData, router.push, user?.userRole, user?.email, user?.name]);

  return (
    <DynamicSectionList
      sections={sections}
      isLoading={isLoading && matchesWithProfiles.length === 0}
      error={error}
      loadingText="Loading matches..."
      errorText="Error loading matches"
    />
  );
};


export default UniversalRoommateMatchesView;