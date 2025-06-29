import React from 'react';
import { View, Text } from 'react-native';
import { 
  DollarSign, 
  MapPin, 
  Home, 
  Bed, 
  Check, 
  Users, 
  Calendar, 
  Bath,
  Zap,
  Car, 
  Dumbbell, 
  Sofa, 
  Dog, 
  Waves, 
  ChefHat, 
  TreePine, 
  Wind,
  Clock,
  ArrowDown
} from 'lucide-react-native';
import { RoommateProfile } from '../../store/roommateStore';
import { DetailSection, Tag, InfoRow } from '../shared';

interface PlaceDetailContentProps {
  place: RoommateProfile;
}

// Amenity mapping from onboarding to display
const amenityMapping = {
  'parking': { label: 'Parking', icon: Car },
  'gym': { label: 'Gym', icon: Dumbbell },
  'pool': { label: 'Pool', icon: Waves },
  'ac': { label: 'A/C', icon: Wind },
  'furnished': { label: 'Furnished', icon: Sofa },
  'dishwasher': { label: 'Dishwasher', icon: ChefHat },
  'in-unit-laundry': { label: 'In-Unit Laundry', icon: Home },
  'pets': { label: 'Pet Friendly', icon: Dog },
  'balcony': { label: 'Balcony/Patio', icon: TreePine }
};

