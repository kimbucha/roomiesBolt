import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styled } from 'nativewind';
import Dropdown from './Dropdown';
import { Filter, MapPin, Coins, Settings, Search } from 'lucide-react-native';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchable = styled(TouchableOpacity);

/**
 * DropdownSystem component showcasing the different dropdown configurations and styles
 */
const DropdownSystem: React.FC = () => {
  const [filterOpen, setFilterOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [priceOpen, setPriceOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Sample options
  const filterOptions = ['Roommate', 'Place', 'Both'];
  const locationOptions = ['Any', 'Has Place', 'Needs Place'];
  const priceOptions = ['$0-1K', '$1-2K', '$2-3K', '$3K+'];
  const settingsOptions = ['Notifications', 'Privacy', 'Theme', 'Log out'];

  return (
    <StyledView className="p-4 space-y-6 bg-gray-50">
      <StyledText className="text-xl font-bold text-gray-900">Dropdown Design System</StyledText>
      
      {/* Description */}
      <StyledView className="p-3 bg-blue-50 rounded-lg">
        <StyledText className="text-sm text-blue-700">
          A consistent dropdown design system using Tailwind CSS with various positioning options, widths, and animations.
        </StyledText>
      </StyledView>

      {/* Basic dropdowns row */}
      <StyledView className="space-y-2">
        <StyledText className="text-sm font-semibold text-gray-700">Basic Filters</StyledText>
        <StyledView className="flex-row space-x-2">
          <Dropdown
            label="Roommate"
            icon={<Search size={14} color="#4B5563" />}
            options={filterOptions}
            onSelect={(option) => console.log(option)}
            isOpen={filterOpen}
            onToggle={(open) => setFilterOpen(open)}
          />
          
          <Dropdown
            label="Any"
            icon={<MapPin size={14} color="#4B5563" />}
            options={locationOptions}
            onSelect={(option) => console.log(option)}
            isOpen={locationOpen}
            onToggle={(open) => setLocationOpen(open)}
          />
          
          <Dropdown
            label="$1-2K"
            icon={<Coins size={14} color="#4B5563" />}
            options={priceOptions}
            onSelect={(option) => console.log(option)}
            isOpen={priceOpen}
            onToggle={(open) => setPriceOpen(open)}
            position="bottom"
          />
        </StyledView>
      </StyledView>

      {/* Positioned dropdown */}
      <StyledView className="space-y-2">
        <StyledText className="text-sm font-semibold text-gray-700">Different Positions</StyledText>
        <StyledView className="flex-row justify-between">
          <Dropdown
            label="Bottom"
            options={['Option 1', 'Option 2', 'Option 3']}
            onSelect={(option) => console.log(option)}
            position="bottom"
          />
          
          <Dropdown
            label="Top"
            options={['Option 1', 'Option 2', 'Option 3']}
            onSelect={(option) => console.log(option)}
            position="top"
          />
          
          <Dropdown
            label="Right"
            options={['Option 1', 'Option 2', 'Option 3']}
            onSelect={(option) => console.log(option)}
            position="right"
          />
        </StyledView>
      </StyledView>

      {/* Width variations */}
      <StyledView className="space-y-2">
        <StyledText className="text-sm font-semibold text-gray-700">Width Variations</StyledText>
        <StyledView className="flex-row justify-between">
          <Dropdown
            label="Auto Width"
            options={['Short', 'Medium option', 'Very long dropdown option text']}
            onSelect={(option) => console.log(option)}
            menuWidth="auto"
          />
          
          <Dropdown
            label="Fixed Width"
            options={['Option 1', 'Option 2', 'Option 3']}
            onSelect={(option) => console.log(option)}
            menuWidth={150}
          />
        </StyledView>
      </StyledView>

      {/* Custom styling */}
      <StyledView className="space-y-2">
        <StyledText className="text-sm font-semibold text-gray-700">Custom Styling</StyledText>
        <StyledView className="flex-row justify-between">
          <Dropdown
            label="Settings"
            icon={<Settings size={14} color="#4B5563" />}
            options={settingsOptions}
            onSelect={(option) => console.log(option)}
            isOpen={settingsOpen}
            onToggle={(open) => setSettingsOpen(open)}
            menuClassName="bg-indigo-50 border border-indigo-100"
          />
        </StyledView>
      </StyledView>
    </StyledView>
  );
};

export default DropdownSystem;
