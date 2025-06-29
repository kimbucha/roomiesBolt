import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { GraduationCap, Edit2, Briefcase } from 'lucide-react-native';
import { useSupabaseUserStore } from '../../store/supabaseUserStore';
import { AnimatedModal } from '../common/AnimatedModal';

const EducationSection: React.FC = () => {
  const { user, updateUserAndProfile } = useSupabaseUserStore();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'school' | 'job'>('school');
  
  // School fields
  const [university, setUniversity] = useState(user?.university || '');
  const [major, setMajor] = useState(user?.major || '');
  const [year, setYear] = useState(user?.year?.toString() || '');
  
  // Job fields
  const [company, setCompany] = useState(user?.company || '');
  const [role, setRole] = useState(user?.role || '');
  
  const handleSave = () => {
    const updateData: any = {};
    
    if (selectedTab === 'school') {
      updateData.university = university;
      updateData.major = major;
      updateData.year = year;
      // Clear job fields when saving school info
      updateData.company = '';
      updateData.role = '';
    } else {
      updateData.company = company;
      updateData.role = role;
      // Clear school fields when saving job info
      updateData.university = '';
      updateData.major = '';
      updateData.year = '';
    }
    
    updateUserAndProfile(updateData, { validate: false });
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    // Reset all fields to current user data
    setUniversity(user?.university || '');
    setMajor(user?.major || '');
    setYear(user?.year?.toString() || '');
    setCompany(user?.company || '');
    setRole(user?.role || '');
    setIsEditing(false);
  };
  
  // Determine what to display based on current user data
  const hasSchoolInfo = user?.university || user?.major || user?.year;
  const hasJobInfo = user?.company || user?.role;
  const currentDisplayType = hasSchoolInfo ? 'school' : hasJobInfo ? 'job' : 'school';

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.titleContainer}>
          {currentDisplayType === 'school' ? (
            <GraduationCap size={20} color="#4F46E5" />
          ) : (
            <Briefcase size={20} color="#4F46E5" />
          )}
          <Text style={styles.title}>
            {currentDisplayType === 'school' ? 'Education' : 'Work & Career'}
          </Text>
        </View>
        
        <TouchableOpacity 
          style={styles.editButton} 
          onPress={() => setIsEditing(true)}
        >
          <Edit2 size={16} color="#4F46E5" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.infoContainer}>
        {currentDisplayType === 'school' ? (
          <>
            {user?.university ? (
              <Text style={styles.primaryText}>{user.university}</Text>
            ) : (
              <Text style={styles.placeholderText}>Add your university</Text>
            )}
            
            {user?.major && (
              <Text style={styles.secondaryText}>
                {user.major}{user.year ? `, Year ${user.year}` : ''}
              </Text>
            )}
          </>
        ) : (
          <>
            {user?.company ? (
              <Text style={styles.primaryText}>{user.company}</Text>
            ) : (
              <Text style={styles.placeholderText}>Add your workplace</Text>
            )}
            
            {user?.role && (
              <Text style={styles.secondaryText}>{user.role}</Text>
            )}
          </>
        )}
      </View>
      
      {/* Enhanced Edit Modal with School/Job Toggle */}
      <AnimatedModal
        visible={isEditing}
        onClose={handleCancel}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Professional Information</Text>
          
          {/* School/Job Toggle - matching Roommate/Place filter style */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                selectedTab === 'school' && styles.toggleButtonActive
              ]}
              onPress={() => setSelectedTab('school')}
            >
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
              <Text style={[
                styles.toggleButtonText,
                selectedTab === 'job' && styles.toggleButtonTextActive
              ]}>
                Job
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Conditional Fields Based on Selected Tab */}
          {selectedTab === 'school' ? (
            <>
              <Text style={styles.inputLabel}>University</Text>
              <TextInput
                style={styles.input}
                value={university}
                onChangeText={setUniversity}
                placeholder="e.g., Stanford University"
              />
              
              <Text style={styles.inputLabel}>Major</Text>
              <TextInput
                style={styles.input}
                value={major}
                onChangeText={setMajor}
                placeholder="e.g., Computer Science"
              />
              
              <Text style={styles.inputLabel}>Year</Text>
              <TextInput
                style={styles.input}
                value={year}
                onChangeText={setYear}
                placeholder="e.g., 3"
                keyboardType="number-pad"
                maxLength={1}
              />
            </>
          ) : (
            <>
              <Text style={styles.inputLabel}>Company</Text>
              <TextInput
                style={styles.input}
                value={company}
                onChangeText={setCompany}
                placeholder="e.g., Google, Microsoft, Startup"
              />
              
              <Text style={styles.inputLabel}>Role</Text>
              <TextInput
                style={styles.input}
                value={role}
                onChangeText={setRole}
                placeholder="e.g., Software Engineer, Designer"
              />
            </>
          )}
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]} 
              onPress={handleCancel}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.saveButton]} 
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </AnimatedModal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    color: '#111827',
  },
  editButton: {
    padding: 4,
  },
  infoContainer: {
    marginTop: 4,
  },
  primaryText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  secondaryText: {
    fontSize: 14,
    color: '#4B5563',
  },
  placeholderText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    color: '#111827',
    textAlign: 'center',
  },
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#4F46E5',
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  toggleButtonTextActive: {
    color: '#FFFFFF',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#FFFFFF',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  saveButton: {
    backgroundColor: '#4F46E5',
  },
  cancelButtonText: {
    color: '#4B5563',
    fontWeight: '500',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '500',
  },
});

export default EducationSection;
