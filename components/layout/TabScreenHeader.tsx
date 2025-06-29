import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppLogo from '../common/AppLogo'; // Assuming AppLogo is the standard left component
import { HEADER_CONSTANTS } from '../../constants/headerConfig';

interface TabScreenHeaderProps {
  rightContent?: React.ReactNode;
  logoAlignment?: 'left' | 'center'; // Add alignment prop
}

// Define styles outside the component, accepting insets as an argument
const createStyles = (insets: { top: number; bottom: number; left: number; right: number; }) => 
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      backgroundColor: '#FFFFFF',
      borderBottomWidth: 1,
      borderBottomColor: '#F3F4F6',
      width: '100%',
      // Height and paddingTop will be applied dynamically in the component
    },
    leftContainer: {
      flex: 1,
      alignItems: 'flex-start',
    },
    rightContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      minWidth: 50,
    },
    rightContainerAbsolute: {
      position: 'absolute',
      right: 16,
      top: insets.top, // Use inset passed as argument
      bottom: 0,
      height: HEADER_CONSTANTS.HEADER_HEIGHT, // Ensure the absolute content aligns within the standard header height part
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      zIndex: 1, // Ensure it stays above the centered logo if overlapping
    },
});

const TabScreenHeader: React.FC<TabScreenHeaderProps> = ({ 
  rightContent,
  logoAlignment = 'left' // Default to left alignment
}) => {
  const insets = useSafeAreaInsets();
  const styles = createStyles(insets); // Create styles with the hook value

  const isCentered = logoAlignment === 'center';

  return (
    <View 
      style={[
        styles.container, 
        {
          height: HEADER_CONSTANTS.HEADER_HEIGHT + insets.top,
          paddingTop: insets.top,
          // Adjust justification based on alignment
          justifyContent: isCentered ? 'center' : 'space-between',
        }
      ]}
    >
      {/* Conditional rendering based on alignment */}
      {isCentered ? (
        <>
          {/* Pass style directly, no need for dynamic inset here anymore */}
          <View style={styles.rightContainerAbsolute}>
            {rightContent}
          </View>
          {/* Centered Logo */}
          <AppLogo size="medium" variant="default" />
        </>
      ) : (
        <>
          {/* Left Aligned Logo */}
          <View style={styles.leftContainer}>
            <AppLogo size="medium" variant="default" />
          </View>
          {/* Standard Right Content */}
          <View style={styles.rightContainer}>
            {rightContent}
          </View>
        </>
      )}
    </View>
  );
};

export default TabScreenHeader; 