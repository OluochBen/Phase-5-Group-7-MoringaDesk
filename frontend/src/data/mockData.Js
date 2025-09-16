// Mock Users
export const mockUsers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'user',
    bio: 'Full-stack developer passionate about React and Node.js. Always eager to help and learn from the community.',
    reputation: 2450,
    questionsAsked: 12,
    answersGiven: 45,
    location: 'San Francisco, CA',
    website: 'https://johndoe.dev',
    joinDate: new Date('2023-01-15'),
    lastActive: new Date(),
    badges: [
      {
        id: '1',
        name: 'Helpful',
        description: 'Provided 10 helpful answers',
        icon: '🎯',
        color: 'bg-blue-100 text-blue-800',
        earnedAt: new Date('2023-06-15')
      },
      {
        id: '2',
        name: 'React Expert',
        description: 'Answered 20 React questions',
        icon: '⚛️',
        color: 'bg-cyan-100 text-cyan-800',
        earnedAt: new Date('2023-08-20')
      }
    ]
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'admin',
    bio: 'Senior Software Engineer and community moderator. Specializing in system design and architecture.',
    reputation: 5890,
    questionsAsked: 8,
    answersGiven: 89,
    location: 'New York, NY',
    joinDate: new Date('2022-03-10'),
    lastActive: new Date(),
    badges: [
      {
        id: '3',
        name: 'Moderator',
        description: 'Community moderator',
        icon: '👑',
        color: 'bg-purple-100 text-purple-800',
        earnedAt: new Date('2022-06-10')
      },
      {
        id: '4',
        name: 'Top Contributor',
        description: 'Top 1% contributor this year',
        icon: '🏆',
        color: 'bg-yellow-100 text-yellow-800',
        earnedAt: new Date('2023-12-01')
      }
    ]
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike@example.com',
    role: 'user',
    bio: 'Frontend developer with a passion for clean code and user experience.',
    reputation: 1230,
    questionsAsked: 18,
    answersGiven: 23,
    location: 'Austin, TX',
    joinDate: new Date('2023-05-20'),
    lastActive: new Date(),
    badges: [
      {
        id: '5',
        name: 'Curious',
        description: 'Asked 10 well-received questions',
        icon: '🤔',
        color: 'bg-green-100 text-green-800',
        earnedAt: new Date('2023-09-15')
      }
    ]
  }
];

// Mock Tags
export const mockTags = [
  {
    id: '1',
    name: 'react',
    description: 'A JavaScript library for building user interfaces',
    questionCount: 2341,
    followers: 1200,
    synonyms: ['reactjs', 'react.js']
  },
  {
    id: '2',
    name: 'javascript',
    description: 'A high-level programming language',
    questionCount: 3567,
    followers: 2100,
    synonyms: ['js', 'ecmascript']
  },
  {
    id: '3',
    name: 'typescript',
    description: 'A typed superset of JavaScript',
    questionCount: 1456,
    followers: 890,
    synonyms: ['ts']
  },
  {
    id: '4',
    name: 'css',
    description: 'Cascading Style Sheets for styling web pages',
    questionCount: 1234,
    followers: 650,
    synonyms: ['css3', 'styling']
  },
  {
    id: '5',
    name: 'node.js',
    description: 'JavaScript runtime built on Chrome\'s V8 engine',
    questionCount: 987,
    followers: 780,
    synonyms: ['nodejs', 'node']
  }
];

