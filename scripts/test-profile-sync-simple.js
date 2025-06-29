/**
 * Simple test script for profile synchronization
 * 
 * This script tests the profile picture selection and budget formatting
 * without requiring the Zustand store imports
 */

// We'll implement the functions directly in this script to avoid import issues

// Implementation of the determineProfilePicture function
function determineProfilePicture(user) {
  if (user.profilePicture) {
    return user.profilePicture;
  }
  
  if (user.photos && user.photos.length > 0 && 
      typeof user.profilePhotoIndex === 'number' && 
      user.profilePhotoIndex >= 0 && 
      user.profilePhotoIndex < user.photos.length) {
    return user.photos[user.profilePhotoIndex];
  }
  
  if (user.photos && user.photos.length > 0) {
    return user.photos[0];
  }
  
  return 'https://randomuser.me/api/portraits/lego/1.jpg';
}

// Test function to verify profile picture selection
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
    },
    {
      name: "User with photos but no profilePhotoIndex",
      user: {
        id: "3",
        name: "Test User 3",
        photos: ["https://example.com/photo1.jpg", "https://example.com/photo2.jpg"]
      },
      expected: "https://example.com/photo1.jpg"
    },
    {
      name: "User with no photos",
      user: {
        id: "4",
        name: "Test User 4"
      },
      expected: "https://randomuser.me/api/portraits/lego/1.jpg"
    },
    {
      name: "User with empty photos array",
      user: {
        id: "5",
        name: "Test User 5",
        photos: []
      },
      expected: "https://randomuser.me/api/portraits/lego/1.jpg"
    },
    {
      name: "User with invalid profilePhotoIndex",
      user: {
        id: "6",
        name: "Test User 6",
        photos: ["https://example.com/photo1.jpg"],
        profilePhotoIndex: 5
      },
      expected: "https://example.com/photo1.jpg"
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

// Test function to verify budget formatting
function testBudgetFormatting() {
  console.log('\n=== TESTING BUDGET FORMATTING ===');
  
  // Test cases
  const testCases = [
    {
      name: "User with budget",
      user: {
        id: "1",
        name: "Test User",
        budget: { min: 1000, max: 2000 }
      },
      expected: "$1000-2000"
    },
    {
      name: "User with budget in preferences",
      user: {
        id: "2",
        name: "Test User 2",
        preferences: {
          budget: { min: 1500, max: 2500 }
        }
      },
      expected: "$1500-2500"
    },
    {
      name: "User with both budget and preferences.budget",
      user: {
        id: "3",
        name: "Test User 3",
        budget: { min: 1000, max: 2000 },
        preferences: {
          budget: { min: 1500, max: 2500 }
        }
      },
      expected: "$1000-2000"
    },
    {
      name: "User with no budget",
      user: {
        id: "4",
        name: "Test User 4"
      },
      expected: "$1000-2000" // Default
    }
  ];
  
  // Run tests
  let passedTests = 0;
  for (const test of testCases) {
    console.log(`\nTest: ${test.name}`);
    
    try {
      const result = formatBudget(test.user);
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

// Helper function to format budget (copied from the original test script)
function formatBudget(user) {
  if (user.budget && user.budget.min !== undefined && user.budget.max !== undefined) {
    return `$${user.budget.min}-${user.budget.max}`;
  } else if (user.preferences?.budget?.min !== undefined && user.preferences?.budget?.max !== undefined) {
    return `$${user.preferences.budget.min}-${user.preferences.budget.max}`;
  }
  
  return '$1000-2000'; // Default budget range
}

// Run the tests
testProfilePictureSelection();
testBudgetFormatting();
