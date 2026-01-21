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
