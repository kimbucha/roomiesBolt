# Studio Room Type UX Improvement

## Problem Identified
When users select "Studio/1BR" room type during place listing onboarding, they are still presented with bedroom and bathroom counter selectors, which doesn't make logical sense:
- **Studio** = 0 bedrooms (it's a studio apartment)
- **1BR** = 1 bedroom typically
- Both typically have 1 bathroom

## Solution Implemented

### 1. Hide Bedroom/Bathroom Counters for Studio
- When `roomType === 'studio'`, hide the PropertyCounter components
- Show informative message instead: "Studio apartments are self-contained units with 1 bathroom"

### 2. Auto-Set Logical Defaults
- **Studio selection**: Auto-sets `bedrooms: 0, bathrooms: 1`
- **Switch away from studio**: Resets to `bedrooms: 1, bathrooms: 1` if bedrooms was 0

### 3. Conditional UI Rendering
```tsx
{placeDetails.roomType === 'studio' ? (
  // Show info box instead of counters
  <View className="mb-4 bg-blue-50 rounded-lg p-3 border border-blue-200">
    <Text className="text-sm text-blue-700 text-center">
      Studio apartments are self-contained units with 1 bathroom
    </Text>
  </View>
) : (
  // Show bedroom/bathroom counters for private/shared rooms
  <PropertyCounters />
)}
```

## Technical Implementation

### Files Modified
- `components/features/onboarding/place-listing/BasicInfoStep.tsx`
  - Added `useEffect` for auto-setting studio values
  - Added conditional rendering logic
  - Imported `Text` component

### Key Features
- **Automatic value setting**: No user confusion about bedroom/bathroom counts
- **Clear communication**: Users understand why these fields aren't shown
- **Logical flow**: Studio selection feels natural and purposeful
- **Reversible**: Switching away from studio resets to sensible defaults

## User Experience Impact
- **Reduced friction**: No unnecessary form fields for studio selection
- **Clear intent**: Users understand studio apartments are different
- **Logical defaults**: System sets appropriate values automatically
- **Clean interface**: UI adapts to selection context

## Validation Compatibility
- Existing validation in `PlaceDetailsContext` doesn't check bedroom/bathroom values for step completion
- Only checks required fields: `roomType`, `monthlyRent`, `address`
- No breaking changes to validation logic 