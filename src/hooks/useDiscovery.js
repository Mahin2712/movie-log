import { useState, useEffect, useCallback } from "react";
import { useLibrary } from "./useLibrary";

/**
 * useDiscovery Hook
 * Handles fetching popular movies and generating recommendations based on library state.
 */
export function useDiscovery() {
    const { watched, wishlist } = useLibrary();
    const [popular, setPopular] = useState([]);
    const [recommended, setRecommended] = useState([]);
    const [loading, setLoading] = useState(false);

    const getTopGenres = useCallback(() => {
        const counts = {};
        watched.forEach((m) => {
            (m.genre_ids || []).forEach((gid) => {
                counts[gid] = (counts[gid] || 0) + 1;
            });
        });
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([gid]) => Number(gid));
    }, [watched]);

    // Fetch popular
    useEffect(() => {
        const fetchPopular = async () => {
            setLoading(true);
            try {
                const { fetchFromTMDB } = await import("../services/tmdbClient");
                const data = await fetchFromTMDB("/movie/popular", { page: 1 });
                setPopular(data.results || []);
            } catch (err) {
                console.error("Failed to fetch popular:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPopular();
    }, []);

    // Recommendations
    useEffect(() => {
        if (watched.length === 0) {
            setRecommended([]);
            return;
        }

        const fetchRecommendations = async () => {
            const topGenres = getTopGenres();
            if (topGenres.length === 0) return;
            
            setLoading(true);
            try {
                const { fetchFromTMDB } = await import("../services/tmdbClient");
                const data = await fetchFromTMDB("/discover/movie", {
                    with_genres: topGenres.join(","),
                    sort_by: "popularity.desc",
                    page: 1
                });
                
                const filtered = (data.results || []).filter(
                    (m) =>
                        !watched.some((w) => w.tmdb_id === m.id) &&
                        !wishlist.some((w) => w.tmdb_id === m.id)
                );
                setRecommended(filtered.slice(0, 8));
            } catch (err) {
                console.error("Failed to fetch recommendations:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendations();
    }, [watched, wishlist, getTopGenres]);

    return { popular, recommended, loading };
}
