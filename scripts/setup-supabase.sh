#!/bin/bash

# Script to set up Supabase integration for Roomies app

echo "Setting up Supabase integration for Roomies app..."

# Install required dependencies
echo "Installing Supabase dependencies..."
npm install @supabase/supabase-js@latest

# Check if react-native-url-polyfill is already installed
if npm list react-native-url-polyfill | grep -q "react-native-url-polyfill"; then
  echo "react-native-url-polyfill is already installed."
else
  echo "Installing react-native-url-polyfill..."
  npm install react-native-url-polyfill
fi

# Create directories if they don't exist
mkdir -p ./supabase/migrations

echo "Creating migration directory structure..."

# Create a sample .env file for Supabase configuration
cat > .env.example << EOL
# Supabase Configuration
SUPABASE_URL=your-project-url
SUPABASE_ANON_KEY=your-anon-key
EOL

echo "Created .env.example file with Supabase configuration template"

echo "Setup complete! Next steps:"
echo "1. Create a Supabase project at https://app.supabase.com"
echo "2. Copy your project URL and anon key to services/supabaseClient.ts"
echo "3. Run the SQL schema in supabase/schema.sql in the Supabase SQL Editor"
echo "4. Follow the migration guide in SUPABASE_INTEGRATION.md"
