import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Brain, Heart, Users, CreditCard as Edit3, Sparkles, Settings as SettingsIcon, Save, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { databaseService } from '@/lib/database';
import PhotoUpload from '@/components/PhotoUpload';
import BrightMatchLogo from '@/components/BrightMatchLogo';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editingBio, setEditingBio] = useState(false);
  const [bioText, setBioText] = useState('');
  const [editingUsername, setEditingUsername] = useState(false);
  const [usernameText, setUsernameText] = useState('');

  useEffect(() => {
    if (user) {
      setBioText(user.bio || '');
      setUsernameText(user.username || '');
    }
  }, [user]);

  const handleTakeMBTITest = () => {
    router.push('/personality-test');
  };

  const handleSettings = () => {
    router.push('/settings');
  };

  const handleEditBio = () => {
    router.push('/bio-generator');
  };

  const handlePhotosChange = (photos: string[]) => {
    refreshUser();
  };

  const handleSaveBio = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      await databaseService.updateUserBio(user.id, bioText);
      await refreshUser();
      setEditingBio(false);
      Alert.alert('Success', 'Bio updated successfully!');
    } catch (error) {
      console.error('Error updating bio:', error);
      Alert.alert('Error', 'Failed to update bio. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveUsername = async () => {
    if (!user || !usernameText.trim()) return;
    
    setLoading(true);
    try {
      await databaseService.updateUsername(user.id, usernameText.trim());
      await refreshUser();
      setEditingUsername(false);
      Alert.alert('Success', 'Username updated successfully!');
    } catch (error) {
      console.error('Error updating username:', error);
      Alert.alert('Error', 'Failed to update username. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <LinearGradient
        colors={['#6366f1', '#8b5cf6']}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading profile...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const profileCompletion = calculateProfileCompletion(user);

  return (
    <LinearGradient
      colors={['#6366f1', '#8b5cf6']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <BrightMatchLogo size={24} style={styles.headerLogo} />
            <Text style={styles.title}>Profile</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.headerButton} 
              onPress={handleSettings}
            >
              <SettingsIcon size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Main Info Card */}
          <View style={styles.infoCard}>
            {/* Username Section */}
            <View style={styles.nameSection}>
              {editingUsername ? (
                <View style={styles.editContainer}>
                  <TextInput
                    style={styles.editInput}
                    value={usernameText}
                    onChangeText={setUsernameText}
                    placeholder="Enter username"
                    autoFocus
                  />
                  <View style={styles.editActions}>
                    <TouchableOpacity onPress={handleSaveUsername} disabled={loading}>
                      <Save size={20} color="#10b981" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => {
                      setEditingUsername(false);
                      setUsernameText(user.username || '');
                    }}>
                      <X size={20} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.nameRow}>
                  <Text style={styles.name}>@{user.username || 'username'}</Text>
                  <TouchableOpacity onPress={() => setEditingUsername(true)}>
                    <Edit3 size={16} color="#6366f1" />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Scores Section */}
            <View style={styles.scoresSection}>
              <View style={styles.scoreCard}>
                <Brain size={24} color="#6366f1" />
                <Text style={styles.scoreLabel}>IQ Score</Text>
                <Text style={styles.scoreValue}>{user.iq_score}</Text>
              </View>
              <View style={styles.scoreCard}>
                <Heart size={24} color="#ec4899" />
                <Text style={styles.scoreLabel}>EQ Score</Text>
                <Text style={styles.scoreValue}>{user.eq_score}</Text>
              </View>
              <View style={styles.scoreCard}>
                <Users size={24} color="#8b5cf6" />
                <Text style={styles.scoreLabel}>Personality</Text>
                <Text style={styles.scoreValue}>{user.mbti_type || 'Take Test'}</Text>
              </View>
            </View>

            {/* MBTI Section */}
            {user.mbti_type ? (
              <View style={styles.mbtiSection}>
                <View style={styles.mbtiHeader}>
                  <Text style={styles.mbtiTitle}>Personality Type: {user.mbti_type}</Text>
                  <TouchableOpacity onPress={handleTakeMBTITest}>
                    <Text style={styles.retakeText}>Retake Test</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity style={styles.mbtiTestButton} onPress={handleTakeMBTITest}>
                <Users size={24} color="#6366f1" />
                <View style={styles.mbtiTestContent}>
                  <Text style={styles.mbtiTestTitle}>Take Personality Test</Text>
                  <Text style={styles.mbtiTestSubtitle}>Discover your MBTI type and improve matches</Text>
                </View>
              </TouchableOpacity>
            )}

            {/* Photo Upload Section */}
            <PhotoUpload
              photos={user.profile_photos || []}
              onPhotosChange={handlePhotosChange}
              maxPhotos={6}
            />

            {/* Bio Section */}
            <View style={styles.bioSection}>
              <View style={styles.bioHeader}>
                <Text style={styles.bioLabel}>About Me</Text>
                <View style={styles.bioActions}>
                  <TouchableOpacity 
                    style={styles.aiButton}
                    onPress={handleEditBio}
                  >
                    <Sparkles size={16} color="#6366f1" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.editButton}
                    onPress={() => setEditingBio(true)}
                  >
                    <Edit3 size={16} color="#6366f1" />
                  </TouchableOpacity>
                </View>
              </View>
              
              {editingBio ? (
                <View style={styles.bioEditContainer}>
                  <TextInput
                    style={styles.bioEditInput}
                    value={bioText}
                    onChangeText={setBioText}
                    placeholder="Tell people about yourself..."
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                  <View style={styles.bioEditActions}>
                    <TouchableOpacity 
                      style={styles.saveButton}
                      onPress={handleSaveBio}
                      disabled={loading}
                    >
                      <Text style={styles.saveButtonText}>
                        {loading ? 'Saving...' : 'Save'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.cancelButton}
                      onPress={() => {
                        setEditingBio(false);
                        setBioText(user.bio || '');
                      }}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <Text style={styles.bioText}>
                  {user.bio || 'Add a bio to tell people about yourself...'}
                </Text>
              )}
            </View>

            {/* Profile Stats Section */}
            <View style={styles.statsSection}>
              <Text style={styles.statsTitle}>Profile Stats</Text>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Profile Completion</Text>
                <Text style={styles.statValue}>{profileCompletion}%</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Member Since</Text>
                <Text style={styles.statValue}>
                  {new Date(user.created_at).toLocaleDateString()}
                </Text>
              </View>
              {user.intent && (
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Looking For</Text>
                  <Text style={styles.statValue}>
                    {user.intent === 'dating' ? 'Dating' : 'Friendship'}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function calculateProfileCompletion(user: any): number {
  let completion = 0;
  const fields = [
    user.username,
    user.bio,
    user.iq_score > 0,
    user.eq_score > 0,
    user.mbti_type,
    user.intent,
    user.profile_photos?.length > 0
  ];
  
  fields.forEach(field => {
    if (field) completion += 100 / fields.length;
  });
  
  return Math.round(completion);
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
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogo: {
    marginRight: 8,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: 'white',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
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
  infoCard: {
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
  nameSection: {
    marginBottom: 24,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#333',
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  editInput: {
    flex: 1,
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#333',
    borderBottomWidth: 2,
    borderBottomColor: '#6366f1',
    paddingVertical: 4,
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
  },
  scoresSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  scoreCard: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#666',
    marginTop: 8,
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#333',
  },
  mbtiSection: {
    marginBottom: 24,
  },
  mbtiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mbtiTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
  },
  retakeText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6366f1',
  },
  mbtiTestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#6366f1',
    borderStyle: 'solid',
  },
  mbtiTestContent: {
    marginLeft: 16,
    flex: 1,
  },
  mbtiTestTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#6366f1',
    marginBottom: 4,
  },
  mbtiTestSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  bioSection: {
    marginBottom: 24,
  },
  bioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bioLabel: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
  },
  bioActions: {
    flexDirection: 'row',
    gap: 8,
  },
  aiButton: {
    padding: 8,
  },
  editButton: {
    padding: 8,
  },
  bioText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 24,
  },
  bioEditContainer: {
    gap: 12,
  },
  bioEditInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#333',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    minHeight: 100,
  },
  bioEditActions: {
    flexDirection: 'row',
    gap: 12,
  },
  saveButton: {
    backgroundColor: '#10b981',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flex: 1,
  },
  saveButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
    textAlign: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flex: 1,
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#666',
    textAlign: 'center',
  },
  statsSection: {},
  statsTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  statValue: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
  },
});