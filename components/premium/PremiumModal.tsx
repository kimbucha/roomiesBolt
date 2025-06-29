import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  ScrollView 
} from 'react-native';
import { useSupabaseAuthStore } from '../../store/supabaseAuthStore';
import { Eye, MessageSquare, Star, Award, Crown } from 'lucide-react-native';

interface PremiumModalProps {
  visible: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

const PremiumModal: React.FC<PremiumModalProps> = ({ 
  visible, 
  onClose,
  onUpgrade
}) => {
  const premiumFeatures = [
    {
      icon: Eye,
      title: 'See Who Likes You',
      description: 'View all the profiles that have liked you without having to match first'
    },
    {
      icon: MessageSquare,
      title: 'Message Without Matching',
      description: 'Send messages to anyone, even before matching'
    },
    {
      icon: Star,
      title: 'Unlimited Super Likes',
      description: 'Stand out and get noticed with unlimited super likes'
    },
    {
      icon: Award,
      title: 'Priority Matching',
      description: 'Your profile will be shown to more people'
    }
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Crown size={32} color="#F7B955" />
            <Text style={styles.title}>Roomies Premium</Text>
          </View>
          
          <Text style={styles.subtitle}>
            Unlock all features and find your perfect roommate faster
          </Text>
          
          <ScrollView style={styles.featuresList}>
            {premiumFeatures.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <feature.icon size={24} color="#5e72e4" />
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
          
          <View style={styles.pricingContainer}>
            <View style={styles.pricingOption}>
              <Text style={styles.price}>$9.99</Text>
              <Text style={styles.period}>Monthly</Text>
            </View>
            
            <View style={[styles.pricingOption, styles.recommendedOption]}>
              <View style={styles.recommendedBadge}>
                <Text style={styles.recommendedText}>Best Value</Text>
              </View>
              <Text style={styles.price}>$49.99</Text>
              <Text style={styles.period}>Yearly</Text>
              <Text style={styles.savings}>Save 58%</Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.upgradeButton} onPress={onUpgrade}>
            <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Maybe Later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    height: '85%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  featuresList: {
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  featureText: {
    marginLeft: 16,
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
  },
  pricingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  pricingOption: {
    width: '48%',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recommendedOption: {
    borderWidth: 2,
    borderColor: '#5e72e4',
    backgroundColor: '#f0f3ff',
    position: 'relative',
  },
  recommendedBadge: {
    position: 'absolute',
    top: -10,
    backgroundColor: '#5e72e4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  recommendedText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  period: {
    fontSize: 14,
    color: '#666',
  },
  savings: {
    fontSize: 14,
    color: '#5e72e4',
    fontWeight: '600',
    marginTop: 4,
  },
  upgradeButton: {
    backgroundColor: '#5e72e4',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  upgradeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#666',
    fontSize: 16,
  },
});

export default PremiumModal; 