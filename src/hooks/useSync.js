import { useState, useEffect } from "react";
import { libraryService } from "../sync/libraryService";
import { useAuth } from "../context/AuthContext";

/**
 * useSync Hook
 * Handles the initialization and synchronization of the library state.
 * Returns the library state and loading status.
 */
export function useSync() {
    const [library, setLibrary] = useState({});
    const [loading, setLoading] = useState(true);
    const { authUser, authLoading } = useAuth();

    useEffect(() => {
        if (authLoading) return;

        let isActive = true;

        // Subscribe to background hydration updates
        const unsubscribeHydration = libraryService.registerHydrationListener((hydratedItem) => {
            if (isActive) {
                setLibrary(prev => ({ ...prev, [hydratedItem.id]: hydratedItem }));
            }
        });

        const initLibrary = async () => {
            // Update service with current user
            libraryService.setUser(authUser);

            // 1. Instant Bootstrap from Local Cache
            const { readLocalLibrary } = await import("../storage/localStore");
            const local = readLocalLibrary();
            if (Object.keys(local).length > 0 && isActive) {
                setLibrary(local);
            }

            setLoading(true);

            try {
                const lib = await libraryService.sync();
                if (isActive) {
                    setLibrary(lib || {});
                }
            } catch (error) {
                console.error("Library sync failed:", error);
            } finally {
                if (isActive) {
                    setLoading(false);
                }
            }
        };

        initLibrary();

        return () => {
            isActive = false;
            unsubscribeHydration();
        };
    }, [authUser, authLoading]);

    return { library, setLibrary, loading };
}
