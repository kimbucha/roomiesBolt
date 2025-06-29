import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ArrowLeft, Shield } from 'lucide-react-native';
import { ScrollableContainer } from '../components/layout';

// Get screen dimensions
const { width, height } = Dimensions.get('window');

// Mock data for the demo with more items to ensure scrolling
const MATCHES_DATA = [
  { id: '1', name: 'Alex', image: 'https://randomuser.me/api/portraits/men/32.jpg' },
  { id: '2', name: 'Jamie', image: 'https://randomuser.me/api/portraits/women/44.jpg' },
  { id: '3', name: 'Premium', image: 'https://randomuser.me/api/portraits/lego/1.jpg', premium: true },
  { id: '4', name: 'Sofia', image: 'https://randomuser.me/api/portraits/women/33.jpg' },
  { id: '5', name: 'Marcus', image: 'https://randomuser.me/api/portraits/men/22.jpg' },
];

const SAVED_PLACES_DATA = [
  {
    id: '1',
    type: 'Private',
    price: '$1200-1500',
    location: 'Palo Alto',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750',
  },
  {
    id: '2',
    type: 'Studio',
    price: '$1000-1300',
    location: 'San Francisco',
    image: 'https://images.unsplash.com/photo-1560448204-603b3fc33ddc',
  },
  {
    id: '3',
    type: 'Shared',
    price: '$800-1100',
    location: 'Mountain View',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267',
  },
  {
    id: '4',
    type: 'Apartment',
    price: '$1500-1700',
    location: 'San Jose',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688',
  },
];

const MESSAGES_DATA = Array(10).fill(0).map((_, index) => ({
  id: `${index + 1}`,
  name: [
    'Alex Chen', 
    'Jamie Smith', 
    'Taylor Richards', 
    'Jordan Lee', 
    'Sam Wilson',
    'Morgan Taylor',
    'Riley Jackson',
    'Casey Brown',
    'Quinn Lopez',
    'Avery Martinez'
  ][index],
  message: [
    'Hey, just checking in. How\'s your apartment search going?',
    'I found a great place in downtown that might work for both of us!',
    'Are you free to check out the apartment this weekend?',
    'What did you think of the place we saw yesterday?',
    'I just submitted our application for the apartment!',
    'The landlord said we can move in next week!',
    'Do you have any furniture you\'re bringing?',
    'Should we split the security deposit 50/50?',
    'I found some great deals on furniture at IKEA',
    'When are you planning to move your stuff in?'
  ][index],
  time: index < 3 ? `${12 - index}:${30 - index * 5} PM` : 'Yesterday',
  image: `https://randomuser.me/api/portraits/${index % 2 === 0 ? 'men' : 'women'}/${30 + index}.jpg`,
  matchPercentage: 65 + (index * 3),
}));

// Component for match cards
const MatchCard = ({ match }: { match: typeof MATCHES_DATA[0] }) => (
  <View style={styles.matchCard}>
    <View style={styles.matchImageContainer}>
      <Image source={{ uri: match.image }} style={styles.matchImage} />
      {match.premium && (
        <View style={styles.premiumBadge}>
          <Text style={styles.premiumText}>Premium</Text>
        </View>
      )}
    </View>
    <Text style={styles.matchName}>{match.name}</Text>
  </View>
);

// Component for place cards
const PlaceCard = ({ place }: { place: typeof SAVED_PLACES_DATA[0] }) => (
  <View style={styles.placeCard}>
    <Image source={{ uri: place.image }} style={styles.placeImage} />
    <View style={styles.placeType}>
      <Text style={styles.placeTypeText}>{place.type}</Text>
    </View>
    <View style={styles.placeDetails}>
      <Text style={styles.placePrice}>{place.price}</Text>
      <View style={styles.locationContainer}>
        <Text style={styles.placeLocation}>{place.location}</Text>
      </View>
    </View>
  </View>
);

