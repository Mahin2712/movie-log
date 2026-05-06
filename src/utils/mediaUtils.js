/**
 * Universal Media Model Normalizer and Helpers
 */

/**
 * Normalizes TMDB movie or TV objects into a universal media object.
 * @param {Object} item - The raw TMDB item.
 * @returns {Object} The normalized media object.
 */
export const normalizeMedia = (item) => {
  // Prevent double-normalization
  if (item.tmdb_id && item.media_type && typeof item.id === "string" && item.id.includes("_")) {
    return item;
  }

  // Accepts TMDB movie or TV object, returns universal media object
  const mediaType = item.media_type || (item.first_air_date ? "tv" : "movie");
  const yearRaw = item.release_date || item.first_air_date || null;
  let year = null;
  
  if (yearRaw) {
    year = Number(yearRaw.slice(0, 4));
    if (!Number.isFinite(year)) year = null;
  }

  return {
    id: `${mediaType}_${item.id}`,
    tmdb_id: item.id,
    media_type: mediaType,
    title: item.title || item.name || "",
    original_title: item.original_title || item.original_name || null,
    year,
    poster_path: item.poster_path || null,
    backdrop_path: item.backdrop_path || null,
    genres: item.genre_ids || item.genres || [],
    genre_ids: item.genre_ids || [], // Keep IDs for filtering
    release_date: item.release_date || null,
    first_air_date: item.first_air_date || null,
    overview: item.overview || "",
    dateAdded: new Date().toISOString(),
    rating: item.rating ?? null,
    seasons: item.number_of_seasons || null,
    episodes: item.number_of_episodes || null,
  };
};

/**
 * Checks if the media item is a TV show.
 */
export const isTVMedia = (item) => {
  return item.media_type === "tv" || (typeof item.id === "string" && item.id.includes("_tv"));
};

/**
 * Gets the release or first air year.
 */
export const getMediaYear = (item) => {
  if (item.year) return item.year;
  const dateStr = item.release_date || item.first_air_date;
  if (!dateStr) return null;
  const year = parseInt(dateStr.slice(0, 4));
  return isNaN(year) ? null : year;
};

/**
 * Gets the display title for the media.
 */
export const getDisplayTitle = (item) => {
  return item.title || item.name || "Untitled";
};

/**
 * Builds a universal ID for a media item.
 */
export const buildMediaKey = (mediaType, tmdbId) => {
  return `${mediaType}_${tmdbId}`;
};
