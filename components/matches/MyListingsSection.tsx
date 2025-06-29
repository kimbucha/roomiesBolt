import React, { useState } from 'react';
import { View, Text, Pressable, Image, ScrollView } from 'react-native';
import { ChevronRight, MapPin, Home, Edit3 } from 'lucide-react-native';
import { useSupabaseUserStore } from '../../store/supabaseUserStore';
import { useUserStore } from '../../store/userStore';
import ContextMenu, { ContextMenuItem } from '../common/ContextMenu';

interface MyListingsSectionProps {
  navigate: any;
  showHeader?: boolean;
}

const MyListingsSection: React.FC<MyListingsSectionProps> = ({ navigate, showHeader = true }) => {
  const supabaseUser = useSupabaseUserStore((state) => state.user);
  const regularUser = useUserStore((state) => state.user);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{x: number; y: number}>({ x: 0, y: 0 });

  // Try to get place data from either store (prioritize regular UserStore which has onboarding data)
  const placeData = regularUser?.placeDetails || supabaseUser?.placeDetails;
  const user = regularUser || supabaseUser; // Use whichever has data
  const hasListing = placeData && placeData.bedrooms && placeData.bathrooms;

  // Format the place data for display
  const formatPlaceData = () => {
    if (!placeData) return null;

    const price = placeData.monthlyRent ? `$${placeData.monthlyRent}/month` : 'Price not set';
    const location = placeData.address || user?.location?.city || user?.location?.address || 'Location not set';
    const roomType = placeData.roomType 
      ? placeData.roomType.charAt(0).toUpperCase() + placeData.roomType.slice(1) 
      : 'Room';
    
    // Get the first photo or use a placeholder
    const photo = placeData.photos && placeData.photos.length > 0 
      ? placeData.photos[0] 
      : 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=400'; // Placeholder apartment image

    const propertyInfo = `${placeData.bedrooms || 0}bd ${placeData.bathrooms || 0}ba`;

    return {
      id: user?.id || 'user-listing',
      title: `${propertyInfo} in ${location.split(',')[0]}`,
      price,
      location,
      roomType,
      photo,
      bedrooms: placeData.bedrooms,
      bathrooms: placeData.bathrooms,
      amenities: placeData.amenities || [],
      description: placeData.description
    };
  };

  const listingData = formatPlaceData();

  // Render the place listing item
  const renderListingItem = () => {
    if (!listingData) return null;
    
    return (
      <Pressable
        key={listingData.id}
        className="w-[180px] mx-2 bg-white rounded-xl overflow-hidden shadow-sm"
        onPress={() => navigate(`/place-detail?id=${listingData.id}`)}
        onLongPress={(e) => {
          const { pageX, pageY } = e.nativeEvent;
          setMenuPosition({ x: pageX, y: pageY });
          setMenuVisible(true);
        }}
      >
        <View className="relative w-full h-[120px]">
          <Image 
            source={{ uri: listingData.photo }} 
            className="w-full h-full rounded-t-xl"
            resizeMode="cover"
          />
          <View className="absolute bottom-0 left-0 right-0 p-2 flex-row justify-start">
            <View className="bg-indigo-600/90 px-2.5 py-1.5 rounded">
              <Text className="text-white text-[11px] font-bold font-[Poppins-Bold]">{listingData.roomType}</Text>
            </View>
          </View>
        </View>
        
        <View className="p-3">
          <Text className="text-[16px] font-bold font-[Poppins-Bold] text-gray-800 mb-1">{listingData.location}</Text>
          <View className="flex-row items-center mb-1">
            <Home size={12} color="#6B7280" />
            <Text className="text-[12px] text-gray-500 ml-1 font-[Poppins-Medium]">
              {listingData.bedrooms}bd {listingData.bathrooms}ba
            </Text>
          </View>
          <View className="flex-row items-center">
            <Text className="text-[13px] text-gray-500 flex-1 font-[Poppins-Medium]" numberOfLines={1}>
              {listingData.price}
            </Text>
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
          No listings yet. Complete your place details to show your listing here!
        </Text>
      </View>
    );
  };

  return (
    <View className="bg-white">
      {showHeader && (
        <View className="flex-row items-center justify-between py-3 px-4 bg-white">
          <Text className="text-[22px] font-[Poppins-Bold] text-gray-800 tracking-[-0.3px] font-extrabold">
            My Listings
            {hasListing && (
              <View className="bg-indigo-50 rounded-xl px-2 py-0.5 ml-2 inline-block">
                <Text className="text-[12px] text-indigo-600 font-semibold">1</Text>
              </View>
            )}
          </Text>
          
          <View className="flex-row items-center ml-auto">
            <Pressable
              className="flex-row items-center py-1 px-2"
              onPress={() => navigate('/(onboarding)/place-details')}
            >
              <Edit3 size={14} color="#4F46E5" />
              <Text className="text-indigo-600 text-[14px] ml-1 font-[Poppins-SemiBold]">Edit</Text>
            </Pressable>
          </View>
        </View>
      )}
      
      {!hasListing ? (
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
          {renderListingItem()}
        </ScrollView>
      )}
      
      <ContextMenu
        isVisible={menuVisible}
        targetPosition={menuPosition}
        items={[
          {
            text: 'Edit Listing',
            onPress: () => {
              navigate('/(onboarding)/place-details');
              setMenuVisible(false);
            },
          },
          {
            text: 'View Analytics',
            onPress: () => {
              // TODO: Navigate to listing analytics
              setMenuVisible(false);
            },
          }
        ]}
        onClose={() => setMenuVisible(false)}
      />
    </View>
  );
};

export default MyListingsSection;