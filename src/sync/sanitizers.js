/**
 * Sanitizers for Firestore (Strict Schema)
 * 
 * Enforces:
 * - Movies: tmdb_id, media_type, status, rating, dateAdded, updatedAt
 * - TV: tmdb_id, media_type, status, rating, progress, dateAdded, updatedAt
 * 
 * Strips: title, poster_path, overview, genres, release_date, etc.
 */

export function sanitizeMovieForFirestore(movie) {
    return {
        tmdb_id: Number(movie.tmdb_id),
        media_type: "movie",
        status: movie.status || "watched",
        rating: movie.rating ?? null,
        dateAdded: movie.dateAdded || new Date().toISOString(),
        updatedAt: movie.updatedAt || new Date().toISOString()
    };
}

export function sanitizeTVForFirestore(show) {
    return {
        tmdb_id: Number(show.tmdb_id),
        media_type: "tv",
        status: show.status || "watching",
        rating: show.rating ?? null,
        progress: show.progress || { watchedEpisodes: [] },
        dateAdded: show.dateAdded || new Date().toISOString(),
        updatedAt: show.updatedAt || new Date().toISOString()
    };
}

export function sanitizeForFirestore(item) {
    if (!item) return null;

    // Auto-detect type
    if (item.media_type === 'tv') {
        return sanitizeTVForFirestore(item);
    } else {
        return sanitizeMovieForFirestore(item);
    }
}
