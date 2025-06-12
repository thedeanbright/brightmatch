import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withSequence,
  withDelay
} from 'react-native-reanimated';
import { Heart, MessageCircle, X } from 'lucide-react-native';
import { UserProfile } from '@/lib/database';

interface MatchSuccessModalProps {
  visible: boolean;
  currentUser: UserProfile | null;
  matchedUser: UserProfile | null;
  onClose: () => void;
  onSendMessage: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function MatchSuccessModal({
  visible,
  currentUser,
  matchedUser,
  onClose,
  onSendMessage
}: MatchSuccessModalProps) {
  const scale = useSharedValue(0);
  const heartScale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Animate in
      opacity.value = withSpring(1);
      scale.value = withSequence(
        withSpring(1.1, { damping: 8 }),
        withSpring(1, { damping: 12 })
      );
      heartScale.value = withDelay(
        300,
        withSequence(
          withSpring(1.3, { damping: 6 }),
          withSpring(1, { damping: 10 })
        )
      );
    } else {
      // Animate out
      opacity.value = withSpring(0);
      scale.value = withSpring(0);
      heartScale.value = withSpring(0);
    }
  }, [visible]);

  const modalStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  if (!visible || !currentUser || !matchedUser) {
    return null;
  }

  const compatibility = calculateCompatibility(currentUser, matchedUser);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <LinearGradient
          colors={['rgba(102, 126, 234, 0.95)', 'rgba(118, 75, 162, 0.95)']}
          style={styles.gradient}
        >
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color="white" />
          </TouchableOpacity>

          <Animated.View style={[styles.container, modalStyle]}>
            <Animated.View style={[styles.heartContainer, heartStyle]}>
              <Heart size={64} color="#FF6B9D" fill="#FF6B9D" />
            </Animated.View>

            <Text style={styles.title}>It's a Match!</Text>
            <Text style={styles.subtitle}>
              You and @{matchedUser.username} liked each other
            </Text>

            <View style={styles.profilesContainer}>
              <View style={styles.profileCard}>
                <Image 
                  source={{ 
                    uri: currentUser.profile_photos?.[0] || 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg'
                  }}
                  style={styles.profileImage}
                  resizeMode="cover"
                />
                <Text style={styles.profileName}>@{currentUser.username}</Text>
              </View>

              <View style={styles.profileCard}>
                <Image 
                  source={{ 
                    uri: matchedUser.profile_photos?.[0] || 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg'
                  }}
                  style={styles.profileImage}
                  resizeMode="cover"
                />
                <Text style={styles.profileName}>@{matchedUser.username}</Text>
              </View>
            </View>

            <View style={styles.compatibilityContainer}>
              <Text style={styles.compatibilityText}>
                {compatibility}% Compatible
              </Text>
              <Text style={styles.compatibilitySubtext}>
                Based on your IQ, EQ, and shared interests
              </Text>
            </View>

            <View style={styles.buttonsContainer}>
              <TouchableOpacity style={styles.keepSwipingButton} onPress={onClose}>
                <Text style={styles.keepSwipingText}>Keep Swiping</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.sendMessageButton} onPress={onSendMessage}>
                <MessageCircle size={20} color="white" />
                <Text style={styles.sendMessageText}>Send Message</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradient: {
    width: screenWidth,
    height: screenHeight,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 8,
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    maxWidth: screenWidth - 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  heartContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  profilesContainer: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 24,
  },
  profileCard: {
    alignItems: 'center',
  },
  profileImage: {
    width: 100,
    height: 120,
    borderRadius: 16,
    marginBottom: 8,
  },
  profileName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
  },
  compatibilityContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    marginBottom: 32,
    alignItems: 'center',
  },
  compatibilityText: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#667eea',
    marginBottom: 4,
  },
  compatibilitySubtext: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#666',
    textAlign: 'center',
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  keepSwipingButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  keepSwipingText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#666',
  },
  sendMessageButton: {
    flex: 1,
    backgroundColor: '#667eea',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  sendMessageText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
});