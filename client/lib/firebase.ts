import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';

const firebaseConfig = {
  // These would be replaced with actual Firebase config
  // For demo purposes, using a minimal config that won't cause errors
  apiKey: "demo-api-key",
  authDomain: "demo-project.firebaseapp.com",
  projectId: "demo-project",
  storageBucket: "demo-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456789"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
// Realtime Database will be added when needed for canvas synchronization

const googleProvider = new GoogleAuthProvider();

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  totalScore: number;
  gamesPlayed: number;
  gamesWon: number;
  createdAt: Date;
}

export interface GameRoom {
  roomCode: string;
  players: Player[];
  currentDrawer?: string;
  currentWord?: string;
  round: number;
  maxRounds: number;
  started: boolean;
  createdBy: string;
  createdAt: Date;
}

export interface Player {
  uid: string;
  name: string;
  photoURL?: string;
  score: number;
  isReady: boolean;
}

// Mock auth functions for demo purposes
const MOCK_USERS_KEY = 'draw_and_guess_mock_users';
const CURRENT_USER_KEY = 'draw_and_guess_current_user';

// Mock user object that simulates Firebase User
interface MockUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
}

// Get mock users from localStorage
const getMockUsers = (): Record<string, { email: string; password: string; profile: UserProfile }> => {
  const stored = localStorage.getItem(MOCK_USERS_KEY);
  return stored ? JSON.parse(stored) : {};
};

// Save mock users to localStorage
const saveMockUsers = (users: Record<string, { email: string; password: string; profile: UserProfile }>) => {
  localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
};

// Get current mock user
const getCurrentMockUser = (): MockUser | null => {
  const stored = localStorage.getItem(CURRENT_USER_KEY);
  return stored ? JSON.parse(stored) : null;
};

// Save current mock user
const saveCurrentMockUser = (user: MockUser | null) => {
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
};

// Auth functions
export const signInWithGoogle = async () => {
  try {
    // Mock Google sign-in
    const mockUser: MockUser = {
      uid: 'google_' + Date.now(),
      email: 'demo@google.com',
      displayName: 'Google Demo User',
      photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    };

    const userProfile: UserProfile = {
      uid: mockUser.uid,
      email: mockUser.email,
      displayName: mockUser.displayName,
      photoURL: mockUser.photoURL,
      totalScore: 1250,
      gamesPlayed: 15,
      gamesWon: 8,
      createdAt: new Date()
    };

    const users = getMockUsers();
    users[mockUser.uid] = {
      email: mockUser.email,
      password: '',
      profile: userProfile
    };
    saveMockUsers(users);
    saveCurrentMockUser(mockUser);

    return mockUser as any;
  } catch (error) {
    console.error('Google sign in error:', error);
    throw error;
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  try {
    const users = getMockUsers();
    const userEntry = Object.values(users).find(u => u.email === email && u.password === password);

    if (!userEntry) {
      throw new Error('Invalid email or password');
    }

    const mockUser: MockUser = {
      uid: userEntry.profile.uid,
      email: userEntry.profile.email,
      displayName: userEntry.profile.displayName,
      photoURL: userEntry.profile.photoURL
    };

    saveCurrentMockUser(mockUser);
    return mockUser as any;
  } catch (error) {
    console.error('Email sign in error:', error);
    throw error;
  }
};

export const signUpWithEmail = async (email: string, password: string, displayName: string) => {
  try {
    const users = getMockUsers();

    // Check if user already exists
    const existingUser = Object.values(users).find(u => u.email === email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const mockUser: MockUser = {
      uid: 'email_' + Date.now(),
      email,
      displayName,
    };

    const userProfile: UserProfile = {
      uid: mockUser.uid,
      email: mockUser.email,
      displayName: mockUser.displayName,
      photoURL: mockUser.photoURL,
      totalScore: 0,
      gamesPlayed: 0,
      gamesWon: 0,
      createdAt: new Date()
    };

    users[mockUser.uid] = {
      email,
      password,
      profile: userProfile
    };

    saveMockUsers(users);
    saveCurrentMockUser(mockUser);

    return mockUser as any;
  } catch (error) {
    console.error('Email sign up error:', error);
    throw error;
  }
};

export const logout = async () => {
  try {
    saveCurrentMockUser(null);
    // Trigger auth state change manually for mock system
    window.dispatchEvent(new CustomEvent('mockAuthStateChange', { detail: null }));
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

// User profile functions
export const createUserProfile = async (user: any, customDisplayName?: string) => {
  // Profile is already created in the sign up process for mock system
  return;
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const users = getMockUsers();
    const userEntry = users[uid];
    return userEntry ? userEntry.profile : null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

// Room functions
export const generateRoomCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const createRoom = async (creatorUid: string): Promise<string> => {
  const roomCode = generateRoomCode();
  const roomRef = doc(db, 'rooms', roomCode);
  
  const gameRoom: GameRoom = {
    roomCode,
    players: [],
    round: 1,
    maxRounds: 3,
    started: false,
    createdBy: creatorUid,
    createdAt: new Date()
  };
  
  await setDoc(roomRef, gameRoom);
  return roomCode;
};

// Auth state observer for mock system
export const onAuthStateChange = (callback: (user: any | null) => void) => {
  // Initial call with current user
  const currentUser = getCurrentMockUser();
  callback(currentUser);

  // Listen for mock auth state changes
  const handler = (event: any) => {
    callback(event.detail);
  };

  window.addEventListener('mockAuthStateChange', handler);

  // Return unsubscribe function
  return () => {
    window.removeEventListener('mockAuthStateChange', handler);
  };
};
