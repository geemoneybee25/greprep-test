import React from 'react';

export type TabType = 'Content Library' | 'Study Plan' | 'Tests' | 'Analytics';

interface NavbarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  streak?: number;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange, streak = 0 }) => {
  const tabs: TabType[] = ['Study Plan', 'Content Library', 'Tests', 'Analytics'];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-[1600px] mx-auto px-6 md:px-10">
        <div className="flex items-center justify-between h-16">
          <button 
            onClick={() => onTabChange('Study Plan')}
            className="flex items-center gap-2 hover:opacity-70 transition-opacity active:scale-95"
            aria-label="Go to Study Plan"
          >
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">G</span>
            </div>
            <span className="font-bold text-slate-900 hidden sm:block">GRE Prep Demo</span>
          </button>
          
          <div className="flex items-center gap-1 sm:gap-4 h-full">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => onTabChange(tab)}
                className={`px-3 py-2 text-sm font-bold transition-all relative h-full flex items-center ${
                  activeTab === tab
                    ? 'text-slate-900'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-full" />
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {streak > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 border border-rose-100 rounded-full">
                <span className="text-lg">🔥</span>
                <span className="text-xs font-black text-rose-700 uppercase tracking-widest">{streak}-Day Streak</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;