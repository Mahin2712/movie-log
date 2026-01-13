import { useState } from "react";
import { IMG_BASE } from "../utils/constants";

export default function WatchedRow({
    item,
    onRemove,
    onMoveToWishlist,
    rating,
    onSetRating
}) {
    const [open, setOpen] = useState(false);
    const [hover, setHover] = useState(null);

    const displayRating = hover ?? rating;
    const starClass = (i) => {
        const v = i + 1;
        if (displayRating >= v) return "full";
        if (displayRating >= v - 0.5) return "half";
        return "";
    };

    return (
        <div className="movie-card wishlist-row">
            <img
                className="movie-poster"
                src={item.poster_path ? `${IMG_BASE}${item.poster_path}` : ""}
                alt={item.title}
            />

            <div className="movie-info" style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <div>
                        <h3 style={{ marginBottom: 6 }}>{item.title}</h3>
                        <div className="year">
                            {item.release_date ? item.release_date.slice(0, 4) : "—"}
                        </div>
                    </div>

                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        {/* RATING DISPLAY */}
                        <div className="rating-display" onClick={() => setOpen(!open)}>
                            {rating ? (
                                <span
                                    style={{
                                        background: "linear-gradient(90deg, #2196f3 0%, #21cbf3 100%)",
                                        WebkitBackgroundClip: "text",
                                        WebkitTextFillColor: "transparent",
                                        fontWeight: 600,
                                        display: "inline-block"
                                    }}
                                >
                                    ★ {rating?.toFixed(1)}
                                </span>
                            ) : (
                                <span className="star-icon muted">★</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* ⭐ STAR PANEL */}
                {open && (
                    <div
                        className="star-panel"
                        onMouseLeave={() => setHover(null)}
                    >
                        {Array.from({ length: 10 }).map((_, i) => (
                            <div key={i} className="star-slot">
                                <span className={`star-visual ${starClass(i)}`}>
                                    ★
                                </span>

                                {/* HALF */}
                                <div
                                    className="star-hit left"
                                    onMouseEnter={() => setHover(i + 0.5)}
                                    onClick={() => {
                                        onSetRating(i + 0.5);
                                        setOpen(false);
                                    }}
                                />

                                {/* FULL */}
                                <div
                                    className="star-hit right"
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

                <p style={{ marginTop: 10, color: "var(--text-muted)" }}>{item.overview || "No description saved."}</p>

                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                    <button className="btn" onClick={() => onRemove(item.id)}>
                        Remove
                    </button>

                    <button className="btn" onClick={() => onMoveToWishlist(item.id)}>
                        Move to Wishlist
                    </button>

                    <a
                        className="btn btn-ghost"
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
