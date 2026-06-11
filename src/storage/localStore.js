import { getMediaKey } from "../sync/mergeRules";

const LOCAL_STORAGE_KEY = "movie-log-library";
const META_KEY = "movie-log-meta";

/**
 * Local Storage Adapter
 * Responsibilities:
 * - Read/Write local library
 * - Normalize localStorage into compact schema
 * - Never write Firestore here (Dumb Store)
 */

/**
 * Reads the entire library from localStorage
 * Returns a map of mediaKey -> item
 */
export const readLocalLibrary = () => {
    try {
        const json = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (!json) return {};

        const library = JSON.parse(json);

        // Ensure keys are valid and structure is correct
        // In a real migration scenario, we might want to normalize on read
        // to Ensure migrating from legacy formats.

        // Normalization/Validation pass could happen here if needed.
        // Ensure IDs are present (robustness for strict schema)
        Object.keys(library).forEach(key => {
            if (library[key] && !library[key].id) {
                library[key].id = key;
            }
        });

        return library;
    } catch (error) {
        console.error("Error reading local library:", error);
        return {};
    }
};

/**
 * Writes the entire library to localStorage
 * @param {Object} library - Map of mediaKey -> item
 */
export const writeLocalLibrary = (library) => {
    try {
        const json = JSON.stringify(library);
        localStorage.setItem(LOCAL_STORAGE_KEY, json);
    } catch (error) {
        console.error("Error writing local library:", error);
    }
};

/**
 * Update a single item in the local library
 * @param {Object} item - The item to update (must have media_type and tmdb_id)
 */
export const updateLocalItem = (item) => {
    const library = readLocalLibrary();
    const key = getMediaKey(item.media_type, item.tmdb_id);

    library[key] = {
        ...library[key],
        ...item,
        updatedAt: new Date().toISOString() // Identify local updates
    };

    writeLocalLibrary(library);
};

/**
 * Merge TMDB metadata fields into an existing local item.
 * Preserves status, rating, progress, dateAdded, and updatedAt.
 * Does not write if item is deleted/missing.
 */
export const mergeLocalHydratedItem = (hydratedItem) => {
    const library = readLocalLibrary();
    const key = hydratedItem.id;

    if (!library[key]) return null;

    const existing = library[key];

    library[key] = {
        ...existing,
        title: hydratedItem.title || existing.title,
        original_title: hydratedItem.original_title || existing.original_title,
        year: hydratedItem.year || existing.year,
        poster_path: hydratedItem.poster_path !== undefined ? hydratedItem.poster_path : existing.poster_path,
        backdrop_path: hydratedItem.backdrop_path !== undefined ? hydratedItem.backdrop_path : existing.backdrop_path,
        genres: hydratedItem.genres || existing.genres || [],
        genre_ids: hydratedItem.genre_ids || existing.genre_ids || [],
        release_date: hydratedItem.release_date || existing.release_date,
        first_air_date: hydratedItem.first_air_date || existing.first_air_date,
        last_air_date: hydratedItem.last_air_date || existing.last_air_date,
        in_production: hydratedItem.in_production !== undefined ? hydratedItem.in_production : existing.in_production,
        overview: hydratedItem.overview || existing.overview,
        number_of_episodes: hydratedItem.number_of_episodes || existing.number_of_episodes,
        number_of_seasons: hydratedItem.number_of_seasons || existing.number_of_seasons,
        seasonList: hydratedItem.seasonList || existing.seasonList,
        production_status: hydratedItem.production_status || existing.production_status,
        _hydrationStatus: hydratedItem._hydrationStatus
    };

    writeLocalLibrary(library);
    return library[key];
};

/**
 * Remove an item from the local library
 */
export const removeLocalItem = (mediaType, tmdbId) => {
    const library = readLocalLibrary();
    const newKey = `${mediaType}_${tmdbId}`;
    const legacyKey = `${tmdbId}_${mediaType}`;

    let changed = false;
    if (library[newKey]) {
        delete library[newKey];
        changed = true;
    }
    if (library[legacyKey]) {
        delete library[legacyKey];
        changed = true;
    }

    if (changed) {
        writeLocalLibrary(library);
    }
};

/**
 * Read local metadata (e.g. migration flags)
 */
export const readLocalMeta = () => {
    try {
        const json = localStorage.getItem(META_KEY);
        return json ? JSON.parse(json) : {};
    } catch (error) {
        return {};
    }
};

/**
 * Update local metadata
 */
export const updateLocalMeta = (updates) => {
    const meta = readLocalMeta();
    const newMeta = { ...meta, ...updates };
    localStorage.setItem(META_KEY, JSON.stringify(newMeta));
};

/**
 * Check if device has been migrated
 */
export const getDeviceMigrated = () => {
    const meta = readLocalMeta();
    return !!meta.deviceMigrated;
};

/**
 * Set device migration status
 */
export const setDeviceMigrated = (status = true) => {
    updateLocalMeta({ deviceMigrated: status });
};
