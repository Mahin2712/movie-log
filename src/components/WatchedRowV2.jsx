import { useState } from "react";
import { IMG_BASE } from "../utils/constants";

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
    const progressPercent = item.progress?.percentage || 0;
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
        <div className="movie-card wishlist-row group relative">
            {/* Poster container */}
            <div className="relative shrink-0">
                <img
                    className="w-28 h-full rounded-lg object-cover shadow-lg"
                    src={item.poster_path ? `${IMG_BASE}${item.poster_path}` : null}
                    alt={item.title}
                />
            </div>

            <div className="movie-info relative flex-1 flex flex-col min-h-40">
                {/* Header: Tag only */}
                <div className="mb-1">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${item.media_type === "movie" || !item.media_type ? "bg-blue-600" : "bg-purple-600"} text-white`}>
                        {item.media_type === "movie" || !item.media_type ? "Movie" : "TV"}
                    </span>
                </div>

                {/* RATING DISPLAY: Absolute Top Right for 'Higher' placement */}
                <div className="absolute top-0 right-0 rating-display cursor-pointer hover:scale-105 transition-transform" onClick={() => setOpen(!open)}>
                    {displayRating > 0 ? (
                        <span
                            style={{
                                background: "linear-gradient(90deg, #2196f3 0%, #21cbf3 100%)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                fontWeight: 700,
                                fontSize: "1.4rem",
                                display: "inline-block",
                                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))"
                            }}
                        >
                            ★ {displayRating.toFixed(1)}
                        </span>
                    ) : (
                        <span className="star-icon muted text-zinc-600 hover:text-blue-400 text-2xl">★</span>
                    )}
                </div>

                {/* Title & Year */}
                <div className="pr-20">
                    <div className="flex items-center gap-3">
                        <h3 className="text-xl font-semibold leading-tight text-white">{item.title}</h3>

                        {/* Progress Ring (Inline) */}
                        {(item.media_type === 'tv' || String(item.id).startsWith('tv_')) && (
                            <div className="relative w-8 h-8 shrink-0">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle
                                        cx="16"
                                        cy="16"
                                        r={progressRadius}
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        fill="transparent"
                                        className="text-zinc-800"
                                    />
                                    <circle
                                        cx="16"
                                        cy="16"
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
                                <div className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-zinc-300">
                                    {progressPercent > 0 ? `${progressPercent}%` : "0%"}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center text-sm text-zinc-400 mt-1 gap-3">
                        <span>{displayYear}</span>
                        {seasonLabel && (
                            <span className="text-zinc-500">{seasonLabel}</span>
                        )}
                        {daysAgo !== null && (
                            daysAgo < 1 ? (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs shadow-sm">New</span>
                            ) : (
                                <span className="px-2 py-0.5 rounded-full bg-zinc-800 border border-white/5 text-zinc-400 text-xs font-medium">{daysAgo}d ago</span>
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
                            className="star-panel absolute right-0 top-8 z-50 bg-zinc-900 border border-white/10 shadow-2xl rounded-full px-3 py-1.5 flex items-center gap-1"
                            onMouseLeave={() => setHover(null)}
                        >
                            {Array.from({ length: 10 }).map((_, i) => (
                                <div key={i} className="star-slot relative cursor-pointer flex items-center justify-center">
                                    <span
                                        className={`text-lg leading-none transition-colors ${starClass(i) === "full" ? "text-blue-400" : starClass(i) === "half" ? "text-blue-400/50" : "text-zinc-700 hover:text-zinc-500"
                                            }`}
                                    >
                                        ★
                                    </span>

                                    {/* HALF */}
                                    <div
                                        className="absolute top-0 left-0 w-1/2 h-full z-10"
                                        onMouseEnter={() => setHover(i + 0.5)}
                                        onClick={() => {
                                            onSetRating(i + 0.5);
                                            setOpen(false);
                                            setHover(null);
                                        }}
                                    />

                                    {/* FULL */}
                                    <div
                                        className="absolute top-0 right-0 w-1/2 h-full z-10"
                                        onMouseEnter={() => setHover(i + 1)}
                                        onClick={() => {
                                            onSetRating(i + 1);
                                            setOpen(false);
                                            setHover(null);
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* Description with 'Show More' */}
                <div className="mt-2 text-sm text-zinc-400 leading-relaxed">
                    <p className="inline">
                        {showDesc}
                    </p>
                    {isLongDesc && (
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="ml-2 text-blue-400 hover:text-blue-300 text-xs font-semibold hover:underline"
                        >
                            {expanded ? "Show less" : "Show more"}
                        </button>
                    )}
                </div>

                <div className="flex gap-2 mt-auto pt-4">
                    <button className="btn btn-sm px-4 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-medium border border-white/5 transition-colors" onClick={() => onRemove(item.id)}>
                        Remove
                    </button>

                    <button className="btn btn-sm px-4 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-medium border border-white/5 transition-colors" onClick={() => onMoveToWishlist(item.id)}>
                        Wishlist
                    </button>


                    {(item.media_type === 'tv' || String(item.id).startsWith('tv_')) && (
                        <button
                            className="btn btn-sm px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors shadow-lg shadow-blue-900/20"
                            onClick={() => onSelect?.(item)}
                        >
                            Manage Progress
                        </button>
                    )}

                    <a
                        className="btn btn-sm px-4 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-medium border border-white/5 transition-colors"
                        href={`https://www.themoviedb.org/movie/${item.tmdb_id}`}
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
