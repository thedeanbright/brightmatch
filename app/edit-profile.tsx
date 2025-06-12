import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Save, User, Heart, Target } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { databaseService } from '@/lib/database';
import PhotoUpload from '@/components/PhotoUpload';

const INTENT_OPTIONS = [
  { value: 'dating', label: 'Dating' },
  { value: 'friendship', label: 'Friendship' }
];

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    intent: '',
    mbti_type: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        bio: user.bio || '',
        intent: user.intent || '',
        mbti_type: user.mbti_type || ''
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    if (!formData.username.trim()) {
      Alert.alert('Error', 'Username is required');
      return;
    }

    if (formData.username.length < 3) {
      Alert.alert('Error', 'Username must be at least 3 characters');
      return;
    }

    setLoading(true);
    try {
      const { error } = await databaseService.updateUser(user.id, {
        username: formData.username.trim(),
        bio: formData.bio.trim() || null,
        intent: formData.intent as 'dating' | 'friendship' || null,
        mbti_type: formData.mbti_type.trim() || null
      });

      if (error) {
        console.error('Error updating profile:', error);
        Alert.alert('Error', 'Failed to update profile. Please try again.');
        return;
      }

      await refreshUser();
      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotosChange = (photos: string[]) => {
    refreshUser();
  };

  const handleTakeMBTITest = () => {
    router.push('/personality-test');
  };

  if (!user) {
    return (
      <LinearGradient
        colors={['#6366f1', '#8b5cf6']}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

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
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <TouchableOpacity 
            style={styles.saveButton} 
            onPress={handleSave}
            disabled={loading}
          >
            <Save size={20} color="white" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.formCard}>
            {/* Photo Upload Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Profile Photos</Text>
              <PhotoUpload
                photos={user.profile_photos || []}
                onPhotosChange={handlePhotosChange}
                maxPhotos={6}
              />
            </View>

            {/* Username Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Username</Text>
              <View style={styles.inputContainer}>
                <User size={20} color="#6366f1" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.username}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, username: text }))}
                  placeholder="Enter username"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Bio Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Bio</Text>
              <TextInput
                style={styles.bioInput}
                value={formData.bio}
                onChangeText={(text) => setFormData(prev => ({ ...prev, bio: text }))}
                placeholder="Tell people about yourself..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Intent Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>What are you looking for?</Text>
              <View style={styles.intentContainer}>
                {INTENT_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.intentOption,
                      formData.intent === option.value && styles.selectedIntent
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, intent: option.value }))}
                  >
                    <Target size={20} color={formData.intent === option.value ? 'white' : '#6366f1'} />
                    <Text style={[
                      styles.intentText,
                      formData.intent === option.value && styles.selectedIntentText
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* MBTI Section */}
            <View style={styles.section}>
              <View style={styles.mbtiHeader}>
                <Text style={styles.sectionTitle}>Personality Type (MBTI)</Text>
                <TouchableOpacity onPress={handleTakeMBTITest}>
                  <Text style={styles.testLink}>Take Test</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.inputContainer}>
                <Heart size={20} color="#6366f1" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.mbti_type}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, mbti_type: text.toUpperCase() }))}
                  placeholder="e.g., INFP, ENTJ"
                  autoCapitalize="characters"
                  maxLength={4}
                />
              </View>
            </View>
          </View>
        </ScrollView>
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
  saveButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontFamily: 'Inter-Medium',
    color: 'white',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  formCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#333',
  },
  bioInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#333',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  intentContainer: {
    gap: 12,
  },
  intentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  selectedIntent: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  intentText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#6366f1',
    marginLeft: 12,
  },
  selectedIntentText: {
    color: 'white',
  },
  mbtiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  testLink: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6366f1',
  },
});