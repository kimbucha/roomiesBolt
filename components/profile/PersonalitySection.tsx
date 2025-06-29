import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Brain, ChevronRight } from 'lucide-react-native';
import { useSupabaseUserStore } from '../../store/supabaseUserStore';
import { useRouter } from 'expo-router';

// Define personality type as a type for better type safety
type PersonalityType = 
  | 'ISTJ' | 'ISFJ' | 'INFJ' | 'INTJ' 
  | 'ISTP' | 'ISFP' | 'INFP' | 'INTP' 
  | 'ESTP' | 'ESFP' | 'ENFP' | 'ENTP' 
  | 'ESTJ' | 'ESFJ' | 'ENFJ' | 'ENTJ';

// MBTI type descriptions
const personalityDescriptions: Record<string, { title: string, description: string, roommateTips: string[] }> = {
  'ISTJ': {
    title: 'The Inspector',
    description: 'Practical, detail-oriented, and reliable. You value tradition, organization, and clear expectations in your living space.',
    roommateTips: [
      'Thrives with clear household rules and routines',
      'Appreciates roommates who respect personal space',
      'Values cleanliness and organization'
    ]
  },
  'ISFJ': {
    title: 'The Protector',
    description: 'Warm, considerate, and dependable. You create a comfortable home environment and are attentive to others\' needs.',
    roommateTips: [
      'Creates a warm, comfortable home environment',
      'Remembers and honors roommates\' preferences',
      'Values harmony and stability'
    ]
  },
  'INFJ': {
    title: 'The Counselor',
    description: 'Insightful, compassionate, and private. You seek meaningful connections and a peaceful living environment.',
    roommateTips: [
      'Creates a harmonious, thoughtful living space',
      'Values deep, meaningful roommate connections',
      'Needs quiet time for reflection'
    ]
  },
  'INTJ': {
    title: 'The Mastermind',
    description: 'Strategic, independent, and analytical. You value efficiency and appreciate roommates who respect your autonomy.',
    roommateTips: [
      'Designs efficient home systems',
      'Values intellectual discussions',
      'Appreciates roommates who respect independence'
    ]
  },
  'ISTP': {
    title: 'The Craftsman',
    description: 'Practical, adaptable, and independent. You\'re skilled at solving household problems and value personal space.',
    roommateTips: [
      'Excellent at fixing household problems',
      'Adapts easily to changing circumstances',
      'Values personal space and independence'
    ]
  },
  'ISFP': {
    title: 'The Composer',
    description: 'Gentle, aesthetic, and present-focused. You create a beautiful living space and are considerate of others.',
    roommateTips: [
      'Creates a beautiful, comfortable living space',
      'Easygoing and accommodating',
      'Values harmony and authenticity'
    ]
  },
  'INFP': {
    title: 'The Healer',
    description: 'Idealistic, empathetic, and authentic. You create a supportive home environment aligned with your values.',
    roommateTips: [
      'Creates a supportive, authentic environment',
      'Values deep connections with roommates',
      'Needs alone time to recharge',
      'Values roommates who respect personal beliefs'
    ]
  },
  'INTP': {
    title: 'The Architect',
    description: 'Logical, curious, and innovative. You value intellectual discussions and a flexible approach to household matters.',
    roommateTips: [
      'Brings creative solutions to household challenges',
      'Prefers flexible routines over strict schedules',
      'Values intellectual discussions and idea-sharing'
    ]
  },
  'ESTP': {
    title: 'The Dynamo',
    description: 'Energetic, practical, and spontaneous. You bring excitement to your living space and are adaptable to change.',
    roommateTips: [
      'Brings energy and spontaneity to the household',
      'Enjoys social gatherings and activities',
      'Prefers practical solutions over theoretical discussions'
    ]
  },
  'ESFP': {
    title: 'The Performer',
    description: 'Enthusiastic, social, and fun-loving. You create a lively home atmosphere and enjoy shared activities.',
    roommateTips: [
      'Creates a fun, welcoming atmosphere',
      'Enjoys hosting and social activities',
      'Values roommates who are positive and easygoing'
    ]
  },
  'ENFP': {
    title: 'The Champion',
    description: 'Enthusiastic, creative, and people-oriented. You bring positive energy and new ideas to your living environment.',
    roommateTips: [
      'Brings enthusiasm and creativity to the home',
      'Enjoys deep conversations and connections',
      'Values roommates who appreciate spontaneity'
    ]
  },
  'ENTP': {
    title: 'The Visionary',
    description: 'Innovative, curious, and adaptable. You enjoy intellectual challenges and bring creative solutions to household matters.',
    roommateTips: [
      'Enjoys debating ideas and brainstorming',
      'Brings innovative approaches to household challenges',
      'Values roommates who are open to new perspectives'
    ]
  },
  'ESTJ': {
    title: 'The Supervisor',
    description: 'Organized, practical, and decisive. You establish clear household systems and ensure responsibilities are met.',
    roommateTips: [
      'Establishes clear household systems and routines',
      'Values reliability and responsibility',
      'Prefers direct communication about issues'
    ]
  },
  'ESFJ': {
    title: 'The Provider',
    description: 'Warm, organized, and supportive. You create a harmonious home environment and are attentive to others\' needs.',
    roommateTips: [
      'Creates a welcoming, organized home',
      'Values harmony and positive interactions',
      'Enjoys shared meals and household traditions'
    ]
  },
  'ENFJ': {
    title: 'The Teacher',
    description: 'Warm, empathetic, and organized. You foster positive relationships and create a supportive living environment.',
    roommateTips: [
      'Fosters positive communication and connection',
      'Creates a supportive, growth-oriented environment',
      'Values roommates who appreciate emotional depth'
    ]
  },
  'ENTJ': {
    title: 'The Commander',
    description: 'Strategic, efficient, and decisive. You implement effective household systems and drive improvement.',
    roommateTips: [
      'Implements efficient household systems',
      'Values competence and clear expectations',
      'Prefers roommates who appreciate direct feedback'
    ]
  },
};

