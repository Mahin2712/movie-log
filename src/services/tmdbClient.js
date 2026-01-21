/**
 * TMDB Client
 * Centralized API client for all TMDB requests.
 * Handles API key rotation, base URL, and error handling.
 */

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

// Internal API key pool (randomly selected per request)
const API_KEY_POOL = [
    "7a7013278cf51aa7c20dfb47f2144c50",
    "b8a450c35dd56c6aaa1e0a7113b19880"
];

/**
 * Randomly selects an API key from the pool
 */
function getRandomApiKey() {
    const index = Math.floor(Math.random() * API_KEY_POOL.length);
    return API_KEY_POOL[index];
}

/**
 * Fetches data from TMDB API with automatic key rotation
 * @param {string} endpoint - API endpoint (e.g., "/movie/550")
 * @param {Object} params - Additional query parameters (optional)
 * @param {Object} options - Fetch options (optional)
 * @returns {Promise<Object>} Parsed JSON response
 */
export async function fetchFromTMDB(endpoint, params = {}, options = {}) {
    // Select primary key
    const primaryKey = getRandomApiKey();

    // Build URL with API key
    const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
    url.searchParams.set("api_key", primaryKey);

    // Add additional params
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            url.searchParams.set(key, String(value));
        }
    });

    try {
        const response = await fetch(url.toString(), options);

        // Handle rate limit or auth errors with retry
        if (!response.ok) {
            if (response.status === 401 || response.status === 429) {
                console.warn(`TMDB request failed with ${response.status}, retrying with alternate key...`);

                // Retry with a different key
                const alternateKey = API_KEY_POOL.find(k => k !== primaryKey) || primaryKey;
                url.searchParams.set("api_key", alternateKey);

                const retryResponse = await fetch(url.toString(), options);

                if (!retryResponse.ok) {
                    throw new Error(`TMDB API error: ${retryResponse.status} ${retryResponse.statusText}`);
                }

                return await retryResponse.json();
            }

            throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("TMDB fetch error:", error);
        throw error;
    }
}

/**
 * Helper: Get full image URL
 */
export function getTMDBImageUrl(path, size = "w500") {
    if (!path) return null;
    return `https://image.tmdb.org/t/p/${size}${path}`;
}

/**
 * Export base URL for legacy compatibility
 */
export const TMDB_BASE = TMDB_BASE_URL;
export const IMG_BASE = TMDB_IMAGE_BASE;
