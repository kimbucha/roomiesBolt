#!/bin/bash

# Stop any running processes
echo "Stopping any running processes..."
killall node 2>/dev/null || true
killall Simulator 2>/dev/null || true

# Clear caches
echo "Clearing caches..."
rm -rf node_modules/.cache
rm -rf $TMPDIR/metro-* 2>/dev/null || true
rm -rf $TMPDIR/haste-map-* 2>/dev/null || true

# Shutdown all simulators
echo "Shutting down simulators..."
xcrun simctl shutdown all 2>/dev/null || true

# Boot the simulator
echo "Booting iPhone 16 Pro simulator..."
xcrun simctl boot "iPhone 16 Pro" 2>/dev/null || true

# Wait for simulator to boot
echo "Waiting for simulator to fully boot..."
sleep 5

# Uninstall the app if it exists
echo "Uninstalling previous app version if it exists..."
xcrun simctl uninstall booted com.anonymous.Roomies 2>/dev/null || true

# Start Expo with a clean build
echo "Starting Expo with a clean build..."
EXPO_NO_TELEMETRY=1 npx expo start -c --ios
