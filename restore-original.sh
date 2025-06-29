#!/bin/bash

# This script simply restores the original app behavior
# Run this if you need to restore the original index.tsx file

if [ -f "app/index.tsx.bak" ]; then
  echo "Restoring original app behavior..."
  cp app/index.tsx.bak app/index.tsx
  echo "Original app behavior restored."
else
  echo "No backup file found. The app is already in its original state."
fi 