// Import only the types to avoid require cycles
import type { SwipeAction, Match } from '../store/matchesStore';
import type { RoommateProfile } from '../store/roommateStore';
import { generateId } from './idGenerator';
import { addExtendedMockProfiles } from './extendedMockData';

// We'll use a lazy loading approach to avoid require cycles
// These functions will safely get the store instances when needed
const getAuthStore = () => require('../store/supabaseAuthStore').useSupabaseAuthStore.getState();
const getMatchesStore = () => require('../store/matchesStore').useMatchesStore.getState();
const getRoommateStore = () => require('../store/roommateStore').useRoommateStore.getState();
const getMessageStore = () => require('../store/messageStore').useMessageStore.getState();
const getSupabaseMatchesStore = () => require('../store/supabaseMatchesStore').useSupabaseMatchesStore.getState();

// Sample room photos for places
const sampleRoomPhotos = [
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8YXBhcnRtZW50fGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTd8fGFwYXJ0bWVudHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fGFwYXJ0bWVudHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60',
  'https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGFwYXJ0bWVudHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60',
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGFwYXJ0bWVudHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60',
  'https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8YXBhcnRtZW50fGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8YXBhcnRtZW50fGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60',
  'https://images.unsplash.com/photo-1554995207-c18c203602cb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8YXBhcnRtZW50fGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60',
];

// Helper function to get random room photos
const getRandomRoomPhotos = (count = 3) => {
  const shuffled = [...sampleRoomPhotos].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, shuffled.length));
};

/**
 * Enhanced mock roommate profiles for integrated testing
 */
