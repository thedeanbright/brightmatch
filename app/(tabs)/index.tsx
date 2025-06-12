import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Heart, RotateCcw, Users } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import SwipeCard from '@/components/SwipeCard';
import MatchSuccessModal from '@/components/MatchSuccessModal';
import BrightMatchLogo from '@/components/BrightMatchLogo';
import { useAuth } from '@/contexts/AuthContext';
import { databaseService, UserProfile } from '@/lib/database';

const { height: screenHeight } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [matchedUser, setMatchedUser] = useState<UserProfile | null>(null);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadUsers();
    }
  }, [user]);

  const loadUsers = async () => {
    if (!user) {
      console.log('No user available for loading discovery users');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('Loading discovery users for:', user.id);
      
      // Try to get matched users first, fallback to discovery
      let { data: discoveryUsers, error } = await databaseService.findMatches(user.id);
      
      if (error || !discoveryUsers || discoveryUsers.length === 0) {
        console.log('No matched users found, falling back to general discovery');
        // Fallback to general discovery
        const result = await databaseService.getDiscoveryUsers(user.id, 20);
        discoveryUsers = result.data;
        
        if (result.error) {
          console.error('Error loading discovery users:', result.error);
          setError('Failed to load potential matches. Please try again.');
          return;
        }
      }

      if (discoveryUsers && discoveryUsers.length > 0) {
        console.log('Loaded discovery users:', discoveryUsers.length);
        setUsers(discoveryUsers);
      } else {
        console.log('No discovery users found');
        setUsers([]);
      }
    } catch (error) {
      console.error('Unexpected error loading users:', error);
      setError('Failed to load potential matches. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (direction: 'left' | 'right') => {
    const currentUser = users[currentIndex];
    if (!currentUser || !user) {
      console.log('No current user or auth user for swipe');
      return;
    }

    try {
      console.log('Recording swipe:', direction, 'on user:', currentUser.id);
      
      // Record the swipe
      const { error: swipeError } = await databaseService.recordSwipe({
        swiper_id: user.id,
        swiped_id: currentUser.id,
        direction
      });

      if (swipeError) {
        console.error('Error recording swipe:', swipeError);
        // Don't block the UI for swipe recording errors
      }

      // For demo purposes, simulate a match on right swipe (20% chance)
      const isMatch = direction === 'right' && Math.random() < 0.2;

      if (isMatch) {
        console.log('Match detected! Creating match...');
        // Create match
        const { error: matchError } = await databaseService.createMatch(user.id, currentUser.id);
        
        if (matchError) {
          console.error('Error creating match:', matchError);
        } else {
          setMatchedUser(currentUser);
          setShowMatchModal(true);
        }
      }

      // Move to next card
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
      }, 300);

    } catch (error) {
      console.error('Unexpected error handling swipe:', error);
      // Don't block the UI for swipe errors
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
      }, 300);
    }
  };

  const handleButtonSwipe = (direction: 'left' | 'right') => {
    handleSwipe(direction);
  };

  const resetCards = () => {
    setCurrentIndex(0);
    setError(null);
    loadUsers();
  };

  const handleMatchModalClose = () => {
    setShowMatchModal(false);
    setMatchedUser(null);
  };

  const handleSendMessage = () => {
    setShowMatchModal(false);
    setMatchedUser(null);
    router.push('/(tabs)/messages');
  };

  const handleRetry = () => {
    setError(null);
    loadUsers();
  };

  if (loading) {
    return (
      <LinearGradient
        colors={['#6366f1', '#8b5cf6']}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <BrightMatchLogo size={32} />
              <Text style={styles.logo}>BrightMatch</Text>
            </View>
          </View>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingTitle}>Finding your perfect matches...</Text>
            <Text style={styles.loadingSubtitle}>Based on your IQ, EQ, and personality</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (error) {
    return (
      <LinearGradient
        colors={['#6366f1', '#8b5cf6']}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <BrightMatchLogo size={32} />
              <Text style={styles.logo}>BrightMatch</Text>
            </View>
          </View>
          <View style={styles.errorState}>
            <Users size={64} color="rgba(255, 255, 255, 0.6)" />
            <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
            <Text style={styles.errorSubtitle}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const currentUser = users[currentIndex];
  const nextUser = users[currentIndex + 1];

  if (!currentUser) {
    return (
      <LinearGradient
        colors={['#6366f1', '#8b5cf6']}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <BrightMatchLogo size={32} />
              <Text style={styles.logo}>BrightMatch</Text>
            </View>
          </View>
          <View style={styles.emptyState}>
            <Users size={64} color="rgba(255, 255, 255, 0.6)" />
            <Text style={styles.emptyTitle}>No more profiles!</Text>
            <Text style={styles.emptySubtitle}>
              You've seen all available matches in your area.
            </Text>
            <TouchableOpacity style={styles.resetButton} onPress={resetCards}>
              <RotateCcw size={20} color="#6366f1" />
              <Text style={styles.resetButtonText}>Reset Cards</Text>
            </TouchableOpacity>
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
          <View style={styles.logoContainer}>
            <BrightMatchLogo size={32} />
            <Text style={styles.logo}>BrightMatch</Text>
          </View>
          <View style={styles.statsContainer}>
            <Text style={styles.statsText}>
              {users.length - currentIndex} profiles remaining
            </Text>
          </View>
        </View>

        <View style={styles.cardContainer}>
          {nextUser && (
            <SwipeCard
              user={nextUser}
              currentUser={user}
              onSwipe={handleSwipe}
              isActive={false}
            />
          )}
          <SwipeCard
            user={currentUser}
            currentUser={user}
            onSwipe={handleSwipe}
            isActive={true}
          />
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => handleButtonSwipe('left')}
          >
            <X size={32} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.likeButton]}
            onPress={() => handleButtonSwipe('right')}
          >
            <Heart size={32} color="white" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <MatchSuccessModal
        visible={showMatchModal}
        currentUser={user}
        matchedUser={matchedUser}
        onClose={handleMatchModalClose}
        onSendMessage={handleSendMessage}
      />
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginLeft: 8,
  },
  statsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statsText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: 'white',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  actionButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  rejectButton: {
    backgroundColor: '#ef4444',
  },
  likeButton: {
    backgroundColor: '#10b981',
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
    marginBottom: 8,
  },
  loadingSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
  },
  errorState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: 'white',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  retryButton: {
    backgroundColor: 'white',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  retryButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#6366f1',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: 'white',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  resetButton: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  resetButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#6366f1',
  },
});