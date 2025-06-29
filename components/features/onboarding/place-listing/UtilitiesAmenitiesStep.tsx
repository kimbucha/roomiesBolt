import React, { forwardRef, useState } from 'react';
import { View, TouchableOpacity, Text, TextInput } from 'react-native';
import { Zap, Wifi, Droplets, Flame, Trash2, DollarSign } from 'lucide-react-native';
import AmenitySelector from './AmenitySelector';
import { usePlaceDetails } from '../../../../contexts/PlaceDetailsContext';

interface UtilitiesAmenitiesStepProps {}

// Define utility types
type UtilityStatus = 'included' | 'not-included' | 'estimated';

interface Utility {
  id: string;
  name: string;
  icon: React.ReactNode;
  status: UtilityStatus;
  estimatedCost?: string;
}

const UtilitiesAmenitiesStep = forwardRef<View, UtilitiesAmenitiesStepProps>(({}, ref) => {
  const { placeDetails, updatePlaceDetails } = usePlaceDetails();
  
  // Initialize utilities with default values
  const [utilities, setUtilities] = useState<Utility[]>([
    { id: 'electricity', name: 'Electricity', icon: <Zap size={18} color="#6B7280" />, status: 'included' },
    { id: 'water', name: 'Water & Sewer', icon: <Droplets size={18} color="#6B7280" />, status: 'included' },
    { id: 'gas', name: 'Gas/Heating', icon: <Flame size={18} color="#6B7280" />, status: 'included' },
    { id: 'internet', name: 'Internet/WiFi', icon: <Wifi size={18} color="#6B7280" />, status: 'not-included', estimatedCost: '$50' },
    { id: 'trash', name: 'Trash & Recycling', icon: <Trash2 size={18} color="#6B7280" />, status: 'included' },
  ]);
  
  // Handle utility status change
  const handleUtilityStatusChange = (utilityId: string, status: UtilityStatus) => {
    setUtilities(prev => prev.map(utility => 
      utility.id === utilityId 
        ? { ...utility, status, estimatedCost: status !== 'estimated' ? undefined : utility.estimatedCost || '$50' }
        : utility
    ));
    
    // Update place details context
    updatePlaceDetails({ utilities: utilities });
  };
  
  // Handle estimated cost change
  const handleEstimatedCostChange = (utilityId: string, cost: string) => {
    setUtilities(prev => prev.map(utility => 
      utility.id === utilityId 
        ? { ...utility, estimatedCost: cost }
        : utility
    ));
  };
  
  // Handle toggling amenities (excluding WiFi since it's now in utilities)
  const handleToggleAmenity = (amenity: any) => {
    const currentAmenities = [...placeDetails.amenities];
    const index = currentAmenities.indexOf(amenity);
    
    if (index === -1) {
      // Add amenity
      updatePlaceDetails({ amenities: [...currentAmenities, amenity] });
    } else {
      // Remove amenity
      currentAmenities.splice(index, 1);
      updatePlaceDetails({ amenities: currentAmenities });
    }
  };
  
  // Render utility status buttons
  const renderUtilityStatusButtons = (utility: Utility) => (
    <View style={{ flexDirection: 'row', marginTop: 8 }}>
          <TouchableOpacity
            style={{
              flex: 1,
          paddingVertical: 8,
          paddingHorizontal: 12,
          backgroundColor: utility.status === 'included' ? '#10B981' : '#F3F4F6',
          borderRadius: 6,
          marginRight: 4,
              alignItems: 'center',
            }}
        onPress={() => handleUtilityStatusChange(utility.id, 'included')}
          >
            <Text style={{
          fontSize: 12,
              fontWeight: '600',
          color: utility.status === 'included' ? '#FFFFFF' : '#6B7280',
            }}>
              Included
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={{
              flex: 1,
          paddingVertical: 8,
          paddingHorizontal: 12,
          backgroundColor: utility.status === 'not-included' ? '#EF4444' : '#F3F4F6',
          borderRadius: 6,
          marginHorizontal: 2,
              alignItems: 'center',
            }}
        onPress={() => handleUtilityStatusChange(utility.id, 'not-included')}
          >
            <Text style={{
          fontSize: 12,
              fontWeight: '600',
          color: utility.status === 'not-included' ? '#FFFFFF' : '#6B7280',
            }}>
              Not Included
            </Text>
          </TouchableOpacity>
      
      <TouchableOpacity
        style={{
          flex: 1,
          paddingVertical: 8,
          paddingHorizontal: 12,
          backgroundColor: utility.status === 'estimated' ? '#F59E0B' : '#F3F4F6',
          borderRadius: 6,
          marginLeft: 4,
          alignItems: 'center',
        }}
        onPress={() => handleUtilityStatusChange(utility.id, 'estimated')}
      >
        <Text style={{
          fontSize: 12,
          fontWeight: '600',
          color: utility.status === 'estimated' ? '#FFFFFF' : '#6B7280',
        }}>
          Est. Cost
        </Text>
      </TouchableOpacity>
        </View>
  );

  return (
    <View ref={ref}>
      {/* Utilities Section */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12, color: '#111827' }}>Utilities</Text>
        <Text style={{ fontSize: 14, color: '#6B7280', marginBottom: 16, lineHeight: 20 }}>
          Help potential roommates understand what's included in rent vs. what they'll need to pay separately.
        </Text>
        
        {utilities.map((utility, index) => (
          <View key={utility.id} style={{
            backgroundColor: '#FFFFFF',
            borderWidth: 1,
            borderColor: '#E5E7EB',
            borderRadius: 12,
            padding: 16,
            marginBottom: 12,
          }}>
            {/* Utility Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              {utility.icon}
              <Text style={{
                fontSize: 15,
                fontWeight: '600',
                color: '#111827',
                marginLeft: 10,
              }}>
                {utility.name}
              </Text>
            </View>
            
            {/* Status Buttons */}
            {renderUtilityStatusButtons(utility)}
            
            {/* Estimated Cost Input */}
            {utility.status === 'estimated' && (
              <View style={{ marginTop: 12 }}>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: '#D1D5DB',
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  backgroundColor: '#F9FAFB',
                }}>
                  <DollarSign size={16} color="#6B7280" />
                  <TextInput
                    style={{
                      flex: 1,
                      fontSize: 14,
                      color: '#111827',
                      marginLeft: 4,
                    }}
                    placeholder="e.g., 50/month"
                    value={utility.estimatedCost?.replace('$', '') || ''}
                    onChangeText={(text) => {
                      const formattedCost = text.startsWith('$') ? text : `$${text}`;
                      handleEstimatedCostChange(utility.id, formattedCost);
                    }}
                    keyboardType="numeric"
          />
                </View>
              </View>
            )}
          </View>
        ))}
      </View>
      
      {/* Amenities Section - WiFi removed since it's now in utilities */}
      <AmenitySelector
        selectedAmenities={placeDetails.amenities}
        onToggleAmenity={handleToggleAmenity}
      />
    </View>
  );
});

UtilitiesAmenitiesStep.displayName = 'UtilitiesAmenitiesStep';

export default UtilitiesAmenitiesStep; 