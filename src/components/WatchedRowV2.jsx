import { useState } from "react";
import { IMG_BASE } from "../utils/constants";
import { getTMDBLink } from "../utils/tmdb";

export default function WatchedRow({
    item,
    onRemove,
    onMoveToWishlist,
    rating,
    onSetRating,
    genresMap = {},
    onSelect
}) {
    const [open, setOpen] = useState(false);
    const [hover, setHover] = useState(null);
    const [expanded, setExpanded] = useState(false);
    const [pendingAction, setPendingAction] = useState(null);

    // Prefer hover value if active, otherwise saved rating, defaulting to 0
    const displayRating = hover !== null ? hover : (rating || 0);

    const starClass = (i) => {
        const v = i + 1;
        if (displayRating >= v) return "full";
        if (displayRating >= v - 0.5) return "half";
        return "";
    };

    // Formatted Year Logic
    let displayYear = item.year || item.release_date?.slice(0, 4) || item.first_air_date?.slice(0, 4) || "—";
    if (item.media_type === 'tv' || String(item.id).startsWith('tv_')) {
        const start = item.first_air_date?.slice(0, 4);
        const end = item.in_production ? "Present" : (item.last_air_date?.slice(0, 4) || "");
        if (start) {
            displayYear = end && end !== start ? `${start}-${end}` : start;
        }
    }

    // Season Count Logic
    const seasonCount = item.number_of_seasons;
    const seasonLabel = seasonCount ? `${seasonCount} Season${seasonCount === 1 ? '' : 's'}` : null;

    // Progress Calculation
    const progressPercent = item.progress?.percentComplete ?? item.progress?.percentage ?? 0;
    const progressRadius = 12; // Adjusted for smaller inline size (w-8 h-8)
    const progressCircumference = 2 * Math.PI * progressRadius;
    const progressOffset = progressCircumference - (progressPercent / 100) * progressCircumference;

    // Calculate days ago for list view logic if needed
    const daysAgo = item.dateAdded
        ? Math.floor((Date.now() - new Date(item.dateAdded).getTime()) / 86400000)
        : null;

    // Description Truncation
    const DESC_LIMIT = 150;
    const description = item.overview || "No description available.";
    const isLongDesc = description.length > DESC_LIMIT;
    const showDesc = expanded ? description : description.slice(0, DESC_LIMIT) + (isLongDesc ? "..." : "");

    return (
        <div className="movie-card wishlist-row group relative flex flex-row">
            {/* Poster container */}
            <div className="relative shrink-0">
                <img
                    className="w-20 sm:w-28 h-auto aspect-[2/3] sm:h-full rounded-lg object-cover shadow-lg"
                    src={item.poster_path ? `${IMG_BASE}${item.poster_path}` : null}
                    alt={item.title}
                />
            </div>

            <div className="movie-info relative flex-1 flex flex-col justify-between min-h-[min-content] sm:min-h-40 ml-2 sm:ml-0">
                {/* Header: Tag only */}
                <div className="mb-0.5 sm:mb-1">
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] sm:text-xs font-bold ${item.media_type === "movie" || !item.media_type ? "bg-blue-600" : "bg-purple-600"} text-white`}>
                        {item.media_type === "movie" || !item.media_type ? "Movie" : "TV"}
                    </span>
                </div>

                {/* RATING DISPLAY: Absolute Top Right */}
                <div 
                    className="absolute -top-1 sm:top-0 right-0 rating-display cursor-pointer hover:scale-105 transition-transform flex items-center gap-1 min-h-[28px] justify-center" 
                    onClick={() => {
                        if (pendingAction === null) {
                            setOpen(!open);
                        }
                    }}
                >
                    {pendingAction === 'rating' ? (
                        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin shrink-0" />
                    ) : displayRating > 0 ? (
                        <span
                            style={{
                                background: "linear-gradient(90deg, #2196f3 0%, #21cbf3 100%)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                fontWeight: 700,
                                display: "inline-block",
                                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))"
                            }}
                            className="text-lg sm:text-[1.4rem]"
                        >
                            ★ {displayRating.toFixed(1)}
                        </span>
                    ) : (
                        <span className="star-icon muted text-zinc-600 hover:text-blue-400 text-xl sm:text-2xl">★</span>
                    )}
                </div>


                {/* Title & Year */}
                <div className="pr-12 sm:pr-20">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <h3 className="text-base sm:text-lg font-semibold leading-tight text-white mb-0.5 line-clamp-2">{item.title}</h3>

                        {/* Progress Ring (Inline) */}
                        {(item.media_type === 'tv' || String(item.id).startsWith('tv_')) && (
                            <div className="relative w-6 h-6 sm:w-8 sm:h-8 shrink-0 hidden sm:block">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle
                                        cx="50%"
                                        cy="50%"
                                        r={progressRadius}
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        fill="transparent"
                                        className="text-zinc-800"
                                    />
                                    <circle
                                        cx="50%"
                                        cy="50%"
                                        r={progressRadius}
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        fill="transparent"
                                        strokeDasharray={progressCircumference}
                                        strokeDashoffset={progressOffset}
                                        strokeLinecap="round"
                                        className={progressPercent === 100 ? "text-emerald-500" : "text-blue-500"}
                                    />
                                </svg>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-wrap items-center text-xs sm:text-sm text-zinc-400 gap-2 sm:gap-3">
                        <span>{displayYear}</span>
                        {seasonLabel && (
                            <span className="text-zinc-500">{seasonLabel}</span>
                        )}
                        {daysAgo !== null && (
                            daysAgo < 1 ? (
                                <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[9px] sm:text-xs shadow-sm">New</span>
                            ) : (
                                <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-zinc-800 border border-white/5 text-zinc-400 text-[9px] sm:text-xs font-medium">{daysAgo}d ago</span>
                            )
                        )}
                    </div>
                </div>



                {/* ⭐ STAR PANEL (Absolute) */}
                {open && (
                    <>
                        {/* Invisible backdrop to close panel when clicking outside */}
                        <div
                            className="fixed inset-0 z-40"
                            onClick={(e) => {
                                e.stopPropagation();
                                setOpen(false);
                            }}
                        />

                        <div
                            className="star-panel absolute right-0 top-8 z-50 bg-zinc-900 border border-white/10 shadow-2xl rounded-full px-2 sm:px-3 py-1.5 flex items-center gap-0.5 sm:gap-1 scale-90 sm:scale-100 origin-top-right"
                            onMouseLeave={() => setHover(null)}
                        >
                            {Array.from({ length: 10 }).map((_, i) => (
                                <div key={i} className="star-slot relative cursor-pointer flex items-center justify-center">
                                    <span
                                        className={`text-base sm:text-lg leading-none transition-colors ${starClass(i) === "full" ? "text-blue-400" : starClass(i) === "half" ? "text-blue-400/50" : "text-zinc-700 hover:text-zinc-500"
                                            }`}
                                    >
                                        ★
                                    </span>

                                    {/* HALF */}
                                    <div
                                        className="absolute top-0 left-0 w-1/2 h-full z-10"
                                        onMouseEnter={() => setHover(i + 0.5)}
                                        onClick={async () => {
                                            if (pendingAction !== null) return;
                                            setOpen(false);
                                            setHover(null);
                                            setPendingAction('rating');
                                            try {
                                                await onSetRating(i + 0.5);
                                            } catch (err) {
                                                console.error(err);
                                            } finally {
                                                setPendingAction(null);
                                            }
                                        }}
                                    />

                                    {/* FULL */}
                                    <div
                                        className="absolute top-0 right-0 w-1/2 h-full z-10"
                                        onMouseEnter={() => setHover(i + 1)}
                                        onClick={async () => {
                                            if (pendingAction !== null) return;
                                            setOpen(false);
                                            setHover(null);
                                            setPendingAction('rating');
                                            try {
                                                await onSetRating(i + 1);
                                            } catch (err) {
                                                console.error(err);
                                            } finally {
                                                setPendingAction(null);
                                            }
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* Description with 'Show More' */}
                <div className="mt-1.5 sm:mt-2 text-[11px] sm:text-sm text-zinc-400 leading-relaxed hidden sm:block">
                    <p className="inline">
                        {showDesc}
                    </p>
                    {isLongDesc && (
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="ml-1 sm:ml-2 text-blue-400 hover:text-blue-300 text-[10px] sm:text-xs font-semibold hover:underline"
                        >
                            {expanded ? "Show less" : "Show more"}
                        </button>
                    )}
                </div>

                <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2 sm:mt-auto pt-2 sm:pt-4">
                    <button 
                        disabled={pendingAction !== null}
                        className="btn btn-sm px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-md sm:rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 text-[10px] sm:text-xs font-medium border border-white/5 transition-colors flex items-center gap-1.5 disabled:opacity-50" 
                        onClick={async (e) => {
                            e.stopPropagation();
                            setPendingAction('remove');
                            try {
                                await onRemove(item.id);
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

                    <button 
                        disabled={pendingAction !== null}
                        className="btn btn-sm px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-md sm:rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 text-[10px] sm:text-xs font-medium border border-white/5 transition-colors flex items-center gap-1.5 disabled:opacity-50" 
                        onClick={async (e) => {
                            e.stopPropagation();
                            setPendingAction('wishlist');
                            try {
                                await onMoveToWishlist();
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
                        Wishlist
                    </button>

                    {(item.media_type === 'tv' || String(item.id).startsWith('tv_')) && (
                        <button
                            disabled={pendingAction !== null}
                            className="btn btn-sm px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-md sm:rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[10px] sm:text-xs font-bold transition-colors shadow-lg shadow-blue-900/20 disabled:opacity-50"
                            onClick={() => onSelect?.(item)}
                        >
                            Manage
                        </button>
                    )}

                    <a
                        className="btn btn-sm px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-md sm:rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 text-[10px] sm:text-xs font-medium border border-white/5 transition-colors text-center"
                        href={getTMDBLink(item)}
                        target="_blank"
                        rel="noreferrer"
                    >
                        Open
                    </a>
                </div>
            </div>
        </div>
    );
}
