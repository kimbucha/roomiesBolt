# Implementation Plan: Templated Discover Card System

**Goal:** Create a templated discover card system where all cards display complete personality profiles with real Supabase user data, not mock data.

**Current State Analysis:**
- ✅ Jamie Rodriguez card has complete personality profile with ENFP type, chart, and compatibility data
- ✅ PersonalityDetailSection component fully implemented with CompatibilityRadarChart  
- ✅ Database schema supports all personality fields (personality_type, personality_traits, personality_dimensions)
- ❌ Other discover cards using mock data instead of real Supabase user data
- ❌ Inconsistent personality data across cards

**Objective:**
Create a templated discover card system where:
1. **All cards use real Supabase user data** instead of mock data
2. **Every card has complete personality profile** like Jamie Rodriguez
3. **Template is optimized for performance** with efficient rendering
4. **Data is dynamically populated** from users table and roommate_profiles table

## Implementation Strategy

### Phase 1: Real User Data Service
**Files to Create/Modify:**
- `services/UserProfileService.ts` - New service for real user data
- `store/roommateStore.ts` - Replace mock data with real Supabase queries
- `utils/compatibilityCalculator.ts` - Compatibility scoring algorithm

**Database Schema Mapping:**
```typescript
// Supabase users + roommate_profiles → RoommateProfile interface
{
  personality_type: string,           // "ENFP", "INTJ", etc.
  personality_traits: string[],       // ["creative", "social", "adaptable"]  
  personality_dimensions: JSONB,      // { ei: 25, sn: 75, tf: 80, jp: 85 }
  lifestyle_preferences: JSONB,       // Sleep, cleanliness, noise preferences
  // ... other fields
}
```

### Phase 2: Template Standardization  
**Files to Modify:**
- `components/roommate/RoommateDetailCard.tsx` - Ensure works with all real data
- `components/roommate/PersonalityDetailSection.tsx` - Add fallback personality data
- `components/roommate/CompatibilityRadarChart.tsx` - Performance optimizations

**Personality Data Flow:**
```
Supabase Users Table → UserProfileService → RoommateDetailCard → PersonalityDetailSection → CompatibilityRadarChart
```

### Phase 3: Performance Optimization
- Lazy load CompatibilityRadarChart until expanded
- Pre-fetch user profile images  
- Cache formatted personality data
- Optimize stack rendering for smooth swiping

### Phase 4: Fixed Critical Profile Resolution Logic ✅

### Phase 5: Fixed Match Card Premium Styling Issue ✅
- **Root Cause**: `MatchCardItem` component was incorrectly applying premium restrictions to actual match cards
- **Problem**: Jamie's match card appeared blurred with premium badges/locks even though it's an actual match
- **Logic Error**: The component treated both matches and pending likes the same way for non-premium users
- **Fix Applied**:
  - Removed `blurRadius={!isPremium ? 15 : 0}` from match card images
  - Removed premium overlay (`bg-black/30`) from match card images  
  - Removed premium lock badge from match card top-right corner
  - Removed premium text indicator below match card name
  - Updated onPress logic to always allow navigation to match profiles
- **Core Principle**: **Actual matches should be fully accessible regardless of premium status** 
- **Premium Feature Scope**: Only pending likes should be gated behind premium, not confirmed matches

### Phase 6: Fixed Super Like Features ✅
- **Fixed Notification Text**: Changed "Special Match!" to "Super Match!" in match notifications
  - Updated `MatchNotification.tsx` line 238: `mixedMatched` status now shows "Super Match!"
  - Updated `MatchesList.tsx` line 94: badge text changed from "⭐ Special Match!" to "⭐ Super Match!"
- **Fixed Super Like Badge Logic**: Fixed `mixedMatch` scenario to properly set super like actions
  - **Problem**: Mixed matches weren't showing "Super" badge because `user2Action` was set to `'like'` instead of `'superLike'`
  - **Fix**: Added logic for `mixedMatch` scenario to set `user2Action = 'superLike'` (the other user super liked)
  - **Result**: Marcus's match card now shows "Super" badge in bottom-right corner
- **Enhanced Debugging**: Added match action logging to see super like detection in action

### Phase 7: Fixed Pending Likes Count Logic ✅
- **Root Cause**: Marcus (`user7`) had `matchScenario: 'mixedMatch'` but wasn't in the initial pending likes list
- **Problem**: When swiping on Marcus, a match was created but no pending like was removed
- **Logs Evidence**: 
  - `[SupabaseMatchesStore] Pending likes before: 2, after: 2` (no change for Marcus)
  - `[SupabaseMatchesStore] Found pending likes from matched user: Array(0)` (Marcus not found)
- **Fix Applied**: Added Marcus to the mock pending likes setup with `superLike` action
- **Result**: Now when you match with Marcus, pending likes count decreases correctly
- **New Flow**: 5 pending likes → match with 4 users → 1 pending like remaining (Olivia)

### Phase 8: Enhanced Match Profile Personality Section ✅
- **Feature**: Added comprehensive personality visualization to match profile pages
- **Components Added**:
  - **Personality Image**: Circular personality type image with colored border matching personality type
  - **Radar Chart**: Full CompatibilityRadarChart showing both user and matched user personalities
  - **Color Theming**: Dynamic personality colors throughout the section
  - **Comparison Labels**: Clear visual indicators showing "You" vs matched user with color coding
- **Technical Implementation**:
  - Imported `CompatibilityRadarChart` component to match profile
  - Added personality type definitions, colors, and image mappings
  - Created dynamic color theming based on both users' personality types
  - Replaced basic bar charts with comprehensive radar visualization
  - Added proper fallback data for personality dimensions
- **Visual Enhancements**:
  - **Title**: "Personality Compatibility" (more descriptive than basic "Personality Type")
  - **Header**: Large personality image (96x96) with colored border and background tint
  - **Typography**: Personality type in large text with personality-specific color
  - **Chart**: Radar visualization comparing both personalities with proper colors
  - **Legend**: Color-coded labels showing both users' personality types
