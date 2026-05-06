import { useState, useEffect, useCallback } from "react";

const API_KEY = "9ec0468e7343e06a37803d3600f6888f";
const BASE_URL = "https://api.themoviedb.org/3";

export function useGlobalSearch() {
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mediaType, setMediaType] = useState("all"); // all, movie, tv

  const isSearching = search.trim().length > 0;

  const fetchSearchResults = useCallback(async (query, type) => {
    if (!query.trim()) {
      setSearchResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const endpoint = type === "all" ? "/search/multi" : `/search/${type}`;
      const url = `${BASE_URL}${endpoint}?api_key=${API_KEY}&query=${encodeURIComponent(query)}&include_adult=false`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      // Filter out people/actors if multi-search
      const filtered = (data.results || []).filter(item => 
        item.media_type !== "person" && (item.poster_path || item.profile_path)
      );

      setSearchResults(filtered);
    } catch (error) {
      console.error("Search failed:", error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search.trim()) {
        fetchSearchResults(search, mediaType);
      } else {
        setSearchResults([]);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [search, mediaType, fetchSearchResults]);

  const clearSearch = useCallback(() => {
    setSearch("");
    setSearchResults([]);
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

