import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useI18n } from '../../i18n';
import { Menu, X, LogOut, User, GraduationCap, Globe } from 'lucide-react';

const langs = [
  { code: 'en', label: 'EN' },
  { code: 'ru', label: 'RU' },
  { code: 'uk', label: 'UA' },
] as const;

export default function Header() {
  const { user, profile, signOut } = useAuth();
  const { lang, setLang, t } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const dashboardPath = profile?.role === 'instructor' ? '/instructor' : '/dashboard';

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-emerald-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">LearnFlow</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link to="/courses" className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors">{t('nav.courses')}</Link>
            {user && <Link to={dashboardPath} className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors">{t('nav.dashboard')}</Link>}
            {profile?.role === 'instructor' && <Link to="/instructor/create" className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors">{t('nav.createCourse')}</Link>}

            {/* Language switcher */}
            <div className="flex items-center gap-1 bg-gray-50 rounded-lg px-1 py-0.5">
              <Globe className="w-3.5 h-3.5 text-gray-400 ml-1" />
              {langs.map(l => (
                <button
                  key={l.code}
                  onClick={() => setLang(l.code as any)}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${lang === l.code ? 'bg-emerald-600 text-white' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link to={dashboardPath} className="flex items-center gap-2 hover:bg-gray-50 rounded-full pl-1 pr-3 py-1 transition-colors">
                  {profile?.photoURL ? (
                    <img src={profile.photoURL} alt="" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-emerald-600" />
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-700">{profile?.displayName}</span>
                </Link>
                <button onClick={signOut} className="p-2 text-gray-400 hover:text-red-500 transition-colors" title={t('nav.signOut')}>
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link to="/login" className="bg-emerald-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
                {t('nav.signIn')}
              </Link>
            )}
          </div>

          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-gray-600">
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-100">
            <div className="flex flex-col gap-2 pt-3">
              <Link to="/courses" onClick={() => setMenuOpen(false)} className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">{t('nav.courses')}</Link>
              {user && <Link to={dashboardPath} onClick={() => setMenuOpen(false)} className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">{t('nav.dashboard')}</Link>}
              {profile?.role === 'instructor' && <Link to="/instructor/create" onClick={() => setMenuOpen(false)} className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">{t('nav.createCourse')}</Link>}

              {/* Mobile language switcher */}
              <div className="flex items-center gap-1 px-3 py-2">
                <Globe className="w-3.5 h-3.5 text-gray-400" />
                {langs.map(l => (
                  <button key={l.code} onClick={() => setLang(l.code as any)} className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${lang === l.code ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                    {l.label}
                  </button>
                ))}
              </div>

              {user ? (
                <button onClick={() => { signOut(); setMenuOpen(false); navigate('/'); }} className="px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg text-left">{t('nav.signOut')}</button>
              ) : (
                <Link to="/login" onClick={() => setMenuOpen(false)} className="px-3 py-2 text-sm font-medium text-emerald-600 hover:bg-emerald-50 rounded-lg">{t('nav.signIn')}</Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
