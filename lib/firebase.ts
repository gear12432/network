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
  deleteDoc,
  updateDoc,
  getDocFromServer,
  Firestore,
} from 'firebase/firestore';
import firebaseConfig from '@/firebase-applet-config.json';
import { AppSettings, DEFAULT_APP_SETTINGS, VipBonus } from '@/types/investment';

export const EXACT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyDiJz5mrUCIzfPipdk31jHXsIg3z6XqXco",
  authDomain: "sas-app-fe83e.firebaseapp.com",
  databaseURL: "https://sas-app-fe83e-default-rtdb.firebaseio.com",
  projectId: "sas-app-fe83e",
  storageBucket: "sas-app-fe83e.firebasestorage.app",
  messagingSenderId: "287373150271",
  appId: "1:287373150271:web:d5b9a27535bcef03d2108a",
  measurementId: "G-YCN7FC527N"
};

const activeConfig = {
  ...EXACT_FIREBASE_CONFIG,
  ...(firebaseConfig || {}),
};

// Initialize Firebase App
const app = !getApps().length ? initializeApp(activeConfig) : getApp();

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

// Test connection on boot and ensure initial Firestore collections exist
export async function testConnection() {
  try {
    const connDoc = doc(db, 'test', 'connection');
    await setDoc(connDoc, {
      status: 'online',
      connectedAt: new Date().toISOString(),
      appName: 'NetworkJoin Pro',
    });
  } catch (error) {
    if (error instanceof Error) {
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
    panNumber?: string;
    aadhaarNumber?: string;
    panImage?: string;
    aadhaarFrontImage?: string;
    aadhaarBackImage?: string;
  };
  addressDetails: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  balance?: number;
  unclaimedRoi?: number;
  totalEarned?: number;
  vipLevel?: number;
  totalCustomerInvested?: number;
  status?: string; // 'active' | 'blocked' | 'pending_approval' | 'rejected'
  kycStatus?: 'pending' | 'approved' | 'rejected' | string;
  createdAt?: string;
  photoUrl?: string;
  deviceId?: string;
  bankDetails?: {
    bankHolderName?: string;
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
    upiId?: string;
    updatedAt?: string;
  };
}

// Generate/retrieve persistent Device ID for current browser/device
export function getOrCreateDeviceId(): string {
  if (typeof window === 'undefined') return 'server_device';

  const STORAGE_KEY = 'network_join_pro_device_id';
  try {
    let existing = localStorage.getItem(STORAGE_KEY);
    if (!existing) {
      const ua = typeof navigator !== 'undefined' ? navigator.userAgent || '' : '';
      const screenRes = typeof window !== 'undefined' && window.screen ? `${window.screen.width || 0}x${window.screen.height || 0}x${window.screen.colorDepth || 0}` : '0x0x0';
      const lang = typeof navigator !== 'undefined' ? navigator.language || '' : '';
      let timeZone = '';
      try {
        timeZone = Intl?.DateTimeFormat?.()?.resolvedOptions?.()?.timeZone || '';
      } catch {
        // ignore
      }
      const rawString = `${ua}|${screenRes}|${lang}|${timeZone}`;
      
      let hash = 0;
      for (let i = 0; i < rawString.length; i++) {
        const char = rawString.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
      }
      const hexHash = Math.abs(hash).toString(16).padStart(8, '0');
      const randomPart = Math.floor(100000 + Math.random() * 900000);
      existing = `DEV_${hexHash}_${randomPart}`;
      localStorage.setItem(STORAGE_KEY, existing);
    }
    return existing;
  } catch {
    return 'DEV_UNKNOWN_DEVICE';
  }
}

// Check if a user with given Device ID already exists in Firestore
export async function findUserByDeviceId(deviceId: string): Promise<UserAccountData | null> {
  if (!deviceId || deviceId === 'DEV_UNKNOWN_DEVICE') return null;

  try {
    const usersRef = collection(db, 'users');
    const qDev = query(usersRef, where('deviceId', '==', deviceId));
    const snap = await withTimeout(getDocs(qDev), 3500);
    if (!snap.empty) {
      return snap.docs[0].data() as UserAccountData;
    }
    return null;
  } catch (err) {
    console.warn('Error checking device ID in Firestore:', err);
    return null;
  }
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

// Helper to sanitize objects for Firestore (removes any undefined properties which cause Firestore setDoc to fail)
export function sanitizeFirestorePayload<T extends Record<string, any>>(obj: T): Record<string, any> {
  const clean: Record<string, any> = {};
  if (!obj || typeof obj !== 'object') return clean;
  Object.keys(obj).forEach((key) => {
    const val = obj[key];
    if (val !== undefined) {
      if (val && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date)) {
        clean[key] = sanitizeFirestorePayload(val);
      } else {
        clean[key] = val;
      }
    }
  });
  return clean;
}

// Save complete user registration to Firestore
export async function saveUserToFirestore(userData: UserAccountData): Promise<{ success: boolean; error?: string }> {
  try {
    const cleanUid = (userData.loginUid || '').trim();
    if (!cleanUid) {
      return { success: false, error: 'Login UID is required' };
    }

    const payload = {
      ...userData,
      loginUid: cleanUid,
      status: userData.status || 'active',
      kycStatus: userData.kycStatus || 'approved',
      balance: userData.balance ?? 0,
      vipLevel: userData.vipLevel ?? 1,
      createdAt: userData.createdAt || new Date().toISOString(),
      deviceId: userData.deviceId || '',
    };
    const cleanData = sanitizeFirestorePayload(payload);

    // Write to Firestore users collection directly
    const docRef = doc(db, 'users', cleanUid);
    const docRefUpper = doc(db, 'users', cleanUid.toUpperCase());

    try {
      await Promise.all([
        setDoc(docRef, cleanData),
        setDoc(docRefUpper, cleanData),
      ]);
    } catch (primaryErr) {
      console.warn('Primary setDoc write warning, writing stripped fallback:', primaryErr);
      // Fallback: Strip heavy images to guarantee user profile is created in Firestore
      const strippedPayload = {
        ...cleanData,
        kycDetails: cleanData.kycDetails ? {
          ...cleanData.kycDetails,
          panImage: undefined,
          aadhaarFrontImage: undefined,
          aadhaarBackImage: undefined,
        } : undefined,
      };
      await Promise.allSettled([
        setDoc(docRef, sanitizeFirestorePayload(strippedPayload)),
        setDoc(docRefUpper, sanitizeFirestorePayload(strippedPayload)),
      ]);
    }

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

export interface DepositRecord {
  id: string;
  loginUid: string;
  userName?: string;
  mobile?: string;
  amount: number;
  utrNumber: string;
  imageUrl: string;
  dateTime: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
}

// Save deposit/recharge request to Firestore deposits collection
export async function saveDepositToFirestore(
  depositData: DepositRecord
): Promise<{ success: boolean; error?: string }> {
  try {
    const docRef = doc(db, 'deposits', depositData.id);
    await withTimeout(setDoc(docRef, sanitizeFirestorePayload(depositData)), 4000);
    return { success: true };
  } catch (err: unknown) {
    console.warn('Warning saving deposit to Firestore:', err);
    const message = err instanceof Error ? err.message : 'Failed to save deposit to Firestore';
    return { success: false, error: message };
  }
}

// =========================================================================
// ADMIN FIRESTORE UTILITIES
// =========================================================================

// 1. Fetch all users
export async function getAllUsersFromFirestore(): Promise<UserAccountData[]> {
  try {
    const usersRef = collection(db, 'users');
    const snap = await withTimeout(getDocs(usersRef), 4000);
    const users: UserAccountData[] = [];
    snap.forEach((docSnap) => {
      users.push(docSnap.data() as UserAccountData);
    });
    return users;
  } catch (err) {
    console.warn('Error fetching users from Firestore:', err);
    return [];
  }
}

// 2. Update user status (block/unblock)
export async function updateUserStatusInFirestore(
  loginUid: string,
  status: 'active' | 'blocked' | 'pending_approval' | 'rejected'
): Promise<boolean> {
  try {
    const docRef = doc(db, 'users', loginUid);
    await withTimeout(updateDoc(docRef, { status }), 4000);
    return true;
  } catch (err) {
    console.warn('Error updating user status in Firestore:', err);
    return false;
  }
}

// 2b. Update user KYC status & account activation in Firestore
export async function updateUserKycStatusInFirestore(
  loginUid: string,
  kycStatus: 'approved' | 'rejected' | 'pending',
  accountStatus?: 'active' | 'pending_approval' | 'rejected' | 'blocked'
): Promise<boolean> {
  try {
    const docRef = doc(db, 'users', loginUid);
    const updates: Record<string, any> = { kycStatus };
    if (accountStatus) {
      updates.status = accountStatus;
    }
    await withTimeout(updateDoc(docRef, updates), 4000);
    return true;
  } catch (err) {
    console.warn('Error updating user KYC status in Firestore:', err);
    return false;
  }
}

// 3. Update user balance
export async function updateUserBalanceInFirestore(
  loginUid: string,
  newBalance: number
): Promise<boolean> {
  try {
    const docRef = doc(db, 'users', loginUid);
    await withTimeout(updateDoc(docRef, { balance: newBalance }), 4000);
    return true;
  } catch (err) {
    console.warn('Error updating user balance in Firestore:', err);
    return false;
  }
}

// 3a. Update user earnings & VIP metrics in Firestore
export async function updateUserEarningsInFirestore(
  loginUid: string,
  updates: {
    balance?: number;
    unclaimedRoi?: number;
    totalEarned?: number;
    vipLevel?: number;
    totalCustomerInvested?: number;
    dailyCommissionRate?: number;
    totalDailyCommission?: number;
  }
): Promise<boolean> {
  try {
    const docRef = doc(db, 'users', loginUid);
    await withTimeout(updateDoc(docRef, sanitizeFirestorePayload(updates)), 4000);
    return true;
  } catch (err) {
    console.warn('Error updating user earnings in Firestore:', err);
    return false;
  }
}

// 3b. Update user profile or avatar photo in Firestore
export async function updateUserProfileInFirestore(
  loginUid: string,
  updates: Partial<UserAccountData>
): Promise<boolean> {
  try {
    const docRef = doc(db, 'users', loginUid);
    await withTimeout(updateDoc(docRef, updates), 4000);
    return true;
  } catch (err) {
    console.warn('Error updating user profile in Firestore:', err);
    return false;
  }
}

// 4. Delete user
export async function deleteUserFromFirestore(loginUid: string): Promise<boolean> {
  try {
    const docRef = doc(db, 'users', loginUid);
    await withTimeout(deleteDoc(docRef), 4000);
    return true;
  } catch (err) {
    console.warn('Error deleting user from Firestore:', err);
    return false;
  }
}

// 5. Fetch all deposits
export async function getAllDepositsFromFirestore(): Promise<DepositRecord[]> {
  try {
    const depRef = collection(db, 'deposits');
    const snap = await withTimeout(getDocs(depRef), 4000);
    const deposits: DepositRecord[] = [];
    snap.forEach((docSnap) => {
      deposits.push(docSnap.data() as DepositRecord);
    });
    return deposits.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (err) {
    console.warn('Error fetching deposits from Firestore:', err);
    return [];
  }
}

// 6. Update deposit status (Approve / Reject)
export async function updateDepositStatusInFirestore(
  depositId: string,
  status: 'Approved' | 'Rejected',
  depositRecord?: DepositRecord
): Promise<boolean> {
  try {
    const docRef = doc(db, 'deposits', depositId);
    let record = depositRecord;

    // If record not provided or missing fields, fetch from deposits collection
    if (!record || !record.loginUid || !record.amount) {
      try {
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          record = snap.data() as DepositRecord;
        }
      } catch (e) {
        console.warn('Error fetching deposit details in updateDepositStatus:', e);
      }
    }

    await withTimeout(updateDoc(docRef, { status }), 4000);

    // If approved, automatically credit user wallet balance in Firestore!
    if (status === 'Approved' && record?.loginUid && record?.amount) {
      try {
        const depositAmount = Number(record.amount) || 0;
        const userDocRef = doc(db, 'users', record.loginUid);
        const userSnap = await getDoc(userDocRef);

        if (userSnap.exists()) {
          const currentBal = Number(userSnap.data().balance) || 0;
          const newBal = currentBal + depositAmount;
          await updateDoc(userDocRef, { balance: newBal });
          console.log(`Auto-credited ₹${depositAmount} to user ${record.loginUid}. New Balance: ₹${newBal}`);
        } else {
          // Fallback search by query if document key was different
          const usersRef = collection(db, 'users');
          const q = query(usersRef, where('loginUid', '==', record.loginUid));
          const querySnap = await getDocs(q);
          querySnap.forEach(async (uDoc) => {
            const currentBal = Number(uDoc.data().balance) || 0;
            const newBal = currentBal + depositAmount;
            await updateDoc(uDoc.ref, { balance: newBal });
            console.log(`Auto-credited ₹${depositAmount} to user doc ${uDoc.id}. New Balance: ₹${newBal}`);
          });
        }
      } catch (e) {
        console.warn('Error auto-crediting user balance on deposit approval:', e);
      }
    }
    return true;
  } catch (err) {
    console.warn('Error updating deposit status in Firestore:', err);
    return false;
  }
}

// 7. Withdrawals interface & functions
export interface WithdrawalRecord {
  id: string;
  loginUid: string;
  userName?: string;
  mobile?: string;
  amount: number;
  bankDetails?: string; // UPI ID or Account Details
  bankName?: string;
  bankHolderName?: string;
  accountNumber?: string;
  ifscCode?: string;
  totalReturn?: number;
  dateTime: string;
  status: 'Pending' | 'Approved' | 'Rejected' | string;
  createdAt: string;
  customerId?: string;
  customerName?: string;
  customerMobile?: string;
  planName?: string;
}

export async function saveWithdrawalToFirestore(
  withdrawalData: WithdrawalRecord
): Promise<{ success: boolean; error?: string }> {
  try {
    const docRef = doc(db, 'withdrawals', withdrawalData.id);
    await withTimeout(setDoc(docRef, sanitizeFirestorePayload(withdrawalData)), 4000);
    return { success: true };
  } catch (err) {
    console.warn('Error saving withdrawal to Firestore:', err);
    return { success: false, error: 'Failed to save' };
  }
}

export async function getAllWithdrawalsFromFirestore(): Promise<WithdrawalRecord[]> {
  try {
    const wdRef = collection(db, 'withdrawals');
    const snap = await withTimeout(getDocs(wdRef), 4000);
    const withdrawals: WithdrawalRecord[] = [];
    snap.forEach((docSnap) => {
      withdrawals.push(docSnap.data() as WithdrawalRecord);
    });
    return withdrawals.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (err) {
    console.warn('Error fetching withdrawals from Firestore:', err);
    return [];
  }
}

export async function updateWithdrawalStatusInFirestore(
  withdrawalId: string,
  status: 'Approved' | 'Rejected' | 'Pending' | string
): Promise<boolean> {
  try {
    const docRef = doc(db, 'withdrawals', withdrawalId);
    await withTimeout(updateDoc(docRef, { status }), 4000);
    return true;
  } catch (err) {
    console.warn('Error updating withdrawal status in Firestore:', err);
    return false;
  }
}

// 8. Gateway Settings
export interface GatewaySettings {
  upiId: string;
  qrCodeUrl?: string;
  minDeposit: number;
  minWithdrawal: number;
}

export async function getGatewaySettingsFromFirestore(): Promise<GatewaySettings> {
  let settingsFromFirestore: GatewaySettings | null = null;
  try {
    const docRef = doc(db, 'settings', 'gateway');
    const snap = await withTimeout(getDoc(docRef), 3000);
    if (snap.exists()) {
      settingsFromFirestore = snap.data() as GatewaySettings;
      if (typeof window !== 'undefined' && settingsFromFirestore) {
        localStorage.setItem('network_join_pro_gateway_settings', JSON.stringify(settingsFromFirestore));
      }
      return settingsFromFirestore;
    }
  } catch (err) {
    console.warn('Error reading gateway settings from Firestore:', err);
  }

  // Fallback to localStorage if Firestore is empty or offline
  if (typeof window !== 'undefined') {
    try {
      const local = localStorage.getItem('network_join_pro_gateway_settings');
      if (local) {
        return JSON.parse(local);
      }
    } catch {
      // fallback
    }
  }

  return {
    upiId: 'networkjoinpro@upi',
    minDeposit: 100,
    minWithdrawal: 200,
  };
}

export async function saveGatewaySettingsToFirestore(
  settings: GatewaySettings
): Promise<boolean> {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('network_join_pro_gateway_settings', JSON.stringify(settings));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }

  try {
    const docRef = doc(db, 'settings', 'gateway');
    await withTimeout(setDoc(docRef, sanitizeFirestorePayload(settings)), 4000);
    return true;
  } catch (err) {
    console.warn('Error saving gateway settings to Firestore:', err);
    return false;
  }
}

// 9. Custom Admin Plans Management
export async function saveCustomPlanToFirestore(plan: any): Promise<boolean> {
  if (typeof window !== 'undefined') {
    try {
      const localStr = localStorage.getItem('network_join_pro_plans');
      const existing = localStr ? JSON.parse(localStr) : [];
      const updated = [plan, ...existing.filter((p: any) => String(p.id) !== String(plan.id))];
      localStorage.setItem('network_join_pro_plans', JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage save plan error:', e);
    }
  }

  try {
    const docRef = doc(db, 'plans', String(plan.id));
    await withTimeout(setDoc(docRef, sanitizeFirestorePayload(plan)), 4000);
    return true;
  } catch (err) {
    console.warn('Error saving plan to Firestore:', err);
    return false;
  }
}

export async function deleteCustomPlanFromFirestore(planId: string): Promise<boolean> {
  if (typeof window !== 'undefined') {
    try {
      const localStr = localStorage.getItem('network_join_pro_plans');
      if (localStr) {
        const existing = JSON.parse(localStr);
        const updated = existing.filter((p: any) => String(p.id) !== String(planId));
        localStorage.setItem('network_join_pro_plans', JSON.stringify(updated));
      }
    } catch (e) {
      console.warn('LocalStorage delete plan error:', e);
    }
  }

  try {
    const docRef = doc(db, 'plans', String(planId));
    await withTimeout(deleteDoc(docRef), 4000);
    return true;
  } catch (err) {
    console.warn('Error deleting plan from Firestore:', err);
    return false;
  }
}

export async function getCustomPlansFromFirestore(): Promise<any[]> {
  let plansFromFirestore: any[] = [];
  try {
    const ref = collection(db, 'plans');
    const snap = await withTimeout(getDocs(ref), 3000);
    snap.forEach((docSnap) => plansFromFirestore.push(docSnap.data()));
    if (plansFromFirestore.length > 0) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('network_join_pro_plans', JSON.stringify(plansFromFirestore));
      }
      return plansFromFirestore;
    }
  } catch (err) {
    console.warn('Error fetching plans from Firestore:', err);
  }

  if (typeof window !== 'undefined') {
    try {
      const local = localStorage.getItem('network_join_pro_plans');
      if (local) {
        return JSON.parse(local);
      }
    } catch {
      // fallback
    }
  }

  return [];
}

// 10. Custom Home Sliders Management
export async function saveCustomSliderToFirestore(slider: any): Promise<boolean> {
  if (typeof window !== 'undefined') {
    try {
      const localStr = localStorage.getItem('network_join_pro_sliders');
      const existing = localStr ? JSON.parse(localStr) : [];
      const updated = [slider, ...existing.filter((s: any) => String(s.id) !== String(slider.id))];
      localStorage.setItem('network_join_pro_sliders', JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage save slider error:', e);
    }
  }

  try {
    const docRef = doc(db, 'sliders', String(slider.id));
    await withTimeout(setDoc(docRef, sanitizeFirestorePayload(slider)), 4000);
    return true;
  } catch (err) {
    console.warn('Error saving slider to Firestore:', err);
    return false;
  }
}

export async function deleteCustomSliderFromFirestore(sliderId: string): Promise<boolean> {
  if (typeof window !== 'undefined') {
    try {
      const localStr = localStorage.getItem('network_join_pro_sliders');
      if (localStr) {
        const existing = JSON.parse(localStr);
        const updated = existing.filter((s: any) => String(s.id) !== String(sliderId));
        localStorage.setItem('network_join_pro_sliders', JSON.stringify(updated));
      }
    } catch (e) {
      console.warn('LocalStorage delete slider error:', e);
    }
  }

  try {
    const docRef = doc(db, 'sliders', String(sliderId));
    await withTimeout(deleteDoc(docRef), 4000);
    return true;
  } catch (err) {
    console.warn('Error deleting slider from Firestore:', err);
    return false;
  }
}

export async function getCustomSlidersFromFirestore(): Promise<any[]> {
  let slidersFromFirestore: any[] = [];
  try {
    const ref = collection(db, 'sliders');
    const snap = await withTimeout(getDocs(ref), 3000);
    snap.forEach((docSnap) => slidersFromFirestore.push(docSnap.data()));
    if (slidersFromFirestore.length > 0) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('network_join_pro_sliders', JSON.stringify(slidersFromFirestore));
      }
      return slidersFromFirestore;
    }
  } catch (err) {
    console.warn('Error fetching sliders from Firestore:', err);
  }

  if (typeof window !== 'undefined') {
    try {
      const local = localStorage.getItem('network_join_pro_sliders');
      if (local) {
        return JSON.parse(local);
      }
    } catch {
      // fallback
    }
  }

  return [];
}

// 11. Customer Firestore Management
export async function saveCustomerToFirestore(
  customerData: any
): Promise<{ success: boolean; error?: string }> {
  const cleanData = sanitizeFirestorePayload(customerData);

  if (typeof window !== 'undefined') {
    try {
      const localStr = localStorage.getItem('network_join_pro_customers');
      const existing = localStr ? JSON.parse(localStr) : [];
      const updated = [cleanData, ...existing.filter((c: any) => String(c.id) !== String(cleanData.id))];
      localStorage.setItem('network_join_pro_customers', JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage save customer error:', e);
    }
  }

  try {
    const docRef1 = doc(db, 'customers', String(cleanData.id));
    const docRef2 = doc(db, 'customer', String(cleanData.id));
    await Promise.allSettled([
      withTimeout(setDoc(docRef1, cleanData), 4000),
      withTimeout(setDoc(docRef2, cleanData), 4000),
    ]);
    return { success: true };
  } catch (err: unknown) {
    console.warn('Warning saving customer to Firestore:', err);
    const message = err instanceof Error ? err.message : 'Failed to save customer to Firestore';
    return { success: false, error: message };
  }
}

export async function getAllCustomersFromFirestore(): Promise<any[]> {
  let customersFromFirestore: any[] = [];
  try {
    const ref1 = collection(db, 'customers');
    const snap1 = await withTimeout(getDocs(ref1), 3000);
    snap1.forEach((docSnap) => customersFromFirestore.push(docSnap.data()));

    if (customersFromFirestore.length === 0) {
      const ref2 = collection(db, 'customer');
      const snap2 = await withTimeout(getDocs(ref2), 3000);
      snap2.forEach((docSnap) => customersFromFirestore.push(docSnap.data()));
    }

    if (customersFromFirestore.length > 0) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('network_join_pro_customers', JSON.stringify(customersFromFirestore));
      }
      return customersFromFirestore;
    }
  } catch (err) {
    console.warn('Error fetching customers from Firestore:', err);
  }

  if (typeof window !== 'undefined') {
    try {
      const local = localStorage.getItem('network_join_pro_customers');
      if (local) {
        return JSON.parse(local);
      }
    } catch {
      // fallback
    }
  }

  return [];
}

