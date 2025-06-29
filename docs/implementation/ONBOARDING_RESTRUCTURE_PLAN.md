# Onboarding Flow Restructure Plan

## Current Flow Analysis

### Current Order (9 steps):
1. **Welcome** (`welcome.tsx`) - Name input
2. **Budget** (`budget.tsx`) - Budget and location 
3. **Lifestyle** (`lifestyle.tsx`) - Lifestyle preferences
4. **Personality Intro** (`personality/intro.tsx`) - MBTI introduction
5. **Goals** (`goals.tsx`) - "What brings you here" - Housing goals
6. **About You** (`about-you.tsx`) - Personal preferences
7. **Education** (`education.tsx`) - Professional background  
8. **Photos** (`photos.tsx`) - "Show your best self" - Photos + age
9. **Social Proof** (`social-proof.tsx`) - Community joining
10. **Notifications** (`notifications.tsx`) - Stay updated

## New Flow Requirements

### User's Goals:
1. Move "What brings you here" (Goals) to **FIRST STEP** after welcome
2. Route users based on selection:
   - **"Got a place, looking for roomies"** → Place details flow → Photos/Age → Notifications → Home
   - **Other options** → Standard flow
3. Move "About You" to be **AFTER** Lifestyle and **BEFORE** Personality Quiz
4. Remove "Social Proof" page completely
5. Update all step numbers and navigation properly

## New Flow Design

### Path A: Place Lister Flow
1. **Welcome** - Name input
2. **Goals** - What brings you here (NEW FIRST STEP)
3. **Place Details** - Multi-step place listing
4. **Photos** - Profile photo + age ("Show your best self")  
5. **Notifications** - Stay updated
6. **Complete** → Navigate to home

### Path B: Room Seeker / Roommate Finder Flow  
1. **Welcome** - Name input
2. **Goals** - What brings you here (NEW FIRST STEP)
3. **Budget** - Budget and location
4. **Lifestyle** - Lifestyle preferences
5. **About You** - Personal preferences (MOVED HERE)
6. **Personality Intro** - MBTI introduction  
7. **Personality Quiz** - MBTI quiz
8. **Personality Results** - Results
9. **Education** - Professional background
10. **Photos** - Profile photo + age ("Show your best self")
11. **Notifications** - Stay updated
12. **Complete** → Navigate to home

## Implementation Tasks

### 1. Update Onboarding Configuration
- [ ] Update `store/onboardingConfig.ts` to reflect new flow
- [ ] Create separate flow definitions for place lister vs room seeker
- [ ] Update step numbers and next step routing

### 2. Restructure Goals Page
- [ ] Update `goals.tsx` to be step 2 instead of step 5
- [ ] Update routing logic to direct to appropriate next step
- [ ] Update progress indicators

### 3. Update Navigation Flow
- [ ] Update `welcome.tsx` to navigate to `goals` instead of `budget`
- [ ] Update `goals.tsx` routing logic:
  - Place lister → `place-details`
  - Others → `budget`
- [ ] Update `place-details.tsx` to navigate to `photos` when complete
- [ ] Update other pages to reflect new step order

### 4. Reorder About You Page  
- [ ] Update `about-you.tsx` to come after lifestyle
- [ ] Update `lifestyle.tsx` to navigate to `about-you` 
- [ ] Update `about-you.tsx` to navigate to `personality/intro`

### 5. Remove Social Proof
- [ ] Remove `social-proof.tsx` from navigation
- [ ] Update `photos.tsx` to navigate directly to `notifications`
- [ ] Remove from onboarding layout and configuration

### 6. Update Step Numbers and Progress
- [ ] Update all onboarding templates to show correct step numbers
- [ ] Fix progress indicators throughout the flow
- [ ] Update total step counts

### 7. Update Layout and Route Definitions
- [ ] Update `app/(onboarding)/_layout.tsx` to remove social-proof
- [ ] Ensure all routes are properly defined

## Implementation Order

1. **Create new onboarding configuration** with branching logic
2. **Update goals.tsx** to be first step and handle routing
3. **Update welcome.tsx** to navigate to goals  
4. **Reorder about-you.tsx** placement in flow
5. **Remove social-proof** references
6. **Update all step numbers** and navigation
7. **Test both flows** end-to-end

## Testing Requirements

- [ ] Test Place Lister Flow: Welcome → Goals → Place Details → Photos → Notifications → Home
- [ ] Test Room Seeker Flow: Welcome → Goals → Budget → Lifestyle → About You → Personality → Education → Photos → Notifications → Home  
- [ ] Verify step numbers are correct in both flows
- [ ] Verify navigation works in both directions (forward/back)
- [ ] Test data persistence throughout flows 