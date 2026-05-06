import { useState, useEffect, useRef } from 'react';

/**
 * useMinimumLoading Hook
 * Ensures that a loading state remains active for at least `minDuration` ms.
 * 
 * @param {boolean} isLoading - The actual loading state from data fetching.
 * @param {number} minDuration - The minimum time in ms to show the loading state.
 * @returns {boolean} - The effective loading state to use in the UI.
 */
export function useMinimumLoading(isLoading, minDuration = 400) {
    const [effectiveLoading, setEffectiveLoading] = useState(isLoading);
    const startTimeRef = useRef(null);
    const timerRef = useRef(null);

    useEffect(() => {
        if (isLoading) {
            // Started loading
            startTimeRef.current = Date.now();
            setEffectiveLoading(true);
            
            // Clear any existing timer
            if (timerRef.current) clearTimeout(timerRef.current);
        } else {
            // Finished loading
            if (startTimeRef.current) {
                const elapsed = Date.now() - startTimeRef.current;
                const remaining = minDuration - elapsed;

                if (remaining > 0) {
                    // Show for the remaining time
                    timerRef.current = setTimeout(() => {
                        setEffectiveLoading(false);
                        startTimeRef.current = null;
                    }, remaining);
                } else {
                    // Already passed minDuration
                    setEffectiveLoading(false);
                    startTimeRef.current = null;
                }
            } else {
                // If it wasn't loading to begin with or state changed without startTime
                setEffectiveLoading(false);
            }
        }

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [isLoading, minDuration]);

    return effectiveLoading;
}
