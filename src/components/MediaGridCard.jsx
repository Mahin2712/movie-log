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
        {/* Media type badge */}
        <div className="absolute top-2 left-2 z-20">
          <span className={`px-2 py-0.5 rounded text-xs font-bold ${item.media_type === "movie" ? "bg-blue-700/80" : "bg-purple-700/80"} text-white`}>
            {item.media_type === "movie" ? "Movie" : item.media_type === "tv" ? "TV" : ""}
          </span>
        </div>
        <img
          src={item.poster_path ? IMG_BASE + item.poster_path : ""}
          alt={item.title || item.name}
          className="w-full aspect-2/3 object-cover"
        />
        {/* Search mode: add to watchlist/wishlist */}
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
          {mode === "wishlist" && (
            <button
            onClick={(e) => {
              e.stopPropagation();
              onMarkWatched?.(item);
            }}
            className="
      absolute top-0 left-0 z-10
      w-11 h-11
      overflow-hidden
    "
            title="Mark as watched"
          >
            <div
              className="
        absolute top-0 left-0
        w-0 h-0
        border-t-44
        border-r-44
        border-r-transparent
        shadow-md
      "
              style={{ borderTopColor: "rgba(120, 120, 130, 0.85)" }}
            />
            <div
              className="
        absolute top-0 left-0
        w-11 h-11
        flex items-start justify-start
        pl-1.5 pt-1.5
        text-[14px] font-extrabold text-white
        pointer-events-none
      "
            >
              +
            </div>
          </button>
        )}

        {/* Days-added corner */}
        {mode === "wishlist" && daysAgo !== null && (
          <div className="absolute top-0 right-0 w-11 h-11 overflow-hidden">
            {/* Triangle */}
            <div
              className="absolute top-0 right-0 w-0 h-0 border-t-44 border-l-44 border-l-transparent shadow-md"
              style={{ borderTopColor: "rgba(88, 136, 255, 0.85)" }}
            />

            {/* Number */}
            <div className="absolute top-0 right-0 w-11 h-11 flex items-start justify-end pr-1.5 pt-1.5 text-[11px] font-extrabold text-white pointer-events-none">
              {daysAgo}
            </div>
          </div>
        )}
      </div>

      {/* Title */}
      <div className="mt-2">
        <div className="text-sm font-semibold leading-tight line-clamp-2">
          {item.title || item.name}
        </div>

        {/* Metadata row: year, season count for TV, days info for lists */}
        <div className="mt-1 flex items-center gap-4 text-xs">
          {/* Year */}
          <span className="text-zinc-400">
            {item.year || item.release_date?.slice(0, 4) || item.first_air_date?.slice(0, 4) || ""}
          </span>
          {/* TV: season count */}
          {item.media_type === "tv" && item.seasons && (
            <span className="text-purple-400">{item.seasons} season{item.seasons > 1 ? "s" : ""}</span>
          )}
          {/* List modes: days info */}
          {(mode === "watchlist" || mode === "wishlist") && daysAgo !== null && (
            daysAgo < 1 ? (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold">New</span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-zinc-700/50 text-zinc-200">{daysAgo} {daysAgo > 1 ? "days ago" : "day ago"}</span>
            )
          )}
        </div>
      </div>
    </div>
  );
}
