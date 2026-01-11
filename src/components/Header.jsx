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
        <input
          className="search-bar"
          placeholder="Search movies…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 520 }}
        />
      </div>

      {/* RIGHT: Actions */}
      <div className="flex items-center gap-2">
        {/* Media type toggle (UI only for now) */}
        <div className="flex bg-zinc-800 rounded-full p-1">
          {["all", "movie", "tv"].map(t => (
            <button
              key={t}
              onClick={() => setMediaType(t)}
              className={`px-3 py-1 text-sm rounded-full transition
                ${mediaType === t
                  ? "bg-blue-500 text-white"
                  : "text-zinc-300 hover:bg-zinc-700"
                }`}
            >
              {t === "all" ? "All" : t === "movie" ? "🎬" : "📺"}
            </button>
          ))}
        </div>

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
