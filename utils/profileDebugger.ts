import { User } from '../store/userStore';
import { RoommateProfile } from '../store/roommateStore';

/**
 * ProfileDebugger utility
 * 
 * This utility helps with debugging profile data synchronization issues
 * between user profiles and roommate profiles.
 */

export interface ProfileDifference {
  field: string;
  userValue: any;
  roommateValue: any;
  severity: 'high' | 'medium' | 'low';
}

/**
 * Compare a user profile with its corresponding roommate profile
 * and return a list of differences
 */
export function compareProfiles(user: User, roommateProfile: RoommateProfile): ProfileDifference[] {
  const differences: ProfileDifference[] = [];
  
  // Check basic info
  if (user.name !== roommateProfile.name) {
    differences.push({
      field: 'name',
      userValue: user.name,
      roommateValue: roommateProfile.name,
      severity: 'high'
    });
  }
  
  if (user.gender !== roommateProfile.gender) {
    differences.push({
      field: 'gender',
      userValue: user.gender || 'Not set',
      roommateValue: roommateProfile.gender || 'Not set',
      severity: 'medium'
    });
  }
  
  // Check personality data
  if (user.personalityType !== roommateProfile.personalityType) {
    differences.push({
      field: 'personalityType',
      userValue: user.personalityType || 'Not set',
      roommateValue: roommateProfile.personalityType || 'Not set',
      severity: 'medium'
    });
  }
  
  // Check personality traits
  if (user.personalityTraits && roommateProfile.personalityTraits) {
    const userTraits = new Set(user.personalityTraits);
    const roommateTraits = new Set(roommateProfile.personalityTraits);
    
    if (userTraits.size !== roommateTraits.size || 
        !user.personalityTraits.every((trait: string) => roommateTraits.has(trait))) {
      differences.push({
        field: 'personalityTraits',
        userValue: user.personalityTraits.join(', '),
        roommateValue: roommateProfile.personalityTraits.join(', '),
        severity: 'medium'
      });
    }
  } else if (user.personalityTraits || roommateProfile.personalityTraits) {
    differences.push({
      field: 'personalityTraits',
      userValue: user.personalityTraits ? user.personalityTraits.join(', ') : 'Not set',
      roommateValue: roommateProfile.personalityTraits ? roommateProfile.personalityTraits.join(', ') : 'Not set',
      severity: 'medium'
    });
  }
  
  // Check lifestyle preferences
  if (user.lifestylePreferences && roommateProfile.lifestylePreferences) {
    // Compare cleanliness
    if (user.lifestylePreferences.cleanliness !== roommateProfile.lifestylePreferences.cleanliness) {
      differences.push({
        field: 'lifestylePreferences.cleanliness',
        userValue: user.lifestylePreferences.cleanliness,
        roommateValue: roommateProfile.lifestylePreferences.cleanliness,
        severity: 'medium'
      });
    }
    
    // Compare noise level (note the different property names)
    if (user.lifestylePreferences.noise !== roommateProfile.lifestylePreferences.noiseLevel) {
      differences.push({
        field: 'lifestylePreferences.noise/noiseLevel',
        userValue: user.lifestylePreferences.noise,
        roommateValue: roommateProfile.lifestylePreferences.noiseLevel,
        severity: 'medium'
      });
    }
    
    // Compare guest frequency
    if (user.lifestylePreferences.guestFrequency !== roommateProfile.lifestylePreferences.guestFrequency) {
      differences.push({
        field: 'lifestylePreferences.guestFrequency',
        userValue: user.lifestylePreferences.guestFrequency,
        roommateValue: roommateProfile.lifestylePreferences.guestFrequency,
        severity: 'low'
      });
    }
    
    // Compare smoking preference
    if (user.lifestylePreferences.smoking !== roommateProfile.lifestylePreferences.smoking) {
      differences.push({
        field: 'lifestylePreferences.smoking',
        userValue: user.lifestylePreferences.smoking ? 'Yes' : 'No',
        roommateValue: roommateProfile.lifestylePreferences.smoking ? 'Yes' : 'No',
        severity: 'high'
      });
    }
    
    // Compare pets preference
    if (user.lifestylePreferences.pets !== roommateProfile.lifestylePreferences.pets) {
      differences.push({
        field: 'lifestylePreferences.pets',
        userValue: user.lifestylePreferences.pets ? 'Yes' : 'No',
        roommateValue: roommateProfile.lifestylePreferences.pets ? 'Yes' : 'No',
        severity: 'high'
      });
    }
  } else if (user.lifestylePreferences || roommateProfile.lifestylePreferences) {
    differences.push({
      field: 'lifestylePreferences',
      userValue: user.lifestylePreferences ? 'Set' : 'Not set',
      roommateValue: roommateProfile.lifestylePreferences ? 'Set' : 'Not set',
      severity: 'high'
    });
  }
  
  // Check budget
  if (user.budget) {
    const userBudgetString = `$${user.budget.min}-${user.budget.max}`;
    if (!roommateProfile.budget || !roommateProfile.budget.includes(`${user.budget.min}-${user.budget.max}`)) {
      differences.push({
        field: 'budget',
        userValue: userBudgetString,
        roommateValue: roommateProfile.budget || 'Not set',
        severity: 'high'
      });
    }
  } else if (roommateProfile.budget) {
    differences.push({
      field: 'budget',
      userValue: 'Not set',
      roommateValue: roommateProfile.budget,
      severity: 'high'
    });
  }
  
  // Check place details
  if (user.hasPlace !== roommateProfile.hasPlace) {
    differences.push({
      field: 'hasPlace',
      userValue: user.hasPlace ? 'Yes' : 'No',
      roommateValue: roommateProfile.hasPlace ? 'Yes' : 'No',
      severity: 'high'
    });
  }
  
  if (user.preferences?.roomType !== roommateProfile.roomType) {
    differences.push({
      field: 'roomType',
      userValue: user.preferences?.roomType || 'Not set',
      roommateValue: roommateProfile.roomType || 'Not set',
      severity: 'high'
    });
  }
  
  return differences;
}