- **Data Integration**: Uses actual personality data from matched user profiles
- **Result**: Match profiles now display rich personality visualization matching discover card quality

## Key Files Modified
- `app/(tabs)/index.tsx` - Filter logic, super like match creation
- `store/supabaseMatchesStore.ts` - Match utilities, profile resolution, pending likes management
- `utils/mockDataSetup.ts` - Mock data alignment, pending likes setup
- `app/(tabs)/matches/index.tsx` - Data transformation, type fixes
- `components/matches/NewMatchesSection.tsx` - Match card styling, super like badges, debugging
- `components/matching/MatchNotification.tsx` - Super match text fixes
- `components/matching/MatchesList.tsx` - Super match badge text
- `app/(tabs)/matches/[matchId].tsx` - **Enhanced personality section with radar chart** ✅
- `implementation_plan.md` - Documentation

## Expected Results
1. ✅ **Matches Display**: Jamie, Jordan, Marcus appear as clear match cards without premium restrictions
2. ✅ **Pending Likes Count**: Correctly decrements from 5 → 1 after matching with 4 users
3. ✅ **Super Like Features**: "Super Match!" notifications and "Super" badges on appropriate cards
4. ✅ **Premium Features**: Accurate dynamic counts, proper like/match card separation
5. ✅ **Match Profiles**: Rich personality visualization with radar charts, images, and color theming

## Success Metrics
- Match cards render properly without blur/premium restrictions
- Pending likes count updates accurately after each match
- Super like badges appear on mixed match cards (Marcus)
- Premium section shows correct like counts
- **Match profile personality sections display radar charts and personality images** ✅

---

# Implementation Plan: Critical Database Schema Fix - Profile Picture Column Name

**Goal:** Fix database column name mismatch causing "skip for now" onboarding errors.

**Issue:** When users skip onboarding, the app attempts to update a `profile_picture` column that doesn't exist in the database. The database schema only has `profile_image_url`.

**Error:** `Could not find the 'profile_picture' column of 'users' in the schema cache`

**Files Modified:**
*   `store/supabaseUserStore.ts`: Fixed field mapping in updateUser function.

**Root Cause:**
*   The database schema (`supabase/schema.sql`) defines the column as `profile_image_url` (line 17).
*   The `supabaseUserStore.ts` was trying to update `profile_picture` instead of `profile_image_url`.
*   This mismatch caused database errors whenever profile pictures were updated, especially during onboarding skip.

**Fix Applied:**
*   In `store/supabaseUserStore.ts`, line 268: Changed `updateData.profile_picture = userData.profilePicture;` to `updateData.profile_image_url = userData.profilePicture;`
*   The `formatSupabaseUser` function already had backward compatibility handling both field names.