export const mockProfiles: RoommateProfile[] = [
  {
    id: 'user1',
    name: 'Ethan Garcia',
    age: 22,
    university: 'Stanford University',
    major: 'Computer Science',
    bio: 'Looking for a clean and quiet roommate. I study a lot but also enjoy hiking on weekends.',
    budget: '$1200-1500',
    location: 'Palo Alto',
    neighborhood: 'Downtown',
    image: 'https://randomuser.me/api/portraits/men/75.jpg',
    roomPhotos: getRandomRoomPhotos(4),
    traits: ['Clean', 'Quiet', 'Early riser'],
    verified: true,
    compatibilityScore: 92,
    hasPlace: true,
    roomType: 'private',
    amenities: ['in-unit-laundry', 'parking', 'gym', 'ac'],
    bedrooms: 1,
    bathrooms: 1,
    isFurnished: true,
    // Add comprehensive place details with utilities structure for testing
    placeDetails: {
      roomType: 'private',
      bedrooms: 1,
      bathrooms: 1,
      furnished: true,
      amenities: ['in-unit-laundry', 'parking', 'gym', 'ac', 'dishwasher', 'balcony'],
      utilities: ['Electricity', 'Water', 'Trash'], // Legacy format
      detailedUtilities: [
        { id: 'electricity', name: 'Electricity', status: 'included' },
        { id: 'water', name: 'Water & Sewer', status: 'included' },
        { id: 'internet', name: 'Internet/WiFi', status: 'not-included', estimatedCost: '$60' },
        { id: 'gas', name: 'Gas/Heating', status: 'not-included', estimatedCost: '$40' },
        { id: 'trash', name: 'Trash & Recycling', status: 'included' },
      ],
      petPolicy: 'Pet friendly',
      subletAllowed: true
    },
    monthlyRent: '$1350',
    address: '123 University Ave, Palo Alto',
    description: 'Clean, quiet room perfect for a student. Great study environment with natural light and modern amenities.',
    socialMedia: {
      instagram: 'alex.chen',
      spotify: 'alexc_music',
      twitter: 'alexctech'
    },
    lifestylePreferences: {
      sleepSchedule: 'early_bird',
      cleanliness: 'very_clean',
      noiseLevel: 'quiet',
      guestPolicy: 'occasionally',
      studyHabits: 'in_silence',
      substancePolicy: 'alcohol_only'
    },
    personalPreferences: {
      temperature: 'cool',
      petPreference: 'cats_only',
      hometown: 'Portland, OR',
      pronouns: 'he/him'
    },
    // Add personality data for testing the new personality section
    personalityType: 'INTJ',
    personalityTraits: ['analytical', 'independent', 'strategic', 'logical', 'efficient'],
    personalityDimensions: {
      ei: 72, // More Introverted
      sn: 68, // More Intuitive  
      tf: 25, // More Thinking
      jp: 35  // More Judging
    },
    matchScenario: 'regularMatch',
    leaseDuration: '9 months',
    moveInDate: 'October 15, 2023',
    flexibleStay: true,
    leaseType: 'Academic year',
    utilitiesIncluded: ['Electricity', 'Water', 'Trash'],
    petPolicy: 'Pet friendly',
    subletAllowed: true,
    gender: 'male'
  },
  {
    id: 'user2',
    name: 'Jamie Rodriguez',
    age: 24,
    university: 'UC Berkeley',
    major: 'Architecture',
    bio: 'Creative and social architect student looking for roommates near campus. I love cooking and hosting small gatherings.',
    budget: '$1300-1600',
    location: 'Berkeley',
    image: 'https://randomuser.me/api/portraits/women/65.jpg',
    traits: ['Creative', 'Social', 'Cook'],
    verified: true,
    compatibilityScore: 85,
    hasPlace: false,
    roomType: 'shared',
    amenities: ['Kitchen', 'WiFi', 'Laundry'],
    gender: 'female',
    socialMedia: {
      instagram: 'jamie.designs',
      facebook: 'jamierodriguez'
    },
    lifestylePreferences: {
      sleepSchedule: 'night_owl',
      cleanliness: 'clean',
      noiseLevel: 'moderate',
      guestPolicy: 'occasionally',
      studyHabits: 'with_background',
      substancePolicy: 'all_ok'
    },
    personalPreferences: {
      temperature: 'moderate',
      petPreference: 'all_pets_ok',
      hometown: 'San Francisco, CA',
      pronouns: 'she/her'
    },
    // Add personality data for testing the new personality section
    personalityType: 'ENFP',
    personalityTraits: ['creative', 'enthusiastic', 'social', 'adaptable', 'empathetic'],
    personalityDimensions: {
      ei: 25, // More Extroverted
      sn: 75, // More Intuitive
      tf: 80, // More Feeling
      jp: 85  // More Perceiving
    },
    matchScenario: 'mixedMatch',
    leaseDuration: '6 months',
    moveInDate: 'Flexible',
    flexibleStay: true,
    leaseType: 'Month-to-month',
    utilitiesIncluded: ['Water', 'Gas'],
    petPolicy: 'No pets allowed',
    subletAllowed: false
  },
  {
    id: 'user3',
    name: 'Taylor Wilson',
    age: 23,
    university: 'San Francisco State',
    major: 'Business',
    bio: 'Business student and part-time barista. Looking for a place with good public transport access. I\'m tidy and respect personal space.',
    budget: '$1000-1300',
    location: 'San Francisco',
    neighborhood: 'Mission Bay',
    image: 'https://images.unsplash.com/photo-1546967191-fdfb13ed6b1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    gender: 'female',
    roomPhotos: getRandomRoomPhotos(5),
    traits: ['Organized', 'Respectful', 'Busy'],
    verified: true,
    compatibilityScore: 78,
    hasPlace: true,
    roomType: 'studio',
    amenities: ['Balcony', 'Pool', 'Gym'],
    bedrooms: 1,
    bathrooms: 1,
    description: 'Bright and modern studio apartment in Mission Bay with great amenities. Close to public transport and downtown. Perfect for a student or young professional.',
    monthlyRent: '$1150',
    address: '456 Mission Bay Blvd, San Francisco',
    moveInDate: 'September 1, 2023',
    leaseDuration: '12 months',
    // Add comprehensive place details with mixed utilities for testing
    placeDetails: {
      roomType: 'studio',
      bedrooms: 1,
      bathrooms: 1,
      furnished: true,
      amenities: ['balcony', 'pool', 'gym', 'in-unit-laundry', 'ac'],
      detailedUtilities: [
        { id: 'water', name: 'Water & Sewer', status: 'included' },
        { id: 'trash', name: 'Trash & Recycling', status: 'included' },
        { id: 'internet', name: 'Internet/WiFi', status: 'not-included', estimatedCost: '$80' },
        { id: 'electricity', name: 'Electricity', status: 'not-included', estimatedCost: '$75' },
        { id: 'gas', name: 'Gas/Heating', status: 'estimated', estimatedCost: '$30-50' },
      ],
      petPolicy: 'Small pets allowed',
      subletAllowed: true
    },
    socialMedia: {
      instagram: 'taylor_wilsf',
      spotify: 'taylor_w',
      linkedin: 'taylorwilson'
    },
    lifestylePreferences: {
      sleepSchedule: 'flexible',
      cleanliness: 'very_clean',
      noiseLevel: 'quiet',
      guestPolicy: 'rarely',
      studyHabits: 'in_silence',
      substancePolicy: 'none'
    },
    personalPreferences: {
      temperature: 'warm',
      petPreference: 'no_pets',
      hometown: 'San Diego, CA',
      pronouns: 'she/her'
    },
    // Add personality data (ESFJ - fits organized business student profile)
    personalityType: 'ESFJ',
    personalityTraits: ['helpful', 'organized', 'responsible', 'social', 'practical'],
    personalityDimensions: {
      ei: 35, // More Extroverted (business student)
      sn: 30, // More Sensing (practical business approach)
      tf: 75, // More Feeling (helpful, considerate)
      jp: 20  // More Judging (organized, structured)
    },
    matchScenario: 'superMatch',
    flexibleStay: false,
    leaseType: 'Standard',
    utilitiesIncluded: ['Water', 'Trash']
  },
  {
    id: 'user4',
    name: 'Jordan Smith',
    age: 25,
    university: 'UCSF',
    major: 'Medicine',
    bio: 'Med student looking for a quiet place to study. I\'m rarely home due to hospital rotations. Non-smoker, minimal drinking.',
    budget: '$1500-1800',
    location: 'San Francisco',
    image: 'https://randomuser.me/api/portraits/women/21.jpg',
    traits: ['Studious', 'Clean', 'Quiet'],
    verified: true,
    compatibilityScore: 88,
    hasPlace: false,
    gender: 'female',
    socialMedia: {
      facebook: 'jordan.smith.med',
      linkedin: 'jordansmithmd'
    },
    // Add complete personality data like Jamie Rodriguez
    personalityType: 'ISTJ',
    personalityTraits: ['responsible', 'organized', 'studious', 'reliable', 'focused'],
    personalityDimensions: {
      ei: 75, // More Introverted (fits quiet med student)
      sn: 25, // More Sensing (practical, detail-oriented)
      tf: 35, // More Thinking (logical, analytical)
      jp: 15  // More Judging (organized, structured)
    },
    matchScenario: 'regularMatch',
    leaseDuration: '12 months',
    moveInDate: 'Flexible',
    flexibleStay: true,
    leaseType: 'Standard',
    utilitiesIncluded: ['Water', 'Internet'],
    petPolicy: 'No pets allowed',
    subletAllowed: false
  },
  {
    id: 'user5',
    name: 'Morgan Lee',
    age: 22,
    university: 'San Jose State',
    major: 'Computer Engineering',
    bio: 'Engineering student and gamer. I keep odd hours but I\'m quiet and clean. Looking for roommates with similar interests.',
    budget: '$1100-1400',
    location: 'San Jose',
    neighborhood: 'Downtown',
    image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    traits: ['Tech-savvy', 'Night owl', 'Gamer'],
    verified: false,
    gender: 'other',
    compatibilityScore: 72,
    hasPlace: true,
    roomPhotos: getRandomRoomPhotos(3),
    socialMedia: {
      instagram: 'morgan.games',
      twitter: 'morganleedev',
      spotify: 'morgan_lee'
    },
    // Add personality data (INTP - fits engineer/gamer profile)
    personalityType: 'INTP',
    personalityTraits: ['logical', 'independent', 'creative', 'analytical', 'innovative'],
    personalityDimensions: {
      ei: 70, // More Introverted (quiet gamer)
      sn: 80, // More Intuitive (creative problem-solving)
      tf: 25, // More Thinking (logical engineer)
      jp: 75  // More Perceiving (flexible schedule)
    },
    matchScenario: 'regularMatch',
    leaseDuration: '6 months',
    moveInDate: 'Flexible',
    flexibleStay: true,
    leaseType: 'Month-to-month',
    utilitiesIncluded: ['Internet', 'Electricity'],
    petPolicy: 'Ask about pets',
    subletAllowed: true
  },
  // Additional profiles for testing different scenarios
  {
    id: 'user6',
    name: 'Priya Patel',
    age: 21,
    university: 'UC Davis',
    major: 'Environmental Science',
    bio: 'Passionate about sustainability and outdoor activities. Looking for eco-conscious roommates who enjoy nature.',
    budget: '$900-1200',
    location: 'Davis',
    neighborhood: 'University District',
    image: 'https://images.unsplash.com/photo-1502378735452-bcfd4ca60f91?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    traits: ['Eco-friendly', 'Outdoorsy', 'Vegetarian'],
    verified: true,
    compatibilityScore: 94, // High compatibility for testing
    hasPlace: true,
    roomPhotos: getRandomRoomPhotos(4),
    socialMedia: {
      instagram: 'priya.green',
      spotify: 'priyapatelsounds'
    },
    // Add personality data (INFP - fits environmental/idealistic profile)
    personalityType: 'INFP',
    personalityTraits: ['idealistic', 'caring', 'authentic', 'passionate', 'creative'],
    personalityDimensions: {
      ei: 60, // Slightly Introverted (thoughtful about environment)
      sn: 85, // More Intuitive (big picture environmental thinking)
      tf: 90, // More Feeling (cares deeply about values)
      jp: 70  // More Perceiving (flexible, open to ideas)
    },
    // This profile is set up for a "super match" scenario
    matchScenario: 'superMatch',
    leaseDuration: '12 months',
    moveInDate: 'September 1, 2023',
    flexibleStay: false,
    leaseType: 'Standard',
    monthlyRent: '$1100',
    // Add comprehensive place details with enhanced utilities for user6
    placeDetails: {
      roomType: 'private',
      bedrooms: 2,
      bathrooms: 1,
      furnished: false,
      amenities: ['parking', 'balcony', 'pets'],
      detailedUtilities: [
        { id: 'water', name: 'Water & Sewer', status: 'included' },
        { id: 'electricity', name: 'Electricity (Solar)', status: 'included' },
        { id: 'internet', name: 'Internet/WiFi', status: 'not-included', estimatedCost: '$55' },
        { id: 'gas', name: 'Gas/Heating', status: 'not-included', estimatedCost: '$35' },
        { id: 'trash', name: 'Trash & Recycling', status: 'included' },
      ],
      petPolicy: 'Small pets allowed',
      subletAllowed: true
    },
    utilitiesIncluded: ['Water', 'Internet', 'Electricity'],
    petPolicy: 'Small pets allowed',
    subletAllowed: true
  },
  {
    id: 'user7',
    name: 'Marcus Johnson',
    age: 26,
    university: 'Stanford',
    major: 'MBA',
    bio: 'Business school student looking for a place close to campus. I\'m organized, respectful, and enjoy occasional social gatherings.',
    budget: '$1800-2200',
    location: 'Palo Alto',
    image: 'https://randomuser.me/api/portraits/men/25.jpg',
    traits: ['Professional', 'Social', 'Organized'],
    verified: true,
    compatibilityScore: 82,
    hasPlace: false,
    socialMedia: {
      linkedin: 'marcusjohnsonmba',
      twitter: 'marcusjmba'
    },
    // Add personality data (ENTJ - fits business leadership profile)
    personalityType: 'ENTJ',
    personalityTraits: ['strategic', 'confident', 'efficient', 'decisive', 'ambitious'],
    personalityDimensions: {
      ei: 20, // More Extroverted (business networking)
      sn: 70, // More Intuitive (strategic thinking)
      tf: 30, // More Thinking (business decisions)
      jp: 15  // More Judging (organized, planned)
    },
    // This profile is set up for a "mixed match" scenario (one super likes, one regular likes)
    matchScenario: 'mixedMatch',
    leaseDuration: '6 months',
    moveInDate: 'Flexible',
    flexibleStay: true,
    leaseType: 'Month-to-month',
    utilitiesIncluded: ['Water', 'Gas'],
    petPolicy: 'No pets allowed',
    subletAllowed: false
  },
  {
    id: 'user8',
    name: 'Sophia Garcia',
    age: 23,
    university: 'UC Berkeley',
    major: 'Psychology',
    bio: 'Psychology student interested in human behavior. I\'m a good listener and enjoy deep conversations. Looking for a peaceful living environment.',
    budget: '$1100-1400',
    location: 'Berkeley',
    neighborhood: 'Southside',
    image: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    traits: ['Thoughtful', 'Quiet', 'Empathetic'],
    verified: true,
    compatibilityScore: 76,
    hasPlace: true,
    roomPhotos: getRandomRoomPhotos(3),
    socialMedia: {
      instagram: 'sophia.psych',
      spotify: 'sophiag'
    },
    // Add personality data (INFJ - fits psychology/empathetic profile)
    personalityType: 'INFJ',
    personalityTraits: ['insightful', 'empathetic', 'intuitive', 'thoughtful', 'private'],
    personalityDimensions: {
      ei: 75, // More Introverted (deep thinker)
      sn: 80, // More Intuitive (psychological insights)
      tf: 85, // More Feeling (empathetic listener)
      jp: 25  // More Judging (organized, purposeful)
    },
    // This profile is set up for a "regular match" scenario
    matchScenario: 'regularMatch',
    leaseDuration: '12 months',
    moveInDate: 'September 1, 2023',
    flexibleStay: false,
    leaseType: 'Standard',
    monthlyRent: '$1275',
    // Add comprehensive place details with enhanced utilities for user8
    placeDetails: {
      roomType: 'private',
      bedrooms: 3,
      bathrooms: 2,
      furnished: true,
      amenities: ['furnished', 'ac', 'dishwasher'],
      detailedUtilities: [
        { id: 'water', name: 'Water & Sewer', status: 'included' },
        { id: 'internet', name: 'Internet/WiFi', status: 'included' },
        { id: 'electricity', name: 'Electricity', status: 'not-included', estimatedCost: '$85' },
        { id: 'gas', name: 'Gas/Heating', status: 'estimated', estimatedCost: '$45-65' },
        { id: 'trash', name: 'Trash & Recycling', status: 'included' },
      ],
      petPolicy: 'Small pets allowed',
      subletAllowed: true
    },
    utilitiesIncluded: ['Water', 'Internet', 'Electricity'],
    petPolicy: 'Small pets allowed',
    subletAllowed: true
  },
  {
    id: 'user9',
    name: 'Ethan Williams',
    age: 24,
    university: 'San Francisco State',
    major: 'Film Studies',
    bio: 'Aspiring filmmaker looking for creative roommates. I have video equipment but promise not to turn the apartment into a film set... most days.',
    budget: '$1200-1500',
    location: 'San Francisco',
    image: 'https://randomuser.me/api/portraits/men/45.jpg',
    traits: ['Creative', 'Night owl', 'Film buff'],
    verified: false,
    compatibilityScore: 68,
    hasPlace: false,
    gender: 'male',
    socialMedia: {
      instagram: 'ethan.films',
      youtube: 'EthanWilliamsFilms'
    },
    // Add personality data (ISFP - fits creative/artistic profile)
    personalityType: 'ISFP',
    personalityTraits: ['artistic', 'creative', 'flexible', 'authentic', 'independent'],
    personalityDimensions: {
      ei: 65, // Slightly Introverted (artist)
      sn: 25, // More Sensing (hands-on filmmaking)
      tf: 80, // More Feeling (artistic expression)
      jp: 80  // More Perceiving (creative flexibility)
    },
    // This profile is set up to have already liked the user (for premium feature testing)
    matchScenario: 'alreadyLiked',
    leaseDuration: '6 months',
    moveInDate: 'Flexible',
    flexibleStay: true,
    leaseType: 'Month-to-month',
    utilitiesIncluded: ['Water', 'Gas'],
    petPolicy: 'No pets allowed',
    subletAllowed: false
  },
  {
    id: 'user10',
    name: 'Olivia Kim',
    age: 22,
    university: 'Stanford',
    major: 'Bioengineering',
    bio: 'Bioengineering student who loves cooking Korean food. I\'m clean, organized, and looking for respectful roommates.',
    budget: '$1300-1600',
    location: 'Palo Alto',
    neighborhood: 'College Terrace',
    image: 'https://images.unsplash.com/photo-1499714608240-22fc6ad53fb2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    traits: ['Clean', 'Foodie', 'Studious'],
    verified: true,
    compatibilityScore: 89,
    hasPlace: true,
    roomPhotos: getRandomRoomPhotos(4),
    socialMedia: {
      instagram: 'olivia.cooks',
      tiktok: 'oliviakimcooks'
    },
    // Add personality data (ESTJ - fits organized engineer profile)
    personalityType: 'ESTJ',
    personalityTraits: ['organized', 'practical', 'reliable', 'efficient', 'responsible'],
    personalityDimensions: {
      ei: 30, // More Extroverted (social cooking content)
      sn: 35, // More Sensing (practical engineering)
      tf: 40, // Balanced Thinking/Feeling (engineering + caring)
      jp: 20  // More Judging (very organized)
    },
    // This profile is set up to have already super liked the user (for premium feature testing)
    matchScenario: 'alreadySuperLiked',
    leaseDuration: '12 months',
    moveInDate: 'September 1, 2023',
    flexibleStay: false,
    leaseType: 'Standard',
    monthlyRent: '$1550',
    // Add comprehensive place details with enhanced utilities for user10
    placeDetails: {
      roomType: 'private',
      bedrooms: 2,
      bathrooms: 2,
      furnished: true,
      amenities: ['furnished', 'dishwasher', 'in-unit-laundry', 'parking', 'gym'],
      detailedUtilities: [
        { id: 'water', name: 'Water & Sewer', status: 'included' },
        { id: 'internet', name: 'Internet/WiFi (Gigabit)', status: 'included' },
        { id: 'electricity', name: 'Electricity', status: 'not-included', estimatedCost: '$90' },
        { id: 'gas', name: 'Gas/Cooking', status: 'not-included', estimatedCost: '$50' },
        { id: 'trash', name: 'Trash & Recycling', status: 'included' },
      ],
      petPolicy: 'Small pets allowed',
      subletAllowed: true
    },
    utilitiesIncluded: ['Water', 'Internet', 'Electricity'],
    petPolicy: 'Small pets allowed',
    subletAllowed: true
  },
  // Profile with company/role instead of university/major for testing
  {
    id: 'user11',
    name: 'Alex Rivera',
    age: 26,
    company: 'Google',
    role: 'Software Engineer',
    bio: 'Software engineer at Google. Love hiking, board games, and cooking. Looking for a clean, professional roommate.',
    budget: '$2000-2500',
    location: 'Mountain View',
    neighborhood: 'Downtown',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    traits: ['Professional', 'Clean', 'Tech-savvy'],
    verified: true,
    compatibilityScore: 91,
    hasPlace: true,
    roomPhotos: getRandomRoomPhotos(3),
    socialMedia: {
      linkedin: 'alexrivera-dev',
      instagram: 'alex.codes'
    },
    lifestylePreferences: {
      sleepSchedule: 'flexible',
      cleanliness: 'very_clean',
      noiseLevel: 'moderate',
      guestPolicy: 'occasionally',
      studyHabits: 'with_background',
      substancePolicy: 'alcohol_only'
    },
    personalPreferences: {
      temperature: 'moderate',
      petPreference: 'no_pets',
      hometown: 'Austin, TX',
      pronouns: 'they/them'
    },
    // Add personality data (ESTP - fits professional tech worker profile)
    personalityType: 'ESTP',
    personalityTraits: ['practical', 'energetic', 'adaptable', 'social', 'hands-on'],
    personalityDimensions: {
      ei: 25, // More Extroverted (social professional)
      sn: 30, // More Sensing (practical engineer)
      tf: 35, // More Thinking (logical problem-solving)
      jp: 60  // More Perceiving (adaptable, flexible)
    },
    matchScenario: 'regularMatch',
    leaseDuration: '12 months',
    moveInDate: 'January 1, 2024',
    flexibleStay: false,
    leaseType: 'Standard',
    utilitiesIncluded: ['Water', 'Internet', 'Electricity', 'Trash'],
    petPolicy: 'No pets allowed',
    subletAllowed: false
  }
];

