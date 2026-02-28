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
    <header className="flex flex-wrap items-center gap-2 sm:gap-4 px-3 sm:px-6 md:px-6
      border-b border-zinc-800 bg-zinc-900 sticky top-0 z-30 transition-all duration-200"
      style={{ minHeight: 'var(--header-height)' }}
    >
      {/* WRAPPER: Top Row (Menu + Title + Actions) - maintain row on mobile */}
      <div className="flex items-center gap-3 flex-1 min-w-[50%]">
        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 -ml-2 text-zinc-400 hover:text-white"
          onClick={onOpenMobileMenu}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* LEFT: Title */}
        <h1 className="text-lg font-semibold tracking-wide whitespace-nowrap">
          {title}
        </h1>
      </div>

      {/* RIGHT: Actions (Keep these easily accessible on top row usually) */}
      <div className="flex items-center gap-1 sm:gap-2 ml-auto shrink-0 order-2 sm:order-none">
        <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />

        {/* Settings */}
        <button
          className="btn btn-ghost"
          title="Settings"
          onClick={onOpenSettings}
        >
          ⚙️
        </button>

        {/* Profile */}
        <div className="relative">
          <button
            className="btn btn-ghost rounded-full p-1 h-10 w-10 overflow-hidden border border-transparent hover:border-zinc-600 transition-all"
            title="Profile"
            onClick={() => setShowProfile(!showProfile)}
          >
            {authUser?.photoURL ? (
              <img
                src={authUser.photoURL}
                alt="Profile"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-lg">
                👤
              </div>
            )}
          </button>

          {showProfile && (
            <ProfilePanel onClose={() => setShowProfile(false)} />
          )}
        </div>
      </div>

      {/* CENTER: Search (Breaks to new row on mobile if needed) */}
      <div className="flex-1 min-w-full sm:min-w-0 flex justify-center order-3 sm:order-none pb-2 sm:pb-0">
        <div className="relative w-full max-w-xl">
          <input
            className="search-bar w-full pr-10"
            placeholder="Search movies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-600 border border-zinc-600 transition"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              <span className="text-sm leading-none pb-0.5">×</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
