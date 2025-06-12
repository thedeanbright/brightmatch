import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Users, CircleCheck as CheckCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const MBTI_QUESTIONS = [
  // Extraversion vs Introversion
  {
    id: 1,
    question: "At a party, you would rather:",
    options: [
      "Meet new people and socialize with many",
      "Have deep conversations with a few close friends"
    ],
    dimension: 'EI'
  },
  {
    id: 2,
    question: "You feel more energized when:",
    options: [
      "Being around other people",
      "Spending time alone"
    ],
    dimension: 'EI'
  },
  {
    id: 3,
    question: "When making decisions, you prefer to:",
    options: [
      "Talk it through with others",
      "Think it through privately first"
    ],
    dimension: 'EI'
  },
  {
    id: 4,
    question: "In group settings, you typically:",
    options: [
      "Speak up and share your thoughts readily",
      "Listen more and speak when you have something important to say"
    ],
    dimension: 'EI'
  },
  {
    id: 5,
    question: "You prefer to:",
    options: [
      "Have a wide circle of acquaintances",
      "Have a small circle of close friends"
    ],
    dimension: 'EI'
  },

  // Sensing vs Intuition
  {
    id: 6,
    question: "You tend to focus on:",
    options: [
      "Facts and details",
      "Possibilities and big picture"
    ],
    dimension: 'SN'
  },
  {
    id: 7,
    question: "When learning something new, you prefer:",
    options: [
      "Step-by-step instructions",
      "Understanding the overall concept first"
    ],
    dimension: 'SN'
  },
  {
    id: 8,
    question: "You're more interested in:",
    options: [
      "What is actually happening",
      "What could potentially happen"
    ],
    dimension: 'SN'
  },
  {
    id: 9,
    question: "You trust:",
    options: [
      "Experience and proven methods",
      "Inspiration and new approaches"
    ],
    dimension: 'SN'
  },
  {
    id: 10,
    question: "You prefer work that involves:",
    options: [
      "Practical applications",
      "Theoretical concepts"
    ],
    dimension: 'SN'
  },

  // Thinking vs Feeling
  {
    id: 11,
    question: "When making decisions, you prioritize:",
    options: [
      "Logic and objective analysis",
      "Values and how it affects people"
    ],
    dimension: 'TF'
  },
  {
    id: 12,
    question: "You're more convinced by:",
    options: [
      "Logical reasoning",
      "Emotional appeals"
    ],
    dimension: 'TF'
  },
  {
    id: 13,
    question: "In conflicts, you tend to:",
    options: [
      "Focus on finding the most logical solution",
      "Consider everyone's feelings and find harmony"
    ],
    dimension: 'TF'
  },
  {
    id: 14,
    question: "You value:",
    options: [
      "Fairness and justice",
      "Compassion and mercy"
    ],
    dimension: 'TF'
  },
  {
    id: 15,
    question: "When giving feedback, you:",
    options: [
      "Focus on what needs to be improved",
      "Consider how the person might feel"
    ],
    dimension: 'TF'
  },

  // Judging vs Perceiving
  {
    id: 16,
    question: "You prefer to:",
    options: [
      "Plan things in advance",
      "Keep your options open"
    ],
    dimension: 'JP'
  },
  {
    id: 17,
    question: "Your ideal weekend is:",
    options: [
      "Planned with scheduled activities",
      "Spontaneous and flexible"
    ],
    dimension: 'JP'
  },
  {
    id: 18,
    question: "You work best when:",
    options: [
      "Following a clear schedule",
      "Working at your own pace"
    ],
    dimension: 'JP'
  },
  {
    id: 19,
    question: "You prefer:",
    options: [
      "Having things settled and decided",
      "Keeping things open for new information"
    ],
    dimension: 'JP'
  },
  {
    id: 20,
    question: "When starting a project, you:",
    options: [
      "Make a detailed plan first",
      "Jump in and figure it out as you go"
    ],
    dimension: 'JP'
  }
];

const MBTI_DESCRIPTIONS = {
  'INTJ': 'The Architect - Strategic, independent, and highly competent.',
  'INTP': 'The Thinker - Innovative, independent, and strategic.',
  'ENTJ': 'The Commander - Bold, imaginative, and strong-willed leaders.',
  'ENTP': 'The Debater - Smart, curious, and able to debate any topic.',
  'INFJ': 'The Advocate - Creative, insightful, and principled.',
  'INFP': 'The Mediator - Poetic, kind, and altruistic.',
  'ENFJ': 'The Protagonist - Charismatic, inspiring, and natural leaders.',
  'ENFP': 'The Campaigner - Enthusiastic, creative, and sociable.',
  'ISTJ': 'The Logistician - Practical, fact-minded, and reliable.',
  'ISFJ': 'The Protector - Warm-hearted, conscientious, and cooperative.',
  'ESTJ': 'The Executive - Organized, practical, and decisive.',
  'ESFJ': 'The Consul - Caring, social, and popular.',
  'ISTP': 'The Virtuoso - Bold, practical, and experimental.',
  'ISFP': 'The Adventurer - Charming, sensitive, and artistic.',
  'ESTP': 'The Entrepreneur - Smart, energetic, and perceptive.',
  'ESFP': 'The Entertainer - Spontaneous, enthusiastic, and playful.'
};

