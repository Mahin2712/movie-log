/**
 * Generates a TMDB link for a media item based on its type.
 * Fixes the bug where TV shows were linked to /movie/ URLs.
 */
export const getTMDBLink = (item) => {
  if (!item || !item.tmdb_id) return "#";
  const type = item.media_type === "tv" || item.id?.toString().includes("_tv") ? "tv" : "movie";
  return `https://www.themoviedb.org/${type}/${item.tmdb_id}`;
};
