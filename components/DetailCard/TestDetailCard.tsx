import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { DetailCard } from './index';

/**
 * A test implementation of the DetailCard component
 * This component can be used to verify that the DetailCard works correctly
 */
export const TestDetailCard: React.FC = () => {
  const [expanded, setExpanded] = useState(false);
  
  // Sample images
  const images = [
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8YXBhcnRtZW50fGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8YXBhcnRtZW50fGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGFwYXJ0bWVudHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60'
  ];
  
  // Handle swipe left (dislike)
  const handleSwipeLeft = () => {
    Alert.alert('Disliked', 'You disliked this item');
  };
  
  // Handle swipe right (like)
  const handleSwipeRight = () => {
    Alert.alert('Liked', 'You liked this item');
  };
  
  // Handle super like
  const handleSuperLike = () => {
    Alert.alert('Super Liked', 'You super liked this item');
  };
  
  // Render main content (visible without expanding)
  const renderMainContent = () => (
    <View>
      <Text style={styles.title}>Sample Apartment</Text>
      <Text style={styles.subtitle}>New York, NY</Text>
      <Text style={styles.price}>$2,500/month</Text>
    </View>
  );
  
  // Render detail content (visible when expanded)
  const renderDetailContent = () => (
    <View>
      <Text style={styles.sectionTitle}>Description</Text>
      <Text style={styles.description}>
        This beautiful apartment features 2 bedrooms, 1 bathroom, and a spacious living area.
        Located in the heart of the city, it's close to public transportation, restaurants, and shops.
      </Text>
      
      <Text style={styles.sectionTitle}>Features</Text>
      <View style={styles.featuresList}>
        <Text style={styles.feature}>• 2 Bedrooms</Text>
        <Text style={styles.feature}>• 1 Bathroom</Text>
        <Text style={styles.feature}>• 850 sq ft</Text>
        <Text style={styles.feature}>• Hardwood floors</Text>
        <Text style={styles.feature}>• Stainless steel appliances</Text>
        <Text style={styles.feature}>• In-unit laundry</Text>
        <Text style={styles.feature}>• Central air conditioning</Text>
        <Text style={styles.feature}>• Pet-friendly</Text>
      </View>
      
      <Text style={styles.sectionTitle}>Location</Text>
      <Text style={styles.description}>
        Located in Manhattan's vibrant Chelsea neighborhood, this apartment is just steps away
        from the High Line, Chelsea Market, and numerous art galleries. The A, C, E subway lines
        are within a 5-minute walk.
      </Text>
      
      {/* Add more content to ensure scrolling works */}
      <Text style={styles.sectionTitle}>Additional Information</Text>
      <Text style={styles.description}>
        Available for immediate move-in. 12-month lease required. Security deposit equal to one
        month's rent. Tenant responsible for electricity and gas. Heat and hot water included.
        No broker fee.
      </Text>
      
      <View style={styles.spacer} />
    </View>
  );
  
  // Render header content (visible at the top of the detail sheet)
  const renderHeaderContent = () => (
    <Text style={styles.headerTitle}>Sample Apartment</Text>
  );
  
  return (
    <View style={styles.container}>
      <DetailCard
        images={images}
        onSwipeLeft={handleSwipeLeft}
        onSwipeRight={handleSwipeRight}
        onSuperLike={handleSuperLike}
        expanded={expanded}
        onExpandedChange={setExpanded}
        renderMainContent={renderMainContent}
        renderDetailContent={renderDetailContent}
        renderHeaderContent={renderHeaderContent}
        id="test-detail-card"
        showDebugOverlay={true} // Enable debug overlay for testing
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
    fontFamily: 'Poppins-Bold'
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    marginBottom: 5,
    fontFamily: 'Poppins-Regular'
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'Poppins-Bold'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'Poppins-Bold'
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: 'white',
    fontFamily: 'Poppins-Bold'
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: 'white',
    fontFamily: 'Poppins-Regular'
  },
  featuresList: {
    marginTop: 10,
    marginBottom: 20
  },
  feature: {
    fontSize: 16,
    lineHeight: 24,
    color: 'white',
    marginBottom: 5,
    fontFamily: 'Poppins-Regular'
  },
  spacer: {
    height: 100
  }
}); 