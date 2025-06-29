#!/bin/bash

# Stop any running processes
echo "Stopping any running processes..."
killall node 2>/dev/null || true

# Clear caches
echo "Clearing caches..."
rm -rf node_modules/.cache
rm -rf $TMPDIR/metro-* 2>/dev/null || true
rm -rf $TMPDIR/haste-map-* 2>/dev/null || true

# Create a temporary file to force the app to show the intro screen
echo "Creating a temporary override for the app's entry point..."
cat > temp-app-index.tsx << 'EOL'
import { Redirect } from 'expo-router';

// Force redirect to auth flow regardless of user state
export default function Index() {
  return <Redirect href="/(auth)" />;
}
EOL

# Backup the original index.tsx file if it doesn't exist already
if [ ! -f "app/index.tsx.bak" ]; then
  echo "Backing up the original index.tsx file..."
  cp app/index.tsx app/index.tsx.bak
fi

# Replace the index.tsx file with our temporary one
echo "Replacing the index.tsx file with our temporary one..."
cp temp-app-index.tsx app/index.tsx

# Remove the temporary file
rm temp-app-index.tsx

# Start Expo with a clean build
echo "Starting Expo with a clean build..."
EXPO_NO_TELEMETRY=1 npx expo start -c --ios

# Restore the original index.tsx file automatically when the app is closed
trap 'echo "Restoring original app behavior..."; cp app/index.tsx.bak app/index.tsx; echo "Original app behavior restored."' EXIT 