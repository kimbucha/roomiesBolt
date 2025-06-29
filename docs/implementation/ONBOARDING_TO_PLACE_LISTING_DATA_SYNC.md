# Onboarding to Place Listing Data Sync Implementation Plan

## Overview
This document outlines the implementation to replace hardcoded place listing data with actual onboarding data collected during the place listing flow. The goal is to dynamically display real user information in the place detail sheets.

## Problem Statement
Currently, place detail sheets show hardcoded information like:
- "Not specified" for Room Type
- Generic descriptions
- Placeholder amenities and lease information
- No actual place photos from onboarding

## Implementation Plan

### Phase 1: Data Structure Analysis ✅ COMPLETED
- [x] Analyzed `User.placeDetails` structure in userStore
- [x] Reviewed `RoommateProfile` interface in roommateStore
- [x] Identified missing data mapping in profileSynchronizer

### Phase 2: Profile Synchronizer Updates ✅ COMPLETED
- [x] Updated `createRoommateProfileFromUser()` in `utils/profileSynchronizer.ts`
- [x] Added mapping for all place details fields:
  - `amenities`: Maps from `user.placeDetails.amenities`
  - `bedrooms`: Maps from `user.placeDetails.bedrooms`
  - `bathrooms`: Maps from `user.placeDetails.bathrooms`
  - `description`: Prioritizes `user.placeDetails.description` over `user.bio`
  - `monthlyRent`: Maps from `user.placeDetails.monthlyRent`
  - `address`: Maps from `user.placeDetails.address`
  - `leaseDuration`: Maps from `user.placeDetails.leaseDuration`
  - `isFurnished`: Maps from `user.placeDetails.isFurnished`
  - `roomPhotos`: Prioritizes `user.placeDetails.photos` over `user.photos`
  - `roomType`: Uses `user.placeDetails.roomType` if specified
  - `moveInDate`: Uses `user.placeDetails.moveInDate` if specified

### Phase 3: Place Detail Component Updates ✅ COMPLETED
- [x] Enhanced `PlaceDetailContent.tsx` to use real data:
  - Uses `monthlyRent` prioritized over `budget`
  - Uses `address` prioritized over `location`
  - Shows furnished status when available
  - Defaults to "Private Room" instead of "Not specified"
  - Always shows lease info for place listings with fallbacks

### Phase 4: Data Flow Enhancement (IN PROGRESS)
- [ ] Update place listing creation to ensure all onboarding data is preserved
- [ ] Add utilities information display
- [ ] Enhance amenities display with onboarding amenities
- [ ] Add place photos from onboarding to detail view
- [ ] Add validation to ensure required place fields are captured

### Phase 5: Testing & Validation (PENDING)
- [ ] Test complete onboarding flow → profile sync → detail display
- [ ] Verify all place details appear correctly in detail sheets
- [ ] Test edge cases (missing data, partial completion)
- [ ] Validate data persistence across app sessions

## Data Mapping Details

### Onboarding Data → Profile Data
```typescript
user.placeDetails = {
  roomType: 'private' | 'shared' | 'studio',
  bedrooms: number,
  bathrooms: number,
  monthlyRent: string,
  address: string,
  moveInDate: string,
  leaseDuration: string,
  amenities: string[],
  photos: string[],
  description: string,
  isFurnished: boolean
}

// Maps to →

roommateProfile = {
  roomType: user.placeDetails.roomType,
  bedrooms: user.placeDetails.bedrooms,
  bathrooms: user.placeDetails.bathrooms,
  monthlyRent: user.placeDetails.monthlyRent,
  address: user.placeDetails.address,
  moveInDate: user.placeDetails.moveInDate,
  leaseDuration: user.placeDetails.leaseDuration,
  amenities: user.placeDetails.amenities,
  roomPhotos: user.placeDetails.photos,
  description: user.placeDetails.description,
  isFurnished: user.placeDetails.isFurnished
}
```

## Next Steps

### Immediate (Phase 4)
1. **Utilities Display**: Add utilities information from onboarding to place details
2. **Place Photos**: Ensure place photos from onboarding appear in detail sheets
3. **Enhanced Amenities**: Display the actual amenities selected during onboarding

### Medium Term
1. **Data Validation**: Add validation to ensure all required place fields are captured
2. **Fallback Handling**: Improve fallback behavior for missing data
3. **UI Enhancements**: Polish the display of place information

### Long Term
1. **Real-time Updates**: Ensure place details update immediately when onboarding is completed
2. **Photo Management**: Add ability to manage place photos after onboarding
3. **Advanced Features**: Add features like virtual tours, 3D views, etc.

## Benefits Achieved

1. **Authentic Data**: Place listings now show real user-provided information
2. **Better UX**: Users see their actual place details instead of placeholders
3. **Accurate Information**: Potential roommates get correct details about places
4. **Data Consistency**: Single source of truth from onboarding to display

## Files Modified

1. `utils/profileSynchronizer.ts` - Added place details mapping
2. `components/place/PlaceDetailContent.tsx` - Enhanced to use real data
3. `contexts/PlaceDetailsContext.tsx` - Fixed utilities validation (related)

## Impact Assessment

- **Low Risk**: Changes are additive and maintain backward compatibility
- **High Value**: Significantly improves user experience and data accuracy
- **Easy Testing**: Can be tested through complete onboarding flow
- **Future Ready**: Foundation for advanced place listing features 