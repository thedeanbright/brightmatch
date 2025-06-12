export interface User {
  id: string;
  name: string;
  age: number;
  bio: string;
  photos: string[];
  location: {
    city: string;
    state: string;
    country: string;
  };
  iqScore: number;
  eqScore: number;
  profileCompleted: boolean;
  lastActive: Date;
}

export interface Match {
  id: string;
  users: [string, string];
  createdAt: Date;
  lastMessage?: Message;
}

export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  text: string;
  timestamp: Date;
  read: boolean;
}

export interface TestQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer?: number;
  type: 'iq' | 'eq';
}

export interface LeaderboardEntry {
  user: User;
  rank: number;
  totalScore: number;
}