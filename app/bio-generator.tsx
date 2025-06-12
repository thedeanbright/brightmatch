import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Sparkles, User, Heart, Target } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { databaseService } from '@/lib/database';
import { generateAIBio } from '@/utils/ai';

const BIO_QUESTIONS = [
  {
    id: 1,
    question: "What's something you love doing in your free time?",
    placeholder: "e.g., hiking, reading, cooking, traveling...",
    icon: Heart
  },
  {
    id: 2,
    question: "How would your best friend describe you?",
    placeholder: "e.g., funny, adventurous, thoughtful, creative...",
    icon: User
  },
  {
    id: 3,
    question: "What are you looking for in a match?",
    placeholder: "e.g., someone who shares my values, loves adventure...",
    icon: Target
  }
];

export default function BioGeneratorScreen() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>(['', '', '']);
  const [generatedBio, setGeneratedBio] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const handleAnswerChange = (text: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = text;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (!answers[currentQuestion].trim()) {
      Alert.alert('Please answer the question', 'This will help us create a better bio for you.');
      return;
    }

    if (currentQuestion < BIO_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      generateBio();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const generateBio = async () => {
    setLoading(true);
    try {
      const bio = await generateAIBio(answers);
      setGeneratedBio(bio);
      setShowResult(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate bio. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateBio = async () => {
    setLoading(true);
    try {
      const bio = await generateAIBio(answers);
      setGeneratedBio(bio);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate bio. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBio = async () => {
    if (!user) {
      Alert.alert('Error', 'User not found');
      return;
    }

    try {
      await databaseService.updateUserBio(user.id, generatedBio);
      await refreshUser();
      
      Alert.alert(
        'Bio Saved!',
        'Your new bio has been saved to your profile.',
        [
          { text: 'OK', onPress: () => router.back() }
        ]
      );
    } catch (error) {
      console.error('Error saving bio:', error);
      Alert.alert('Error', 'Failed to save bio. Please try again.');
    }
  };

  if (showResult) {
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
            <Text style={styles.headerTitle}>Your AI-Generated Bio</Text>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.resultCard}>
              <Sparkles size={48} color="#6366f1" />
              <Text style={styles.resultTitle}>Here's your personalized bio!</Text>
              
              <View style={styles.bioContainer}>
                <Text style={styles.generatedBio}>{generatedBio}</Text>
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={styles.regenerateButton} 
                  onPress={handleRegenerateBio}
                  disabled={loading}
                >
                  <Sparkles size={20} color="#6366f1" />
                  <Text style={styles.regenerateButtonText}>
                    {loading ? 'Generating...' : 'Generate Another'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.saveButton} onPress={handleSaveBio}>
                  <Text style={styles.saveButtonText}>Save to Profile</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const question = BIO_QUESTIONS[currentQuestion];
  const IconComponent = question.icon;
  const progress = ((currentQuestion + 1) / BIO_QUESTIONS.length) * 100;

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
          <Text style={styles.headerTitle}>AI Bio Generator</Text>
          <Text style={styles.progress}>
            {currentQuestion + 1} / {BIO_QUESTIONS.length}
          </Text>
        </View>

        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.questionCard}>
            <IconComponent size={48} color="#6366f1" />
            <Text style={styles.questionNumber}>Question {currentQuestion + 1}</Text>
            <Text style={styles.questionText}>{question.question}</Text>
            
            <TextInput
              style={styles.answerInput}
              value={answers[currentQuestion]}
              onChangeText={handleAnswerChange}
              placeholder={question.placeholder}
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
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
                !answers[currentQuestion].trim() && styles.nextButtonDisabled
              ]}
              onPress={handleNext}
              disabled={!answers[currentQuestion].trim() || loading}
            >
              <Text style={[
                styles.nextButtonText,
                !answers[currentQuestion].trim() && styles.nextButtonTextDisabled
              ]}>
                {loading ? 'Generating...' : 
                 currentQuestion < BIO_QUESTIONS.length - 1 ? 'Next' : 'Generate Bio'}
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
    marginBottom: 24,
  },
  answerInput: {
    width: '100%',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#333',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    minHeight: 120,
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
  resultCard: {
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
  resultTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  bioContainer: {
    width: '100%',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
  },
  generatedBio: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#333',
    lineHeight: 24,
  },
  actionButtons: {
    width: '100%',
    gap: 12,
  },
  regenerateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#6366f1',
    gap: 8,
  },
  regenerateButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#6366f1',
  },
  saveButton: {
    backgroundColor: '#6366f1',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
});