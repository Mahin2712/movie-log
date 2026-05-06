import React, { createContext, useMemo } from "react";
import { useSync } from "../hooks/useSync";

export const LibraryContext = createContext();

/**
 * LibraryProvider
 * Supplies the global library state and loading status.
 * Mutations are handled via useLibraryActions hook.
 */
export function LibraryProvider({ children }) {
    const { library, setLibrary, loading } = useSync();

    // Derived States for easier consumption
    const watched = useMemo(() =>
        Object.values(library).filter(item =>
            ['watched', 'completed', 'watching'].includes(item.status)
        ), [library]);

    const wishlist = useMemo(() =>
        Object.values(library).filter(item =>
            item.status === 'wishlist'
        ), [library]);

    const ratings = useMemo(() => {
        const map = {};
        Object.values(library).forEach(item => {
            if (item.rating) map[item.id] = item.rating;
        });
        return map;
    }, [library]);

    const value = {
        library,
        setLibrary, // Needed by useLibraryActions
        loading,
        watched,
        wishlist,
        ratings
    };

    return (
        <LibraryContext.Provider value={value}>
            {children}
        </LibraryContext.Provider>
    );
}
