import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useI18n } from '../../i18n';
import { useTheme } from '../../contexts/ThemeContext';
import { Menu, X, LogOut, User, GraduationCap, Globe, Sun, Moon } from 'lucide-react';

const langs = [
  { code: 'en', label: 'EN' },
  { code: 'ru', label: 'RU' },
  { code: 'uk', label: 'UA' },
] as const;

export default function Header() {
  const { user, profile, signOut } = useAuth();
  const { lang, setLang, t } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const dashboardPath = profile?.role === 'instructor' ? '/instructor' : '/dashboard';

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-emerald-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">{t('site.name')}</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link to="/courses" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">{t('nav.courses')}</Link>
            {user && <Link to={dashboardPath} className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">{t('nav.dashboard')}</Link>}
            {profile?.role === 'instructor' && <Link to="/instructor/create" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">{t('nav.createCourse')}</Link>}

            <div className="flex items-center gap-2">
              {/* Language */}
              <div className="flex items-center gap-0.5 bg-gray-100 dark:bg-gray-800 rounded-lg px-1 py-0.5">
                <Globe className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 ml-1" />
                {langs.map(l => (
                  <button key={l.code} onClick={() => setLang(l.code as any)}
                    className={`px-2 py-1 rounded text-xs font-medium transition-colors ${lang === l.code ? 'bg-emerald-600 text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>
                    {l.label}
                  </button>
                ))}
              </div>

              {/* Theme toggle */}
              <button onClick={toggleTheme} className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title={t('nav.theme')}>
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link to={dashboardPath} className="flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-full pl-1 pr-3 py-1 transition-colors">
                  {profile?.photoURL ? (
                    <img src={profile.photoURL} alt="" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{profile?.displayName}</span>
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

          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-gray-600 dark:text-gray-300">
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-100 dark:border-gray-800">
            <div className="flex flex-col gap-2 pt-3">
              <Link to="/courses" onClick={() => setMenuOpen(false)} className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">{t('nav.courses')}</Link>
              {user && <Link to={dashboardPath} onClick={() => setMenuOpen(false)} className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">{t('nav.dashboard')}</Link>}
              {profile?.role === 'instructor' && <Link to="/instructor/create" onClick={() => setMenuOpen(false)} className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">{t('nav.createCourse')}</Link>}

              <div className="flex items-center gap-2 px-3 py-2">
                <div className="flex items-center gap-0.5 bg-gray-100 dark:bg-gray-800 rounded-lg px-1 py-0.5">
                  <Globe className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 ml-1" />
                  {langs.map(l => (
                    <button key={l.code} onClick={() => setLang(l.code as any)} className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${lang === l.code ? 'bg-emerald-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
                      {l.label}
                    </button>
                  ))}
                </div>
                <button onClick={toggleTheme} className="p-2 rounded-lg text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800">
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
              </div>

              {user ? (
                <button onClick={() => { signOut(); setMenuOpen(false); navigate('/'); }} className="px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-left">{t('nav.signOut')}</button>
              ) : (
                <Link to="/login" onClick={() => setMenuOpen(false)} className="px-3 py-2 text-sm font-medium text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg">{t('nav.signIn')}</Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
