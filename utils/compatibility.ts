import { UserProfile } from '@/lib/database';

// MBTI compatibility matrix - more comprehensive scoring
const MBTI_COMPATIBILITY: { [key: string]: { [key: string]: number } } = {
  'INTJ': { 'ENFP': 95, 'ENTP': 90, 'INFJ': 85, 'INFP': 80, 'ENTJ': 75, 'INTP': 70 },
  'INTP': { 'ENFJ': 95, 'ENTJ': 90, 'INFJ': 85, 'ENFP': 80, 'INTJ': 75, 'ENTP': 70 },
  'ENTJ': { 'INFP': 95, 'INTP': 90, 'ENFP': 85, 'INTJ': 80, 'ENFJ': 75, 'ENTP': 70 },
  'ENTP': { 'INFJ': 95, 'INTJ': 90, 'ENFJ': 85, 'ISFJ': 80, 'INTP': 75, 'ENFP': 70 },
  'INFJ': { 'ENTP': 95, 'ENFP': 90, 'INTJ': 85, 'INTP': 80, 'ENFJ': 75, 'INFP': 70 },
  'INFP': { 'ENTJ': 95, 'ENFJ': 90, 'INTJ': 85, 'ENTP': 80, 'INFJ': 75, 'ISFJ': 70 },
  'ENFJ': { 'INTP': 95, 'INFP': 90, 'ENTP': 85, 'INTJ': 80, 'INFJ': 75, 'ENFP': 70 },
  'ENFP': { 'INTJ': 95, 'INFJ': 90, 'ENTJ': 85, 'INTP': 80, 'ENFJ': 75, 'ENTP': 70 },
  'ISTJ': { 'ESFP': 85, 'ESTP': 80, 'ISFP': 75, 'ENFP': 70, 'ESTJ': 65, 'ISFJ': 60 },
  'ISFJ': { 'ESTP': 85, 'ESFP': 80, 'ENTP': 75, 'ENFP': 70, 'INFP': 65, 'ISTJ': 60 },
  'ESTJ': { 'ISFP': 85, 'ISTP': 80, 'INFP': 75, 'ENFP': 70, 'ISTJ': 65, 'ESFJ': 60 },
  'ESFJ': { 'ISTP': 85, 'ISFP': 80, 'INFP': 75, 'INTP': 70, 'ISFJ': 65, 'ESTJ': 60 },
  'ISTP': { 'ESFJ': 85, 'ESTJ': 80, 'ENFJ': 75, 'ESFP': 70, 'ISFP': 65, 'ESTP': 60 },
  'ISFP': { 'ESTJ': 85, 'ESFJ': 80, 'ENFJ': 75, 'ENTJ': 70, 'ISTP': 65, 'ESFP': 60 },
  'ESTP': { 'ISFJ': 85, 'ISTJ': 80, 'INFJ': 75, 'ISFP': 70, 'ESFP': 65, 'ISTP': 60 },
  'ESFP': { 'ISTJ': 85, 'ISFJ': 80, 'INTJ': 75, 'ISTP': 70, 'ESTP': 65, 'ISFP': 60 }
};

export function calculateCompatibility(user1: UserProfile, user2: UserProfile): number {
  let totalScore = 0;
  let weightSum = 0;

  // IQ similarity (25% weight) - closer scores = higher compatibility
  if (user1.iq_score > 0 && user2.iq_score > 0) {
    const iqDiff = Math.abs(user1.iq_score - user2.iq_score);
    const iqScore = Math.max(0, 100 - (iqDiff / 2)); // Max 50 point difference for 0 score
    totalScore += iqScore * 0.25;
    weightSum += 0.25;
  }

  // EQ similarity (25% weight) - closer scores = higher compatibility
  if (user1.eq_score > 0 && user2.eq_score > 0) {
    const eqDiff = Math.abs(user1.eq_score - user2.eq_score);
    const eqScore = Math.max(0, 100 - (eqDiff / 2)); // Max 50 point difference for 0 score
    totalScore += eqScore * 0.25;
    weightSum += 0.25;
  }

  // MBTI compatibility (30% weight) - use compatibility matrix
  if (user1.mbti_type && user2.mbti_type) {
    const mbtiScore = MBTI_COMPATIBILITY[user1.mbti_type]?.[user2.mbti_type] || 
                     MBTI_COMPATIBILITY[user2.mbti_type]?.[user1.mbti_type] || 
                     60; // Default compatibility for unknown combinations
    totalScore += mbtiScore * 0.30;
    weightSum += 0.30;
  }

  // Intent alignment (20% weight) - must match for dating apps
  if (user1.intent && user2.intent) {
    if (user1.intent === user2.intent) {
      totalScore += 100 * 0.20;
    } else {
      totalScore += 30 * 0.20; // Partial score for mismatched intent
    }
    weightSum += 0.20;
  }

  // Ensure we have a valid weight sum
  if (weightSum === 0) return 50; // Default score if no data

  const finalScore = Math.round(totalScore / weightSum);
  return Math.max(10, Math.min(99, finalScore)); // Clamp between 10-99%
}