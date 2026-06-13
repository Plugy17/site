import { Outlet } from 'react-router-dom';
import Header from './Header';

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <Header />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
