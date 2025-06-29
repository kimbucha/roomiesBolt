import React from 'react';
import { View, Text } from 'react-native';
import { RoommateProfile } from '../../store/roommateStore';
import { DetailCard } from '../DetailCard';
import { PlaceMainContent } from './PlaceMainContent';
import { PlaceDetailContent } from './PlaceDetailContent';
import { PlaceHeaderContent } from './PlaceHeaderContent';

interface PlaceDetailCardProps {
  place: RoommateProfile;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onSuperLike: () => void;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  id: string;
}

export const PlaceDetailCard: React.FC<PlaceDetailCardProps> = ({
  place,
  onSwipeLeft,
  onSwipeRight,
  onSuperLike,
  expanded,
  onExpandedChange,
  id,
}) => {
  // *** Log the received place prop ***
  console.log(`[PlaceDetailCard] Received place prop for ID ${id}:`, JSON.stringify(place, null, 2));

  // Ensure we have an array of images
  const placeImages = React.useMemo(() => {
    // Add checks for place being defined
    if (!place) return []; 
    if (place.roomPhotos && place.roomPhotos.length > 0) {
      return place.roomPhotos;
    }
    if (place.image) {
      return [place.image];
    }
    return [];
  }, [place]); // Depend only on place object
  
  // Verify this is actually a place listing
  // Add check for place being defined
  const isPlaceListing = place && place.hasPlace === true;
  
  if (!place) {
      console.error(`[PlaceDetailCard] Received undefined place prop for ID ${id}`);
      return <View><Text>Error: Place data missing.</Text></View>; // Render error state
  }
  
  if (!isPlaceListing) {
    console.warn(`[PlaceDetailCard] Profile ${id} is not a place listing but was rendered as one`);
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 16, color: 'red' }}>
          Error: This profile does not have a place listing.
        </Text>
      </View>
    );
  }

  return (
    <DetailCard
      images={placeImages}
      onSwipeLeft={onSwipeLeft}
      onSwipeRight={onSwipeRight}
      onSuperLike={onSuperLike}
      expanded={expanded}
      onExpandedChange={onExpandedChange}
      renderMainContent={() => <PlaceMainContent place={place} />}
      renderDetailContent={() => <PlaceDetailContent place={place} />}
      renderHeaderContent={() => <PlaceHeaderContent place={place} />}
      id={id}
      showDebugOverlay={__DEV__ && false} // Set to true to enable debug overlay during development
    />
  );
}; 