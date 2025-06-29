import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView, Dimensions, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ArrowLeft, Shield } from 'lucide-react-native';
import { ScrollableContainer } from '../components/layout';

// Get screen dimensions
const { width } = Dimensions.get('window');

// Mock data for demo
const MATCHES_DATA = [
  { id: '1', name: 'Alex', image: 'https://randomuser.me/api/portraits/men/32.jpg' },
  { id: '2', name: 'Jamie', image: 'https://randomuser.me/api/portraits/women/44.jpg' },
  { id: '3', name: 'Taylor', image: 'https://randomuser.me/api/portraits/women/62.jpg' },
  { id: '4', name: 'Jordan', image: 'https://randomuser.me/api/portraits/men/22.jpg' },
  { id: '5', name: 'Morgan', image: 'https://randomuser.me/api/portraits/women/55.jpg' },
];

const SAVED_PLACES_DATA = [
  {
    id: '1',
    type: 'Private',
    price: '$1200-1500',
    location: 'Palo Alto',
    neighborhood: 'Downtown',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750',
  },
  {
    id: '2',
    type: 'Studio',
    price: '$1000-1300',
    location: 'San Francisco',
    neighborhood: 'Mission District',
    image: 'https://images.unsplash.com/photo-1560448204-603b3fc33ddc',
  },
  {
    id: '3',
    type: 'Shared',
    price: '$800-1100',
    location: 'Mountain View',
    neighborhood: 'Shoreline West',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267',
  },
];

const MESSAGES_DATA = [
  {
    id: '1',
    name: 'Alex Chen',
    message: 'Hey, just checking in. How\'s your apartment search going?',
    time: '12:30 PM',
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    id: '2',
    name: 'Jamie Smith',
    message: 'I found a great place in downtown that might work for both of us!',
    time: '10:15 AM',
    image: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
  {
    id: '3',
    name: 'Taylor Richards',
    message: 'Are you free to check out the apartment this weekend?',
    time: 'Yesterday',
    image: 'https://randomuser.me/api/portraits/women/22.jpg',
  },
  {
    id: '4',
    name: 'Jordan Lee',
    message: 'Just sent you the listing for that place near the park.',
    time: 'Yesterday',
    image: 'https://randomuser.me/api/portraits/men/42.jpg',
  },
  {
    id: '5',
    name: 'Casey Morgan',
    message: 'Did you see the photos I sent of the living room?',
    time: 'Monday',
    image: 'https://randomuser.me/api/portraits/women/33.jpg',
  },
];

export default function HomeStickyDemoScreen() {
  const router = useRouter();
  
  // Render sections
  const renderMatchesSection = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false} 
      style={styles.horizontalScroll}
      contentContainerStyle={styles.matchesContainer}
    >
      {MATCHES_DATA.map((match) => (
        <TouchableOpacity key={match.id} style={styles.matchCard}>
          <Image source={{ uri: match.image }} style={styles.matchImage} />
          <Text style={styles.matchName}>{match.name}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
  
  const renderPlacesSection = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false} 
      style={styles.horizontalScroll}
      contentContainerStyle={styles.placesContainer}
    >
      {SAVED_PLACES_DATA.map((place) => (
        <View key={place.id} style={styles.placeCard}>
          <Image source={{ uri: place.image }} style={styles.placeImage} />
          <View style={styles.placeType}>
            <Text style={styles.placeTypeText}>{place.type}</Text>
          </View>
          <View style={styles.placeDetails}>
            <Text style={styles.placePrice}>{place.price}</Text>
            <View style={styles.locationContainer}>
              <Text style={styles.placeLocation}>
                {place.location} • <Text style={styles.placeNeighborhood}>{place.neighborhood}</Text>
              </Text>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
  
  const renderMessagesSection = () => (
    <View style={styles.messagesContainer}>
      {MESSAGES_DATA.map((message) => (
        <TouchableOpacity key={message.id} style={styles.messageRow}>
          <Image source={{ uri: message.image }} style={styles.messageAvatar} />
          <View style={styles.messageContent}>
            <Text style={styles.messageName}>{message.name}</Text>
            <Text style={styles.messageText} numberOfLines={1}>{message.message}</Text>
          </View>
          <Text style={styles.messageTime}>{message.time}</Text>
        </TouchableOpacity>
      ))}
      
      <TouchableOpacity style={styles.viewAllButton}>
        <Text style={styles.viewAllText}>View All Messages</Text>
      </TouchableOpacity>
    </View>
  );
  
  // Define sections for ScrollableContainer
  const sections = [
    {
      title: 'New Matches',
      data: renderMatchesSection(),
      count: MATCHES_DATA.length,
    },
    {
      title: 'Saved Places',
      data: renderPlacesSection(),
      count: SAVED_PLACES_DATA.length,
    },
    {
      title: 'Messages',
      data: renderMessagesSection(),
      count: MESSAGES_DATA.length,
    },
  ];
  
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ 
        headerShown: false,
      }}/>
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.logoText}>
          <Text style={[styles.logoText, { color: '#4F46E5' }]}>r</Text>
          oomies
        </Text>
        <TouchableOpacity style={styles.iconButton}>
          <Shield size={24} color="#1F2937" />
        </TouchableOpacity>
      </View>
      
      <ScrollableContainer
        sections={sections}
        stickyBackgroundColor="#FFF"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
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
  backButton: {
    padding: 8,
  },
  iconButton: {
    padding: 8,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  
  // Horizontal scroll
  horizontalScroll: {
    paddingVertical: 8,
  },
  
  // Match cards styles
  matchesContainer: {
    paddingHorizontal: 16,
    gap: 16,
  },
  matchCard: {
    alignItems: 'center',
    marginRight: 16,
  },
  matchImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  matchName: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    color: '#1F2937',
    textAlign: 'center',
  },
  
  // Place cards styles
  placesContainer: {
    paddingHorizontal: 16,
  },
  placeCard: {
    width: 200,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    marginRight: 16,
  },
  placeImage: {
    width: '100%',
    height: 120,
  },
  placeType: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#4F46E5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  placeTypeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  placeDetails: {
    padding: 12,
  },
  placePrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  placeLocation: {
    fontSize: 12,
    color: '#6B7280',
  },
  placeNeighborhood: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  
  // Message styles
  messagesContainer: {
    padding: 16,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  messageAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  messageContent: {
    flex: 1,
  },
  messageName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    color: '#6B7280',
  },
  messageTime: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 8,
  },
  viewAllButton: {
    marginTop: 16,
    paddingVertical: 12,
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
  },
}); 