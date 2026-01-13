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

        <div className="flex bg-zinc-800 rounded-full p-1">
          <button
            onClick={() =>
              setViewMode(viewMode === "list" ? "grid" : "list")
            }
            className="
                    px-4 py-1.5
                    rounded-full
                    text-sm font-medium
                    bg-zinc-800
                    text-zinc-200
                    hover:bg-zinc-700
                    transition
                  "
          >
            {viewMode === "list" ? "List View" : "Grid View"}
          </button>

        </div>


        {/* Settings */}
        <button
          className="btn btn-ghost"
          title="Settings"
          onClick={onOpenSettings}
        >
          ⚙️
        </button>

        {/* Profile (placeholder) */}
        <button
          className="btn btn-ghost"
          title="Profile"
          onClick={() => console.log("Profile clicked")}
        >
          👤
        </button>
      </div>
    </header>
  );
}
