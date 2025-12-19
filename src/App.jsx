import React, { useEffect, useRef, useState } from "react";

/* ------------------------ MovieRow ------------------------ */
import MovieRow from "./components/MovieRow.jsx";

/* ------------------------ WatchedRow ------------------------ */
import WatchedRow from "./components/WatchedRow.jsx";

/* ------------------------ WishlistRow ------------------------ */
import WishlistRow from "./components/WishlistRow.jsx";

/* ------------------------ SettingsModal ------------------------ */
import SettingsModal from "./components/SettingsModal.jsx";

/* ---------- import/export helpers ------------------------ */
import { handleImportFile, exportWatched } from "./utils/ImportExport";

/* ---------- All Page ------------------------ */
import AllPage from "./pages/AllPage.jsx";


/**
 * Full App.jsx replacement
 * - Replaces the app UI and fixes:
 *   1) no-bright-white boxes / colors
 *   2) working genre dropdowns (watchlist & wishlist)
 *   3) rating system
 *   4) settings modal/button
 *   5) dropdowns & buttons working
 * - Persisted data in localStorage keys:
 *   movieApp_apiKey, movieApp_watched, movieApp_wishlist, movieApp_ratings, movieApp_refreshMins
 */

import { TMDB_BASE } from "./utils/constants.js";
import { IMG_BASE } from "./utils/constants.js";

