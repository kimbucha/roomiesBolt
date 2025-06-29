import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Brain } from 'lucide-react-native';
import { useUserStore } from '../store/userStore';

// Define personality type as a type for better type safety
type PersonalityType = 
  | 'ISTJ' | 'ISFJ' | 'INFJ' | 'INTJ' 
  | 'ISTP' | 'ISFP' | 'INFP' | 'INTP' 
  | 'ESTP' | 'ESFP' | 'ENFP' | 'ENTP' 
  | 'ESTJ' | 'ESFJ' | 'ENFJ' | 'ENTJ';

// Import all personality type images
const personalityImages: Record<PersonalityType, any> = {
  'ISTJ': require('../assets/images/personality/ISTJ.png'),
  'ISFJ': require('../assets/images/personality/ISFJ.png'),
  'INFJ': require('../assets/images/personality/INFJ.png'),
  'INTJ': require('../assets/images/personality/INTJ.png'),
  'ISTP': require('../assets/images/personality/ISTP.png'),
  'ISFP': require('../assets/images/personality/ISFP.png'),
  'INFP': require('../assets/images/personality/INFP.png'),
  'INTP': require('../assets/images/personality/INTP.png'),
  'ESTP': require('../assets/images/personality/ESTP.png'),
  'ESFP': require('../assets/images/personality/ESFP.png'),
  'ENFP': require('../assets/images/personality/ENFP.png'),
  'ENTP': require('../assets/images/personality/ENTP.png'),
  'ESTJ': require('../assets/images/personality/ESTJ.png'),
  'ESFJ': require('../assets/images/personality/ESFJ.png'),
  'ENFJ': require('../assets/images/personality/ENFJ.png'),
  'ENTJ': require('../assets/images/personality/ENTJ.png'),
};

