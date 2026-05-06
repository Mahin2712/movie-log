import { useEffect, useState } from "react";

// Use same key
const STORAGE_KEY = "movieLog_v2_sidebar";

const modernGradient = "linear-gradient(180deg, rgba(9, 9, 11, 0.98), rgba(0, 0, 0, 1))";
const glassBorder = "1px solid rgba(255, 255, 255, 0.05)";

export default function Sidebar({ activeTab, setActiveTab, mobileOpen, setMobileOpen }) {
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(collapsed));
  }, [collapsed]);

  // Handle scroll lock on mobile
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileOpen]);

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity duration-300 ease-in-out
          ${mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        `}
        onClick={() => setMobileOpen(false)}
      />

      <aside
        className={`fixed md:relative flex flex-col transition-all duration-300 ease-in-out z-50 h-full
          ${collapsed ? "md:w-20" : "md:w-(--sidebar-width)"}
          ${mobileOpen ? "translate-x-0 w-[280px]" : "-translate-x-full md:translate-x-0 w-[280px] md:w-auto"}
        `}
        style={{
          background: modernGradient,
          borderRight: glassBorder,
          backdropFilter: "blur(20px)",
        }}
      >
        {/* Glow Effect Top Left */}
        <div className="absolute top-0 left-0 w-full h-32 bg-blue-600/5 blur-[80px] pointer-events-none" />

        {/* Header / Logo Area */}
        <div className={`flex items-center ${collapsed && !mobileOpen ? "justify-center" : "justify-between"} px-6 border-b border-white/5`} 
          style={{ height: 'var(--header-height)' }}>
          {(!collapsed || mobileOpen) ? (
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-400 to-indigo-400 tracking-tight">
                Movie-Log
              </span>
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">
                v2.0 Beta
              </span>
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-900/20 text-white">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
              </svg>
            </div>
          )}

          {(!collapsed || mobileOpen) && (
            <button
              onClick={() => mobileOpen ? setMobileOpen(false) : setCollapsed(true)}
              className="text-zinc-500 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                )}
              </svg>
            </button>
          )}
        </div>

        {/* Toggle Button for Collapsed Mode (Centered) - Desktop Only */}
        {collapsed && !mobileOpen && (
          <button
            onClick={() => setCollapsed(false)}
            className="mx-auto mt-4 text-zinc-500 hover:text-white transition-colors p-2 rounded-full hover:bg-white/5 hidden md:block border border-white/5 bg-white/2"
            title="Expand Sidebar"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* Navigation Links */}
        <nav className="flex-1 flex flex-col gap-1 px-3 mt-4 overflow-y-auto no-scrollbar">
          <div className="space-y-1">
            {(!collapsed || mobileOpen) && (
              <div className="px-4 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-3">
                Library
              </div>
            )}

            <NavItem
              icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>}
              label="All Titles"
              active={activeTab === "all"}
              collapsed={collapsed && !mobileOpen}
              onClick={() => { setActiveTab("all"); if(mobileOpen) setMobileOpen(false); }}
            />

            <NavItem
              icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>}
              label="Watched"
              active={activeTab === "watchlist"}
              collapsed={collapsed && !mobileOpen}
              onClick={() => { setActiveTab("watchlist"); if(mobileOpen) setMobileOpen(false); }}
            />

            <NavItem
              icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>}
              label="Wishlist"
              active={activeTab === "wishlist"}
              collapsed={collapsed && !mobileOpen}
              onClick={() => { setActiveTab("wishlist"); if(mobileOpen) setMobileOpen(false); }}
            />

            <NavItem
              icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" /></svg>}
              label="Insights"
              active={activeTab === "insights"}
              collapsed={collapsed && !mobileOpen}
              onClick={() => { setActiveTab("insights"); if(mobileOpen) setMobileOpen(false); }}
            />
          </div>
        </nav>
      </aside>
    </>
  );
}

function NavItem({ icon, label, collapsed, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`
         relative group flex items-center gap-4 w-full p-3 rounded-xl transition-all duration-200 ease-out
        ${collapsed ? "justify-center" : ""}
        ${active
          ? "bg-blue-600/15 text-blue-400 ring-1 ring-blue-500/20"
          : "text-zinc-400 hover:text-white hover:bg-white/5"
        }
      `}
    >
      {/* Active Indicator Line (Left) */}
      {active && !collapsed && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
      )}

      <span className={`transition-transform duration-200 ${active ? "scale-110" : "group-hover:scale-110"}`}>
        {icon}
      </span>

      {!collapsed && (
        <span className={`text-sm font-semibold tracking-tight ${active ? "text-blue-100" : "text-zinc-400 group-hover:text-zinc-200"}`}>
          {label}
        </span>
      )}

      {/* Hover tooltip for collapsed state */}
      {collapsed && (
        <div className="absolute left-full ml-4 px-2.5 py-1.5 bg-zinc-900 text-xs font-medium text-white rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all translate-x-[-10px] group-hover:translate-x-0 whitespace-nowrap z-50 shadow-2xl border border-white/10 backdrop-blur-md">
          {label}
        </div>
      )}
    </button>
  );
}
