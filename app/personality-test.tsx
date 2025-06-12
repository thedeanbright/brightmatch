import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Users, CircleCheck as CheckCircle, Brain } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { databaseService } from '@/lib/database';

const MBTI_QUESTIONS = [
  // Extraversion vs Introversion (E/I) - 20 questions
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
  {
    id: 6,
    question: "After a long day, you prefer to:",
    options: [
      "Go out and be around people",
      "Stay home and relax quietly"
    ],
    dimension: 'EI'
  },
  {
    id: 7,
    question: "When working on a project, you prefer to:",
    options: [
      "Collaborate with a team",
      "Work independently"
    ],
    dimension: 'EI'
  },
  {
    id: 8,
    question: "You tend to:",
    options: [
      "Think out loud",
      "Think before speaking"
    ],
    dimension: 'EI'
  },
  {
    id: 9,
    question: "At work or school, you:",
    options: [
      "Enjoy being the center of attention",
      "Prefer to work behind the scenes"
    ],
    dimension: 'EI'
  },
  {
    id: 10,
    question: "When learning something new, you prefer:",
    options: [
      "Group discussions and activities",
      "Reading and individual study"
    ],
    dimension: 'EI'
  },

  // Sensing vs Intuition (S/N) - 10 questions
  {
    id: 11,
    question: "You tend to focus on:",
    options: [
      "Facts and details",
      "Possibilities and big picture"
    ],
    dimension: 'SN'
  },
  {
    id: 12,
    question: "When learning something new, you prefer:",
    options: [
      "Step-by-step instructions",
      "Understanding the overall concept first"
    ],
    dimension: 'SN'
  },
  {
    id: 13,
    question: "You're more interested in:",
    options: [
      "What is actually happening",
      "What could potentially happen"
    ],
    dimension: 'SN'
  },
  {
    id: 14,
    question: "You trust:",
    options: [
      "Experience and proven methods",
      "Inspiration and new approaches"
    ],
    dimension: 'SN'
  },
  {
    id: 15,
    question: "You prefer work that involves:",
    options: [
      "Practical applications",
      "Theoretical concepts"
    ],
    dimension: 'SN'
  },
  {
    id: 16,
    question: "When reading, you prefer:",
    options: [
      "Factual information and how-to guides",
      "Fiction and imaginative stories"
    ],
    dimension: 'SN'
  },
  {
    id: 17,
    question: "You are more likely to:",
    options: [
      "Notice specific details in your environment",
      "See patterns and connections"
    ],
    dimension: 'SN'
  },
  {
    id: 18,
    question: "When solving problems, you:",
    options: [
      "Use tried and tested methods",
      "Look for innovative solutions"
    ],
    dimension: 'SN'
  },
  {
    id: 19,
    question: "You prefer to:",
    options: [
      "Focus on the present moment",
      "Think about future possibilities"
    ],
    dimension: 'SN'
  },
  {
    id: 20,
    question: "Your memory tends to focus on:",
    options: [
      "Specific facts and details",
      "General impressions and meanings"
    ],
    dimension: 'SN'
  },

  // Thinking vs Feeling (T/F) - 10 questions
  {
    id: 21,
    question: "When making decisions, you prioritize:",
    options: [
      "Logic and objective analysis",
      "Values and how it affects people"
    ],
    dimension: 'TF'
  },
  {
    id: 22,
    question: "You're more convinced by:",
    options: [
      "Logical reasoning",
      "Emotional appeals"
    ],
    dimension: 'TF'
  },
  {
    id: 23,
    question: "In conflicts, you tend to:",
    options: [
      "Focus on finding the most logical solution",
      "Consider everyone's feelings and find harmony"
    ],
    dimension: 'TF'
  },
  {
    id: 24,
    question: "You value:",
    options: [
      "Fairness and justice",
      "Compassion and mercy"
    ],
    dimension: 'TF'
  },
  {
    id: 25,
    question: "When giving feedback, you:",
    options: [
      "Focus on what needs to be improved",
      "Consider how the person might feel"
    ],
    dimension: 'TF'
  },
  {
    id: 26,
    question: "You prefer to be seen as:",
    options: [
      "Competent and logical",
      "Caring and understanding"
    ],
    dimension: 'TF'
  },
  {
    id: 27,
    question: "When analyzing a situation, you first consider:",
    options: [
      "The facts and logical implications",
      "The people involved and their feelings"
    ],
    dimension: 'TF'
  },
  {
    id: 28,
    question: "You are more motivated by:",
    options: [
      "Achievement and competence",
      "Appreciation and harmony"
    ],
    dimension: 'TF'
  },
  {
    id: 29,
    question: "In arguments, you:",
    options: [
      "Focus on the logical points",
      "Try to understand different perspectives"
    ],
    dimension: 'TF'
  },
  {
    id: 30,
    question: "You prefer criticism that is:",
    options: [
      "Direct and honest",
      "Gentle and considerate"
    ],
    dimension: 'TF'
  },

  // Judging vs Perceiving (J/P) - 10 questions
  {
    id: 31,
    question: "You prefer to:",
    options: [
      "Plan things in advance",
      "Keep your options open"
    ],
    dimension: 'JP'
  },
  {
    id: 32,
    question: "Your ideal weekend is:",
    options: [
      "Planned with scheduled activities",
      "Spontaneous and flexible"
    ],
    dimension: 'JP'
  },
  {
    id: 33,
    question: "You work best when:",
    options: [
      "Following a clear schedule",
      "Working at your own pace"
    ],
    dimension: 'JP'
  },
  {
    id: 34,
    question: "You prefer:",
    options: [
      "Having things settled and decided",
      "Keeping things open for new information"
    ],
    dimension: 'JP'
  },
  {
    id: 35,
    question: "When starting a project, you:",
    options: [
      "Make a detailed plan first",
      "Jump in and figure it out as you go"
    ],
    dimension: 'JP'
  },
  {
    id: 36,
    question: "Your workspace tends to be:",
    options: [
      "Organized and tidy",
      "Flexible and adaptable"
    ],
    dimension: 'JP'
  },
  {
    id: 37,
    question: "You prefer deadlines that are:",
    options: [
      "Clear and firm",
      "Flexible and negotiable"
    ],
    dimension: 'JP'
  },
  {
    id: 38,
    question: "When traveling, you prefer to:",
    options: [
      "Have a detailed itinerary",
      "Go with the flow and explore"
    ],
    dimension: 'JP'
  },
  {
    id: 39,
    question: "You feel more comfortable when:",
    options: [
      "Things are decided and settled",
      "Options remain open"
    ],
    dimension: 'JP'
  },
  {
    id: 40,
    question: "Your approach to time is:",
    options: [
      "Structured and punctual",
      "Flexible and relaxed"
    ],
    dimension: 'JP'
  }
];

