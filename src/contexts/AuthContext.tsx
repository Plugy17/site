import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import { auth, googleProvider, appleProvider } from '../config/firebase';
import { getUserProfile, createUserProfile, updateUserProfile } from '../services/firebase';
import type { UserProfile } from '../types';

const ADMIN_EMAIL = 'admin@cyberacademy.com';
const ADMIN_PASSWORD = 'Academy12&';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signInAsAdmin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
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
          const isAdmin = firebaseUser.email === ADMIN_EMAIL;
          p = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || (isAdmin ? 'Admin' : 'User'),
            photoURL: firebaseUser.photoURL || undefined,
            role: isAdmin ? 'instructor' : 'student',
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

  async function signInAsAdmin(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return { success: false, error: 'Invalid admin credentials' };
    }
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      let p = await getUserProfile(cred.user.uid);
      if (!p) {
        p = {
          uid: cred.user.uid,
          email: cred.user.email || '',
          displayName: 'Admin',
          role: 'instructor',
          createdAt: Date.now(),
        };
        await createUserProfile(p);
        setProfile(p);
      } else {
        if (p.role !== 'instructor') {
          await updateUserProfile(p.uid, { role: 'instructor' });
          p = { ...p, role: 'instructor' };
        }
        setProfile(p);
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login failed' };
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
    <AuthContext.Provider value={{ user, profile, loading, signInWithGoogle, signInWithApple, signInAsAdmin, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