// Default description if type not found
const defaultDescription = {
  title: 'Balanced Personality',
  description: 'You have a balanced approach to living with others, adapting to different situations as needed.',
  roommateTips: [
    'Adapts well to different roommate dynamics',
    'Balances social time and personal space',
    'Values clear communication and mutual respect'
  ]
};

const PersonalitySection: React.FC = () => {
  const { user } = useSupabaseUserStore();
  const router = useRouter();
  
  // Get personality type from user data
  const personalityType = user?.personalityType as PersonalityType || '';
  
  // Get personality info based on user's type
  const personalityInfo = personalityType && personalityDescriptions[personalityType] 
    ? personalityDescriptions[personalityType] 
    : defaultDescription;
  
  // Handle navigation to personality details
  const handleViewDetails = () => {
    // Navigate to a detailed personality view (you can create this page later)
    router.push('/personality-details');
  };
  
  if (!personalityType) {
    return null; // Don't show the section if no personality type
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Brain size={20} color="#4F46E5" style={styles.headerIcon} />
          <Text style={styles.headerTitle}>Personality Profile</Text>
        </View>
      </View>
      
      <View style={styles.content}>
        <View style={styles.typeContainer}>
          <Text style={styles.typeCode}>{personalityType}</Text>
          <Text style={styles.typeTitle}>{personalityInfo.title}</Text>
        </View>
        
        <Text style={styles.description}>{personalityInfo.description}</Text>
        
        <Text style={styles.sectionTitle}>Roommate Compatibility</Text>
        
        <View style={styles.compatibilityList}>
          {personalityInfo.roommateTips.map((tip, index) => (
            <View key={index} style={styles.compatibilityItem}>
              <View style={styles.bulletPoint} />
              <Text style={styles.compatibilityText}>{tip}</Text>
            </View>
          ))}
        </View>
        
        <TouchableOpacity 
          style={styles.detailsButton}
          onPress={handleViewDetails}
        >
          <Text style={styles.detailsButtonText}>View Full Personality Profile</Text>
          <ChevronRight size={16} color="#4F46E5" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  content: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeCode: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4F46E5',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
  },
  typeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  description: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  compatibilityList: {
    marginBottom: 16,
  },
  compatibilityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4F46E5',
    marginTop: 6,
    marginRight: 8,
  },
  compatibilityText: {
    fontSize: 14,
    color: '#4B5563',
    flex: 1,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
  },
  detailsButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4F46E5',
    marginRight: 4,
  },
});

export default PersonalitySection;
