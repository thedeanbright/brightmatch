import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Image } from 'react-native';
import { PanGestureHandler, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  useAnimatedGestureHandler,
  runOnJS,
  withSpring,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Brain, Heart, Users } from 'lucide-react-native';
import { UserProfile } from '@/lib/database';
import ProfilePreviewModal from './ProfilePreviewModal';

const { width: screenWidth } = Dimensions.get('window');
const SWIPE_THRESHOLD = screenWidth * 0.3;

interface SwipeCardProps {
  user: UserProfile;
  currentUser: UserProfile | null;
  onSwipe: (direction: 'left' | 'right') => void;
  isActive: boolean;
}

export default function SwipeCard({ user, currentUser, onSwipe, isActive }: SwipeCardProps) {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(isActive ? 1 : 0.95);

  const gestureHandler = useAnimatedGestureHandler({
    onStart: () => {
      if (!isActive) return;
    },
    onActive: (event) => {
      if (!isActive) return;
      translateX.value = event.translationX;
      translateY.value = event.translationY * 0.3;
    },
    onEnd: (event) => {
      if (!isActive) return;
      
      const velocityX = event.velocityX;
      const shouldSwipeRight = translateX.value > SWIPE_THRESHOLD || velocityX > 500;
      const shouldSwipeLeft = translateX.value < -SWIPE_THRESHOLD || velocityX < -500;

      if (shouldSwipeRight) {
        translateX.value = withSpring(screenWidth + 100);
        runOnJS(onSwipe)('right');
      } else if (shouldSwipeLeft) {
        translateX.value = withSpring(-screenWidth - 100);
        runOnJS(onSwipe)('left');
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-screenWidth, 0, screenWidth],
      [-30, 0, 30],
      Extrapolate.CLAMP
    );

    const opacity = interpolate(
      Math.abs(translateX.value),
      [0, SWIPE_THRESHOLD],
      [1, 0.7],
      Extrapolate.CLAMP
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
        { scale: scale.value },
      ],
      opacity,
    };
  });

  const likeStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      [0, 1],
      Extrapolate.CLAMP
    );
    return { opacity };
  });

  const nopeStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, 0],
      [1, 0],
      Extrapolate.CLAMP
    );
    return { opacity };
  });

  const compatibility = currentUser ? calculateCompatibility(currentUser, user) : 0;
  const mainPhoto = user.profile_photos?.[0] || 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg';

  const handlePhotoTap = () => {
    setShowProfileModal(true);
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={[styles.card, animatedStyle]}>
          <TouchableOpacity onPress={handlePhotoTap} style={styles.photoTouchable}>
            <Image 
              source={{ uri: mainPhoto }}
              style={styles.image}
              resizeMode="cover"
            />
          </TouchableOpacity>
          
          <Animated.View style={[styles.likeOverlay, likeStyle]}>
            <Text style={styles.likeText}>LIKE</Text>
          </Animated.View>
          
          <Animated.View style={[styles.nopeOverlay, nopeStyle]}>
            <Text style={styles.nopeText}>NOPE</Text>
          </Animated.View>

          {/* Compatibility Score Badge */}
          <View style={styles.compatibilityBadge}>
            <Text style={styles.compatibilityText}>{compatibility}% Match</Text>
          </View>

          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.gradient}
          >
            <View style={styles.info}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>@{user.username || 'user'}</Text>
              </View>

              <View style={styles.scoresRow}>
                <View style={styles.scoreItem}>
                  <Brain size={16} color="#6366f1" />
                  <Text style={styles.scoreText}>IQ {user.iq_score}</Text>
                </View>
                <View style={styles.scoreItem}>
                  <Heart size={16} color="#ec4899" />
                  <Text style={styles.scoreText}>EQ {user.eq_score}</Text>
                </View>
                {user.mbti_type && (
                  <View style={styles.scoreItem}>
                    <Users size={16} color="#8b5cf6" />
                    <Text style={styles.scoreText}>{user.mbti_type}</Text>
                  </View>
                )}
              </View>

              {user.bio && (
                <Text style={styles.bio} numberOfLines={2}>
                  {user.bio}
                </Text>
              )}

              {user.intent && (
                <View style={styles.intentRow}>
                  <View style={styles.intentTag}>
                    <Text style={styles.intentText}>
                      Looking for {user.intent === 'dating' ? 'Dating' : 'Friendship'}
                    </Text>
                  </View>
                </View>
              )}

              <Text style={styles.tapHint}>Tap photo for full profile</Text>
            </View>
          </LinearGradient>
        </Animated.View>
      </PanGestureHandler>

      <ProfilePreviewModal
        visible={showProfileModal}
        user={user}
        currentUser={currentUser}
        onClose={() => setShowProfileModal(false)}
      />
    </GestureHandlerRootView>
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
  container: {
    position: 'absolute',
    width: screenWidth - 40,
    height: '80%',
    alignSelf: 'center',
  },
  card: {
    flex: 1,
    borderRadius: 24,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    overflow: 'hidden',
  },
  photoTouchable: {
    width: '100%',
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  compatibilityBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
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
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    justifyContent: 'flex-end',
  },
  info: {
    padding: 24,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  name: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: 'white',
  },
  scoresRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  scoreItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  scoreText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
    marginLeft: 4,
  },
  bio: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
    marginBottom: 12,
  },
  intentRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  intentTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  intentText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: 'white',
  },
  tapHint: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  likeOverlay: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    transform: [{ rotate: '20deg' }],
  },
  likeText: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: 'white',
  },
  nopeOverlay: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: '#ef4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    transform: [{ rotate: '-20deg' }],
  },
  nopeText: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: 'white',
  },
});