// 12. Active Investments Firestore Management
export async function saveInvestmentToFirestore(
  investmentData: any
): Promise<{ success: boolean; error?: string }> {
  const cleanData = sanitizeFirestorePayload(investmentData);

  if (typeof window !== 'undefined') {
    try {
      const localStr = localStorage.getItem('network_join_pro_investments');
      const existing = localStr ? JSON.parse(localStr) : [];
      const updated = [cleanData, ...existing.filter((inv: any) => String(inv.id) !== String(cleanData.id))];
      localStorage.setItem('network_join_pro_investments', JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage save investment error:', e);
    }
  }

  try {
    const docRef1 = doc(db, 'investments', String(cleanData.id));
    const docRef2 = doc(db, 'invest', String(cleanData.id));
    await Promise.allSettled([
      withTimeout(setDoc(docRef1, cleanData), 4000),
      withTimeout(setDoc(docRef2, cleanData), 4000),
    ]);
    return { success: true };
  } catch (err: unknown) {
    console.warn('Warning saving investment to Firestore:', err);
    const message = err instanceof Error ? err.message : 'Failed to save investment to Firestore';
    return { success: false, error: message };
  }
}

export async function getAllInvestmentsFromFirestore(): Promise<any[]> {
  let investmentsFromFirestore: any[] = [];
  try {
    const ref1 = collection(db, 'investments');
    const snap1 = await withTimeout(getDocs(ref1), 3000);
    snap1.forEach((docSnap) => investmentsFromFirestore.push(docSnap.data()));

    const ref2 = collection(db, 'invest');
    const snap2 = await withTimeout(getDocs(ref2), 3000);
    snap2.forEach((docSnap) => {
      const data = docSnap.data();
      if (!investmentsFromFirestore.some((item) => item.id === data.id)) {
        investmentsFromFirestore.push(data);
      }
    });

    if (investmentsFromFirestore.length > 0) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('network_join_pro_investments', JSON.stringify(investmentsFromFirestore));
      }
      return investmentsFromFirestore;
    }
  } catch (err) {
    console.warn('Error fetching investments from Firestore:', err);
  }

  if (typeof window !== 'undefined') {
    try {
      const local = localStorage.getItem('network_join_pro_investments');
      if (local) {
        return JSON.parse(local);
      }
    } catch {
      // fallback
    }
  }

  return [];
}

