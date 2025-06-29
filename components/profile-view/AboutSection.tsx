import React from 'react';
import { Text, StyleSheet } from 'react-native';
import ProfileSection from './ProfileSection';

interface AboutSectionProps {
  bio: string | null | undefined;
}

const AboutSection: React.FC<AboutSectionProps> = ({ bio }) => {
  return (
    <ProfileSection title="About Me">
      <Text style={styles.sectionContentText}>
        {bio || 'No bio provided.'}
      </Text>
    </ProfileSection>
  );
};

// Copy relevant styles
const styles = StyleSheet.create({
  sectionContentText: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
    paddingHorizontal: 20,
    paddingBottom: 15, // Added padding bottom for spacing within the section
    paddingTop: 5, // Added slight top padding
  },
});

export default AboutSection; 