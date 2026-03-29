import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  addDoc,
  updateDoc,
  deleteDoc,
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  serverTimestamp,
  increment,
  Timestamp
} from 'firebase/firestore';
import { 
  getMessaging, 
  getToken, 
  onMessage,
  type Messaging
} from 'firebase/messaging';

// Configuration Firebase - Lambda Enterprise
const firebaseConfig = {
  apiKey: "AIzaSyCPGgtXoDUycykLaTSee0S0yY0tkeJpqKI",
  authDomain: "data-com-a94a8.firebaseapp.com",
  projectId: "data-com-a94a8",
  storageBucket: "data-com-a94a8.firebasestorage.app",
  messagingSenderId: "276904640935",
  appId: "1:276904640935:web:9cd805aeba6c34c767f682"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Initialize Messaging (only in browser)
let messaging: Messaging | null = null;
if (typeof window !== 'undefined' && 'Notification' in window) {
  try {
    messaging = getMessaging(app);
  } catch (error) {
    console.warn('Firebase Messaging not available:', error);
  }
}

// FCM Token management
export async function requestNotificationPermission(): Promise<string | null> {
  if (!messaging) return null;
  
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission denied');
      return null;
    }
    
    // Get FCM token with V1 API (new method)
    const token = await getToken(messaging, {
      vapidKey: 'BLJ8L1E8L2J3K4L5M6N7O8P9Q0R1S2T3U4V5W6X7Y8Z9A0B1C2D3E4F5G6H7I8J9K0L1M2N3O4P5Q6R7S8T9U0V1W2X3Y4Z5A6B7C8D9E0F1'
    });
    
    if (token) {
      console.log('FCM Token obtained:', token.substring(0, 20) + '...');
      return token;
    }
    return null;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
}

// Save FCM token to Firestore
export async function saveFCMToken(userId: string, token: string): Promise<void> {
  try {
    await setDoc(doc(db, 'fcm_tokens', userId), {
      token,
      userId,
      platform: 'web',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      active: true
    });
  } catch (error) {
    console.error('Error saving FCM token:', error);
  }
}

// Listen to foreground messages
export function onForegroundMessage(callback: (payload: any) => void): () => void {
  if (!messaging) return () => {};
  
  return onMessage(messaging, (payload) => {
    console.log('Foreground message received:', payload);
    callback(payload);
  });
}

// Export Firebase instances and utilities
export { 
  app, 
  db, 
  messaging,
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  addDoc,
  updateDoc,
  deleteDoc,
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  serverTimestamp,
  increment,
  Timestamp
};

// Types
export interface User {
  uid: string;
  nom: string;
  prenom: string;
  email: string;
  contact?: string;
  departement?: string;
  poste?: string;
  photoURL?: string;
  role: 'admin' | 'employee' | 'manager';
  createdAt?: Timestamp | { seconds: number; nanoseconds: number };
  fcmToken?: string;
  isOnline?: boolean;
  lastSeen?: Timestamp | { seconds: number; nanoseconds: number };
  password?: string;
}

export interface Post {
  id: string;
  txt: string;
  mediaURL?: string;
  mediaType?: 'image' | 'video';
  uid: string;
  uName: string;
  uPhoto?: string;
  uDept?: string;
  ts: Timestamp | { seconds: number; nanoseconds: number };
  tsMs: number;
  likes: Record<string, boolean>;
  likeCount: number;
  shareCount: number;
  commentCount: number;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'general' | 'post' | 'mention' | 'system';
  senderId: string;
  senderName: string;
  recipientId?: string;
  recipientIds?: string[];
  targetUrl?: string;
  read: boolean;
  ts: Timestamp | { seconds: number; nanoseconds: number };
  tsMs: number;
}

export interface CompanySettings {
  name: string;
  logo?: string;
  primaryColor?: string;
  workStartTime: string;
  workEndTime: string;
  timezone: string;
}