// 13. Support Chat Messages Firestore Management
export interface SupportChatMessage {
  id: string;
  sender: 'user' | 'admin';
  senderName: string;
  senderUid?: string;
  userUid?: string;
  userName?: string;
  userMobile?: string;
  userEmail?: string;
  text?: string;
  imageUrl?: string;
  timestamp: string;
  createdAt: number;
}

export async function saveChatMessageToFirestore(
  msg: SupportChatMessage
): Promise<{ success: boolean; error?: string }> {
  try {
    const docRef = doc(db, 'support_chats', msg.id);
    await withTimeout(setDoc(docRef, sanitizeFirestorePayload(msg)), 4000);
    return { success: true };
  } catch (err: unknown) {
    console.warn('Warning saving chat message to Firestore:', err);
    return { success: false, error: 'Failed to save chat message' };
  }
}

export async function deleteChatMessageFromFirestore(msgId: string): Promise<boolean> {
  try {
    const docRef = doc(db, 'support_chats', msgId);
    await withTimeout(deleteDoc(docRef), 4000);
    return true;
  } catch (err) {
    console.warn('Error deleting chat message from Firestore:', err);
    return false;
  }
}

export async function getAllChatMessagesFromFirestore(): Promise<SupportChatMessage[]> {
  try {
    const ref = collection(db, 'support_chats');
    const snap = await withTimeout(getDocs(ref), 3000);
    const messages: SupportChatMessage[] = [];
    snap.forEach((docSnap) => {
      messages.push(docSnap.data() as SupportChatMessage);
    });
    return messages.sort((a, b) => a.createdAt - b.createdAt);
  } catch (err) {
    console.warn('Error fetching chat messages from Firestore:', err);
    return [];
  }
}

