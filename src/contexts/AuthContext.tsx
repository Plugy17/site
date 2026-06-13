import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import { auth, googleProvider, appleProvider } from '../config/firebase';
import { getUserProfile, createUserProfile, updateUserProfile } from '../services/firebase';
import type { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        let p = await getUserProfile(firebaseUser.uid);
        if (!p) {
          p = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || 'User',
            photoURL: firebaseUser.photoURL || undefined,
            role: 'student',
            createdAt: Date.now(),
          };
          await createUserProfile(p);
        }
        setProfile(p);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  async function signInWithGoogle() {
    const result = await signInWithPopup(auth, googleProvider);
    let p = await getUserProfile(result.user.uid);
    if (!p) {
      p = {
        uid: result.user.uid,
        email: result.user.email || '',
        displayName: result.user.displayName || 'User',
        photoURL: result.user.photoURL || undefined,
        role: 'student',
        createdAt: Date.now(),
      };
      await createUserProfile(p);
      setProfile(p);
    } else {
      setProfile(p);
    }
  }

  async function signInWithApple() {
    const result = await signInWithPopup(auth, appleProvider);
    let p = await getUserProfile(result.user.uid);
    if (!p) {
      p = {
        uid: result.user.uid,
        email: result.user.email || '',
        displayName: result.user.displayName || 'User',
        photoURL: result.user.photoURL || undefined,
        role: 'student',
        createdAt: Date.now(),
      };
      await createUserProfile(p);
      setProfile(p);
    } else {
      setProfile(p);
    }
  }

  async function signOut() {
    await firebaseSignOut(auth);
    setUser(null);
    setProfile(null);
  }

  async function updateProfile(data: Partial<UserProfile>) {
    if (!user) return;
    await updateUserProfile(user.uid, data);
    setProfile(prev => prev ? { ...prev, ...data } : null);
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signInWithGoogle, signInWithApple, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
