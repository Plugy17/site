import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { getUserProfile, createUserProfile, updateUserProfile } from '../services/firebase';
import type { UserProfile } from '../types';

const ADMIN_EMAIL = 'admin@cyberacademy.com';
const ADMIN_PASSWORD = 'Academy12&';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInAsAdmin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  function createProfileObject(uid: string, email: string, displayName: string, photoURL: string | undefined, role: 'student' | 'instructor'): UserProfile {
    return {
      uid,
      email,
      displayName: displayName || (role === 'instructor' ? 'Admin' : 'User'),
      photoURL,
      role,
      createdAt: Date.now(),
    };
  }

  async function handleUserProfile(firebaseUser: User, defaultRole: 'student' | 'instructor' = 'student') {
    let p = await getUserProfile(firebaseUser.uid);
    if (!p) {
      p = createProfileObject(firebaseUser.uid, firebaseUser.email || '', firebaseUser.displayName || 'User', firebaseUser.photoURL || undefined, defaultRole);
      await createUserProfile(p);
    }
    return p;
  }

  useEffect(() => {
    getRedirectResult(auth).then(async (result) => {
      if (result?.user) {
        const isAdmin = result.user.email === ADMIN_EMAIL;
        const p = await handleUserProfile(result.user, isAdmin ? 'instructor' : 'student');
        setProfile(p);
      }
    }).catch((err) => {
      console.error('Redirect auth result error:', err);
    });

    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const isAdmin = firebaseUser.email === ADMIN_EMAIL;
        const p = await handleUserProfile(firebaseUser, isAdmin ? 'instructor' : 'student');
        setProfile(p);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  async function authWithPopup(provider: any) {
    try {
      const result = await signInWithPopup(auth, provider);
      return result;
    } catch (err: any) {
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/popup-closed-by-user') {
        await signInWithRedirect(auth, provider);
        return null;
      }
      throw err;
    }
  }

  async function signInWithGoogle() {
    const result = await authWithPopup(googleProvider);
    if (!result) return;

    const isAdmin = result.user.email === ADMIN_EMAIL;
    const p = await handleUserProfile(result.user, isAdmin ? 'instructor' : 'student');
    setProfile(p);
  }

  async function signInAsAdmin(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return { success: false, error: 'Invalid admin credentials' };
    }
    try {
      let cred;
      try {
        cred = await signInWithEmailAndPassword(auth, email, password);
      } catch (loginErr: any) {
        if (loginErr.code === 'auth/user-not-found') {
          cred = await createUserWithEmailAndPassword(auth, email, password);
        } else if (loginErr.code === 'auth/invalid-credential' || loginErr.code === 'auth/wrong-password') {
          // Пользователь существует, но с другим паролем — пробуем создать заново (если email занят Google, покажем понятную ошибку)
          try {
            cred = await createUserWithEmailAndPassword(auth, email, password);
          } catch (createErr: any) {
            if (createErr.code === 'auth/email-already-in-use') {
              return { success: false, error: 'Email admin@cyberacademy.com занят. Войдите через Google с этим email или удалите его в Firebase Console: Authentication → Users → найдите пользователя → Delete.' };
            }
            throw createErr;
          }
        } else {
          throw loginErr;
        }
      }

      let p = await getUserProfile(cred.user.uid);
      if (!p) {
        p = createProfileObject(cred.user.uid, cred.user.email || '', 'Admin', undefined, 'instructor');
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
    <AuthContext.Provider value={{ user, profile, loading, signInWithGoogle, signInAsAdmin, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}