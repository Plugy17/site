import { Outlet } from 'react-router-dom';
import { useI18n } from '../../i18n';
import Header from './Header';

export default function Layout() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <Header />
      <main>
        <Outlet />
      </main>
      <footer className="bg-gray-900 dark:bg-black text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm">{t('site.name')} — Online Learning Platform</div>
            <div className="flex gap-6 text-sm">
              <a href="#" className="hover:text-white transition-colors">{t('footer.privacy')}</a>
              <a href="#" className="hover:text-white transition-colors">{t('footer.terms')}</a>
              <a href="#" className="hover:text-white transition-colors">{t('footer.support')}</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