export default function MBTITestScreen() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [mbtiResult, setMbtiResult] = useState<string>('');

  const handleAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNext = () => {
    if (selectedAnswer === null) return;

    const newAnswers = [...answers, selectedAnswer];
    setAnswers(newAnswers);

    if (currentQuestion < MBTI_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      calculateMBTI(newAnswers);
    }
  };

  const calculateMBTI = (userAnswers: number[]) => {
    const scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };

    userAnswers.forEach((answer, index) => {
      const question = MBTI_QUESTIONS[index];
      const dimension = question.dimension;

      if (dimension === 'EI') {
        if (answer === 0) scores.E++;
        else scores.I++;
      } else if (dimension === 'SN') {
        if (answer === 0) scores.S++;
        else scores.N++;
      } else if (dimension === 'TF') {
        if (answer === 0) scores.T++;
        else scores.F++;
      } else if (dimension === 'JP') {
        if (answer === 0) scores.J++;
        else scores.P++;
      }
    });

    const type = 
      (scores.E > scores.I ? 'E' : 'I') +
      (scores.S > scores.N ? 'S' : 'N') +
      (scores.T > scores.F ? 'T' : 'F') +
      (scores.J > scores.P ? 'J' : 'P');

    setMbtiResult(type);
    setShowResults(true);
  };

  const handleFinish = () => {
    Alert.alert(
      'Test Complete!',
      `Your personality type is ${mbtiResult}. This has been saved to your profile.`,
      [
        { text: 'OK', onPress: () => router.back() }
      ]
    );
  };

  if (showResults) {
    return (
      <LinearGradient
        colors={['#6366f1', '#8b5cf6']}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <ArrowLeft size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Your Results</Text>
          </View>

          <View style={styles.resultsContainer}>
            <View style={styles.resultsCard}>
              <CheckCircle size={64} color="#10b981" />
              <Text style={styles.resultsTitle}>Your Personality Type</Text>
              <Text style={styles.mbtiType}>{mbtiResult}</Text>
              <Text style={styles.mbtiDescription}>
                {MBTI_DESCRIPTIONS[mbtiResult as keyof typeof MBTI_DESCRIPTIONS]}
              </Text>
              
              <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
                <Text style={styles.finishButtonText}>Save to Profile</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const question = MBTI_QUESTIONS[currentQuestion];
  const progress = ((currentQuestion + 1) / MBTI_QUESTIONS.length) * 100;

  return (
    <LinearGradient
      colors={['#6366f1', '#8b5cf6']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Personality Test</Text>
          <Text style={styles.progress}>
            {currentQuestion + 1} / {MBTI_QUESTIONS.length}
          </Text>
        </View>

        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.questionCard}>
            <Users size={48} color="#6366f1" />
            <Text style={styles.questionNumber}>Question {currentQuestion + 1}</Text>
            <Text style={styles.questionText}>{question.question}</Text>
            
            <View style={styles.optionsContainer}>
              {question.options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionButton,
                    selectedAnswer === index && styles.selectedOption
                  ]}
                  onPress={() => handleAnswer(index)}
                >
                  <Text style={[
                    styles.optionText,
                    selectedAnswer === index && styles.selectedOptionText
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.nextButton, selectedAnswer === null && styles.nextButtonDisabled]}
            onPress={handleNext}
            disabled={selectedAnswer === null}
          >
            <Text style={[
              styles.nextButtonText,
              selectedAnswer === null && styles.nextButtonTextDisabled
            ]}>
              {currentQuestion < MBTI_QUESTIONS.length - 1 ? 'Next' : 'Finish'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
  progress: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 20,
    borderRadius: 2,
    marginBottom: 24,
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  questionCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  questionNumber: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#6366f1',
    marginTop: 16,
    marginBottom: 8,
  },
  questionText: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 32,
  },
  optionsContainer: {
    width: '100%',
    gap: 16,
  },
  optionButton: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  selectedOption: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  optionText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    textAlign: 'center',
  },
  selectedOptionText: {
    color: 'white',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  nextButton: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  nextButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#6366f1',
  },
  nextButtonTextDisabled: {
    color: 'rgba(99, 102, 241, 0.5)',
  },
  resultsContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  resultsCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  resultsTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#333',
    marginTop: 24,
    marginBottom: 16,
  },
  mbtiType: {
    fontSize: 48,
    fontFamily: 'Inter-Bold',
    color: '#6366f1',
    marginBottom: 16,
  },
  mbtiDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  finishButton: {
    backgroundColor: '#6366f1',
    borderRadius: 16,
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  finishButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
});