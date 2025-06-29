import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { X, ChevronDown, ChevronUp, MessageCircle, Mail, Phone, Globe } from 'lucide-react-native';
import { Button, Input, Card } from '../components';

const SupportScreen = () => {
  const router = useRouter();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [errors, setErrors] = useState({});

  const handleClose = () => {
    router.back();
  };

  const handleSubmit = () => {
    // Validate form
    const newErrors = {};
    if (!subject.trim()) newErrors.subject = 'Subject is required';
    if (!message.trim()) newErrors.message = 'Message is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Clear any previous errors
    setErrors({});

    // Submit support request
    Alert.alert(
      'Support Request Sent',
      'We have received your message and will get back to you as soon as possible.',
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const faqs = [
    {
      question: 'How do I find roommates?',
      answer: "You can browse potential roommates in the Discover tab. Swipe right on profiles you're interested in, and if they also swipe right on you, it's a match! You can then start chatting to see if you're a good fit.",
    },
    {
      question: 'How do I edit my preferences?',
      answer: 'Go to your Profile tab, tap on Settings, and then select Preferences. Here you can update your roommate preferences, such as budget, location, and lifestyle choices.',
    },
    {
      question: 'Is my personal information secure?',
      answer: 'Yes, we take privacy very seriously. Your personal information is encrypted and only shared with potential matches. You can control what information is visible on your profile in the Privacy settings.',
    },
    {
      question: 'How do I verify my profile?',
      answer: "To verify your profile, go to your Profile tab and tap on 'Verify Profile'. You'll need to provide a valid university email address and complete the verification steps.",
    },
    {
      question: 'What are the benefits of Premium?',
      answer: 'Premium members get access to advanced filters, unlimited likes, profile boosts, and can see who liked their profile. Premium also includes a verified badge to increase trust with potential roommates.',
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <X size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.contactSection}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <Text style={styles.sectionDescription}>
            Have a question or need help? Send us a message and we'll get back to you as soon as possible.
          </Text>

          <Input
            label="Subject"
            value={subject}
            onChangeText={setSubject}
            placeholder="What do you need help with?"
            error={errors.subject}
          />

          <Input
            label="Message"
            value={message}
            onChangeText={setMessage}
            placeholder="Describe your issue or question in detail"
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            error={errors.message}
          />

          <Button
            title="Send Message"
            onPress={handleSubmit}
            style={styles.submitButton}
            leftIcon={<MessageCircle size={20} color="#FFFFFF" />}
          />
        </View>

        <View style={styles.faqSection}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          
          {faqs.map((faq, index) => (
            <Card
              key={index}
              variant="outlined"
              style={[
                styles.faqCard,
                expandedFaq === index && styles.expandedFaqCard,
              ]}
            >
              <TouchableOpacity
                style={styles.faqQuestion}
                onPress={() => toggleFaq(index)}
              >
                <Text style={styles.faqQuestionText}>{faq.question}</Text>
                {expandedFaq === index ? (
                  <ChevronUp size={20} color="#6B7280" />
                ) : (
                  <ChevronDown size={20} color="#6B7280" />
                )}
              </TouchableOpacity>
              
              {expandedFaq === index && (
                <View style={styles.faqAnswer}>
                  <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                </View>
              )}
            </Card>
          ))}
        </View>

        <View style={styles.otherContactSection}>
          <Text style={styles.sectionTitle}>Other Ways to Reach Us</Text>
          
          <Card variant="outlined" style={styles.contactCard}>
            <View style={styles.contactItem}>
              <View style={styles.contactIconContainer}>
                <Mail size={20} color="#4F46E5" />
              </View>
              <View>
                <Text style={styles.contactLabel}>Email</Text>
                <Text style={styles.contactValue}>support@roomies.com</Text>
              </View>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.contactItem}>
              <View style={styles.contactIconContainer}>
                <Phone size={20} color="#4F46E5" />
              </View>
              <View>
                <Text style={styles.contactLabel}>Phone</Text>
                <Text style={styles.contactValue}>+1 (800) 123-4567</Text>
              </View>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.contactItem}>
              <View style={styles.contactIconContainer}>
                <Globe size={20} color="#4F46E5" />
              </View>
              <View>
                <Text style={styles.contactLabel}>Website</Text>
                <Text style={styles.contactValue}>www.roomies.com/help</Text>
              </View>
            </View>
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
  sectionTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
    color: '#1F2937',
    marginBottom: 12,
  },
  sectionDescription: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  contactSection: {
    marginBottom: 32,
  },
  submitButton: {
    marginTop: 16,
  },
  faqSection: {
    marginBottom: 32,
  },
  faqCard: {
    marginBottom: 12,
  },
  expandedFaqCard: {
    borderColor: '#4F46E5',
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  faqQuestionText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: '#1F2937',
    flex: 1,
    marginRight: 16,
  },
  faqAnswer: {
    padding: 16,
    paddingTop: 0,
    backgroundColor: '#F9FAFB',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  faqAnswerText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
  },
  otherContactSection: {
    marginBottom: 40,
  },
  contactCard: {
    padding: 0,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  contactIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#4B5563',
  },
  contactValue: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#1F2937',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
});

export default SupportScreen;
