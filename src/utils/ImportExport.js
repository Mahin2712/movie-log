// ============================================================================
// EXPORT UTILITIES
// ============================================================================
import { libraryService } from "../sync/libraryService";
import { normalizeId, fetchTMDBDetails, tmdbToMediaItem, delay } from "../services/tmdbService";

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
 * Deduplicates and merges imported items array before hydration
 */
export function deduplicateImportItems(items) {
  const map = new Map();
  for (const item of items) {
    const tmdbId = normalizeId(item.tmdb_id);
    const mediaType = item.media_type || "movie";
    if (!tmdbId) continue;
    const key = `${mediaType}_${tmdbId}`; // Standard key format

    const existing = map.get(key);
    if (!existing) {
      map.set(key, { ...item });
    } else {
      // Merge: prefer hydrated fields (title, year, etc.)
      map.set(key, {
        ...existing,
        ...item,
        title: item.title || existing.title || "",
        year: item.year || existing.year || null,
        poster_path: item.poster_path || existing.poster_path || undefined,
        overview: item.overview || existing.overview || "",
        rating: item.rating ?? existing.rating ?? null,
        dateAdded: (item.dateAdded && existing.dateAdded)
          ? (new Date(item.dateAdded) < new Date(existing.dateAdded) ? item.dateAdded : existing.dateAdded)
          : (item.dateAdded || existing.dateAdded)
      });
    }
  }
  return Array.from(map.values());
}

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
  onProgress,
  listContext
}) {
  if (!items || items.length === 0) {
    alert("No items to import");
    return;
  }

  // Deduplicate items first
  const uniqueItems = deduplicateImportItems(items);

  const existingMap = new Map();
  media.forEach(m => {
    // Standard key format: mediaType_tmdbId
    const key = `${m.media_type}_${m.tmdb_id}`;
    existingMap.set(key, m);
  });

  let importedCount = 0;
  let skippedCount = 0;
  let failedCount = 0;
  const failedItems = [];

  const BATCH_SIZE = 5;
  const totalItems = uniqueItems.length;

  for (let i = 0; i < uniqueItems.length; i += BATCH_SIZE) {
    const batch = uniqueItems.slice(i, i + BATCH_SIZE);

    const batchPromises = batch.map(async (item) => {
      const tmdbId = normalizeId(item.tmdb_id);
      const mediaType = item.media_type || "movie";

      if (!tmdbId) {
        return { status: 'skipped', reason: 'no_id' };
      }

      const key = `${mediaType}_${tmdbId}`; // Standard key format
      if (existingMap.has(key)) {
        return { status: 'skipped', reason: 'duplicate', key };
      }

      // Hydrate from TMDB
      const result = await fetchTMDBDetails(tmdbId, mediaType);

      if (!result.success) {
        // Hydration failed - create partial item but preserve title/year from import if they exist
        const partialItem = {
          ...item,
          id: key,
          title: item.title || `Untitled (${tmdbId})`,
          year: item.year || null,
          _hydrationStatus: "partial",
          poster_path: item.poster_path || null,
          overview: item.overview || "Failed to load details from TMDB"
        };
        return { status: 'failed', item: partialItem, key };
      }

      const userOverlay = {
        dateAdded: item.dateAdded,
        rating: item.rating,
        status: item.status || (item.listType === 'wishlist' ? 'wishlist' : undefined)
      };

      if (mediaType === "tv" && item.progress) {
        userOverlay.progress = deserializeProgress(item.progress);
      }

      const hydratedItem = tmdbToMediaItem(result.data, mediaType, userOverlay);
      return { status: 'imported', item: hydratedItem, key };
    });

    const batchResults = await Promise.allSettled(batchPromises);

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
        skippedCount++;
      }
    });

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

    if (i + BATCH_SIZE < uniqueItems.length) {
      await delay(200);
    }
  }

  // Save only new items to avoid rewriting everything!
  const itemsToSave = [];
  existingMap.forEach((val, key) => {
    const inOriginal = media.some(m => `${m.media_type}_${m.tmdb_id}` === key);
    if (!inOriginal) {
      itemsToSave.push(val);
    }
  });

  if (itemsToSave.length > 0) {
    await libraryService.saveItems(itemsToSave);
  }

  let message = `Import complete!\n\nImported: ${importedCount}\nSkipped (duplicates): ${skippedCount}`;
  if (failedCount > 0) {
    message += `\n\n⚠️ Warning: ${failedCount} items couldn't be fully loaded from TMDB.\nThey were added with metadata from import.`;
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
    const key = `${m.media_type}_${m.tmdb_id}`; // Standard key format
    existingMap.set(key, m);
  });

  let importedCount = 0;
  let skippedCount = 0;

  // Deduplicate items first
  const uniqueItems = deduplicateImportItems(items);
  const itemsToSave = [];

  for (const item of uniqueItems) {
    let tmdbId = extractTmdbId(item);
    tmdbId = normalizeId(tmdbId);
    const mediaType = item.media_type || "movie";

    if (!tmdbId && item.title) {
      const year =
        item.release_year ||
        item.release_date?.slice(0, 4) ||
        item.first_air_date?.slice(0, 4) ||
        "";

      const searchType = mediaType === "tv" ? "tv" : "movie";
      try {
        const res = await fetch(
          `${TMDB_BASE}/search/${searchType}?api_key=${apiKey}&query=${encodeURIComponent(item.title)}&year=${year}`
        );
        const data = await res.json();
        tmdbId = normalizeId(data.results?.[0]?.id);
      } catch (err) {
        console.warn("Failed to search TMDB for legacy item", err);
      }

      await delay(200);
    }

    if (!tmdbId) {
      skippedCount++;
      continue;
    }

    const key = `${mediaType}_${tmdbId}`; // Standard key format
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
      itemsToSave.push(normalized);
      importedCount++;
    } else {
      // Otherwise fetch from TMDB
      const result = await fetchTMDBDetails(tmdbId, mediaType);
      if (result.success) {
        const hydratedItem = tmdbToMediaItem(result.data, mediaType, {
          dateAdded: item.dateAdded,
          rating: item.rating,
          status: item.status
        });
        itemsToSave.push(hydratedItem);
        importedCount++;
      } else {
        // Hydration failed, create partial item but preserve title
        const partialItem = {
          ...item,
          id: key,
          tmdb_id: tmdbId,
          media_type: mediaType,
          title: item.title || `Untitled (${tmdbId})`,
          year: item.year || null,
          _hydrationStatus: "partial",
          dateAdded: item.dateAdded || new Date().toISOString()
        };
        itemsToSave.push(partialItem);
        importedCount++;
      }

      await delay(200);
    }
  }

  if (itemsToSave.length > 0) {
    await libraryService.saveItems(itemsToSave);
  }

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
  if (!file) {
    alert("Missing file.");
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

  // Sync and return the final synced library
  const finalLibrary = await libraryService.sync();
  return finalLibrary;
}
