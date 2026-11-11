import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { PageId } from '../data/gymRatData';
import { GymRatLogo } from './GymRatLogo';

interface NavbarProps {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
}

const NAV_ITEMS: { id: PageId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'flow-game', label: '3D Flow Game' },
  { id: 'uniqueness', label: 'Uniqueness' },
  { id: 'gymbot', label: 'GymBot' },
  { id: 'scaling-up', label: 'Scaling Up' },
];

export const Navbar: React.FC<NavbarProps> = ({ activePage, onNavigate }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSelect = (page: PageId) => {
    onNavigate(page);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#F6F6F4]/95 backdrop-blur-sm border-b border-[#E2E2DC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element Brand Wordmark with GymRat Logo */}
        <button
          type="button"
          onClick={() => handleSelect('overview')}
          className="flex items-center gap-2.5 font-display text-2xl font-bold tracking-tight text-[#141517] hover:text-[#B48300] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#141517] group"
        >
          <span className="w-8 h-8 rounded-xl bg-[#141517] text-[#F5B800] flex items-center justify-center p-1.5 shadow-sm group-hover:scale-105 transition-transform">
            <GymRatLogo className="w-full h-full text-white" />
          </span>
          <span>GymRat</span>
        </button>

        {/* Zone 2: 5 concise single-line navigation links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-[#52555A]"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                className={`relative py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#141517] ${
                  isActive
                    ? 'text-[#141517] font-semibold'
                    : 'text-[#52555A] hover:text-[#141517]'
                }`}
              >
                {item.label}
                <span
                  aria-hidden="true"
                  className={`absolute left-0 right-0 -bottom-0.5 h-0.5 bg-[#F5B800] transition-transform duration-150 origin-left ${
                    isActive ? 'scale-x-100' : 'scale-x-0'
                  }`}
                />
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => handleSelect('flow-game')}
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-[#111214] bg-[#F5B800] hover:bg-[#E0A800] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#141517]"
          >
            Launch 3D Flow
          </button>

          <button
            type="button"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-[#D8D8D0] text-[#141517] hover:bg-[#ECECE7] cursor-pointer"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Responsive Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#E2E2DC] bg-[#F6F6F4] px-4 py-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#141517] text-[#F5B800]'
                    : 'text-[#141517] hover:bg-[#ECECE7]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
