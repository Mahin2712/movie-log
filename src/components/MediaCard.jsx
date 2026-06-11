import { useState } from "react";
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
  const [expanded, setExpanded] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  // Date Logic
  const year =
    item.year || item.release_date?.slice(0, 4) || item.first_air_date?.slice(0, 4) || "—";

  // Days since added
  const daysAgo = item.dateAdded
    ? Math.floor((Date.now() - new Date(item.dateAdded).getTime()) / 86400000)
    : null;

  // Description Truncation
  const DESC_LIMIT = 150;
  const description = item.overview || "No description available.";
  const isLongDesc = description.length > DESC_LIMIT;
  const showDesc = expanded ? description : description.slice(0, DESC_LIMIT) + (isLongDesc ? "..." : "");

  return (
    <div
      className="
        rounded-xl border border-white/5
        bg-linear-to-b from-[#0e1830] to-[#081026]
        hover:shadow-2xl hover:-translate-y-1
        transition-all duration-200
        p-3 relative group flex gap-4
      "
    >
      {/* Poster */}
      <div className="relative shrink-0">
        <img
          src={item.poster_path ? IMG_BASE + item.poster_path : ""}
          alt={item.title}
          className="w-28 h-full object-cover rounded-lg shadow-lg"
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col min-h-40 relative">

        {/* Header: Tag Only */}
        <div className="flex justify-between items-start mb-1">
          <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${item.media_type === "movie" || !item.media_type ? "bg-blue-600" : "bg-purple-600"} text-white`}>
            {item.media_type === "movie" || !item.media_type ? "Movie" : "TV"}
          </span>
        </div>

        {/* Title & Year */}
        <div className="pr-12">
          <h3 className="text-xl font-semibold leading-tight text-white">
            {item.title || item.name}
          </h3>
          <div className="flex items-center text-sm text-zinc-400 mt-1">
            <span>{year}</span>
            {daysAgo !== null && (
              daysAgo < 1 ? (
                <span className="ml-3 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs shadow-sm">New</span>
              ) : (
                <span className="ml-3 px-2 py-0.5 rounded-full bg-zinc-800 border border-white/5 text-zinc-400 text-xs font-medium">{daysAgo}d ago</span>
              )
            )}
          </div>
        </div>

        {/* Expandable Description */}
        <div className="mt-2 text-sm text-zinc-400 leading-relaxed">
          <p className="inline">{showDesc}</p>
          {isLongDesc && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="ml-2 text-blue-400 hover:text-blue-300 text-xs font-semibold hover:underline"
            >
              {expanded ? "Show less" : "Show more"}
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-auto pt-4">
          {status !== "watched" && (
            <button
              disabled={pendingAction !== null}
              className="btn btn-sm px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors shadow-lg shadow-blue-900/20 flex items-center gap-1.5 disabled:opacity-50"
              onClick={async (e) => {
                e.stopPropagation();
                setPendingAction('watch');
                try {
                  await onWatch?.(item);
                } catch (err) {
                  console.error(err);
                } finally {
                  setPendingAction(null);
                }
              }}
            >
              {pendingAction === 'watch' && (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              ✓ Watched
            </button>
          )}

          {status !== "wishlist" && (
            <button 
              disabled={pendingAction !== null}
              className="btn btn-sm px-4 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-medium border border-white/5 transition-colors flex items-center gap-1.5 disabled:opacity-50" 
              onClick={async (e) => {
                e.stopPropagation();
                setPendingAction('wishlist');
                try {
                  await onWishlist?.(item);
                } catch (err) {
                  console.error(err);
                } finally {
                  setPendingAction(null);
                }
              }}
            >
              {pendingAction === 'wishlist' && (
                <div className="w-3 h-3 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
              )}
              ♡ Wishlist
            </button>
          )}

          {status && (
            <button
              disabled={pendingAction !== null}
              className="btn btn-sm px-4 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-medium border border-white/5 transition-colors flex items-center gap-1.5 disabled:opacity-50"
              onClick={async (e) => {
                e.stopPropagation();
                setPendingAction('remove');
                try {
                  await onRemove?.(item.id);
                } catch (err) {
                  console.error(err);
                } finally {
                  setPendingAction(null);
                }
              }}
            >
              {pendingAction === 'remove' && (
                <div className="w-3 h-3 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
              )}
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
