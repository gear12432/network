import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeFirestore,
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

// Helper to prevent long hangs on slow or intermittent network
function withTimeout<T>(promise: Promise<T>, ms: number = 4000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms)
    ),
  ]);
}

// Initialize Firestore with auto-detect long polling to avoid 10-second backend connection timeout in sandboxed/iframe/webview environments
let dbInstance: Firestore;
const customDbId =
  firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
    ? firebaseConfig.firestoreDatabaseId
    : undefined;

try {
  dbInstance = initializeFirestore(
    app,
    {
      experimentalAutoDetectLongPolling: true,
    },
    customDbId
  );
} catch {
  // If already initialized, retrieve existing instance
  try {
    dbInstance = customDbId ? getFirestore(app, customDbId) : getFirestore(app);
  } catch {
    dbInstance = getFirestore(app);
  }
}

export const db = dbInstance;
export { app };

// Test connection on boot with non-blocking timeout per Firebase skill
export async function testConnection() {
  try {
    await withTimeout(getDocFromServer(doc(db, 'test', 'connection')), 3500);
  } catch (error) {
    if (error instanceof Error) {
      // Gracefully log offline / pending status without throwing uncaught errors
      console.warn('Firebase client offline or connecting in background:', error.message);
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
  while (attempts < 3) {
    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    const candidateUid = `GK${randomDigits}`;
    try {
      const docRef = doc(db, 'users', candidateUid);
      const snapshot = await withTimeout(getDoc(docRef), 2500);
      if (!snapshot.exists()) {
        return candidateUid;
      }
    } catch {
      // If offline or network timeout, return candidate UID directly
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
    await withTimeout(setDoc(docRef, payload), 4000);
    return { success: true };
  } catch (err: unknown) {
    console.warn('Warning saving user to Firestore (will rely on local storage):', err);
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
    const snap = await withTimeout(getDoc(docRef), 3000);
    if (snap.exists()) {
      return snap.data() as UserAccountData;
    }

    // Direct match with verbatim string
    const docRefExact = doc(db, 'users', cleanId);
    const snapExact = await withTimeout(getDoc(docRefExact), 2000);
    if (snapExact.exists()) {
      return snapExact.data() as UserAccountData;
    }

    // 2. Query by email
    const usersRef = collection(db, 'users');
    const qEmail = query(usersRef, where('email', '==', cleanId.toLowerCase()));
    const snapEmail = await withTimeout(getDocs(qEmail), 3000);
    if (!snapEmail.empty) {
      return snapEmail.docs[0].data() as UserAccountData;
    }

    // 3. Query by mobile
    const qMobile = query(usersRef, where('mobile', '==', cleanId));
    const snapMobile = await withTimeout(getDocs(qMobile), 3000);
    if (!snapMobile.empty) {
      return snapMobile.docs[0].data() as UserAccountData;
    }

    return null;
  } catch (err) {
    console.warn('Firestore lookup took too long or offline:', err);
    return null;
  }
}
