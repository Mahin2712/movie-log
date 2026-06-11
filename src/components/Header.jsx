import ViewToggle from "./ViewToggle";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import ProfilePanel from "./ProfilePanel";

export default function Header({
  title,
  search,
  setSearch,
  mediaType,
  setMediaType,
  viewMode,
  setViewMode,
  onOpenSettings,
  onOpenMobileMenu
}) {
  const { authUser } = useAuth();
  const [showProfile, setShowProfile] = useState(false);

  return (
    <header className="grid grid-cols-2 md:flex md:flex-row items-center justify-between border-b border-zinc-800 bg-zinc-900/95 sticky top-0 z-30 transition-all duration-200 w-full shadow-lg backdrop-blur-md gap-y-3 md:gap-x-6"
      style={{ padding: 'var(--space-xs) var(--space-md)' }}
    >
      {/* 1. LEFT: Title (Col 1, Row 1 on mobile) */}
      <div className="flex items-center gap-3 col-start-1 col-end-2">
        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 -ml-2 text-zinc-400 hover:text-white transition-colors focus:outline-none"
          onClick={onOpenMobileMenu}
          aria-label="Open Menu"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* LEFT: Title */}
        <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white truncate max-w-[150px] sm:max-w-none">
          {title}
        </h1>
      </div>

      {/* 2. MIDDLE: Search Bar & Toggle (Col 1-2, Row 2 on mobile) */}
      <div className="flex items-center gap-3 col-span-2 w-full md:w-auto md:flex-1 md:justify-center md:max-w-xl">
        {/* Search Bar */}
        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-blue-400 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            className="w-full pl-10 pr-10 py-2 rounded-xl bg-zinc-800/50 border border-zinc-700/50 focus:bg-zinc-800 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-sm placeholder:text-zinc-500"
            placeholder="Search your collection..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-zinc-700 text-zinc-300 hover:text-white transition-colors focus:outline-none"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* View Toggle */}
        <div className="shrink-0">
          <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
        </div>
      </div>

      {/* 3. RIGHT: Actions (Col 2, Row 1 on mobile) */}
      <div className="flex items-center gap-2 justify-self-end col-start-2 col-end-3">
        {/* Settings Button */}
        <button
          className="p-2 text-zinc-400 hover:text-white rounded-full transition-colors focus:outline-none"
          title="Settings"
          onClick={onOpenSettings}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>

        {/* Profile Section */}
        <div className="relative">
          <button
            className="rounded-full p-0.5 h-8 w-8 sm:h-9 sm:w-9 overflow-hidden border border-zinc-700 hover:border-blue-500 transition-all focus:outline-none bg-zinc-800"
            title="Profile"
            onClick={() => setShowProfile(!showProfile)}
          >
            {authUser?.photoURL ? (
              <img src={authUser.photoURL} alt="Profile" className="h-full w-full object-cover rounded-full" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm">👤</div>
            )}
          </button>
          {showProfile && <ProfilePanel onClose={() => setShowProfile(false)} />}
        </div>
      </div>
    </header>
  );
}
