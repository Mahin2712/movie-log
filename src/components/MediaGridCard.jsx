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
  onOpenDetail,
}) {
  const handleCardClick = (e) => {
    e.stopPropagation();
    onOpenDetail?.(item);
  };

  // Common Year & Metadata Logic
  let displayYear = item.year || item.release_date?.slice(0, 4) || item.first_air_date?.slice(0, 4) || "";
  if (item.media_type === "tv" || (item.id && String(item.id).startsWith("tv_"))) {
    const start = item.first_air_date?.slice(0, 4);
    const end = item.in_production ? "Present" : (item.last_air_date?.slice(0, 4) || "");
    if (start) {
      displayYear = end && end !== start ? `${start}-${end}` : start;
    }
  }

  const seasonCount = item.number_of_seasons;
  const seasonLabel = seasonCount ? `${seasonCount} Season${seasonCount === 1 ? '' : 's'}` : null;

  // Search/Discovery Mode (Compact Layout)
  if (mode === "all" || mode === "search") {
    return (
      <div
        className="group relative bg-zinc-900/40 rounded-2xl overflow-hidden border border-white/5 hover:border-blue-500/50 transition-all duration-300 cursor-pointer flex flex-col h-full shadow-lg"
        onClick={handleCardClick}
      >
        <div className="relative aspect-[2/3] overflow-hidden">
          {item.poster_path ? (
            <img
              src={IMG_BASE + item.poster_path}
              alt={item.title || item.name}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-zinc-600 text-xs italic">
              No Poster
            </div>
          )}
          
          {/* Media Type Badge */}
          <div className="absolute top-2 left-2 z-10">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border border-white/10 ${item.media_type === "movie" ? "bg-blue-600/80" : "bg-purple-600/80"} text-white`}>
              {item.media_type === "movie" ? "Movie" : "TV"}
            </span>
          </div>
        </div>

        <div className="p-3 flex flex-col flex-1 gap-1">
          <div className="text-sm font-bold text-zinc-100 line-clamp-1 group-hover:text-blue-400 transition-colors">
            {item.title || item.name}
          </div>

          <div className="text-[11px] text-zinc-500 font-medium mb-2">
            {displayYear}
          </div>

          <div className="mt-auto flex items-center gap-2">
            <button
              className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1.5
                ${isInWatchlist 
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                  : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 active:scale-95"
                }`}
              disabled={isInWatchlist}
              onClick={(e) => {
                e.stopPropagation();
                onAddToWatchlist?.(item);
              }}
            >
              {isInWatchlist ? "Watched" : "+ Watched"}
            </button>

            <button
              className={`p-1.5 rounded-lg border transition-all active:scale-90
                ${isInWishlist 
                  ? "bg-rose-500/20 border-rose-500/40 text-rose-400" 
                  : "bg-zinc-800/50 border-white/5 text-zinc-400 hover:text-white hover:bg-zinc-700"
                } ${isInWatchlist ? "opacity-30 pointer-events-none" : ""}`}
              disabled={isInWishlist || isInWatchlist}
              onClick={(e) => {
                e.stopPropagation();
                onAddToWishlist?.(item);
              }}
            >
              <svg className="w-4 h-4" fill={isInWishlist ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- WISHLIST / WATCHLIST MODE (Detailed Grid Card) ---
  const progressPercent = item.progress?.percentage || 0;
  const progressRadius = 14;
  const progressCircumference = 2 * Math.PI * progressRadius;
  const progressOffset = progressCircumference - (progressPercent / 100) * progressCircumference;

  return (
    <div
      className="group relative cursor-pointer transition-all duration-300 h-full flex flex-col"
      onClick={handleCardClick}
    >
      <div className="relative rounded-2xl overflow-hidden aspect-[2/3] shadow-2xl bg-zinc-900 border border-white/5 group-hover:border-blue-500/50 transition-colors">
        {/* Poster */}
        <img
          src={item.poster_path ? IMG_BASE + item.poster_path : null}
          alt={item.title || item.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />

        {/* Top Badges */}
        <div className="absolute top-2 left-2 right-2 flex justify-between items-start z-10 pointer-events-none">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border border-white/10 shadow-lg ${item.media_type === "movie" || !item.media_type ? "bg-blue-600/80" : "bg-purple-600/80"} text-white`}>
            {item.media_type === "movie" || !item.media_type ? "Movie" : "TV"}
          </span>

          {mode === "wishlist" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMarkWatched?.(item);
              }}
              className="pointer-events-auto w-8 h-8 rounded-full bg-emerald-500/90 text-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform"
              title="Mark as watched"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </button>
          )}
        </div>

        {/* Progress Ring Overlay (TV Only) */}
        {(mode === 'watchlist' && (item.media_type === "tv" || (item.id && String(item.id).includes("_tv")))) && (
          <div className="absolute bottom-3 right-3 flex items-center justify-center bg-black/70 rounded-full p-1.5 backdrop-blur-md border border-white/10 shadow-2xl">
            <div className="relative w-8 h-8">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="16" cy="16" r={progressRadius} stroke="currentColor" strokeWidth="3" fill="transparent" className="text-zinc-700" />
                <circle
                  cx="16" cy="16" r={progressRadius}
                  stroke="currentColor" strokeWidth="3" fill="transparent"
                  strokeDasharray={progressCircumference}
                  strokeDashoffset={progressOffset}
                  strokeLinecap="round"
                  className={progressPercent === 100 ? "text-emerald-500" : "text-blue-500"}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-white">
                {progressPercent}%
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="pt-3 flex flex-col gap-1 px-1">
        <h3 className="text-sm sm:text-base font-bold text-zinc-100 line-clamp-1 group-hover:text-blue-400 transition-colors leading-snug">
          {item.title || item.name}
        </h3>

        <div className="flex items-center justify-between text-[11px] font-medium text-zinc-500">
          <div className="flex items-center gap-2">
            <span>{displayYear}</span>
            {seasonLabel && <span className="text-blue-400/80 font-bold">{seasonLabel}</span>}
          </div>

          {(mode === "watchlist" || mode === "wishlist") && daysAgo !== null && (
            <span className={`px-1.5 py-0.5 rounded-md ${daysAgo < 1 ? "bg-emerald-500/10 text-emerald-400" : "bg-zinc-800 text-zinc-500"}`}>
              {daysAgo < 1 ? "New" : `${daysAgo}d`}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
