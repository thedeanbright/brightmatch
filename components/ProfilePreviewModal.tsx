import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Brain, Heart, Users, Target } from 'lucide-react-native';
import { UserProfile } from '@/lib/database';

interface ProfilePreviewModalProps {
  visible: boolean;
  user: UserProfile | null;
  currentUser: UserProfile | null;
  onClose: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function ProfilePreviewModal({
  visible,
  user,
  currentUser,
  onClose
}: ProfilePreviewModalProps) {
  if (!visible || !user) {
    return null;
  }

  const compatibility = currentUser ? calculateCompatibility(currentUser, user) : 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.8)', 'rgba(0, 0, 0, 0.9)']}
          style={styles.gradient}
        >
          <View style={styles.container}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color="white" />
            </TouchableOpacity>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {/* Photo Section */}
              <View style={styles.photoSection}>
                <Image 
                  source={{ 
                    uri: user.profile_photos?.[0] || 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg'
                  }}
                  style={styles.photoCarousel}
                  resizeMode="cover"
                />
                
                {/* Compatibility Badge */}
                <View style={styles.compatibilityBadge}>
                  <Text style={styles.compatibilityText}>{compatibility}% Match</Text>
                </View>
              </View>

              {/* User Info Card */}
              <View style={styles.infoCard}>
                {/* Name and Username */}
                <View style={styles.nameSection}>
                  <Text style={styles.name}>@{user.username || 'user'}</Text>
                </View>

                {/* Intent Badge */}
                {user.intent && (
                  <View style={styles.intentContainer}>
                    <View style={styles.intentBadge}>
                      <Target size={16} color="#6366f1" />
                      <Text style={styles.intentText}>
                        Looking for {user.intent === 'dating' ? 'Dating' : 'Friendship'}
                      </Text>
                    </View>
                  </View>
                )}

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
                  {user.mbti_type && (
                    <View style={styles.scoreCard}>
                      <Users size={24} color="#8b5cf6" />
                      <Text style={styles.scoreLabel}>Personality</Text>
                      <Text style={styles.scoreValue}>{user.mbti_type}</Text>
                    </View>
                  )}
                </View>

                {/* Bio Section */}
                {user.bio && (
                  <View style={styles.bioSection}>
                    <Text style={styles.bioLabel}>About</Text>
                    <Text style={styles.bioText}>{user.bio}</Text>
                  </View>
                )}

                {/* Additional Photos */}
                {user.profile_photos && user.profile_photos.length > 1 && (
                  <View style={styles.photosSection}>
                    <Text style={styles.photosTitle}>More Photos</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photosScroll}>
                      {user.profile_photos.slice(1).map((photo, index) => (
                        <Image
                          key={index}
                          source={{ uri: photo }}
                          style={styles.additionalPhoto}
                          resizeMode="cover"
                        />
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
}

function calculateCompatibility(user1: UserProfile, user2: UserProfile): number {
  let totalScore = 0;
  let factors = 0;

  // IQ similarity (25% weight)
  if (user1.iq_score > 0 && user2.iq_score > 0) {
    const iqDiff = Math.abs(user1.iq_score - user2.iq_score);
    const iqScore = Math.max(0, 100 - (iqDiff / 2));
    totalScore += iqScore * 0.25;
    factors += 0.25;
  }

  // EQ similarity (25% weight)
  if (user1.eq_score > 0 && user2.eq_score > 0) {
    const eqDiff = Math.abs(user1.eq_score - user2.eq_score);
    const eqScore = Math.max(0, 100 - (eqDiff / 2));
    totalScore += eqScore * 0.25;
    factors += 0.25;
  }

  // Intent alignment (30% weight)
  if (user1.intent && user2.intent) {
    if (user1.intent === user2.intent) {
      totalScore += 100 * 0.30;
    } else {
      totalScore += 30 * 0.30;
    }
    factors += 0.30;
  }

  // MBTI compatibility (20% weight)
  if (user1.mbti_type && user2.mbti_type) {
    const mbtiScore = user1.mbti_type === user2.mbti_type ? 90 : 70;
    totalScore += mbtiScore * 0.20;
    factors += 0.20;
  }

  if (factors === 0) return 50;

  const finalScore = Math.round(totalScore / factors);
  return Math.max(10, Math.min(99, finalScore));
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  gradient: {
    width: screenWidth,
    height: screenHeight,
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: screenHeight * 0.9,
    minHeight: screenHeight * 0.7,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  content: {
    flex: 1,
  },
  photoSection: {
    position: 'relative',
  },
  photoCarousel: {
    width: '100%',
    height: 300,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  compatibilityBadge: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: 'rgba(99, 102, 241, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  compatibilityText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: 'white',
  },
  infoCard: {
    padding: 24,
  },
  nameSection: {
    marginBottom: 16,
  },
  name: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#333',
    marginBottom: 8,
  },
  intentContainer: {
    marginBottom: 24,
  },
  intentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  intentText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6366f1',
    marginLeft: 6,
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
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#333',
  },
  bioSection: {
    marginBottom: 24,
  },
  bioLabel: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 12,
  },
  bioText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 24,
  },
  photosSection: {
    marginBottom: 24,
  },
  photosTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 12,
  },
  photosScroll: {
    flexDirection: 'row',
  },
  additionalPhoto: {
    width: 100,
    height: 120,
    borderRadius: 12,
    marginRight: 12,
  },
});