// Component for message rows
const MessageRow = ({ message }: { message: typeof MESSAGES_DATA[0] }) => (
  <TouchableOpacity style={styles.messageRow}>
    <Image source={{ uri: message.image }} style={styles.messageAvatar} />
    <View style={styles.messageContent}>
      <View style={styles.messageHeader}>
        <Text style={styles.messageName}>{message.name}</Text>
        <View style={styles.matchBadge}>
          <Text style={styles.matchPercentage}>{message.matchPercentage}% Match</Text>
        </View>
      </View>
      <Text style={styles.messageText} numberOfLines={1}>{message.message}</Text>
    </View>
    <Text style={styles.messageTime}>{message.time}</Text>
  </TouchableOpacity>
);

// Render all match cards
const MatchesSection = () => (
  <View style={styles.matchesContainer}>
    <View style={styles.matchesRow}>
      {MATCHES_DATA.map((match) => (
        <MatchCard key={match.id} match={match} />
      ))}
    </View>
    
    <View style={styles.featuredMatchContainer}>
      <Text style={styles.featuredMatchTitle}>Featured Match</Text>
      <View style={styles.featuredMatch}>
        <Image 
          source={{ uri: 'https://randomuser.me/api/portraits/women/68.jpg' }} 
          style={styles.featuredMatchImage} 
        />
        <View style={styles.featuredMatchInfo}>
          <Text style={styles.featuredMatchName}>Emma Wilson</Text>
          <Text style={styles.featuredMatchDetails}>28 • Software Engineer</Text>
          <View style={styles.matchBadge}>
            <Text style={styles.matchPercentage}>93% Match</Text>
          </View>
        </View>
      </View>
    </View>
  </View>
);

// Render saved places in a grid
const SavedPlacesSection = () => (
  <View style={styles.placesContainer}>
    <View style={styles.placesRow}>
      {SAVED_PLACES_DATA.slice(0, 2).map((place) => (
        <PlaceCard key={place.id} place={place} />
      ))}
    </View>
    <View style={styles.placesRow}>
      {SAVED_PLACES_DATA.slice(2, 4).map((place) => (
        <PlaceCard key={place.id} place={place} />
      ))}
    </View>
  </View>
);

// Render all messages
const MessagesSection = () => (
  <View style={styles.messagesContainer}>
    {MESSAGES_DATA.map((message) => (
      <MessageRow key={message.id} message={message} />
    ))}
  </View>
);

export default function StickyDemoScreen() {
  const router = useRouter();
  
  // Prepare sections for the ScrollableContainer
  const sections = [
    {
      title: 'New Matches',
      data: <MatchesSection />,
      count: MATCHES_DATA.length,
    },
    {
      title: 'Saved Places',
      data: <SavedPlacesSection />,
      count: SAVED_PLACES_DATA.length,
    },
    {
      title: 'Messages',
      data: <MessagesSection />,
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
  
  // Match cards styles
  matchesContainer: {
    padding: 16,
  },
  matchesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  matchCard: {
    alignItems: 'center',
    width: (width - 64) / 5,
    marginBottom: 16,
  },
  matchImageContainer: {
    position: 'relative',
  },
  matchImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  premiumBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    backgroundColor: '#4F46E5',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 6,
  },
  premiumText: {
    color: 'white',
    fontSize: 8,
    fontWeight: '600',
  },
  matchName: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    color: '#1F2937',
    textAlign: 'center',
  },
  
  // Featured match styles
  featuredMatchContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  featuredMatchTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  featuredMatch: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
  },
  featuredMatchImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  featuredMatchInfo: {
    flex: 1,
  },
  featuredMatchName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  featuredMatchDetails: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  
  // Place cards styles
  placesContainer: {
    padding: 16,
  },
  placesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  placeCard: {
    width: (width - 48) / 2,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
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
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  messageName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginRight: 8,
  },
  matchBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  matchPercentage: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4F46E5',
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
}); 