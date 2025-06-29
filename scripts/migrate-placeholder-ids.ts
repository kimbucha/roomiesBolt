#!/usr/bin/env npx tsx
/**
 * Roomies Placeholder ID Migration Script
 * 
 * This script replaces all placeholder user IDs ('currentUser', 'current-user', etc.)
 * with the actual authenticated user UUID from Supabase Auth.
 * 
 * Usage: npx tsx scripts/migrate-placeholder-ids.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface MigrationStats {
  matchesUpdated: number;
  swipesUpdated: number;
  conversationsUpdated: number;
  errors: string[];
}

async function migratePlaceholderIds(): Promise<MigrationStats> {
  const stats: MigrationStats = {
    matchesUpdated: 0,
    swipesUpdated: 0,
    conversationsUpdated: 0,
    errors: []
  };

  try {
    // Get the authenticated user (you must be logged in)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      throw new Error('No authenticated user found. Please log in first.');
    }

    const realUserId = user.id;
    const placeholders = ['currentUser', 'current-user', 'currentuser'];
    
    console.log(`🔄 Starting migration...`);
    console.log(`   Real User ID: ${realUserId}`);
    console.log(`   Placeholders to replace: ${placeholders.join(', ')}`);
    console.log('');

    // =================================================================
    // MIGRATE MATCHES TABLE
    // =================================================================
    console.log('📋 Migrating matches table...');
    
    for (const placeholder of placeholders) {
      // Update user1_id
      const { count: user1Count, error: user1Error } = await supabase
        .from('matches')
        .update({ user1_id: realUserId })
        .eq('user1_id', placeholder);
        
      if (user1Error) {
        stats.errors.push(`Matches user1_id update error: ${user1Error.message}`);
      } else {
        stats.matchesUpdated += user1Count || 0;
        console.log(`   ✅ Updated ${user1Count || 0} matches.user1_id from '${placeholder}'`);
      }
      
      // Update user2_id
      const { count: user2Count, error: user2Error } = await supabase
        .from('matches')
        .update({ user2_id: realUserId })
        .eq('user2_id', placeholder);
        
      if (user2Error) {
        stats.errors.push(`Matches user2_id update error: ${user2Error.message}`);
      } else {
        stats.matchesUpdated += user2Count || 0;
        console.log(`   ✅ Updated ${user2Count || 0} matches.user2_id from '${placeholder}'`);
      }
    }

    // =================================================================
    // MIGRATE SWIPES TABLE
    // =================================================================
    console.log('');
    console.log('👆 Migrating swipes table...');
    
    for (const placeholder of placeholders) {
      // Update swiper_id
      const { count: swiperCount, error: swiperError } = await supabase
        .from('swipes')
        .update({ swiper_id: realUserId })
        .eq('swiper_id', placeholder);
        
      if (swiperError) {
        stats.errors.push(`Swipes swiper_id update error: ${swiperError.message}`);
      } else {
        stats.swipesUpdated += swiperCount || 0;
        console.log(`   ✅ Updated ${swiperCount || 0} swipes.swiper_id from '${placeholder}'`);
      }
      
      // Update swipee_id (in case there are any)
      const { count: swipeeCount, error: swipeeError } = await supabase
        .from('swipes')
        .update({ swipee_id: realUserId })
        .eq('swipee_id', placeholder);
        
      if (swipeeError) {
        stats.errors.push(`Swipes swipee_id update error: ${swipeeError.message}`);
      } else {
        stats.swipesUpdated += swipeeCount || 0;
        console.log(`   ✅ Updated ${swipeeCount || 0} swipes.swipee_id from '${placeholder}'`);
      }
    }

    // =================================================================
    // MIGRATE CONVERSATIONS TABLE
    // =================================================================
    console.log('');
    console.log('💬 Migrating conversations table...');
    
    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select('id, participants');
      
    if (convError) {
      stats.errors.push(`Conversations fetch error: ${convError.message}`);
    } else {
      for (const conv of conversations || []) {
        let hasChanges = false;
        const updatedParticipants = conv.participants.map((p: string) => {
          if (placeholders.includes(p)) {
            hasChanges = true;
            return realUserId;
          }
          return p;
        });
        
        if (hasChanges) {
          const { error: updateError } = await supabase
            .from('conversations')
            .update({ participants: updatedParticipants })
            .eq('id', conv.id);
            
          if (updateError) {
            stats.errors.push(`Conversation ${conv.id} update error: ${updateError.message}`);
          } else {
            stats.conversationsUpdated++;
            console.log(`   ✅ Updated conversation ${conv.id} participants`);
          }
        }
      }
    }

    console.log('');
    console.log('🎉 Migration completed!');
    
  } catch (error) {
    stats.errors.push(`Migration failed: ${(error as Error).message}`);
  }

  return stats;
}

// =================================================================
// VERIFICATION FUNCTION
// =================================================================
async function verifyMigration(): Promise<void> {
  console.log('');
  console.log('🔍 Verifying migration...');
  
  const placeholders = ['currentUser', 'current-user', 'currentuser'];
  
  // Check matches
  for (const placeholder of placeholders) {
    const { count: matchCount } = await supabase
      .from('matches')
      .select('*', { count: 'exact', head: true })
      .or(`user1_id.eq.${placeholder},user2_id.eq.${placeholder}`);
      
    if (matchCount && matchCount > 0) {
      console.log(`   ⚠️  Found ${matchCount} matches still using '${placeholder}'`);
    }
  }
  
  // Check swipes
  for (const placeholder of placeholders) {
    const { count: swipeCount } = await supabase
      .from('swipes')
      .select('*', { count: 'exact', head: true })
      .or(`swiper_id.eq.${placeholder},swipee_id.eq.${placeholder}`);
      
    if (swipeCount && swipeCount > 0) {
      console.log(`   ⚠️  Found ${swipeCount} swipes still using '${placeholder}'`);
    }
  }
  
  // Check conversations (this is trickier with arrays)
  const { data: conversations } = await supabase
    .from('conversations')
    .select('id, participants');
    
  let convWithPlaceholders = 0;
  conversations?.forEach(conv => {
    const hasPlaceholder = conv.participants.some((p: string) => 
      placeholders.includes(p)
    );
    if (hasPlaceholder) convWithPlaceholders++;
  });
  
  if (convWithPlaceholders > 0) {
    console.log(`   ⚠️  Found ${convWithPlaceholders} conversations still using placeholders`);
  }
  
  if (convWithPlaceholders === 0) {
    console.log('   ✅ No placeholder IDs found - migration successful!');
  }
}

// =================================================================
// MAIN EXECUTION
// =================================================================
async function main() {
  console.log('🚀 Roomies Placeholder ID Migration');
  console.log('=====================================');
  
  const stats = await migratePlaceholderIds();
  
  console.log('');
  console.log('📊 Migration Summary:');
  console.log(`   Matches updated: ${stats.matchesUpdated}`);
  console.log(`   Swipes updated: ${stats.swipesUpdated}`);
  console.log(`   Conversations updated: ${stats.conversationsUpdated}`);
  
  if (stats.errors.length > 0) {
    console.log('');
    console.log('❌ Errors encountered:');
    stats.errors.forEach(error => console.log(`   ${error}`));
  }
  
  await verifyMigration();
  
  console.log('');
  console.log('✨ Migration script completed.');
}

// Run the migration
main().catch(console.error); 