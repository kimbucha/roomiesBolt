# Roomies App Screen Overview

## Authentication Screens
- **Login** (`/app/(auth)/login.tsx`)
  - User authentication screen
  - Email/password login form
- **Signup** (`/app/(auth)/signup.tsx`)
  - New user registration
  - Basic information collection
- **Forgot Password** (`/app/(auth)/forgot-password.tsx`)
  - Password recovery flow

## Onboarding Flow
- **Welcome** (`/app/(onboarding)/welcome.tsx`)
  - Initial onboarding screen
  - Name input and introduction
- **Value Proposition** (`/app/(onboarding)/value-prop.tsx`)
  - App benefits and features overview
- **Goals** (`/app/(onboarding)/goals.tsx`)
  - User goals and preferences collection
- **Personality Assessment**
  - Intro (`/app/(onboarding)/personality/intro.tsx`)
  - E/I Assessment (`/app/(onboarding)/personality/ei.tsx`)
  - S/N Assessment (`/app/(onboarding)/personality/sn.tsx`)
  - T/F Assessment (`/app/(onboarding)/personality/tf.tsx`)
  - J/P Assessment (`/app/(onboarding)/personality/jp.tsx`)
  - Results (`/app/(onboarding)/personality/results.tsx`)
    - Displays personality type and compatibility insights
- **Lifestyle** (`/app/(onboarding)/lifestyle.tsx`)
  - Living preferences and habits
- **Budget** (`/app/(onboarding)/budget.tsx`)
  - Financial preferences and limits
- **Social Proof** (`/app/(onboarding)/social-proof.tsx`)
  - Testimonials and success stories
- **Photos** (`/app/(onboarding)/photos.tsx`)
  - Profile photo upload
- **Preferences** (`/app/(onboarding)/preferences.tsx`)
  - Roommate and housing preferences

## Main App Tabs
- **Discover** (`/app/(tabs)/index.tsx`)
  - Main home screen
  - New matches
  - Saved places
  - Recent messages
- **Matches** (`/app/(tabs)/matches.tsx`)
  - Match list and interactions
  - Premium features upsell
- **Profile** (`/app/(tabs)/profile.tsx`)
  - User profile view and edit
  - Settings access

## Messaging & Communication
- **Messaging Overview** (`/app/messaging.tsx`)
  - All conversations list
- **Conversation** (`/app/conversation/[id].tsx`)
  - Individual chat interface
- **Chat Redirect** (`/app/chat-redirect.tsx`)
  - Chat initialization screen
- **User Profile View** (`/app/(app)/profile/[userId].tsx`)
  - Displays another user's profile (core info, personality, lifestyle, ratings, etc.)
  - Includes options to message, report, block, or unmatch.

## Places & Properties
- **Place Detail** (`/app/place-detail.tsx`)
  - Property details and photos
  - Contact options
- **Saved Places** (`/app/saved-places.tsx`)
  - Bookmarked properties

## Settings & Account
- **Settings** (`/app/settings.tsx`)
  - App preferences
  - Account settings
- **Edit Profile** (`/app/edit-profile.tsx`)
  - Profile information editing
- **Privacy & Security** (`/app/privacy-security.tsx`)
  - Privacy settings
  - Security options
- **Blocked Users** (`/app/blocked-users.tsx`)
  - Blocked users management
- **Payment Methods** (`/app/payment-methods.tsx`)
  - Payment settings
  - Billing information

## Premium Features
- **Premium Features** (`/app/premium-features/index.tsx`)
  - Premium subscription options
  - Feature comparison
- **Payment** (`/app/payment.tsx`)
  - Subscription payment processing

## Support & Help
- **Help** (`/app/help.tsx`)
  - FAQ and help articles
- **Support** (`/app/support.tsx`)
  - Customer support interface
- **Reviews** (`/app/reviews.tsx`)
  - User reviews and ratings

## Notifications
- **Notifications** (`/app/notifications.tsx`)
  - Notification center
  - Notification preferences

## Other
- **Not Found** (`/app/+not-found.tsx`)
  - 404 error screen
- **Test** (`/app/test.tsx`)
  - Development testing screen