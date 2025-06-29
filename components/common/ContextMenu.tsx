import React, { useEffect } from 'react';
import { Modal, View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolate, Extrapolate } from 'react-native-reanimated';

export interface ContextMenuItem {
  text: string;
  onPress: () => void;
  icon?: React.ReactNode;
  style?: 'default' | 'destructive';
}

interface ContextMenuProps {
  isVisible: boolean;
  targetPosition: { x: number; y: number };
  items: ContextMenuItem[];
  onClose: () => void;
}

const MENU_WIDTH = 180;
const ITEM_HEIGHT = 44;
const VERTICAL_OFFSET = 15;
const SCREEN_PADDING = 10;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const ContextMenu: React.FC<ContextMenuProps> = ({ isVisible, targetPosition, items, onClose }) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(isVisible ? 1 : 0, { duration: 200 });
  }, [isVisible]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0, 0.4], Extrapolate.CLAMP),
  }));

  const menuStyle = useAnimatedStyle(() => {
    const scale = interpolate(progress.value, [0, 0.6, 1], [0.8, 1.05, 1], Extrapolate.CLAMP);
    const opacity = interpolate(progress.value, [0, 0.5, 1], [0, 0, 1], Extrapolate.CLAMP);
    let top = targetPosition.y + VERTICAL_OFFSET;
    let left = targetPosition.x - MENU_WIDTH / 2;

    if (left + MENU_WIDTH > SCREEN_WIDTH - SCREEN_PADDING) {
      left = SCREEN_WIDTH - MENU_WIDTH - SCREEN_PADDING;
    }
    if (left < SCREEN_PADDING) {
      left = SCREEN_PADDING;
    }
    const estimatedHeight = items.length * ITEM_HEIGHT;
    if (top + estimatedHeight > SCREEN_HEIGHT - SCREEN_PADDING) {
      top = targetPosition.y - estimatedHeight - VERTICAL_OFFSET;
    }
    if (top < SCREEN_PADDING) {
      top = SCREEN_PADDING;
    }

    return {
      position: 'absolute',
      top,
      left,
      opacity,
      transform: [{ scale }],
      zIndex: 1,
    };
  });

  if (!isVisible && progress.value === 0) {
    return null;
  }

  return (
    <Modal transparent visible={isVisible} onRequestClose={onClose} animationType="none" statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Animated.View style={[styles.overlay, backdropStyle]} />
        <Animated.View style={[styles.menu, menuStyle]}>
          {items.map((item, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <View style={styles.separator} />}
              <Pressable
                style={[styles.menuItem, item.style === 'destructive' && styles.destructiveItem]}
                onPress={() => {
                  onClose();
                  item.onPress();
                }}
              >
                <View style={styles.menuTextContainer}>
                  {item.icon && <View style={styles.icon}>{item.icon}</View>}
                  <Text style={[styles.menuText, item.style === 'destructive' && styles.destructiveText]}>
                    {item.text}
                  </Text>
                </View>
              </Pressable>
            </React.Fragment>
          ))}
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  menu: {
    width: MENU_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
    overflow: 'hidden',
    zIndex: 1,
  },
  menuItem: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  menuTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuText: {
    fontSize: 16,
    color: '#333333',
  },
  icon: {
    marginRight: 10,
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  destructiveItem: {},
  destructiveText: {
    color: '#DC2626',
  },
});

export default ContextMenu;