// MBTI type descriptions
const personalityDescriptions: Record<string, { 
  title: string, 
  description: string, 
  roommateTips: string[],
  strengths: string[],
  challenges: string[],
  idealRoommates: string[]
}> = {
  'ISTJ': {
    title: 'The Inspector',
    description: 'Practical, detail-oriented, and reliable. You value tradition, organization, and clear expectations in your living space.',
    roommateTips: [
      'Thrives with clear household rules and routines',
      'Appreciates roommates who respect personal space',
      'Values cleanliness and organization'
    ],
    strengths: [
      'Reliable and responsible',
      'Organized and detail-oriented',
      'Practical problem-solver',
      'Consistent and dependable'
    ],
    challenges: [
      'May struggle with sudden changes',
      'Can be perceived as inflexible',
      'Might focus too much on rules'
    ],
    idealRoommates: ['ESTP', 'ESFP', 'ESTJ', 'ISFJ']
  },
  'ISFJ': {
    title: 'The Protector',
    description: 'Warm, considerate, and dependable. You create a comfortable home environment and are attentive to others\' needs.',
    roommateTips: [
      'Creates a warm, comfortable home environment',
      'Remembers and honors roommates\' preferences',
      'Values harmony and stability'
    ],
    strengths: [
      'Attentive to others\' needs',
      'Creates a comfortable living space',
      'Reliable and consistent',
      'Excellent with practical details'
    ],
    challenges: [
      'May take on too much responsibility',
      'Can struggle with direct conflict',
      'Might neglect own needs for others'
    ],
    idealRoommates: ['ESTP', 'ESFP', 'ESTJ', 'ISTJ']
  },
  'INFJ': {
    title: 'The Counselor',
    description: 'Insightful, compassionate, and private. You seek meaningful connections and a peaceful living environment.',
    roommateTips: [
      'Creates a harmonious, thoughtful living space',
      'Values deep, meaningful roommate connections',
      'Needs quiet time for reflection'
    ],
    strengths: [
      'Creates harmonious environments',
      'Insightful about others\' needs',
      'Supportive and empathetic',
      'Values meaningful connections'
    ],
    challenges: [
      'Needs significant alone time',
      'May be sensitive to conflict',
      'Can have high expectations'
    ],
    idealRoommates: ['ENFP', 'ENTP', 'INFP', 'ENFJ']
  },
  'INTJ': {
    title: 'The Mastermind',
    description: 'Strategic, independent, and analytical. You value efficiency and appreciate roommates who respect your autonomy.',
    roommateTips: [
      'Designs efficient home systems',
      'Values intellectual discussions',
      'Appreciates roommates who respect independence'
    ],
    strengths: [
      'Creates efficient living systems',
      'Independent and self-sufficient',
      'Strategic problem-solver',
      'Values intellectual growth'
    ],
    challenges: [
      'May seem distant or detached',
      'Can be overly critical',
      'Might struggle with emotional expression'
    ],
    idealRoommates: ['ENFP', 'ENTP', 'ENTJ', 'INTP']
  },
  'ISTP': {
    title: 'The Craftsman',
    description: 'Practical, adaptable, and independent. You\'re skilled at solving household problems and value personal space.',
    roommateTips: [
      'Excellent at fixing household problems',
      'Adapts easily to changing circumstances',
      'Values personal space and independence'
    ],
    strengths: [
      'Practical problem-solver',
      'Adaptable and flexible',
      'Independent and self-sufficient',
      'Good in crisis situations'
    ],
    challenges: [
      'May seem detached or aloof',
      'Can be reluctant to plan ahead',
      'Might avoid emotional discussions'
    ],
    idealRoommates: ['ESFJ', 'ESTJ', 'ESTP', 'ISFP']
  },
  'ISFP': {
    title: 'The Composer',
    description: 'Gentle, aesthetic, and present-focused. You create a beautiful living space and are considerate of others.',
    roommateTips: [
      'Creates a beautiful, comfortable living space',
      'Easygoing and accommodating',
      'Values harmony and authenticity'
    ],
    strengths: [
      'Creates aesthetically pleasing spaces',
      'Adaptable and accommodating',
      'Considerate of others',
      'Lives in the present moment'
    ],
    challenges: [
      'May avoid necessary conflict',
      'Can struggle with long-term planning',
      'Might be overly sensitive to criticism'
    ],
    idealRoommates: ['ESFJ', 'ESTJ', 'ESTP', 'ISTP']
  },
  'INFP': {
    title: 'The Healer',
    description: 'Idealistic, empathetic, and authentic. You create a supportive home environment aligned with your values.',
    roommateTips: [
      'Creates a supportive, authentic environment',
      'Values deep connections with roommates',
      'Needs alone time to recharge',
      'Values roommates who respect personal beliefs'
    ],
    strengths: [
      'Creates a values-based living space',
      'Empathetic and understanding',
      'Adaptable to others\' needs',
      'Brings depth to relationships'
    ],
    challenges: [
      'May be overly idealistic',
      'Can struggle with practical details',
      'Might avoid necessary conflict'
    ],
    idealRoommates: ['ENFJ', 'ENTJ', 'INFJ', 'ENFP']
  },
  'INTP': {
    title: 'The Architect',
    description: 'Logical, curious, and innovative. You value intellectual discussions and a flexible approach to household matters.',
    roommateTips: [
      'Brings creative solutions to household challenges',
      'Prefers flexible routines over strict schedules',
      'Values intellectual discussions and idea-sharing'
    ],
    strengths: [
      'Innovative problem-solver',
      'Adaptable and flexible',
      'Values intellectual stimulation',
      'Independent and self-sufficient'
    ],
    challenges: [
      'May neglect practical details',
      'Can seem detached or absent-minded',
      'Might struggle with emotional expression'
    ],
    idealRoommates: ['ENTJ', 'ESTJ', 'INTJ', 'ENTP']
  },
  'ESTP': {
    title: 'The Dynamo',
    description: 'Energetic, practical, and spontaneous. You bring excitement to your living space and are adaptable to change.',
    roommateTips: [
      'Brings energy and spontaneity to the household',
      'Enjoys social gatherings and activities',
      'Prefers practical solutions over theoretical discussions'
    ],
    strengths: [
      'Adaptable and resourceful',
      'Brings energy and fun to the home',
      'Practical problem-solver',
      'Lives in the present moment'
    ],
    challenges: [
      'May struggle with long-term planning',
      'Can be impulsive with decisions',
      'Might avoid emotional discussions'
    ],
    idealRoommates: ['ISTJ', 'ISFJ', 'ISTP', 'ISFP']
  },
  'ESFP': {
    title: 'The Performer',
    description: 'Enthusiastic, social, and fun-loving. You create a lively home atmosphere and enjoy shared activities.',
    roommateTips: [
      'Creates a fun, welcoming atmosphere',
      'Enjoys hosting and social activities',
      'Values roommates who are positive and easygoing'
    ],
    strengths: [
      'Creates a warm, social atmosphere',
      'Adaptable and easy-going',
      'Practical and resourceful',
      'Brings fun and spontaneity'
    ],
    challenges: [
      'May avoid serious discussions',
      'Can struggle with long-term planning',
      'Might be disorganized with shared spaces'
    ],
    idealRoommates: ['ISTJ', 'ISFJ', 'ISTP', 'ISFP']
  },
  'ENFP': {
    title: 'The Champion',
    description: 'Enthusiastic, creative, and people-oriented. You bring positive energy and new ideas to your living environment.',
    roommateTips: [
      'Brings enthusiasm and creativity to the home',
      'Enjoys deep conversations and connections',
      'Values roommates who appreciate spontaneity'
    ],
    strengths: [
      'Creates an inspiring, creative environment',
      'Brings warmth and enthusiasm',
      'Adaptable to different personalities',
      'Values authentic connections'
    ],
    challenges: [
      'May struggle with practical details',
      'Can be disorganized with shared spaces',
      'Might start projects without finishing them'
    ],
    idealRoommates: ['INTJ', 'INFJ', 'ENTJ', 'ENFJ']
  },
  'ENTP': {
    title: 'The Visionary',
    description: 'Innovative, curious, and adaptable. You enjoy intellectual challenges and bring creative solutions to household matters.',
    roommateTips: [
      'Enjoys debating ideas and brainstorming',
      'Brings innovative approaches to household challenges',
      'Values roommates who are open to new perspectives'
    ],
    strengths: [
      'Brings innovative solutions to problems',
      'Adaptable and quick-thinking',
      'Enjoys intellectual stimulation',
      'Enthusiastic about new ideas'
    ],
    challenges: [
      'May neglect routine maintenance',
      'Can be argumentative for fun',
      'Might struggle with follow-through'
    ],
    idealRoommates: ['INTJ', 'INFJ', 'ENTJ', 'INTP']
  },
  'ESTJ': {
    title: 'The Supervisor',
    description: 'Organized, practical, and decisive. You establish clear household systems and ensure responsibilities are met.',
    roommateTips: [
      'Establishes clear household systems and routines',
      'Values reliability and responsibility',
      'Prefers direct communication about issues'
    ],
    strengths: [
      'Creates organized, efficient living spaces',
      'Reliable and responsible',
      'Clear about expectations',
      'Takes initiative with household matters'
    ],
    challenges: [
      'May be perceived as controlling',
      'Can be inflexible with routines',
      'Might be overly direct in communication'
    ],
    idealRoommates: ['ISFP', 'ISTP', 'ISTJ', 'ISFJ']
  },
  'ESFJ': {
    title: 'The Provider',
    description: 'Warm, organized, and supportive. You create a harmonious home environment and are attentive to others\' needs.',
    roommateTips: [
      'Creates a welcoming, organized home',
      'Values harmony and positive interactions',
      'Enjoys shared meals and household traditions'
    ],
    strengths: [
      'Creates a warm, welcoming home',
      'Attentive to others\' needs',
      'Organized and practical',
      'Fosters connection and belonging'
    ],
    challenges: [
      'May be sensitive to criticism',
      'Can struggle with conflict',
      'Might take on too much responsibility'
    ],
    idealRoommates: ['ISFP', 'ISTP', 'ISTJ', 'ISFJ']
  },
  'ENFJ': {
    title: 'The Teacher',
    description: 'Warm, empathetic, and organized. You foster positive relationships and create a supportive living environment.',
    roommateTips: [
      'Fosters positive communication and connection',
      'Creates a supportive, growth-oriented environment',
      'Values roommates who appreciate emotional depth'
    ],
    strengths: [
      'Creates a supportive, growth-oriented home',
      'Excellent at fostering communication',
      'Organized and responsible',
      'Attentive to others\' needs'
    ],
    challenges: [
      'May be overly idealistic',
      'Can take criticism personally',
      'Might neglect own needs for others'
    ],
    idealRoommates: ['INFP', 'ISFP', 'ENFP', 'INFJ']
  },
  'ENTJ': {
    title: 'The Commander',
    description: 'Strategic, efficient, and decisive. You implement effective household systems and drive improvement.',
    roommateTips: [
      'Implements efficient household systems',
      'Values competence and clear expectations',
      'Prefers roommates who appreciate direct feedback'
    ],
    strengths: [
      'Creates efficient, well-organized spaces',
      'Takes initiative with improvements',
      'Clear about expectations',
      'Strategic problem-solver'
    ],
    challenges: [
      'May be perceived as controlling',
      'Can be impatient with inefficiency',
      'Might be overly direct in communication'
    ],
    idealRoommates: ['INTP', 'INFP', 'ENTP', 'ENFP']
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
  ],
  strengths: [
    'Adaptable to different situations',
    'Balanced in approach to living with others',
    'Flexible with household arrangements'
  ],
  challenges: [
    'May not have strongly defined preferences',
    'Could struggle to assert needs clearly'
  ],
  idealRoommates: ['Various personality types']
};

