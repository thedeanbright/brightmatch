import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Brain, Heart, CircleCheck as CheckCircle, MapPin, User, Users as UsersIcon, Target } from 'lucide-react-native';
import { IQ_QUESTIONS, EQ_QUESTIONS } from '@/utils/testData';
import { calculateIQScore, calculateEQScore, validateTestAnswers, getScoreInterpretation } from '@/utils/testScoring';
import { TestQuestion } from '@/types/user';
import { useAuth } from '@/contexts/AuthContext';
import { databaseService } from '@/lib/database';
import { supabase } from '@/lib/supabase';
import LocationSelector from '@/components/LocationSelector';
import InterestsSelector from '@/components/InterestsSelector';

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'non-binary', label: 'Non-binary' },
  { value: 'other', label: 'Other' }
];

const SEEKING_OPTIONS = [
  { value: 'men', label: 'Men' },
  { value: 'women', label: 'Women' },
  { value: 'both', label: 'Both' }
];

const INTENT_OPTIONS = [
  { value: 'dating', label: 'Dating' },
  { value: 'friendship', label: 'Friendship' }
];

// Validation functions for enum fields
const validateEnumField = (value: string, validValues: string[]): string | null => {
  if (!value || value.trim() === '') {
    return null; // Convert empty strings to null
  }
  
  const trimmedValue = value.trim();
  return validValues.includes(trimmedValue) ? trimmedValue : null;
};

const validateGender = (gender: string): 'male' | 'female' | 'non-binary' | 'other' | null => {
  const validGenders = ['male', 'female', 'non-binary', 'other'];
  const validated = validateEnumField(gender, validGenders);
  return validated as 'male' | 'female' | 'non-binary' | 'other' | null;
};

const validateSeeking = (seeking: string): 'men' | 'women' | 'both' | null => {
  const validSeeking = ['men', 'women', 'both'];
  const validated = validateEnumField(seeking, validSeeking);
  return validated as 'men' | 'women' | 'both' | null;
};

const validateIntent = (intent: string): 'dating' | 'friendship' | null => {
  const validIntents = ['dating', 'friendship'];
  const validated = validateEnumField(intent, validIntents);
  return validated as 'dating' | 'friendship' | null;
};

