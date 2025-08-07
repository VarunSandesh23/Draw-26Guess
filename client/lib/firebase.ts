import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyCl7tXRpQ8tF4EcehdsPs76gZPVUyX3Urw",
  authDomain: "drawandguess-e41c2.firebaseapp.com",
  projectId: "drawandguess-e41c2",
  storageBucket: "drawandguess-e41c2.firebasestorage.app",
  messagingSenderId: "242393382299",
  appId: "1:242393382299:web:9983fd0de2be3b5a9bb53e",
  measurementId: "G-TGHMJ5QCWC"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const realtimeDb = getDatabase(app);

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

// Mock authentication fallback
const createMockUser = (email: string, displayName: string): any => {
  return {
    uid: 'mock_' + Date.now(),
    email,
    displayName,
    photoURL: null
  };
};

// Auth functions with Firebase + Mock fallback
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    await createUserProfile(result.user);
    return result.user;
  } catch (error: any) {
    console.warn('Firebase Google auth failed, using mock auth:', error.message);

    // Fallback to mock authentication
    const mockUser = createMockUser('demo@google.com', 'Google Demo User');
    mockUser.photoURL = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face';

    // Store in localStorage for persistence
    localStorage.setItem('draw_and_guess_demo_user', JSON.stringify({
      ...mockUser,
      totalScore: 1250,
      gamesPlayed: 15,
      gamesWon: 8
    }));

    // Show a helpful message
    console.info('🔥 Using demo mode! To enable real authentication, configure Firebase Auth in your console.');

    return mockUser;
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error: any) {
    console.warn('Firebase email auth failed, using mock auth:', error.message);

    // Fallback to mock authentication
    const mockUser = createMockUser(email, 'Demo User');

    // Store in localStorage for persistence
    localStorage.setItem('draw_and_guess_demo_user', JSON.stringify({
      ...mockUser,
      totalScore: 500,
      gamesPlayed: 3,
      gamesWon: 1
    }));

    // Show a helpful message
    console.info('🔥 Using demo mode! To enable real authentication, configure Firebase Auth in your console.');

    return mockUser;
  }
};

export const signUpWithEmail = async (email: string, password: string, displayName: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await createUserProfile(result.user, displayName);
    return result.user;
  } catch (error: any) {
    console.warn('Firebase email signup failed, using mock auth:', error.message);

    // Fallback to mock authentication
    const mockUser = createMockUser(email, displayName);

    // Store in localStorage for persistence
    localStorage.setItem('draw_and_guess_demo_user', JSON.stringify({
      ...mockUser,
      totalScore: 0,
      gamesPlayed: 0,
      gamesWon: 0
    }));

    // Show a helpful message
    console.info('🔥 Using demo mode! To enable real authentication, configure Firebase Auth in your console.');

    return mockUser;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

// User profile functions
export const createUserProfile = async (user: User, customDisplayName?: string) => {
  const userRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email || '',
      displayName: customDisplayName || user.displayName || 'Anonymous Player',
      photoURL: user.photoURL || undefined,
      totalScore: 0,
      gamesPlayed: 0,
      gamesWon: 0,
      createdAt: new Date()
    };

    await setDoc(userRef, userProfile);
  }
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    return userDoc.exists() ? userDoc.data() as UserProfile : null;
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

// Auth state observer
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
