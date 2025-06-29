import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useUserStore } from '../../store/userStore';
import { validateUserData, validateOnboardingStep } from '../../utils/validation';
import { showToast } from '../../components/common/Toast';

/**
 * Validation Test Screen
 * 
 * This screen allows testing the validation rules for different onboarding steps
 */
export default function ValidationTest() {
  const router = useRouter();
  const { user } = useUserStore();
  const [step, setStep] = useState('welcome');
  const [testData, setTestData] = useState('{}');
  const [validationResult, setValidationResult] = useState<any>(null);
  
  // List of onboarding steps for testing
  const steps = [
    'welcome',
    'budget',
    'lifestyle',
    'about-you',
    'goals',
    'photos',
    'place-details',
    'account'
  ];
  
  // Test validation for the selected step
  const handleTestValidation = () => {
    try {
      // Parse the test data
      const parsedData = JSON.parse(testData);
      
      // Test step validation
      const stepResult = validateOnboardingStep(step, parsedData);
      
      // Test user data validation
      const userResult = validateUserData({
        ...user,
        ...parsedData
      });
      
      setValidationResult({
        stepValidation: stepResult,
        userValidation: userResult
      });
      
      // Show toast with result
      if (stepResult.isValid && userResult.isValid) {
        showToast('Validation passed!', 'success');
      } else {
        showToast('Validation failed. See details below.', 'error');
      }
    } catch (error) {
      setValidationResult({
        error: (error as Error).message
      });
      showToast('Error parsing test data: ' + (error as Error).message, 'error');
    }
  };
  
  // Generate sample data for the selected step
  const generateSampleData = () => {
    let sampleData = {};
    
    switch (step) {
      case 'welcome':
        sampleData = {
          name: 'Test User'
        };
        break;
      case 'budget':
        sampleData = {
          budget: { min: 500, max: 1500 },
          location: {
            state: 'California',
            latitude: 37.7749,
            longitude: -122.4194,
            address: '123 Test St, San Francisco, CA'
          }
        };
        break;
      case 'lifestyle':
        sampleData = {
          lifestylePreferences: {
            cleanliness: 3,
            noise: 2,
            guestFrequency: 1,
            smoking: false,
            pets: true
          }
        };
        break;
      case 'about-you':
        sampleData = {
          gender: 'female',
          personalityTraits: ['friendly', 'organized', 'quiet']
        };
        break;
      case 'goals':
        sampleData = {
          userRole: 'roommate_seeker'
        };
        break;
      case 'photos':
        sampleData = {
          photos: ['photo1.jpg', 'photo2.jpg'],
          profilePicture: 'photo1.jpg'
        };
        break;
      case 'place-details':
        sampleData = {
          hasPlace: true,
          placeDetails: {
            roomType: 'private',
            bedrooms: 2,
            bathrooms: 1,
            monthlyRent: '1200',
            address: '123 Test St',
            moveInDate: '2023-06-01',
            leaseDuration: '12 months',
            amenities: ['wifi', 'parking'],
            photos: ['place1.jpg', 'place2.jpg'],
            description: 'Nice apartment near downtown'
          }
        };
        break;
      case 'account':
        sampleData = {
          email: 'test@example.com'
        };
        break;
    }
    
    setTestData(JSON.stringify(sampleData, null, 2));
  };
  
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Validation Test</Text>
      
      {/* Step Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Onboarding Step</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.stepsContainer}>
          {steps.map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.stepButton, s === step && styles.stepButtonActive]}
              onPress={() => setStep(s)}
            >
              <Text style={[styles.stepButtonText, s === step && styles.stepButtonTextActive]}>
                {s}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      {/* Test Data Input */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Test Data (JSON)</Text>
        <TouchableOpacity style={styles.generateButton} onPress={generateSampleData}>
          <Text style={styles.generateButtonText}>Generate Sample Data</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.jsonInput}
          multiline
          value={testData}
          onChangeText={setTestData}
          placeholder="Enter test data as JSON"
        />
      </View>
      
      {/* Test Button */}
      <TouchableOpacity style={styles.testButton} onPress={handleTestValidation}>
        <Text style={styles.testButtonText}>Test Validation</Text>
      </TouchableOpacity>
      
      {/* Validation Results */}
      {validationResult && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Validation Results</Text>
          
          {validationResult.error ? (
            <Text style={styles.errorText}>{validationResult.error}</Text>
          ) : (
            <>
              {/* Step Validation Results */}
              <View style={styles.resultBox}>
                <Text style={styles.resultTitle}>Step Validation</Text>
                <Text style={[
                  styles.validationStatus,
                  validationResult.stepValidation.isValid ? styles.validStatus : styles.invalidStatus
                ]}>
                  {validationResult.stepValidation.isValid ? 'VALID' : 'INVALID'}
                </Text>
                
                {!validationResult.stepValidation.isValid && (
                  <View style={styles.errorsContainer}>
                    <Text style={styles.errorsTitle}>Errors:</Text>
                    {validationResult.stepValidation.errors.map((error: string, index: number) => (
                      <Text key={index} style={styles.errorItem}>• {error}</Text>
                    ))}
                  </View>
                )}
              </View>
              
              {/* User Data Validation Results */}
              <View style={styles.resultBox}>
                <Text style={styles.resultTitle}>User Data Validation</Text>
                <Text style={[
                  styles.validationStatus,
                  validationResult.userValidation.isValid ? styles.validStatus : styles.invalidStatus
                ]}>
                  {validationResult.userValidation.isValid ? 'VALID' : 'INVALID'}
                </Text>
                
                {!validationResult.userValidation.isValid && (
                  <View style={styles.errorsContainer}>
                    <Text style={styles.errorsTitle}>Errors:</Text>
                    {validationResult.userValidation.errors.map((error: string, index: number) => (
                      <Text key={index} style={styles.errorItem}>• {error}</Text>
                    ))}
                  </View>
                )}
              </View>
            </>
          )}
        </View>
      )}
      
      {/* Navigation */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Back to Debug Dashboard</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 40,
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#4F46E5',
  },
  stepsContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  stepButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#e5e7eb',
  },
  stepButtonActive: {
    backgroundColor: '#4F46E5',
  },
  stepButtonText: {
    color: '#4b5563',
    fontWeight: '500',
  },
  stepButtonTextActive: {
    color: 'white',
  },
  jsonInput: {
    height: 200,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    padding: 12,
    fontFamily: 'monospace',
    fontSize: 14,
    backgroundColor: '#f9fafb',
  },
  generateButton: {
    backgroundColor: '#10B981',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 8,
  },
  generateButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  testButton: {
    backgroundColor: '#4F46E5',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  testButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultBox: {
    padding: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    marginBottom: 12,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  validationStatus: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  validStatus: {
    backgroundColor: '#D1FAE5',
    color: '#065F46',
  },
  invalidStatus: {
    backgroundColor: '#FEE2E2',
    color: '#B91C1C',
  },
  errorsContainer: {
    marginTop: 8,
  },
  errorsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  errorItem: {
    fontSize: 14,
    color: '#B91C1C',
    marginBottom: 2,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 16,
    fontStyle: 'italic',
  },
  navigationContainer: {
    marginBottom: 40,
  },
  backButton: {
    backgroundColor: '#6B7280',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});
