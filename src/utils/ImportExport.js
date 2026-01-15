// ============================================================================
// EXPORT UTILITIES
// ============================================================================

/**
 * Formats human-readable filename for exports
 * Format: WatchedList_15-Jan-2026_142items.json
 */
function formatFileName(listType, count) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const date = new Date();
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  const prefix = listType === 'watched' ? 'WatchedList' : 'Wishlist';
  return `${prefix}_${day}-${month}-${year}_${count}items.json`;
}

/**
 * Serializes a media item for export, keeping only user-generated data
 * and minimal identifiers. All TMDB metadata will be re-fetched on import.
 */
export function serializeForExport(item, listType = 'watched') {
  const base = {
    tmdb_id: item.tmdb_id,
    media_type: item.media_type,
    title: item.title,
    year: item.year,
    status: item.status,
    rating: item.rating ?? null,
    dateAdded: item.dateAdded,
    listType: listType // NEW: metadata to preserve list context
  };

  // For TV shows, include compact progress
  if (item.media_type === "tv" && item.progress?.watchedItems) {
    const watchedEpisodes = [];
    for (const [key, watched] of Object.entries(item.progress.watchedItems)) {
      if (watched) {
        const [season, episode] = key.split("_");
        watchedEpisodes.push(`${season}x${episode.padStart(2, "0")}`);
      }
    }
    base.progress = {
      watchedEpisodes: watchedEpisodes.sort(), // e.g., ["1x01", "1x02"]
      lastWatched: item.progress.lastWatched || null
    };
  }

  return base;
}

/**
 * Exports watched list to JSON file with minimal schema
 */