// 14. VIP Level Settings Firestore Management
export interface VipLevelRecord {
  id: string; // e.g. "level_1"
  levelNumber: number; // 1 to 10
  levelName: string; // "VIP 1", "VIP 2", etc.
  minAmount: number;
  dailyPercentage: number;
  commissionAmount?: number;
  icon?: string;
  updatedAt: string;
}

export async function saveVipLevelToFirestore(
  levelData: VipLevelRecord
): Promise<{ success: boolean; error?: string }> {
  const cleanLevel = sanitizeFirestorePayload(levelData) as VipLevelRecord;

  if (typeof window !== 'undefined') {
    try {
      const localStr = localStorage.getItem('network_join_pro_vip_levels');
      const existing = localStr ? JSON.parse(localStr) : [];
      const updated = [
        cleanLevel,
        ...existing.filter((l: any) => String(l.id) !== String(cleanLevel.id)),
      ];
      localStorage.setItem('network_join_pro_vip_levels', JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage save level error:', e);
    }
  }

  const collectionsToSave = ['viplevel', 'level', 'levels', 'vip_level', 'vip level'];
  let savedCount = 0;
  let lastError: unknown = null;

  for (const colName of collectionsToSave) {
    try {
      const docRef = doc(db, colName, cleanLevel.id);
      await withTimeout(setDoc(docRef, cleanLevel), 4000);
      savedCount++;
    } catch (err) {
      lastError = err;
      console.warn(`Warning writing VIP level to collection '${colName}':`, err);
    }
  }

  if (savedCount > 0) {
    return { success: true };
  }

  const errorMsg = lastError instanceof Error ? lastError.message : 'Saved locally only';
  return { success: false, error: errorMsg };
}

export async function getAllVipLevelsFromFirestore(): Promise<VipLevelRecord[]> {
  let levelsFromFirestore: VipLevelRecord[] = [];
  const collectionsToTry = ['viplevel', 'level', 'levels', 'vip_level', 'vip level'];

  for (const colName of collectionsToTry) {
    try {
      const ref = collection(db, colName);
      const snap = await withTimeout(getDocs(ref), 3000);
      if (!snap.empty) {
        snap.forEach((docSnap) => {
          const data = docSnap.data() as VipLevelRecord;
          if (data && data.levelNumber && !levelsFromFirestore.some((l) => l.levelNumber === data.levelNumber)) {
            levelsFromFirestore.push(data);
          }
        });
      }
    } catch (err) {
      console.warn(`Error fetching levels from Firestore collection '${colName}':`, err);
    }
  }

  if (levelsFromFirestore.length > 0) {
    const sorted = levelsFromFirestore.sort((a, b) => a.levelNumber - b.levelNumber);
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'network_join_pro_vip_levels',
        JSON.stringify(sorted)
      );
    }
    return sorted;
  }

  if (typeof window !== 'undefined') {
    try {
      const local = localStorage.getItem('network_join_pro_vip_levels');
      if (local) {
        return JSON.parse(local);
      }
    } catch {
      // fallback
    }
  }

  return [];
}

