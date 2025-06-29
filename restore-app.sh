#!/bin/bash

# This script restores the original app behavior after running reset-app.sh

# Check if the backup file exists
if [ -f "app/index.tsx.bak" ]; then
  echo "Restoring original app behavior..."
  cp app/index.tsx.bak app/index.tsx
  echo "Original app behavior restored."
  echo "You may need to restart the app to see the changes."
else
  echo "Backup file not found. No changes made."
fi 