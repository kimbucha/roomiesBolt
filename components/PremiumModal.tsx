import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TouchableWithoutFeedback } from 'react-native';
import { Heart, Star, X, Crown, Zap } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useSupabaseMatchesStore } from '../store/supabaseMatchesStore';

interface PremiumModalProps {
  visible: boolean;
  onClose: () => void;
  onUpgrade?: () => void;
}

export default function PremiumModal({ visible, onClose, onUpgrade }: PremiumModalProps) {
  const router = useRouter();
  const { setPremiumStatus } = useSupabaseMatchesStore();

  const handleUpgrade = () => {
    if (__DEV__) {
      // In development mode, toggle premium status
      setPremiumStatus(true);
      
      // Call the onUpgrade callback if provided
      if (onUpgrade) {
        onUpgrade();
      }
      
      onClose();
    } else {
      // In production, this would navigate to a payment screen
      router.push('/premium-features');
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={onClose}
              >
                <X size={22} color="#9CA3AF" />
              </TouchableOpacity>
              
              <View style={styles.headerContainer}>
                <Crown size={28} color="#FFB800" style={styles.crownIcon} />
                <Text style={styles.title}>Unlock Premium Features</Text>
              </View>
              
              <View style={styles.featureRow}>
                <View style={[styles.iconContainer, { backgroundColor: '#FFFBEB' }]}>
                  <Heart size={20} color="#F59E0B" />
                </View>
                <Text style={styles.featureText}>
                  See who likes you before matching
                </Text>
              </View>
              
              <View style={styles.featureRow}>
                <View style={[styles.iconContainer, { backgroundColor: '#FFFBEB' }]}>
                  <Zap size={20} color="#F59E0B" />
                </View>
                <Text style={styles.featureText}>
                  Unlimited Super Likes
                </Text>
              </View>
              
              <TouchableOpacity 
                style={styles.upgradeButton}
                onPress={handleUpgrade}
                activeOpacity={0.8}
              >
                <Text style={styles.upgradeButtonText}>
                  Upgrade to Premium
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    paddingTop: 32,
    paddingBottom: 32,
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
    padding: 6,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 16,
  },
  crownIcon: {
    marginRight: 8,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Poppins-Bold',
    color: '#1F2937',
    textAlign: 'center',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
    paddingHorizontal: 8,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#374151',
    flex: 1,
  },
  upgradeButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  upgradeButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontFamily: 'Poppins-SemiBold',
  },
}); 