export function exportWatched({ watched, ratings }) {
  const payload = {
    app: "movie-log",
    version: 3,
    schema: "minimal-v1",
    exportedAt: new Date().toISOString(),
    listContext: "watched", // NEW: top-level list type metadata
    settings: {
      language: "en",
      theme: "dark"
    },
    library: watched.map(item => {
      const serialized = serializeForExport(item, 'watched');
      // Overlay rating from ratings map if exists
      if (ratings && ratings[item.id] !== undefined) {
        serialized.rating = ratings[item.id];
      }
      return serialized;
    })
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = formatFileName('watched', watched.length);
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Exports wishlist to JSON file with minimal schema
 */
export function exportWishlist({ wishlist }) {
  const payload = {
    app: "movie-log",
    version: 3,
    schema: "minimal-v1",
    exportedAt: new Date().toISOString(),
    listContext: "wishlist", // NEW: top-level list type metadata
    settings: {
      language: "en",
      theme: "dark"
    },
    library: wishlist.map(item => serializeForExport(item, 'wishlist'))
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = formatFileName('wishlist', wishlist.length);
  a.click();
  URL.revokeObjectURL(url);
}

// ============================================================================
// IMPORT UTILITIES
// ============================================================================

export const normalizeId = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

export const extractTmdbId = (item) => {
  const keys = ["tmdb_id", "tmdb-id", "tmdbId", "tmdb", "movie_id", "id"];
  for (const k of keys) {
    const n = normalizeId(item[k]);
    if (n) return n;
  }
  return null;
};

/**
 * Converts compact episode format to internal map
 * ["1x01", "1x02"] -> {"1_1": true, "1_2": true}
 */
function deserializeProgress(compactProgress) {
  if (!compactProgress?.watchedEpisodes) return null;

  const watchedItems = {};
  for (const ep of compactProgress.watchedEpisodes) {
    const match = ep.match(/^(\d+)x(\d+)$/);
    if (match) {
      const [, season, episode] = match;
      const key = `${season}_${parseInt(episode, 10)}`;
      watchedItems[key] = true;
    }
  }

  return {
    watchedItems,
    lastWatched: compactProgress.lastWatched || null,
    watchedCount: Object.keys(watchedItems).length,
    percentage: 0 // Will be recalculated by app
  };
}

/**
 * Fetches full TMDB details for a media item
 * Returns { success: true, data } or { success: false, error }
 */
async function fetchTMDBDetails(tmdbId, mediaType, apiKey, TMDB_BASE) {
  try {
    const endpoint = mediaType === "tv" ? "tv" : "movie";
    const res = await fetch(
      `${TMDB_BASE}/${endpoint}/${tmdbId}?api_key=${apiKey}`
    );

    if (!res.ok) {
      return { success: false, error: `TMDB error: ${res.status}` };
    }

    const data = await res.json();
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
function tmdbToMediaItem(tmdbData, mediaType, userOverlay = {}) {
  const isTV = mediaType === "tv";

  const item = {
    id: `${tmdbData.id}_${mediaType}`,
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
    overview: tmdbData.overview,
    dateAdded: userOverlay.dateAdded || new Date().toISOString(),
    rating: userOverlay.rating ?? null
  };

  // TV-specific fields
  if (isTV) {
    item.status = userOverlay.status || "In Progress";
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
 * Delay utility for rate limiting
 */
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Main import function with hydration from TMDB
 * Handles v3 minimal exports with concurrent batch processing
 */
export async function hydrateFromTMDBAndImport({
  items,
  media,
  apiKey,
  importMedia,
  TMDB_BASE,
  onProgress, // NEW: optional callback for progress updates
  listContext // NEW: list context from export file
}) {
  if (!items || items.length === 0) {
    alert("No items to import");
    return;
  }

  const existingMap = new Map();
  media.forEach(m => {
    const key = `${m.tmdb_id}_${m.media_type}`;
    existingMap.set(key, m);
  });

  let importedCount = 0;
  let skippedCount = 0;
  let failedCount = 0;
  const failedItems = [];

  const BATCH_SIZE = 5; // Process 5 items concurrently
  const totalItems = items.length;

  // Process items in batches
  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE);

    // Process batch items concurrently
    const batchPromises = batch.map(async (item) => {
      const tmdbId = normalizeId(item.tmdb_id);
      const mediaType = item.media_type || "movie";

      // Skip if no TMDB ID
      if (!tmdbId) {
        return { status: 'skipped', reason: 'no_id' };
      }

      // Skip if already exists
      const key = `${tmdbId}_${mediaType}`;
      if (existingMap.has(key)) {
        return { status: 'skipped', reason: 'duplicate', key };
      }

      // Hydrate from TMDB
      const result = await fetchTMDBDetails(tmdbId, mediaType, apiKey, TMDB_BASE);

      if (!result.success) {
        // Hydration failed - create partial item
        const partialItem = {
          ...item,
          id: key,
          _hydrationStatus: "partial",
          poster_path: null,
          overview: "Failed to load details from TMDB"
        };
        return { status: 'failed', item: partialItem, key };
      }

      // Success - merge TMDB data with user overlay
      const userOverlay = {
        dateAdded: item.dateAdded,
        rating: item.rating,
        status: item.status || (item.listType === 'wishlist' ? 'wishlist' : undefined)
      };

      // Restore TV progress if present
      if (mediaType === "tv" && item.progress) {
        userOverlay.progress = deserializeProgress(item.progress);
      }

      const hydratedItem = tmdbToMediaItem(result.data, mediaType, userOverlay);
      return { status: 'imported', item: hydratedItem, key };
    });

    // Wait for all items in batch to complete
    const batchResults = await Promise.allSettled(batchPromises);

    // Process batch results
    batchResults.forEach((result) => {
      if (result.status === 'fulfilled') {
        const data = result.value;

        if (data.status === 'imported') {
          existingMap.set(data.key, data.item);
          importedCount++;
        } else if (data.status === 'failed') {
          failedItems.push(data.item);
          existingMap.set(data.key, data.item);
          failedCount++;
        } else if (data.status === 'skipped') {
          skippedCount++;
        }
      } else {
        // Promise rejection (shouldn't happen but handle gracefully)
        skippedCount++;
      }
    });

    // Report progress
    const processed = Math.min(i + BATCH_SIZE, totalItems);
    if (onProgress) {
      onProgress({
        processed,
        total: totalItems,
        imported: importedCount,
        skipped: skippedCount,
        failed: failedCount
      });
    }

    // Rate limit: delay between batches (not per item)
    if (i + BATCH_SIZE < items.length) {
      await delay(200);
    }
  }

  // Update store
  importMedia(Array.from(existingMap.values()));

  // Show results
  let message = `Import complete!\n\nImported: ${importedCount}\nSkipped (duplicates): ${skippedCount}`;
  if (failedCount > 0) {
    message += `\n\n⚠️ Warning: ${failedCount} items couldn't be fully loaded from TMDB.\nThey were added with minimal information.`;
  }
  alert(message);
}

/**
 * Legacy import for v2 exports (backward compatibility)
 * Handles old format with full TMDB data already included
 */
export async function legacyImport({
  items,
  media,
  apiKey,
  importMedia,
  TMDB_BASE
}) {
  const existingMap = new Map();
  media.forEach(m => {
    const key = `${m.tmdb_id}_${m.media_type}`;
    existingMap.set(key, m);
  });

  let importedCount = 0;
  let skippedCount = 0;

  for (const item of items) {
    let tmdbId = extractTmdbId(item);
    tmdbId = normalizeId(tmdbId);
    const mediaType = item.media_type || "movie";

    // Try to search by title if no ID
    if (!tmdbId && item.title) {
      const year =
        item.release_year ||
        item.release_date?.slice(0, 4) ||
        item.first_air_date?.slice(0, 4) ||
        "";

      const searchType = mediaType === "tv" ? "tv" : "movie";
      const res = await fetch(
        `${TMDB_BASE}/search/${searchType}?api_key=${apiKey}&query=${encodeURIComponent(item.title)}&year=${year}`
      );
      const data = await res.json();
      tmdbId = normalizeId(data.results?.[0]?.id);

      await delay(200);
    }

    if (!tmdbId) {
      skippedCount++;
      continue;
    }

    const key = `${tmdbId}_${mediaType}`;
    if (existingMap.has(key)) {
      skippedCount++;
      continue;
    }

    // If legacy export already has full data, use it directly
    if (item.overview && item.poster_path !== undefined) {
      const normalized = {
        ...item,
        id: key,
        tmdb_id: tmdbId,
        media_type: mediaType,
        dateAdded: item.dateAdded || new Date().toISOString()
      };
      existingMap.set(key, normalized);
      importedCount++;
    } else {
      // Otherwise fetch from TMDB
      const result = await fetchTMDBDetails(tmdbId, mediaType, apiKey, TMDB_BASE);
      if (result.success) {
        const hydratedItem = tmdbToMediaItem(result.data, mediaType, {
          dateAdded: item.dateAdded,
          rating: item.rating,
          status: item.status
        });
        existingMap.set(key, hydratedItem);
        importedCount++;
      } else {
        skippedCount++;
      }

      await delay(200);
    }
  }

  importMedia(Array.from(existingMap.values()));

  alert(
    `Legacy import complete!\n\nImported: ${importedCount}\nSkipped: ${skippedCount}`
  );
}

/**
 * Main entry point for file import
 * Detects schema version and routes to appropriate importer
 * Returns the detected list context to route items to correct list
 */
export async function handleImportFile({
  file,
  apiKey,
  watched,
  wishlist,
  setWatched,
  setWishlist,
  TMDB_BASE,
  onProgress
}) {
  if (!file || !apiKey) {
    alert("Missing file or TMDB API key");
    return;
  }

  const text = await file.text();
  let items = [];
  let isLegacy = false;
  let listContext = "watched"; // Default to watched for legacy imports

  if (file.name.endsWith(".json")) {
    const data = JSON.parse(text);

    // Detect schema version
    if (data.schema === "minimal-v1" && data.library) {
      // V3 minimal export - has listContext metadata
      items = data.library;
      listContext = data.listContext || "watched";
      isLegacy = false;
    } else if (data.items || data.movies || data.tv) {
      // V2 or older - legacy format
      items = data.items || data.movies || [];
      if (data.tv) {
        items = [...items, ...data.tv];
      }
      isLegacy = true;
    } else if (Array.isArray(data)) {
      // Raw array - legacy
      items = data;
      isLegacy = true;
    }
  } else if (file.name.endsWith(".csv")) {
    // CSV is always legacy
    const [header, ...rows] = text.split("\n");
    const keys = header.split(",");

    items = rows
      .filter(Boolean)
      .map(row => {
        const values = row.split(",");
        const obj = {};
        keys.forEach((k, i) => (obj[k.trim()] = values[i]?.trim()));
        return obj;
      });
    isLegacy = true;
  }

  // Determine which list to use based on context
  const targetList = listContext === "wishlist" ? wishlist : watched;
  const setTargetList = listContext === "wishlist" ? setWishlist : setWatched;

  // Route to appropriate importer
  if (isLegacy) {
    await legacyImport({
      items,
      media: targetList,
      apiKey,
      importMedia: setTargetList,
      TMDB_BASE
    });
  } else {
    await hydrateFromTMDBAndImport({
      items,
      media: targetList,
      apiKey,
      importMedia: setTargetList,
      TMDB_BASE,
      onProgress,
      listContext
    });
  }
}
