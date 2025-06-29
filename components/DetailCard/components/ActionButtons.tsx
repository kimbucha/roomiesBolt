import React from 'react';
import { 
  View, 
  TouchableOpacity, 
  StyleSheet 
} from 'react-native';
import { X, Heart, Star } from 'lucide-react-native';

interface ActionButtonsProps {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onSuperLike?: () => void;
  size?: 'small' | 'medium' | 'large';
}

/**
 * A component for displaying action buttons (like, dislike, super like)
 */
export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onSwipeLeft,
  onSwipeRight,
  onSuperLike,
  size = 'medium'
}) => {
  // Determine button sizes based on the size prop
  const getButtonSize = () => {
    switch (size) {
      case 'small':
        return {
          container: styles.smallContainer,
          button: styles.smallButton,
          iconSize: 20
        };
      case 'large':
        return {
          container: styles.largeContainer,
          button: styles.largeButton,
          iconSize: 30
        };
      case 'medium':
      default:
        return {
          container: styles.container,
          button: styles.button,
          iconSize: 24
        };
    }
  };
  
  const { container, button, iconSize } = getButtonSize();
  
  return (
    <View style={container}>
      <TouchableOpacity 
        style={[button, styles.dislikeButton]} 
        onPress={onSwipeLeft}
      >
        <X size={iconSize} color="#FF4C4C" />
      </TouchableOpacity>
      
      {onSuperLike && (
        <TouchableOpacity 
          style={[button, styles.superLikeButton]} 
          onPress={onSuperLike}
        >
          <Star size={iconSize} color="#00E5FF" />
        </TouchableOpacity>
      )}
      
      <TouchableOpacity 
        style={[button, styles.likeButton]} 
        onPress={onSwipeRight}
      >
        <Heart size={iconSize} color="#4CD964" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20
  },
  smallContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10
  },
  largeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 30
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  smallButton: {
    width: 40,
    height: 40,
    borderRadius: 20
  },
  largeButton: {
    width: 80,
    height: 80,
    borderRadius: 40
  },
  likeButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#4CD964'
  },
  dislikeButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#FF4C4C'
  },
  superLikeButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#00E5FF'
  }
}); 