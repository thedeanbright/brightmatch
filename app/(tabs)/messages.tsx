import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { MessageCircle, Brain, Heart, Sparkles } from 'lucide-react-native';
import { Database } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';
import ImageCarousel from '@/components/ImageCarousel';
import { generateAIIcebreaker } from '@/utils/ai';
import { databaseService } from '@/lib/database';
import { calculateCompatibility } from '@/utils/compatibility';

type Match = {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
  last_message_at: string | null;
  other_user: Database['public']['Tables']['users']['Row'];
  latest_message?: {
    content: string;
    sender_id: string;
    created_at: string;
  };
};

export default function MessagesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    if (!user) return;

    try {
      const { data, error } = await databaseService.getUserMatches(user.id);
      
      if (error) {
        console.error('Error loading matches:', error);
        return;
      }

      setMatches(data || []);
    } catch (error) {
      console.error('Error loading matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  const generateIcebreaker = async (match: Match) => {
    if (!user) return;

    try {
      const icebreaker = await generateAIIcebreaker(user, match.other_user);
      
      Alert.alert(
        '✨ AI Icebreaker',
        icebreaker,
        [
          { text: 'Generate Another', onPress: () => generateIcebreaker(match) },
          { text: 'Send Message', onPress: () => sendMessage(match.id, icebreaker) },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to generate icebreaker. Please try again.');
    }
  };

  const sendMessage = async (matchId: string, content: string) => {
    if (!user) return;

    try {
      const { data, error } = await databaseService.sendMessage({
        match_id: matchId,
        sender_id: user.id,
        content
      });

      if (error) {
        Alert.alert('Error', 'Failed to send message. Please try again.');
        return;
      }

      Alert.alert('Message Sent! 🎉', 'Your message has been sent successfully.');
      loadMatches(); // Refresh matches to show new message
    } catch (error) {
      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  };

  const handleMatchPress = (match: Match) => {
    router.push({
      pathname: '/chat/[matchId]',
      params: { 
        matchId: match.id,
        userName: match.other_user.username,
        userPhoto: match.other_user.profile_photos?.[0] || ''
      }
    });
  };

  if (loading) {
    return (
      <LinearGradient
        colors={['#6366f1', '#8b5cf6']}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <MessageCircle size={28} color="white" />
              <Text style={styles.title}>Messages</Text>
            </View>
          </View>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading your matches...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (matches.length === 0) {
    return (
      <LinearGradient
        colors={['#6366f1', '#8b5cf6']}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <MessageCircle size={28} color="white" />
              <Text style={styles.title}>Messages</Text>
            </View>
          </View>
          <View style={styles.emptyState}>
            <Heart size={64} color="rgba(255, 255, 255, 0.6)" />
            <Text style={styles.emptyTitle}>No matches yet</Text>
            <Text style={styles.emptySubtitle}>
              Start swiping to find your perfect intellectual match!
            </Text>
            <TouchableOpacity 
              style={styles.startSwipingButton}
              onPress={() => router.push('/(tabs)')}
            >
              <Text style={styles.startSwipingText}>Start Swiping</Text>
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
          <View style={styles.headerContent}>
            <MessageCircle size={28} color="white" />
            <Text style={styles.title}>Messages</Text>
          </View>
          <View style={styles.matchCount}>
            <Text style={styles.matchCountText}>{matches.length} matches</Text>
          </View>
        </View>

        <ScrollView style={styles.matchesList} showsVerticalScrollIndicator={false}>
          {matches.map((match) => {
            const compatibility = user ? calculateCompatibility(user, match.other_user) : 0;
            
            return (
              <TouchableOpacity
                key={match.id}
                style={styles.matchItem}
                onPress={() => handleMatchPress(match)}
              >
                <ImageCarousel 
                  images={match.other_user.profile_photos || [match.other_user.image_url || '']} 
                  style={styles.avatar}
                  showControls={false}
                  aspectRatio={1}
                />
                
                <View style={styles.matchInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.matchName}>{match.other_user.username}</Text>
                    <View style={styles.compatibilityBadge}>
                      <Text style={styles.compatibilityText}>{compatibility}%</Text>
                    </View>
                  </View>
                  
                  {match.latest_message ? (
                    <Text style={styles.lastMessage} numberOfLines={1}>
                      {match.latest_message.sender_id === user?.id ? 'You: ' : ''}
                      {match.latest_message.content}
                    </Text>
                  ) : (
                    <Text style={styles.lastMessage}>
                      Say hello to your new match! 👋
                    </Text>
                  )}
                  
                  <View style={styles.scoresRow}>
                    <View style={styles.scoreItem}>
                      <Brain size={12} color="#6366f1" />
                      <Text style={styles.scoreText}>IQ {match.other_user.iq_score}</Text>
                    </View>
                    <View style={styles.scoreItem}>
                      <Heart size={12} color="#ec4899" />
                      <Text style={styles.scoreText}>EQ {match.other_user.eq_score}</Text>
                    </View>
                    {match.other_user.mbti_type && (
                      <View style={styles.scoreItem}>
                        <Text style={styles.mbtiText}>{match.other_user.mbti_type}</Text>
                      </View>
                    )}
                  </View>
                </View>
                
                <View style={styles.matchMeta}>
                  <Text style={styles.matchTime}>
                    {match.latest_message 
                      ? formatTime(match.latest_message.created_at)
                      : formatTime(match.created_at)
                    }
                  </Text>
                  <TouchableOpacity
                    style={styles.icebreakerButton}
                    onPress={() => generateIcebreaker(match)}
                  >
                    <Sparkles size={16} color="#6366f1" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })}
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginLeft: 12,
  },
  matchCount: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  matchCountText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    fontSize: 18,
    fontFamily: 'Inter-Medium',
    color: 'white',
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
    marginBottom: 24,
  },
  startSwipingButton: {
    backgroundColor: 'white',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  startSwipingText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#6366f1',
  },
  matchesList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  matchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 16,
  },
  matchInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  matchName: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: 'white',
    flex: 1,
  },
  compatibilityBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  compatibilityText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: 'white',
  },
  lastMessage: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
  },
  scoresRow: {
    flexDirection: 'row',
    gap: 12,
  },
  scoreItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  scoreText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  mbtiText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  matchMeta: {
    alignItems: 'flex-end',
    gap: 8,
  },
  matchTime: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  icebreakerButton: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});