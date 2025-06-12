import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Trophy, Crown, Medal, Brain, Heart } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { databaseService, UserProfile } from '@/lib/database';

type LeaderboardType = 'iq' | 'eq';

export default function LeaderboardScreen() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [activeTab, setActiveTab] = useState<LeaderboardType>('iq');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [activeTab]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const { data, error } = await databaseService.getLeaderboard(50);
      
      if (error) {
        console.error('Error loading leaderboard:', error);
        Alert.alert('Error', 'Failed to load leaderboard. Please try again.');
        return;
      }

      if (data) {
        // Filter out users with zero scores and sort by the selected score type
        const validUsers = data.filter(user => {
          if (activeTab === 'iq') {
            return user.iq_score > 0;
          } else {
            return user.eq_score > 0;
          }
        });

        const sortedUsers = [...validUsers].sort((a, b) => {
          if (activeTab === 'iq') {
            return b.iq_score - a.iq_score;
          } else {
            return b.eq_score - a.eq_score;
          }
        });
        
        setUsers(sortedUsers);
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      Alert.alert('Error', 'Failed to load leaderboard. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown size={28} color="#ffd700" />;
      case 2:
        return <Medal size={24} color="#c0c0c0" />;
      case 3:
        return <Medal size={24} color="#cd7f32" />;
      default:
        return (
          <View style={styles.rankBadge}>
            <Text style={styles.rankNumber}>{rank}</Text>
          </View>
        );
    }
  };

  const renderLeaderboardItem = (user: UserProfile, index: number) => {
    const rank = index + 1;
    const score = activeTab === 'iq' ? user.iq_score : user.eq_score;
    const isCurrentUser = currentUser?.id === user.id;
    
    return (
      <View
        key={user.id}
        style={[
          styles.leaderboardItem,
          isCurrentUser && styles.currentUserItem,
          rank <= 3 && styles.topThreeItem
        ]}
      >
        <View style={styles.rankContainer}>
          {getRankIcon(rank)}
        </View>

        <View style={styles.avatarContainer}>
          {user.profile_photos && user.profile_photos.length > 0 ? (
            <Image 
              source={{ uri: user.profile_photos[0] }} 
              style={[styles.avatar, rank === 1 && styles.goldAvatar]}
            />
          ) : (
            <View style={[styles.avatarPlaceholder, rank === 1 && styles.goldAvatar]}>
              <Text style={styles.avatarText}>
                {user.username?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.userInfo}>
          <Text style={[styles.userName, rank <= 3 && styles.topThreeName]}>
            {isCurrentUser ? 'You' : `@${user.username || 'user'}`}
          </Text>
          {user.mbti_type && (
            <Text style={styles.mbtiType}>{user.mbti_type}</Text>
          )}
          {user.intent && (
            <Text style={styles.intentText}>
              {user.intent === 'dating' ? 'Dating' : 'Friendship'}
            </Text>
          )}
        </View>

        <View style={styles.scoreContainer}>
          <Text style={[styles.scoreNumber, rank <= 3 && styles.topThreeScore]}>
            {score}
          </Text>
          <Text style={styles.scoreType}>{activeTab.toUpperCase()}</Text>
          {rank <= 3 && (
            <Text style={styles.percentileText}>
              {score >= 140 ? '99th' : score >= 120 ? '90th' : score >= 110 ? '75th' : '50th'} percentile
            </Text>
          )}
        </View>
      </View>
    );
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
              <Trophy size={28} color="white" />
              <Text style={styles.title}>Leaderboard</Text>
            </View>
          </View>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading rankings...</Text>
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
            <Trophy size={28} color="white" />
            <Text style={styles.title}>Leaderboard</Text>
          </View>
        </View>
        
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'iq' && styles.activeTab]}
            onPress={() => setActiveTab('iq')}
          >
            <Brain size={20} color={activeTab === 'iq' ? '#6366f1' : 'rgba(255, 255, 255, 0.7)'} />
            <Text style={[styles.tabText, activeTab === 'iq' && styles.activeTabText]}>
              IQ Rankings
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'eq' && styles.activeTab]}
            onPress={() => setActiveTab('eq')}
          >
            <Heart size={20} color={activeTab === 'eq' ? '#6366f1' : 'rgba(255, 255, 255, 0.7)'} />
            <Text style={[styles.tabText, activeTab === 'eq' && styles.activeTabText]}>
              EQ Rankings
            </Text>
          </TouchableOpacity>
        </View>

        {users.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Trophy size={64} color="rgba(255, 255, 255, 0.6)" />
            <Text style={styles.emptyTitle}>No Rankings Yet</Text>
            <Text style={styles.emptySubtitle}>
              Complete the {activeTab.toUpperCase()} test to see your ranking!
            </Text>
          </View>
        ) : (
          <ScrollView style={styles.leaderboardList} showsVerticalScrollIndicator={false}>
            {users.map((user, index) => renderLeaderboardItem(user, index))}
          </ScrollView>
        )}
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 4,
    marginHorizontal: 20,
    marginVertical: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  activeTab: {
    backgroundColor: 'white',
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  activeTabText: {
    color: '#6366f1',
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
  emptyContainer: {
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
  },
  leaderboardList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  currentUserItem: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderColor: 'rgba(255, 215, 0, 0.4)',
  },
  topThreeItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  rankContainer: {
    width: 50,
    alignItems: 'center',
    marginRight: 12,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankNumber: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: 'white',
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: 'white',
  },
  goldAvatar: {
    borderColor: '#ffd700',
    borderWidth: 3,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginBottom: 4,
  },
  topThreeName: {
    color: '#ffd700',
  },
  mbtiType: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 2,
  },
  intentText: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  scoreContainer: {
    alignItems: 'center',
    minWidth: 80,
  },
  scoreNumber: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: 'white',
  },
  topThreeScore: {
    color: '#ffd700',
  },
  scoreType: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  percentileText: {
    fontSize: 9,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 2,
  },
});