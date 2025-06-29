# Premium Features - Roomies App

## Overview
The Premium Features screen in the Roomies app provides users with access to enhanced functionality for finding the perfect roommate. This screen is accessible when users tap on the "premium card" in the matches section that shows pending likes.

## Features
- **See Who Likes You**: Premium users can view all profiles that have liked them before matching, giving them more control over potential matches.
- **Unlimited Super Likes**: Premium users have access to unlimited Super Likes, allowing them to stand out when expressing interest in potential roommates.
- **Advanced Filters**: Premium users can access additional filters to find roommates with specific preferences and compatibility factors.

## Implementation Details
- **File Location**: `app/premium-features/index.tsx`
- **Navigation**: Accessed through tapping the premium card in the matches screen
- **State Management**: Uses `useMatchesStore` to manage premium status and pending likes
- **UI Components**: 
  - Premium banner with star icon
  - Feature cards outlining premium benefits:
    - Profile Boost
    - Advanced Filters
    - Verified Badge
    - Priority Matching
  - Pricing options for subscription
  - Upgrade/cancel subscription buttons

## User Experience
- **Free Users**: See a modal popup with premium benefits, with option to upgrade
- **Premium Users**: Navigate to a dedicated "People Who Like You" page at `/likes`
- **Development Mode**: Premium status can be toggled for testing

## Design Consistency
The premium features page maintains the app's visual design language:
- Primary color: #4F46E5 (indigo)
- Typography: Poppins font family
- Clean white background
- Card-based UI with consistent rounded corners
- Match percentages shown in light purple badges

## Future Enhancements
- Integration with payment processing
- Premium-exclusive features like advanced compatibility metrics
- Enhanced profile visibility options 