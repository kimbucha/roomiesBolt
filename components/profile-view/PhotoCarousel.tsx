import React from 'react';
import { View, Text, FlatList, Image, StyleSheet, Dimensions } from 'react-native';
import { Image as ImageIcon } from 'lucide-react-native';

const { width: screenWidth } = Dimensions.get('window');

interface PhotoCarouselProps {
  photos: string[] | undefined;
}

const PhotoCarousel: React.FC<PhotoCarouselProps> = ({ photos }) => {
  if (!photos || photos.length === 0) {
    return (
      <View style={styles.photoSectionPlaceholder}>
        <ImageIcon size={40} color="#94A3B8" />
        <Text style={styles.placeholderText}>No photos uploaded yet.</Text>
      </View>
    );
  }

  return (
    <View style={styles.photoSection}>
      <Text style={styles.sectionTitle}>Photos</Text>
      <FlatList
        horizontal
        data={photos}
        renderItem={({ item }) => (
          <Image source={{ uri: item }} style={styles.photoItem} />
        )}
        keyExtractor={(item, index) => index.toString()}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.photoListContainer}
      />
    </View>
  );
};

// Copy relevant styles
const styles = StyleSheet.create({
  photoSection: {
    marginTop: 10,
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  photoSectionPlaceholder: {
    marginTop: 10,
    backgroundColor: '#FFFFFF',
    paddingVertical: 30, 
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    minHeight: 150, 
  },
  sectionTitle: { // Title specific to this section
    fontSize: 18,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  photoListContainer: {
    paddingHorizontal: 20,
  },
  photoItem: {
    width: screenWidth * 0.7,
    height: screenWidth * 0.8,
    borderRadius: 8,
    marginRight: 15,
    backgroundColor: '#E2E8F0',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  placeholderText: {
      marginTop: 10,
      fontSize: 14,
      color: '#64748B',
  },
});

export default PhotoCarousel; 