// 12. Home Announcement Popup Settings
export interface HomePopupSettings {
  active: boolean;
  title: string;
  description: string;
  amount: string;
  directionDate: string;
  imageUrl: string;
  updatedAt?: string;
}

export const DEFAULT_HOME_POPUP: HomePopupSettings = {
  active: true,
  title: 'Special Welcome Bonus Offer',
  description: 'Join NetworkJoin Pro today and get high yield rewards on every deposit. Limited period special offer!',
  amount: '₹500 Extra Bonus',
  directionDate: 'Valid till 31 Dec 2026',
  imageUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80',
};

export async function getHomePopupFromFirestore(): Promise<HomePopupSettings> {
  try {
    const docRef = doc(db, 'system_settings', 'home_popup');
    const snap = await withTimeout(getDoc(docRef), 3000);
    if (snap.exists()) {
      const data = snap.data() as HomePopupSettings;
      if (typeof window !== 'undefined') {
        localStorage.setItem('network_join_pro_home_popup', JSON.stringify(data));
      }
      return data;
    }
  } catch (err) {
    console.warn('Error reading home popup from Firestore:', err);
  }

  if (typeof window !== 'undefined') {
    try {
      const local = localStorage.getItem('network_join_pro_home_popup');
      if (local) return JSON.parse(local);
    } catch {}
  }

  return DEFAULT_HOME_POPUP;
}

