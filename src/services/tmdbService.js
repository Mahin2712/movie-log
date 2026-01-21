/**
 * TMDB Service
 * Utilities for fetching and normalizing TMDB data using centralized client.
 */

import { fetchFromTMDB } from './tmdbClient';

export const normalizeId = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
};

/**
 * Delay utility for rate limiting
 */
export const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetches full TMDB details for a media item
 * Returns { success: true, data } or { success: false, error }
 */
export async function fetchTMDBDetails(tmdbId, mediaType) {
    try {
        const endpoint = mediaType === "tv" ? "tv" : "movie";
        const data = await fetchFromTMDB(`/${endpoint}/${tmdbId}`);

        if (!data || !data.id) {
            return { success: false, error: "Invalid TMDB response" };
        }

        return { success: true, data };
    } catch (err) {
        return { success: false, error: err.message };
    }
}

/**
 * Converts TMDB response to internal media item format
 */
export function tmdbToMediaItem(tmdbData, mediaType, userOverlay = {}) {
    const isTV = mediaType === "tv";

    const item = {
        id: `${mediaType}_${tmdbData.id}`,
        tmdb_id: tmdbData.id,
        media_type: mediaType,
        title: isTV ? tmdbData.name : tmdbData.title,
        original_title: isTV ? tmdbData.original_name : tmdbData.original_title,
        year: isTV
            ? parseInt(tmdbData.first_air_date?.slice(0, 4) || "0", 10)
            : parseInt(tmdbData.release_date?.slice(0, 4) || "0", 10),
        poster_path: tmdbData.poster_path,
        backdrop_path: tmdbData.backdrop_path,
        genres: tmdbData.genres?.map(g => g.id) || [],
        genre_ids: tmdbData.genres?.map(g => g.id) || [],
        release_date: isTV ? null : tmdbData.release_date,
        first_air_date: isTV ? tmdbData.first_air_date : null,
        last_air_date: isTV ? tmdbData.last_air_date : null,
        in_production: isTV ? tmdbData.in_production : null,
        overview: tmdbData.overview,
        dateAdded: userOverlay.dateAdded || new Date().toISOString(),
        rating: userOverlay.rating ?? null
    };

    // TV-specific fields
    if (isTV) {
        item.status = userOverlay.status || "watching"; // User's tracking status
        item.production_status = tmdbData.status; // TMDB's production status (Ended, Returning Series, etc.)
        item.last_air_date = tmdbData.last_air_date;
        item.in_production = tmdbData.in_production;
        item.number_of_episodes = tmdbData.number_of_episodes;
        item.number_of_seasons = tmdbData.number_of_seasons;
        item.seasonList = tmdbData.seasons || [];

        // Restore progress if provided
        if (userOverlay.progress) {
            item.progress = userOverlay.progress;
        }
    } else {
        item.status = userOverlay.status || "watched";
    }

    return item;
}

/**
 * Hydrates a list of compact library items with TMDB metadata
 */
export async function hydrateLibrary(items) {
    if (!items || items.length === 0) return [];

    console.log(`Hydrating ${items.length} items...`);
    const hydrated = [];
    const BATCH_SIZE = 5;

    for (let i = 0; i < items.length; i += BATCH_SIZE) {
        const batch = items.slice(i, i + BATCH_SIZE);
        const promises = batch.map(async (item) => {
            const result = await fetchTMDBDetails(item.tmdb_id, item.media_type);
            if (result.success) {
                return tmdbToMediaItem(result.data, item.media_type, item);
            } else {
                console.warn(`Failed to hydrate ${item.tmdb_id}: ${result.error}`);
                return item; // Return compact item if fails
            }
        });

        const results = await Promise.all(promises);
        hydrated.push(...results);

        if (i + BATCH_SIZE < items.length) await delay(200);
    }
    return hydrated;
}
