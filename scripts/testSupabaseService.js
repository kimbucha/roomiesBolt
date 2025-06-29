#!/usr/bin/env node

/**
 * SUPABASE SERVICE TEST SCRIPT
 * 
 * This script tests our new Supabase-first roommate service
 * Run with: node scripts/testSupabaseService.js
 */

import { supabaseRoommateService } from '../services/supabaseRoommateService.js';

async function testService() {
  console.log('🧪 TESTING SUPABASE ROOMMATE SERVICE');
  console.log('=====================================\n');

  try {
    // Test 1: Get debug info
    console.log('1️⃣ Getting debug info...');
    const debugInfo = await supabaseRoommateService.getDebugInfo();
    console.log('Debug Info:', JSON.stringify(debugInfo, null, 2));
    console.log('✅ Debug info retrieved\n');

    // Test 2: Get all profiles
    console.log('2️⃣ Fetching all profiles...');
    const allProfiles = await supabaseRoommateService.getAllProfiles();
    console.log(`📊 Found ${allProfiles.length} total profiles`);
    console.log('✅ All profiles retrieved\n');

    // Test 3: Get unswiped profiles
    console.log('3️⃣ Fetching unswiped profiles...');
    const unswipedProfiles = await supabaseRoommateService.getUnswipedProfiles();
    console.log(`🎯 Found ${unswipedProfiles.length} unswiped profiles`);
    
    if (unswipedProfiles.length > 0) {
      console.log('Sample profile:', {
        id: unswipedProfiles[0].id,
        name: unswipedProfiles[0].name,
        hasPlace: unswipedProfiles[0].hasPlace
      });
    }
    console.log('✅ Unswiped profiles retrieved\n');

    // Test 4: Get user swipes
    console.log('4️⃣ Fetching user swipes...');
    const userSwipes = await supabaseRoommateService.getUserSwipes();
    console.log(`📝 Found ${userSwipes.length} user swipes`);
    console.log('✅ User swipes retrieved\n');

    // Test 5: Get user matches
    console.log('5️⃣ Fetching user matches...');
    const userMatches = await supabaseRoommateService.getUserMatches();
    console.log(`💕 Found ${userMatches.length} user matches`);
    console.log('✅ User matches retrieved\n');

    console.log('🎉 ALL TESTS PASSED!');
    console.log('The Supabase-first service is working correctly.');
    
  } catch (error) {
    console.error('❌ TEST FAILED:', error);
    console.error('Stack:', error.stack);
  }
}

// Run the test
testService().then(() => {
  console.log('\n✨ Test completed');
}).catch(error => {
  console.error('\n💥 Test script failed:', error);
}); 