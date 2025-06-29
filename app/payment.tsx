import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, CreditCard, Plus, Trash2 } from 'lucide-react-native';
import { Button } from '../components';
import { useSubscriptionStore, PaymentMethod } from '../store/subscriptionStore';
import { v4 as uuidv4 } from 'uuid';

export default function PaymentScreen() {
  const router = useRouter();
  const { 
    paymentMethods, 
    addPaymentMethod, 
    removePaymentMethod, 
    setDefaultPaymentMethod,
    setSubscriptionTier,
    isPremium
  } = useSubscriptionStore();
  
  const [showAddCard, setShowAddCard] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  
  const handleAddCard = () => {
    // Basic validation
    if (!cardNumber || !cardName || !expiryDate || !cvv) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    if (cardNumber.length < 16) {
      Alert.alert('Error', 'Please enter a valid card number');
      return;
    }
    
    if (expiryDate.length !== 5 || !expiryDate.includes('/')) {
      Alert.alert('Error', 'Please enter a valid expiry date (MM/YY)');
      return;
    }
    
    if (cvv.length < 3) {
      Alert.alert('Error', 'Please enter a valid CVV');
      return;
    }
    
    // Determine card type based on first digit
    let cardType: 'visa' | 'mastercard' | 'amex' | 'discover' = 'visa';
    const firstDigit = cardNumber.charAt(0);
    
    if (firstDigit === '4') {
      cardType = 'visa';
    } else if (firstDigit === '5') {
      cardType = 'mastercard';
    } else if (firstDigit === '3') {
      cardType = 'amex';
    } else if (firstDigit === '6') {
      cardType = 'discover';
    }
    
    // Create payment method object
    const newPaymentMethod: PaymentMethod = {
      id: uuidv4(),
      type: 'card',
      isDefault: paymentMethods.length === 0, // First card is default
      lastFour: cardNumber.slice(-4),
      expiryDate: expiryDate,
      cardType: cardType,
      name: cardName,
    };
    
    // Add to store
    addPaymentMethod(newPaymentMethod);
    
    // Reset form
    setCardNumber('');
    setCardName('');
    setExpiryDate('');
    setCvv('');
    setShowAddCard(false);
    
    // If this is the first payment method and user is not premium,
    // show subscription confirmation
    if (paymentMethods.length === 0 && !isPremium()) {
      Alert.alert(
        'Subscribe to Premium?',
        'Would you like to subscribe to Roomies Premium using this card?',
        [
          {
            text: 'No',
            style: 'cancel',
          },
          {
            text: 'Yes',
            onPress: () => {
              // Set expiry date to 1 month from now
              const expiryDate = new Date();
              expiryDate.setMonth(expiryDate.getMonth() + 1);
              
              // Update subscription
              setSubscriptionTier('premium', expiryDate.toISOString());
              
              Alert.alert(
                'Subscription Successful',
                'You are now subscribed to Roomies Premium!',
                [
                  {
                    text: 'OK',
                    onPress: () => router.push('/premium'),
                  },
                ]
              );
            },
          },
        ]
      );
    }
  };
  
  const handleSetDefault = (id: string) => {
    setDefaultPaymentMethod(id);
  };
  
  const handleRemoveCard = (id: string) => {
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
          style: 'destructive',
          onPress: () => removePaymentMethod(id),
        },
      ]
    );
  };
  
  const formatCardNumber = (text: string) => {
    // Remove all non-digit characters
    const cleaned = text.replace(/\D/g, '');
    
    // Limit to 16 digits
    const limited = cleaned.substring(0, 16);
    
    // Format with spaces every 4 digits
    let formatted = '';
    for (let i = 0; i < limited.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formatted += ' ';
      }
      formatted += limited.charAt(i);
    }
    
    return formatted;
  };
  
  const formatExpiryDate = (text: string) => {
    // Remove all non-digit characters
    const cleaned = text.replace(/\D/g, '');
    
    // Limit to 4 digits
    const limited = cleaned.substring(0, 4);
    
    // Format as MM/YY
    if (limited.length > 2) {
      return limited.substring(0, 2) + '/' + limited.substring(2);
    }
    
    return limited;
  };
  
  const renderCardIcon = (cardType: string) => {
    let color = '#1F2937';
    
    switch (cardType) {
      case 'visa':
        color = '#1A1F71';
        break;
      case 'mastercard':
        color = '#EB001B';
        break;
      case 'amex':
        color = '#006FCF';
        break;
      case 'discover':
        color = '#FF6600';
        break;
    }
    
    return <CreditCard size={24} color={color} />;
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Methods</Text>
        <View style={styles.headerRight} />
      </View>
      
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {paymentMethods.length === 0 && !showAddCard ? (
          <View style={styles.emptyState}>
            <CreditCard size={48} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No Payment Methods</Text>
            <Text style={styles.emptyText}>
              Add a payment method to subscribe to Roomies Premium
            </Text>
          </View>
        ) : (
          <>
            {paymentMethods.map((method) => (
              <View key={method.id} style={styles.paymentCard}>
                <View style={styles.cardInfo}>
                  {method.type === 'card' && (
                    <>
                      {renderCardIcon(method.cardType || 'visa')}
                      <View style={styles.cardDetails}>
                        <Text style={styles.cardName}>{method.name}</Text>
                        <Text style={styles.cardNumber}>
                          •••• •••• •••• {method.lastFour}
                        </Text>
                        <Text style={styles.cardExpiry}>
                          Expires {method.expiryDate}
                        </Text>
                      </View>
                    </>
                  )}
                </View>
                
                <View style={styles.cardActions}>
                  {method.isDefault ? (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultText}>Default</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.setDefaultButton}
                      onPress={() => handleSetDefault(method.id)}
                    >
                      <Text style={styles.setDefaultText}>Set Default</Text>
                    </TouchableOpacity>
                  )}
                  
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveCard(method.id)}
                  >
                    <Trash2 size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}
        
        {showAddCard ? (
          <View style={styles.addCardForm}>
            <Text style={styles.formTitle}>Add Payment Method</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Card Number</Text>
              <TextInput
                style={styles.input}
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                keyboardType="number-pad"
                maxLength={19} // 16 digits + 3 spaces
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Cardholder Name</Text>
              <TextInput
                style={styles.input}
                placeholder="John Doe"
                value={cardName}
                onChangeText={setCardName}
              />
            </View>
            
            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.inputLabel}>Expiry Date</Text>
                <TextInput
                  style={styles.input}
                  placeholder="MM/YY"
                  value={expiryDate}
                  onChangeText={(text) => setExpiryDate(formatExpiryDate(text))}
                  keyboardType="number-pad"
                  maxLength={5} // MM/YY
                />
              </View>
              
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.inputLabel}>CVV</Text>
                <TextInput
                  style={styles.input}
                  placeholder="123"
                  value={cvv}
                  onChangeText={setCvv}
                  keyboardType="number-pad"
                  maxLength={4} // Some cards have 4-digit CVV
                  secureTextEntry
                />
              </View>
            </View>
            
            <View style={styles.formActions}>
              <Button
                label="Cancel"
                onPress={() => setShowAddCard(false)}
                variant="secondary"
                style={{ flex: 1, marginRight: 8 }}
              />
              <Button
                label="Add Card"
                onPress={handleAddCard}
                style={{ flex: 1, marginLeft: 8 }}
              />
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddCard(true)}
          >
            <Plus size={20} color="#4F46E5" />
            <Text style={styles.addButtonText}>Add Payment Method</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    fontFamily: 'Poppins-Bold',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
    fontFamily: 'Poppins-Bold',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
  },
  paymentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardDetails: {
    marginLeft: 12,
  },
  cardName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    fontFamily: 'Poppins-SemiBold',
  },
  cardNumber: {
    fontSize: 14,
    color: '#4B5563',
    fontFamily: 'Poppins-Regular',
  },
  cardExpiry: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  defaultBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  defaultText: {
    fontSize: 12,
    color: '#4B5563',
    fontFamily: 'Poppins-Medium',
  },
  setDefaultButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  setDefaultText: {
    fontSize: 12,
    color: '#4F46E5',
    fontFamily: 'Poppins-Medium',
  },
  removeButton: {
    padding: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    marginTop: 8,
  },
  addButtonText: {
    fontSize: 14,
    color: '#4F46E5',
    marginLeft: 8,
    fontFamily: 'Poppins-Medium',
  },
  addCardForm: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
    fontFamily: 'Poppins-Bold',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 8,
    fontFamily: 'Poppins-Medium',
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1F2937',
    fontFamily: 'Poppins-Regular',
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  formActions: {
    flexDirection: 'row',
    marginTop: 8,
  },
});
