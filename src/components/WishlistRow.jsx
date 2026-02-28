// src/components/WishlistRow.jsx
import { IMG_BASE } from "../utils/constants.js";

export default function WishlistRow({
  item,
  onRemove,
  onMoveToWatched
}) {
  return (
    <div className="movie-card wishlist-row group relative">
      <img
        className="movie-poster"
        src={item.poster_path ? `${IMG_BASE}${item.poster_path}` : ""}
        alt={item.title}
      />

      <div className="movie-info flex-1 min-w-0 flex flex-col justify-between">
        <div className="flex justify-between items-start gap-4">
          <div className="min-w-0">
            <h3 className="truncate pr-2 font-bold text-(length:--fs-base)">{item.title}</h3>
            <div className="year text-(length:--fs-xs) text-zinc-400">
              {item.release_date ? item.release_date.slice(0, 4) : "—"}
            </div>
          </div>

          <div className="flex gap-2 flex-wrap justify-end shrink-0">
            <button
              className="btn text-xs py-1.5 px-3"
              onClick={() => onMoveToWatched(item.id)}
            >
              Move to watched
            </button>

            <button
              className="btn btn-ghost text-xs py-1.5 px-3"
              onClick={() => onRemove(item.id)}
            >
              Remove
            </button>
          </div>
        </div>

        <p className="mt-2 text-(length:--fs-sm) text-zinc-400 line-clamp-2 md:line-clamp-3">
          {item.overview || "No details available."}
        </p>
      </div>
    </div>
  );
}