const MBTI_DESCRIPTIONS = {
  'INTJ': 'The Architect - Strategic, independent, and highly competent. You have a natural ability to see the big picture and create long-term plans.',
  'INTP': 'The Thinker - Innovative, independent, and strategic. You love exploring theoretical concepts and understanding how things work.',
  'ENTJ': 'The Commander - Bold, imaginative, and strong-willed leaders. You naturally take charge and inspire others to achieve ambitious goals.',
  'ENTP': 'The Debater - Smart, curious, and able to debate any topic. You thrive on intellectual challenges and generating new ideas.',
  'INFJ': 'The Advocate - Creative, insightful, and principled. You have a strong sense of purpose and care deeply about making a positive impact.',
  'INFP': 'The Mediator - Poetic, kind, and altruistic. You are guided by your values and have a deep desire to help others and make the world better.',
  'ENFJ': 'The Protagonist - Charismatic, inspiring, and natural leaders. You have an exceptional ability to motivate and guide others.',
  'ENFP': 'The Campaigner - Enthusiastic, creative, and sociable. You see life as full of possibilities and inspire others with your optimism.',
  'ISTJ': 'The Logistician - Practical, fact-minded, and reliable. You value tradition, loyalty, and hard work, and you always follow through.',
  'ISFJ': 'The Protector - Warm-hearted, conscientious, and cooperative. You are dedicated to helping others and creating harmony.',
  'ESTJ': 'The Executive - Organized, practical, and decisive. You are excellent at managing people and projects to achieve concrete results.',
  'ESFJ': 'The Consul - Caring, social, and popular. You are highly attuned to others\' needs and work hard to maintain harmony.',
  'ISTP': 'The Virtuoso - Bold, practical, and experimental. You are a master of tools and techniques, always ready to explore and build.',
  'ISFP': 'The Adventurer - Charming, sensitive, and artistic. You live in the moment and are always ready to explore new possibilities.',
  'ESTP': 'The Entrepreneur - Smart, energetic, and perceptive. You are excellent at reading situations and adapting quickly to new challenges.',
  'ESFP': 'The Entertainer - Spontaneous, enthusiastic, and playful. You love being around people and bringing joy to others.'
};

