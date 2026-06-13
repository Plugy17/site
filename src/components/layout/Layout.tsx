import { Outlet } from 'react-router-dom';
import Header from './Header';

function FloatingCubes() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* 3D rotating cube 1 */}
      <div className="absolute top-[10%] left-[5%] w-16 h-16 animate-float opacity-[0.07]">
        <div className="w-full h-full bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl transform rotate-45" />
      </div>
      {/* 3D rotating cube 2 */}
      <div className="absolute top-[30%] right-[8%] w-24 h-24 animate-float-reverse opacity-[0.05]">
        <div className="w-full h-full bg-gradient-to-br from-violet-400 to-purple-500 rounded-2xl transform rotate-12" />
      </div>
      {/* 3D rotating cube 3 */}
      <div className="absolute bottom-[20%] left-[15%] w-20 h-20 animate-float opacity-[0.06]">
        <div className="w-full h-full bg-gradient-to-br from-fuchsia-400 to-violet-600 rounded-xl transform -rotate-12" />
      </div>
      {/* Glowing circle */}
      <div className="absolute top-[50%] right-[20%] w-32 h-32 animate-pulse-glow rounded-full bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 blur-3xl" />
      {/* Small floating dots */}
      <div className="absolute top-[15%] right-[30%] w-3 h-3 rounded-full bg-violet-400/20 animate-float" />
      <div className="absolute top-[60%] left-[40%] w-2 h-2 rounded-full bg-fuchsia-400/15 animate-float-reverse" />
      <div className="absolute bottom-[30%] right-[45%] w-4 h-4 rounded-full bg-violet-500/10 animate-float" />
    </div>
  );
}

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors relative">
      <FloatingCubes />
      <Header />
      <main className="relative z-10">
        <Outlet />
      </main>
    </div>
  );
}
