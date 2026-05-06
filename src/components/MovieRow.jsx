
import { IMG_BASE } from "../utils/constants";
import { getTMDBLink } from "../utils/tmdb";

// src/components/MovieRow.jsx
export default function MovieRow({
    movie,
    genresMap = {},
    isWatched,
    isWishlisted,
    onMarkWatched,
    onToggleWishlist
}) {
    return (
        <div className="movie-card card-hover movie-row">
            <img className="movie-poster" src={movie.poster_path ? `${IMG_BASE}${movie.poster_path}` : ""} alt={movie.title} />
            <div className="movie-info" style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                    <div style={{ minWidth: "120px" }}>
                        <h3 style={{ marginBottom: 6 }}>{movie.title}</h3>
                        <div className="year">{movie.release_date ? movie.release_date.slice(0, 4) : "—"}</div>
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "flex-start" }}>
                        {/* mark watched button */}
                        <button
                            className={`btn ${isWatched ? "btn-watched" : ""}`}
                            onClick={() => {
                                if (!isWatched) onMarkWatched(movie);
                            }}
                            disabled={isWatched}
                            title={isWatched ? "Already marked as watched" : "Mark as watched"}
                        >
                            {isWatched ? "✓ Watched" : "Mark watched"}
                        </button>
                        {/* wishlist button */}
                        <button
                            className={`wishlist-btn ${isWishlisted ? "active" : ""}  ${isWatched ? "disabled" : ""} `}
                            onClick={() => {
                                if (!isWatched) onToggleWishlist(movie);
                            }}
                            disabled={isWatched}
                            title={isWatched ? "Already watched" : isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                        >
                            {isWishlisted ? "❤️" : "🤍"}
                        </button>

                        <a className="btn btn-ghost" href={getTMDBLink(movie)} target="_blank" rel="noreferrer">Open</a>
                    </div>
                </div>

                <p style={{ marginTop: 10, marginBottom: 10, color: "var(--text-muted)" }}>{movie.overview || ""}</p>

                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    {(movie.genre_ids || []).slice(0, 6).map(gid => (
                        <span key={gid} className="genre-tag">{genresMap[gid] || "Genre"}</span>
                    ))}
                </div>
            </div>
        </div>
    );
}
