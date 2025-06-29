# Potato Profile Picture for Place Listers - Photos Page Fix

## Problem Identified

When place listers reached the photos onboarding page without having completed the personality quiz, the app was showing a personality-based default avatar instead of a potato image. This was inconsistent with the user journey since place listers access photos through place listing onboarding, not through the full personality-based onboarding flow.

## Solution Implemented

### **Logic Changes in `app/(onboarding)/photos.tsx`:**

1. **Import potato image:**
   ```tsx
   const potatoImage = require('../../assets/images/potato.png');
   ```

2. **Add potato state:**
   ```tsx
   const [showPotatoDefault, setShowPotatoDefault] = useState(false);
   ```

3. **Role-based default logic:**
   ```tsx
   // For place listers who accessed photos via place listing onboarding,
   // they should get a potato image instead of personality
   if (user?.userRole === 'place_lister') {
     console.log('[Photos] Place lister without personality type - using potato default');
     setShowPotatoDefault(true);
     // Don't redirect, let them continue with potato as default
   } else {
     // For regular roommate seekers, redirect to the personality quiz
     router.replace('/(onboarding)/personality/quiz');
   }
   ```

4. **Updated form readiness check:**
   ```tsx
   const hasValidPhoto = photos.length > 0 || 
                        (hasPersonalityImage && personalityImage !== null) ||
                        showPotatoDefault;
   ```

5. **Visual potato display:**
   ```tsx
   {/* Potato Default Image - Show for place listers without personality type */}
   {showPotatoDefault && !personalityImage && (
     <View style={[styles.photoContainer, styles.personalityContainer]}>
       <Image source={potatoImage} style={[styles.personalityImage, styles.defaultProfilePhoto]} />
       <View style={styles.profileBadge}>
         <Text style={styles.profileBadgeText}>Profile</Text>
       </View>
     </View>
   )}
   ```

6. **Profile picture index handling:**
   - **-1**: Personality image
   - **-2**: Potato default (NEW)
   - **0+**: User uploaded photos

7. **Database storage handling:**
   ```tsx
   } else if (profilePhotoIndex === -2) {
     // User has potato default as profile picture
     profilePictureIdentifier = ProfileImageService.getDatabaseIdentifier({
       type: ProfileImageType.POTATO_DEFAULT,
       source: null
     });
   ```

## User Flow Impact

### **Before (Broken):**
1. Place lister goes through place listing onboarding
2. Reaches photos page
3. Gets redirected to personality quiz (wrong!)
4. OR shows personality avatar they never earned

### **After (Fixed):**
1. Place lister goes through place listing onboarding
2. Reaches photos page
3. Sees potato image as default profile picture ✓
4. Can upload additional photos if desired
5. Continues with potato as their profile picture
6. Consistent with "skipped onboarding" users

## Technical Benefits

- **Role-aware defaults**: Different behavior for different user journeys
- **Consistent branding**: Potato = "basic/default" user across the app
- **No forced redirects**: Place listers aren't forced into personality quiz
- **Visual clarity**: Easy to identify users who haven't done personality assessment
- **Maintains data integrity**: Proper ProfileImageService integration

## Key Files Modified

1. **`app/(onboarding)/photos.tsx`**
   - Added potato import and state management
   - Added role-based logic for default profile picture
   - Updated form validation and visual display
   - Enhanced profile picture index handling

The solution ensures place listers get a proper default experience that matches their simplified onboarding journey, while maintaining the full personality-based experience for regular roommate seekers. 