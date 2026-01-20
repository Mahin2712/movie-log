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
  onOpenSettings
}) {
  const { authUser } = useAuth();
  const [showProfile, setShowProfile] = useState(false);

  return (
    <header className="h-16 flex items-center gap-4 px-6
      border-b border-zinc-800 bg-zinc-900"
    >
      {/* LEFT: Title */}
      <h1 className="text-lg font-semibold tracking-wide whitespace-nowrap">
        {title}
      </h1>

      {/* CENTER: Search */}
      <div className="flex-1 flex justify-center">
        <div className="relative w-full max-w-xl">
          <input
            className="search-bar w-full pr-10" // added padding right for X
            placeholder="Search movies or TV shows..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-600 border border-zinc-600 transition"
              onClick={() => setSearch("")} // Clears input, App effect handles exit
              aria-label="Clear search"
            >
              <span className="text-sm leading-none pb-0.5">×</span>
            </button>
          )}
        </div>
      </div>

      {/* RIGHT: Actions */}
      <div className="flex items-center gap-2">
        {/* Media type toggle - HIDDEN in favor of local search filters */}
        {/* <div className="flex bg-zinc-800 rounded-full p-1">...</div> */}

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
    </header>
  );
}