export default function OnboardingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user, refreshUser } = useAuth();
  const { step } = params;

  // Form state
  const [formData, setFormData] = useState({
    username: '',
    age: '',
    gender: '',
    country: '',
    state: '',
    city: '',
    seeking: '',
    interests: [] as string[],
    intent: ''
  });

  // Test state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [iqResult, setIqResult] = useState<{ score: number; percentile: number; description: string } | null>(null);
  const [eqResult, setEqResult] = useState<{ score: number; percentile: number; description: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isIQTest = step === 'iq-test';
  const isEQTest = step === 'eq-test';
  const questions = isIQTest ? IQ_QUESTIONS : EQ_QUESTIONS;
  const currentQuestion = questions[currentQuestionIndex];

  const handleFormUpdate = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null); // Clear error when user makes changes
  };

  const handleLocationChange = (country: string, state: string, city: string) => {
    setFormData(prev => ({
      ...prev,
      country,
      state,
      city
    }));
    setError(null);
  };

  const handleInterestsChange = (interests: string[]) => {
    setFormData(prev => ({ ...prev, interests }));
    setError(null);
  };

  const handleAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNext = async () => {
    setError(null);

    if (step === 'basic-info') {
      // ONLY validate basic info fields on this step
      if (!formData.username.trim()) {
        setError('Please enter a username');
        return;
      }
      
      if (!formData.age || isNaN(parseInt(formData.age)) || parseInt(formData.age) < 18 || parseInt(formData.age) > 99) {
        setError('Please enter a valid age between 18 and 99');
        return;
      }
      
      if (!formData.gender) {
        setError('Please select your gender');
        return;
      }
      
      // Validate gender enum only on this step
      const validatedGender = validateGender(formData.gender);
      if (!validatedGender) {
        setError('Please select a valid gender option');
        return;
      }
      
      router.push('/(auth)/onboarding/location');
      
    } else if (step === 'location') {
      // ONLY validate location fields on this step
      if (!formData.country || !formData.state || !formData.city) {
        setError('Please select your complete location');
        return;
      }
      router.push('/(auth)/onboarding/seeking');
      
    } else if (step === 'seeking') {
      // ONLY validate seeking field on this step
      if (!formData.seeking) {
        setError('Please select what you are looking for');
        return;
      }
      
      // Validate seeking enum only on this step
      const validatedSeeking = validateSeeking(formData.seeking);
      if (!validatedSeeking) {
        setError('Please select a valid seeking option');
        return;
      }
      
      router.push('/(auth)/onboarding/interests');
      
    } else if (step === 'interests') {
      // ONLY validate interests on this step
      if (formData.interests.length === 0) {
        setError('Please select at least one interest');
        return;
      }
      router.push('/(auth)/onboarding/intent');
      
    } else if (step === 'intent') {
      // ONLY validate intent field on this step - NO OTHER VALIDATIONS
      if (!formData.intent) {
        setError('Please select your intent');
        return;
      }
      
      // Validate intent enum only on this step
      const validatedIntent = validateIntent(formData.intent);
      if (!validatedIntent) {
        setError('Please select a valid intent option');
        return;
      }
      
      // All validations passed for intent step, proceed to save profile
      await updateUserProfile();
      
    } else if (isIQTest || isEQTest) {
      if (selectedAnswer === null) return;

      const newAnswers = [...answers, selectedAnswer];
      setAnswers(newAnswers);

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
      } else {
        // Test completed - calculate and save score
        await completeTest(newAnswers);
      }
    }
  };

  const updateUserProfile = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        setError('Authentication required. Please sign in again.');
        return;
      }

      console.log('Updating user profile with data:', formData);

      // Validate and sanitize ALL enum fields before sending to database
      // This is the FINAL validation before database submission
      const validatedGender = validateGender(formData.gender);
      const validatedSeeking = validateSeeking(formData.seeking);
      const validatedIntent = validateIntent(formData.intent);

      // Final validation - ensure we have valid enum values
      if (!validatedGender) {
        setError('Please go back and select a valid gender');
        return;
      }

      if (!validatedSeeking) {
        setError('Please go back and select a valid seeking preference');
        return;
      }

      if (!validatedIntent) {
        setError('Please select a valid intent');
        return;
      }

      // Validate age
      const ageNumber = parseInt(formData.age);
      if (isNaN(ageNumber) || ageNumber < 18 || ageNumber > 99) {
        setError('Please go back and enter a valid age between 18 and 99');
        return;
      }

      // Validate required text fields
      if (!formData.username.trim()) {
        setError('Please go back and enter a username');
        return;
      }

      if (!formData.country || !formData.state || !formData.city) {
        setError('Please go back and complete your location information');
        return;
      }

      if (formData.interests.length === 0) {
        setError('Please go back and select at least one interest');
        return;
      }

      // Prepare clean data for database
      const updateData = {
        username: formData.username.trim(),
        age: ageNumber,
        gender: validatedGender,
        country: formData.country.trim(),
        state: formData.state.trim(),
        city: formData.city.trim(),
        seeking: validatedSeeking,
        interests: formData.interests,
        intent: validatedIntent
      };

      console.log('Sending validated data to database:', updateData);

      // Update the existing user profile with onboarding data
      const { data, error: updateError } = await databaseService.updateUser(authUser.id, updateData);

      if (updateError) {
        console.error('Profile update error:', updateError);
        
        // Handle specific database errors
        if (updateError.message?.includes('gender_type')) {
          setError('Invalid gender value. Please go back and select from the available options.');
        } else if (updateError.message?.includes('intent_type')) {
          setError('Invalid intent value. Please select from the available options.');
        } else if (updateError.message?.includes('seeking_type')) {
          setError('Invalid seeking value. Please go back and select from the available options.');
        } else if (updateError.message?.includes('unique')) {
          setError('Username already taken. Please go back and choose a different one.');
        } else if (updateError.message?.includes('check constraint')) {
          setError('Please check your age and other information for valid values.');
        } else {
          setError('Failed to update profile. Please check your information and try again.');
        }
        return;
      }

      console.log('Profile updated successfully:', data);
      await refreshUser();
      
      // Navigate to IQ test
      router.replace('/(auth)/onboarding/iq-test');
    } catch (error) {
      console.error('Profile update error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const completeTest = async (testAnswers: number[]) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        setError('Authentication required. Please sign in again.');
        return;
      }

      // Validate answers
      if (!validateTestAnswers(testAnswers, questions)) {
        setError('Invalid test answers. Please try again.');
        return;
      }

      if (isIQTest) {
        // Calculate IQ score
        const result = calculateIQScore(testAnswers, questions);
        setIqResult(result);
        
        // Save IQ score to database
        const { error: saveError } = await databaseService.updateUser(authUser.id, {
          iq_score: result.score
        });

        if (saveError) {
          console.error('Error saving IQ score:', saveError);
          setError('Failed to save IQ score. Please try again.');
          return;
        }

        // Move to EQ test
        router.replace('/(auth)/onboarding/eq-test');
        setCurrentQuestionIndex(0);
        setAnswers([]);
        setSelectedAnswer(null);
      } else {
        // Calculate EQ score
        const result = calculateEQScore(testAnswers, questions);
        setEqResult(result);
        
        // Save EQ score and mark profile as completed
        const { error: saveError } = await databaseService.updateUser(authUser.id, {
          eq_score: result.score,
          profile_completed: true
        });

        if (saveError) {
          console.error('Error saving EQ score:', saveError);
          setError('Failed to save EQ score. Please try again.');
          return;
        }

        await refreshUser();
        router.replace('/(auth)/onboarding/results');
      }
    } catch (error) {
      console.error('Test completion error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    router.replace('/(tabs)');
  };

  const handleBack = () => {
    if (step === 'iq-test' || step === 'eq-test') {
      if (currentQuestionIndex > 0) {
        setCurrentQuestionIndex(currentQuestionIndex - 1);
        setSelectedAnswer(null);
        setAnswers(answers.slice(0, -1));
      } else {
        router.back();
      }
    } else {
      router.back();
    }
  };

  const handleRetry = () => {
    setError(null);
    if (step === 'intent') {
      updateUserProfile();
    } else if (isIQTest || isEQTest) {
      completeTest(answers);
    }
  };

  const renderError = () => {
    if (!error) return null;
    
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        {(step === 'intent' || isIQTest || isEQTest) && (
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderBasicInfo = () => (
    <KeyboardAvoidingView 
      style={styles.keyboardAvoidingView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <User size={64} color="white" />
          <Text style={styles.title}>Basic Information</Text>
          <Text style={styles.subtitle}>Tell us about yourself</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Username *</Text>
            <TextInput
              style={styles.input}
              value={formData.username}
              onChangeText={(value) => handleFormUpdate('username', value)}
              placeholder="Enter your username"
              placeholderTextColor="rgba(255, 255, 255, 0.6)"
              returnKeyType="next"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Age *</Text>
            <TextInput
              style={styles.input}
              value={formData.age}
              onChangeText={(value) => handleFormUpdate('age', value)}
              placeholder="Enter your age"
              placeholderTextColor="rgba(255, 255, 255, 0.6)"
              keyboardType="numeric"
              maxLength={2}
              returnKeyType="done"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Gender *</Text>
            <View style={styles.optionsGrid}>
              {GENDER_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionButton,
                    formData.gender === option.value && styles.selectedOption
                  ]}
                  onPress={() => handleFormUpdate('gender', option.value)}
                >
                  <Text style={[
                    styles.optionText,
                    formData.gender === option.value && styles.selectedOptionText
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {renderError()}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleNext}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );

  const renderLocation = () => (
    <View style={styles.content}>
      <View style={styles.header}>
        <MapPin size={64} color="white" />
        <Text style={styles.title}>Where are you located?</Text>
        <Text style={styles.subtitle}>Help us find matches near you</Text>
      </View>

      <View style={styles.form}>
        <LocationSelector
          selectedCountry={formData.country}
          selectedState={formData.state}
          selectedCity={formData.city}
          onLocationChange={handleLocationChange}
        />
      </View>

      {renderError()}

      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSeeking = () => (
    <View style={styles.content}>
      <View style={styles.header}>
        <Target size={64} color="white" />
        <Text style={styles.title}>What are you looking for?</Text>
        <Text style={styles.subtitle}>Who would you like to meet?</Text>
      </View>

      <View style={styles.form}>
        {SEEKING_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.intentOption,
              formData.seeking === option.value && styles.selectedIntent
            ]}
            onPress={() => handleFormUpdate('seeking', option.value)}
          >
            <Text style={[
              styles.intentText,
              formData.seeking === option.value && styles.selectedIntentText
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {renderError()}

      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );

  const renderInterests = () => (
    <View style={styles.content}>
      <View style={styles.header}>
        <Heart size={64} color="white" />
      </View>

      <InterestsSelector
        selectedInterests={formData.interests}
        onInterestsChange={handleInterestsChange}
        maxSelections={10}
      />

      {renderError()}

      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );

  const renderIntent = () => (
    <View style={styles.content}>
      <View style={styles.header}>
        <UsersIcon size={64} color="white" />
        <Text style={styles.title}>What's your goal?</Text>
        <Text style={styles.subtitle}>Choose your main intent</Text>
      </View>

      <View style={styles.form}>
        {INTENT_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.intentOption,
              formData.intent === option.value && styles.selectedIntent
            ]}
            onPress={() => handleFormUpdate('intent', option.value)}
          >
            <Text style={[
              styles.intentText,
              formData.intent === option.value && styles.selectedIntentText
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {renderError()}

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleNext}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Updating Profile...' : 'Continue to Tests'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderTest = () => (
    <View style={styles.content}>
      <View style={styles.testHeader}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
        
        <Text style={styles.testTitle}>
          {isIQTest ? 'IQ Test' : 'EQ Test'}
        </Text>
        
        <Text style={styles.progress}>
          {currentQuestionIndex + 1} / {questions.length}
        </Text>
      </View>

      <View style={styles.progressBar}>
        <View 
          style={[
            styles.progressFill, 
            { width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }
          ]} 
        />
      </View>

      <ScrollView style={styles.questionContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.question}>{currentQuestion.question}</Text>
        
        <View style={styles.options}>
          {currentQuestion.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.option,
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
      </ScrollView>

      {renderError()}

      <TouchableOpacity
        style={[styles.button, (selectedAnswer === null || loading) && styles.buttonDisabled]}
        onPress={handleNext}
        disabled={selectedAnswer === null || loading}
      >
        <Text style={[styles.buttonText, (selectedAnswer === null || loading) && styles.buttonTextDisabled]}>
          {loading ? 'Saving...' : (currentQuestionIndex < questions.length - 1 ? 'Next' : 'Finish Test')}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderResults = () => {
    const currentIqScore = iqResult?.score || user?.iq_score || 0;
    const currentEqScore = eqResult?.score || user?.eq_score || 0;
    
    return (
      <View style={styles.content}>
        <View style={styles.header}>
          <CheckCircle size={64} color="white" />
          <Text style={styles.title}>Your Results</Text>
          <Text style={styles.subtitle}>Here's how you scored!</Text>
        </View>

        <ScrollView style={styles.resultsContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.scoresContainer}>
            <View style={styles.scoreCard}>
              <Brain size={32} color="#8B5CF6" />
              <Text style={styles.scoreLabel}>IQ Score</Text>
              <Text style={styles.scoreValue}>{currentIqScore}</Text>
              {iqResult && (
                <Text style={styles.scorePercentile}>
                  {iqResult.percentile}th percentile
                </Text>
              )}
            </View>

            <View style={styles.scoreCard}>
              <Heart size={32} color="#EC4899" />
              <Text style={styles.scoreLabel}>EQ Score</Text>
              <Text style={styles.scoreValue}>{currentEqScore}</Text>
              {eqResult && (
                <Text style={styles.scorePercentile}>
                  {eqResult.percentile}th percentile
                </Text>
              )}
            </View>
          </View>

          {(iqResult || eqResult) && (
            <View style={styles.interpretationContainer}>
              <Text style={styles.interpretationTitle}>Score Interpretation</Text>
              
              {iqResult && (
                <View style={styles.interpretationCard}>
                  <Text style={styles.interpretationLabel}>IQ Score Analysis</Text>
                  <Text style={styles.interpretationText}>
                    {getScoreInterpretation(iqResult.score, 'iq')}
                  </Text>
                </View>
              )}
              
              {eqResult && (
                <View style={styles.interpretationCard}>
                  <Text style={styles.interpretationLabel}>EQ Score Analysis</Text>
                  <Text style={styles.interpretationText}>
                    {getScoreInterpretation(eqResult.score, 'eq')}
                  </Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>

        <TouchableOpacity style={styles.button} onPress={handleFinish}>
          <Text style={styles.buttonText}>Start Matching!</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderContent = () => {
    switch (step) {
      case 'basic-info':
        return renderBasicInfo();
      case 'location':
        return renderLocation();
      case 'seeking':
        return renderSeeking();
      case 'interests':
        return renderInterests();
      case 'intent':
        return renderIntent();
      case 'iq-test':
      case 'eq-test':
        return renderTest();
      case 'results':
        return renderResults();
      default:
        return renderBasicInfo();
    }
  };

  return (
    <LinearGradient
      colors={['#8B5CF6', '#EC4899']}
      style={styles.container}
    >
      {renderContent()}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: 'white',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    flex: 1,
    justifyContent: 'center',
    minHeight: 300,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: 'white',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  selectedOption: {
    backgroundColor: 'white',
    borderColor: 'white',
  },
  optionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: 'white',
  },
  selectedOptionText: {
    color: '#8B5CF6',
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 20,
  },
  intentOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  selectedIntent: {
    backgroundColor: 'white',
    borderColor: 'white',
  },
  intentText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
    textAlign: 'center',
  },
  selectedIntentText: {
    color: '#8B5CF6',
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
  },
  testTitle: {
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
    borderRadius: 2,
    marginBottom: 32,
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 2,
  },
  questionContainer: {
    flex: 1,
  },
  question: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
    lineHeight: 28,
    marginBottom: 32,
  },
  options: {
    gap: 16,
  },
  option: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  button: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 32,
  },
  buttonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#8B5CF6',
  },
  buttonTextDisabled: {
    color: 'rgba(139, 92, 246, 0.5)',
  },
  resultsContainer: {
    flex: 1,
  },
  scoresContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  scoreCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#666',
    marginTop: 8,
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#333',
  },
  scorePercentile: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#666',
    marginTop: 4,
  },
  interpretationContainer: {
    marginBottom: 24,
  },
  interpretationTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginBottom: 16,
    textAlign: 'center',
  },
  interpretationCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  interpretationLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
    marginBottom: 8,
  },
  interpretationText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  retryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: 'center',
  },
  retryButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
});