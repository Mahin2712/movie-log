import { useState } from "react";
import { IMG_BASE } from "../utils/constants";

export default function WatchedRow({
    item,
    onRemove,
    onMoveToWishlist,
    rating,
    onSetRating,
    genresMap = {}
}) {
    const [open, setOpen] = useState(false);
    const [hover, setHover] = useState(null);
    const [expanded, setExpanded] = useState(false);

    const displayRating = hover ?? rating;
    const starClass = (i) => {
        const v = i + 1;
        if (displayRating >= v) return "full";
        if (displayRating >= v - 0.5) return "half";
        return "";
    };

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
                    src={item.poster_path ? `${IMG_BASE}${item.poster_path}` : ""}
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
                    {rating ? (
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
                            ★ {rating?.toFixed(1)}
                        </span>
                    ) : (
                        <span className="star-icon muted text-zinc-600 hover:text-blue-400 text-2xl">★</span>
                    )}
                </div>

                {/* Title & Year */}
                <div className="pr-12">
                    <h3 className="text-xl font-semibold leading-tight text-white">{item.title}</h3>
                    <div className="flex items-center text-sm text-zinc-400 mt-0.5">
                        <span>{item.year || item.release_date?.slice(0, 4) || item.first_air_date?.slice(0, 4) || "—"}</span>
                        {daysAgo !== null && (
                            daysAgo < 1 ? (
                                <span className="ml-3 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs shadow-sm">New</span>
                            ) : (
                                <span className="ml-3 px-2 py-0.5 rounded-full bg-zinc-800 border border-white/5 text-zinc-400 text-xs font-medium">{daysAgo}d ago</span>
                            )
                        )}
                    </div>
                </div>

                {/* ⭐ STAR PANEL (Absolute) */}
                {open && (
                    <div
                        className="star-panel absolute right-0 top-8 z-50 bg-gray-900 border border-white/10 shadow-2xl rounded-xl p-2 flex gap-1"
                        onMouseLeave={() => setHover(null)}
                    >
                        {Array.from({ length: 10 }).map((_, i) => (
                            <div key={i} className="star-slot relative cursor-pointer">
                                <span className={`text-lg transition-colors ${starClass(i) === "full" ? "text-blue-400" : starClass(i) === "half" ? "text-blue-400/50" : "text-zinc-700"}`}>
                                    ★
                                </span>

                                {/* HALF */}
                                <div
                                    className="absolute top-0 left-0 w-1/2 h-full z-10"
                                    onMouseEnter={() => setHover(i + 0.5)}
                                    onClick={() => {
                                        onSetRating(i + 0.5);
                                        setOpen(false);
                                    }}
                                />

                                {/* FULL */}
                                <div
                                    className="absolute top-0 right-0 w-1/2 h-full z-10"
                                    onMouseEnter={() => setHover(i + 1)}
                                    onClick={() => {
                                        onSetRating(i + 1);
                                        setOpen(false);
                                    }}
                                />
                            </div>
                        ))}
                    </div>
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