/**
 * Mock matches for testing the matching system
 */
export const mockMatches: Match[] = [
  {
    id: 'match1',
    user1Id: 'currentUser',
    user2Id: 'user1',
    user1Action: 'like',
    user2Action: 'like',
    status: 'matched',
    createdAt: Date.now() - 3600000, // 1 hour ago
    updatedAt: Date.now() - 3600000,
    hasRead: true
  },
  {
    id: 'match2',
    user1Id: 'currentUser',
    user2Id: 'user5',
    user1Action: 'superLike',
    user2Action: 'superLike',
    status: 'superMatched',
    createdAt: Date.now() - 7200000, // 2 hours ago
    updatedAt: Date.now() - 7200000,
    hasRead: true
  },
  {
    id: 'match3',
    user1Id: 'user3',
    user2Id: 'currentUser',
    user1Action: 'superLike',
    user2Action: 'like',
    status: 'mixedMatched',
    createdAt: Date.now() - 86400000, // 1 day ago
    updatedAt: Date.now() - 86400000,
    hasRead: false
  }
];

/**
 * Mock pending likes for testing the premium feature
 */
export const mockPendingLikes = [
  {
    userId: 'user9', // Ethan Williams has already liked the user
    action: 'like' as SwipeAction,
    timestamp: Date.now() - 43200000 // 12 hours ago
  },
  {
    userId: 'user10', // Olivia Kim has already super liked the user
    action: 'superLike' as SwipeAction,
    timestamp: Date.now() - 21600000 // 6 hours ago
  }
];

