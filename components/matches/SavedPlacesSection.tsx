import React, { useState } from 'react';
import { View, Text, Pressable, Image, ScrollView } from 'react-native';
import { ChevronRight, MapPin } from 'lucide-react-native';
import { RoommateProfile, useRoommateStore } from '../../store/roommateStore';
import ContextMenu, { ContextMenuItem } from '../common/ContextMenu';

interface SavedPlacesSectionProps {
  savedPlaces: RoommateProfile[];
  navigate: any; // Using any since router.push has complex typing
  showHeader?: boolean;
}

const SavedPlacesSection: React.FC<SavedPlacesSectionProps> = ({ savedPlaces, navigate, showHeader = true }) => {
  const unsavePlaceProfile = useRoommateStore((state) => state.unsavePlaceProfile);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{x: number; y: number}>({ x: 0, y: 0 });
  const [selectedPlace, setSelectedPlace] = useState<RoommateProfile | null>(null);

  // Render a saved place item
  const renderSavedPlaceItem = (item: RoommateProfile) => {
    // Get location and price range
    const location = item.location || '';
    const budget = item.budget || '';
    
    // Get room type if available
    const roomType = item.roomType 
      ? item.roomType.charAt(0).toUpperCase() + item.roomType.slice(1) 
      : 'Room';
    
    // Get the first photo or use the profile image
    const photo = item.roomPhotos && item.roomPhotos.length > 0 
      ? item.roomPhotos[0] 
      : item.image;
    
    return (
      <Pressable
        key={item.id}
        className="w-[180px] mx-2 bg-white rounded-xl overflow-hidden shadow-sm"
        onPress={() => navigate(`/place-detail?id=${item.id}`)}
        onLongPress={(e) => {
          const { pageX, pageY } = e.nativeEvent;
          setMenuPosition({ x: pageX, y: pageY });
          setSelectedPlace(item);
          setMenuVisible(true);
        }}
      >
        <View className="relative w-full h-[120px]">
          <Image 
            source={{ uri: photo }} 
            className="w-full h-full rounded-t-xl"
            resizeMode="cover"
          />
          <View className="absolute bottom-0 left-0 right-0 p-2 flex-row justify-start">
            <View className="bg-indigo-600/90 px-2.5 py-1.5 rounded">
              <Text className="text-white text-[11px] font-bold font-[Poppins-Bold]">{roomType}</Text>
            </View>
          </View>
        </View>
        
        <View className="p-3">
          <Text className="text-[16px] font-bold font-[Poppins-Bold] text-gray-800 mb-1">{budget}</Text>
          <View className="flex-row items-center">
            <MapPin size={12} color="#6B7280" />
            <Text className="text-[13px] text-gray-500 ml-1 flex-1 font-[Poppins-Medium]" numberOfLines={1}>{location}</Text>
          </View>
        </View>
      </Pressable>
    );
  };

  // Empty state component
  const renderEmptyState = () => {
    return (
      <View className="w-50 h-20 items-center justify-center bg-gray-100 rounded-xl mx-4 my-2">
        <Text className="text-gray-500 text-[14px] text-center p-4 font-[Poppins-Regular]">
          No saved places yet. Swipe right on places to save them!
        </Text>
      </View>
    );
  };

  return (
    <View className="bg-white">
      {showHeader && (
        <View className="flex-row items-center justify-between py-3 px-4 bg-white">
          <Text className="text-[22px] font-[Poppins-Bold] text-gray-800 tracking-[-0.3px] font-extrabold">
            Saved Places
            {savedPlaces.length > 0 && (
              <View className="bg-indigo-50 rounded-xl px-2 py-0.5 ml-2 inline-block">
                <Text className="text-[12px] text-indigo-600 font-semibold">{savedPlaces.length}</Text>
              </View>
            )}
          </Text>
          
          <View className="flex-row items-center ml-auto">
            <Pressable
              className="flex-row items-center py-1 px-2"
              onPress={() => navigate('/saved-places')}
            >
              <Text className="text-indigo-600 text-[14px] mr-1 font-[Poppins-SemiBold]">View All</Text>
              <ChevronRight size={16} color="#4F46E5" />
            </Pressable>
          </View>
        </View>
      )}
      
      {savedPlaces.length === 0 ? (
        renderEmptyState()
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ 
            paddingHorizontal: 16, 
            paddingVertical: 8, 
            backgroundColor: '#FFFFFF' 
          }}
        >
          {savedPlaces.map(renderSavedPlaceItem)}
        </ScrollView>
      )}
      <ContextMenu
        isVisible={menuVisible}
        targetPosition={menuPosition}
        items={[
          {
            text: 'Unsave',
            style: 'destructive',
            onPress: () => {
              if (selectedPlace) unsavePlaceProfile(selectedPlace.id);
              setMenuVisible(false);
            },
          },
        ]}
        onClose={() => setMenuVisible(false)}
      />
    </View>
  );
};

export default SavedPlacesSection; 