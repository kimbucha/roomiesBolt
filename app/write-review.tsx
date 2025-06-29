import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Star } from 'lucide-react-native';
import { useReviewStore } from '../store/reviewStore';

export default function WriteReviewScreen() {
  const router = useRouter();
  const { revieweeId } = useLocalSearchParams<{ revieweeId: string }>();
  const addReview = useReviewStore((state) => state.addReview);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    if (!revieweeId || rating < 1) return;
    addReview(revieweeId, rating, comment);
    router.back();
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Write a Review', headerBackTitle: 'Cancel' }} />
      <View style={styles.container}>
        <Text style={styles.label}>Your Rating</Text>
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((value) => (
            <TouchableOpacity key={value} onPress={() => setRating(value)}>
              <Star
                size={32}
                color={value <= rating ? '#FBBF24' : '#D1D5DB'}
                fill={value <= rating ? '#FBBF24' : 'transparent'}
                style={styles.star}
              />
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.label}>Your Review</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Write your review..."
          multiline
          value={comment}
          onChangeText={setComment}
        />
        <TouchableOpacity
          style={[styles.submitButton, rating < 1 && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={rating < 1}
        >
          <Text style={styles.submitText}>Submit</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#FFFFFF' },
  label: { fontSize: 16, fontWeight: '600', marginTop: 16 },
  starsRow: { flexDirection: 'row', marginTop: 8 },
  star: { marginRight: 8 },
  textInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  disabledButton: {
    backgroundColor: '#A5B4FC',
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
