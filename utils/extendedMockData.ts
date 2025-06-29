import { RoommateProfile } from '../store/roommateStore';
import { generateId } from './idGenerator';

// Helper function to get random room photos
const sampleRoomPhotos = [
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8YXBhcnRtZW50fGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTd8fGFwYXJ0bWVudHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fGFwYXJ0bWVudHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60',
  'https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGFwYXJ0bWVudHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60',
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGFwYXJ0bWVudHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60',
];

const getRandomRoomPhotos = (count = 3) => {
  const shuffled = [...sampleRoomPhotos].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, shuffled.length));
};

/**
 * Extended mock profiles for testing edge cases
 */
export const extendedMockProfiles: RoommateProfile[] = [
  // Super Like Candidate - High compatibility score
  {
    id: 'user10',
    name: 'Sophia Chen',
    age: 23,
    university: 'Stanford University',
    major: 'Data Science',
    bio: 'Grad student looking for a quiet place to focus on research. I love hiking on weekends and cooking healthy meals.',
    budget: '$1400-1700',
    location: 'Palo Alto',
    neighborhood: 'College Terrace',
    image: 'https://randomuser.me/api/portraits/women/33.jpg',
    traits: ['Studious', 'Active', 'Health-conscious'],
    verified: true,
    compatibilityScore: 95, // Very high compatibility for super like testing
    hasPlace: true,
    roomType: 'private',
    amenities: ['Study Room', 'High-speed Internet', 'Bike Storage'],
    bedrooms: 2,
    bathrooms: 1,
    isFurnished: true,
    socialMedia: {
      instagram: 'sophia.data',
      linkedin: 'sophiachen_ds'
    },
    lifestylePreferences: {
      sleepSchedule: 'early_bird',
      cleanliness: 'very_clean',
      noiseLevel: 'quiet',
      guestPolicy: 'rarely',
      studyHabits: 'in_silence',
      substancePolicy: 'none'
    },
    personalPreferences: {
      temperature: 'cool',
      petPreference: 'no_pets',
      hometown: 'Seattle, WA',
      pronouns: 'she/her'
    },
    matchScenario: 'superMatch', // Will trigger super match notification
    leaseDuration: '12 months',
    moveInDate: 'June 1, 2023',
    flexibleStay: false,
    leaseType: 'Standard',
    utilitiesIncluded: ['All utilities included'],
    petPolicy: 'No pets allowed',
    subletAllowed: false
  },
  
  // Place Listing - For testing place card interactions
  {
    id: 'user11',
    name: 'Luxury Downtown Loft',
    age: 0, // Not applicable for place listings
    university: '',
    major: '',
    bio: 'Modern loft in the heart of downtown with stunning views. Recently renovated with high-end appliances and designer furniture.',
    budget: '$2200-2500',
    location: 'San Francisco',
    neighborhood: 'SoMa',
    image: 'https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8YXBhcnRtZW50fGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60',
    roomPhotos: getRandomRoomPhotos(5),
    traits: ['Modern', 'Central', 'Luxury'],
    verified: true,
    compatibilityScore: 88,
    hasPlace: true, // This is a place listing
    roomType: 'private', // Changed from 'entire_place' to match allowed types
    amenities: ['Rooftop Access', 'Smart Home', 'Concierge', 'Gym', 'Package Service'],
    bedrooms: 2,
    bathrooms: 2,
    isFurnished: true,
    description: 'Stunning 2-bedroom loft with floor-to-ceiling windows offering panoramic city views. Features include hardwood floors, stainless steel appliances, and custom lighting.',
    matchScenario: 'regularMatch',
    leaseDuration: '12 months',
    moveInDate: 'Immediate',
    flexibleStay: false,
    leaseType: 'Standard',
    utilitiesIncluded: ['Water', 'Trash', 'Internet'],
    petPolicy: 'Pet friendly (with deposit)',
    subletAllowed: true
  },
  
  // Low Compatibility Profile - For testing dislike interactions
  {
    id: 'user12',
    name: 'Alex Thompson',
    age: 26,
    university: 'None',
    major: '',
    bio: 'Musician and night owl. I practice drums at home and host jam sessions regularly. Looking for roommates who love music and late nights.',
    budget: '$900-1100',
    location: 'Oakland',
    image: 'https://randomuser.me/api/portraits/men/55.jpg',
    traits: ['Musical', 'Night Owl', 'Social'],
    verified: false, // Not verified
    compatibilityScore: 45, // Low compatibility
    hasPlace: false,
    socialMedia: {
      instagram: 'alex_drums',
      spotify: 'alexthompsonmusic'
    },
    lifestylePreferences: {
      sleepSchedule: 'night_owl',
      cleanliness: 'relaxed', // Changed from 'messy' to match allowed types
      noiseLevel: 'loud',
      guestPolicy: 'frequently',
      studyHabits: 'with_background', // Changed from 'with_noise' to match allowed types
      substancePolicy: 'all_ok'
    },
    personalPreferences: {
      temperature: 'warm',
      petPreference: 'all_pets_ok',
      hometown: 'Austin, TX',
      pronouns: 'he/him'
    },
    matchScenario: 'regularMatch', // Changed from 'noMatch' to match allowed types
    leaseDuration: '3 months',
    moveInDate: 'ASAP',
    flexibleStay: true,
    leaseType: 'Month-to-month',
    utilitiesIncluded: [],
    petPolicy: 'Pet friendly',
    subletAllowed: true
  },
  
  // Premium Feature Test Profile
  {
    id: 'user13',
    name: 'Emma Watson',
    age: 24,
    university: 'UC Berkeley',
    major: 'Environmental Science',
    bio: 'Environmentalist and yoga instructor looking for eco-conscious roommates. I maintain a zero-waste lifestyle and prefer a quiet, mindful home environment.',
    budget: '$1300-1600',
    location: 'Berkeley',
    neighborhood: 'North Berkeley',
    image: 'https://randomuser.me/api/portraits/women/45.jpg',
    traits: ['Eco-friendly', 'Mindful', 'Active'],
    verified: true,
    compatibilityScore: 89,
    hasPlace: true,
    roomType: 'private',
    amenities: ['Garden', 'Composting', 'Solar Panels', 'Bike Storage'],
    bedrooms: 3,
    bathrooms: 2,
    isFurnished: false,
    socialMedia: {
      instagram: 'emma.eco',
      linkedin: 'emmawatson_env'
    },
    lifestylePreferences: {
      sleepSchedule: 'early_bird',
      cleanliness: 'very_clean',
      noiseLevel: 'quiet',
      guestPolicy: 'occasionally',
      studyHabits: 'in_silence',
      substancePolicy: 'none'
    },
    personalPreferences: {
      temperature: 'moderate',
      petPreference: 'all_pets_ok', // Changed from 'small_pets_ok' to match allowed types
      hometown: 'Portland, OR',
      pronouns: 'she/her'
    },
    matchScenario: 'superMatch', // Changed from 'premiumMatch' to match allowed types
    leaseDuration: '6 months',
    moveInDate: 'August 1, 2023',
    flexibleStay: true,
    leaseType: 'Standard',
    utilitiesIncluded: ['Water', 'Internet', 'Electricity'],
    petPolicy: 'Small pets allowed',
    subletAllowed: false
  },
  
  // International Student Profile
  {
    id: 'user14',
    name: 'Hiroshi Tanaka',
    age: 22,
    university: 'Stanford University',
    major: 'International Relations',
    bio: 'International student from Tokyo looking for roommates to help me improve my English and learn about American culture. I\'m clean, quiet, and respectful.',
    budget: '$1200-1500',
    location: 'Palo Alto',
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
    traits: ['International', 'Studious', 'Cultural'],
    verified: true,
    compatibilityScore: 82,
    hasPlace: false,
    socialMedia: {
      instagram: 'hiroshi.t',
      facebook: 'hiroshitanaka'
    },
    lifestylePreferences: {
      sleepSchedule: 'flexible',
      cleanliness: 'clean',
      noiseLevel: 'quiet',
      guestPolicy: 'rarely',
      studyHabits: 'in_silence',
      substancePolicy: 'none'
    },
    personalPreferences: {
      temperature: 'moderate',
      petPreference: 'no_pets',
      hometown: 'Tokyo, Japan',
      pronouns: 'he/him'
    },
    matchScenario: 'regularMatch',
    leaseDuration: '9 months',
    moveInDate: 'September 15, 2023',
    flexibleStay: false,
    leaseType: 'Academic year',
    utilitiesIncluded: ['All utilities included'],
    petPolicy: 'No pets allowed',
    subletAllowed: false
  },
  
  // Accessibility-Focused Profile
  {
    id: 'user15',
    name: 'Maya Johnson',
    age: 27,
    university: 'UCSF',
    major: 'Physical Therapy',
    bio: 'Healthcare professional looking for an accessible apartment. I use a wheelchair and need a ground floor unit or building with elevator and wide doorways. Accessibility requirements: wheelchair accessible, no steps, wide doorways.',
    budget: '$1600-1900',
    location: 'San Francisco',
    neighborhood: 'Mission Bay',
    image: 'https://randomuser.me/api/portraits/women/52.jpg',
    traits: ['Professional', 'Organized', 'Adaptable'],
    verified: true,
    compatibilityScore: 79,
    hasPlace: false,
    socialMedia: {
      linkedin: 'mayajohnson_pt',
      facebook: 'maya.johnson'
    },
    lifestylePreferences: {
      sleepSchedule: 'early_bird',
      cleanliness: 'very_clean',
      noiseLevel: 'moderate',
      guestPolicy: 'occasionally',
      studyHabits: 'with_background',
      substancePolicy: 'alcohol_only'
    },
    personalPreferences: {
      temperature: 'warm',
      petPreference: 'all_pets_ok', // Changed from 'service_animals' to match allowed types
      hometown: 'Chicago, IL',
      pronouns: 'she/her'
    },
    matchScenario: 'regularMatch',
    leaseDuration: '12 months',
    moveInDate: 'July 1, 2023',
    flexibleStay: false,
    leaseType: 'Standard',
    utilitiesIncluded: ['Water', 'Internet'],
    petPolicy: 'Service animals only',
    subletAllowed: true
  }
];

/**
 * Function to add extended mock profiles to the existing mock data
 */
export function addExtendedMockProfiles() {
  // DISABLED: These profiles don't have personality types and cause undefined errors
  console.log('[Extended Mock Data] Extended profiles disabled to prevent personality type issues');
  return false;
}
