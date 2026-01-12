import { IMG_BASE } from "../utils/constants";

export default function MediaGridCard({ item, daysAgo, mode,onMarkWatched, onClick }) {
  return (
    <div
      className="group relative cursor-pointer transition-transform duration-200 hover:-translate-y-1"
      onClick={onClick}
    >
      {/* Poster */}
      <div className="relative rounded-xl overflow-hidden">
        <img
          src={item.poster_path ? IMG_BASE + item.poster_path : ""}
          alt={item.title || item.name}
          className="w-full aspect-2/3 object-cover"
        />
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
        {daysAgo !== null && (
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
        <div className="text-xs text-zinc-400 mt-0.5">
          {item.release_date?.slice(0, 4) ||
            item.first_air_date?.slice(0, 4)}
        </div>
      </div>
    </div>
  );
}