export default function PersonalityDetailsScreen() {
  const router = useRouter();
  const { user } = useUserStore();
  
  // Get personality type from user data
  const personalityType = user?.personalityType as PersonalityType || '';
  
  // Get personality info based on user's type
  const personalityInfo = personalityType && personalityDescriptions[personalityType] 
    ? personalityDescriptions[personalityType] 
    : defaultDescription;
  
  const handleBack = () => {
    router.back();
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Personality Profile</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <View style={styles.typeHeader}>
            <View style={styles.typeContainer}>
              <Text style={styles.typeCode}>{personalityType}</Text>
              <Text style={styles.typeTitle}>{personalityInfo.title}</Text>
            </View>
            
            {personalityType && personalityImages[personalityType] && (
              <Image 
                source={personalityImages[personalityType]}
                style={styles.personalityImage}
                resizeMode="contain"
              />
            )}
          </View>
          
          <Text style={styles.description}>{personalityInfo.description}</Text>
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Brain size={18} color="#4F46E5" />
            <Text style={styles.sectionTitle}>Your Strengths</Text>
          </View>
          
          <View style={styles.listContainer}>
            {personalityInfo.strengths.map((strength, index) => (
              <View key={index} style={styles.listItem}>
                <View style={styles.bulletPoint} />
                <Text style={styles.listText}>{strength}</Text>
              </View>
            ))}
          </View>
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Brain size={18} color="#4F46E5" />
            <Text style={styles.sectionTitle}>Your Challenges</Text>
          </View>
          
          <View style={styles.listContainer}>
            {personalityInfo.challenges.map((challenge, index) => (
              <View key={index} style={styles.listItem}>
                <View style={styles.bulletPoint} />
                <Text style={styles.listText}>{challenge}</Text>
              </View>
            ))}
          </View>
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Brain size={18} color="#4F46E5" />
            <Text style={styles.sectionTitle}>Roommate Compatibility</Text>
          </View>
          
          <View style={styles.listContainer}>
            {personalityInfo.roommateTips.map((tip, index) => (
              <View key={index} style={styles.listItem}>
                <View style={styles.bulletPoint} />
                <Text style={styles.listText}>{tip}</Text>
              </View>
            ))}
          </View>
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Brain size={18} color="#4F46E5" />
            <Text style={styles.sectionTitle}>Ideal Roommate Types</Text>
          </View>
          
          <View style={styles.idealTypesContainer}>
            {personalityInfo.idealRoommates.map((type, index) => (
              <View key={index} style={styles.idealTypeItem}>
                <Text style={styles.idealTypeText}>{type}</Text>
              </View>
            ))}
          </View>
        </View>
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  profileCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  typeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  typeContainer: {
    flex: 1,
  },
  typeCode: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4F46E5',
    marginBottom: 4,
  },
  typeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  personalityImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  description: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  listContainer: {
    marginBottom: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4F46E5',
    marginTop: 6,
    marginRight: 10,
  },
  listText: {
    fontSize: 15,
    color: '#4B5563',
    flex: 1,
    lineHeight: 20,
  },
  idealTypesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  idealTypeItem: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  idealTypeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4F46E5',
  },
});