export const PlaceDetailContent: React.FC<PlaceDetailContentProps> = ({ place }) => {
  // Use specific description if available, prioritizing place description over bio
  const description = place.description || place.bio || 'This cozy space is perfect for students and professionals looking for a comfortable living situation.';
  
  // Use monthly rent if available, otherwise fall back to budget
  const rentValue = place.monthlyRent || place.budget || 'Contact for pricing';
  
  // Use address if available, otherwise fall back to location
  const locationValue = place.address || place.location || 'N/A';

  return (
    <>
      {/* Key Info Row (Budget, Location) */}
      <View className="flex-row justify-between mt-4 mb-4 space-x-4">
        <InfoRow 
          icon={DollarSign}
          label="Rent"
          value={rentValue}
          className="w-[48%] mb-2"
        />
        <InfoRow 
          icon={MapPin}
          label="Location"
          value={locationValue}
          className="w-[48%] mb-2"
        />
      </View>
      
      {/* Property Layout Row - Show total bedrooms/bathrooms for context */}
      {(place.bedrooms || place.bathrooms) && place.roomType !== 'studio' && (
          <View className="mb-4">
            <Text className="text-xs text-gray-500 mb-2 font-[Poppins-Medium]">
              {place.roomType === 'private' ? 'Property Layout (Private room within):' : 
               place.roomType === 'shared' ? 'Property Layout (Shared room within):' : 'Property Layout:'}
            </Text>
            <View className="flex-row justify-between space-x-4">
            <InfoRow 
              icon={Bed}
                label="Total Bedrooms"
              value={place.bedrooms ? `${place.bedrooms} bed${place.bedrooms > 1 ? 's' : ''}` : 'N/A'}
              className="w-[48%] mb-2"
            />
            <InfoRow 
              icon={Bath}
                label="Total Bathrooms"
              value={place.bathrooms ? `${place.bathrooms} bath${place.bathrooms > 1 ? 's' : ''}` : 'N/A'}
              className="w-[48%] mb-2"
            />
            </View>
          </View>
      )}

      {/* About this Place - Pass description string as child */}
      <DetailSection icon={Home} title="About this Place">
        <Text className="text-sm text-gray-700 leading-relaxed mb-4">{description}</Text>
      </DetailSection>

      {/* Room Type - Pass formatted string as child */}
      <DetailSection icon={Bed} title="Room Type">
        <Text className="text-sm text-gray-700 mb-4">
          {(() => {
            if (place.roomType === 'private') return 'Private Room';
            if (place.roomType === 'shared') return 'Shared Room';
            if (place.roomType === 'studio') return 'Studio Apartment';
            return 'Private Room'; // Default to private instead of "Not specified"
          })()}
        </Text>
        {/* Show furnished status if available */}
        {place.isFurnished !== undefined && (
          <Text className="text-sm text-gray-600 mt-2">
            {place.isFurnished ? '✓ Furnished' : '✗ Unfurnished'}
          </Text>
        )}
      </DetailSection>
      
      {/* Simplified Utilities Section */}
      {place.hasPlace && (
        <DetailSection icon={Zap} title="Utilities">
          <>
            {(() => {
              // Get utilities from detailedUtilities field, or fall back to test data for user1
              const detailedUtilities = place.placeDetails?.detailedUtilities || 
                (place.id === 'user1' ? [
                  { id: 'electricity', name: 'Electricity', status: 'included' as const },
                  { id: 'water', name: 'Water & Sewer', status: 'included' as const },
                  { id: 'internet', name: 'Internet/WiFi', status: 'not-included' as const, estimatedCost: '$60' },
                  { id: 'gas', name: 'Gas/Heating', status: 'not-included' as const, estimatedCost: '$40' },
                  { id: 'trash', name: 'Trash & Recycling', status: 'included' as const },
                ] : null);

              // Calculate total additional costs for summary
              const calculateAdditionalCosts = (utilities: any[]) => {
                return utilities
                  .filter(u => u.status === 'not-included')
                  .reduce((total: number, utility: any) => {
                    const cost = parseFloat(utility.estimatedCost?.replace(/[$,\/a-zA-Z]/g, '') || '0');
                    return total + cost;
                  }, 0);
              };

              return detailedUtilities && detailedUtilities.length > 0 ? (
                <View className="space-y-3">
                  
                  {/* Additional Costs Summary (if any) */}
                  {(() => {
                    const additionalCosts = detailedUtilities.filter(u => u.status === 'not-included');
                    const totalCost = calculateAdditionalCosts(detailedUtilities);
                    
                    if (additionalCosts.length > 0) {
                      return (
                        <View className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 mb-3">
                          <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center">
                              <View className="w-8 h-8 bg-indigo-500 rounded-lg items-center justify-center mr-3">
                                <DollarSign size={16} color="white" />
                              </View>
                              <View>
                                <Text className="text-sm font-[Poppins-SemiBold] text-indigo-900">
                                  Monthly Costs
                                </Text>
                                <Text className="text-xs text-indigo-600">
                                  Not included in rent
                                </Text>
                              </View>
                            </View>
                            <View className="bg-indigo-500 rounded-lg px-3 py-1">
                              <Text className="text-sm font-[Poppins-Bold] text-white">
                                ${totalCost}/mo
                              </Text>
                            </View>
                          </View>
                        </View>
                      );
                    }
                    return null;
                  })()}

                  {/* All Utilities List */}
                  <View className="space-y-2">
                    {detailedUtilities.map((utility, index) => (
                      <View key={index} className="flex-row items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                        <Text className="text-sm text-gray-800 font-[Poppins-Medium] flex-1">
                          {utility.name}
                        </Text>
                        {utility.status === 'included' ? (
                          <View className="bg-indigo-100 rounded-full px-3 py-1">
                            <Text className="text-xs font-[Poppins-SemiBold] text-indigo-700">
                              Included
                            </Text>
                          </View>
                        ) : (
                          <View className="bg-indigo-500 rounded-full px-3 py-1">
                            <Text className="text-xs font-[Poppins-SemiBold] text-white">
                              {utility.estimatedCost || '$50'}/mo
                            </Text>
                          </View>
                        )}
                      </View>
                    ))}
                  </View>
                  
                </View>
              ) : (
                /* Fallback to utilitiesIncluded array */
                place.utilitiesIncluded && place.utilitiesIncluded.length > 0 ? (
                  <View className="space-y-2">
                    {place.utilitiesIncluded.map((utility, index) => (
                      <View key={index} className="flex-row items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                        <Text className="text-sm text-gray-800 font-[Poppins-Medium] flex-1">
                          {utility}
                        </Text>
                        <View className="bg-indigo-100 rounded-full px-3 py-1">
                          <Text className="text-xs font-[Poppins-SemiBold] text-indigo-700">
                            Included
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View className="bg-gray-50 rounded-lg p-4 items-center">
                    <Text className="text-sm text-gray-600 text-center font-[Poppins-Medium]">
                      Contact host for utility details
                    </Text>
                  </View>
                )
              );
            })()}
          </>
        </DetailSection>
      )}

      {/* Simplified Amenities Section with Proper Mapping */}
      {place.hasPlace && (place.placeDetails?.amenities || place.amenities) && (
        <DetailSection icon={Home} title="Amenities">
          <View className="flex-row flex-wrap">
            {(place.placeDetails?.amenities || place.amenities || []).map((amenity, index) => {
              // Handle both string amenities and amenity objects
              const amenityKey = typeof amenity === 'string' ? amenity.toLowerCase() : amenity;
              const mappedAmenity = amenityMapping[amenityKey as keyof typeof amenityMapping];
              
              if (mappedAmenity) {
                const IconComponent = mappedAmenity.icon;
                return (
                  <View key={index} className="bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-2 mr-2 mb-2 flex-row items-center">
                    <IconComponent size={16} color="#4F46E5" />
                    <Text className="text-sm font-[Poppins-Medium] text-indigo-700 ml-2">
                      {mappedAmenity.label}
                    </Text>
                  </View>
                );
              } else {
                // Fallback for unmapped amenities
                return (
                  <View key={index} className="bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-2 mr-2 mb-2">
                    <Text className="text-sm font-[Poppins-Medium] text-indigo-700">
                      {typeof amenity === 'string' ? amenity : amenity}
                    </Text>
                  </View>
                );
              }
            })}
          </View>
        </DetailSection>
      )}

      {/* Lease Information - Always show this section for place listings */}
      {place.hasPlace && (
        <DetailSection icon={Calendar} title="Lease Info">
          <View className="space-y-3">
            {/* Move-in Date */}
            <View className="flex-row items-center">
              <ArrowDown size={16} color="#4F46E5" className="mr-3" />
              <View>
                <Text className="font-[Poppins-Medium] text-sm text-gray-800">Move-in</Text>
                <Text className="font-[Poppins-Regular] text-sm text-gray-700 mt-1">
                  {place.moveInDate || 'Flexible'}
                </Text>
              </View>
            </View>
            
            {/* Duration */}
            <View className="flex-row items-center">
              <Clock size={16} color="#4F46E5" className="mr-3" />
              <View>
                <Text className="font-[Poppins-Medium] text-sm text-gray-800">Duration</Text>
                <Text className="font-[Poppins-Regular] text-sm text-gray-700 mt-1">
                  {place.leaseDuration || '12 months'}
                </Text>
              </View>
            </View>
          </View>
        </DetailSection>
      )}
    </>
  );
}; 