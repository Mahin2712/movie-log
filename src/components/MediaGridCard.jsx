import { IMG_BASE } from "../utils/constants";

export default function MediaGridCard({
  item,
  daysAgo,
  mode,
  onMarkWatched,
  onAddToWatchlist,
  onAddToWishlist,
  isInWatchlist,
  isInWishlist,
  onClick,
}) {
  // If mode is 'all' or 'search', use the standard "SearchResultCard" style (Hover Overlay)
  if (mode === "all" || mode === "search") {
    const fallback = "https://via.placeholder.com/300x450?text=No+Poster";
    return (
      <div
        className="carousel-card w-full h-full min-h-[240px] cursor-pointer"
        onClick={onClick}
      >
        <img
          src={item.poster_path ? IMG_BASE + item.poster_path : fallback}
          alt={item.title || item.name}
          loading="lazy"
          className="rounded-t-xl"
        />

        <div className="carousel-card-body">
          <div className="carousel-card-title">
            {item.title || item.name}
          </div>

          <div className="carousel-rating text-xs text-zinc-400 mb-2">
            {item.year || (item.release_date || item.first_air_date || "").slice(0, 4) || "Unknown"}
            {item.media_type && ` · ${item.media_type === "tv" ? "TV" : "Movie"}`}
          </div>

          <div className="carousel-actions">
            {/* ADD TO WATCHED */}
            <button
              className={`btn ${isInWatchlist ? "btn-filled !bg-green-700 !border-green-600" : ""}`}
              disabled={isInWatchlist}
              onClick={(e) => {
                e.stopPropagation();
                onAddToWatchlist?.(item);
              }}
            >
              {isInWatchlist ? "✓" : "+ Watched"}
            </button>

            {/* ADD TO WISHLIST */}
            <button
              className={`btn ${isInWishlist ? "btn-filled !bg-red-700 !border-red-600" : ""} ${isInWatchlist ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={isInWishlist || isInWatchlist} // Cannot wishlist if watched
              onClick={(e) => {
                e.stopPropagation();
                onAddToWishlist?.(item);
              }}
              title={isInWatchlist ? "Already watched" : isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
            >
              {isInWishlist ? "♥" : "♡"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- WISHLIST / WATCHLIST MODE (Standard Grid Card) ---
  return (
    <div
      className="group relative cursor-pointer transition-transform duration-200 hover:-translate-y-1 h-full flex flex-col"
      onClick={onClick}
    >
      {/* Poster */}
      <div className="relative rounded-xl overflow-hidden">
        {/* Media type badge */}
        <div className="absolute top-2 left-2 z-20">
          <span className={`px-2 py-0.5 rounded text-xs font-bold ${item.media_type === "movie" || !item.media_type ? "bg-blue-700/80" : "bg-purple-700/80"} text-white`}>
            {item.media_type === "movie" || !item.media_type ? "Movie" : "TV"}
          </span>
        </div>
        <img
          src={item.poster_path ? IMG_BASE + item.poster_path : ""}
          alt={item.title || item.name}
          className="w-full aspect-2/3 object-cover"
        />

        {/* Wishlist mode actions (Mark Watched Button) */}
        {mode === "wishlist" && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMarkWatched?.(item);
            }}
            className="
              absolute top-2 right-2 z-20
              w-8 h-8 rounded-full
              bg-black/40 backdrop-blur-md border border-white/10
              flex items-center justify-center
              text-white transition-all duration-200
              hover:bg-green-600 hover:border-green-500 hover:scale-110
              group/btn shadow-lg
            "
            title="Mark as watched"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </button>
        )}
      </div>

      {/* Title */}
      <div className="mt-2">
        <div className="text-sm font-semibold leading-tight line-clamp-2">
          {item.title || item.name}
        </div>

        {/* Metadata row */}
        <div className="mt-1 flex items-center justify-between text-xs w-full">
          <div className="flex items-center gap-2">
            <span className="text-zinc-400">
              {item.year || item.release_date?.slice(0, 4) || item.first_air_date?.slice(0, 4) || ""}
            </span>
            {item.media_type === "tv" && item.seasons && (
              <span className="text-purple-400">{item.seasons} s</span>
            )}
          </div>

          {(mode === "watchlist" || mode === "wishlist") && daysAgo !== null && (
            daysAgo < 1 ? (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold" style={{ marginLeft: "auto" }}>New</span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-zinc-700/50 text-zinc-200" style={{ marginLeft: "auto" }}>{daysAgo}d ago</span>
            )
          )}
        </div>
      </div>
    </div>
  );
}
