import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Easing, ScrollView } from 'react-native';
import Slider from '@react-native-community/slider';
import { TouchableOpacity } from 'react-native';
import StepProgressIndicator from '../../../../components/features/onboarding/place-listing/StepProgressIndicator';
import { logOnboardingInputChange, logOnboardingStepComplete, logOnboardingStepEntry } from '../../../../utils/onboardingDebugUtils';

type Question = {
  id: string;
  text: string;
  leftLabel: string;
  rightLabel: string;
};

// Group questions by personality dimension
const eiQuestions: Question[] = [
  {
    id: 'ei1',
    text: 'After a long day, I prefer to:',
    leftLabel: 'Spend time with friends',
    rightLabel: 'Have quiet time alone',
  },
  {
    id: 'ei2',
    text: 'When living with others, I:',
    leftLabel: 'Enjoy shared activities',
    rightLabel: 'Need my personal space',
  },
  {
    id: 'ei3',
    text: 'In social situations, I typically:',
    leftLabel: 'Feel energized',
    rightLabel: 'Feel drained',
  }
];

const snQuestions: Question[] = [
  {
    id: 'sn1',
    text: "When tackling a household issue (e.g., a leaky faucet), I tend to:",
    leftLabel: "Focus on the immediate, practical fix",
    rightLabel: "Think about the underlying cause or long-term solutions",
  },
  {
    id: 'sn2',
    text: "When getting to know a new roommate, I pay more attention to:",
    leftLabel: "Their specific habits and past experiences",
    rightLabel: "Their potential for future friendship and shared interests",
  },
  {
    id: 'sn3',
    text: "I prefer my living environment to be:",
    leftLabel: "Practical & Functional",
    rightLabel: "Inspiring & Adaptable",
  }
];

const tfQuestions: Question[] = [
  {
    id: 'tf1',
    text: 'When resolving conflicts with roommates, I prioritize:',
    leftLabel: 'Logic and fairness',
    rightLabel: 'Harmony and feelings',
  },
  {
    id: 'tf2',
    text: 'When making household decisions, I tend to:',
    leftLabel: 'Analyze pros and cons',
    rightLabel: 'Consider everyone\'s needs',
  },
  {
    id: 'tf3',
    text: 'I prefer a living environment that is:',
    leftLabel: 'Organized by clear rules',
    rightLabel: 'Supportive and comfortable',
  }
];

const jpQuestions: Question[] = [
  {
    id: 'jp1',
    text: 'When it comes to household chores, I prefer:',
    leftLabel: 'Scheduled routines',
    rightLabel: 'Flexible approach',
  },
  {
    id: 'jp2',
    text: 'My living space is typically:',
    leftLabel: 'Neat and organized',
    rightLabel: 'Adaptable and casual',
  },
  {
    id: 'jp3',
    text: 'I prefer roommates who:',
    leftLabel: 'Plan activities in advance',
    rightLabel: 'Are spontaneous',
  }
];

// Define the personality dimensions in order
const personalityDimensions = [
  { key: 'ei', questions: eiQuestions, title: "Your Social Energy", subtitle: "How do you interact with others and recharge?" },
  { key: 'sn', questions: snQuestions, title: "Your Thinking Style", subtitle: "How do you process information and see the world?" },
  { key: 'tf', questions: tfQuestions, title: "Your Decision Making", subtitle: "How do you make decisions and resolve conflicts?" },
  { key: 'jp', questions: jpQuestions, title: "Your Lifestyle Approach", subtitle: "How do you organize your life and living space?" }
];

interface PersonalityStepProps {
  userData: {
    personalityDimensions?: {
      ei: number;
      sn: number;
      tf: number;
      jp: number;
    };
    personalityType?: string;
  };
  onContinue: (data: any) => void;
}

