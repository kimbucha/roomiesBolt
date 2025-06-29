import React, { ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface EditProfileSectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
  showTips?: boolean;
  tips?: string[];
}

interface SectionFieldProps {
  children: ReactNode;
  spacing?: 'small' | 'medium' | 'large';
}

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  tip?: string;
}

interface SectionFooterProps {
  children: ReactNode;
  alignment?: 'left' | 'center' | 'right' | 'space-between';
}

// Main Section Wrapper
export const EditProfileSection: React.FC<EditProfileSectionProps> = ({
  title,
  description,
  children,
  showTips = false,
  tips = []
}) => {
  return (
    <View style={styles.sectionContent}>
      {title && <Text style={styles.sectionTitle}>{title}</Text>}
      {description && <Text style={styles.sectionDescription}>{description}</Text>}
      
      <View style={styles.formSection}>
        {children}
      </View>
      
      {showTips && tips.length > 0 && (
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsHeader}>💡 Tips:</Text>
          {tips.map((tip, index) => (
            <Text key={index} style={styles.tipText}>• {tip}</Text>
          ))}
        </View>
      )}
    </View>
  );
};

// Field Container with consistent spacing
export const SectionField: React.FC<SectionFieldProps> = ({
  children,
  spacing = 'medium'
}) => {
  const spacingStyle = {
    small: styles.fieldSpacingSmall,
    medium: styles.fieldSpacingMedium,
    large: styles.fieldSpacingLarge,
  }[spacing];

  return (
    <View style={[styles.fieldContainer, spacingStyle]}>
      {children}
    </View>
  );
};

// Reusable Section Header
export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  tip
}) => {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>{title}</Text>
        {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
      </View>
      {tip && (
        <View style={styles.tipContainer}>
          <Text style={styles.tipText}>💡 {tip}</Text>
        </View>
      )}
    </View>
  );
};

// Reusable Section Footer
export const SectionFooter: React.FC<SectionFooterProps> = ({
  children,
  alignment = 'space-between'
}) => {
  const alignmentStyle = {
    left: { justifyContent: 'flex-start' as const },
    center: { justifyContent: 'center' as const },
    right: { justifyContent: 'flex-end' as const },
    'space-between': { justifyContent: 'space-between' as const },
  }[alignment];

  return (
    <View style={[styles.footerContainer, alignmentStyle]}>
      {children}
    </View>
  );
};

// Character Counter Component
interface CharacterCounterProps {
  current: number;
  max: number;
  warningThreshold?: number;
}

export const CharacterCounter: React.FC<CharacterCounterProps> = ({
  current,
  max,
  warningThreshold = 0.8
}) => {
  const percentage = current / max;
  const isWarning = percentage >= warningThreshold;
  const isOverLimit = current > max;

  return (
    <Text style={[
      styles.characterCount,
      isWarning && styles.characterCountWarning,
      isOverLimit && styles.characterCountError
    ]}>
      {current}/{max} characters
    </Text>
  );
};

// Hint Text Component
interface HintTextProps {
  text: string;
  type?: 'info' | 'warning' | 'success';
  show?: boolean;
}

export const HintText: React.FC<HintTextProps> = ({
  text,
  type = 'info',
  show = true
}) => {
  if (!show) return null;

  const typeStyle = {
    info: styles.hintInfo,
    warning: styles.hintWarning,
    success: styles.hintSuccess,
  }[type];

  return (
    <View style={styles.hintContainer}>
      <Text style={[styles.hintText, typeStyle]}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    fontFamily: 'Poppins-Bold',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
    marginBottom: 24,
    lineHeight: 20,
  },
  formSection: {
    gap: 20,
  },
  
  // Field Container Styles
  fieldContainer: {
    width: '100%',
  },
  fieldSpacingSmall: {
    marginBottom: 12,
  },
  fieldSpacingMedium: {
    marginBottom: 16,
  },
  fieldSpacingLarge: {
    marginBottom: 24,
  },
  
  // Header Styles
  headerContainer: {
    marginBottom: 16,
  },
  headerContent: {
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
  },
  
  // Tip Styles
  tipContainer: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
    marginTop: 8,
  },
  tipText: {
    fontSize: 12,
    color: '#92400E',
    fontFamily: 'Poppins-Regular',
    lineHeight: 16,
  },
  
  // Tips Container
  tipsContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  tipsHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4338CA',
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 8,
  },
  
  // Footer Styles
  footerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    minHeight: 20,
  },
  
  // Character Counter
  characterCount: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
  },
  characterCountWarning: {
    color: '#F59E0B',
  },
  characterCountError: {
    color: '#EF4444',
  },
  
  // Hint Text
  hintContainer: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#FEF3C7',
  },
  hintText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    lineHeight: 16,
  },
  hintInfo: {
    color: '#1F2937',
  },
  hintWarning: {
    color: '#92400E',
  },
  hintSuccess: {
    color: '#065F46',
  },
}); 