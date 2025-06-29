import React, { useEffect } from 'react';
import { Modal, View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import Animated, { 
    useSharedValue, 
    useAnimatedStyle, 
    withTiming, 
    interpolate, 
    Extrapolate 
} from 'react-native-reanimated';
import { Eye, UserX, X, MessageCircle } from 'lucide-react-native';
import { type ProfileWithMatch, type CardPosition } from './NewMatchesSection';

interface MatchContextMenuProps {
    isVisible: boolean;
    targetPosition: CardPosition | null;
    match: ProfileWithMatch | null;
    onClose: () => void;
    onViewProfile: (profileId: string) => void;
    onUnmatch: (matchId: string, profileName: string) => void;
    onMessage: (matchId: string) => void;
}

const MENU_WIDTH = 180; // Adjust as needed
const MENU_ITEM_HEIGHT = 44; // Standard iOS-like height
const MENU_VERTICAL_OFFSET = 15; // Increased offset slightly to place below finger
const SCREEN_PADDING = 10; // Padding from screen edges
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const MatchContextMenu: React.FC<MatchContextMenuProps> = ({ 
    isVisible, 
    targetPosition, 
    match, 
    onClose, 
    onViewProfile, 
    onUnmatch,
    onMessage 
}) => {
    const progress = useSharedValue(0); // 0: hidden, 1: visible

    useEffect(() => {
        console.log(`[ContextMenu] Visibility changed: ${isVisible}, Target Position:`, targetPosition);
        progress.value = withTiming(isVisible ? 1 : 0, { duration: 250 });
    }, [isVisible, targetPosition, progress]); // Added targetPosition dependency

    const backdropAnimatedStyle = useAnimatedStyle(() => {
        return {
            opacity: interpolate(progress.value, [0, 1], [0, 0.4], Extrapolate.CLAMP),
        };
    });

    const menuAnimatedStyle = useAnimatedStyle(() => {
        const scale = interpolate(progress.value, [0, 0.6, 1], [0.8, 1.05, 1], Extrapolate.CLAMP);
        const opacity = interpolate(progress.value, [0, 0.5, 1], [0, 0, 1], Extrapolate.CLAMP);
        
        let top = -999;
        let left = -999;

        if (targetPosition) {
            // Position menu relative to the touch point (absoluteX, absoluteY)
            let calculatedTop = targetPosition.y + MENU_VERTICAL_OFFSET;
            let calculatedLeft = targetPosition.x - (MENU_WIDTH / 2);

            // Boundary checks to keep menu on screen
            // Check right boundary
            if (calculatedLeft + MENU_WIDTH > screenWidth - SCREEN_PADDING) {
                calculatedLeft = screenWidth - MENU_WIDTH - SCREEN_PADDING;
            }
            // Check left boundary
            if (calculatedLeft < SCREEN_PADDING) {
                calculatedLeft = SCREEN_PADDING;
            }
            // Check bottom boundary (estimate menu height)
            const estimatedMenuHeight = MENU_ITEM_HEIGHT * 2 + 1; // 2 items + separator
            if (calculatedTop + estimatedMenuHeight > screenHeight - SCREEN_PADDING) {
                // If too low, try positioning above the touch point
                calculatedTop = targetPosition.y - estimatedMenuHeight - MENU_VERTICAL_OFFSET;
            }
             // Check top boundary
             if (calculatedTop < SCREEN_PADDING) {
                 calculatedTop = SCREEN_PADDING;
             }

            top = calculatedTop;
            left = calculatedLeft;

            console.log(`[ContextMenu] Calculated Menu Position (from touch): top=${top}, left=${left}`);
        } else {
            console.log("[ContextMenu] Target position is null, menu hidden.");
        }
        
        return {
            position: 'absolute', 
            top,
            left,
            opacity,
            transform: [{ scale }],
            zIndex: 1, 
        };
    }, [targetPosition, progress]);

    // Return null if not visible AND animation is complete to avoid flicker
    // Or if the match data is missing
    if ((!isVisible && progress.value === 0) || !match) {
        return null;
    }

    const handleViewPress = () => {
        if (match?.profile?.id) {
            onViewProfile(match.profile.id);
        }
    };

    const handleUnmatchPress = () => {
        if (match?.match?.id && match?.profile?.name) {
            onUnmatch(match.match.id, match.profile.name);
        }
    };

    return (
        <Modal
            transparent
            visible={isVisible} // Use isVisible prop directly
            onRequestClose={onClose}
            animationType="none"
            statusBarTranslucent // Allow content under status bar
        >
            {/* Full screen backdrop pressable */}
            <Pressable style={styles.backdrop} onPress={onClose}>
                {/* Animated dark overlay */}
                <Animated.View style={[styles.backdropOverlay, backdropAnimatedStyle]} />
                
                {/* The Menu itself - positioned absolutely within the backdrop */}
                {/* Wrap in a basic View first if stopPropagation causes issues */}
                <Animated.View style={[styles.menuContainer, menuAnimatedStyle]}>
                   <Pressable style={styles.menuItem} onPress={handleViewPress}>
                       <Text style={styles.menuItemText}>View Profile</Text>
                       <Eye size={18} color="#333" />
                   </Pressable>
                   <View style={styles.separator} />
                   <Pressable style={styles.menuItem} onPress={() => {
                       if (match?.match?.id) {
                           onMessage(match.match.id);
                       }
                   }}>
                       <Text style={styles.menuItemText}>Message</Text>
                       <MessageCircle size={18} color="#333" />
                   </Pressable>
                   <View style={styles.separator} />
                   <Pressable style={[styles.menuItem, styles.destructiveItem]} onPress={handleUnmatchPress}>
                       <Text style={[styles.menuItemText, styles.destructiveText]}>Unmatch</Text>
                       <UserX size={18} color="#DC2626" />
                   </Pressable>
                </Animated.View>
            </Pressable>
        </Modal>
    );
};

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        // Removed justify/align to ensure full screen coverage for absolute positioning
    },
    backdropOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#000000',
        opacity: 0, // Start fully transparent, animation controls actual opacity
    },
    menuContainer: {
        position: 'absolute', // This is redundant if set in animated style but good for clarity
        width: MENU_WIDTH,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 5,
        overflow: 'hidden', 
        zIndex: 1, // Ensure menu is above backdrop
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        height: MENU_ITEM_HEIGHT,
    },
    menuItemText: {
        fontSize: 15,
        color: '#333333',
    },
    destructiveItem: {},
    destructiveText: {
        color: '#DC2626',
    },
    separator: {
        height: 1,
        backgroundColor: '#0000001A',
        marginHorizontal: 8,
    },
});

// Export the component
// export default MatchContextMenu; // Default export might conflict if NewMatchesSection also default exports 