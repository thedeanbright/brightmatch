// Test scoring utilities for IQ and EQ tests
import { TestQuestion } from '@/types/user';

export interface TestResult {
  score: number;
  percentile: number;
  description: string;
}

// IQ Test Scoring (out of 160, based on correct answers)
export function calculateIQScore(answers: number[], questions: TestQuestion[]): TestResult {
  let correctAnswers = 0;
  
  // Count correct answers
  answers.forEach((answer, index) => {
    if (questions[index] && answer === questions[index].correctAnswer) {
      correctAnswers++;
    }
  });
  
  const totalQuestions = questions.length;
  const correctPercentage = correctAnswers / totalQuestions;
  
  // IQ scoring: Base 100, with range 70-160
  // Perfect score (100%) = 160 IQ
  // 80% correct = 140 IQ
  // 60% correct = 120 IQ
  // 40% correct = 100 IQ (average)
  // 20% correct = 85 IQ
  // 0% correct = 70 IQ
  
  let iqScore: number;
  if (correctPercentage >= 0.9) {
    iqScore = 150 + (correctPercentage - 0.9) * 100; // 150-160
  } else if (correctPercentage >= 0.8) {
    iqScore = 140 + (correctPercentage - 0.8) * 100; // 140-150
  } else if (correctPercentage >= 0.6) {
    iqScore = 120 + (correctPercentage - 0.6) * 100; // 120-140
  } else if (correctPercentage >= 0.4) {
    iqScore = 100 + (correctPercentage - 0.4) * 100; // 100-120
  } else if (correctPercentage >= 0.2) {
    iqScore = 85 + (correctPercentage - 0.2) * 75; // 85-100
  } else {
    iqScore = 70 + correctPercentage * 75; // 70-85
  }
  
  iqScore = Math.round(Math.max(70, Math.min(160, iqScore)));
  
  // Calculate percentile (approximate)
  let percentile: number;
  if (iqScore >= 145) percentile = 99;
  else if (iqScore >= 130) percentile = 95;
  else if (iqScore >= 115) percentile = 84;
  else if (iqScore >= 100) percentile = 50;
  else if (iqScore >= 85) percentile = 16;
  else percentile = 5;
  
  // Description based on score
  let description: string;
  if (iqScore >= 145) description = "Exceptionally gifted";
  else if (iqScore >= 130) description = "Highly gifted";
  else if (iqScore >= 115) description = "Above average";
  else if (iqScore >= 100) description = "Average";
  else if (iqScore >= 85) description = "Below average";
  else description = "Significantly below average";
  
  return {
    score: iqScore,
    percentile,
    description
  };
}

// EQ Test Scoring (out of 100, based on weighted responses)
export function calculateEQScore(answers: number[], questions: TestQuestion[]): TestResult {
  let totalScore = 0;
  let maxPossibleScore = 0;
  
  // EQ questions typically have 4 options (0-3 points each)
  // Higher emotional intelligence = higher option index
  answers.forEach((answer, index) => {
    if (questions[index]) {
      // Weight the answers: 0=0pts, 1=1pt, 2=2pts, 3=3pts
      totalScore += answer;
      maxPossibleScore += 3; // Maximum points per question
    }
  });
  
  // Convert to 0-100 scale
  const rawPercentage = totalScore / maxPossibleScore;
  
  // EQ scoring with realistic distribution
  // Most people score between 40-80
  // Exceptional EQ is rare (90+)
  let eqScore: number;
  if (rawPercentage >= 0.9) {
    eqScore = 85 + (rawPercentage - 0.9) * 150; // 85-100
  } else if (rawPercentage >= 0.8) {
    eqScore = 75 + (rawPercentage - 0.8) * 100; // 75-85
  } else if (rawPercentage >= 0.6) {
    eqScore = 60 + (rawPercentage - 0.6) * 75; // 60-75
  } else if (rawPercentage >= 0.4) {
    eqScore = 45 + (rawPercentage - 0.4) * 75; // 45-60
  } else if (rawPercentage >= 0.2) {
    eqScore = 30 + (rawPercentage - 0.2) * 75; // 30-45
  } else {
    eqScore = 15 + rawPercentage * 75; // 15-30
  }
  
  eqScore = Math.round(Math.max(15, Math.min(100, eqScore)));
  
  // Calculate percentile
  let percentile: number;
  if (eqScore >= 90) percentile = 95;
  else if (eqScore >= 80) percentile = 84;
  else if (eqScore >= 70) percentile = 68;
  else if (eqScore >= 60) percentile = 50;
  else if (eqScore >= 50) percentile = 32;
  else if (eqScore >= 40) percentile = 16;
  else percentile = 5;
  
  // Description based on score
  let description: string;
  if (eqScore >= 90) description = "Exceptionally high emotional intelligence";
  else if (eqScore >= 80) description = "High emotional intelligence";
  else if (eqScore >= 70) description = "Above average emotional intelligence";
  else if (eqScore >= 60) description = "Average emotional intelligence";
  else if (eqScore >= 50) description = "Below average emotional intelligence";
  else if (eqScore >= 40) description = "Low emotional intelligence";
  else description = "Very low emotional intelligence";
  
  return {
    score: eqScore,
    percentile,
    description
  };
}

// Validate test answers
export function validateTestAnswers(answers: number[], questions: TestQuestion[]): boolean {
  if (answers.length !== questions.length) {
    return false;
  }
  
  return answers.every((answer, index) => {
    const question = questions[index];
    return question && answer >= 0 && answer < question.options.length;
  });
}

// Get score interpretation
export function getScoreInterpretation(score: number, type: 'iq' | 'eq'): string {
  if (type === 'iq') {
    if (score >= 145) return "Your IQ score indicates exceptional cognitive abilities. You excel at complex problem-solving and abstract reasoning.";
    else if (score >= 130) return "Your IQ score shows highly gifted intellectual abilities. You have strong analytical and reasoning skills.";
    else if (score >= 115) return "Your IQ score is above average, indicating good problem-solving and analytical abilities.";
    else if (score >= 100) return "Your IQ score is in the average range, showing solid cognitive abilities.";
    else if (score >= 85) return "Your IQ score is below average. Consider focusing on developing analytical and reasoning skills.";
    else return "Your IQ score suggests you may benefit from additional cognitive training and practice.";
  } else {
    if (score >= 90) return "Your EQ score indicates exceptional emotional intelligence. You excel at understanding and managing emotions.";
    else if (score >= 80) return "Your EQ score shows high emotional intelligence. You're skilled at reading emotions and social situations.";
    else if (score >= 70) return "Your EQ score is above average, indicating good emotional awareness and social skills.";
    else if (score >= 60) return "Your EQ score is in the average range, showing solid emotional understanding.";
    else if (score >= 50) return "Your EQ score is below average. Consider working on emotional awareness and empathy.";
    else if (score >= 40) return "Your EQ score suggests room for improvement in emotional intelligence and social skills.";
    else return "Your EQ score indicates significant opportunity to develop emotional intelligence and interpersonal skills.";
  }
}