/**
 * Generate a detailed report of the differences between user and roommate profiles
 */
export function generateProfileSyncReport(user: User, roommateProfile: RoommateProfile): string {
  const differences = compareProfiles(user, roommateProfile);
  
  if (differences.length === 0) {
    return 'Profiles are fully synchronized. No differences found.';
  }
  
  const highSeverityIssues = differences.filter(diff => diff.severity === 'high');
  const mediumSeverityIssues = differences.filter(diff => diff.severity === 'medium');
  const lowSeverityIssues = differences.filter(diff => diff.severity === 'low');
  
  let report = `Profile Sync Report\n`;
  report += `=================\n\n`;
  report += `Total differences found: ${differences.length}\n`;
  report += `High severity issues: ${highSeverityIssues.length}\n`;
  report += `Medium severity issues: ${mediumSeverityIssues.length}\n`;
  report += `Low severity issues: ${lowSeverityIssues.length}\n\n`;
  
  if (highSeverityIssues.length > 0) {
    report += `HIGH SEVERITY ISSUES\n`;
    report += `-------------------\n`;
    highSeverityIssues.forEach(issue => {
      report += `Field: ${issue.field}\n`;
      report += `  User value: ${issue.userValue}\n`;
      report += `  Roommate value: ${issue.roommateValue}\n\n`;
    });
  }
  
  if (mediumSeverityIssues.length > 0) {
    report += `MEDIUM SEVERITY ISSUES\n`;
    report += `---------------------\n`;
    mediumSeverityIssues.forEach(issue => {
      report += `Field: ${issue.field}\n`;
      report += `  User value: ${issue.userValue}\n`;
      report += `  Roommate value: ${issue.roommateValue}\n\n`;
    });
  }
  
  if (lowSeverityIssues.length > 0) {
    report += `LOW SEVERITY ISSUES\n`;
    report += `------------------\n`;
    lowSeverityIssues.forEach(issue => {
      report += `Field: ${issue.field}\n`;
      report += `  User value: ${issue.userValue}\n`;
      report += `  Roommate value: ${issue.roommateValue}\n\n`;
    });
  }
  
  return report;
}

/**
 * Log profile data for debugging purposes
 */
export function logProfileData(user: User, roommateProfile: RoommateProfile | null): void {
  console.log('=== USER PROFILE ===');
  console.log('Name:', user.name);
  console.log('Email:', user.email);
  console.log('Gender:', user.gender || 'Not set');
  console.log('Personality Type:', user.personalityType || 'Not set');
  console.log('Personality Traits:', user.personalityTraits || 'Not set');
  console.log('Lifestyle Preferences:', user.lifestylePreferences || 'Not set');
  console.log('Budget:', user.budget ? `$${user.budget.min}-${user.budget.max}` : 'Not set');
  console.log('Has Place:', user.hasPlace ? 'Yes' : 'No');
  console.log('Room Type:', user.preferences?.roomType || 'Not set');
  
  if (roommateProfile) {
    console.log('\n=== ROOMMATE PROFILE ===');
    console.log('Name:', roommateProfile.name);
    console.log('Gender:', roommateProfile.gender || 'Not set');
    console.log('Personality Type:', roommateProfile.personalityType || 'Not set');
    console.log('Personality Traits:', roommateProfile.personalityTraits || 'Not set');
    console.log('Lifestyle Preferences:', roommateProfile.lifestylePreferences || 'Not set');
    console.log('Budget:', roommateProfile.budget || 'Not set');
    console.log('Has Place:', roommateProfile.hasPlace ? 'Yes' : 'No');
    console.log('Room Type:', roommateProfile.roomType || 'Not set');
    
    console.log('\n=== PROFILE COMPARISON ===');
    const differences = compareProfiles(user, roommateProfile);
    if (differences.length === 0) {
      console.log('Profiles are fully synchronized. No differences found.');
    } else {
      console.log(`Found ${differences.length} differences between profiles:`);
      differences.forEach((diff, index) => {
        console.log(`${index + 1}. ${diff.field}: User="${diff.userValue}" vs Roommate="${diff.roommateValue}" (${diff.severity} severity)`);
      });
    }
  } else {
    console.log('\n=== NO MATCHING ROOMMATE PROFILE FOUND ===');
  }
}
