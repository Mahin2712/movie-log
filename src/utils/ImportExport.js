export function exportWishlist({ wishlist }) {
  const payload = {
    app: "movie-log",
    version: 2,
    exportedAt: new Date().toISOString(),
    items: wishlist.map(w => ({ ...w })),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "wishlist_export_v2.json";
  a.click();
  URL.revokeObjectURL(url);
}
// src/utils/importExport.js

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

export async function smartImport({
  items,
  watched,
  apiKey,
  setWatched,
  TMDB_BASE
}) {
  const watchedMap = new Map();

  watched.forEach(m => {
    const id = normalizeId(m.tmdb_id || m.id);
    if (id) watchedMap.set(id, m);
  });

  let importedCount = 0;
  let skippedCount = 0;

  for (const item of items) {
    let tmdbId = extractTmdbId(item);
    tmdbId = normalizeId(tmdbId);

    if (!tmdbId && item.title) {
      const year =
        item.release_year ||
        item.release_date?.slice(0, 4) ||
        "";

      const res = await fetch(
        `${TMDB_BASE}/search/movie?api_key=${apiKey}&query=${encodeURIComponent(item.title)}&year=${year}`
      );
      const data = await res.json();
      tmdbId = normalizeId(data.results?.[0]?.id);
    }

    if (!tmdbId || watchedMap.has(tmdbId)) {
      skippedCount++;
      continue;
    }

    const res = await fetch(
      `${TMDB_BASE}/movie/${tmdbId}?api_key=${apiKey}`
    );
    const m = await res.json();

    if (!m || !m.id) {
      skippedCount++;
      continue;
    }

    watchedMap.set(tmdbId, {
      id: m.id,
      tmdb_id: m.id,
      title: m.title,
      poster_path: m.poster_path,
      release_date: m.release_date,
      overview: m.overview,
      genre_ids: m.genres?.map(g => g.id) || [],
      dateAdded: item.dateAdded || new Date().toISOString(),
      rating: item.rating ?? null
    });

    importedCount++;
  }

  setWatched(Array.from(watchedMap.values()));

  alert(
    `Import finished\n\nImported: ${importedCount}\nSkipped (duplicates): ${skippedCount}`
  );
}

export async function handleImportFile({
  file,
  apiKey,
  watched,
  setWatched,
  TMDB_BASE
}) {
  if (!file || !apiKey) {
    alert("Missing file or TMDB API key");
    return;
  }
  const text = await file.text();

  let items = [];

  if (file.name.endsWith(".json")) {
    const data = JSON.parse(text);
    // Support both old (movies) and new (items) formats
    items = data.items || data.movies || data;
  } else if (file.name.endsWith(".csv")) {
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
  }

  await smartImport({
    items,
    watched,
    apiKey,
    setWatched,
    TMDB_BASE
  });
}

export function exportWatched({ watched, ratings }) {
  const payload = {
    app: "movie-log",
    version: 2,
    exportedAt: new Date().toISOString(),
    items: watched.map(w => ({ ...w, rating: ratings[w.id] ?? w.rating ?? null })),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "watched_export_v2.json";
  a.click();
  URL.revokeObjectURL(url);
}