/**
 * Function to initialize the stores with mock data for testing
 * This can be called during app initialization to set up test data
 */
export function initializeMockData(makePremium: boolean = false) {
  console.log('[Mock Data] Initializing mock data...');
  
  try {
    // Get store instances
    const authStore = getAuthStore();
    const matchesStore = getMatchesStore();
    const supabaseMatchesStore = getSupabaseMatchesStore();
    const roommateStore = getRoommateStore();
    const messageStore = getMessageStore();
    
    // Set premium status for testing premium features
    if (makePremium) {
      console.log('[Mock Data] Setting premium status to true');
      matchesStore.setPremiumStatus(true);
      supabaseMatchesStore.setPremiumStatus(true);
    }
    
    // Clear existing profiles to prevent duplicates
    // We need to clear both the profiles and roommates arrays
    const currentProfiles = roommateStore.profiles || [];
    const profileIds = mockProfiles.map(p => p.id);
    
    // Check if any mock profiles already exist to avoid duplicates
    const hasExistingMockProfiles = currentProfiles.some((p: any) => profileIds.includes(p.id));
    
    if (!hasExistingMockProfiles) {
      console.log('[Mock Data] Adding fresh mock profiles...');
      // Use the new setProfiles method to replace both arrays cleanly
      roommateStore.setProfiles(mockProfiles);
      roommateStore.setRoommates(mockProfiles);
    } else {
      console.log('[Mock Data] Mock profiles already exist, skipping to prevent duplicates');
    }
    
    // DISABLED: Extended mock profiles cause personality type issues
    // addExtendedMockProfiles();
    
    // Add mock profiles to the supabase matches store as well
    const supabaseProfiles = mockProfiles.map(profile => ({
      id: profile.id,
      name: profile.name,
      image: profile.image,
      university: profile.university,
      age: profile.age,
      bio: profile.bio
    }));
    supabaseMatchesStore.setProfiles(supabaseProfiles);
    
    // Add mock matches to matches store (old store)
    matchesStore.setMatches(mockMatches);
    
    // CRITICAL FIX: Only initialize pending likes if they don't already exist
    // This prevents resetting the count after matches have been made
    const currentPendingLikes = supabaseMatchesStore.pendingLikes || [];
    const shouldInitializePendingLikes = currentPendingLikes.length === 0;
    
    if (shouldInitializePendingLikes) {
      console.log('[Mock Data] Initializing pending likes for the first time');
      // Set up mock pending likes in the new supabase store
      const mockPendingLikesForSupabase = [
        {
          user_id: 'currentUser',
          liker_id: 'user2', // Jamie Rodriguez - will be matched
          action: 'like' as 'like' | 'superLike',
          created_at: new Date(Date.now() - 86400000).toISOString(), // 24 hours ago
          liker_name: 'Jamie Rodriguez',
          liker_image: 'https://randomuser.me/api/portraits/women/65.jpg'
        },
        {
          user_id: 'currentUser', 
          liker_id: 'user4', // Jordan Smith - will be matched
          action: 'superLike' as 'like' | 'superLike',
          created_at: new Date(Date.now() - 72000000).toISOString(), // 20 hours ago
          liker_name: 'Jordan Smith',
          liker_image: 'https://randomuser.me/api/portraits/women/21.jpg'
        },
        {
          user_id: 'currentUser', 
          liker_id: 'user7', // Marcus Johnson - will be matched (mixedMatch scenario)
          action: 'superLike' as 'like' | 'superLike',
          created_at: new Date(Date.now() - 54000000).toISOString(), // 15 hours ago
          liker_name: 'Marcus Johnson',
          liker_image: 'https://randomuser.me/api/portraits/men/25.jpg'
        },
        {
          user_id: 'currentUser',
          liker_id: 'user9', // Ethan Williams - will be matched
          action: 'like' as 'like' | 'superLike',
          created_at: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
          liker_name: 'Ethan Williams',
          liker_image: 'https://randomuser.me/api/portraits/men/45.jpg'
        },
        {
          user_id: 'currentUser', 
          liker_id: 'user10', // Olivia Kim - will remain as pending like
          action: 'superLike' as 'like' | 'superLike',
          created_at: new Date(Date.now() - 21600000).toISOString(), // 6 hours ago
          liker_name: 'Olivia Kim',
          liker_image: 'https://images.unsplash.com/photo-1499714608240-22fc6ad53fb2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
        }
      ];
      
      // Directly set the pending likes in the supabase store for testing
      supabaseMatchesStore.setPendingLikes(mockPendingLikesForSupabase);
    } else {
      console.log(`[Mock Data] Pending likes already exist (${currentPendingLikes.length}), preserving current state`);
    }
    
    // Set up current user matching User interface
    const currentUser = {
      id: 'currentUser',
      name: 'Test User',
      email: 'test@example.com',
      profileImage: 'https://randomuser.me/api/portraits/people/1.jpg',
      isPremium: makePremium,
      signupDate: Date.now() - 604800000 // 1 week ago
    };

    // Set the authenticated user in authStore
    authStore.login(currentUser);
    
    console.log('[Mock Data] Mock data initialized 👍');
    console.log(`Premium mode: ${makePremium ? 'ON' : 'OFF'}`);
    console.log(`${mockProfiles.length} profiles loaded`);
    return true;
  } catch (error) {
    console.error('Error initializing mock data:', error);
    return null;
  }
}