// Mock Questions
export const mockQuestions = [
  {
    id: '1',
    title: 'How to implement JWT authentication in React with TypeScript?',
    body: `I'm building a React application with TypeScript and need to implement JWT authentication. I want to:

1. Store tokens securely
2. Handle token expiration
3. Implement automatic token refresh
4. Protect routes based on authentication

What's the best approach for managing user sessions and storing tokens? Should I use localStorage, sessionStorage, or httpOnly cookies?

Here's my current setup:

\`\`\`typescript
interface AuthContext {
  user: User | null;
  login: (token: string) => void;
  logout: () => void;
}
\`\`\`

I'm particularly concerned about security best practices and XSS attacks.`,
    authorId: '1',
    authorName: 'John Doe',
    authorReputation: 2450,
    votes: 15,
    views: 234,
    tags: ['react', 'typescript', 'jwt', 'authentication', 'security'],
    timestamp: new Date('2024-01-15T10:30:00'),
    lastActivity: new Date('2024-01-15T14:20:00'),
    status: 'open',
    isFollowing: true,
    answers: [
      {
        id: '1',
        body: `Great question! Here's a comprehensive approach for JWT authentication in React with TypeScript:

## 1. Token Storage

For security, I recommend using **httpOnly cookies** for storing JWT tokens:

\`\`\`typescript
// Set token in httpOnly cookie (backend)
res.cookie('token', jwt, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
});
\`\`\`

## 2. Auth Context Setup

\`\`\`typescript
interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
\`\`\`

## 3. Automatic Token Refresh

Implement a token refresh mechanism:

\`\`\`typescript
useEffect(() => {
  const refreshToken = async () => {
    try {
      const response = await fetch('/api/refresh', {
        method: 'POST',
        credentials: 'include'
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      logout();
    }
  };

  refreshToken();
}, []);
\`\`\`

This approach protects against XSS attacks since httpOnly cookies can't be accessed by JavaScript.`,
        authorId: '2',
        authorName: 'Jane Smith',
        authorReputation: 5890,
        votes: 24,
        timestamp: new Date('2024-01-15T14:20:00'),
        isAccepted: true,
        comments: [
          {
            id: '1',
            body: 'This is exactly what I needed! The httpOnly cookie approach is much more secure.',
            authorId: '1',
            authorName: 'John Doe',
            timestamp: new Date('2024-01-15T15:30:00'),
            votes: 3
          }
        ]
      },
      {
        id: '2',
        body: `Another approach is using a combination of localStorage and refresh tokens:

\`\`\`typescript
// Store access token in memory
let accessToken = null;

// Store refresh token in httpOnly cookie
// Access token expires in 15 minutes
// Refresh token expires in 7 days

const useAuth = () => {
  const [user, setUser] = useState(null);
  
  const refreshAccessToken = async () => {
    const response = await fetch('/api/refresh');
    const data = await response.json();
    accessToken = data.accessToken;
    return accessToken;
  };
  
  return { user, refreshAccessToken };
};
\`\`\`

This hybrid approach provides good security while maintaining usability.`,
        authorId: '3',
        authorName: 'Mike Johnson',
        authorReputation: 1230,
        votes: 8,
        timestamp: new Date('2024-01-15T16:45:00'),
        comments: []
      }
    ],
    acceptedAnswerId: '1'
  },
  {
    id: '2',
    title: 'React State Management: useState vs useReducer vs Zustand',
    body: `I'm working on a medium-sized React application and I'm confused about state management options. When should I use:

1. **useState** - for simple component state
2. **useReducer** - for complex state logic
3. **Context API** - for global state
4. **External libraries** like Zustand, Redux Toolkit

My app has:
- User authentication state
- Shopping cart functionality
- Form state management
- UI state (modals, loading states)

What are the performance implications of each approach? I'm particularly interested in avoiding unnecessary re-renders.`,
    authorId: '3',
    authorName: 'Mike Johnson',
    authorReputation: 1230,
    votes: 23,
    views: 456,
    tags: ['react', 'state-management', 'hooks', 'performance', 'zustand'],
    timestamp: new Date('2024-01-14T16:45:00'),
    lastActivity: new Date('2024-01-14T18:30:00'),
    status: 'open',
    bounty: 50,
    answers: []
  },
  {
    id: '3',
    title: 'CSS Grid vs Flexbox: Complete Guide with Examples',
    body: `I'm building responsive layouts and I'm constantly confused about when to use CSS Grid vs Flexbox. 

**My specific questions:**

1. When should I choose Grid over Flexbox?
2. Can they be used together effectively?
3. What are the performance differences?
4. How do they handle responsive design differently?

**Current scenario:**
I'm building a dashboard with:
- Header and sidebar navigation
- Main content area with cards
- Footer

Here's my current structure:
\`\`\`html
<div class="dashboard">
  <header>Navigation</header>
  <aside>Sidebar</aside>
  <main>Content cards</main>
  <footer>Footer</footer>
</div>
\`\`\`

Should the overall layout use Grid and the card arrangement use Flexbox?`,
    authorId: '4',
    authorName: 'Sarah Wilson',
    authorReputation: 890,
    votes: 31,
    views: 789,
    tags: ['css', 'grid', 'flexbox', 'layout', 'responsive-design'],
    timestamp: new Date('2024-01-13T09:15:00'),
    lastActivity: new Date('2024-01-13T15:45:00'),
    status: 'open',
    answers: [
      {
        id: '3',
        body: `Excellent question! Here's a comprehensive breakdown:

## Grid vs Flexbox Decision Matrix

**Use CSS Grid when:**
- You need 2D layouts (rows AND columns)
- You want to define the overall page structure
- You need precise control over element placement

**Use Flexbox when:**
- You need 1D layouts (either row OR column)
- You want flexible spacing between items
- You need to align items within a container

## For Your Dashboard

Perfect use case for combining both:

\`\`\`css
/* Overall layout with Grid */
.dashboard {
  display: grid;
  grid-template-areas:
    "header header"
    "sidebar main"
    "footer footer";
  grid-template-rows: auto 1fr auto;
  grid-template-columns: 250px 1fr;
  min-height: 100vh;
}

/* Content cards with Flexbox */
.content-area {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.card {
  flex: 1 1 300px; /* grow, shrink, basis */
}
\`\`\`

This gives you the best of both worlds!`,
        authorId: '1',
        authorName: 'John Doe',
        authorReputation: 2450,
        votes: 18,
        timestamp: new Date('2024-01-13T11:30:00'),
        comments: []
      }
    ]
  }
];

