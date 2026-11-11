import React, { useCallback, useEffect, useState } from 'react';
import { GymBackground } from './components/GymBackground';
import { GymRatLogo } from './components/GymRatLogo';
import { Navbar } from './components/Navbar';
import { PageId } from './data/gymRatData';
import { FlowGamePage } from './pages/FlowGamePage';
import { GymBotPage } from './pages/GymBotPage';
import { OverviewPage } from './pages/OverviewPage';
import { ScalingUpPage } from './pages/ScalingUpPage';
import { UniquenessPage } from './pages/UniquenessPage';

const VALID_PAGES: PageId[] = ['overview', 'flow-game', 'uniqueness', 'gymbot', 'scaling-up'];

function getInitialPageFromHash(): PageId {
  if (typeof window === 'undefined') return 'overview';
  const raw = window.location.hash.replace('#', '') as PageId;
  return VALID_PAGES.includes(raw) ? raw : 'overview';
}

export default function App() {
  const [activePage, setActivePage] = useState<PageId>(getInitialPageFromHash);

  const navigate = useCallback((page: PageId) => {
    setActivePage(page);
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `#${page}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    const onHashChange = () => {
      setActivePage(getInitialPageFromHash());
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F6F4] text-[#141517] relative">
      {/* Professional Cinematic Gym Background with Interactive Multi-Layer Parallax & Arena Spotlights */}
      <GymBackground />

      <Navbar activePage={activePage} onNavigate={navigate} />

      <main className="flex-1 relative z-10">
        {activePage === 'overview' && <OverviewPage onNavigate={navigate} />}
        {activePage === 'flow-game' && <FlowGamePage />}
        {activePage === 'uniqueness' && <UniquenessPage />}
        {activePage === 'gymbot' && <GymBotPage />}
        {activePage === 'scaling-up' && <ScalingUpPage onNavigate={navigate} />}
      </main>

      {activePage !== 'flow-game' && (
        <footer className="border-t border-[#E2E2DC] bg-[#F6F6F4]/90 backdrop-blur-sm py-8 px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#52555A]">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-[#141517] text-[#F5B800] flex items-center justify-center p-1">
                <GymRatLogo className="w-full h-full text-white" />
              </span>
              <span className="font-display text-lg font-bold text-[#141517]">GymRat</span>
              <span className="mx-2" aria-hidden="true">
                ·
              </span>
              <span>Smart Pull-Up Counter with IR Cycle Verification &amp; Integrated Camera</span>
            </div>

            <div className="flex flex-wrap items-center gap-5">
              <button
                type="button"
                onClick={() => navigate('overview')}
                className="hover:text-[#141517] cursor-pointer"
              >
                Overview
              </button>
              <button
                type="button"
                onClick={() => navigate('flow-game')}
                className="hover:text-[#141517] cursor-pointer"
              >
                3D Flow Game
              </button>
              <button
                type="button"
                onClick={() => navigate('uniqueness')}
                className="hover:text-[#141517] cursor-pointer"
              >
                Uniqueness
              </button>
              <button
                type="button"
                onClick={() => navigate('gymbot')}
                className="hover:text-[#141517] cursor-pointer"
              >
                GymBot
              </button>
              <button
                type="button"
                onClick={() => navigate('scaling-up')}
                className="hover:text-[#141517] cursor-pointer"
              >
                Scaling Up
              </button>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
