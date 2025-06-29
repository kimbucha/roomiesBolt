import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Amenity, Rule } from '../../types/places';
import { 
  Check, 
  Wifi, 
  DoorClosed, 
  Coffee, 
  UtensilsCrossed, 
  Home, 
  ShowerHead, 
  Car, 
  Dumbbell, 
  Tv, 
  Waves, 
  AirVent, 
  Footprints, 
  Shirt, 
  Flame,
  Sailboat,
  Dog,
  Cat,
  Trees,
  Lock,
  Bike,
  Package,
  Lightbulb,
  Flower,
  Trash,
  BadgeCheck
} from 'lucide-react-native';

interface TabbedContentProps {
  description: string;
  amenities: Amenity[];
  rules: Rule[];
}

export const TabbedContent: React.FC<TabbedContentProps> = ({
  description,
  amenities,
  rules,
}) => {
  const [activeTab, setActiveTab] = useState<'description' | 'amenities' | 'rules'>('description');

  const renderAmenityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      // Internet & Technology
      case 'wifi':
      case 'internet':
      case 'high-speed internet':
        return <Wifi size={20} color="#4F46E5" />;
      case 'tv':
      case 'television':
      case 'smart tv':
        return <Tv size={20} color="#4F46E5" />;

      // Entry & Security
      case 'private entrance':
      case 'entry':
      case 'door':
        return <DoorClosed size={20} color="#4F46E5" />;
      case 'security':
      case 'security system':
      case 'secure':
        return <Lock size={20} color="#4F46E5" />;
      case 'package':
      case 'package delivery':
      case 'package service':
        return <Package size={20} color="#4F46E5" />;

      // Kitchen & Dining
      case 'kitchen':
      case 'full kitchen':
      case 'kitchenette':
        return <UtensilsCrossed size={20} color="#4F46E5" />;
      case 'coffee':
      case 'coffee maker':
      case 'espresso':
        return <Coffee size={20} color="#4F46E5" />;

      // Bathroom & Facilities
      case 'bathroom':
      case 'private bathroom':
      case 'shared bathroom':
        return <ShowerHead size={20} color="#4F46E5" />;
      case 'washer':
      case 'dryer':
      case 'washer/dryer':
      case 'laundry':
        return <Shirt size={20} color="#4F46E5" />;

      // Parking & Transportation
      case 'parking':
      case 'private parking':
      case 'garage':
        return <Car size={20} color="#4F46E5" />;
      case 'bike':
      case 'bike storage':
      case 'bicycle':
        return <Bike size={20} color="#4F46E5" />;

      // Amenities & Recreation
      case 'gym':
      case 'fitness center':
      case 'workout room':
        return <Dumbbell size={20} color="#4F46E5" />;
      case 'pool':
      case 'swimming pool':
      case 'shared pool':
        return <Waves size={20} color="#4F46E5" />;
      case 'heating':
      case 'heat':
        return <Flame size={20} color="#4F46E5" />;
      case 'ac':
      case 'air conditioning':
      case 'cooling':
        return <AirVent size={20} color="#4F46E5" />;

      // Outdoor Spaces
      case 'patio':
      case 'balcony':
      case 'backyard':
      case 'yard':
      case 'garden':
        return <Flower size={20} color="#4F46E5" />;
      case 'walking trails':
      case 'walking path':
      case 'trails':
        return <Footprints size={20} color="#4F46E5" />;
      case 'water access':
      case 'beach access':
      case 'lake access':
        return <Sailboat size={20} color="#4F46E5" />;
      case 'park':
      case 'nature':
      case 'outdoor space':
        return <Trees size={20} color="#4F46E5" />;

      // Pets & Animals
      case 'pet friendly':
      case 'pets allowed':
      case 'dog friendly':
        return <Dog size={20} color="#4F46E5" />;
      case 'cat friendly':
      case 'cats allowed':
        return <Cat size={20} color="#4F46E5" />;

      // Building Amenities
      case 'elevator':
      case 'lift':
        return <Trash size={20} color="#4F46E5" />;
      case 'utilities included':
      case 'utilities':
      case 'electricity':
        return <Lightbulb size={20} color="#4F46E5" />;
      case 'cleaning service':
      case 'housekeeping':
        return <BadgeCheck size={20} color="#4F46E5" />;

      // Default
      default:
        return <Home size={20} color="#4F46E5" />;
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'description':
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.descriptionText}>{description}</Text>
          </View>
        );
      case 'amenities':
        return (
          <View style={styles.contentContainer}>
            <View style={styles.amenitiesContainer}>
              {amenities.map((amenity, index) => (
                <View key={index} style={styles.amenityItem}>
                  <View style={styles.amenityIcon}>
                    {renderAmenityIcon(amenity.type)}
                  </View>
                  <View style={styles.amenityTextContainer}>
                    <Text style={styles.amenityTitle}>{amenity.title}</Text>
                    {amenity.description && (
                      <Text style={styles.amenityDescription}>{amenity.description}</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>
        );
      case 'rules':
        return (
          <View style={styles.contentContainer}>
            <View style={styles.rulesContainer}>
              {rules.map((rule, index) => (
                <View key={index} style={styles.ruleItem}>
                  {rule.allowed ? (
                    <Check size={20} color="#10B981" />
                  ) : (
                    <View style={styles.notAllowedIcon}>
                      <Text style={styles.notAllowedText}>×</Text>
                    </View>
                  )}
                  <View style={styles.ruleTextContainer}>
                    <Text style={styles.ruleTitle}>{rule.title}</Text>
                    {rule.description && (
                      <Text style={styles.ruleDescription}>{rule.description}</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'description' && styles.activeTabButton]}
          onPress={() => setActiveTab('description')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'description' && styles.activeTabText]}>
            Description
          </Text>
          {activeTab === 'description' && <View style={styles.activeIndicator} />}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'amenities' && styles.activeTabButton]}
          onPress={() => setActiveTab('amenities')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'amenities' && styles.activeTabText]}>
            Amenities
          </Text>
          {activeTab === 'amenities' && <View style={styles.activeIndicator} />}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'rules' && styles.activeTabButton]}
          onPress={() => setActiveTab('rules')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'rules' && styles.activeTabText]}>
            Rules
          </Text>
          {activeTab === 'rules' && <View style={styles.activeIndicator} />}
        </TouchableOpacity>
      </View>
      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {renderContent()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    overflow: 'hidden',
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    position: 'relative',
  },
  activeTabButton: {
    backgroundColor: '#F9FAFB',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#4F46E5',
    fontWeight: '700',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '20%',
    right: '20%',
    height: 3,
    backgroundColor: '#4F46E5',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  scrollContainer: {
    maxHeight: 400,
  },
  contentContainer: {
    padding: 20,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
  },
  amenitiesContainer: {
    marginTop: 4,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  amenityIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F3FF',
    borderRadius: 8,
    marginRight: 16,
  },
  amenityTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  amenityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  amenityDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  rulesContainer: {
    marginTop: 4,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  notAllowedIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notAllowedText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  ruleTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  ruleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  ruleDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
});

export default TabbedContent; 