import React, { memo } from "react";
import { IMG_BASE } from "../utils/constants";

const MediaGridCard = memo(({
  item,
  daysAgo,
  mode,
  rating,
  onSetRating,
  onMarkWatched,
  onAddToWatchlist,
  onAddToWishlist,
  isInWatchlist,
  isInWishlist,
  onOpenDetail,
}) => {
  const [isPending, setIsPending] = React.useState(false);
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
        className="group relative bg-zinc-900/40 rounded-2xl overflow-hidden border border-white/5 hover:border-blue-500/50 transition-all duration-400 cursor-pointer flex flex-col h-full shadow-lg group-hover:shadow-blue-500/10"
        onClick={handleCardClick}
      >
        <div className="relative aspect-[2/3] overflow-hidden">
          <img
            src={item.poster_path ? IMG_BASE + item.poster_path : "https://via.placeholder.com/300x450?text=No+Poster"}
            alt={item.title || item.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          
          {/* Top Badges */}
          <div className="absolute top-2 left-2 right-2 flex justify-between items-start z-10 pointer-events-none">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border border-white/10 ${item.media_type === "movie" ? "bg-blue-600/80" : "bg-purple-600/80"} text-white shadow-lg`}>
              {item.media_type === "movie" ? "Movie" : "TV"}
            </span>

            {/* Rating Badge (Compact) */}
            {(item.vote_average > 0) && (
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg backdrop-blur-md bg-black/40 border border-white/10 text-yellow-500 shadow-lg">
                <span className="text-[9px] font-black">{item.vote_average?.toFixed(1)}</span>
                <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
            )}
          </div>
        </div>

        <div className="p-3 flex flex-col flex-1 gap-1">
          <div className="text-sm font-bold text-zinc-100 line-clamp-1 group-hover:text-blue-400 transition-colors">
            {item.title || item.name}
          </div>

          <div className="text-[11px] text-zinc-500 font-medium mb-2">
            {displayYear}
          </div>

          <div className="mt-auto">
            {mode === "search" && (
              <MediaActionButtons 
                item={item}
                isInWatchlist={isInWatchlist}
                isInWishlist={isInWishlist}
                onAddToWatchlist={onAddToWatchlist}
                onAddToWishlist={onAddToWishlist}
                layout="grid"
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- WISHLIST / WATCHLIST MODE (Detailed Grid Card) ---
  const progressPercent = item.progress?.percentComplete ?? item.progress?.percentage ?? 0;
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
        <div className="absolute top-2 left-2 right-2 flex justify-between items-start z-20 pointer-events-none">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border border-white/10 shadow-lg ${item.media_type === "movie" || !item.media_type ? "bg-blue-600/80" : "bg-purple-600/80"} text-white`}>
            {item.media_type === "movie" || !item.media_type ? "Movie" : "TV"}
          </span>

          {/* Premium Rating Badge */}
          {(onSetRating || rating) && (
            <div className="flex flex-col items-end gap-1 pointer-events-auto">
              <div className={`group/rating relative flex items-center gap-1 px-2 py-1 rounded-xl backdrop-blur-xl border border-white/10 shadow-2xl transition-all duration-300 ${isPending ? 'pointer-events-none bg-black/60 text-zinc-500' : rating ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' : 'bg-black/40 text-white/70 hover:bg-black/60'}`}>
                {isPending ? (
                  <div className="w-3.5 h-3.5 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin shrink-0" />
                ) : (
                  <>
                    <span className="text-[10px] font-black">{rating || item.vote_average?.toFixed(1) || '0.0'}</span>
                    <svg className={`w-3 h-3 ${rating ? 'fill-yellow-500' : 'fill-white/30 group-hover/rating:fill-white/70'}`} viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </>
                )}

                {/* Hover Rating Selector */}
                {onSetRating && !isPending && (
                  <div className="absolute top-full right-0 mt-2 p-2 bg-zinc-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl opacity-0 translate-y-2 pointer-events-none group-hover/rating:opacity-100 group-hover/rating:translate-y-0 group-hover/rating:pointer-events-auto transition-all duration-300 z-50 flex items-center gap-0.5">
                    {[1,2,3,4,5,6,7,8,9,10].map(val => (
                      <button
                        key={val}
                        disabled={isPending}
                        onClick={async (e) => {
                          e.stopPropagation();
                          setIsPending(true);
                          try {
                            await onSetRating(item.id, val);
                          } catch (err) {
                            console.error(err);
                          } finally {
                            setIsPending(false);
                          }
                        }}
                        className={`w-6 h-8 rounded-md flex items-center justify-center text-[10px] font-black transition-all hover:scale-110 active:scale-90 ${rating === val ? 'bg-yellow-500 text-black' : 'hover:bg-white/10 text-zinc-400 hover:text-white'} disabled:opacity-50`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {mode === "wishlist" && !rating && (
            <button
              disabled={isPending}
              onClick={async (e) => {
                e.stopPropagation();
                setIsPending(true);
                try {
                  await onMarkWatched?.(item);
                } catch (err) {
                  console.error(err);
                } finally {
                  setIsPending(false);
                }
              }}
              className="pointer-events-auto w-8 h-8 rounded-full bg-emerald-500/90 text-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform disabled:opacity-50"
              title="Mark as watched"
            >
              {isPending ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              )}
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
});

export default MediaGridCard;
