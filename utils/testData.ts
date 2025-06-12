import { TestQuestion } from '@/types/user';

export const IQ_QUESTIONS: TestQuestion[] = [
  {
    id: '1',
    type: 'iq',
    question: 'What comes next in the sequence: 2, 6, 12, 20, 30, ?',
    options: ['42', '40', '38', '44'],
    correctAnswer: 0 // 42 (differences: 4, 6, 8, 10, 12)
  },
  {
    id: '2',
    type: 'iq',
    question: 'If all Bloops are Razzles and all Razzles are Lazzles, then all Bloops are definitely Lazzles.',
    options: ['True', 'False'],
    correctAnswer: 0 // True (logical syllogism)
  },
  {
    id: '3',
    type: 'iq',
    question: 'Which number should replace the question mark: 3, 7, 15, 31, ?',
    options: ['63', '47', '55', '62'],
    correctAnswer: 0 // 63 (pattern: multiply by 2 and add 1)
  },
  {
    id: '4',
    type: 'iq',
    question: 'A car travels 60 miles in 1 hour. How many miles will it travel in 45 minutes?',
    options: ['45', '50', '40', '55'],
    correctAnswer: 0 // 45 miles
  },
  {
    id: '5',
    type: 'iq',
    question: 'Which word does not belong: Apple, Banana, Carrot, Orange',
    options: ['Apple', 'Banana', 'Carrot', 'Orange'],
    correctAnswer: 2 // Carrot (vegetable, others are fruits)
  },
  {
    id: '6',
    type: 'iq',
    question: 'If 5 machines make 5 widgets in 5 minutes, how long would it take 100 machines to make 100 widgets?',
    options: ['5 minutes', '100 minutes', '20 minutes', '1 minute'],
    correctAnswer: 0 // 5 minutes (each machine makes 1 widget in 5 minutes)
  },
  {
    id: '7',
    type: 'iq',
    question: 'What is the next letter in this sequence: A, D, G, J, ?',
    options: ['M', 'K', 'L', 'N'],
    correctAnswer: 0 // M (skip 2 letters each time)
  },
  {
    id: '8',
    type: 'iq',
    question: 'Which number is missing: 1, 1, 2, 3, 5, 8, ?',
    options: ['11', '13', '15', '10'],
    correctAnswer: 1 // 13 (Fibonacci sequence)
  },
  {
    id: '9',
    type: 'iq',
    question: 'If you rearrange the letters "CIFAIPC", you would have the name of a(n):',
    options: ['Ocean', 'Country', 'City', 'Animal'],
    correctAnswer: 0 // Ocean (PACIFIC)
  },
  {
    id: '10',
    type: 'iq',
    question: 'What comes next: 1, 4, 9, 16, 25, ?',
    options: ['36', '30', '35', '49'],
    correctAnswer: 0 // 36 (perfect squares: 1², 2², 3², 4², 5², 6²)
  }
];

