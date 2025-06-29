import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, Dimensions, StyleSheet, LayoutRectangle, findNodeHandle, UIManager } from 'react-native';
import { styled } from 'nativewind';
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
} from 'react-native-reanimated';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchable = styled(TouchableOpacity);

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface DropdownProps {
  label: string;
  icon?: React.ReactNode;
  options: string[];
  onSelect: (option: string) => void;
  isOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
  /** Width of dropdown menu in pixels or auto. Default is 'auto' */
  menuWidth?: number | 'auto';
  /** Apply custom classNames to dropdown menu */
  menuClassName?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({ 
  label, 
  icon, 
  options = [], 
  onSelect, 
  isOpen = false, 
  onToggle,
  menuWidth = 'auto',
  menuClassName = ''
}) => {
  // Refs for measuring absolute position
  const buttonRef = useRef<View>(null);
  
  // Store button position for positioning the dropdown
  const [buttonLayout, setButtonLayout] = useState<LayoutRectangle & { pageX: number, pageY: number }>({ 
    x: 0, y: 0, width: 0, height: 0, pageX: 0, pageY: 0 
  });
  const [menuLayout, setMenuLayout] = useState({ width: 0, height: 0 });
  const [measured, setMeasured] = useState(false);
  const [dropDirection, setDropDirection] = useState<'down' | 'up'>('down');
  
  // Animation values
  const animation = useSharedValue(0);
  
  useEffect(() => {
    // Simple timing animation
    animation.value = withTiming(isOpen ? 1 : 0, { 
      duration: 200
    });
  }, [isOpen]);

  // Icon rotation animation
  const rotateStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${animation.value * 180}deg` }],
  }));

  // Handle toggle press
  const handleTogglePress = () => {
    // Measure absolute position on each toggle
    measureButtonPosition();
    onToggle?.(!isOpen);
  };

  // Measure absolute position of button
  const measureButtonPosition = () => {
    if (buttonRef.current) {
      buttonRef.current.measure((x, y, width, height, pageX, pageY) => {
        const layout = { x, y, width, height, pageX, pageY };
        setButtonLayout(layout);
        
        // Determine if we should drop up or down based on available space
        const spaceBelow = SCREEN_HEIGHT - pageY - height;
        const estimatedMenuHeight = Math.min(options.length * 40, 200); // Estimate menu height
        
        if (spaceBelow < estimatedMenuHeight && pageY > estimatedMenuHeight) {
          setDropDirection('up');
        } else {
          setDropDirection('down');
        }
        
        setMeasured(true);
      });
    }
  };

  // Handle option selection
  const handleOptionSelect = (option: string) => {
    onSelect(option);
    onToggle?.(false);
  };

  // Calculate menu position
  const getMenuPosition = () => {
    // Use pageX and pageY for absolute positioning
    let top = dropDirection === 'down' 
      ? buttonLayout.pageY + buttonLayout.height + 4
      : buttonLayout.pageY - (menuLayout.height || 200) - 4;
    
    let left = buttonLayout.pageX;
    
    // Adjust if menu would go off right edge
    if (left + (menuLayout.width || buttonLayout.width) > SCREEN_WIDTH - 16) {
      left = Math.max(16, SCREEN_WIDTH - 16 - (menuLayout.width || buttonLayout.width));
    }
    
    // Ensure menu doesn't go off left edge
    if (left < 16) {
      left = 16;
    }
    
    return { top, left };
  };

  const menuPosition = getMenuPosition();

  return (
    <View>
      {/* Dropdown Button */}
      <StyledTouchable 
        ref={buttonRef}
        className="flex-row items-center bg-gray-100 px-2.5 py-1.5 rounded-full" 
        onPress={handleTogglePress}
        activeOpacity={0.7}
        onLayout={(event) => {
          const { width, height } = event.nativeEvent.layout;
          // Update width and height, but we'll get pageX and pageY on press
          setButtonLayout(prev => ({ ...prev, width, height }));
        }}
      >
        {icon}
        <StyledText 
          className="font-medium text-sm text-gray-600 mx-1 flex-shrink-0 whitespace-nowrap truncate"
          numberOfLines={1}
        >
          {label}
        </StyledText>
        <Animated.View style={rotateStyle}>
          <Text style={{ fontSize: 14, color: '#4B5563' }}>▼</Text>
        </Animated.View>
      </StyledTouchable>

      {/* Dropdown Menu Modal */}
      <Modal
        visible={isOpen && measured}
        transparent={true}
        animationType="fade"
        onRequestClose={() => onToggle?.(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => onToggle?.(false)}
        >
          <View 
            style={[
              styles.menuContainer,
              {
                position: 'absolute',
                top: menuPosition.top,
                left: menuPosition.left,
                minWidth: buttonLayout.width,
                maxWidth: menuWidth === 'auto' ? 200 : menuWidth,
              }
            ]}
            onLayout={(event) => {
              const { width, height } = event.nativeEvent.layout;
              setMenuLayout({ width, height });
            }}
          >
            <StyledView 
              className={`bg-white rounded-lg shadow-md overflow-hidden ${menuClassName}`} 
              style={{ 
                alignSelf: 'flex-start', 
                paddingHorizontal: 2,
                borderWidth: 1,
                borderColor: '#F3F4F6',
                width: '100%',
              }}
            >
              <ScrollView bounces={false} style={{ maxHeight: 200 }}>
                {options.map((option, index) => (
                  <StyledTouchable
                    key={option}
                    className={`py-2 px-3 flex-row items-center active:bg-gray-100 ${index !== 0 ? 'border-t border-gray-50' : ''}`}
                    onPress={() => handleOptionSelect(option)}
                    activeOpacity={0.7}
                  >
                    <StyledText 
                      className="font-medium text-sm text-gray-600"
                      numberOfLines={1}
                      style={{ paddingHorizontal: 2 }}
                    >
                      {option}
                    </StyledText>
                  </StyledTouchable>
                ))}
              </ScrollView>
            </StyledView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  menuContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  }
});

/**
 * Example usage:
 * 
 * <Dropdown
 *   label="Filter"
 *   icon={<FilterIcon size={14} color="#4B5563" />}
 *   options={["Option 1", "Option 2", "Option 3"]}
 *   onSelect={(option) => console.log(option)}
 *   isOpen={isOpen}
 *   onToggle={(open) => setIsOpen(open)}
 *   menuWidth="auto"
 *   menuClassName="my-custom-class"
 * />
 */