export default function PersonalityStep({ userData, onContinue }: PersonalityStepProps) {
  // State for all answers
  const [answers, setAnswers] = useState<Record<string, number>>({
    ei1: 50, ei2: 50, ei3: 50,
    sn1: 50, sn2: 50, sn3: 50,
    tf1: 50, tf2: 50, tf3: 50,
    jp1: 50, jp2: 50, jp3: 50
  });
  
  // Current dimension index (0-3 for ei, sn, tf, jp)
  const [currentDimensionIndex, setCurrentDimensionIndex] = useState(0);
  
  // Log entry to personality step
  useEffect(() => {
    logOnboardingStepEntry('personality', {
      initialAnswers: answers,
      initialDimension: personalityDimensions[0].key, // Always start with first dimension
      userData: userData
    });
  }, []);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  
  const handleSliderChange = (questionId: string, value: number) => {
    // Get the dimension key from the question ID (first 2 characters)
    const dimensionKey = questionId.substring(0, 2);
    
    // Find which question this is within its dimension
    const dimension = personalityDimensions.find(d => d.key === dimensionKey);
    const question = dimension?.questions.find(q => q.id === questionId);
    
    // Log the slider change
    logOnboardingInputChange('personality', questionId, {
      value,
      questionText: question?.text,
      dimensionKey,
      leftLabel: question?.leftLabel,
      rightLabel: question?.rightLabel
    });
    
    setAnswers(prev => {
      const updated = {
        ...prev,
        [questionId]: value,
      };
      return updated;
    });
  };
  
  // Check if all questions in current dimension are answered
  const areAllCurrentQuestionsAnswered = () => {
    const currentQuestions = personalityDimensions[currentDimensionIndex].questions;
    return currentQuestions.every(q => answers[q.id] !== undefined);
  };
  
  // Move to next dimension
  const goToNextDimension = () => {
    // Log completion of current dimension
    const currentDimension = personalityDimensions[currentDimensionIndex];
    const currentDimensionKey = currentDimension.key;
    const currentQuestionIds = currentDimension.questions.map(q => q.id);
    const currentAnswers = Object.fromEntries(
      Object.entries(answers).filter(([key]) => currentQuestionIds.includes(key))
    );
    
    logOnboardingInputChange('personality', 'dimensionComplete', {
      dimension: currentDimensionKey,
      dimensionTitle: currentDimension.title,
      answers: currentAnswers,
      nextDimension: currentDimensionIndex < personalityDimensions.length - 1 ? 
        personalityDimensions[currentDimensionIndex + 1].key : 'complete'
    });
    
    if (currentDimensionIndex < personalityDimensions.length - 1) {
      // Fade out current dimension
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        // Move to next dimension
        setCurrentDimensionIndex(currentDimensionIndex + 1);
        
        // Log navigation to next dimension
        logOnboardingInputChange('personality', 'dimensionChange', {
          from: currentDimensionKey,
          to: personalityDimensions[currentDimensionIndex + 1].key,
          progress: (currentDimensionIndex + 1) / personalityDimensions.length
        });
        
        // Fade in next dimension
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    } else {
      // If we're at the last dimension, calculate scores and continue
      calculatePersonalityType();
    }
  };
  
  // Calculate personality type and continue
  const calculatePersonalityType = () => {
    // Calculate average scores for each personality dimension
    const eiScores = [answers.ei1, answers.ei2, answers.ei3];
    const snScores = [answers.sn1, answers.sn2, answers.sn3];
    const tfScores = [answers.tf1, answers.tf2, answers.tf3];
    const jpScores = [answers.jp1, answers.jp2, answers.jp3];
    
    const eiScore = eiScores.reduce((sum, val) => sum + val, 0) / eiScores.length;
    const snScore = snScores.reduce((sum, val) => sum + val, 0) / snScores.length;
    const tfScore = tfScores.reduce((sum, val) => sum + val, 0) / tfScores.length;
    const jpScore = jpScores.reduce((sum, val) => sum + val, 0) / jpScores.length;
    
    // Determine the four-letter type
    const e_i = eiScore < 50 ? 'E' : 'I';
    const s_n = snScore < 50 ? 'S' : 'N';
    const t_f = tfScore < 50 ? 'T' : 'F';
    const j_p = jpScore < 50 ? 'J' : 'P';
    
    const mbtiType = `${e_i}${s_n}${t_f}${j_p}`;
    
    // Log personality results
    const personalityDimensionsResult = {
      ei: eiScore,
      sn: snScore,
      tf: tfScore,
      jp: jpScore
    };
    
    logOnboardingStepComplete('personality', {
      personalityDimensions: personalityDimensionsResult,
      personalityType: mbtiType,
      dimensionScores: {
        ei: { score: eiScore, letter: e_i, rawScores: eiScores },
        sn: { score: snScore, letter: s_n, rawScores: snScores },
        tf: { score: tfScore, letter: t_f, rawScores: tfScores },
        jp: { score: jpScore, letter: j_p, rawScores: jpScores }
      },
      allAnswers: answers
    });
    
    // Pass the updated data back to the parent
    onContinue({
      personalityDimensions: personalityDimensionsResult,
      personalityType: mbtiType
    });
  };
  
  // Get current dimension
  const currentDimension = personalityDimensions[currentDimensionIndex];
  
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StepProgressIndicator
        currentStep={currentDimensionIndex + 1}
        totalSteps={personalityDimensions.length}
        progressCalculation="fraction"
        progressTextFormat={`Part ${currentDimensionIndex + 1} of ${personalityDimensions.length}`}
      />
      
      <Text style={styles.dimensionTitle}>{currentDimension.title}</Text>
      <Text style={styles.dimensionSubtitle}>{currentDimension.subtitle}</Text>
      
      <Animated.View 
        style={[
          styles.questionsContainer,
          { opacity: fadeAnim }
        ]}
      >
        {currentDimension.questions.map((question) => (
          <View key={question.id} style={styles.questionItem}>
            <Text style={styles.questionText}>{question.text}</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              value={answers[question.id] || 50}
              onValueChange={(value) => handleSliderChange(question.id, value)}
              minimumTrackTintColor="#6366F1"
              maximumTrackTintColor="#E5E7EB"
              thumbTintColor="#4F46E5"
            />
            <View style={styles.labelContainer}>
              <Text style={styles.labelText}>{question.leftLabel}</Text>
              <Text style={styles.labelText}>{question.rightLabel}</Text>
            </View>
          </View>
        ))}
        
        <TouchableOpacity
          style={styles.continueButton}
          onPress={goToNextDimension}
        >
          <Text style={styles.continueButtonText}>
            {currentDimensionIndex < personalityDimensions.length - 1 
              ? 'Continue to Next Part' 
              : 'See Your Results'}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  dimensionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  dimensionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
  },
  questionsContainer: {
    flex: 1,
  },
  questionItem: {
    marginBottom: 28,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  questionText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 16,
    lineHeight: 22,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingHorizontal: 4,
  },
  labelText: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
    textAlign: 'center',
  },
  continueButton: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
