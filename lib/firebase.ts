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
  vipLevel?: number;
  status?: string; // 'active' | 'blocked' | 'pending_approval' | 'rejected'
  kycStatus?: 'pending' | 'approved' | 'rejected' | string;
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
    await withTimeout(setDoc(docRef, depositData), 4000);
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
    await withTimeout(updateDoc(docRef, { status }), 4000);

    // If approved, automatically credit user wallet balance in Firestore!
    if (status === 'Approved' && depositRecord?.loginUid && depositRecord?.amount) {
      try {
        const userDocRef = doc(db, 'users', depositRecord.loginUid);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          const currentBal = userSnap.data().balance || 0;
          await updateDoc(userDocRef, { balance: currentBal + depositRecord.amount });
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
  bankDetails: string; // UPI ID or Account Details
  dateTime: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
}

export async function saveWithdrawalToFirestore(
  withdrawalData: WithdrawalRecord
): Promise<{ success: boolean; error?: string }> {
  try {
    const docRef = doc(db, 'withdrawals', withdrawalData.id);
    await withTimeout(setDoc(docRef, withdrawalData), 4000);
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
  status: 'Approved' | 'Rejected'
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
    await withTimeout(setDoc(docRef, settings), 4000);
    return true;
  } catch (err) {
    console.warn('Error saving gateway settings to Firestore (saved locally):', err);
    return false;
  }
}

// 9. Custom Admin Plans Management
export async function saveCustomPlanToFirestore(plan: any): Promise<boolean> {
  try {
    const docRef = doc(db, 'plans', plan.id);
    await withTimeout(setDoc(docRef, plan), 4000);
    return true;
  } catch (err) {
    console.warn('Error saving plan to Firestore:', err);
    return false;
  }
}

export async function deleteCustomPlanFromFirestore(planId: string): Promise<boolean> {
  try {
    const docRef = doc(db, 'plans', planId);
    await withTimeout(deleteDoc(docRef), 4000);
    return true;
  } catch (err) {
    console.warn('Error deleting plan from Firestore:', err);
    return false;
  }
}

export async function getCustomPlansFromFirestore(): Promise<any[]> {
  try {
    const ref = collection(db, 'plans');
    const snap = await withTimeout(getDocs(ref), 3000);
    const plans: any[] = [];
    snap.forEach((docSnap) => plans.push(docSnap.data()));
    return plans;
  } catch (err) {
    console.warn('Error fetching plans from Firestore:', err);
    return [];
  }
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
    await withTimeout(setDoc(docRef, slider), 4000);
    return true;
  } catch (err) {
    console.warn('Error saving slider to Firestore (saved locally):', err);
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