export async function saveHomePopupToFirestore(popup: HomePopupSettings): Promise<{ success: boolean; error?: string }> {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('network_join_pro_home_popup', JSON.stringify(popup));
    } catch (e) {
      console.warn('LocalStorage save popup error:', e);
    }
  }

  try {
    const docRef = doc(db, 'system_settings', 'home_popup');
    await withTimeout(setDoc(docRef, sanitizeFirestorePayload(popup)), 4000);
    return { success: true };
  } catch (err) {
    console.warn('Error saving home popup to Firestore:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Saved locally only' };
  }
}

// 16. App Settings & Certificate Configuration
export async function getAppSettingsFromFirestore(): Promise<AppSettings> {
  try {
    const docRef = doc(db, 'system_settings', 'app_config');
    const snap = await withTimeout(getDoc(docRef), 3000);
    if (snap.exists()) {
      const data = snap.data() as AppSettings;
      if (typeof window !== 'undefined') {
        localStorage.setItem('network_join_pro_app_settings', JSON.stringify(data));
      }
      return { ...DEFAULT_APP_SETTINGS, ...data };
    }
  } catch (err) {
    console.warn('Error reading app settings from Firestore:', err);
  }

  if (typeof window !== 'undefined') {
    try {
      const local = localStorage.getItem('network_join_pro_app_settings');
      if (local) return { ...DEFAULT_APP_SETTINGS, ...JSON.parse(local) };
    } catch {}
  }

  return DEFAULT_APP_SETTINGS;
}

