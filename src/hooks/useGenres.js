import { useState, useEffect } from "react";

/**
 * useGenres Hook
 * Fetches and maintains a map and array of TMDB genres.
 */
export function useGenres() {
    const [genresMap, setGenresMap] = useState({});
    const [genresArray, setGenresArray] = useState([]);

    useEffect(() => {
        const fetchGenres = async () => {
            try {
                const { fetchFromTMDB } = await import("../services/tmdbClient");
                const data = await fetchFromTMDB("/genre/movie/list");
                
                const map = {};
                const arr = (data.genres || []).map((g) => ({
                    id: g.id,
                    name: g.name,
                }));
                (data.genres || []).forEach((g) => (map[g.id] = g.name));
                
                setGenresMap(map);
                setGenresArray(arr);
            } catch (err) {
                console.error("Failed to fetch genres:", err);
            }
        };
        fetchGenres();
    }, []);

    return { genresMap, genresArray };
}
