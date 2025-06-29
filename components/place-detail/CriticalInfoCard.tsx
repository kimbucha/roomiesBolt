import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MapPin, DollarSign, Calendar, Home, Users, Building } from 'lucide-react-native';

interface CriticalInfoCardProps {
  title: string;
  price: string;
  location: string;
  roomType: string;
  isAvailable?: boolean;
  moveInDate?: string;
  leaseLength?: string;
  bedCount?: number;
  bathCount?: number;
  isFurnished?: boolean;
}

export const CriticalInfoCard: React.FC<CriticalInfoCardProps> = ({
  title,
  price,
  location,
  roomType,
  isAvailable = true,
  moveInDate,
  leaseLength,
  bedCount = 1,
  bathCount = 1,
  isFurnished = false
}) => {
  const getRoomTypeIcon = () => {
    switch (roomType.toLowerCase()) {
      case 'private':
        return <Home size={16} color="#4F46E5" />;
      case 'shared':
        return <Users size={16} color="#4F46E5" />;
      case 'studio':
        return <Building size={16} color="#4F46E5" />;
      default:
        return <Home size={16} color="#4F46E5" />;
    }
  };
  
  const formatLeaseDate = (date: string) => {
    // If it's a long date like "October 15, 2023", shorten it
    if (date.length > 10) {
      // Try to extract just the month and day if it's a standard date format
      const parts = date.split(' ');
      if (parts.length >= 2) {
        // Return just the month abbreviation and day
        return `${parts[0].substring(0, 3)} ${parts[1].replace(',', '')}`;
      }
    }
    return date;
  };
  
  return (
    <View style={styles.container}>
      {/* Title */}
      {title && (
        <Text style={styles.titleText}>{title}</Text>
      )}
      
      {/* Price display - without Book Now button */}
      <View style={styles.priceContainer}>
        <View style={styles.priceGroup}>
          <DollarSign size={20} color="#4F46E5" style={styles.dollarIcon} />
          <Text style={styles.priceText}>
            {/* Remove all $ signs since the DollarSign icon is already shown */}
            {price.replace(/\$/g, '')}
          </Text>
        </View>
      </View>
      
      {/* Combined info grid as horizontal rows */}
      <View style={styles.infoGrid}>
        {/* Row 1: Location only */}
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <MapPin size={16} color="#4B5563" />
            <Text style={styles.infoText} numberOfLines={1}>{location}</Text>
          </View>
        </View>
        
        {/* Row 2: Lease info */}
        {(moveInDate || leaseLength) && (
          <View style={styles.leaseInfoRow}>
            {moveInDate && (
              <View style={styles.leaseInfoItem}>
                <Calendar size={14} color="#4B5563" />
                <Text style={styles.leaseDateText} numberOfLines={1}>
                  Move in: <Text style={styles.dateValue}>{formatLeaseDate(moveInDate)}</Text>
                </Text>
              </View>
            )}
            
            {leaseLength && (
              <View style={styles.leaseInfoItem}>
                <Calendar size={14} color="#4B5563" />
                <Text style={styles.leaseDateText} numberOfLines={1}>
                  Lease: <Text style={styles.dateValue}>{leaseLength}</Text>
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
      
      {/* Tags at bottom in a row */}
      <View style={styles.tagContainer}>
        <View style={[
          styles.roomTypeTag,
          roomType.toLowerCase() === 'private' ? styles.privateTag : 
          roomType.toLowerCase() === 'shared' ? styles.sharedTag :
          styles.studioTag
        ]}>
          <Text style={styles.roomTypeTagText}>
            {roomType.charAt(0).toUpperCase() + roomType.slice(1)}
          </Text>
        </View>
        
        {/* Bed count tag */}
        <View style={styles.infoTag}>
          <Text style={styles.infoTagText}>
            {bedCount} {bedCount === 1 ? 'Bed' : 'Beds'}
          </Text>
        </View>
        
        {/* Bath count tag */}
        <View style={styles.infoTag}>
          <Text style={styles.infoTagText}>
            {bathCount} {bathCount === 1 ? 'Bath' : 'Baths'}
          </Text>
        </View>
        
        {/* Furnished tag */}
        <View style={[styles.infoTag, isFurnished ? styles.furnishedTag : styles.unfurnishedTag]}>
          <Text style={styles.infoTagText}>
            {isFurnished ? 'Furnished' : 'Unfurnished'}
          </Text>
        </View>
        
        <View style={styles.availabilityTag}>
          <View style={[
            styles.availabilityDot,
            isAvailable ? styles.availableDot : styles.soonDot
          ]} />
          <Text style={styles.availabilityTagText}>
            {isAvailable ? "Available Now" : "Available Soon"}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    paddingBottom: 12,
    marginHorizontal: 16,
    marginTop: -30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  titleText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 10,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    justifyContent: 'space-between',
  },
  priceGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dollarIcon: {
    marginRight: 4,
  },
  priceText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#4F46E5',
    letterSpacing: -0.5,
  },
  infoGrid: {
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    flex: 1,
  },
  infoItemWithTag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  infoItemWithDate: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  leaseInfoRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    marginTop: 2,
  },
  leaseInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 14,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#4B5563',
    marginLeft: 6,
    fontWeight: '500',
  },
  leaseDateText: {
    fontSize: 13,
    color: '#4B5563',
    marginLeft: 4,
    fontWeight: '500',
  },
  dateValue: {
    fontSize: 12,
    fontWeight: '400',
  },
  availabilityText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  availableNow: {
    color: '#10B981',
  },
  availableSoon: {
    color: '#F59E0B',
  },
  tagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    marginTop: 4,
    marginBottom: 4,
  },
  roomTypeTag: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 16,
    marginRight: 6,
    marginBottom: 6,
  },
  privateTag: {
    backgroundColor: '#EEF2FF',
  },
  sharedTag: {
    backgroundColor: '#ECFDF5',
  },
  studioTag: {
    backgroundColor: '#FEF3C7',
  },
  roomTypeTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4F46E5',
  },
  availabilityTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 16,
    marginBottom: 6,
  },
  availabilityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  availableDot: {
    backgroundColor: '#10B981',
  },
  soonDot: {
    backgroundColor: '#F59E0B',
  },
  availabilityTagText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6B7280',
  },
  infoTag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 16,
    marginRight: 6,
    marginBottom: 6,
  },
  furnishedTag: {
    backgroundColor: '#E0F2FE',
  },
  unfurnishedTag: {
    backgroundColor: '#FEF3C7',
  },
  infoTagText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#4B5563',
  },
});

export default CriticalInfoCard; 