export async function saveAppSettingsToFirestore(settings: AppSettings): Promise<{ success: boolean; error?: string }> {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('network_join_pro_app_settings', JSON.stringify(settings));
    } catch (e) {
      console.warn('LocalStorage save app settings error:', e);
    }
  }

  try {
    const docRef = doc(db, 'system_settings', 'app_config');
    await withTimeout(setDoc(docRef, sanitizeFirestorePayload(settings)), 4000);
    return { success: true };
  } catch (err) {
    console.warn('Error saving app settings to Firestore:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Saved locally only' };
  }
}

// 17. VIP Bonuses (Weekly & Monthly Bonus Cards + Claim Persistence)
export const DEFAULT_VIP_BONUSES: VipBonus[] = [
  {
    id: 'vip_bonus_card_1',
    vipLevel: 1,
    minInvestAmount: 0,
    bonusAmount: 6,
    category: 'week',
    validityDate: '2027-12-31',
    claimedBy: [],
  },
  {
    id: 'vip_bonus_card_2',
    vipLevel: 1,
    minInvestAmount: 0,
    bonusAmount: 120,
    category: 'month',
    validityDate: '2027-12-31',
    claimedBy: [],
  },
  {
    id: 'vip_bonus_card_3',
    vipLevel: 1,
    minInvestAmount: 0,
    bonusAmount: 6,
    category: 'week',
    validityDate: '2027-12-31',
    claimedBy: [],
  },
  {
    id: 'vip_bonus_card_4',
    vipLevel: 1,
    minInvestAmount: 0,
    bonusAmount: 120,
    category: 'month',
    validityDate: '2027-12-31',
    claimedBy: [],
  },
];

