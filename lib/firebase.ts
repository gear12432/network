import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  getDocFromServer,
  Firestore,
} from 'firebase/firestore';
import firebaseConfig from '@/firebase-applet-config.json';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore
// Use named firestoreDatabaseId if configured
let dbInstance: Firestore;
try {
  if (firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)') {
    dbInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId);
  } else {
    dbInstance = getFirestore(app);
  }
} catch {
  dbInstance = getFirestore(app);
}

export const db = dbInstance;
export { app };

// Test connection on boot per Firebase skill guidelines
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or initializing.');
    }
  }
}

export interface UserAccountData {
  loginUid: string; // e.g. "GK37643"
  fullName: string;
  mobile: string;
  email: string;
  password: string;
  kycDetails: {
    idType: string;
    idNumber: string;
    dob: string;
    gender: string;
  };
  addressDetails: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  balance?: number;
  vipLevel?: number;
  status?: string;
  createdAt?: string;
}

// Generate unique Login UID e.g. "GK37643"
export async function generateUniqueLoginUid(): Promise<string> {
  let attempts = 0;
  while (attempts < 5) {
    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    const candidateUid = `GK${randomDigits}`;
    try {
      const docRef = doc(db, 'users', candidateUid);
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) {
        return candidateUid;
      }
    } catch {
      // If offline or network issue, return candidate UID directly
      return candidateUid;
    }
    attempts++;
  }
  return `GK${Math.floor(10000 + Math.random() * 90000)}`;
}

// Save complete user registration to Firestore
export async function saveUserToFirestore(userData: UserAccountData): Promise<{ success: boolean; error?: string }> {
  try {
    const docRef = doc(db, 'users', userData.loginUid);
    const payload = {
      ...userData,
      status: userData.status || 'active',
      balance: userData.balance ?? 12500,
      vipLevel: userData.vipLevel ?? 1,
      createdAt: userData.createdAt || new Date().toISOString(),
    };
    await setDoc(docRef, payload);
    return { success: true };
  } catch (err: unknown) {
    console.error('Error saving user to Firestore:', err);
    const message = err instanceof Error ? err.message : 'Failed to save to Firestore';
    return { success: false, error: message };
  }
}

// Find user by Login UID, email, or mobile
export async function findUserInFirestore(identifier: string): Promise<UserAccountData | null> {
  const cleanId = identifier.trim();
  if (!cleanId) return null;

  try {
    // 1. First attempt direct document lookup by loginUid (case-insensitive check)
    const upperId = cleanId.toUpperCase();
    const docRef = doc(db, 'users', upperId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as UserAccountData;
    }

    // Direct match with verbatim string
    const docRefExact = doc(db, 'users', cleanId);
    const snapExact = await getDoc(docRefExact);
    if (snapExact.exists()) {
      return snapExact.data() as UserAccountData;
    }

    // 2. Query by email
    const usersRef = collection(db, 'users');
    const qEmail = query(usersRef, where('email', '==', cleanId.toLowerCase()));
    const snapEmail = await getDocs(qEmail);
    if (!snapEmail.empty) {
      return snapEmail.docs[0].data() as UserAccountData;
    }

    // 3. Query by mobile
    const qMobile = query(usersRef, where('mobile', '==', cleanId));
    const snapMobile = await getDocs(qMobile);
    if (!snapMobile.empty) {
      return snapMobile.docs[0].data() as UserAccountData;
    }

    return null;
  } catch (err) {
    console.error('Error fetching user from Firestore:', err);
    return null;
  }
}