// Mock Notifications
export const mockNotifications = [
  {
    id: '1',
    type: 'answer',
    title: 'New Answer',
    message: 'Jane Smith answered your question about JWT authentication',
    timestamp: new Date('2024-01-15T14:20:00'),
    read: false,
    actionUrl: '/question/1'
  },
  {
    id: '2',
    type: 'vote',
    title: 'Upvote Received',
    message: 'Your answer about CSS Grid received 5 upvotes',
    timestamp: new Date('2024-01-14T18:30:00'),
    read: false
  },
  {
    id: '3',
    type: 'badge',
    title: 'New Badge Earned',
    message: 'You earned the "Helpful" badge for providing 10 helpful answers!',
    timestamp: new Date('2024-01-14T12:00:00'),
    read: true
  },
  {
    id: '4',
    type: 'mention',
    title: 'You were mentioned',
    message: 'Mike Johnson mentioned you in a comment on "React State Management"',
    timestamp: new Date('2024-01-13T16:45:00'),
    read: true
  },
  {
    id: '5',
    type: 'bounty',
    title: 'Bounty Available',
    message: 'A 50 point bounty was added to "React State Management" question',
    timestamp: new Date('2024-01-13T14:00:00'),
    read: false
  },
  {
    id: '6',
    type: 'follow',
    title: 'Question Update',
    message: 'New activity on "JWT Authentication" question you\'re following',
    timestamp: new Date('2024-01-12T11:30:00'),
    read: true,
    actionUrl: '/question/1'
  },
  {
    id: '7',
    type: 'accepted',
    title: 'Answer Accepted',
    message: 'Your answer to "CSS Grid vs Flexbox" was marked as the solution!',
    timestamp: new Date('2024-01-11T16:20:00'),
    read: true
  }
];

export const getUser = (id) => {
  return mockUsers.find(user => user.id === id);
};

export const getQuestionsByUser = (userId) => {
  return mockQuestions.filter(q => q.authorId === userId);
};

export const getAnswersByUser = (userId) => {
  const answers = [];
  mockQuestions.forEach(q => {
    q.answers.forEach(a => {
      if (a.authorId === userId) {
        answers.push(a);
      }
    });
  });
  return answers;
};

// Mock Password Reset Tokens
export const mockPasswordResetTokens = [
  {
    id: '1',
    userId: '1',
    token: '123456',
    expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes from now
    used: false,
    createdAt: new Date()
  },
  {
    id: '2',
    userId: '2',
    token: '789012',
    expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes from now
    used: false,
    createdAt: new Date()
  }
];

// Helper functions for password reset
export const generateResetToken = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const createPasswordResetToken = (userId) => {
  const token = generateResetToken();
  const resetToken = {
    id: Date.now().toString(),
    userId,
    token,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes from now
    used: false,
    createdAt: new Date()
  };
  
  mockPasswordResetTokens.push(resetToken);
  return resetToken;
};

export const validateResetToken = (token) => {
  const resetToken = mockPasswordResetTokens.find(
    rt => rt.token === token && !rt.used && rt.expiresAt > new Date()
  );
  return resetToken || null;
};

export const markTokenAsUsed = (tokenId) => {
  const tokenIndex = mockPasswordResetTokens.findIndex(rt => rt.id === tokenId);
  if (tokenIndex !== -1) {
    mockPasswordResetTokens[tokenIndex].used = true;
  }
};

export const findUserByEmail = (email) => {
  return mockUsers.find(user => user.email.toLowerCase() === email.toLowerCase()) || null;
};