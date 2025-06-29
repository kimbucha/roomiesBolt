#!/bin/bash

# This script specifically resets the authentication state without stopping the app
# It can be run while the app is running to force a logout

echo "Resetting authentication state..."

# Create a temporary script to clear auth storage
cat > temp-clear-auth.js << 'EOL'
const fs = require('fs');
const path = require('path');

// Find and clear user-store files in AsyncStorage
const clearAuthStorage = () => {
  // For iOS simulator, AsyncStorage is stored in Library/Application Support
  const homeDir = process.env.HOME;
  const appDataDir = path.join(homeDir, 'Library/Developer/CoreSimulator/Devices');
  
  console.log('Searching for AsyncStorage files...');
  
  try {
    // Find all AsyncStorage files
    const findCmd = `find "${appDataDir}" -name "RCTAsyncLocalStorage_V1" -o -name "*AsyncStorage*" 2>/dev/null`;
    const result = require('child_process').execSync(findCmd, {encoding: 'utf8'});
    
    if (result.trim()) {
      const files = result.trim().split('\n');
      console.log(`Found ${files.length} AsyncStorage locations`);
      
      // For each AsyncStorage location
      files.forEach(file => {
        if (file && fs.existsSync(file)) {
          if (fs.lstatSync(file).isDirectory()) {
            // If it's a directory, look for files containing user-store
            fs.readdirSync(file).forEach(subFile => {
              // Check if the file is related to user authentication
              if (subFile.includes('user-store') || 
                  subFile.includes('auth') || 
                  subFile.includes('token')) {
                const fullPath = path.join(file, subFile);
                if (fs.existsSync(fullPath)) {
                  try {
                    fs.unlinkSync(fullPath);
                    console.log(`Deleted auth file: ${fullPath}`);
                  } catch (err) {
                    console.error(`Error deleting ${fullPath}:`, err);
                  }
                }
              }
            });
          }
        }
      });
      
      console.log('Auth storage cleared successfully');
    } else {
      console.log('No AsyncStorage files found');
    }
  } catch (error) {
    console.error('Error clearing auth storage:', error);
  }
};

clearAuthStorage();
EOL

# Run the temporary script
node temp-clear-auth.js

# Remove the temporary script
rm temp-clear-auth.js

echo "Authentication state reset complete. Restart the app to see changes." 