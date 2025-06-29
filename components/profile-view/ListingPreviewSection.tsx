import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import ProfileSection from './ProfileSection';
import { Home, Bed, Bath, DollarSign, ArrowRight } from 'lucide-react-native';
import type { User } from '../../store/userStore'; 

interface ListingPreviewSectionProps {
  userProfile: User | null;
  onViewListing: () => void;
}

const ListingPreviewSection: React.FC<ListingPreviewSectionProps> = ({ userProfile, onViewListing }) => {
  // Render only if user is not just a seeker and has place details
  if (!userProfile || userProfile.userRole === 'roommate_seeker' || !userProfile.placeDetails) {
    return null;
  }

  const { name, placeDetails } = userProfile;

  return (
    <ProfileSection title={`${name?.split(' ')[0]}'s Place`}>
      <View style={styles.listingDetailsContainer}>
         {/* Room Type */}
         {placeDetails.roomType && (
            <View style={styles.listingDetailRow}>
                <Home size={18} color="#64748B" />
                <Text style={styles.listingDetailText}>{placeDetails.roomType}</Text>
            </View>
         )}
         {/* Rent */}
         {placeDetails.rent !== undefined && placeDetails.rent !== null && (
             <View style={styles.listingDetailRow}>
                <DollarSign size={18} color="#64748B" />
                <Text style={styles.listingDetailText}>{`$${placeDetails.rent}/month`}</Text>
             </View>
         )}
         {/* Beds & Baths */}
         {(placeDetails.bedrooms || placeDetails.bathrooms) && (
             <View style={styles.listingDetailRow}>
               {placeDetails.bedrooms && <Bed size={18} color="#64748B" />} 
               {placeDetails.bedrooms && <Text style={styles.listingDetailText}>{placeDetails.bedrooms} Bed</Text>}
               {placeDetails.bedrooms && placeDetails.bathrooms && <Text style={{ color: '#64748B', marginHorizontal: 5 }}>·</Text>}
               {placeDetails.bathrooms && <Bath size={18} color="#64748B" />} 
               {placeDetails.bathrooms && <Text style={styles.listingDetailText}>{placeDetails.bathrooms} Bath</Text>}
             </View>
         )}
         {/* Optionally add address snippet or amenities summary here */} 
      </View>

      {/* View Listing Button */}
      <TouchableOpacity 
         style={styles.viewListingButton}
         onPress={onViewListing}
      >
        <Text style={styles.viewListingButtonText}>View Listing Details</Text>
        <ArrowRight size={18} color="#FFFFFF" />
      </TouchableOpacity>
    </ProfileSection>
  );
};

// Copy relevant styles from UserProfileScreen.styles
const styles = StyleSheet.create({
    listingDetailsContainer: {
        marginBottom: 20,
        paddingHorizontal: 20, // Add horizontal padding
      },
      listingDetailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
      },
      listingDetailText: {
        fontSize: 15,
        color: '#475569',
        marginLeft: 10,
      },
      viewListingButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#4F46E5',
        paddingVertical: 14,
        borderRadius: 12,
        marginTop: 10,
        marginHorizontal: 20, // Add horizontal margin to align button within section padding
      },
      viewListingButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginRight: 8,
      },
});

export default ListingPreviewSection; 