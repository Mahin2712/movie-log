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
  return (
    <div
      className="group relative cursor-pointer transition-transform duration-200 hover:-translate-y-1"
      onClick={onClick}
    >
      {/* Poster */}
      <div className="relative rounded-xl overflow-hidden">
        {/* Media type badge - SHOW FOR BOTH MOVIE AND TV */}
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
        {/* Search mode actions */}
        {mode === "search" && (
          <div className="absolute bottom-2 left-2 right-2 flex gap-2 z-20">
            <button
              className={`flex-1 px-2 py-1 rounded bg-blue-600 text-white text-xs font-semibold ${isInWatchlist ? "opacity-60 cursor-not-allowed" : "hover:bg-blue-700"}`}
              disabled={isInWatchlist}
              onClick={e => {
                e.stopPropagation();
                onAddToWatchlist?.(item);
              }}
            >
              {isInWatchlist ? "In Watchlist" : "+ Watchlist"}
            </button>
            <button
              className={`flex-1 px-2 py-1 rounded bg-pink-600 text-white text-xs font-semibold ${isInWishlist ? "opacity-60 cursor-not-allowed" : "hover:bg-pink-700"}`}
              disabled={isInWishlist}
              onClick={e => {
                e.stopPropagation();
                onAddToWishlist?.(item);
              }}
            >
              {isInWishlist ? "In Wishlist" : "♡ Wishlist"}
            </button>
          </div>
        )}

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

        {/* REMOVED CORNER DAYS BADGE FOR WISHLIST (and Watchlist since user wants standard alignment below) */}
        {/* User said: "remove the corner days badge from movies poster in wishlist page"
            Wait, did they want it removed for watchlist too? 
            "remove the corner days badge from movies poster in wishlist page... and add the same kind of days count button like watchlist page beside the release year."
            The watchlist page ALREADY has the days count button beside the release year (lines 130-135 in original file).
            But Wishlist page was using lines 97-110 (corner badge).
            So I just remove lines 97-110.
        */}
      </div>

      {/* Title */}
      <div className="mt-2">
        <div className="text-sm font-semibold leading-tight line-clamp-2">
          {item.title || item.name}
        </div>

        {/* Metadata row: Realigned (flex-between) */}
        <div className="mt-1 flex items-center justify-between text-xs w-full">
          <div className="flex items-center gap-2">
            {/* Year */}
            <span className="text-zinc-400">
              {item.year || item.release_date?.slice(0, 4) || item.first_air_date?.slice(0, 4) || ""}
            </span>

            {/* TV: season count */}
            {item.media_type === "tv" && item.seasons && (
              <span className="text-purple-400">{item.seasons} s</span>
            )}
          </div>

          {/* List modes: days info (standardized for both Watchlist and Wishlist) */}
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
