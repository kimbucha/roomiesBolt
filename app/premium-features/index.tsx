import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, ScrollView, SafeAreaView } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Star, Shield, Lock, ArrowLeft, Crown, Check, Zap, Filter } from 'lucide-react-native';
import { useMatchesStore } from '../../store/matchesStore';
import { useRoommateStore } from '../../store/roommateStore';

// This file will be moved to app/premium-features/index.tsx
export default function PremiumFeaturesScreen() {
  const router = useRouter();
  const { isPremium, getPendingLikes, setPremiumStatus } = useMatchesStore();
  const { roommates } = useRoommateStore();
  const [pendingLikes, setPendingLikes] = useState<any[]>([]);

  useEffect(() => {
    // Get all pending likes
    const allPendingLikes = getPendingLikes();
    setPendingLikes(allPendingLikes);
  }, []);

  // Get profile by ID
  const getProfileById = (id: string) => {
    return roommates.find(r => r.id === id);
  };

  // Handle premium upgrade
  const handlePremiumUpgrade = () => {
    if (__DEV__) {
      // In development mode, toggle premium status
      setPremiumStatus(!isPremium);
      // Navigate back after toggling
      router.back();
    } else {
      // In production, this would navigate to a payment screen
      // For now, just toggle premium status for demo purposes
      setPremiumStatus(true);
      router.back();
    }
  };

  // Render a person who liked you
  const renderLikeItem = ({ item }: { item: any }) => {
    const profile = getProfileById(item.userId);
    if (!profile) return null;

    // Get first name only
    const firstName = profile.name.split(' ')[0];
    
    // Determine if there's a super like
    const hasSuperLike = item.action === 'superLike';

    return (
      <TouchableOpacity 
        style={styles.profileCard}
        onPress={() => {
          // Navigate to the conversation with this user
          router.push(`/conversation/${item.userId}`);
        }}
        activeOpacity={0.7}
      >
        <View style={styles.profileImageContainer}>
          <Image 
            source={{ uri: profile.image }}
            style={styles.profileImage}
          />
          {hasSuperLike && (
            <View style={styles.superLikeBadge}>
              <Star size={14} color="#FFFFFF" />
            </View>
          )}
        </View>
        <Text style={styles.profileName}>{firstName}</Text>
        <View style={styles.matchBadge}>
          <Text style={styles.matchText}>
            75% Match
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Premium</Text>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Premium Banner */}
          <View style={styles.premiumBanner}>
            <Star size={48} color="#FFB800" style={styles.starIcon} />
            <Text style={styles.premiumTitle}>
              Upgrade to Premium
            </Text>
            <Text style={styles.premiumDescription}>
              Unlock all premium features and find your perfect roommate faster
            </Text>
          </View>

          {/* People Who Like You Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>People Who Like You</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{pendingLikes.length}</Text>
              </View>
            </View>
            
            {pendingLikes.length > 0 ? (
              <FlatList
                data={pendingLikes}
                renderItem={renderLikeItem}
                keyExtractor={(item, index) => `like-${item.userId}-${index}`}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalListContent}
              />
            ) : (
              <View style={styles.emptyLikesContainer}>
                <Text style={styles.emptyLikesText}>
                  No likes yet. Keep swiping to get more visibility!
                </Text>
              </View>
            )}
          </View>

          {/* Premium Features Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Premium Features</Text>
            
            <View style={styles.featureCard}>
              <View style={styles.featureIconContainer}>
                <Zap size={24} color="#FFB800" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Profile Boost</Text>
                <Text style={styles.featureDescription}>
                  Get up to 10x more profile views
                </Text>
              </View>
              {isPremium && <Check size={20} color="#10B981" />}
            </View>

            <View style={styles.featureCard}>
              <View style={styles.featureIconContainer}>
                <Filter size={24} color="#4F46E5" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Advanced Filters</Text>
                <Text style={styles.featureDescription}>
                  Filter by more preferences and interests
                </Text>
              </View>
              {isPremium && <Check size={20} color="#10B981" />}
            </View>

            <View style={styles.featureCard}>
              <View style={styles.featureIconContainer}>
                <Shield size={24} color="#10B981" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Verified Badge</Text>
                <Text style={styles.featureDescription}>
                  Show others that your profile is verified
                </Text>
              </View>
              {isPremium && <Check size={20} color="#10B981" />}
            </View>

            <View style={styles.featureCard}>
              <View style={styles.featureIconContainer}>
                <Star size={24} color="#3B82F6" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Priority Matching</Text>
                <Text style={styles.featureDescription}>
                  Get matched with potential roommates first
                </Text>
              </View>
              {isPremium && <Check size={20} color="#10B981" />}
            </View>
          </View>

          {/* Pricing Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select a Plan</Text>
            
            <View style={styles.pricingCard}>
              <View style={styles.pricingHeader}>
                <Text style={styles.pricingTitle}>1 Month</Text>
                <Text style={styles.pricingAmount}>$9.99</Text>
              </View>
              <TouchableOpacity 
                style={styles.selectButton}
                onPress={handlePremiumUpgrade}
              >
                <Text style={styles.selectButtonText}>Select</Text>
              </TouchableOpacity>
            </View>
            
            <View style={[styles.pricingCard, styles.recommendedCard]}>
              <View style={styles.recommendedBadge}>
                <Text style={styles.recommendedText}>Best Value</Text>
              </View>
              
              <View style={styles.pricingHeader}>
                <Text style={styles.pricingTitle}>6 Months</Text>
                <View style={styles.pricingRow}>
                  <Text style={styles.pricingAmount}>$39.99</Text>
                  <Text style={styles.pricingDiscount}>Save 33%</Text>
                </View>
              </View>
              
              <TouchableOpacity 
                style={[styles.selectButton, styles.recommendedButton]}
                onPress={handlePremiumUpgrade}
              >
                <Text style={styles.selectButtonText}>Select</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.pricingCard}>
              <View style={styles.pricingHeader}>
                <Text style={styles.pricingTitle}>12 Months</Text>
                <View style={styles.pricingRow}>
                  <Text style={styles.pricingAmount}>$69.99</Text>
                  <Text style={styles.pricingDiscount}>Save 42%</Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.selectButton}
                onPress={handlePremiumUpgrade}
              >
                <Text style={styles.selectButtonText}>Select</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <Text style={styles.termsText}>
            All subscriptions renew automatically. Cancel anytime in your account settings.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </>
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
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#1F2937',
  },
  scrollView: {
    flex: 1,
  },
  premiumBanner: {
    paddingTop: 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 4,
    borderBottomColor: '#F3F4F6',
  },
  starIcon: {
    marginBottom: 20,
  },
  premiumTitle: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  premiumDescription: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  section: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  countBadge: {
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  countText: {
    fontSize: 12,
    color: '#4F46E5',
    fontWeight: '600',
  },
  horizontalListContent: {
    paddingRight: 20,
  },
  profileCard: {
    width: 140,
    marginRight: 16,
    alignItems: 'center',
  },
  profileImageContainer: {
    width: 140,
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
    position: 'relative',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  superLikeBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#4F46E5',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  profileName: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#1F2937',
  },
  matchBadge: {
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 4,
  },
  matchText: {
    fontSize: 12,
    color: '#4F46E5',
    fontFamily: 'Poppins-Medium',
  },
  emptyLikesContainer: {
    padding: 20,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyLikesText: {
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    textAlign: 'center',
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#1F2937',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
  },
  pricingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    marginBottom: 16,
    position: 'relative',
  },
  recommendedCard: {
    borderColor: '#4F46E5',
    borderWidth: 2,
  },
  recommendedBadge: {
    position: 'absolute',
    top: -12,
    right: 16,
    backgroundColor: '#4F46E5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  recommendedText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
  },
  pricingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  pricingTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#1F2937',
  },
  pricingRow: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  pricingAmount: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#1F2937',
  },
  pricingDiscount: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#10B981',
    marginTop: 2,
  },
  selectButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recommendedButton: {
    backgroundColor: '#4F46E5',
  },
  selectButtonText: {
    color: '#4B5563',
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
  },
  termsText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
}); 