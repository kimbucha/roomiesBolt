import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Book, Edit2 } from 'lucide-react-native';
import { useSupabaseUserStore } from '../../store/supabaseUserStore';
import { AnimatedModal } from '../common/AnimatedModal';

const AboutMeSection: React.FC = () => {
  const { user, updateUserAndProfile } = useSupabaseUserStore();
  const [isEditing, setIsEditing] = useState(false);
  const [bioText, setBioText] = useState(user?.bio || '');
  
  const handleSave = () => {
    updateUserAndProfile({ bio: bioText }, { validate: false });
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setBioText(user?.bio || '');
    setIsEditing(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.titleContainer}>
          <Book size={20} color="#4F46E5" />
          <Text style={styles.title}>About Me</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.editButton} 
          onPress={() => setIsEditing(true)}
        >
          <Edit2 size={16} color="#4F46E5" />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.bioText}>
        {user?.bio || 'Add a bio to tell potential roommates about yourself.'}
      </Text>
      
            {/* Edit Bio Modal */}
      <AnimatedModal
        visible={isEditing}
        onClose={handleCancel}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Edit Bio</Text>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.bioInput}
              value={bioText}
              onChangeText={setBioText}
              placeholder="Tell potential roommates about yourself..."
              multiline
              maxLength={300}
            />
          </View>
          
          <Text style={styles.charCount}>
            {bioText.length}/300 characters
          </Text>
          
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
  bioText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#4B5563',
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
    marginBottom: 16,
    color: '#111827',
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    minWidth: '100%',
    maxWidth: '100%',
  },
  bioInput: {
    width: '100%',
    minWidth: '100%',
    maxWidth: '100%',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    height: 150,
    textAlignVertical: 'top',
    flex: 0,
  },
  charCount: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'right',
    marginTop: 4,
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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

export default AboutMeSection;
