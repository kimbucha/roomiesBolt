# Sticky Header Scroll Component

## Overview

The Sticky Header Scroll component provides a powerful scrolling effect where each category title sticks to the top of the viewport while its content scrolls beneath it. When a new category title approaches, it pushes the current sticky header up, creating a smooth transition between sections.

## Components

### 1. ScrollableContainer

The main container component that handles the scroll view and passes scroll position to child components.

**Props:**
- `sections`: Array of section objects containing title, data, and optional count
- `containerStyle`: Additional style for the container
- `contentContainerStyle`: Style for the scroll view content container
- `sectionHeaderStyle`: Style for section headers
- `stickyBackgroundColor`: Background color for sticky headers (default: white)

### 2. StickyHeaderList

Renders sections with sticky headers that respond to scroll position.

**Props:**
- `sections`: Array of section objects containing title, data, and optional count
- `containerStyle`: Additional style for the container
- `sectionHeaderStyle`: Style for section headers
- `sectionHeaderTextStyle`: Style for the section header text
- `sectionCountStyle`: Style for the section count badge text
- `contentContainerStyle`: Style for section content
- `stickySectionHeaderStyle`: Additional style for headers when sticky
- `stickyBackgroundColor`: Background color for sticky headers
- `scrollY`: Shared animated value for scroll position

## Usage Example

To use the sticky header scroll in your screen:

```jsx
import { ScrollableContainer } from '../components/layout';

export default function YourScreen() {
  // Define your section data
  const sections = [
    {
      title: 'New Matches',
      data: <YourMatchesComponent />,
      count: matchesCount,
    },
    {
      title: 'Saved Places',
      data: <YourPlacesComponent />,
      count: placesCount,
    },
    {
      title: 'Messages',
      data: <YourMessagesComponent />,
      count: messagesCount,
    },
  ];
  
  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* Your header/navigation components */}
      
      <ScrollableContainer
        sections={sections}
        stickyBackgroundColor="#FFF"
      />
    </SafeAreaView>
  );
}
```

## How It Works

1. The `ScrollableContainer` passes scroll position data to `StickyHeaderList` via a shared value.
2. Each section header in `StickyHeaderList` is positioned absolutely with its own specific animation rules.
3. As the user scrolls:
   - Headers enter a "sticky" phase when they reach the top of the viewport
   - When a new header approaches, it pushes the current header up
   - Headers gradually fade out as they're pushed off-screen
4. The layering effect is created using dynamic `zIndex` values based on section order
5. The content area is positioned with appropriate margins to account for header height

## Animation Technique

The implementation uses React Native Reanimated's `useAnimatedStyle` to create smooth, native-thread animations:

1. We track the section's layout position using `onLayout` events
2. Calculate offsets dynamically based on scroll position
3. Apply animations only to the headers that need to move
4. Use interpolation for smooth opacity transitions as headers move off-screen

## Demo

A demo implementation is available at `app/sticky-demo.tsx` which showcases:
- New Matches section with profile cards and a featured match
- Saved Places section with property cards in a grid layout
- Messages section with conversation previews

## Implementation Notes

- Headers are positioned absolutely for better control over transitions
- Section layout measurements update dynamically as content loads
- zIndex values ensure proper stacking of headers during transitions
- The component optimizes performance by using native-thread animations
- Content sections have appropriate top margin to account for header height 