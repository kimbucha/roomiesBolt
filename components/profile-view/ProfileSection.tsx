import React, { ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ProfileSectionProps {
  title?: string;
  headerRight?: ReactNode;
  children: ReactNode;
  style?: object; // Allow passing additional styles
  titleStyle?: object;
  contentStyle?: object;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({
  title,
  headerRight,
  children,
  style,
  titleStyle,
  contentStyle
}) => {
  return (
    <View style={[styles.sectionContainer, style]}>
      {(title || headerRight) && (
        <View style={styles.sectionHeader}>
          {title && <Text style={[styles.sectionTitle, titleStyle]}>{title}</Text>}
          {headerRight}
        </View>
      )}
      <View style={contentStyle}>
         {children}
      </View>
    </View>
  );
};

// Use styles similar to the original sectionContainer and sectionTitle
const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 10,
    backgroundColor: '#FFFFFF',
    paddingVertical: 20, 
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    // Consider adding borderRadius and marginHorizontal for a card effect later
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
});

export default ProfileSection; 