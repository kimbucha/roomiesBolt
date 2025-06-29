import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface CardProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  onPress?: () => void;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  variant?: 'default' | 'outlined' | 'elevated';
  fullWidth?: boolean;
  style?: any;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  children,
  onPress,
  leftIcon,
  rightIcon,
  variant = 'default',
  fullWidth = false,
  style,
}) => {
  const getCardStyle = () => {
    switch (variant) {
      case 'default':
        return styles.defaultCard;
      case 'outlined':
        return styles.outlinedCard;
      case 'elevated':
        return styles.elevatedCard;
      default:
        return styles.defaultCard;
    }
  };

  const CardContainer = onPress ? TouchableOpacity : View;

  return (
    <CardContainer
      style={[
        styles.card,
        getCardStyle(),
        fullWidth && styles.fullWidth,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {(title || subtitle || leftIcon || rightIcon) && (
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}
            <View>
              {title && <Text style={styles.title}>{title}</Text>}
              {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </View>
          </View>
          {rightIcon && <View style={styles.rightIconContainer}>{rightIcon}</View>}
        </View>
      )}
      <View style={styles.content}>{children}</View>
    </CardContainer>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 8,
    backgroundColor: '#FFFFFF',
  },
  defaultCard: {
    backgroundColor: '#FFFFFF',
  },
  outlinedCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  elevatedCard: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  fullWidth: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftIconContainer: {
    marginRight: 12,
  },
  rightIconContainer: {},
  title: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: '#1F2937',
  },
  subtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  content: {
    padding: 16,
  },
});
