/**
 * Merge Rules for Auth-Aware Firestore Sync
 * 
 * Identity: media_type + tmdb_id
 * 
 * Rules:
 * - Watched > Wishlist (Movies)
 * - Completed > Watching > Wishlist (TV)
 * - Rating: Latest updatedAt wins
 * - DateAdded: Earliest wins
 * - UpdatedAt: Latest wins
 * - TV watchedEpisodes: UNION(local, cloud)
 * - Never delete user progress automatically
 */

// Helper to generate consistent media keys
export const getMediaKey = (mediaType, tmdbId) => `${mediaType}_${tmdbId}`;

// Helper to determine status priority value (higher is better)
const getStatusPriority = (status) => {
    switch (status) {
        case 'completed': return 3;
        case 'watched': return 3; // Treat 'watched' same as 'completed' for movies
        case 'watching': return 2;
        case 'wishlist': return 1;
        default: return 0;
    }
};

/**
 * Merges two library items (local and cloud).
 * Returns the merged item.
 */
export const mergeItems = (local, cloud) => {
    // If one is missing, return the other
    if (!local) return cloud;
    if (!cloud) return local;

    // Ensure we are merging the same item
    if (local.tmdb_id !== cloud.tmdb_id || local.media_type !== cloud.media_type) {
        console.error("Attempting to merge different items", local, cloud);
        return cloud; // Fail safe to cloud
    }

    const merged = { ...cloud }; // Start with cloud as base

    // 1. Status Merge (Highest Priority Wins)
    const localPriority = getStatusPriority(local.status);
    const cloudPriority = getStatusPriority(cloud.status);

    if (localPriority > cloudPriority) {
        merged.status = local.status;
    } else {
        merged.status = cloud.status;
    }

    // 2. Date Added (Earliest Wins)
    // Handle Firestore Timestamps vs Date objects/strings
    const localDateAdded = new Date(local.dateAdded?.seconds ? local.dateAdded.seconds * 1000 : local.dateAdded).getTime();
    const cloudDateAdded = new Date(cloud.dateAdded?.seconds ? cloud.dateAdded.seconds * 1000 : cloud.dateAdded).getTime();

    // If local is valid and earlier than cloud (or cloud invalid), take local
    if (localDateAdded && (!cloudDateAdded || localDateAdded < cloudDateAdded)) {
        merged.dateAdded = local.dateAdded;
    }

    // 3. UpdatedAt (Latest Wins) - Drives other fields like rating
    const localUpdatedAt = new Date(local.updatedAt?.seconds ? local.updatedAt.seconds * 1000 : local.updatedAt).getTime();
    const cloudUpdatedAt = new Date(cloud.updatedAt?.seconds ? cloud.updatedAt.seconds * 1000 : cloud.updatedAt).getTime();

    const localIsNewer = localUpdatedAt && (!cloudUpdatedAt || localUpdatedAt > cloudUpdatedAt);

    if (localIsNewer) {
        merged.updatedAt = local.updatedAt;
        merged.rating = local.rating; // Rating follows latest update
    }

    // 4. TV Specific: Watched Episodes (Union)
    if (merged.media_type === 'tv') {
        const localEpisodes = new Set(local.progress?.watchedEpisodes || []);
        const cloudEpisodes = new Set(cloud.progress?.watchedEpisodes || []);

        const unionEpisodes = Array.from(new Set([...localEpisodes, ...cloudEpisodes])).sort();

        merged.progress = {
            watchedEpisodes: unionEpisodes
        };

        // Edge Case: If union has episodes, status should at least be 'watching' if it was 'wishlist'
        if (unionEpisodes.length > 0 && merged.status === 'wishlist') {
            merged.status = 'watching';
        }
    }

    // 5. Ensure critical TMDB metadata is preserved (prefer cloud, fallback to local)
    merged.title = cloud.title || local.title;
    merged.poster_path = cloud.poster_path || local.poster_path;
    merged.release_date = cloud.release_date || local.release_date;
    merged.first_air_date = cloud.first_air_date || local.first_air_date; // TV

    return merged;
};

/**
 * Batch merge a local library into a cloud library map.
 * @param {Object} localLibrary - Keyed by mediaKey
 * @param {Object} cloudLibrary - Keyed by mediaKey
 * @returns {Object} updates - Map of items that need to be written/updated in cloud
 */
export const mergeLibrary = (localLibrary, cloudLibrary) => {
    const changes = {};

    // Check all local items against cloud
    Object.values(localLibrary).forEach(localItem => {
        const key = getMediaKey(localItem.media_type, localItem.tmdb_id);
        const cloudItem = cloudLibrary[key];

        const merged = mergeItems(localItem, cloudItem);

        // If merged is different from cloud, it's a change to be written
        // Simple distinct check - optimization can come later
        // For migration, we generally write everything that matters
        changes[key] = merged;
    });

    return changes;
};
