import React from 'react';
import { View, Text } from 'react-native';
import { DynamicSectionData } from './DynamicSectionList';

// Import existing section components
const NewMatchesSection = require('./NewMatchesSection').default;
const SavedPlacesSection = require('./SavedPlacesSection').default;
const MessagesSection = require('./MessagesSection').default;
import MyListingsSection from './MyListingsSection';

// Section configuration interface
export interface SectionConfig {
  type: string;
  title: string;
  component: React.ComponentType<any>;
  getCount: (data: any) => number;
  getProps: (data: any, navigate: any) => any;
}

// Section registry with all available sections
export const SECTION_REGISTRY: Record<string, SectionConfig> = {
  newMatches: {
    type: 'newMatches',
    title: 'New Matches',
    component: NewMatchesSection,
    getCount: (data) => data.matches?.length || 0,
    getProps: (data, navigate) => ({
      matches: data.matches || [],
      pendingLikes: data.pendingLikes || [],
      isPremium: data.isPremium || false,
      onPremiumInfoRequest: data.onPremiumInfoRequest || (() => {}),
      navigate,
      showHeader: false,
      conversations: data.conversations || []
    })
  },
  
  savedPlaces: {
    type: 'savedPlaces',
    title: 'Saved Places',
    component: SavedPlacesSection,
    getCount: (data) => data.savedPlaces?.length || 0,
    getProps: (data, navigate) => ({
      savedPlaces: data.savedPlaces || [],
      navigate,
      showHeader: false
    })
  },
  
  messages: {
    type: 'messages',
    title: 'Messages',
    component: MessagesSection,
    getCount: (data) => data.conversations?.length || 0,
    getProps: (data, navigate) => ({
      conversations: data.conversations || [],
      getProfileById: data.getProfileById || (() => null),
      navigate,
      showHeader: false,
      hasNewMatches: data.hasNewMatches || false,
      fetchConversations: data.fetchConversations || (() => Promise.resolve())
    })
  },
  
  myListings: {
    type: 'myListings',
    title: 'My Listings',
    component: MyListingsSection,
    getCount: (data) => data.myListings?.length || 0,
    getProps: (data, navigate) => ({
      navigate,
      showHeader: false
    })
  }
};

// Role-based section configurations
export const ROLE_SECTIONS = {
  roommate_seeker: ['newMatches', 'savedPlaces', 'messages'],
  place_lister: ['newMatches', 'myListings', 'messages'],
  default: ['newMatches', 'savedPlaces', 'messages'] // Fallback for users without clear role
};

// Function to build sections dynamically
export function buildSections(
  sectionKeys: string[],
  data: any,
  navigate: any
): DynamicSectionData[] {
  return sectionKeys
    .filter(key => SECTION_REGISTRY[key]) // Only include registered sections
    .map(key => {
      const config = SECTION_REGISTRY[key];
      const Component = config.component;
      const count = config.getCount(data);
      const props = config.getProps(data, navigate);
      
      return {
        title: config.title,
        count,
        data: [{ type: config.type }],
        renderContent: () => React.createElement(Component, props)
      };
    });
}