import { IMG_BASE } from "../utils/constants";

export default function MediaCard({
  item,
  status, // "watched" | "wishlist" | null
  rating,
  genresMap = {},
  onWatch,
  onWishlist,
  onRemove,
}) {
  const year =
    item.release_date?.slice(0, 4) || item.first_air_date?.slice(0, 4) || "—";

  // Days since added
  const daysAgo = item.dateAdded
    ? Math.floor((Date.now() - new Date(item.dateAdded).getTime()) / 86400000)
    : null;

  return (
    <div
      className="
        rounded-xl border border-white/5
        bg-linear-to-b from-[#0e1830] to-[#081026]
        hover:shadow-2xl hover:-translate-y-1
        transition-all duration-200
        p-4 relative group
      "
    >
      <div className="flex gap-4">
        {/* Poster */}
        <div className="relative shrink-0">
          {/* Tag */}
          <span className={`absolute top-2 left-2 z-10 px-2 py-0.5 rounded text-xs font-bold ${item.media_type === "movie" || !item.media_type ? "bg-blue-700/80" : "bg-purple-700/80"} text-white`}>
            {item.media_type === "movie" || !item.media_type ? "Movie" : "TV"}
          </span>
          <img
            src={item.poster_path ? IMG_BASE + item.poster_path : ""}
            alt={item.title}
            className="w-32.5 h-48.75 rounded-xl object-cover"
          />

          {/* REMOVED CORNER DAYS BADGE HERE TOO */}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col">
          {/* Title and Metadata Header */}
          <div className="flex justify-between items-start gap-3">
            <div className="w-full">
              <h3 className="text-xl font-semibold leading-tight">
                {item.title || item.name}
              </h3>

              {/* Year + Days Row */}
              <div className="flex items-center justify-between text-sm text-zinc-400 mt-1 w-full pr-2">
                <span>{year}</span>

                {/* Realigned Days Tag */}
                {daysAgo !== null && (
                  daysAgo < 1 ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold text-xs">New</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-zinc-700/50 text-zinc-200 text-xs">{daysAgo}d ago</span>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Overview */}
          <p className="text-sm text-zinc-400 mt-2 line-clamp-3">
            {item.overview || "No description available."}
          </p>

          {/* Genres */}
          {item.genre_ids?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {item.genre_ids.slice(0, 4).map((gid) => (
                <span
                  key={gid}
                  className="
                    text-[11px] px-2 py-0.5 rounded-full
                    bg-white/5 border border-white/10
                  "
                >
                  {genresMap[gid] || "Genre"}
                </span>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 mt-auto pt-4">
            {status !== "watched" && (
              <button
                className="btn btn-primary"
                onClick={() => onWatch?.(item)}
              >
                ✓ Watched
              </button>
            )}

            {status !== "wishlist" && (
              <button className="btn" onClick={() => onWishlist?.(item)}>
                ♡ Wishlist
              </button>
            )}

            {status && (
              <button
                className="btn btn-ghost"
                onClick={() => onRemove?.(item.id)}
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