export const EQ_QUESTIONS: TestQuestion[] = [
  {
    id: '1',
    type: 'eq',
    question: 'When a friend is upset, what is your first instinct?',
    options: [
      'Give practical advice to solve the problem',
      'Change the subject to cheer them up',
      'Share a similar experience you had',
      'Listen and offer emotional support'
    ],
    // Higher index = higher EQ (option 3 is best)
  },
  {
    id: '2',
    type: 'eq',
    question: 'How do you typically handle stress?',
    options: [
      'Keep busy to distract myself',
      'Analyze the situation logically',
      'Talk it out with friends or family',
      'Take time to process emotions before reacting'
    ],
    // Option 3 shows highest emotional intelligence
  },
  {
    id: '3',
    type: 'eq',
    question: 'In a group setting, you usually:',
    options: [
      'Take charge of the situation',
      'Focus on the task at hand',
      'Try to keep the mood light',
      'Notice how everyone is feeling'
    ],
    // Option 3 shows emotional awareness
  },
  {
    id: '4',
    type: 'eq',
    question: 'When someone disagrees with you, you:',
    options: [
      'Avoid the confrontation',
      'Stand firm in your position',
      'Find a compromise quickly',
      'Try to understand their perspective'
    ],
    // Option 3 shows empathy and emotional maturity
  },
  {
    id: '5',
    type: 'eq',
    question: 'How do you recognize your own emotions?',
    options: [
      'Others point them out to me',
      'I notice physical sensations first',
      'I analyze my thoughts and behavior',
      'I regularly check in with myself'
    ],
    // Option 3 shows self-awareness
  },
  {
    id: '6',
    type: 'eq',
    question: 'When you make a mistake that affects others, you:',
    options: [
      'Explain why it happened',
      'Try to fix it quickly',
      'Apologize and learn from it',
      'Take full responsibility and make amends'
    ],
    // Option 3 shows accountability and empathy
  },
  {
    id: '7',
    type: 'eq',
    question: 'How do you respond when someone is angry with you?',
    options: [
      'Get defensive and argue back',
      'Walk away until they calm down',
      'Try to understand why they\'re upset',
      'Stay calm and listen to their concerns'
    ],
    // Option 3 shows emotional regulation and empathy
  },
  {
    id: '8',
    type: 'eq',
    question: 'When working in a team, you:',
    options: [
      'Focus on getting the job done',
      'Make sure everyone contributes equally',
      'Help resolve conflicts between members',
      'Ensure everyone feels heard and valued'
    ],
    // Option 3 shows social awareness and leadership
  },
  {
    id: '9',
    type: 'eq',
    question: 'How do you handle criticism?',
    options: [
      'Take it personally and feel hurt',
      'Dismiss it if you disagree',
      'Consider if there\'s truth in it',
      'Thank them and reflect on the feedback'
    ],
    // Option 3 shows emotional maturity and growth mindset
  },
  {
    id: '10',
    type: 'eq',
    question: 'When you\'re feeling overwhelmed, you:',
    options: [
      'Push through and ignore the feeling',
      'Complain to others about your situation',
      'Take a break and practice self-care',
      'Identify the source and create a plan'
    ],
    // Option 3 shows self-management and emotional intelligence
  }
];

// Sample users for testing (keeping existing structure)
export const SAMPLE_USERS = [
  {
    id: '1',
    name: 'Emma',
    age: 26,
    bio: 'Adventure seeker and coffee enthusiast. Love exploring new places and deep conversations under starry skies.',
    photos: [
      'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg',
      'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg'
    ],
    location: { city: 'San Francisco', state: 'CA', country: 'USA' },
    iqScore: 128,
    eqScore: 82,
    profileCompleted: true,
    lastActive: new Date()
  },
  {
    id: '2',
    name: 'Alex',
    age: 28,
    bio: 'Software engineer by day, musician by night. Always up for hiking adventures and trying new restaurants.',
    photos: [
      'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
      'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg'
    ],
    location: { city: 'San Francisco', state: 'CA', country: 'USA' },
    iqScore: 135,
    eqScore: 68,
    profileCompleted: true,
    lastActive: new Date()
  },
  {
    id: '3',
    name: 'Sophia',
    age: 24,
    bio: 'Artist and yoga instructor. Passionate about sustainable living and mindful connections.',
    photos: [
      'https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg',
      'https://images.pexels.com/photos/1680172/pexels-photo-1680172.jpeg'
    ],
    location: { city: 'Los Angeles', state: 'CA', country: 'USA' },
    iqScore: 122,
    eqScore: 91,
    profileCompleted: true,
    lastActive: new Date()
  },
  {
    id: '4',
    name: 'Marcus',
    age: 30,
    bio: 'Entrepreneur and fitness enthusiast. Looking for someone who shares my passion for growth and adventure.',
    photos: [
      'https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg',
      'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg'
    ],
    location: { city: 'New York', state: 'NY', country: 'USA' },
    iqScore: 141,
    eqScore: 76,
    profileCompleted: true,
    lastActive: new Date()
  }
];