/**
 * Function to simulate a swipe action for testing
 * @param targetUserId The ID of the user to swipe on
 * @param action The swipe action (like, superlike, or pass)
 */
export function simulateSwipe(targetUserId: string, action: SwipeAction) {
  try {
    // Get the store states using our lazy loading functions
    const roommateStore = getRoommateStore();
    const matchesStore = getMatchesStore();

    console.log(`Swiping ${action} on user ${targetUserId}...`);

    const result = matchesStore.handleSwipe(targetUserId, action);
    console.log(`Swipe result:`, result);
    if (result) {
      console.log(`Match created! Status: ${result.status}`);
      return result;
    } else {
      console.log('No immediate match. Action recorded.');
      return null;
    }
  } catch (error) {
    console.error('Error simulating swipe:', error);
  }
}

/**
 * Function to handle match creation based on profile scenario
 * This can be used to trigger specific match types for testing
 * @deprecated Use the handleProfileScenario function from matchingUtils.ts instead
 */
export function handleProfileScenario(profile: RoommateProfile) {
  try {
    // Get the store states using our lazy loading functions
    const matchesStore = getMatchesStore();
    const roommateStore = getRoommateStore();

    // Import the new function and use it - safe to use require here as it's not part of a cycle
    const { handleProfileScenario: newHandler } = require('./matchingUtils');

    if (!profile.matchScenario) return null;

    // Determine the appropriate action based on the scenario
    let action: SwipeAction = 'like';

    switch (profile.matchScenario) {
      case 'superMatch':
        action = 'superLike';
        break;
      case 'regularMatch':
        action = 'like';
        break;
      case 'mixedMatch':
        action = 'like';
        break;
      case 'alreadyLiked':
        action = 'like';
        break;
      case 'alreadySuperLiked':
        action = 'superLike';
        break;
      default:
        action = 'like';
    }

    return simulateSwipe(profile.id, action);
  } catch (error) {
    console.error('Error handling profile scenario:', error);
    return null;
  }
}