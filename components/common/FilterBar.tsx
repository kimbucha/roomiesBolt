import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { Home, Search, Filter, X } from 'lucide-react-native';
import { usePreferencesStore } from '../../store/preferencesStore';

interface FilterBarProps {
  onFilterPress: (filterType: string) => void;
  activeFilters?: string[];
  isPremium?: boolean;
}

const { width } = Dimensions.get('window');

export const FilterBar: React.FC<FilterBarProps> = ({
  onFilterPress,
  activeFilters = [],
  isPremium = false,
}) => {
  const { searchFilters } = usePreferencesStore();
  
  // Get filter label based on current values
  const getLookingForLabel = () => {
    switch(searchFilters.lookingFor) {
      case 'roommate': return 'Roommate';
      case 'place': return 'Place';
      default: return 'Looking For';
    }
  };
  
  const getHasPlaceLabel = () => {
    return searchFilters.hasPlace ? 'Has Place' : 'Any Place';
  };
  
  const getRoomTypeLabel = () => {
    if (!searchFilters.placeDetails || !searchFilters.placeDetails.roomType) return 'Room Type';
    switch(searchFilters.placeDetails.roomType) {
      case 'private': return 'Private Room';
      case 'shared': return 'Shared Room';
      case 'any': return 'Any Room';
      default: return 'Room Type';
    }
  };
  
  const getGenderLabel = () => {
    switch(searchFilters.gender) {
      case 'male': return 'Male';
      case 'female': return 'Female';
      case 'any': return 'Any Gender';
      default: return 'Any Gender';
    }
  };
  
  // Filter options
  const filters = [
    { id: 'lookingFor', label: getLookingForLabel(), icon: Search },
    { id: 'gender', label: getGenderLabel(), icon: null },
    { id: 'hasPlace', label: getHasPlaceLabel(), icon: Home },
    { id: 'budget', label: `$${searchFilters.budget.min}-${searchFilters.budget.max}`, icon: null },
    { id: 'location', label: searchFilters.location && searchFilters.location.length > 0 ? searchFilters.location[0] : 'Location', icon: null },
    { id: 'roomType', label: getRoomTypeLabel(), icon: null, premiumOnly: !searchFilters.hasPlace },
    { id: 'amenities', label: 'Amenities', icon: null, premiumOnly: true },
  ];
  
  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filters.map((filter) => {
          // Skip premium filters for non-premium users
          if (filter.premiumOnly && !isPremium) return null;
          
          const isActive = activeFilters.includes(filter.id);
          
          return (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterButton,
                isActive && styles.activeFilterButton
              ]}
              onPress={() => onFilterPress(filter.id)}
            >
              <View style={styles.filterContent}>
                {filter.icon && (
                  <filter.icon 
                    size={16} 
                    color={isActive ? '#FFFFFF' : '#4B5563'} 
                    style={styles.filterIcon}
                  />
                )}
                <Text 
                  style={[
                    styles.filterText,
                    isActive && styles.activeFilterText
                  ]}
                >
                  {filter.label}
                </Text>
                <Text
                  style={{ 
                    fontSize: 12, 
                    color: isActive ? '#FFFFFF' : '#4B5563',
                    marginLeft: 4
                  }}
                >
                  ▼
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingVertical: 12,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  filterButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activeFilterButton: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  filterContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterIcon: {
    marginRight: 4,
  },
  filterText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#4B5563',
    marginRight: 4,
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
});
