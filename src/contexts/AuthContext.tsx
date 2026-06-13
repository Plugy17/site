import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  deleteUser,
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
      displayName,
      photoURL,
      role,
      createdAt: Date.now(),
    };
  }

  useEffect(() => {
    // Обработка результата редиректа (если пользователь был перенаправлен с Google)
    getRedirectResult(auth).then(async (result) => {
      if (result?.user) {
        let p = await getUserProfile(result.user.uid);
        if (!p) {
          p = createProfileObject(result.user.uid, result.user.email || '', result.user.displayName || 'User', result.user.photoURL || undefined, 'student');
          await createUserProfile(p);
        }
        setProfile(p);
      }
    }).catch((err) => {
      console.error('Redirect auth result error:', err);
    });

    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        let p = await getUserProfile(firebaseUser.uid);
        if (!p) {
          const isAdmin = firebaseUser.email === ADMIN_EMAIL;
          p = createProfileObject(firebaseUser.uid, firebaseUser.email || '', firebaseUser.displayName || (isAdmin ? 'Admin' : 'User'), firebaseUser.photoURL || undefined, isAdmin ? 'instructor' : 'student');
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

  async function authWithPopup(provider: any) {
    try {
      const result = await signInWithPopup(auth, provider);
      return result;
    } catch (err: any) {
      // Если popup заблокирован браузером (Safari iOS) — используем редирект
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/popup-closed-by-user') {
        await signInWithRedirect(auth, provider);
        return null; // Редирект, результата здесь не будет
      }
      throw err;
    }
  }

  async function signInWithGoogle() {
    const result = await authWithPopup(googleProvider);
    if (!result) return; // redirect mode — результат обработает onAuthStateChanged

    let p = await getUserProfile(result.user.uid);
    if (!p) {
      p = createProfileObject(result.user.uid, result.user.email || '', result.user.displayName || 'User', result.user.photoURL || undefined, 'student');
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
      // Сначала пробуем войти
      let cred;
      try {
        cred = await signInWithEmailAndPassword(auth, email, password);
      } catch (loginErr: any) {
        // Если пользователь не найден — создаём
        if (loginErr.code === 'auth/user-not-found') {
          cred = await createUserWithEmailAndPassword(auth, email, password);
        } else if (loginErr.code === 'auth/operation-not-allowed') {
          return { success: false, error: 'Вход по Email/Пароль не включён в Firebase Console. Зайдите в Authentication → Sign-in providers → Email/Password → Enable.' };
        } else if (loginErr.code === 'auth/invalid-credential') {
          // Пользователь существует, но пароль неверный — удаляем и создаём заново
          // Сначала логинимся любым способом чтобы получить uid (временно входим)
          try {
            // Пробуем новый пароль
            await createUserWithEmailAndPassword(auth, email, password);
            // Не должно сработать, если email занят, но ловим ошибку ниже
          } catch (createErr: any) {
            if (createErr.code === 'auth/email-already-in-use') {
              return { success: false, error: 'Admin уже существует в Firebase с другим паролем. Удали пользователя admin@cyberacademy.com вручную: Firebase Console → Authentication → Users → удалить пользователя. После этого попробуй снова.' };
            }
            throw createErr;
          }
          // Если createUserWithEmailAndPassword не выбросил ошибку — значит создали
          cred = await signInWithEmailAndPassword(auth, email, password);
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