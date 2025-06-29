import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  TextInput,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  SafeAreaView,
} from 'react-native';
import { X, Calendar, CreditCard, Users, Check } from 'lucide-react-native';

interface BookingFormModalProps {
  isVisible: boolean;
  placeTitle: string;
  pricePerMonth: number;
  onClose: () => void;
  onSubmit: (formData: BookingFormData) => void;
}

export interface BookingFormData {
  startDate: string;
  endDate: string;
  guests: number;
  paymentMethod: string;
  message: string;
}

export const BookingFormModal: React.FC<BookingFormModalProps> = ({
  isVisible,
  placeTitle,
  pricePerMonth,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<BookingFormData>({
    startDate: '',
    endDate: '',
    guests: 1,
    paymentMethod: 'Credit Card',
    message: '',
  });

  const [activeStep, setActiveStep] = useState(1);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);

  const handleInputChange = (field: keyof BookingFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateTotalPrice = () => {
    // Simple calculation for now - in a real app would use proper date difference
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return pricePerMonth;
    }
    
    const monthDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                      (endDate.getMonth() - startDate.getMonth());
    const totalMonths = Math.max(1, monthDiff);
    
    return pricePerMonth * totalMonths;
  };

  const handleSubmit = () => {
    onSubmit(formData);
    onClose();
  };

  const handleNextStep = () => {
    if (activeStep < 3) {
      setActiveStep(activeStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevStep = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
    } else {
      onClose();
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicatorContainer}>
      {[1, 2, 3].map((step) => (
        <View key={step} style={styles.stepContainer}>
          <View style={[
            styles.stepCircle,
            activeStep === step ? styles.activeStepCircle : 
            activeStep > step ? styles.completedStepCircle : null
          ]}>
            {activeStep > step ? (
              <Check size={16} color="#FFFFFF" />
            ) : (
              <Text style={[
                styles.stepNumber,
                activeStep === step ? styles.activeStepNumber : null
              ]}>{step}</Text>
            )}
          </View>
          {step < 3 && <View style={[
            styles.stepLine,
            activeStep > step ? styles.completedStepLine : null
          ]} />}
        </View>
      ))}
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Select Dates</Text>
      
      <View style={styles.dateFieldContainer}>
        <Text style={styles.fieldLabel}>Move-in Date</Text>
        <TouchableOpacity 
          style={styles.datePickerField}
          onPress={() => setShowDatePicker(!showDatePicker)}
        >
          <Calendar size={20} color="#6B7280" />
          <TextInput
            style={styles.dateInput}
            placeholder="MM/DD/YYYY"
            value={formData.startDate}
            onChangeText={(value) => handleInputChange('startDate', value)}
            keyboardType="numbers-and-punctuation"
          />
        </TouchableOpacity>
      </View>
      
      <View style={styles.dateFieldContainer}>
        <Text style={styles.fieldLabel}>Move-out Date</Text>
        <TouchableOpacity 
          style={styles.datePickerField}
          onPress={() => setShowDatePicker(!showDatePicker)}
        >
          <Calendar size={20} color="#6B7280" />
          <TextInput
            style={styles.dateInput}
            placeholder="MM/DD/YYYY"
            value={formData.endDate}
            onChangeText={(value) => handleInputChange('endDate', value)}
            keyboardType="numbers-and-punctuation"
          />
        </TouchableOpacity>
      </View>
      
      <View style={styles.dateFieldContainer}>
        <Text style={styles.fieldLabel}>Number of Guests</Text>
        <View style={styles.guestsContainer}>
          <TouchableOpacity 
            style={styles.guestButton}
            onPress={() => handleInputChange('guests', Math.max(1, (formData.guests as number) - 1))}
          >
            <Text style={styles.guestButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.guestCount}>{formData.guests}</Text>
          <TouchableOpacity 
            style={styles.guestButton}
            onPress={() => handleInputChange('guests', (formData.guests as number) + 1)}
          >
            <Text style={styles.guestButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {showDatePicker && (
        <View style={styles.datePickerContainer}>
          {/* In a real app, you would implement a calendar here */}
          <Text style={styles.datePickerPlaceholder}>
            Calendar component would appear here
          </Text>
        </View>
      )}
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Payment Method</Text>
      
      <View style={styles.paymentContainer}>
        <Text style={styles.fieldLabel}>Select Payment Method</Text>
        <TouchableOpacity 
          style={styles.paymentSelector}
          onPress={() => setShowPaymentOptions(!showPaymentOptions)}
        >
          <View style={styles.selectedPaymentMethod}>
            <CreditCard size={20} color="#6B7280" />
            <Text style={styles.paymentMethodText}>
              {formData.paymentMethod}
            </Text>
          </View>
          <Text style={{ fontSize: 14, color: '#6B7280' }}>▼</Text>
        </TouchableOpacity>
        
        {showPaymentOptions && (
          <View style={styles.paymentOptionsContainer}>
            {['Credit Card', 'PayPal', 'Bank Transfer'].map((method) => (
              <TouchableOpacity 
                key={method}
                style={[
                  styles.paymentOption,
                  formData.paymentMethod === method && styles.selectedPaymentOption
                ]}
                onPress={() => {
                  handleInputChange('paymentMethod', method);
                  setShowPaymentOptions(false);
                }}
              >
                <Text style={[
                  styles.paymentOptionText,
                  formData.paymentMethod === method && styles.selectedPaymentOptionText
                ]}>{method}</Text>
                {formData.paymentMethod === method && (
                  <Check size={16} color="#4F46E5" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
      
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Price Summary</Text>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Monthly rent</Text>
          <Text style={styles.summaryValue}>${pricePerMonth}</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Duration</Text>
          <Text style={styles.summaryValue}>
            {formData.startDate && formData.endDate 
              ? `${formData.startDate} - ${formData.endDate}`
              : 'Not specified'}
          </Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Guests</Text>
          <Text style={styles.summaryValue}>{formData.guests}</Text>
        </View>
        
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${calculateTotalPrice()}</Text>
        </View>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Introduction Message</Text>
      
      <View style={styles.messageContainer}>
        <Text style={styles.fieldLabel}>Message to Host</Text>
        <TextInput
          style={styles.messageInput}
          placeholder="Introduce yourself and explain why you're interested in this place..."
          multiline={true}
          numberOfLines={6}
          textAlignVertical="top"
          value={formData.message}
          onChangeText={(value) => handleInputChange('message', value)}
        />
      </View>
      
      <View style={styles.finalSummaryContainer}>
        <Text style={styles.summaryTitle}>Booking Summary</Text>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Place</Text>
          <Text style={styles.summaryValue} numberOfLines={1}>{placeTitle}</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Dates</Text>
          <Text style={styles.summaryValue}>
            {formData.startDate && formData.endDate 
              ? `${formData.startDate} - ${formData.endDate}`
              : 'Not specified'}
          </Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Guests</Text>
          <Text style={styles.summaryValue}>{formData.guests}</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Payment</Text>
          <Text style={styles.summaryValue}>{formData.paymentMethod}</Text>
        </View>
        
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${calculateTotalPrice()}</Text>
        </View>
      </View>
    </View>
  );

  const renderStepContent = () => {
    switch (activeStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      default:
        return null;
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Book Your Stay</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <X size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>
              
              {renderStepIndicator()}
              
              <ScrollView style={styles.scrollContainer}>
                {renderStepContent()}
              </ScrollView>
              
              <View style={styles.buttonsContainer}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={handlePrevStep}
                >
                  <Text style={styles.backButtonText}>
                    {activeStep === 1 ? 'Cancel' : 'Back'}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.nextButton}
                  onPress={handleNextStep}
                >
                  <Text style={styles.nextButtonText}>
                    {activeStep === 3 ? 'Submit Request' : 'Continue'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: '75%',
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
  },
  stepIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 40,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeStepCircle: {
    borderColor: '#4F46E5',
    backgroundColor: '#4F46E5',
  },
  completedStepCircle: {
    borderColor: '#4F46E5',
    backgroundColor: '#4F46E5',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeStepNumber: {
    color: 'white',
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 5,
  },
  completedStepLine: {
    backgroundColor: '#4F46E5',
  },
  scrollContainer: {
    flex: 1,
  },
  stepContent: {
    padding: 20,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 20,
  },
  dateFieldContainer: {
    marginBottom: 20,
  },
  guestsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  guestButton: {
    width: 30,
    height: 30,
    backgroundColor: '#F3F4F6',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guestButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4F46E5',
  },
  guestCount: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 8,
  },
  datePickerField: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  dateInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#1F2937',
    padding: 0,
  },
  datePickerContainer: {
    marginTop: 10,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  datePickerPlaceholder: {
    fontSize: 16,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  paymentContainer: {
    marginBottom: 20,
  },
  paymentSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  selectedPaymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMethodText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#1F2937',
  },
  paymentOptionsContainer: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: 'white',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  paymentOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  selectedPaymentOption: {
    backgroundColor: '#F5F3FF',
  },
  paymentOptionText: {
    fontSize: 16,
    color: '#1F2937',
  },
  selectedPaymentOptionText: {
    fontWeight: '600',
    color: '#4F46E5',
  },
  summaryContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
    marginTop: 20,
  },
  finalSummaryContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
    marginTop: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
    maxWidth: '50%',
    textAlign: 'right',
  },
  totalRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4F46E5',
  },
  messageContainer: {
    marginBottom: 20,
  },
  messageInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
    minHeight: 120,
  },
  buttonsContainer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  backButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  nextButton: {
    flex: 2,
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default BookingFormModal; 