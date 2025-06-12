import { User, Match, Message } from '@/types/user';
import { SAMPLE_USERS } from './testData';

// Simulated storage - in production, this would be replaced with a proper backend
class StorageService {
  private users: User[] = SAMPLE_USERS;
  private matches: Match[] = [];
  private messages: Message[] = [];
  private currentUserId: string | null = null;

  // User management
  setCurrentUser(userId: string) {
    this.currentUserId = userId;
  }

  getCurrentUser(): User | null {
    if (!this.currentUserId) return null;
    return this.users.find(u => u.id === this.currentUserId) || null;
  }

  createUser(user: Omit<User, 'id'>): User {
    const newUser: User = {
      ...user,
      id: Date.now().toString()
    };
    this.users.push(newUser);
    return newUser;
  }

  updateUser(userId: string, updates: Partial<User>): User | null {
    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex === -1) return null;
    
    this.users[userIndex] = { ...this.users[userIndex], ...updates };
    return this.users[userIndex];
  }

  // Discovery
  getDiscoveryUsers(excludeIds: string[] = []): User[] {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return [];

    return this.users.filter(user => 
      user.id !== currentUser.id && 
      !excludeIds.includes(user.id) &&
      user.profileCompleted
    );
  }

  // Matching
  createMatch(userId1: string, userId2: string): Match {
    const match: Match = {
      id: Date.now().toString(),
      users: [userId1, userId2],
      createdAt: new Date()
    };
    this.matches.push(match);
    return match;
  }

  getUserMatches(userId: string): Match[] {
    return this.matches.filter(match => 
      match.users.includes(userId)
    );
  }

  // Messages
  sendMessage(matchId: string, senderId: string, text: string): Message {
    const message: Message = {
      id: Date.now().toString(),
      matchId,
      senderId,
      text,
      timestamp: new Date(),
      read: false
    };
    this.messages.push(message);
    
    // Update match with last message
    const matchIndex = this.matches.findIndex(m => m.id === matchId);
    if (matchIndex !== -1) {
      this.matches[matchIndex].lastMessage = message;
    }
    
    return message;
  }

  getMatchMessages(matchId: string): Message[] {
    return this.messages
      .filter(msg => msg.matchId === matchId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  // Leaderboard
  getLeaderboard(city?: string): User[] {
    let filteredUsers = this.users.filter(u => u.profileCompleted);
    
    if (city) {
      filteredUsers = filteredUsers.filter(u => u.location.city === city);
    }

    return filteredUsers
      .map(user => ({
        ...user,
        totalScore: user.iqScore + user.eqScore
      }))
      .sort((a, b) => b.totalScore - a.totalScore);
  }

  getUserById(id: string): User | undefined {
    return this.users.find(u => u.id === id);
  }
}

export const storage = new StorageService();