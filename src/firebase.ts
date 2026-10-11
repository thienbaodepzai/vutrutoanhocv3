import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile as updateFirebaseAuthProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { UserProfile, Grade } from './types/mathverse';

export const firebaseConfig = {
  apiKey: "AIzaSyCkvRkwyGMqZsNWYZ_nYJi9gdmIp1NQztI",
  authDomain: "mathverse---vu-tru-toan-hoc.firebaseapp.com",
  projectId: "mathverse---vu-tru-toan-hoc",
  storageBucket: "mathverse---vu-tru-toan-hoc.firebasestorage.app",
  messagingSenderId: "410378319399",
  appId: "1:410378319399:web:abcb4ff5429388613c8002",
  measurementId: "G-00766YHQ7N",
};

// Initialize Firebase App singleton
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Cloud Firestore
export const db = getFirestore(app);

// Enforce browserLocalPersistence to keep login session across page refreshes and browser restarts
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.warn('Error setting browserLocalPersistence for Firebase Auth:', error);
});

export {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateFirebaseAuthProfile,
};
export type { FirebaseUser };

/**
 * Save user profile to Cloud Firestore with local error safety
 */
export async function saveProfileToFirestore(uid: string, profile: UserProfile): Promise<boolean> {
  try {
    await setDoc(doc(db, 'users', uid), profile, { merge: true });
    return true;
  } catch (error) {
    console.warn('Could not sync profile to Firestore (using local persistence):', error);
    return false;
  }
}

/**
 * Load user profile from Cloud Firestore
 */
export async function loadProfileFromFirestore(uid: string): Promise<UserProfile | null> {
  try {
    const docRef = doc(db, 'users', uid);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
  } catch (error) {
    console.warn('Could not read profile from Firestore:', error);
  }
  return null;
}
