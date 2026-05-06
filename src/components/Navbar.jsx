import React from "react";

/**
 * Navbar Component
 * Top navigation for desktop/tablet views.
 * Features a clean, premium design with glassmorphism effects.
 */
const Navbar = ({ activeTab, onTabChange, user, onSignOut }) => {
  const navItems = [
    { id: "all", label: "Discover" },
    { id: "watchlist", label: "Watchlist" },
    { id: "wishlist", label: "Wishlist" },
    { id: "insights", label: "Insights" },
  ];

  return (
    <nav className="hidden md:flex fixed top-0 left-0 right-0 z-40 h-16 bg-black/50 backdrop-blur-md border-b border-white/5 items-center justify-between px-8">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
             <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
             </svg>
          </div>
          <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
            MovieLog
          </span>
        </div>

        <div className="flex items-center gap-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeTab === item.id 
                  ? "text-white bg-white/10" 
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-3">
             <img 
               src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} 
               alt="Profile" 
               className="w-8 h-8 rounded-full border border-white/10"
             />
             <div className="flex flex-col">
               <span className="text-xs font-medium text-white">{user.displayName}</span>
               <button 
                 onClick={onSignOut}
                 className="text-[10px] text-zinc-500 hover:text-red-400 transition-colors uppercase tracking-wider text-left"
               >
                 Sign Out
               </button>
             </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
