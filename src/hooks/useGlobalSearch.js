import { useState, useEffect, useCallback, useRef } from "react";
import { fetchFromTMDB } from "../services/tmdbClient";

export function useGlobalSearch() {
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mediaType, setMediaType] = useState("all"); // all, movie, tv
  
  const abortControllerRef = useRef(null);

  const isSearching = search.trim().length > 0;

  const fetchSearchResults = useCallback(async (query, type) => {
    if (!query.trim()) {
      setSearchResults([]);
      setLoading(false);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoading(true);
    try {
      const endpoint = type === "all" ? "/search/multi" : `/search/${type}`;
      
      const data = await fetchFromTMDB(endpoint, {
        query: query.trim(),
        include_adult: false
      }, {
        signal: abortControllerRef.current.signal
      });
      
      // Normalize Results
      const normalized = (data.results || [])
        .filter(item => item.media_type !== "person" && (item.poster_path || item.profile_path))
        .map(item => ({
          id: item.id,
          tmdb_id: item.id,
          media_type: item.media_type || (type === "all" ? "movie" : type),
          title: item.title || item.name,
          poster_path: item.poster_path,
          release_date: item.release_date || item.first_air_date,
          vote_average: item.vote_average,
          overview: item.overview
        }));

      setSearchResults(normalized);
    } catch (error) {
      if (error.name === "AbortError") return;
      console.error("Search failed:", error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search effect (300ms as requested)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search.trim()) {
        fetchSearchResults(search, mediaType);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [search, mediaType, fetchSearchResults]);

  const clearSearch = useCallback(() => {
    setSearch("");
    setSearchResults([]);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return {
    search,
    setSearch,
    searchResults,
    isSearching,
    loading,
    mediaType,
    setMediaType,
    clearSearch
  };
}

