import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../i18n';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, User, Shield, Eye, EyeOff } from 'lucide-react';
import type { UserRole } from '../types';

export default function LoginPage() {
  const { user, signInWithGoogle, signInWithApple, signInAsAdmin, updateProfile, profile } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [step, setStep] = useState<'auth' | 'role'>('auth');
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [loading, setLoading] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  if (user && profile) {
    navigate(profile.role === 'instructor' ? '/instructor' : '/dashboard');
    return null;
  }

  async function handleAuth(provider: 'google' | 'apple') {
    setLoading(true);
    try {
      if (provider === 'google') await signInWithGoogle();
      else await signInWithApple();
      setStep('role');
    } catch (err) { console.error('Auth failed:', err); }
    setLoading(false);
  }

  async function handleAdminLogin(e: React.FormEvent) {
    e.preventDefault();
    setAdminError('');
    setLoading(true);
    const result = await signInAsAdmin(adminEmail, adminPassword);
    if (result.success) {
      navigate('/instructor');
    } else {
      setAdminError(t('auth.adminError'));
    }
    setLoading(false);
  }

  async function handleRoleSelect() {
    setLoading(true);
    try {
      await updateProfile({ role: selectedRole });
      navigate(selectedRole === 'instructor' ? '/instructor' : '/dashboard');
    } catch (err) { console.error('Failed to set role:', err); }
    setLoading(false);
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('auth.welcome')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">{t('auth.signInSub')}</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
          {step === 'auth' ? (
            <div className="flex flex-col gap-3">
              <button onClick={() => handleAuth('google')} disabled={loading}
                className="flex items-center justify-center gap-3 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 transition-all disabled:opacity-50">
                <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                {t('auth.google')}
              </button>

              <button onClick={() => handleAuth('apple')} disabled={loading}
                className="flex items-center justify-center gap-3 w-full bg-black dark:bg-gray-800 rounded-xl px-4 py-3 text-sm font-medium text-white hover:bg-gray-800 dark:hover:bg-gray-700 transition-all disabled:opacity-50">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.11 1.86-2.37 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
                {t('auth.apple')}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 my-2">
                <div className="flex-1 border-t border-gray-200 dark:border-gray-700" />
                <span className="text-xs text-gray-400 dark:text-gray-500">{t('auth.orDivider')}</span>
                <div className="flex-1 border-t border-gray-200 dark:border-gray-700" />
              </div>

              {/* Admin toggle */}
              <button onClick={() => setShowAdmin(!showAdmin)} type="button"
                className="flex items-center justify-center gap-2 w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
                <Shield className="w-4 h-4" /> {t('auth.adminLogin')}
              </button>

              {showAdmin && (
                <form onSubmit={handleAdminLogin} className="space-y-3 mt-2">
                  <div>
                    <input type="email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} placeholder={t('auth.adminEmail')} required
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} value={adminPassword} onChange={e => setAdminPassword(e.target.value)} placeholder={t('auth.adminPassword')} required
                      className="w-full px-4 py-2.5 pr-10 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {adminError && <p className="text-xs text-red-500">{adminError}</p>}
                  <button type="submit" disabled={loading}
                    className="w-full bg-emerald-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50">
                    {t('auth.adminSignIn')}
                  </button>
                </form>
              )}

              <div className="mt-4 text-center">
                <p className="text-xs text-gray-400 dark:text-gray-500">{t('auth.terms')}</p>
              </div>
              <p className="text-center mt-3 text-sm text-gray-500 dark:text-gray-400">{t('auth.firstTime')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white text-center">{t('auth.selectRole')}</h2>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setSelectedRole('student')}
                  className={`p-5 rounded-xl border-2 text-center transition-all ${selectedRole === 'student' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 ${selectedRole === 'student' ? 'bg-emerald-100 dark:bg-emerald-800' : 'bg-gray-100 dark:bg-gray-800'}`}>
                    <User className={`w-6 h-6 ${selectedRole === 'student' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500'}`} />
                  </div>
                  <div className={`font-semibold text-sm ${selectedRole === 'student' ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-700 dark:text-gray-300'}`}>{t('auth.student')}</div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">{t('auth.studentDesc')}</div>
                </button>
                <button onClick={() => setSelectedRole('instructor')}
                  className={`p-5 rounded-xl border-2 text-center transition-all ${selectedRole === 'instructor' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 ${selectedRole === 'instructor' ? 'bg-emerald-100 dark:bg-emerald-800' : 'bg-gray-100 dark:bg-gray-800'}`}>
                    <Shield className={`w-6 h-6 ${selectedRole === 'instructor' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500'}`} />
                  </div>
                  <div className={`font-semibold text-sm ${selectedRole === 'instructor' ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-700 dark:text-gray-300'}`}>{t('auth.instructor')}</div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">{t('auth.instructorDesc')}</div>
                </button>
              </div>
              <button onClick={handleRoleSelect} disabled={loading}
                className="w-full bg-emerald-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50">
                {loading ? '...' : t('auth.continue')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
