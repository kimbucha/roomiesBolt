import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Animated, 
  Dimensions,
  ScrollView,
  StyleSheet
} from 'react-native';
import { X } from 'lucide-react-native';
import { useGestureHandler } from '../hooks/useGestureHandler';
import { useVelocityTracker } from '../hooks/useVelocityTracker';
import { useDebugLogger } from '../utils/loggerUtils';

interface DetailSheetProps {
  isExpanded: boolean;
  onDismiss: () => void;
  vibrationEnabled: boolean;
  children: React.ReactNode;
  renderHeader?: () => React.ReactNode;
  showDebugOverlay?: boolean;
}

/**
 * A bottom sheet component with gesture handling for dismissal
 */
export const DetailSheet: React.FC<DetailSheetProps> = ({
  isExpanded,
  onDismiss,
  vibrationEnabled,
  children,
  renderHeader,
  showDebugOverlay = false
}) => {
  // Get screen dimensions
  const { height: screenHeight } = Dimensions.get('window');
  
  // Calculate sheet height (70% of screen height)
  const detailSheetHeight = screenHeight * 0.7;
  
  // Animation value for the sheet position
  const infoSlideAnim = useRef(new Animated.Value(0)).current;
  
  // Track if we're currently dragging
  const [isDragging, setIsDragging] = useState(false);
  
  // Initialize velocity tracker
  const velocityTracker = useVelocityTracker(8, 10);
  
  // Initialize logger
  const logger = useDebugLogger();
  
  // Set up gesture handler
  const { panHandlers } = useGestureHandler({
    detailSheetHeight,
    vibrationEnabled,
    onDismiss,
    logger,
    velocityTracker,
    infoSlideAnim,
    setIsDragging
  });
  
  // Animate the sheet in when expanded changes
  useEffect(() => {
    if (isExpanded) {
      Animated.spring(infoSlideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 7
      }).start();
    }
  }, [isExpanded, infoSlideAnim]);
  
  // Don't render if not expanded
  if (!isExpanded) return null;
  
  return (
    <Animated.View 
      style={[
        styles.container,
        {
          transform: [
            { 
              translateY: infoSlideAnim.interpolate({
                inputRange: [0, detailSheetHeight],
                outputRange: [0, detailSheetHeight],
                extrapolate: 'clamp'
              }) 
            }
          ]
        }
      ]}
      {...panHandlers}
    >
      {/* Handle for dragging */}
      <View style={styles.handleContainer}>
        <View style={styles.handle} />
      </View>
      
      {/* Header with close button */}
      <View style={styles.header}>
        {renderHeader ? renderHeader() : <View />}
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={onDismiss}
          hitSlop={{ top: 20, right: 20, bottom: 20, left: 20 }}
        >
          <X size={24} color="#000" />
        </TouchableOpacity>
      </View>
      
      {/* Content */}
      <ScrollView 
        style={styles.content}
        bounces={false}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!isDragging}
      >
        {children}
      </ScrollView>
      
      {/* Debug overlay */}
      {showDebugOverlay && (
        <View style={styles.debugOverlay}>
          <Text style={styles.debugText}>
            {logger.getLogs().slice(-3).map((log, index) => (
              <Text key={index}>{log.message}{'\n'}</Text>
            ))}
          </Text>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    overflow: 'hidden'
  },
  handleContainer: {
    width: '100%',
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E0E0E0'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10
  },
  closeButton: {
    padding: 5
  },
  content: {
    flex: 1,
    paddingHorizontal: 20
  },
  debugOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 5
  },
  debugText: {
    color: '#fff',
    fontSize: 10
  }
}); 