export default function App() {
  // Settings / Keys
  const [apiKey, setApiKey] = useState(
    () => localStorage.getItem("movieApp_apiKey") || ""
  );

  // Discovery / main content
  const [popular, setPopular] = useState([]);
  const [discoverResults, setDiscoverResults] = useState([]);
  const [mainSearch, setMainSearch] = useState("");
  const [loadingDiscover, setLoadingDiscover] = useState(false);




  // Top genres from watched
  const getTopGenres = () => {
    const counts = {};

    watched.forEach(m => {
      (m.genre_ids || []).forEach(gid => {
        counts[gid] = (counts[gid] || 0) + 1;
      });
    });

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([gid]) => Number(gid));
  };

  // Recommended movies based on top genres
  const [recommended, setRecommended] = useState([]);



  // Settings modal
  const [showSettings, setShowSettings] = useState(false);

  // Import option from JSON/CSV








  // Genres (map id -> name) and keep also an array for selects
  const [genresMap, setGenresMap] = useState({});
  const [genresArray, setGenresArray] = useState([]); // [{id, name}, ...]

  // Watched/wishlist/ratings
  const [watched, setWatched] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("movieApp_watched") || "[]");
    } catch {
      return [];
    }
  });
  const [wishlist, setWishlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("movieApp_wishlist") || "[]");
    } catch {
      return [];
    }
  });
  const [ratings, setRatings] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("movieApp_ratings") || "{}");
    } catch {
      return {};
    }
  });

  // Watchlist UI: tab/search/filter/sort
  const [activeTab, setActiveTab] = useState("all"); // "all" | "watchlist" | "wishlist"
  const [watchSearch, setWatchSearch] = useState("");
  const [watchFilterGenre, setWatchFilterGenre] = useState("all"); // "all" or genre id (number)
  const [sortField, setSortField] = useState("dateAdded"); // title | rating | dateAdded | releaseDate
  const [sortAsc, setSortAsc] = useState(false);
  const isWatched = (movieId) => { return watched.some(w => w.id === movieId); };
  const isWishlisted = (movieId) => { return wishlist.some(w => w.id === movieId); };



  // Carousel ref
  const carouselRef = useRef(null);

  // Auto-refresh setting
  const [refreshMins, setRefreshMins] = useState(
    () => Number(localStorage.getItem("movieApp_refreshMins") || "30")
  );
  // Exit search mode
  const exitSearchMode = () => {
    setMainSearch("");
    setDiscoverResults([]);
  };


  // Persist to localStorage
  useEffect(() => { localStorage.setItem("movieApp_apiKey", apiKey || "") }, [apiKey]);
  useEffect(() => { localStorage.setItem("movieApp_watched", JSON.stringify(watched)) }, [watched]);
  useEffect(() => { localStorage.setItem("movieApp_wishlist", JSON.stringify(wishlist)) }, [wishlist]);
  useEffect(() => { localStorage.setItem("movieApp_ratings", JSON.stringify(ratings)) }, [ratings]);
  useEffect(() => { localStorage.setItem("movieApp_refreshMins", String(refreshMins)) }, [refreshMins]);

  // Fetch genres (map + array)
  useEffect(() => {
    if (!apiKey) return;
    fetch(`${TMDB_BASE}/genre/movie/list?api_key=${apiKey}`)
      .then(r => r.json())
      .then(data => {
        const map = {};
        const arr = (data.genres || []).map(g => ({ id: g.id, name: g.name }));
        (data.genres || []).forEach(g => map[g.id] = g.name);
        setGenresMap(map);
        setGenresArray(arr);
      })
      .catch(() => { setGenresMap({}); setGenresArray([]); });
  }, [apiKey]);

  // Fetch popular for carousel
  useEffect(() => {
    if (!apiKey) return;
    fetch(`${TMDB_BASE}/movie/popular?api_key=${apiKey}&page=1`)
      .then(r => r.json())
      .then(data => setPopular(data.results || []))
      .catch(() => setPopular([]));
  }, [apiKey]);

  useEffect(() => {
    if (!apiKey || watched.length === 0) {
      setRecommended([]);
      return;
    }

    const fetchRecommendations = async () => {
      const topGenres = getTopGenres();
      if (topGenres.length === 0) return;

      try {
        const url = `${TMDB_BASE}/discover/movie?api_key=${apiKey}&with_genres=${topGenres.join(",")}&sort_by=popularity.desc&page=1`;
        const res = await fetch(url);
        const data = await res.json();

        const filtered = (data.results || []).filter(m =>
          !watched.some(w => w.id === m.id) &&
          !wishlist.some(w => w.id === m.id)
        );

        setRecommended(filtered.slice(0, 8));
      } catch {
        setRecommended([]);
      }
    };

    fetchRecommendations();
  }, [apiKey, watched, wishlist]);


  // main search (discovery)
  const runMainSearch = async (q) => {
    if (!apiKey) return;
    if (!q || q.trim().length === 0) { setDiscoverResults([]); return; }
    setLoadingDiscover(true);
    try {
      const url = `${TMDB_BASE}/search/movie?api_key=${apiKey}&query=${encodeURIComponent(q)}&page=1`;
      const r = await fetch(url);
      const data = await r.json();
      setDiscoverResults(data.results || []);
    } catch (e) {
      console.error(e);
      setDiscoverResults([]);
    } finally {
      setLoadingDiscover(false);
    }
  };

  // ---------- helpers: watched/wishlist/ratings ----------
  // mark as watched (store some movie data including genre ids so filters can work)
  const markWatched = (m) => {
    if (!watched.some(w => w.id === m.id)) {
      const newItem = {
        id: m.id,
        tmdb_id: m.id,
        title: m.title,
        poster_path: m.poster_path || null,   // ✅ ADD THIS
        release_date: m.release_date || null,
        overview: m.overview || "",
        genre_ids: m.genre_ids || [],
        dateAdded: new Date().toISOString(),
        rating: null
      };

      setWatched(p => [newItem, ...p]);
    }
    // remove from wishlist
    setWishlist(p => p.filter(w => w.id !== m.id));
  };

  // Place near other helpers in App component



  const addWishlist = (m) => {
    if (!wishlist.some(w => w.id === m.id)) {
      const newItem = {
        id: m.id,
        tmdb_id: m.id,
        title: m.title,
        poster_path: m.poster_path || null,   // ✅ ADD THIS
        release_date: m.release_date || null,
        overview: m.overview || "",
        genre_ids: m.genre_ids || [],
        dateAdded: new Date().toISOString()
      };

      setWishlist(p => [newItem, ...p]);
    }
  };

  const removeFromWatched = (id) => setWatched(p => p.filter(x => x.id !== id));
  const removeFromWishlist = (id) => setWishlist(p => p.filter(x => x.id !== id));

  // rating setter
  const setRating = (movieId, value) => {
    setRatings(r => ({ ...r, [movieId]: value === "" ? null : Number(value) }));
  };

  // watchlist build: filter/search/sort
  const buildDisplayedWatchlist = () => {
    let list = [...watched];

    // genre filter (works because we now store genre_ids in watched items)
    if (watchFilterGenre && watchFilterGenre !== "all") {
      const gid = Number(watchFilterGenre);
      list = list.filter(m => Array.isArray(m.genre_ids) && m.genre_ids.indexOf(gid) !== -1);
    }

    // text search
    if (watchSearch && watchSearch.trim()) {
      const q = watchSearch.toLowerCase();
      list = list.filter(m => (m.title || "").toLowerCase().includes(q));
    }

    // sort
    list.sort((a, b) => {
      let av, bv;
      if (sortField === "title") {
        av = (a.title || "").toLowerCase();
        bv = (b.title || "").toLowerCase();
        const cmp = av.localeCompare(bv);
        return sortAsc ? cmp : -cmp;
      }
      if (sortField === "rating") {
        av = ratings[a.id] || 0;
        bv = ratings[b.id] || 0;
        return sortAsc ? av - bv : bv - av;
      }
      if (sortField === "releaseDate") {
        av = a.release_date || "";
        bv = b.release_date || "";
        if (!av) return sortAsc ? -1 : 1;
        if (!bv) return sortAsc ? 1 : -1;
        return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      // default: dateAdded
      av = a.dateAdded || "";
      bv = b.dateAdded || "";
      return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
    });

    return list;
  };

  // carousel scroll
  const scrollCarousel = (dir = "right") => {
    const el = carouselRef.current;
    if (!el) return;
    const amount = Math.round(el.clientWidth * 0.7);
    const next = dir === "right" ? el.scrollLeft + amount : el.scrollLeft - amount;
    el.scrollTo({ left: next, behavior: "smooth" });
  };

  const isSearchingMain = mainSearch && mainSearch.trim().length > 0;
  const displayedWatchlist = buildDisplayedWatchlist();

  return (
    <div className={isSearchingMain ? "search-active" : ""}>
      {/* header */}
      <div className="app-header container-max">
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          <div className="app-title">
            <h1 className="text-3xl font-bold bg-linear-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              Movie Log
            </h1>
            <span>keep track of what you watch</span>
          </div>

          <div className="nav-tabs" role="tablist" aria-label="tabs" style={{ marginLeft: 8 }}>
            <button className={activeTab === "all" ? "active" : ""} onClick={() => { exitSearchMode(); setActiveTab("all") }}>All</button>
            <button className={activeTab === "watchlist" ? "active" : ""} onClick={() => { exitSearchMode(); setActiveTab("watchlist") }}>Watchlist</button>
            <button className={activeTab === "wishlist" ? "active" : ""} onClick={() => { exitSearchMode(); setActiveTab("wishlist") }}>Wishlist</button>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <input
            className="search-bar"
            placeholder="Search movies..."
            value={mainSearch}
            onChange={(e) => setMainSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") runMainSearch(mainSearch); }}
          />
          <div style={{ textAlign: "right" }}>
            <div style={{ color: "var(--text-muted)", fontSize: 13 }}>Watched:</div>
            <div style={{ fontWeight: 700, marginTop: 2 }}>{watched.length}</div>
          </div>

          <button className="btn" title="Settings" onClick={() => setShowSettings(true)} style={{ marginLeft: 8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06A2 2 0 0 1 2.3 16.9l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06A2 2 0 0 1 6.7 2.3l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09c.09.6.56 1.09 1.16 1.28.7.24 1.39-.06 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06c-.27.43-.57 1.12-.33 1.82.19.6.68 1.07 1.28 1.16H21a2 2 0 0 1 0 4h-.09c-.6.09-1.09.56-1.28 1.16z"></path>
            </svg>
          </button>
        </div>
      </div>

      {/* All Page */}
      {activeTab === "all" && (
        <AllPage
          popular={popular}
          carouselRef={carouselRef}
          scrollCarousel={scrollCarousel}
        />
      )}


      {activeTab === "all" && !isSearchingMain && recommended.length > 0 && (
        <div className="container-max" style={{ marginTop: 26 }}>
          <div className="carousel-title">
            Recommended for you
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            {recommended.map(m => (
              <MovieRow
                key={m.id}
                movie={m}
                genresMap={genresMap}
                isWatched={isWatched(m.id)}
                isWishlisted={isWishlisted(m.id)}
                onMarkWatched={() => markWatched(m)}
                onToggleWishlist={() => {
                  isWishlisted(m.id)
                    ? removeFromWishlist(m.id)
                    : addWishlist(m);
                }}
              />
            ))}
          </div>
        </div>
      )}


      {/* main content */}
      <div className="container-max" style={{ marginTop: 20 }}>
        {/* search results */}
        {isSearchingMain ? (
          <div style={{ marginTop: 8 }}>
            <div style={{ marginBottom: 10, color: "var(--text-muted)" }}>
              Showing search results for <strong>"{mainSearch}"</strong>
              &nbsp;&nbsp;
              <button className="btn" style={{ marginLeft: 8 }} onClick={() => { setMainSearch(""); setDiscoverResults([]); }}>Clear</button>
            </div>

            {loadingDiscover ? <div style={{ color: "var(--text-muted)" }}>Loading…</div> : (
              <div style={{ display: "grid", gap: 14 }}>
                {(discoverResults || []).map(m => (
                  <MovieRow
                    key={m.id}
                    movie={m}
                    genresMap={genresMap}
                    isWatched={isWatched(m.id)}
                    isWishlisted={isWishlisted(m.id)}
                    onMarkWatched={() => markWatched(m)}
                    onToggleWishlist={() => {
                      isWishlisted(m.id)
                        ? removeFromWishlist(m.id)
                        : addWishlist(m);
                    }} />
                ))}
              </div>
            )}
          </div>
        ) : null}

        {/* watchlist / wishlist panel */}
        {activeTab !== "all" && (
          <div style={{ marginTop: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <input
                placeholder={`Search ${activeTab === "watchlist" ? "watchlist" : "wishlist"}...`}
                className="search-bar"
                value={watchSearch}
                onChange={(e) => setWatchSearch(e.target.value)}
              />

              <select
                className="dropdown-dark"
                value={watchFilterGenre}
                onChange={(e) => setWatchFilterGenre(e.target.value)}
              >
                <option value="all">All genres</option>
                {genresArray.map(g => <option key={g.id} value={String(g.id)}>{g.name}</option>)}
              </select>

              <div style={{ display: "flex", gap: 8, marginLeft: "auto", alignItems: "center" }}>
                <div style={{ color: "var(--text-muted)", fontSize: 13 }}>Sort:</div>
                <select value={sortField} onChange={(e) => setSortField(e.target.value)} style={{ borderRadius: 8, padding: "6px 10px" }}>
                  <option value="dateAdded">Date added</option>
                  <option value="releaseDate">Release date</option>
                  <option value="rating">Rating</option>
                  <option value="title">Title</option>
                </select>

                <button className="btn" onClick={() => setSortAsc(s => !s)} title="Toggle sort order">
                  {sortAsc ? "⇧ Asc" : "⇩ Desc"}
                </button>

                <button className="btn" onClick={() => exportWatched({ watched, ratings })}>
                  Export watched
                </button>


              </div>
            </div>

            <div style={{ marginTop: 14 }}>
              {activeTab === "watchlist" && displayedWatchlist.length === 0 && (
                <div className="card" style={{ padding: 16, color: "var(--text-muted)" }}>No items in watchlist.</div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 10 }}>
                {activeTab === "watchlist" && displayedWatchlist.map(w => (
                  <WatchedRow
                    key={w.id}
                    item={w}
                    genresMap={genresMap}
                    rating={ratings[w.id] || ""}
                    onSetRating={(v) => setRating(w.id, v)}
                    onRemove={() => removeFromWatched(w.id)}
                    onMoveToWishlist={() => {
                      setWishlist(p => [{ ...w, dateAdded: new Date().toISOString() }, ...p]);
                      setWatched(p => p.filter(x => x.id !== w.id));
                    }}
                  />
                ))}

                {activeTab === "wishlist" && wishlist.map(w => (
                  <WishlistRow
                    key={w.id}
                    item={w}
                    onRemove={() => removeFromWishlist(w.id)}
                    onMoveToWatched={() => {
                      setWatched(p => [{ ...w, dateAdded: new Date().toISOString(), genre_ids: w.genre_ids || [] }, ...p]);
                      setWishlist(p => p.filter(x => x.id !== w.id));
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}


      </div>

      {/* settings modal */}
      {showSettings && (
        <SettingsModal
          apiKey={apiKey}
          setApiKey={setApiKey}
          autoRefresh={refreshMins}
          setAutoRefresh={setRefreshMins}
          onImport={(file) =>
            handleImportFile({
              file,
              apiKey,
              watched,
              setWatched,
              TMDB_BASE
            })
          }
          onClose={() => setShowSettings(false)}
        />

      )}


      <div style={{ height: 28 }} />
    </div>
  );
}
