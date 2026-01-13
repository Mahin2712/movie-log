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
        p-4
      "
    >
      <div className="flex gap-4">
        {/* Poster */}
        <div className="relative shrink-0">
          <img
            src={item.poster_path ? IMG_BASE + item.poster_path : ""}
            alt={item.title}
            className="w-32.5 h-48.75
                                rounded-xl object-cover"
          />

          {/* Days added badge */}
          {daysAgo !== null && (
            <div
              className="
                            absolute top-0 right-0
                            w-11 h-11
                            overflow-hidden
                            z-10
                            "
            >
              {/* Triangle */}
              <div
                className="
                    absolute top-0 right-0
                    w-0 h-0
                    border-t-44
                    border-l-44
                    border-l-transparent
                    shadow-md
                "
                style={{
                  borderTopColor: "rgba(88, 136, 255, 0.85)",
                }}
              />

              {/* Number */}
              <div
                className="
                    absolute top-0 right-0
                    w-11 h-11
                    flex items-start justify-end
                    pr-1.5 pt-1.5
                    text-[11px] font-extrabold text-white
                    select-none
                    pointer-events-none
                "
              >
                {daysAgo}
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col">
          {/* Title */}
          <div className="flex justify-between gap-3">
            <div>
              <h3 className="text-xl font-semibold leading-tight">
                {item.title || item.name}
              </h3>
              <div className="text-sm text-zinc-400 mt-0.5">{year}</div>
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

            {status !== "wishlist"  && (
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
