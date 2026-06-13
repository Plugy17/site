import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../i18n';
import { useNavigate } from 'react-router-dom';
import { User, Shield, Save, ArrowLeft } from 'lucide-react';
import type { UserRole } from '../types';

export default function ProfilePage() {
  const { user, profile, updateProfile } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [role, setRole] = useState<UserRole>(profile?.role || 'student');
  const [saving, setSaving] = useState(false);

  if (!user) { navigate('/login'); return null; }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({ displayName, bio, role });
      navigate(role === 'instructor' ? '/instructor' : '/dashboard');
    } catch (err) { console.error(err); }
    setSaving(false);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> {t('create.backToDashboard').replace(t('create.backToDashboard').split(' ')[0], '')}
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('profile.title')}</h1>

      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        <div className="flex items-center gap-4 mb-2">
          {profile?.photoURL ? (
            <img src={profile.photoURL} alt="" className="w-16 h-16 rounded-2xl object-cover" />
          ) : (
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center"><User className="w-7 h-7 text-emerald-600" /></div>
          )}
          <div>
            <div className="font-medium text-gray-900">{profile?.email}</div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.displayName')}</label>
          <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.bio')}</label>
          <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} placeholder={t('profile.bioPlaceholder')}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.role')}</label>
          <div className="flex gap-3">
            {(['student', 'instructor'] as UserRole[]).map(r => (
              <button key={r} type="button" onClick={() => setRole(r)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border transition-all ${role === r ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                {r === 'student' ? <User className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                {r === 'student' ? t('auth.student') : t('auth.instructor')}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">{t('profile.roleHint')}</p>
        </div>

        <button type="submit" disabled={saving} className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50">
          <Save className="w-4 h-4" /> {saving ? t('profile.saving') : t('profile.saveChanges')}
        </button>
      </form>
    </div>
  );
}
