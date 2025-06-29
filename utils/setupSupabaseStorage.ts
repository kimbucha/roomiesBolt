/**
 * Supabase Storage Setup Utility
 * 
 * This utility sets up the required storage buckets and policies for the Roomies app.
 * Run this once to initialize storage infrastructure.
 */

import { createClient } from '@supabase/supabase-js';

// Use your Supabase credentials
const SUPABASE_URL = 'https://hybyjgpcbcqpndxrquqv.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5YnlqZ3BjYmNxcG5keHJxdXF2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzY4NDc1MiwiZXhwIjoyMDYzMjYwNzUyfQ.9Z1zaIrlQOBcpcQ826mzF6qj7qj1sA4symdh69Y6_kw';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

export const setupSupabaseStorage = async () => {
  console.log('🚀 Setting up Supabase Storage for Roomies app...');
  
  try {
    // Create avatars bucket for user profile pictures
    console.log('📸 Creating avatars bucket...');
    const { data: avatarsData, error: avatarsError } = await supabase.storage.createBucket('avatars', {
      public: true,
      allowedMimeTypes: ['image/*'],
      fileSizeLimit: '5MB'
    });
    
    if (avatarsError && !avatarsError.message.includes('already exists')) {
      console.error('❌ Error creating avatars bucket:', avatarsError);
    } else {
      console.log('✅ Avatars bucket created successfully');
    }

    // Create listings bucket for property/place listing photos
    console.log('🏠 Creating listings bucket...');
    const { data: listingsData, error: listingsError } = await supabase.storage.createBucket('listings', {
      public: true,
      allowedMimeTypes: ['image/*'],
      fileSizeLimit: '10MB'
    });
    
    if (listingsError && !listingsError.message.includes('already exists')) {
      console.error('❌ Error creating listings bucket:', listingsError);
    } else {
      console.log('✅ Listings bucket created successfully');
    }

    // Create room-photos bucket for detailed room images
    console.log('🛏️ Creating room-photos bucket...');
    const { data: roomPhotosData, error: roomPhotosError } = await supabase.storage.createBucket('room-photos', {
      public: true,
      allowedMimeTypes: ['image/*'],
      fileSizeLimit: '10MB'
    });
    
    if (roomPhotosError && !roomPhotosError.message.includes('already exists')) {
      console.error('❌ Error creating room-photos bucket:', roomPhotosError);
    } else {
      console.log('✅ Room-photos bucket created successfully');
    }

    // Set up security policies
    console.log('🔒 Setting up security policies...');
    await setupStoragePolicies();
    
    console.log('🎉 Supabase Storage setup completed successfully!');
    
  } catch (error) {
    console.error('💥 Error setting up Supabase Storage:', error);
    throw error;
  }
};

const setupStoragePolicies = async () => {
  const policies = [
    // Allow authenticated users to upload their own photos
    {
      name: 'Users can upload their own photos',
      sql: `
        CREATE POLICY "Users can upload their own photos" ON storage.objects
        FOR INSERT TO authenticated WITH CHECK (
          bucket_id IN ('avatars', 'listings', 'room-photos') AND
          auth.uid()::text = (storage.foldername(name))[1]
        );
      `
    },
    
    // Allow users to update their own photos
    {
      name: 'Users can update their own photos',
      sql: `
        CREATE POLICY "Users can update their own photos" ON storage.objects
        FOR UPDATE TO authenticated USING (
          bucket_id IN ('avatars', 'listings', 'room-photos') AND
          auth.uid()::text = (storage.foldername(name))[1]
        );
      `
    },
    
    // Allow users to delete their own photos
    {
      name: 'Users can delete their own photos',
      sql: `
        CREATE POLICY "Users can delete their own photos" ON storage.objects
        FOR DELETE TO authenticated USING (
          bucket_id IN ('avatars', 'listings', 'room-photos') AND
          auth.uid()::text = (storage.foldername(name))[1]
        );
      `
    },
    
    // Public read access for all photos
    {
      name: 'Public read access for photos',
      sql: `
        CREATE POLICY "Public read access for photos" ON storage.objects
        FOR SELECT USING (bucket_id IN ('avatars', 'listings', 'room-photos'));
      `
    }
  ];

  for (const policy of policies) {
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: policy.sql });
      if (error && !error.message.includes('already exists')) {
        console.warn(`⚠️ Policy "${policy.name}" might already exist or have an issue:`, error.message);
      } else {
        console.log(`✅ Policy "${policy.name}" applied successfully`);
      }
    } catch (error) {
      console.warn(`⚠️ Error applying policy "${policy.name}":`, error);
    }
  }
};

// If running this file directly
if (require.main === module) {
  setupSupabaseStorage()
    .then(() => {
      console.log('✨ Storage setup completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Storage setup failed:', error);
      process.exit(1);
    });
}