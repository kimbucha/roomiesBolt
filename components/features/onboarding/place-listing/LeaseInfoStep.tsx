import React, { forwardRef, useRef, useState } from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';
import { Calendar, Home, FileText, ChevronDown, ChevronUp } from 'lucide-react-native';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { Dimensions } from 'react-native';
import InlineCalendar from './InlineCalendar';
import { usePlaceDetails } from '../../../../contexts/PlaceDetailsContext';

interface LeaseInfoStepProps {}

const LeaseInfoStep = forwardRef<View, LeaseInfoStepProps>(({ /* handleInputFocus removed */ }, ref) => {
  const { placeDetails, updatePlaceDetails } = usePlaceDetails();
  
  // State for calendar visibility
  const [showInlineCalendar, setShowInlineCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(() => {
    if (placeDetails.moveInDate) {
      const parsedDate = new Date(placeDetails.moveInDate);
      // Check if the date is valid
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate;
      }
    }
    return undefined;
  });
  
  // State for lease type (month-to-month vs fixed lease)
  const [leaseType, setLeaseType] = useState<'month-to-month' | 'fixed'>(() => {
    // Parse existing lease duration to determine type
    if (placeDetails.leaseDuration) {
      const duration = placeDetails.leaseDuration.toLowerCase();
      if (duration.includes('month-to-month') || duration.includes('month to month')) {
        return 'month-to-month';
      }
    }
    return 'fixed';
  });
  
  // State for lease duration slider (in months, 2-24)
  const [leaseDurationMonths, setLeaseDurationMonths] = useState(() => {
    // Parse existing lease duration to get months
    if (placeDetails.leaseDuration && leaseType === 'fixed') {
      const match = placeDetails.leaseDuration.match(/(\d+)/);
      const parsed = match ? parseInt(match[1], 10) : 12;
      // Ensure the value is within bounds
      return Math.min(Math.max(parsed, 2), 24);
    }
    return 12;
  });
  
  // Initialize lease duration if not set and we're on fixed lease
  React.useEffect(() => {
    if (leaseType === 'fixed' && !placeDetails.leaseDuration) {
      const duration = leaseDurationMonths === 12 ? '1 year' : `${leaseDurationMonths} months`;
      updatePlaceDetails({ leaseDuration: duration });
    }
  }, [leaseType, leaseDurationMonths, placeDetails.leaseDuration, updatePlaceDetails]);
  
  // Format date for display
  const formatDate = (date?: Date): string => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  };
  
  // Handle date selection from inline calendar
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    updatePlaceDetails({ moveInDate: formatDate(date) });
    // Optionally collapse calendar after selection
    setShowInlineCalendar(false);
  };
  
  // Toggle calendar visibility
  const toggleCalendar = () => {
    setShowInlineCalendar(!showInlineCalendar);
  };
  
  // Handle lease type change
  const handleLeaseTypeChange = (type: 'month-to-month' | 'fixed') => {
    setLeaseType(type);
    
    // Update lease duration based on type
    if (type === 'month-to-month') {
      updatePlaceDetails({ leaseDuration: 'Month-to-month' });
    } else {
      updatePlaceDetails({ leaseDuration: `${leaseDurationMonths} months` });
    }
  };
  
  // Handle lease duration change (for fixed leases)
  const handleLeaseDurationChange = (values: number[]) => {
    const months = Math.round(values[0]); // Ensure it's a whole number
    setLeaseDurationMonths(months);
    
    if (leaseType === 'fixed') {
      const duration = months === 12 ? '1 year' : `${months} months`;
      updatePlaceDetails({ leaseDuration: duration });
    }
  };
  
  // Format lease duration for display
  const formatLeaseDuration = (months: number): string => {
    if (months === 12) return '1 year';
    return `${months} months`;
  };
  
  return (
    <View ref={ref}>
      {/* Availability Section */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12, color: '#111827' }}>Availability</Text>
        
        {/* Date input field with toggle */}
        <TouchableOpacity 
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#E5E7EB',
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 14,
            backgroundColor: '#FFFFFF',
            marginBottom: showInlineCalendar ? 8 : 0,
          }}
          onPress={toggleCalendar}
        >
          <Calendar size={20} color="#6B7280" style={{ marginRight: 8 }} />
          <Text style={{ 
            flex: 1, 
            fontSize: 16, 
            color: placeDetails.moveInDate ? '#111827' : '#9CA3AF' 
          }}>
            {placeDetails.moveInDate || 'Select availability date'}
          </Text>
          {showInlineCalendar ? (
            <ChevronUp size={20} color="#6B7280" />
          ) : (
            <ChevronDown size={20} color="#6B7280" />
          )}
        </TouchableOpacity>
        
        {/* Inline Calendar */}
        {showInlineCalendar && (
          <InlineCalendar
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
          />
        )}
      </View>
      
      {/* Lease Terms Section */}
      <View style={{ marginBottom: 16, marginTop: 14 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 16, color: '#111827' }}>Lease Terms</Text>
        
        {/* Lease Type Toggle - Slightly Bigger */}
        <View style={{
          flexDirection: 'row',
          marginBottom: 20,
          backgroundColor: '#F3F4F6',
          borderRadius: 8,
          padding: 4,
        }}>
          <TouchableOpacity
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 12,
              paddingHorizontal: 14,
              borderRadius: 6,
              backgroundColor: leaseType === 'month-to-month' ? '#4F46E5' : 'transparent',
            }}
            onPress={() => handleLeaseTypeChange('month-to-month')}
          >
            <Home 
              size={18} 
              color={leaseType === 'month-to-month' ? '#FFFFFF' : '#6B7280'} 
            />
            <Text style={{
              fontSize: 15,
              fontWeight: '600',
              color: leaseType === 'month-to-month' ? '#FFFFFF' : '#6B7280',
              marginLeft: 7,
            }}>
              Month-to-Month
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 12,
              paddingHorizontal: 14,
              borderRadius: 6,
              backgroundColor: leaseType === 'fixed' ? '#4F46E5' : 'transparent',
            }}
            onPress={() => handleLeaseTypeChange('fixed')}
          >
            <FileText 
              size={18} 
              color={leaseType === 'fixed' ? '#FFFFFF' : '#6B7280'} 
            />
            <Text style={{
              fontSize: 15,
              fontWeight: '600',
              color: leaseType === 'fixed' ? '#FFFFFF' : '#6B7280',
              marginLeft: 7,
            }}>
              Fixed Lease
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Fixed Lease Duration Slider */}
        {leaseType === 'fixed' && (
          <View style={{ marginBottom: 4 }}>
            <View style={{ marginBottom: 16 }}>
              <Text style={{
                fontSize: 14,
                fontWeight: '500',
                color: '#4F46E5',
                textAlign: 'center',
                backgroundColor: '#EEF2FF',
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 6,
                marginHorizontal: 20,
              }}>
                Duration: {formatLeaseDuration(leaseDurationMonths)}
              </Text>
            </View>
            
            <View style={{ alignItems: 'center', paddingHorizontal: 16, marginBottom: 8 }}>
              <MultiSlider
                values={[leaseDurationMonths]}
                min={2}
                max={24}
                step={1}
                sliderLength={Dimensions.get('window').width - 80}
                onValuesChange={handleLeaseDurationChange}
                allowOverlap={false}
                snapped={true}
                selectedStyle={{
                  backgroundColor: '#6366f1',
                }}
                unselectedStyle={{
                  backgroundColor: '#E5E7EB',
                }}
                containerStyle={{
                  height: 30,
                  marginHorizontal: 0,
                  width: '100%',
                }}
                trackStyle={{
                  height: 4,
                  borderRadius: 2,
                }}
                markerStyle={{
                  height: 20,
                  width: 20,
                  borderRadius: 10,
                  backgroundColor: '#fff',
                  borderWidth: 2,
                  borderColor: '#6366f1',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.15,
                  shadowRadius: 1,
                  elevation: 1,
                }}
                pressedMarkerStyle={{
                  height: 22,
                  width: 22,
                  borderRadius: 11,
                }}
              />
            </View>
            
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingHorizontal: 24,
              marginTop: 8,
            }}>
              <Text style={{ fontSize: 11, color: '#9CA3AF' }}>2 months</Text>
              <Text style={{ fontSize: 11, color: '#9CA3AF' }}>24 months</Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
});

LeaseInfoStep.displayName = 'LeaseInfoStep';

export default LeaseInfoStep;
