import React from "react";

/**
 * MobileNav Component
 * Bottom navigation bar for mobile devices.
 * Uses glassmorphism and provides easy thumb access to primary tabs.
 */
const MobileNav = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: "all", label: "Discover", icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    )},
    { id: "watchlist", label: "Watchlist", icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
      </svg>
    )},
    { id: "wishlist", label: "Wishlist", icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    )},
    { id: "insights", label: "Stats", icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )},
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-2 bg-gradient-to-t from-black via-black/90 to-transparent pointer-events-none">
      <div className="max-w-md mx-auto bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-around p-1 shadow-2xl pointer-events-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center gap-1 p-3 flex-1 rounded-xl transition-all duration-300 ${
              activeTab === tab.id 
                ? "text-blue-400 bg-blue-500/10" 
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {tab.icon}
            <span className="text-[10px] font-medium tracking-wide uppercase">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default MobileNav;