export default function PersonalityTestScreen() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [mbtiResult, setMbtiResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

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
      setLoading(true);
      setTimeout(() => {
        calculateMBTI(newAnswers);
        setLoading(false);
      }, 1500);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedAnswer(answers[currentQuestion - 1]);
      setAnswers(answers.slice(0, -1));
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

  const handleFinish = async () => {
    if (!user) return;

    try {
      // Save MBTI result to database
      await databaseService.updateMBTIType(user.id, mbtiResult);
      await refreshUser();
      
      Alert.alert(
        'Test Complete!',
        `Your personality type is ${mbtiResult}. This has been saved to your profile.`,
        [
          { text: 'OK', onPress: () => router.back() }
        ]
      );
    } catch (error) {
      console.error('Error saving MBTI result:', error);
      Alert.alert('Error', 'Failed to save your results. Please try again.');
    }
  };

  if (loading) {
    return (
      <LinearGradient
        colors={['#6366f1', '#8b5cf6']}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <Brain size={64} color="white" />
            <Text style={styles.loadingTitle}>Analyzing Your Personality...</Text>
            <Text style={styles.loadingSubtitle}>
              Processing your responses to determine your MBTI type
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

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

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.resultsCard}>
              <CheckCircle size={64} color="#10b981" />
              <Text style={styles.resultsTitle}>Your Personality Type</Text>
              <Text style={styles.mbtiType}>{mbtiResult}</Text>
              <Text style={styles.mbtiDescription}>
                {MBTI_DESCRIPTIONS[mbtiResult as keyof typeof MBTI_DESCRIPTIONS]}
              </Text>
              
              <View style={styles.dimensionsContainer}>
                <Text style={styles.dimensionsTitle}>Your Personality Dimensions</Text>
                <View style={styles.dimensionsList}>
                  <View style={styles.dimensionItem}>
                    <Text style={styles.dimensionLabel}>
                      {mbtiResult[0] === 'E' ? 'Extraversion' : 'Introversion'}
                    </Text>
                    <Text style={styles.dimensionCode}>{mbtiResult[0]}</Text>
                  </View>
                  <View style={styles.dimensionItem}>
                    <Text style={styles.dimensionLabel}>
                      {mbtiResult[1] === 'S' ? 'Sensing' : 'Intuition'}
                    </Text>
                    <Text style={styles.dimensionCode}>{mbtiResult[1]}</Text>
                  </View>
                  <View style={styles.dimensionItem}>
                    <Text style={styles.dimensionLabel}>
                      {mbtiResult[2] === 'T' ? 'Thinking' : 'Feeling'}
                    </Text>
                    <Text style={styles.dimensionCode}>{mbtiResult[2]}</Text>
                  </View>
                  <View style={styles.dimensionItem}>
                    <Text style={styles.dimensionLabel}>
                      {mbtiResult[3] === 'J' ? 'Judging' : 'Perceiving'}
                    </Text>
                    <Text style={styles.dimensionCode}>{mbtiResult[3]}</Text>
                  </View>
                </View>
              </View>
              
              <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
                <Text style={styles.finishButtonText}>Save to Profile</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
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
          <View style={styles.navigationButtons}>
            {currentQuestion > 0 && (
              <TouchableOpacity style={styles.previousButton} onPress={handlePrevious}>
                <Text style={styles.previousButtonText}>Previous</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[
                styles.nextButton,
                selectedAnswer === null && styles.nextButtonDisabled,
                currentQuestion === 0 && styles.nextButtonFull
              ]}
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
    lineHeight: 22,
  },
  selectedOptionText: {
    color: 'white',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  navigationButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  previousButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  previousButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
  nextButton: {
    flex: 2,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  nextButtonFull: {
    flex: 1,
  },
  nextButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  nextButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#6366f1',
  },
  nextButtonTextDisabled: {
    color: 'rgba(99, 102, 241, 0.5)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: 'white',
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  loadingSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
  },
  resultsCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 20,
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
  dimensionsContainer: {
    width: '100%',
    marginBottom: 32,
  },
  dimensionsTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  dimensionsList: {
    gap: 12,
  },
  dimensionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
  },
  dimensionLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#374151',
  },
  dimensionCode: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#6366f1',
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