import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, ChevronDown, ChevronUp, Search } from 'lucide-react-native';
import { Input } from '../components';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  {
    id: '1',
    question: 'How do I create a profile?',
    answer: 'To create a profile, sign up with your email or social media account, then follow the onboarding steps to add your photos, preferences, and roommate requirements.',
    category: 'Account',
  },
  {
    id: '2',
    question: 'How does matching work?',
    answer: 'Our matching algorithm considers your preferences, lifestyle habits, budget, and location to suggest compatible roommates. Swipe right on profiles you like, and if they also swipe right on you, it\'s a match!',
    category: 'Matching',
  },
  {
    id: '3',
    question: 'What are the benefits of Premium?',
    answer: 'Premium members enjoy unlimited matches, advanced filters, priority matching, and read receipts. You\'ll also get shown to more potential roommates, increasing your chances of finding the perfect match.',
    category: 'Premium',
  },
  {
    id: '4',
    question: 'How do I cancel my Premium subscription?',
    answer: 'To cancel your Premium subscription, go to Settings > Premium > Manage Subscription. Follow the prompts to cancel. Your Premium benefits will continue until the end of your current billing period.',
    category: 'Premium',
  },
  {
    id: '5',
    question: 'Is my personal information safe?',
    answer: 'Yes, we take your privacy seriously. We use industry-standard encryption to protect your data and never share your personal information with other users without your consent. You can control your privacy settings in the app.',
    category: 'Privacy',
  },
  {
    id: '6',
    question: 'How do I report inappropriate behavior?',
    answer: 'If you encounter inappropriate behavior, tap the three dots on the user\'s profile or in your conversation with them, then select "Report". Provide details about the issue, and our team will review it promptly.',
    category: 'Safety',
  },
  {
    id: '7',
    question: 'Can I block someone?',
    answer: 'Yes, you can block users by going to their profile, tapping the three dots, and selecting "Block". You can manage your blocked users list in Settings > Privacy > Blocked Users.',
    category: 'Privacy',
  },
  {
    id: '8',
    question: 'How do I delete my account?',
    answer: 'To delete your account, go to Settings > Account > Delete Account. Note that this action is permanent and will remove all your data from our system.',
    category: 'Account',
  },
  {
    id: '9',
    question: 'What should I do if I find a bug?',
    answer: 'If you encounter a bug, please go to Settings > Support > Report a Bug. Provide as much detail as possible, including steps to reproduce the issue, to help our team fix it quickly.',
    category: 'Support',
  },
  {
    id: '10',
    question: 'How do I update my preferences?',
    answer: 'To update your preferences, go to your Profile and tap "Edit". You can modify your roommate preferences, lifestyle habits, budget range, and location preferences at any time.',
    category: 'Account',
  },
];

interface FAQItemProps {
  item: FAQItem;
  isExpanded: boolean;
  onToggle: () => void;
}

const FAQItemComponent = ({ item, isExpanded, onToggle }: FAQItemProps) => (
  <View style={styles.faqItem}>
    <TouchableOpacity 
      style={styles.faqQuestion}
      onPress={onToggle}
    >
      <Text style={styles.faqQuestionText}>{item.question}</Text>
      {isExpanded ? (
        <ChevronUp size={20} color="#4B5563" />
      ) : (
        <ChevronDown size={20} color="#4B5563" />
      )}
    </TouchableOpacity>
    
    {isExpanded && (
      <View style={styles.faqAnswer}>
        <Text style={styles.faqAnswerText}>{item.answer}</Text>
      </View>
    )}
  </View>
);

export default function HelpScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  const categories = Array.from(new Set(faqs.map(faq => faq.category)));
  
  const toggleItem = (id: string) => {
    if (expandedItems.includes(id)) {
      setExpandedItems(expandedItems.filter(item => item !== id));
    } else {
      setExpandedItems([...expandedItems, id]);
    }
  };
  
  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = activeCategory === null || faq.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help Center</Text>
        <View style={styles.headerRight} />
      </View>
      
      <View style={styles.searchContainer}>
        <Input
          placeholder="Search for help"
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon={<Search size={20} color="#9CA3AF" />}
          containerStyle={styles.searchInput}
        />
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
        <TouchableOpacity
          style={[
            styles.categoryButton,
            activeCategory === null && styles.activeCategoryButton,
          ]}
          onPress={() => setActiveCategory(null)}
        >
          <Text style={[
            styles.categoryText,
            activeCategory === null && styles.activeCategoryText,
          ]}>
            All
          </Text>
        </TouchableOpacity>
        
        {categories.map(category => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              activeCategory === category && styles.activeCategoryButton,
            ]}
            onPress={() => setActiveCategory(category)}
          >
            <Text style={[
              styles.categoryText,
              activeCategory === category && styles.activeCategoryText,
            ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {filteredFaqs.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No results found</Text>
            <Text style={styles.emptyStateText}>
              Try searching with different keywords or browse by category
            </Text>
          </View>
        ) : (
          filteredFaqs.map(faq => (
            <FAQItemComponent
              key={faq.id}
              item={faq}
              isExpanded={expandedItems.includes(faq.id)}
              onToggle={() => toggleItem(faq.id)}
            />
          ))
        )}
        
        <View style={styles.contactSupport}>
          <Text style={styles.contactSupportTitle}>Still need help?</Text>
          <Text style={styles.contactSupportText}>
            If you couldn't find the answer you were looking for, our support team is here to help.
          </Text>
          <TouchableOpacity
            style={styles.contactSupportButton}
            onPress={() => router.push('/support')}
          >
            <Text style={styles.contactSupportButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
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
  searchContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  searchInput: {
    marginBottom: 0,
  },
  categoriesContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
    backgroundColor: '#F3F4F6',
  },
  activeCategoryButton: {
    backgroundColor: '#4F46E5',
  },
  categoryText: {
    fontSize: 14,
    color: '#4B5563',
    fontFamily: 'Poppins-Medium',
  },
  activeCategoryText: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  faqItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  faqQuestionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
    fontFamily: 'Poppins-SemiBold',
  },
  faqAnswer: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  faqAnswerText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
    fontFamily: 'Poppins-Regular',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    fontFamily: 'Poppins-Bold',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
  },
  contactSupport: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
    alignItems: 'center',
  },
  contactSupportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    fontFamily: 'Poppins-Bold',
  },
  contactSupportText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'Poppins-Regular',
  },
  contactSupportButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  contactSupportButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Poppins-SemiBold',
  },
});
