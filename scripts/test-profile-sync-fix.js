/**
 * Test script to verify profile synchronization fixes
 * 
 * This script tests the synchronization between user and roommate profiles,
 * focusing on profile picture and lifestyle preferences
 */

// Import the necessary functions
const { determineProfilePicture, mapCleanlinessToEnum, mapNoiseLevelToEnum, mapGuestFrequencyToEnum } = require('../utils/profileSynchronizer');

// Test cases for profile picture selection
function testProfilePictureSelection() {
  console.log('=== TESTING PROFILE PICTURE SELECTION ===');
  
  // Test cases
  const testCases = [
    {
      name: "User with profilePicture set",
      user: {
        id: "1",
        name: "Test User",
        profilePicture: "https://example.com/profile.jpg",
        photos: ["https://example.com/photo1.jpg", "https://example.com/photo2.jpg"],
        profilePhotoIndex: 0
      },
      expected: "https://example.com/profile.jpg"
    },
    {
      name: "User with photos and profilePhotoIndex",
      user: {
        id: "2",
        name: "Test User 2",
        photos: ["https://example.com/photo1.jpg", "https://example.com/photo2.jpg"],
        profilePhotoIndex: 1
      },
      expected: "https://example.com/photo2.jpg"
    }
  ];
  
  // Run tests
  let passedTests = 0;
  for (const test of testCases) {
    console.log(`\nTest: ${test.name}`);
    
    try {
      const result = determineProfilePicture(test.user);
      const passed = result === test.expected;
      
      console.log(`Result: ${passed ? '✅ PASSED' : '❌ FAILED'}`);
      console.log(`  Expected: ${test.expected}`);
      console.log(`  Actual: ${result}`);
      
      if (passed) passedTests++;
    } catch (error) {
      console.log(`❌ ERROR: ${error.message}`);
    }
  }
  
  console.log(`\n=== TEST SUMMARY ===`);
  console.log(`Passed: ${passedTests}/${testCases.length}`);
}

// Test lifestyle preference mapping functions
function testLifestylePreferenceMappings() {
  console.log('\n=== TESTING LIFESTYLE PREFERENCE MAPPINGS ===');
  
  // Test cleanliness mapping
  console.log('\nCleanliness Mapping:');
  console.log(`0 -> ${mapCleanlinessToEnum(0)}`); // should be very_clean
  console.log(`1 -> ${mapCleanlinessToEnum(1)}`); // should be very_clean
  console.log(`2 -> ${mapCleanlinessToEnum(2)}`); // should be clean
  console.log(`3 -> ${mapCleanlinessToEnum(3)}`); // should be moderate
  console.log(`4 -> ${mapCleanlinessToEnum(4)}`); // should be relaxed
  console.log(`undefined -> ${mapCleanlinessToEnum(undefined)}`); // should be undefined
  
  // Test noise level mapping
  console.log('\nNoise Level Mapping:');
  console.log(`0 -> ${mapNoiseLevelToEnum(0)}`); // should be quiet
  console.log(`1 -> ${mapNoiseLevelToEnum(1)}`); // should be quiet
  console.log(`2 -> ${mapNoiseLevelToEnum(2)}`); // should be moderate
  console.log(`3 -> ${mapNoiseLevelToEnum(3)}`); // should be loud
  console.log(`undefined -> ${mapNoiseLevelToEnum(undefined)}`); // should be undefined
  
  // Test guest frequency mapping
  console.log('\nGuest Frequency Mapping:');
  console.log(`0 -> ${mapGuestFrequencyToEnum(0)}`); // should be rarely
  console.log(`1 -> ${mapGuestFrequencyToEnum(1)}`); // should be rarely
  console.log(`2 -> ${mapGuestFrequencyToEnum(2)}`); // should be occasionally
  console.log(`3 -> ${mapGuestFrequencyToEnum(3)}`); // should be frequently
  console.log(`undefined -> ${mapGuestFrequencyToEnum(undefined)}`); // should be undefined
}

// Run the tests
testProfilePictureSelection();
testLifestylePreferenceMappings();