export async function getVipBonusesFromFirestore(): Promise<VipBonus[]> {
  try {
    const snap = await withTimeout(getDocs(collection(db, 'vip_bonuses')), 3500);
    if (!snap.empty) {
      const list = snap.docs.map((d) => ({ ...d.data(), id: d.id } as VipBonus));
      if (typeof window !== 'undefined') {
        localStorage.setItem('network_join_pro_vip_bonuses', JSON.stringify(list));
      }
      return list;
    }
  } catch (err) {
    console.warn('Error fetching VIP bonuses from Firestore, using local/defaults:', err);
  }

  if (typeof window !== 'undefined') {
    try {
      const local = localStorage.getItem('network_join_pro_vip_bonuses');
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
  }

  return DEFAULT_VIP_BONUSES;
}

export async function saveVipBonusToFirestore(bonus: VipBonus): Promise<boolean> {
  if (typeof window !== 'undefined') {
    try {
      const local = localStorage.getItem('network_join_pro_vip_bonuses');
      const current: VipBonus[] = local ? JSON.parse(local) : [...DEFAULT_VIP_BONUSES];
      const idx = current.findIndex((b) => b.id === bonus.id);
      if (idx >= 0) current[idx] = bonus;
      else current.push(bonus);
      localStorage.setItem('network_join_pro_vip_bonuses', JSON.stringify(current));
    } catch {}
  }

  try {
    const ref = doc(db, 'vip_bonuses', bonus.id);
    await withTimeout(setDoc(ref, sanitizeFirestorePayload(bonus), { merge: true }), 4000);
    return true;
  } catch (err) {
    console.warn('Error saving VIP bonus to Firestore:', err);
    return true;
  }
}

export async function deleteVipBonusFromFirestore(id: string): Promise<boolean> {
  if (typeof window !== 'undefined') {
    try {
      const local = localStorage.getItem('network_join_pro_vip_bonuses');
      if (local) {
        const current: VipBonus[] = JSON.parse(local);
        localStorage.setItem(
          'network_join_pro_vip_bonuses',
          JSON.stringify(current.filter((b) => b.id !== id))
        );
      }
    } catch {}
  }

  try {
    await withTimeout(deleteDoc(doc(db, 'vip_bonuses', id)), 4000);
    return true;
  } catch (err) {
    console.warn('Error deleting VIP bonus from Firestore:', err);
    return true;
  }
}

export async function saveVipBonusClaimTransaction(txRecord: {
  id: string;
  loginUid: string;
  userName: string;
  vipLevel: number;
  bonusId: string;
  bonusTitle: string;
  category: string;
  amount: number;
  claimedAt: string;
}): Promise<boolean> {
  try {
    const ref = doc(db, 'vip_bonus_claims', txRecord.id);
    await withTimeout(setDoc(ref, sanitizeFirestorePayload(txRecord), { merge: true }), 4000);
    return true;
  } catch (err) {
    console.warn('Saved VIP bonus claim locally (Firestore offline):', err);
    return true;
  }
}
