import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  LayoutChangeEvent,
} from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

type Section = {
  title: string;
  data: React.ReactNode;
  count?: number;
};

type StickyHeaderListProps = {
  sections: Section[];
  containerStyle?: ViewStyle;
  sectionHeaderStyle?: ViewStyle;
  sectionHeaderTextStyle?: TextStyle;
  sectionCountStyle?: TextStyle;
  contentContainerStyle?: ViewStyle;
  stickySectionHeaderStyle?: ViewStyle;
  stickyBackgroundColor?: string;
  scrollY: SharedValue<number>;
};

const StickyHeaderList: React.FC<StickyHeaderListProps> = ({
  sections,
  containerStyle,
  sectionHeaderStyle,
  sectionHeaderTextStyle,
  sectionCountStyle,
  contentContainerStyle,
  stickySectionHeaderStyle,
  stickyBackgroundColor = 'white',
  scrollY,
}) => {
  const [sectionLayouts, setSectionLayouts] = useState<{
    [key: string]: { y: number; height: number };
  }>({});
  const [sectionHeaderLayouts, setSectionHeaderLayouts] = useState<{
    [key: string]: { height: number };
  }>({});

  const onSectionLayout = (title: string, event: LayoutChangeEvent) => {
    const layout = event.nativeEvent.layout;
    setSectionLayouts((prev) => ({
      ...prev,
      [title]: { y: layout.y, height: layout.height },
    }));
  };

  const onSectionHeaderLayout = (title: string, event: LayoutChangeEvent) => {
    const layout = event.nativeEvent.layout;
    setSectionHeaderLayouts((prev) => ({
      ...prev,
      [title]: { height: layout.height },
    }));
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Regular content with proper spacing for headers */}
      {sections.map((section, sectionIndex) => {
        const headerHeight = sectionHeaderLayouts[section.title]?.height || 45;
        
        return (
          <View 
            key={`content-${section.title}`}
            style={styles.sectionContainer}
            onLayout={(e) => onSectionLayout(section.title, e)}
          >
            {/* Placeholder for header space */}
            <View style={{ height: headerHeight }} />
            
            {/* Actual content */}
            <View style={[styles.sectionContent, contentContainerStyle]}>
              {section.data}
            </View>
          </View>
        );
      })}
      
      {/* Sticky headers rendered separately on top */}
      {sections.map((section, sectionIndex) => {
        // Create animated style for header
        const headerAnimatedStyle = useAnimatedStyle(() => {
          // Get the section's y position
          const sectionY = sectionLayouts[section.title]?.y || 0;
          const headerHeight = sectionHeaderLayouts[section.title]?.height || 45;
          
          // Current scroll position relative to this section
          const offsetY = scrollY.value - sectionY;
          
          // Get the next section's y position if available
          const nextSectionY = 
            sectionIndex < sections.length - 1
              ? sectionLayouts[sections[sectionIndex + 1]?.title]?.y || Number.MAX_VALUE
              : Number.MAX_VALUE;
              
          // Distance to next section
          const distanceToNextSection = nextSectionY - sectionY;
          
          // Calculate how much the header should translate
          let translateY = 0;
          
          if (offsetY <= 0) {
            // Not yet reached this section, stay at original position
            translateY = 0;
          } else if (offsetY > 0 && offsetY < distanceToNextSection - headerHeight) {
            // In the sticky zone - stick to the top
            translateY = offsetY;
          } else {
            // Being pushed up by next header
            translateY = distanceToNextSection - headerHeight;
          }
          
          // Higher z-index for active headers that should be sticky
          const zIndex = offsetY > 0 ? 1000 - sectionIndex : sections.length - sectionIndex;
          
          // Full opacity for sticky headers, gradual fade-in for headers coming into view
          const opacity = offsetY > 0 ? 1 : interpolate(
            offsetY,
            [-20, 0],
            [0.8, 1],
            { extrapolateRight: Extrapolate.CLAMP, extrapolateLeft: Extrapolate.CLAMP }
          );
          
          return {
            transform: [{ translateY }],
            zIndex,
            position: 'absolute',
            top: sectionY,
            left: 0,
            right: 0,
            opacity,
            // Add elevation for Android
            elevation: offsetY > 0 ? 5 : 0,
          };
        });
        
        return (
          <Animated.View 
            key={`header-${section.title}`}
            style={[
              styles.sectionHeader,
              sectionHeaderStyle,
              stickySectionHeaderStyle,
              { backgroundColor: stickyBackgroundColor },
              headerAnimatedStyle
            ]}
            onLayout={(e) => onSectionHeaderLayout(section.title, e)}
          >
            <Text style={[styles.sectionTitle, sectionHeaderTextStyle]}>
              {section.title}
            </Text>
            {section.count !== undefined && (
              <View style={styles.countContainer}>
                <Text style={[styles.countText, sectionCountStyle]}>
                  {section.count}
                </Text>
              </View>
            )}
          </Animated.View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  sectionContainer: {
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
    // Add shadow properties
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
  sectionContent: {
    width: '100%',
  },
});

export default StickyHeaderList; 