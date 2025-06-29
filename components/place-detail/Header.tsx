import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ArrowLeft, Share2, Flag, Heart } from 'lucide-react-native';

interface HeaderProps {
  title: string;
  onBack: () => void;
  onShare: () => void;
  onReport: () => void;
  isSaved: boolean;
  onToggleSave: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  onBack,
  onShare,
  onReport,
  isSaved,
  onToggleSave
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <ArrowLeft size={24} color="#1F2937" />
      </TouchableOpacity>
      
      <Text style={styles.title} numberOfLines={1}>{title}</Text>
      
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={onShare}>
          <Share2 size={20} color="#1F2937" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={onToggleSave}>
          <Heart 
            size={20} 
            color="#4F46E5" 
            fill={isSaved ? "#4F46E5" : "transparent"} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={onReport}>
          <Flag size={20} color="#1F2937" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    padding: 10,
    marginRight: 8,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 10,
    marginLeft: 10,
  }
});

export default Header; 