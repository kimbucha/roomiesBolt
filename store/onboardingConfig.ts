/**
 * Configuration for the restructured onboarding flow
 * Goals step is now step 2 (after welcome) and routes users appropriately
 */

// Place Lister Flow (for users with existing places) - Simplified 3-step flow
export const PLACE_LISTER_STEPS = {
  // Pre-onboarding steps (not counted in progression)
  WELCOME: {
    id: 'welcome',
    step: 0,
    route: 'welcome',
    title: 'Welcome to Roomies',
    nextStep: 'account'
  },
  
  ACCOUNT: {
    id: 'account',
    step: 0,
    route: 'account',
    title: 'Create Your Account',
    nextStep: 'get-started'
  },
  
  GET_STARTED: {
    id: 'get-started',
    step: 0,
    route: 'get-started',
    title: 'Get Started',
    nextStep: 'goals'
  },
  
  GOALS: {
    id: 'goals',
    step: 0,
    route: 'goals', 
    title: 'What brings you here?',
    nextStep: 'place-details'
  },
  
  // Actual onboarding steps (simplified flow)
  // Step 1: Place Details (multi-step internal flow)
  PLACE_DETAILS: {
    id: 'place-details',
    step: 1,
    route: 'place-details',
    title: 'Tell us about your place',
    nextStep: 'photos'
  },
  
  // Step 2: Show Your Best Self (Photos + Age)
  PHOTOS: {
    id: 'photos',
    step: 2,
    route: 'photos',
    title: 'Show your best self',
    nextStep: 'notifications'
  },
  
  // Step 3: Notifications
  NOTIFICATIONS: {
    id: 'notifications',
    step: 3,
    route: 'notifications',
    title: 'Stay Updated',
    nextStep: '' // End of onboarding - go to home
  }
};

// Room Seeker / Roommate Finder Flow (7-step actual onboarding after goals)
export const ROOM_SEEKER_STEPS = {
  // Pre-onboarding steps (not counted in step progression)
  WELCOME: {
    id: 'welcome',
    step: 0,
    route: 'welcome',
    title: 'Welcome to Roomies',
    nextStep: 'account'
  },
  
  ACCOUNT: {
    id: 'account',
    step: 0,
    route: 'account',
    title: 'Create Your Account',
    nextStep: 'get-started'
  },
  
  GET_STARTED: {
    id: 'get-started',
    step: 0,
    route: 'get-started',
    title: 'Get Started',
    nextStep: 'goals'
  },
  
  GOALS: {
    id: 'goals',
    step: 0,
    route: 'goals',
    title: 'What brings you here?',
    nextStep: 'budget'
  },
  
  // Actual onboarding steps (step counting starts here)
  // Step 1: Budget and location
  BUDGET: {
    id: 'budget',
    step: 1,
    route: 'budget',
    title: 'Budget and Location',
    nextStep: 'lifestyle'
  },
  
  // Step 2: Lifestyle Preferences
  LIFESTYLE: {
    id: 'lifestyle',
    step: 2,
    route: 'lifestyle',
    title: 'Lifestyle Preferences',
    nextStep: 'about-you'
  },
  
  // Step 3: About you (traits and gender)
  ABOUT_YOU: {
    id: 'about-you',
    step: 3,
    route: 'about-you',
    title: 'About You',
    nextStep: 'personality/intro'
  },
  
  // Step 4: MBTI test (intro → quiz → results, all staying "Step 4")
  PERSONALITY: {
    id: 'personality',
    step: 4,
    route: 'personality/intro',
    title: 'MBTI Personality Test',
    nextStep: 'photos'
  },
  
  // Step 5: Photos and age
  PHOTOS: {
    id: 'photos',
    step: 5,
    route: 'photos',
    title: 'Photos and Age',
    nextStep: 'education'
  },
  
  // Step 6: Occupation (student/professional)
  EDUCATION: {
    id: 'education',
    step: 6,
    route: 'education',
    title: 'Professional Background',
    nextStep: 'notifications'
  },
  
  // Step 7: Notifications
  NOTIFICATIONS: {
    id: 'notifications',
    step: 7,
    route: 'notifications',
    title: 'Stay Updated',
    nextStep: '' // End of onboarding - go to home
  }
};


// Unified steps for backward compatibility (defaults to room seeker flow)
export const ONBOARDING_STEPS = ROOM_SEEKER_STEPS;

// Helper function to get the appropriate flow based on user role
export const getOnboardingFlow = (userRole?: string) => {
  if (userRole === 'place_lister') {
    return PLACE_LISTER_STEPS;
  }
  return ROOM_SEEKER_STEPS;
};

// Helper function to get the current step number from the step ID and user role
export const getStepNumber = (stepId: string, userRole?: string): number => {
  const flow = getOnboardingFlow(userRole);
  const step = Object.values(flow).find(s => s.id === stepId);
  return step ? step.step : 1;
};

// Helper function to get the next step based on current step ID and user role
export const getNextStep = (currentStepId: string, userRole?: string): string => {
  const flow = getOnboardingFlow(userRole);
  const step = Object.values(flow).find(s => s.id === currentStepId);
  return step ? step.nextStep : '';
};

// Helper function to get total steps for a flow (only counting actual onboarding steps, not pre-onboarding)
export const getTotalSteps = (userRole?: string): number => {
  const flow = getOnboardingFlow(userRole);
  // Count only steps that have step number > 0 (actual onboarding steps)
  return Object.values(flow).filter(step => step.step > 0).length;
};

// Helper function to check if onboarding is complete
export const isOnboardingComplete = (completedSteps: string[], userRole?: string): boolean => {
  const flow = getOnboardingFlow(userRole);
  const requiredSteps = Object.values(flow).map(step => step.id);
  return requiredSteps.every(step => completedSteps.includes(step));
};

