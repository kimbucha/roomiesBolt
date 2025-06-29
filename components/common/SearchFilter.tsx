import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { Search, Filter, X } from 'lucide-react-native';
import { Input } from './Input';
import { Button } from './Button';

interface FilterOption {
  id: string;
  label: string;
  options: string[];
  multiSelect?: boolean;
  selected: string[];
}

interface RangeFilter {
  id: string;
  label: string;
  min: number;
  max: number;
  step: number;
  value: [number, number];
}

interface SearchFilterProps {
  onSearch: (query: string) => void;
  onFilter: (filters: any) => void;
  initialQuery?: string;
}

const SearchFilter: React.FC<SearchFilterProps> = ({
  onSearch,
  onFilter,
  initialQuery = '',
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<number>(0);
  
  // Example filter options
  const [filterOptions, setFilterOptions] = useState<FilterOption[]>([
    {
      id: 'university',
      label: 'University',
      options: ['Stanford University', 'UC Berkeley', 'UCLA', 'USC', 'UCSF', 'Other'],
      multiSelect: false,
      selected: [],
    },
    {
      id: 'year',
      label: 'Year',
      options: ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate', 'Other'],
      multiSelect: true,
      selected: [],
    },
    {
      id: 'lifestyle',
      label: 'Lifestyle',
      options: ['Early riser', 'Night owl', 'Quiet', 'Social', 'Clean', 'Messy', 'Non-smoker', 'Smoker'],
      multiSelect: true,
      selected: [],
    },
  ]);
  
  // Example range filters
  const [rangeFilters, setRangeFilters] = useState<RangeFilter[]>([
    {
      id: 'budget',
      label: 'Budget',
      min: 500,
      max: 3000,
      step: 100,
      value: [800, 1500],
    },
  ]);
  
  const handleSearch = () => {
    onSearch(query);
  };
  
  const toggleFilter = () => {
    setShowFilters(!showFilters);
  };
  
  const handleOptionSelect = (filterId: string, option: string) => {
    setFilterOptions(
      filterOptions.map((filter) => {
        if (filter.id === filterId) {
          if (filter.multiSelect) {
            // Toggle selection for multi-select filters
            const selected = filter.selected.includes(option)
              ? filter.selected.filter((item) => item !== option)
              : [...filter.selected, option];
            return { ...filter, selected };
          } else {
            // Single select behavior
            const selected = filter.selected.includes(option) ? [] : [option];
            return { ...filter, selected };
          }
        }
        return filter;
      })
    );
    
    updateActiveFiltersCount();
  };
  
  const handleRangeChange = (filterId: string, value: [number, number]) => {
    setRangeFilters(
      rangeFilters.map((filter) => {
        if (filter.id === filterId) {
          return { ...filter, value };
        }
        return filter;
      })
    );
    
    updateActiveFiltersCount();
  };
  
  const updateActiveFiltersCount = () => {
    const optionFiltersCount = filterOptions.reduce(
      (count, filter) => count + (filter.selected.length > 0 ? 1 : 0),
      0
    );
    
    const rangeFiltersCount = rangeFilters.reduce(
      (count, filter) =>
        count +
        (filter.value[0] !== filter.min || filter.value[1] !== filter.max ? 1 : 0),
      0
    );
    
    setActiveFilters(optionFiltersCount + rangeFiltersCount);
  };
  
  const applyFilters = () => {
    const filters = {
      options: filterOptions.reduce(
        (acc, filter) => ({
          ...acc,
          [filter.id]: filter.selected,
        }),
        {}
      ),
      ranges: rangeFilters.reduce(
        (acc, filter) => ({
          ...acc,
          [filter.id]: filter.value,
        }),
        {}
      ),
    };
    
    onFilter(filters);
    setShowFilters(false);
  };
  
  const resetFilters = () => {
    setFilterOptions(
      filterOptions.map((filter) => ({
        ...filter,
        selected: [],
      }))
    );
    
    setRangeFilters(
      rangeFilters.map((filter) => ({
        ...filter,
        value: [filter.min, filter.max],
      }))
    );
    
    setActiveFilters(0);
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Input
          label=""
          placeholder="Search roommates..."
          value={query}
          onChangeText={setQuery}
          leftIcon={<Search size={20} color="#6B7280" />}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          containerStyle={styles.searchInput}
        />
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilters > 0 && styles.activeFilterButton,
          ]}
          onPress={toggleFilter}
        >
          <Filter size={20} color={activeFilters > 0 ? '#FFFFFF' : '#6B7280'} />
          {activeFilters > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilters}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      
      {showFilters && (
        <View style={styles.filtersContainer}>
          <View style={styles.filtersHeader}>
            <Text style={styles.filtersTitle}>Filters</Text>
            <TouchableOpacity onPress={toggleFilter}>
              <X size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.filtersContent}>
            {filterOptions.map((filter) => (
              <View key={filter.id} style={styles.filterSection}>
                <Text style={styles.filterLabel}>{filter.label}</Text>
                <View style={styles.optionsContainer}>
                  {filter.options.map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.optionButton,
                        filter.selected.includes(option) && styles.selectedOption,
                      ]}
                      onPress={() => handleOptionSelect(filter.id, option)}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          filter.selected.includes(option) && styles.selectedOptionText,
                        ]}
                      >
                        {option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
            
            {/* Range filters would go here - would need a slider component */}
            {rangeFilters.map((filter) => (
              <View key={filter.id} style={styles.filterSection}>
                <Text style={styles.filterLabel}>
                  {filter.label}: ${filter.value[0]} - ${filter.value[1]}
                </Text>
                {/* Slider component would go here */}
                <View style={styles.rangeContainer}>
                  <Text style={styles.rangeValue}>${filter.min}</Text>
                  <View style={styles.rangeSlider}>
                    {/* Placeholder for actual slider component */}
                    <View style={styles.rangeTrack}>
                      <View style={styles.rangeSelected} />
                    </View>
                  </View>
                  <Text style={styles.rangeValue}>${filter.max}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
          
          <View style={styles.filtersActions}>
            <Button
              title="Reset"
              variant="outline"
              onPress={resetFilters}
              style={styles.resetButton}
            />
            <Button
              title="Apply Filters"
              variant="primary"
              onPress={applyFilters}
              style={styles.applyButton}
            />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginRight: 8,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeFilterButton: {
    backgroundColor: '#4B5563',
  },
  filterBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  filtersContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  filtersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  filtersTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  filtersContent: {
    maxHeight: 300,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  optionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
    marginBottom: 8,
  },
  selectedOption: {
    backgroundColor: '#3B82F6',
  },
  optionText: {
    fontSize: 14,
    color: '#4B5563',
  },
  selectedOptionText: {
    color: '#FFFFFF',
  },
  rangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  rangeValue: {
    fontSize: 14,
    color: '#6B7280',
    width: 50,
  },
  rangeSlider: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
  },
  rangeTrack: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
  },
  rangeSelected: {
    position: 'absolute',
    height: 4,
    backgroundColor: '#3B82F6',
    borderRadius: 2,
    left: '20%',
    right: '20%',
  },
  filtersActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  resetButton: {
    flex: 1,
    marginRight: 8,
  },
  applyButton: {
    flex: 1,
    marginLeft: 8,
  },
});

export default SearchFilter;
