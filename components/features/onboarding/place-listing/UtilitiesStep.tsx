import React, { forwardRef, useState } from 'react';
import { View, TouchableOpacity, Text, TextInput } from 'react-native';
import { Zap, Wifi, Droplets, Flame, Trash2, DollarSign } from 'lucide-react-native';
import { usePlaceDetails } from '../../../../contexts/PlaceDetailsContext';

interface UtilitiesStepProps {}

// Define utility types
type UtilityStatus = 'included' | 'not-included';

interface Utility {
  id: string;
  name: string;
  icon: React.ReactNode;
  status: UtilityStatus;
  estimatedCost?: string;
}

const UtilitiesStep = forwardRef<View, UtilitiesStepProps>(({}, ref) => {
  const { placeDetails, updatePlaceDetails } = usePlaceDetails();
  
  // Initialize utilities with default values
  const [utilities, setUtilities] = useState<Utility[]>([
    { id: 'internet', name: 'Internet/WiFi', icon: <Wifi size={18} color="#6B7280" />, status: 'not-included', estimatedCost: '$50' },
    { id: 'electricity', name: 'Electricity', icon: <Zap size={18} color="#6B7280" />, status: 'included' },
    { id: 'water', name: 'Water & Sewer', icon: <Droplets size={18} color="#6B7280" />, status: 'included' },
    { id: 'trash', name: 'Trash & Recycling', icon: <Trash2 size={18} color="#6B7280" />, status: 'included' },
    { id: 'gas', name: 'Gas/Heating', icon: <Flame size={18} color="#6B7280" />, status: 'included' },
  ]);

  // Handle utility status change
  const handleUtilityStatusChange = (utilityId: string, status: UtilityStatus) => {
    setUtilities(prev => prev.map(utility => 
      utility.id === utilityId 
        ? { 
            ...utility, 
            status, 
            estimatedCost: status === 'not-included' ? (utility.estimatedCost || '$50') : undefined 
          }
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

  // Calculate total estimated monthly cost
  const calculateTotalCost = () => {
    return utilities
      .filter(utility => utility.status === 'not-included' && utility.estimatedCost)
      .reduce((total, utility) => {
        const cost = parseFloat(utility.estimatedCost?.replace(/[$,]/g, '') || '0');
        return total + cost;
      }, 0);
  };

  // Render utility status buttons
  const renderUtilityStatusButtons = (utility: Utility) => (
    <View style={{ flexDirection: 'row', marginTop: 8 }}>
      <TouchableOpacity
        style={{
          flex: 1,
          paddingVertical: 10,
          paddingHorizontal: 16,
          backgroundColor: utility.status === 'included' ? '#10B981' : '#F3F4F6',
          borderRadius: 8,
          marginRight: 6,
          alignItems: 'center',
        }}
        onPress={() => handleUtilityStatusChange(utility.id, 'included')}
      >
        <Text style={{
          fontSize: 13,
          fontWeight: '600',
          color: utility.status === 'included' ? '#FFFFFF' : '#6B7280',
        }}>
          Included
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={{
          flex: 1,
          paddingVertical: 10,
          paddingHorizontal: 16,
          backgroundColor: utility.status === 'not-included' ? '#EF4444' : '#F3F4F6',
          borderRadius: 8,
          marginLeft: 6,
          alignItems: 'center',
        }}
        onPress={() => handleUtilityStatusChange(utility.id, 'not-included')}
      >
        <Text style={{
          fontSize: 13,
          fontWeight: '600',
          color: utility.status === 'not-included' ? '#FFFFFF' : '#6B7280',
        }}>
          Not Included
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
            
            {/* Estimated Cost Input - shows when Not Included is selected */}
            {utility.status === 'not-included' && (
              <View style={{ marginTop: 12 }}>
                <Text style={{ fontSize: 12, color: '#6B7280', marginBottom: 6 }}>
                  Estimated monthly cost:
                </Text>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: '#D1D5DB',
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
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

        {/* Total Cost Summary */}
        {calculateTotalCost() > 0 && (
          <View style={{
            backgroundColor: '#F5F3FF',
            borderWidth: 1,
            borderColor: '#6366F1',
            borderRadius: 12,
            padding: 16,
            marginTop: 8,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{
                fontSize: 15,
                fontWeight: '600',
                color: '#0F172A',
              }}>
                Estimated Monthly Utilities
              </Text>
              <Text style={{
                fontSize: 18,
                fontWeight: '700',
                color: '#6366F1',
              }}>
                ${calculateTotalCost().toFixed(0)}
              </Text>
            </View>
            <Text style={{
              fontSize: 12,
              color: '#64748B',
              marginTop: 4,
            }}>
              This will be added to your monthly expenses
            </Text>
          </View>
        )}
      </View>
    </View>
  );
});

UtilitiesStep.displayName = 'UtilitiesStep';

export default UtilitiesStep; 