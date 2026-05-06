import { useContext } from "react";
import { LibraryContext } from "../context/LibraryContext";

/**
 * useLibrary Hook
 * Provides access to the centralized library state.
 */
export function useLibrary() {
    const context = useContext(LibraryContext);
    if (!context) {
        throw new Error("useLibrary must be used within a LibraryProvider");
    }
    return context;
}
