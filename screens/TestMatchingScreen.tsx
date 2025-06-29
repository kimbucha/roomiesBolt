import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Switch,
  Image,
  SafeAreaView,
  Modal,
  StatusBar
} from 'react-native';
import { useSupabaseAuthStore } from '../store/supabaseAuthStore';
import { useMatchesStore, SwipeAction } from '../store/matchesStore';
import { useRoommateStore } from '../store/roommateStore';
import { initializeMockData, simulateSwipe } from '../utils/mockDataSetup';
import MatchesList from '../components/matching/MatchesList';
import PremiumModal from '../components/premium/PremiumModal';
import { X } from 'lucide-react-native';

interface TestMatchingScreenProps {
  visible?: boolean;
  onClose?: () => void;
}

const TestMatchingScreen: React.FC<TestMatchingScreenProps> = ({ 
  visible = false,
  onClose
}) => {
  const [premiumMode, setPremiumMode] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [initialized, setInitialized] = useState(false);
  
  const { user, setPremiumStatus } = useAuthStore();
  const { setPremiumStatus: setMatchesPremiumStatus } = useMatchesStore();
  
  // Initialize mock data when the screen loads
  useEffect(() => {
    if (visible && !initialized) {
      initializeMockData(premiumMode);
      setInitialized(true);
    }
  }, [visible, initialized, premiumMode]);
  
  // Toggle premium mode
  const togglePremiumMode = (value: boolean) => {
    setPremiumMode(value);
    
    // Update premium status in stores
    setPremiumStatus(value);
    setMatchesPremiumStatus(value);
    
    // Reinitialize mock data with new premium status
    initializeMockData(value);
    
    console.log(`Premium mode ${value ? 'enabled' : 'disabled'}`);
  };
  
  // Handle premium modal
  const handlePremiumUpgrade = () => {
    togglePremiumMode(true);
    setShowPremiumModal(false);
  };
  
  // Simulate swipe actions
  const handleSwipe = async (userId: string, action: SwipeAction) => {
    await simulateSwipe(userId, action);
  };
  
  // Check if user is premium or not
  const isPremium = user?.isPremium || false;
  
  if (!visible) return null;
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.header}>Matching System Test</Text>
          {onClose && (
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color="#333" />
            </TouchableOpacity>
          )}
        </View>
        
        {/* Premium mode toggle */}
        <View style={styles.premiumToggle}>
          <Text style={styles.premiumLabel}>Premium Mode: {isPremium ? 'ON' : 'OFF'}</Text>
          <Switch
            value={isPremium}
            onValueChange={togglePremiumMode}
            trackColor={{ false: '#767577', true: '#5e72e4' }}
            thumbColor={isPremium ? '#ffffff' : '#f4f3f4'}
          />
        </View>
        
        {/* Matches List */}
        <View style={styles.matchesContainer}>
          <MatchesList />
        </View>
        
        {/* Test Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Test Actions</Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.actionsScroll}>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => setShowPremiumModal(true)}
            >
              <Text style={styles.actionButtonText}>Show Premium Modal</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => handleSwipe('user4', 'like')}
            >
              <Text style={styles.actionButtonText}>Like Jordan</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => handleSwipe('user5', 'superLike')}
            >
              <Text style={styles.actionButtonText}>Super Like Morgan</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => handleSwipe('user1', 'pass')}
            >
              <Text style={styles.actionButtonText}>Pass Alex</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.resetButton]} 
              onPress={() => initializeMockData(isPremium)}
            >
              <Text style={styles.actionButtonText}>Reset Data</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
        
        {/* User Profiles for Testing */}
        <ScrollView style={styles.profilesContainer}>
          <Text style={styles.sectionTitle}>Test Profiles</Text>
          
          <View style={styles.profilesList}>
            {useRoommateStore.getState().roommates.map((profile) => (
              <View key={profile.id} style={styles.profileCard}>
                <Image source={{ uri: profile.image }} style={styles.profileImage} />
                <View style={styles.profileInfo}>
                  <Text style={styles.profileName}>{profile.name}, {profile.age}</Text>
                  <Text style={styles.profileUniversity}>{profile.university}</Text>
                  
                  <View style={styles.swipeButtonsContainer}>
                    <TouchableOpacity 
                      style={[styles.swipeButton, styles.passButton]}
                      onPress={() => handleSwipe(profile.id, 'pass')}
                    >
                      <Text style={styles.swipeButtonText}>✗</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.swipeButton, styles.likeButton]}
                      onPress={() => handleSwipe(profile.id, 'like')}
                    >
                      <Text style={styles.swipeButtonText}>✓</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.swipeButton, styles.superLikeButton]}
                      onPress={() => handleSwipe(profile.id, 'superLike')}
                    >
                      <Text style={styles.swipeButtonText}>★</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
        
        {/* Premium Modal */}
        <PremiumModal
          visible={showPremiumModal}
          onClose={() => setShowPremiumModal(false)}
          onUpgrade={handlePremiumUpgrade}
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    position: 'relative',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  premiumToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  premiumLabel: {
    fontSize: 16,
    marginRight: 8,
    color: '#333',
  },
  matchesContainer: {
    height: 240,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  actionsContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  actionsScroll: {
    paddingBottom: 8,
  },
  actionButton: {
    backgroundColor: '#5e72e4',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 12,
  },
  resetButton: {
    backgroundColor: '#f5365c',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  profilesContainer: {
    flex: 1,
    padding: 16,
  },
  profilesList: {
    paddingBottom: 16,
  },
  profileCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    margin: 12,
  },
  profileInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  profileUniversity: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  swipeButtonsContainer: {
    flexDirection: 'row',
    marginTop: 4,
  },
  swipeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  passButton: {
    backgroundColor: '#f5365c',
  },
  likeButton: {
    backgroundColor: '#2dce89',
  },
  superLikeButton: {
    backgroundColor: '#5e72e4',
  },
  swipeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default TestMatchingScreen; 