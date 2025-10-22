import React from 'react';
import { useGameTick } from '@/hooks/useGameTick';
import LeftNav from '@/components/layout/LeftNav';
import MobileNav from '@/components/layout/MobileNav';
import MainView from '@/components/layout/MainView';
import TopBar from '@/components/layout/TopBar';
import ToastViewport from '@/components/ui/ToastViewport';

/**
 * Die Hauptkomponente der Anwendung.
 * Sie initialisiert den Game-Tick und rendert das Hauptlayout,
 * das aus der linken Navigation, der oberen Leiste und der Hauptansicht besteht.
 */
const App: React.FC = () => {
  useGameTick();

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div
        className="pointer-events-none fixed inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('https://picsum.photos/seed/steampunkbg/1920/1080')",
          filter: 'blur(6px) brightness(0.35)',
        }}
        aria-hidden
      />
      <ToastViewport />
      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="sticky top-0 z-30 bg-gradient-to-b from-black/80 to-black/40 shadow-lg backdrop-blur-lg">
          <div className="mx-auto flex w-full max-w-[1320px] flex-col gap-4 px-4 pb-24 pt-4 sm:px-6 lg:pb-6">
            <TopBar />
          </div>
        </header>
        <div className="mx-auto flex w-full max-w-[1320px] flex-1 gap-4 px-4 pb-24 pt-4 sm:px-6 lg:pb-6">
          <LeftNav />
          <main className="relative flex-1 overflow-visible rounded-2xl bg-black/35 px-4 pb-10 pt-6 shadow-2xl backdrop-blur-xl lg:px-8">
            <MainView />
          </main>
        </div>
      </div>
      <MobileNav />
    </div>
  );
};

export default App;
