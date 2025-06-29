import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { X, Plus, CreditCard, Trash2, Check } from 'lucide-react-native';
import { Button, Card } from '../components';

const PaymentMethodsScreen = () => {
  const router = useRouter();
  // Mock payment methods data
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: '1',
      type: 'visa',
      last4: '4242',
      expMonth: 12,
      expYear: 2025,
      isDefault: true,
    },
    {
      id: '2',
      type: 'mastercard',
      last4: '5555',
      expMonth: 10,
      expYear: 2024,
      isDefault: false,
    },
  ]);

  const handleClose = () => {
    router.back();
  };

  const handleAddPaymentMethod = () => {
    Alert.alert(
      'Add Payment Method',
      'This feature will be available in the next update.',
      [{ text: 'OK' }]
    );
  };

  const handleRemovePaymentMethod = (id) => {
    Alert.alert(
      'Remove Payment Method',
      'Are you sure you want to remove this payment method?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          onPress: () => {
            setPaymentMethods(paymentMethods.filter((method) => method.id !== id));
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleSetDefaultPaymentMethod = (id) => {
    setPaymentMethods(
      paymentMethods.map((method) => ({
        ...method,
        isDefault: method.id === id,
      }))
    );
  };

  const getCardIcon = (type) => {
    switch (type) {
      case 'visa':
        return '💳'; // Using emoji as placeholder, would use actual card images in a real app
      case 'mastercard':
        return '💳';
      case 'amex':
        return '💳';
      default:
        return '💳';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <X size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Methods</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Payment Methods</Text>
          
          {paymentMethods.map((method) => (
            <Card key={method.id} variant="outlined" style={styles.paymentCard}>
              <View style={styles.paymentCardContent}>
                <View style={styles.cardIconContainer}>
                  <Text style={styles.cardIcon}>{getCardIcon(method.type)}</Text>
                </View>
                
                <View style={styles.cardDetails}>
                  <Text style={styles.cardType}>
                    {method.type.charAt(0).toUpperCase() + method.type.slice(1)}
                  </Text>
                  <Text style={styles.cardNumber}>•••• {method.last4}</Text>
                  <Text style={styles.cardExpiry}>
                    Expires {method.expMonth}/{method.expYear}
                  </Text>
                </View>
                
                <View style={styles.cardActions}>
                  {method.isDefault ? (
                    <View style={styles.defaultBadge}>
                      <Check size={12} color="#10B981" />
                      <Text style={styles.defaultText}>Default</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.setDefaultButton}
                      onPress={() => handleSetDefaultPaymentMethod(method.id)}
                    >
                      <Text style={styles.setDefaultText}>Set as Default</Text>
                    </TouchableOpacity>
                  )}
                  
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemovePaymentMethod(method.id)}
                  >
                    <Trash2 size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            </Card>
          ))}
          
          <TouchableOpacity
            style={styles.addPaymentButton}
            onPress={handleAddPaymentMethod}
          >
            <Plus size={20} color="#4F46E5" />
            <Text style={styles.addPaymentText}>Add Payment Method</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Billing Information</Text>
          
          <Card variant="outlined" style={styles.billingCard}>
            <View style={styles.billingInfo}>
              <Text style={styles.billingLabel}>Name</Text>
              <Text style={styles.billingValue}>Alex Morgan</Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.billingInfo}>
              <Text style={styles.billingLabel}>Email</Text>
              <Text style={styles.billingValue}>alex.morgan@example.com</Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.billingInfo}>
              <Text style={styles.billingLabel}>Address</Text>
              <Text style={styles.billingValue}>
                123 University Ave, Palo Alto, CA 94301
              </Text>
            </View>
            
            <TouchableOpacity style={styles.editBillingButton}>
              <Text style={styles.editBillingText}>Edit Billing Information</Text>
            </TouchableOpacity>
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment History</Text>
          
          <Card variant="outlined" style={styles.paymentHistoryCard}>
            <View style={styles.paymentHistoryItem}>
              <View>
                <Text style={styles.paymentHistoryTitle}>Premium Subscription</Text>
                <Text style={styles.paymentHistoryDate}>Feb 15, 2025</Text>
              </View>
              <Text style={styles.paymentHistoryAmount}>$9.99</Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.paymentHistoryItem}>
              <View>
                <Text style={styles.paymentHistoryTitle}>Premium Subscription</Text>
                <Text style={styles.paymentHistoryDate}>Jan 15, 2025</Text>
              </View>
              <Text style={styles.paymentHistoryAmount}>$9.99</Text>
            </View>
            
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>View All Transactions</Text>
            </TouchableOpacity>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
    color: '#1F2937',
  },
  closeButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
    color: '#1F2937',
    marginBottom: 12,
  },
  paymentCard: {
    marginBottom: 12,
  },
  paymentCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  cardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardIcon: {
    fontSize: 24,
  },
  cardDetails: {
    flex: 1,
  },
  cardType: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: '#1F2937',
  },
  cardNumber: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#4B5563',
  },
  cardExpiry: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#6B7280',
  },
  cardActions: {
    alignItems: 'flex-end',
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 8,
  },
  defaultText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: '#10B981',
    marginLeft: 4,
  },
  setDefaultButton: {
    marginBottom: 8,
  },
  setDefaultText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: '#4F46E5',
  },
  removeButton: {
    padding: 4,
  },
  addPaymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  addPaymentText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: '#4F46E5',
    marginLeft: 8,
  },
  billingCard: {
    padding: 16,
  },
  billingInfo: {
    marginVertical: 8,
  },
  billingLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  billingValue: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: '#1F2937',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  editBillingButton: {
    alignSelf: 'flex-end',
    marginTop: 16,
  },
  editBillingText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#4F46E5',
  },
  paymentHistoryCard: {
    padding: 16,
  },
  paymentHistoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  paymentHistoryTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: '#1F2937',
  },
  paymentHistoryDate: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#6B7280',
  },
  paymentHistoryAmount: {
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    color: '#1F2937',
  },
  viewAllButton: {
    alignSelf: 'center',
    marginTop: 16,
  },
  viewAllText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#4F46E5',
  },
});

export default PaymentMethodsScreen;
