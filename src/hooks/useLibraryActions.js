import { useCallback, useRef } from "react";
import { useLibrary } from "./useLibrary";
import { libraryService } from "../sync/libraryService";
import { normalizeMedia } from "../utils/mediaUtils";

/**
 * useLibraryActions Hook
 * Provides memoized mutation functions for the library with race-condition protection.
 */
export function useLibraryActions() {
    const { setLibrary, library } = useLibrary();
    
    // Track the latest mutation intent per item ID to prevent race conditions
    // Format: { [mediaId]: mutationTimestamp }
    const mutations = useRef({});

    const trackMutation = (id) => {
        const timestamp = Date.now();
        mutations.current[id] = timestamp;
        return timestamp;
    };

    const isMutationLatest = (id, timestamp) => {
        return mutations.current[id] === timestamp;
    };

    const addToWatchlist = useCallback(async (item) => {
        const norm = normalizeMedia(item);
        const mutationId = trackMutation(norm.id);

        const newItem = {
            ...norm,
            status: norm.media_type === 'tv' ? 'watching' : 'watched',
            updatedAt: new Date().toISOString()
        };
        
        // 1. Optimistic Update
        setLibrary(prev => ({ ...prev, [newItem.id]: newItem }));

        try {
            // 2. Cloud Sync
            const saved = await libraryService.saveItem(newItem);
            
            // 3. Only finalize if no newer mutation has started for this item
            if (isMutationLatest(newItem.id, mutationId)) {
                setLibrary(prev => ({ ...prev, [saved.id]: saved }));
            }
            return saved;
        } catch (error) {
            console.error("Add to watchlist failed", error);
            
            // 4. Rollback only if no newer mutation happened
            if (isMutationLatest(newItem.id, mutationId)) {
                setLibrary(prev => {
                    const next = { ...prev };
                    delete next[newItem.id];
                    return next;
                });
            }
            throw error;
        }
    }, [setLibrary]);

    const addToWishlist = useCallback(async (item) => {
        const norm = normalizeMedia(item);
        const mutationId = trackMutation(norm.id);

        const newItem = {
            ...norm,
            status: 'wishlist',
            updatedAt: new Date().toISOString()
        };
        
        // 1. Optimistic Update
        setLibrary(prev => ({ ...prev, [newItem.id]: newItem }));

        try {
            const saved = await libraryService.saveItem(newItem);
            if (isMutationLatest(newItem.id, mutationId)) {
                setLibrary(prev => ({ ...prev, [saved.id]: saved }));
            }
            return saved;
        } catch (error) {
            console.error("Add to wishlist failed", error);
            if (isMutationLatest(newItem.id, mutationId)) {
                setLibrary(prev => {
                    const next = { ...prev };
                    delete next[newItem.id];
                    return next;
                });
            }
            throw error;
        }
    }, [setLibrary]);

    const removeFromLibrary = useCallback(async (id) => {
        const item = library[id];
        if (!item) return;

        const mutationId = trackMutation(id);

        // 1. Optimistic Remove
        setLibrary(prev => {
            const next = { ...prev };
            delete next[id];
            return next;
        });

        try {
            await libraryService.removeItem(item.media_type, item.tmdb_id);
        } catch (error) {
            console.error("Remove from library failed", error);
            // 2. Rollback if latest
            if (isMutationLatest(id, mutationId)) {
                setLibrary(prev => ({ ...prev, [id]: item }));
            }
            throw error;
        }
    }, [library, setLibrary]);

    const setRating = useCallback(async (itemOrId, value) => {
        // 1. Resolve Item and ID
        let item;
        let id;
        
        if (typeof itemOrId === 'object' && itemOrId !== null) {
            const norm = normalizeMedia(itemOrId);
            id = norm.id;
            item = library[id] || norm;
        } else {
            id = String(itemOrId);
            item = library[id];
        }

        if (!item) {
            console.error("Cannot set rating: Item not found and no media object provided.");
            return;
        }

        const mutationId = trackMutation(id);

        const newItem = {
            ...item,
            status: item.status && item.status !== 'wishlist' ? item.status : 'watched',
            rating: value === "" ? null : Number(value),
            updatedAt: new Date().toISOString()
        };

        // 2. Optimistic Update
        setLibrary(prev => ({ ...prev, [id]: newItem }));

        try {
            const saved = await libraryService.saveItem(newItem);
            if (isMutationLatest(id, mutationId)) {
                setLibrary(prev => ({ ...prev, [saved.id]: saved }));
            }
        } catch (error) {
            console.error("Set rating failed", error);
            if (isMutationLatest(id, mutationId)) {
                setLibrary(prev => {
                    const next = { ...prev };
                    if (library[id]) {
                        next[id] = library[id];
                    } else {
                        delete next[id];
                    }
                    return next;
                });
            }
            throw error;
        }
    }, [library, setLibrary]);

    const updateItem = useCallback(async (updatedItem) => {
        const norm = normalizeMedia(updatedItem);
        const prevItem = library[norm.id];
        const mutationId = trackMutation(norm.id);
        
        // 1. Optimistic
        setLibrary(prev => ({ ...prev, [norm.id]: norm }));

        try {
            const saved = await libraryService.saveItem(norm);
            if (isMutationLatest(norm.id, mutationId)) {
                setLibrary(prev => ({ ...prev, [saved.id]: saved }));
            }
            return saved;
        } catch (error) {
            console.error("Update item failed", error);
            if (isMutationLatest(norm.id, mutationId) && prevItem) {
                setLibrary(prev => ({ ...prev, [norm.id]: prevItem }));
            }
            throw error;
        }
    }, [library, setLibrary]);

    return {
        addToWatchlist,
        addToWishlist,
        removeFromLibrary,
        setRating,
        updateItem
    };
}
