import React from 'react';
import { View, Text, SectionList, StatusBar } from 'react-native';
import { TabScreenHeader } from '../layout';
import { MATCHES_SECTION_STYLES } from './MatchesSectionStyles';

// Dynamic section data interface
export interface DynamicSectionData {
  title: string;
  count: number;
  data: [{ type: string }];
  renderContent: () => React.ReactElement;
}

interface DynamicSectionListProps {
  sections: DynamicSectionData[];
  isLoading?: boolean;
  error?: string | null;
  loadingText?: string;
  errorText?: string;
}

export const DynamicSectionList: React.FC<DynamicSectionListProps> = ({
  sections,
  isLoading = false,
  error = null,
  loadingText = 'Loading...',
  errorText = 'An error occurred'
}) => {
  // Render section header with consistent styling
  const renderSectionHeader = ({ section }: { section: DynamicSectionData }) => (
    <View style={MATCHES_SECTION_STYLES.sectionHeader}>
      <Text style={MATCHES_SECTION_STYLES.sectionTitle}>
        {section.title}
        {section.count > 0 && (
          <Text>
            <View style={MATCHES_SECTION_STYLES.countBadge}>
              <Text style={MATCHES_SECTION_STYLES.countText}>{section.count}</Text>
            </View>
          </Text>
        )}
      </Text>
    </View>
  );

  // Render section item
  const renderItem = ({ section }: { item: { type: string }, section: DynamicSectionData }) => {
    return section.renderContent();
  };

  // Show loading state
  if (isLoading) {
    return (
      <View style={MATCHES_SECTION_STYLES.container}>
        <StatusBar barStyle="dark-content" />
        <TabScreenHeader />
        <View style={MATCHES_SECTION_STYLES.loadingContainer}>
          <Text style={MATCHES_SECTION_STYLES.loadingText}>{loadingText}</Text>
        </View>
      </View>
    );
  }

  // Show error state
  if (error) {
    return (
      <View style={MATCHES_SECTION_STYLES.container}>
        <StatusBar barStyle="dark-content" />
        <TabScreenHeader />
        <View style={MATCHES_SECTION_STYLES.errorContainer}>
          <Text style={MATCHES_SECTION_STYLES.errorText}>{errorText}: {error}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={MATCHES_SECTION_STYLES.container}>
      <StatusBar barStyle="dark-content" />
      <TabScreenHeader />
      
      <SectionList
        sections={sections}
        keyExtractor={(item, index) => item.type + index}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        stickySectionHeadersEnabled={true}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};