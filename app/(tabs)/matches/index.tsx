import React from 'react';
import { useSupabaseUserStore } from '../../../store/supabaseUserStore';
import UniversalRoommateMatchesView from '../../../components/matches/UniversalRoommateMatchesView';
import PlaceManagementView from '../../../components/matches/PlaceManagementView';

export default function MatchesScreen() {
  const { user } = useSupabaseUserStore();
  
  // Route to appropriate matches view based on user role
  if (user?.userRole === 'place_lister' && user?.hasPlace) {
    return <PlaceManagementView />;
  }
  
  // Default to universal roommate seeker view for all other users
  return <UniversalRoommateMatchesView />;
}