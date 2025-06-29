import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  Platform,
} from 'react-native';

type Section = {
  title: string;
  data: React.ReactNode;
  count?: number;
};

type FlatListItem = {
  type: 'header' | 'content';
  title?: string;
  count?: number;
  content?: React.ReactNode;
  sectionIndex: number;
};

type ScrollableContainerProps = {
  sections: Section[];
  containerStyle?: any;
  contentContainerStyle?: any;
  sectionHeaderStyle?: any;
  stickyBackgroundColor?: string;
};

const ScrollableContainer: React.FC<ScrollableContainerProps> = ({
  sections,
  containerStyle,
  contentContainerStyle,
  sectionHeaderStyle,
  stickyBackgroundColor = 'white',
}) => {
  // Process sections into a flat array for FlatList with headers and content
  const flattenedData: FlatListItem[] = [];
  const stickyHeaderIndices: number[] = [];
  
  sections.forEach((section, index) => {
    // Add header
    const headerIndex = flattenedData.length;
    stickyHeaderIndices.push(headerIndex);
    
    flattenedData.push({
      type: 'header',
      title: section.title,
      count: section.count,
      sectionIndex: index
    });
    
    // Add content
    flattenedData.push({
      type: 'content',
      content: section.data,
      sectionIndex: index
    });
  });
  
  const renderItem = ({ item }: { item: FlatListItem }) => {
    if (item.type === 'header') {
      return (
        <View 
          style={[
            styles.sectionHeader, 
            { backgroundColor: stickyBackgroundColor },
            sectionHeaderStyle
          ]}
        >
          <Text style={styles.sectionTitle}>{item.title}</Text>
          {item.count !== undefined && (
            <View style={styles.countContainer}>
              <Text style={styles.countText}>{item.count}</Text>
            </View>
          )}
        </View>
      );
    } else {
      return (
        <View style={[styles.sectionContent, contentContainerStyle]}>
          {item.content}
        </View>
      );
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <FlatList
        data={flattenedData}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.type}-${item.sectionIndex}-${index}`}
        stickyHeaderIndices={stickyHeaderIndices}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
        // Add iOS-specific props for better scrolling behavior
        {...(Platform.OS === 'ios' && {
          contentInsetAdjustmentBehavior: 'automatic'
        })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  sectionContent: {
    width: '100%',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    width: '100%',
    height: 45,
    // Add shadow for visual separation
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
  },
  countContainer: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  countText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4F46E5',
  },
});

export default ScrollableContainer; 