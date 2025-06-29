import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  StyleSheet,
  SafeAreaView,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, GraduationCap, Briefcase } from 'lucide-react-native';
import { useSupabaseUserStore } from '../../store/supabaseUserStore';
import { SupabaseOnboardingProfileUpdater } from '../../utils/supabaseOnboardingProfileUpdater';
import OnboardingTemplate from '../../components/features/onboarding/OnboardingTemplate';
import { getStepNumber, getTotalSteps, getNextStep, ONBOARDING_STEPS } from '../../store/onboardingConfig';

const EducationOnboardingScreen = () => {
  const router = useRouter();
  const { user } = useSupabaseUserStore();
  const [selectedTab, setSelectedTab] = useState<'school' | 'job'>('school');
  const [isLoading, setIsLoading] = useState(false);
  
  // School fields
  const [university, setUniversity] = useState('');
  const [major, setMajor] = useState('');
  const [year, setYear] = useState('');
  
  // Job fields
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');

  // Get correct step numbers based on user role
  const userRole = user?.userRole || 'roommate_seeker';
  const currentStepIndex = getStepNumber('education', userRole);
  const totalSteps = getTotalSteps(userRole);

  // Initialize with existing user data if available
  useEffect(() => {
    if (user) {
      setUniversity(user.university || '');
      setMajor(user.major || '');
      setYear(user.year?.toString() || '');
      setCompany(user.company || '');
      setRole(user.role || '');
      
      // Auto-select tab based on existing data
      const hasSchoolInfo = user.university || user.major || user.year;
      const hasJobInfo = user.company || user.role;
      
      if (hasJobInfo && !hasSchoolInfo) {
        setSelectedTab('job');
      }
    }
  }, [user]);

  const handleContinue = async () => {
    setIsLoading(true);
    
    try {
      const data: any = {};
      
      if (selectedTab === 'school') {
        // Require at least university for school
        if (!university.trim()) {
          Alert.alert('Missing Information', 'Please enter your university name.');
          setIsLoading(false);
          return;
        }
        
        data.university = university.trim();
        data.major = major.trim();
        data.year = year.trim();
        // Clear job fields
        data.company = '';
        data.role = '';
      } else {
        // Require at least company for job
        if (!company.trim()) {
          Alert.alert('Missing Information', 'Please enter your company name.');
          setIsLoading(false);
          return;
        }
        
        data.company = company.trim();
        data.role = role.trim();
        // Clear school fields
        data.university = '';
        data.major = '';
        data.year = '';
      }

      // Save the education/work data
      await SupabaseOnboardingProfileUpdater.updateAfterStep(user?.id || '', 'education', data);
      
      // Navigate to next step using onboarding config  
      const nextStep = getNextStep('education', userRole);
      if (nextStep) {
        router.push(`/(onboarding)/${nextStep}` as any);
      } else {
        router.replace('/(tabs)/');
      }
    } catch (error) {
      console.error('Error saving education data:', error);
      Alert.alert('Error', 'Failed to save information. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    // Allow users to skip this step - navigate to next step using config
    const nextStep = getNextStep('education', userRole);
    if (nextStep) {
      router.push(`/(onboarding)/${nextStep}` as any);
    } else {
      router.replace('/(tabs)/');
    }
  };

  const isFormValid = () => {
    if (selectedTab === 'school') {
      return university.trim().length > 0;
    } else {
      return company.trim().length > 0;
    }
  };

  return (
    <OnboardingTemplate
      step={currentStepIndex}
      totalSteps={totalSteps}
      onBackPress={() => router.back()}
      onContinuePress={handleContinue}
      continueDisabled={!isFormValid() || isLoading}
      continueText={isLoading ? 'Saving...' : 'Continue'}
      title="Tell us about your professional background"
      subtitle="This helps other roommates learn more about you and find better matches."
      greeting={`Hey ${user?.name ? user.name : 'there'}`}
      buttonPosition="relative"
      disableScroll={true}
    >
      <View style={styles.content}>
        {/* School/Job Toggle */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              selectedTab === 'school' && styles.toggleButtonActive
            ]}
            onPress={() => setSelectedTab('school')}
          >
            <GraduationCap 
              size={20} 
              color={selectedTab === 'school' ? '#FFFFFF' : '#6B7280'} 
            />
            <Text style={[
              styles.toggleButtonText,
              selectedTab === 'school' && styles.toggleButtonTextActive
            ]}>
              School
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.toggleButton,
              selectedTab === 'job' && styles.toggleButtonActive
            ]}
            onPress={() => setSelectedTab('job')}
          >
            <Briefcase 
              size={20} 
              color={selectedTab === 'job' ? '#FFFFFF' : '#6B7280'} 
            />
            <Text style={[
              styles.toggleButtonText,
              selectedTab === 'job' && styles.toggleButtonTextActive
            ]}>
              Work
            </Text>
          </TouchableOpacity>
        </View>

        {/* Input Fields */}
        <View style={styles.formContainer}>
          {selectedTab === 'school' ? (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>University *</Text>
                <TextInput
                  style={styles.input}
                  value={university}
                  onChangeText={setUniversity}
                  placeholder="e.g., Stanford University"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Major</Text>
                <TextInput
                  style={styles.input}
                  value={major}
                  onChangeText={setMajor}
                  placeholder="e.g., Computer Science"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Year</Text>
                <TextInput
                  style={styles.input}
                  value={year}
                  onChangeText={setYear}
                  placeholder="e.g., 3 or Junior"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </>
          ) : (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Company *</Text>
                <TextInput
                  style={styles.input}
                  value={company}
                  onChangeText={setCompany}
                  placeholder="e.g., Google, Microsoft, Local Startup"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Role</Text>
                <TextInput
                  style={styles.input}
                  value={role}
                  onChangeText={setRole}
                  placeholder="e.g., Software Engineer, Designer"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </>
          )}
        </View>

        {/* Helper Text */}
        <Text style={styles.helperText}>
          This will be displayed on your profile.
        </Text>

        {/* Skip Option - moved to be less prominent */}
        <TouchableOpacity onPress={handleSkip} style={styles.skipContainer}>
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </OnboardingTemplate>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingTop: 8,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  toggleButtonActive: {
    backgroundColor: '#4F46E5',
  },
  toggleButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
    marginLeft: 6,
  },
  toggleButtonTextActive: {
    color: '#FFFFFF',
  },
  formContainer: {
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },
  input: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  helperText: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 16,
  },
  skipContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
});

export default EducationOnboardingScreen; 