**Testing:**
*   Created and ran database test script confirming:
    - ✅ `profile_image_url` updates work correctly
    - ✅ `profile_picture` updates fail as expected (column doesn't exist)
*   This ensures the fix resolves the exact error users were experiencing.

**Impact:**
*   "Skip for now" functionality now works without database errors.
*   Profile picture updates work correctly throughout the app.
*   Maintains backward compatibility for any existing data.

---

# Implementation Plan: Fix Premium Card Blur Artifact

**Goal:** Resolve the visual glitch on the premium match card where a square background behind the lock icon interrupts the blur effect.

**File:** `components/matching/MatchesList.tsx`

**Analysis:**
- The current implementation uses a `<BlurView>` overlay on the match image for non-premium users.
- On top of the `<BlurView>`, a `premiumOverlay` view is added.
- Inside `premiumOverlay`, a `lockIconContainer` view holds the `<Lock>` icon.
- The `lockIconContainer` has a `backgroundColor` style (`rgba(79, 70, 229, 0.9)`), which creates the opaque square artifact obscuring the blur beneath it.

**Proposed Change:**
1. Modify the `styles.lockIconContainer` in `components/matching/MatchesList.tsx`.
2. Remove or set the `backgroundColor` property of `lockIconContainer` to `'transparent'`. This will allow the `<BlurView>` behind it to show through consistently.

**Verification:**
- After applying the change, visually inspect the premium match card in the app (or a simulator/preview) to confirm that the square artifact is gone and the blur is uniform behind the lock icon.
- Ensure the lock icon remains clearly visible.

---

# Implementation: Fix Profile Picture Priority After Onboarding

**Goal:** Ensure users who complete onboarding with uploaded photos get their actual photos as profile pictures instead of falling back to personality images.

**Files Modified:**
*   `app/(onboarding)/photos.tsx`: Updated `handleContinue` function to prioritize uploaded photos.

**Issue Identified:**
*   Users completing the full onboarding flow (including photo upload) were getting `'personality_image'` saved as their profile picture instead of their actual uploaded photos.
*   This caused the potato fallback to appear in the profile tab while personality images appeared in other locations, creating inconsistency.
*   The logs showed: `"profile_picture_url": "personality_image"` being saved even when users had uploaded real photos.

**Root Cause Analysis:**
*   In the photos onboarding step, the logic prioritized the personality image when `profilePhotoIndex === -1` regardless of whether the user had uploaded actual photos.
*   The original logic: `profilePhotoIndex === -1 ? 'personality_image' : photos[profilePhotoIndex]` defaulted to `'personality_image'` without checking if uploaded photos existed.

**Changes Implemented:**
1. **Enhanced Profile Picture Priority Logic**: Modified the `handleContinue` function in `photos.tsx` to implement proper priority:
   - **Priority 1**: If user uploaded photos and selected one, use that photo
   - **Priority 2**: If user uploaded photos but no selection, use first uploaded photo  
   - **Priority 3**: Only fall back to personality image if no uploaded photos exist

2. **Consistent State Management**: Updated both the Supabase data and local user state to use the same priority logic for `profilePhotoIndex`.

3. **Proper URL Handling**: Ensured actual photo URLs are saved instead of the placeholder `'personality_image'` string.

**Code Changes:**
- Replaced the simple ternary operator with comprehensive priority logic
- Added proper validation for photo array bounds
- Ensured consistency between local state and Supabase data

**Verification:**
*   Users who complete onboarding with uploaded photos should now have their actual photos as profile pictures everywhere in the app.
*   The potato image should only appear for users who truly skipped photo upload.
*   Personality images should only be used as a last resort when no uploaded photos exist.
*   Profile picture consistency should be maintained across all app screens.

---

# Implementation: User Profile View Screen

**Goal:** Create a screen to display another user's profile information comprehensively.

**Files Created/Modified:**
*   `app/(app)/profile/[userId].tsx`: New screen component.
*   `store/userStore.ts`: Added `blockedUserIds` state and `blockUser` action; added `id` to `placeDetails`.
*   `app/reviews.tsx`: Modified to accept `userId` param and display dynamically.
*   `docs/screens-overview.md`: Added entry for the new screen.

**Functionality Implemented:**
*   Displays user's core info (avatar, name, university, bio, etc.), photos, personality traits, lifestyle preferences, ratings/reviews, and conditional listing details.
*   Uses shared `Avatar`, `Badge`, and `Tag` components.
*   Fetches profile data via `ApiService.getUserProfile` and review data via `getUserReviews`.
*   Includes action buttons in the header:
    *   `Message`: Navigates to `/conversation/[userId]` (handles potential creation).
    *   `More Options`: Uses `Alert.alert` for Report/Block/Unmatch actions.
        *   Block: Calls `userStore.blockUser`, then `matchesStore.deleteMatch` if matched, navigates back.
        *   Unmatch: Calls `matchesStore.deleteMatch`, navigates back.
        *   Report: Placeholder alert.
*   Includes navigation to full reviews (`/reviews?userId=...`) and listing details (`/place-detail?id=...`).

**Pending/Future Work:**
*   Implement real compatibility score calculation logic.
*   Implement actual reporting API call.
*   Refine UI/UX and styling.
*   Integrate block list usage (preventing blocked users from appearing elsewhere).

---

# Implementation: Refine Personality Quiz "Thinking Style" Questions

**Goal:** Improve the clarity and relevance of the "Thinking Style" (Sensing vs. Intuition) questions in the onboarding personality quiz, moving away from potentially confusing Myers-Briggs terminology towards more practical, roommate-focused scenarios.

**Files Modified:**
*   `app/(onboarding)/animated-steps/steps/PersonalityStep.tsx`: Updated the `snQuestions` array.
*   `app/(onboarding)/personality/quiz.tsx`: Updated the `snQuestions` array.

**Analysis:**
*   User feedback indicated the original questions for the SN dimension (based on Myers-Briggs Sensing/Intuition) were slightly confusing.
*   The SN dimension relates to how people perceive information (concrete facts vs. underlying patterns/possibilities).

**Changes Implemented:**
*   Replaced the three existing `snQuestions` in both files with new questions focused on:
    *   Problem-solving approach (practical fix vs. underlying cause).
    *   Focus when getting to know roommates (habits/experience vs. potential/interests).
    *   Preferred living environment vibe (functional/practical vs. inspiring/adaptable).

**Verification:**
*   The onboarding flow (step 4, part 2) should now display the revised "Thinking Style" questions.
*   The underlying logic for calculating the `snScore` and determining the personality type remains unchanged, simply using the input from the new questions.

**Update (UI Fix):**
*   Shortened the `leftLabel` and `rightLabel` for question `sn3` ("I prefer my living environment to be:") in both files to prevent text overflow on smaller screens. (`Practical & Functional` / `Inspiring & Adaptable`).

**Update (UI Fix - Attempt 2):**
*   Changed `width: '45%'` to `flex: 1` for labels in `PersonalityStep.tsx` (`styles.labelText`).
*   Reduced `fontSize` from 13 to 12 for labels in `PersonalityQuiz.tsx` (`styles.sliderLabel`) to improve spacing and prevent clipping.

**Update (UI Fix - Attempt 3):**
*   Increased `paddingBottom` for the `questionsContainer` in `PersonalityQuiz.tsx` from 10 to 16 to improve visual balance and spacing below the last question card.

**Update (UI Fix - Attempt 4):**
*   Further increased `paddingBottom` for the `questionsContainer` in `PersonalityQuiz.tsx` from 16 to 24 to create a more distinct visual gap below the final card.

---

# Implementation: Simplify Onboarding Step 5 (Goals)

**Goal:** Streamline the "What brings you here?" (Goals) step in onboarding by removing redundant options.

**File Modified:**
*   `app/(onboarding)/goals.tsx`: Updated the `goalOptions` array.

**Analysis:**
*   The original Step 5 presented four options: 'Finding a room', 'Finding roommates', 'Exploring together', and 'Just browsing'.
*   Analysis of the `handleContinue` logic showed that 'Finding a room', 'Exploring together', and 'Just browsing' all led to the `about-you` screen, while only 'Finding roommates' led to the `place-details` screen.

**Changes Implemented:**
*   Commented out the 'Just browsing for now' option (`id: 'browsing'`) from the `goalOptions` array.
*   This reduces the choices to three, making the branching logic clearer for the user (1 option leads to listing a place, 2 options lead to general profile setup).
*   No changes were needed to the `handleContinue` function's logic, as the `default` case correctly handles the remaining options that navigate to `about-you`.

**Verification:**
*   The onboarding flow (Step 5) should now display only three goal options.
*   Selecting 'Finding a room' or 'Exploring together' should navigate to the `about-you` screen.
*   Selecting 'Finding roommates' should navigate to the `place-details` screen.

---

# Implementation: Update Bathroom Counter Step in Place Details

**Goal:** Allow users to specify fractional bathrooms (e.g., 1.5) in the "Tell us about your place" onboarding step.

**File Modified:**
*   `components/features/onboarding/place-listing/BasicInfoStep.tsx`: Modified the `PropertyCounter` props for bathrooms.

**Analysis:**
*   The existing bathroom counter incremented/decremented by 1 and had a minimum value of 1.
*   Users need the ability to represent half-baths.
*   The underlying `PropertyCounter` component was confirmed to display decimal numbers correctly.

**Changes Implemented:**
*   In `BasicInfoStep.tsx`, changed the `onIncrement` and `onDecrement` callbacks for the bathroom `PropertyCounter` to add/subtract `0.5` instead of `1`.
*   Set the `minValue` prop for the bathroom `PropertyCounter` to `0.5`.

**Verification:**
*   In the "Tell us about your place" screen (Step 1 - Basic Information), the bathroom counter should now increment and decrement in steps of 0.5 (e.g., 0.5, 1, 1.5, 2, ...).
*   The minimum value selectable for bathrooms should be 0.5.

---

# Implementation: Add Date of Birth Picker to Photos Step

**Goal:** Add a mandatory Date of Birth selection to the "Show Your Best Self" (Photos) onboarding step.

**Files Modified:**
*   `store/userStore.ts`: Added optional `dateOfBirth` (string) field to `User` interface.
*   `app/(onboarding)/photos.tsx`: Integrated the date picker UI and logic.

**Dependencies Checked:**
*   `@react-native-community/datetimepicker`: Already present.
*   `date-fns`: Already present.

**Analysis:**
*   Storing Date of Birth (DOB) is preferred over storing age directly.
*   A native date picker provides the best user experience.
*   The step should require both DOB and at least one photo to proceed.
*   Users must be at least 18 years old.

**Changes Implemented in `photos.tsx`:**
*   Added state for `dateOfBirth` (Date object) and `showDatePicker` (boolean).
*   Added UI: A styled `TouchableOpacity` to show selected DOB/placeholder and trigger the picker.
*   Conditionally rendered `@react-native-community/datetimepicker` with:
    *   `mode='date'`, platform-specific display (`spinner`/`default`).
    *   `maximumDate` set to 18 years prior to today.
    *   `minimumDate` set to 100 years prior to today.
    *   `onChange` handler (`onDateChange`) for state updates and validation (age check).
    *   Added an iOS-specific "Done" button for the spinner.
*   Updated `isFormReady()` to require both `dateOfBirth != null` and photo presence.
*   Updated `handleContinue`:
    *   To check `isFormReady` and show specific alerts for missing DOB or photo.
    *   To format the DOB state (Date object) into `YYYY-MM-DD` string using `date-fns/format` before calling `updateUser`.
    *   To navigate to `/(onboarding)/social-proof`.
*   Added styles for the date input and related elements.
*   Adjusted photo grid styles for 3 columns.

**Verification:**
*   The "Show Your Best Self" screen should now display a "Date of Birth" input above the photo section.
*   Tapping the input should open the native date picker.
*   The selectable date range should be restricted (18-100 years old).
*   An alert should show if an invalid date (e.g., under 18) is selected.
*   The "Continue" button should only be enabled when both a valid DOB is selected AND at least one photo is present.
*   The selected DOB should be saved correctly to the user state in `YYYY-MM-DD` format upon continuing.

**Update (Fix - iOS Picker Text Color):**
*   Added `theme='light'` prop conditionally to the iOS `DateTimePicker` to ensure dark text appears on the white modal background.
*   Bypassed a related TypeScript error by casting the props object to `any`.

**Update (Fix - iOS Picker Text Color - Attempt 2):**
*   Explicitly added `textColor='#000000'` prop conditionally to the iOS `DateTimePicker` to force dark text on the white modal background.

**Verification:**
*   The "About You" screen should load with no gender option selected by default.
*   On the "Photos" screen (iOS), tapping the date input should now open a modal:
    *   The background should dim.
    *   A centered white card should contain the date picker spinner and a "Done" button.
    *   The spinner controls should be clearly visible against the white background.
    *   Tapping "Done" or the overlay should close the modal.
*   On the "Photos" screen, the photo grid section should appear above the date of birth input section.
*   The "Show Your Best Self" screen should now display a "Date of Birth" input above the photo section.
*   Tapping the input should open the native date picker.
*   The selectable date range should be restricted (18-100 years old).
*   An alert should show if an invalid date (e.g., under 18) is selected.
*   The "Continue" button should only be enabled when both a valid DOB is selected AND at least one photo is present.
*   The selected DOB should be saved correctly to the user state in `YYYY-MM-DD` format upon continuing.

---

# Implementation: Correct Onboarding Flow Navigation

**Goal:** Reorder the onboarding steps to match the revised 11-step flow, ensuring users create their account before seeing social proof and notification prompts.

**Files Modified:**
*   `app/(onboarding)/photos.tsx`: Changed navigation target to `/account`, updated step numbers (8/11).
*   `app/(onboarding)/account.tsx`: Changed navigation target to `/social-proof`, updated step numbers (9/11).
*   `app/(onboarding)/social-proof.tsx`: Changed navigation target to `/notifications`, updated step numbers (10/11), fixed TS error for path.
*   `app/(onboarding)/notifications.tsx`: New file created.

**Analysis:**
*   The previous flow incorrectly navigated from Photos -> Social Proof -> Notifications, skipping Account Creation.
*   The revised flow is: Photos (8) -> Account (9) -> Social Proof (10) -> Notifications (11) -> App.
*   The `notifications.tsx` screen was missing.

**Changes Implemented:**
*   **`photos.tsx`:** Updated `handleContinue` to push to `/(onboarding)/account`. Set step props to `8` and `11`.
*   **`account.tsx`:** Updated `handleCreateAccount` (inside `setTimeout`) to push to `/(onboarding)/social-proof`. Set step props to `9` and `11`. Updated `updateOnboardingProgress` to set next step to `social-proof` and `isComplete` to `false`.
*   **`social-proof.tsx`:** Updated `handleContinue` to push to `/(onboarding)/notifications` (casting path to `any`). Set step props to `10` and `11`. Ensured `social-proof` is added to `completedSteps`.
*   **`notifications.tsx` (New File):**
    *   Created component using `OnboardingTemplate` (Step 11/11).
    *   Added title, subtitle, illustration placeholder (`BellRing` icon).
    *   Added "Enable Notifications" and "Skip for Now" buttons.
    *   `handleEnableNotifications` calls placeholder `registerForPushNotificationsAsync` and then `completeOnboarding(true)`.
    *   `handleSkip` calls `completeOnboarding(false)`.
    *   `completeOnboarding` adds `'notifications'` to `completedSteps`, sets `isComplete: true`, and calls `router.replace('/(tabs)' as any)`.
    *   Fixed linter errors (missing import, incorrect prop name, path casting).

**Verification:**
*   After completing the "Photos & DOB" step (Step 8), the app should navigate to the "Create Account" screen (Step 9).
*   After creating the account (Step 9), the app should navigate to the "Join Our Community" (Social Proof) screen (Step 10).
*   After continuing from Social Proof (Step 10), the app should navigate to the "Stay Updated" (Notifications) screen (Step 11).
*   Tapping either "Enable Notifications" or "Skip for Now" on Step 11 should navigate the user to the main application's tab layout, and subsequent launches should bypass onboarding.

---

# Implementation: Further Onboarding Fixes & Refinements

**Goal:** Address step count inconsistencies, password autofill visibility, final navigation target, and button layout issues.

**Files Modified:**
*   `app/(onboarding)/budget.tsx`: Updated `totalSteps`.
*   `app/(onboarding)/lifestyle.tsx`: Updated `totalSteps`.
*   `app/(onboarding)/personality/intro.tsx`: Updated `totalSteps`.
*   `app/(onboarding)/personality/quiz.tsx`: Updated `totalSteps`.
*   `app/(onboarding)/goals.tsx`: Updated `totalSteps`.
*   `app/(onboarding)/about-you.tsx`: Updated `totalSteps`.
*   `app/(onboarding)/account.tsx`: Attempted to add `backgroundColor: '#FFFFFF'` to `styles.inputContainer` (apply model failed).
*   `app/(onboarding)/notifications.tsx`: Corrected final navigation target, adjusted button layout.

**Analysis:**
1.  **Step Count:** Steps 2-7 incorrectly showed "Step X of 8" instead of "Step X of 11".
2.  **Password Autofill:** iOS Keychain autofill resulted in white text on a potentially non-white (yellow?) background, making it unreadable.
3.  **Final Navigation:** The `notifications.tsx` screen was navigating to `/(app)` which resulted in a "screen doesn't exist" error, likely because the main layout is under `/(tabs)`.
4.  **Notifications Layout:** The buttons were positioned high on the screen, not anchored near the bottom like the standard continue button.

**Changes Implemented:**
*   **Steps 2-7:** Updated `totalSteps` prop in `OnboardingTemplate` to `11` in `budget.tsx`, `lifestyle.tsx`, `personality/intro.tsx`, `personality/quiz.tsx`, `goals.tsx`, and `about-you.tsx`.
*   **`account.tsx`:** Attempted to explicitly set `backgroundColor: '#FFFFFF'` for `styles.inputContainer` to potentially fix autofill text contrast. *Note: This edit failed to apply.*
*   **`notifications.tsx`:**
    *   Changed `router.replace('/(app)' as any)` to `router.replace('/(tabs)' as any)`.
    *   Restructured JSX into `contentArea` (`flex: 1`) and `buttonContainer`.
    *   Removed `justifyContent: 'space-between'` from `styles.container`.
    *   Removed `flex: 1` and `marginBottom` from `styles.iconContainer`.
    *   Added `paddingVertical` to `styles.buttonContainer`.

**Verification:**
*   Steps 2 through 7 should now correctly display "Step X of 11".
*   Test password autofill on the Account screen (Step 9) - check if text is visible (white background fix may not have applied).
*   The Notifications screen (Step 11) buttons should now appear near the bottom.
*   Completing the Notifications screen should now navigate correctly to the main application's tab layout, not the error screen.

---

# Implementation: Remove Value Prop Step & Renumber Flow

**Goal:** Remove the "Why Roomies?" (Value Prop) screen and adjust the onboarding flow and step numbering accordingly.

**Files Modified:**
*   `app/(onboarding)/welcome.tsx`: Changed navigation target to `/budget`.
*   `app/(onboarding)/value-prop.tsx`: Deleted.
*   `app/(onboarding)/budget.tsx`: Updated step numbers to 2/10.
*   `app/(onboarding)/lifestyle.tsx`: Updated step numbers to 3/10.
*   `app/(onboarding)/personality/intro.tsx`: Updated step numbers to 4/10.
*   `app/(onboarding)/personality/quiz.tsx`: Updated step numbers to 4/10.
*   `app/(onboarding)/goals.tsx`: Updated step numbers to 5/10.
*   `app/(onboarding)/about-you.tsx`: Updated step numbers to 6/10.
*   `app/(onboarding)/place-details.tsx`: Updated step numbers to 7/10 (relevant if user goal is 'place_lister').
*   `app/(onboarding)/photos.tsx`: Updated step numbers to 8/10.
*   `app/(onboarding)/account.tsx`: Updated step numbers to 9/10, updated `useEffect`.
*   `app/(onboarding)/social-proof.tsx`: Updated step numbers to 10/10, updated `useEffect`.
*   `app/(onboarding)/notifications.tsx`: Updated step numbers to 10/10, updated `useEffect`.

**Analysis:**
*   The Value Prop screen was deemed unnecessary.
*   Removing it required adjusting the navigation from the Welcome screen and renumbering all subsequent steps (from 11 total to 10 total).
*   Confirmed that selecting "Finding roommates for my place" in the Goals step correctly navigates to `place-details` (now Step 7), skipping `about-you` (Step 6).

**Changes Implemented:**
*   Updated `welcome.tsx` `handleContinue` to navigate to `/(onboarding)/budget`.
*   Deleted `app/(onboarding)/value-prop.tsx`.
*   Updated `step` and `totalSteps` props in `OnboardingTemplate` (or equivalent) in all affected files to reflect the new 10-step flow.

**Verification:**
*   After the Welcome screen, the app should navigate directly to the Budget screen.
*   All onboarding screens (from Budget onwards) should display the correct "Step X of 10" in their progress indicator.
*   The navigation flow from Goals should proceed either to About You (Step 6) or Place Details (Step 7) depending on the selected goal.

---

# Implementation: Robust Profile Picture System - COMPLETED ✅

**Goal:** Replace the fragmented profile picture system with a robust, industry-standard architecture.

## New Architecture Overview

### 1. **Centralized Service** (`utils/profileImageService.ts`)
- ✅ **Single Source of Truth**: All profile picture logic centralized in `ProfileImageService`
- ✅ **Type-Safe Enums**: No more magic strings - uses `ProfileImageType` and `PersonalityType` enums
- ✅ **Strongly Typed Results**: Returns `ProfileImageResult` with type, source, cache key, and metadata
- ✅ **Database Conversion**: Handles conversion between React Native sources and database identifiers

### 2. **Enhanced Avatar Component** (`components/EnhancedAvatar.tsx`)
- ✅ **Unified Interface**: Single component replaces both `Avatar.tsx` and `UserAvatar.tsx`
- ✅ **Auto-Resolution**: Uses `ProfileImageService` for consistent image resolution
- ✅ **Manual Override**: Supports non-user avatars with manual source/name props
- ✅ **Performance Optimized**: Memoized image resolution with cache keys
- ✅ **Rich Features**: Online indicators, touch handling, multiple sizes

### 3. **Legacy Compatibility** (`components/UserAvatar.tsx`)
- ✅ **Backward Compatible**: Old `UserAvatar` now wraps `EnhancedAvatar`
- ✅ **Deprecated Gracefully**: Existing code continues working while migrating
- ✅ **Size Mapping**: Translates old size names to new system

## Files Updated

### **Core Service & Components**
- ✅ `utils/profileImageService.ts` - **NEW**: Centralized service with all logic
- ✅ `components/EnhancedAvatar.tsx` - **NEW**: Robust avatar component  
- ✅ `components/UserAvatar.tsx` - **UPDATED**: Now compatibility wrapper

### **Onboarding Flow**
- ✅ `app/(onboarding)/photos.tsx` - Uses `ProfileImageService` for consistent handling
- ✅ `app/(onboarding)/get-started.tsx` - Uses service for potato image setting
- ✅ `utils/supabaseOnboardingProfileUpdater.ts` - Maintains existing field mapping

### **Data Layer**
- ✅ `store/supabaseUserStore.ts` - Simplified to use standard field names
- ✅ `utils/profileSynchronizer.ts` - **UPDATED**: Delegates to new service

### **UI Components Migrated**
- ✅ `components/profile-view/ProfileSummary.tsx` - Uses `EnhancedAvatar`
- ✅ `components/profile/ProfileStatsOverlay.tsx` - Uses `EnhancedAvatar`
- ✅ `app/edit-profile.tsx` - Uses `EnhancedAvatar` with manual props
- ✅ `components/ProfileWithSupabase.tsx` - Uses `EnhancedAvatar`

## Benefits Achieved

### **For Developers:**
- ✅ **Single Source of Truth**: All profile logic in `ProfileImageService`
- ✅ **Type Safety**: No more runtime image resolution errors
- ✅ **Easy Testing**: Mock one service instead of multiple components
- ✅ **IntelliSense Support**: Enum-based types provide full autocomplete

### **For Users:**
- ✅ **Consistent Experience**: Same user shows same image everywhere in app
- ✅ **Better Performance**: Memoized image resolution with cache keys
- ✅ **Reliable Fallbacks**: Proper fallback chain prevents broken images

### **For Maintenance:**
- ✅ **Easy Feature Addition**: Add new image types by updating one enum
- ✅ **Reduced Bugs**: Centralized logic eliminates edge cases
- ✅ **Clear Architecture**: Well-documented, follows React best practices

## Migration Status: ✅ COMPLETE

All components have been successfully migrated to use the new robust system while maintaining full backward compatibility. The old fragmented approach has been replaced with a centralized, type-safe, and performant solution.

---

# Implementation: Adjust Goals Flow & Renumber (Again)

**Goal:** Correct the navigation flow after the Goals step so that `place-details` acts as a sub-step within Step 5, and renumber subsequent steps.

**Files Modified:**
*   `app/(onboarding)/place-details.tsx`: Changed `step` prop back to `5`.
*   `app/(onboarding)/photos.tsx`: Renumbered to Step 7/10, updated `useEffect`.
*   `app/(onboarding)/account.tsx`: Renumbered to Step 8/10, updated `useEffect`.
*   `app/(onboarding)/social-proof.tsx`: Renumbered to Step 9/10, updated `useEffect`.
*   `app/(onboarding)/notifications.tsx`: Renumbered to Step 10/10, updated `useEffect`.

**Analysis:**
*   The flow from Goals (Step 5) -> Place Details (Step 7) -> About You (Step 6) was incorrect based on user expectation.
*   The desired flow treats Place Details as part of Step 5 for users listing their place, then proceeds to About You (Step 6) for everyone.
*   This required renumbering steps 7 through 11 down by one.

**Changes Implemented:**
*   Set `step` prop in `place-details.tsx` back to `5` (while keeping `totalSteps=10`).
*   Updated `step` props in `photos.tsx` (7), `account.tsx` (8), `social-proof.tsx` (9), and `notifications.tsx` (10).
*   Adjusted the `useEffect` hooks in the renumbered screens to check for the completion of the correct *new* previous step ID.

**Verification:**
*   From Goals (Step 5):
    *   Selecting "Finding a room" or "Exploring" should navigate to About You (Step 6).
    *   Selecting "Finding roommates for my place" should navigate to Place Details (still showing Step 5 in header), which then navigates to About You (Step 6).
*   Subsequent steps (About You, Photos, Account, Social Proof, Notifications) should show the correct updated step numbers (6/10, 7/10, 8/10, 9/10, 10/10 respectively).

---

# Implementation: Enable Auto-Scroll on Account Screen Focus

**Goal:** Ensure the focused input field (especially Confirm Password) on the Account Creation screen automatically scrolls into view when the keyboard appears.

**File Modified:**
*   `app/(onboarding)/account.tsx`: Replaced `ScrollView` with `KeyboardAwareScrollView`.

**Analysis:**
*   Users reported that focusing the Confirm Password field didn't always keep the input visible when the keyboard was open.
*   The screen was using the standard `ScrollView`, which doesn't automatically handle keyboard visibility.
*   The `KeyboardAwareScrollView` component is designed for this purpose.

**Changes Implemented:**
*   Imported `KeyboardAwareScrollView` from `react-native-keyboard-aware-scroll-view`.
*   Replaced the existing `ScrollView` component with `KeyboardAwareScrollView`.
*   Configured props (`enableOnAndroid`, `enableAutomaticScroll`, `keyboardShouldPersistTaps`, etc.) for standard behavior.
*   Adjusted styles slightly (added `scrollContent` style, removed `flex: 1` from `formContainer`).

**Verification:**
*   On the Account Creation screen (Step 8), tapping the Email, Password, or Confirm Password fields should automatically scroll the view if necessary to keep the input visible above the keyboard. 

---

# Implementation: Social Proof Screen UI Refinements

**Goal:** Improve the UI/UX of the Social Proof screen (Step 9) by restoring the standard header and fixing content overlap issues.

**File Modified:**
*   `app/(onboarding)/social-proof.tsx`: Adjusted `OnboardingTemplate` props and styles.

**Analysis:**
*   The standard "Hey [name]" greeting was missing because `logoVariant="login"` was used, which likely hides the greeting.
*   When scrolling to the bottom, the final stats box overlapped with the fixed "Continue" button area.

**Changes Implemented:**
*   Changed `logoVariant` prop in `OnboardingTemplate` from `"login"` to `"default"` to restore the standard header greeting.
*   Set `buttonPosition` prop to `"relative"` (or ensure it allows space).
*   Increased `paddingBottom` in the `ScrollView`'s `contentContainerStyle` (`styles.scrollContent`) from `32` to `80` to provide more space below the content, preventing overlap with the footer area.

**Verification:**
*   The Social Proof screen (Step 9) should now display the standard "Hey [name]" greeting in the header.
*   Scrolling to the bottom of the Social Proof screen should show sufficient space between the last content element (stats box) and the "Continue" button. 

---

# Implementation: Update Testimonial Avatars on Social Proof Screen

**Goal:** Replace placeholder icons with actual user images for the testimonials on the Social Proof screen.

**File Modified:**
*   `app/(onboarding)/social-proof.tsx`: Updated image paths in the `testimonials` array.

**Analysis:**
*   The `testimonials` array used a generic `icon.png` placeholder.
*   Specific user images corresponding to the testimonial names were found in `assets/images/users/`.

**Changes Implemented:**
*   Updated the `require()` paths for the `avatar` property in each testimonial object to point to the correct user image file (`sarah_k_24.png`, `mike_t_26.png`, `jess_l_23.png`). *(Note: This change required manual application as the automated edit failed)*.

**Verification:**
*   The Social Proof screen (Step 9) should now display the specific user avatars next to each testimonial name (Sarah K., Michael T., Jessica L.). 

## 🎯 **Recent Updates & Features**

### **NEW: Education/Work Onboarding Screen** ✅ **IMPLEMENTED**
**Date**: January 27, 2025  
**Feature**: Professional information collection during onboarding

**Implementation**:
- ✅ **New Screen**: `app/(onboarding)/education.tsx` - School/Job toggle interface
- ✅ **Database Integration**: Added `university`, `major`, `year`, `company`, `role` columns
- ✅ **Navigation Flow**: Inserted between About You → Photos
- ✅ **Progress Bar**: Updated to 70% completion
- ✅ **Data Persistence**: SupabaseOnboardingProfileUpdater handles education step
- ✅ **UX Pattern**: Matches Roommate/Place filter toggle design

**Benefits**:
- Higher profile completion rates during onboarding
- Better matching through education/work data
- Discover cards show professional information from day 1
- Consistent UX with existing filter patterns

**Technical Details**:
- School fields: University*, Major, Year
- Work fields: Company*, Role  
- Validation: Requires either university or company
- Skip option available for users
- Auto-clears opposing fields when switching tabs

---

# Roomies App Implementation Plan

## Overview
This document outlines the complete implementation plan for the Roomies app, a roommate-finding application built with React Native and Expo Router.

## Recent Updates

### Backend Complexity Crisis & Systematic Fix (CRITICAL)

**Current Problems Identified:**
1. **Data Persistence Issue**: Swipe history persists even with `--clear` flag
2. **Multiple Match Stores**: 3 different stores managing similar data
   - `roommateStore` (creates matches)
   - `matchesStore` (legacy system)  
   - `supabaseMatchesStore` (conversation tracking)
3. **Data Synchronization Issues**: Stores not communicating properly
4. **Inconsistent State**: Cards reappearing, matches disappearing

**ROOT CAUSE**: Over-complicated backend with multiple sources of truth

---

## SYSTEMATIC REFACTORING PLAN 🔧

### Phase 1: Emergency Cleanup (IMMEDIATE)
**Goal**: Establish clean state and identify data flow issues

1. **Clear All Persisted Data**
   - Add store reset functionality
   - Clear AsyncStorage properly  
   - Ensure `--clear` actually clears everything

2. **Audit Current Data Flow**
   - Map all data creation points
   - Identify redundant storage
   - Document current state synchronization

### Phase 2: Backend Consolidation (HIGH PRIORITY)
**Goal**: Single source of truth with Supabase

1. **Remove Redundant Stores**
   - Keep only `supabaseMatchesStore` for matches
   - Keep only `roommateStore` for profiles  
   - Remove legacy `matchesStore`

2. **Supabase Schema Updates**
   - Create proper `matches` table
   - Create proper `swipes` table
   - Ensure real-time subscriptions

3. **Unified Match Flow**
   ```
   Swipe → Supabase → Real-time Update → UI Refresh
   ```

### Phase 3: Data Architecture Redesign (MEDIUM PRIORITY)
**Goal**: Clean separation of concerns

1. **Store Responsibilities**
   - `roommateStore`: Profile data only
   - `supabaseMatchesStore`: All match/swipe operations
   - `supabaseUserStore`: User authentication/profile
   - `messageStore`: Conversations only

2. **Real-time Synchronization**
   - Supabase subscriptions for matches
   - Proper conflict resolution
   - Optimistic updates with rollback

### Phase 4: Testing & Validation (LOW PRIORITY)
**Goal**: Ensure reliability

1. **Integration Tests**
2. **Data Flow Validation**  
3. **Performance Optimization**

---

## IMMEDIATE ACTION ITEMS

### Step 1: Force Clear All Data
- Reset all Zustand stores
- Clear AsyncStorage
- Reset Supabase local cache

### Step 2: Disable Multiple Match Systems
- Route all match operations through single store
- Add temporary debugging to trace data flow

### Step 3: Implement Single Match Pipeline
- Swipe → Supabase → UI update
- Remove local match creation

**DECISION POINT**: Should we implement this systematic fix now, or continue patching individual issues?

**RECOMMENDATION**: Implement systematic fix to prevent cascading bugs.

---

### New Match Card Navigation & Messaging Fixes (Previous)

**Issues Identified:**
1. **Navigation Issue**: Tapping new match card goes to profile instead of message lobby
2. **Back Navigation Bug**: After messaging from context menu, back button goes to discover tab instead of matches tab
3. **Context Menu Issues**: After using context menu once, tap and hold stops working
4. **Pre-Message Issue**: Automatic "Hi there! I'd like to chat about potentially being roommates." message is sent
5. **Empty State**: Message lobby should show profile picture when no messages exist
6. **Match Movement**: Cards should only move to Messages section AFTER user sends first message

**Fixes Implemented:**
1. ✅ Updated NewMatchesSection to navigate directly to message lobby
2. ✅ Enhanced conversation screen to check multiple stores
3. ✅ Added debugging for data synchronization issues
4. ✅ Fixed card reappearing by removing DEV mode swipe history ignore
5. ✅ Added comprehensive match lookup across stores

**Status**: Partially working but backend complexity causing systematic issues

---

## Architecture Overview

### Core Components
- **User Management**: Supabase Auth + Custom Profile System
- **Matching System**: Swipe-based algorithm with compatibility scoring
- **Messaging**: Real-time chat with conversation management
- **Profile System**: Comprehensive user profiles with preferences
- **Place Listings**: Integrated roommate + place finding

### Technology Stack
- **Frontend**: React Native, Expo Router, NativeWind
- **Backend**: Supabase (Auth, Database, Real-time, Storage)
- **State Management**: Zustand with persistence
- **Styling**: NativeWind (Tailwind for React Native)
- **Navigation**: Expo Router (file-based routing)

### Database Schema (Supabase)
- **users**: User profiles and authentication
- **user_preferences**: Detailed user preferences and requirements  
- **places**: Place listings and details
- **matches**: User matching system
- **conversations**: Chat conversations
- **messages**: Individual chat messages

## Implementation Status

### ✅ Completed Features
1. **Authentication System**
   - Supabase integration
   - Test account system
   - Profile creation/editing

2. **User Profiles** 
   - Comprehensive profile system
   - Preference management
   - Profile strength calculation

3. **Place Listings**
   - Place creation and editing
   - Photo management
   - Location integration

4. **Basic Matching**
   - Swipe interface
   - Match algorithm
   - Compatibility scoring

5. **Messaging System**
   - Real-time chat
   - Conversation management
   - Message persistence

### 🚧 In Progress
1. **Backend Refactoring** (CRITICAL)
   - Data store consolidation
   - Supabase integration improvements
   - State synchronization fixes

2. **Navigation Fixes**
   - New match card behavior
   - Back navigation issues
   - Route consistency

### 📋 Planned Features
1. **Enhanced Matching**
   - Advanced compatibility algorithms
   - Preference weighting
   - Machine learning integration

2. **Premium Features**
   - Unlimited swipes
   - Advanced filters
   - Priority matching

3. **Social Features**
   - Group matching
   - Event integration
   - Community features

## Development Guidelines

### Code Organization
- Follow React Native best practices
- Use TypeScript for type safety
- Maintain clean component architecture
- Implement proper error handling

### Testing Strategy
- Unit tests for core logic
- Integration tests for user flows
- Manual testing for UI/UX
- Performance testing for large datasets

### Deployment Process
- Development environment setup
- Staging environment for testing
- Production deployment with monitoring
- Automated CI/CD pipeline

## 2025-05-XX — Fix placeholder user-ID mismatch in Match Profile

Problem: In development data we store the current user's ID as the literal string `"currentUser"` while the authenticated user ID in Supabase auth store is an actual UUID (e.g. `user1`).  When building the Match Profile screen we compared the two strings directly, causing the component to think the placeholder belonged to "the other user".  That surfaced as:

* `[MatchProfile] Profile not found for user ID: currentUser` run-time error
* Wrong avatar / name shown in new-match chat lobby

Solution implemented in `app/(tabs)/matches/[matchId].tsx`:

1. Introduced `isCurrentUser(id)` helper that treats `currentUser`, `current-user`, and the real Supabase ID as interchangeable.
2. Re-used the helper both when loading the profile in `useEffect` and when building the participant list in `handleSendMessage`.
3. No behavioural change in production where real IDs are stored on both sides.

This unblocks profile rendering and ensures that chats created from dev data will still resolve the correct counterpart profile.