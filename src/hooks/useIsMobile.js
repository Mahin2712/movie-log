import { useState, useEffect } from "react";

/**
 * useIsMobile
 * - Uses matchMedia for zero-flicker breakpoint detection
 * - Defaults to 768px for broader tablet/mobile coverage
 */
export function useIsMobile(width = 768) {
  const [isMobile, setIsMobile] = useState(() => 
    typeof window !== "undefined" ? window.matchMedia(`(max-width: ${width}px)`).matches : false
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${width}px)`);
    
    const handler = (e) => setIsMobile(e.matches);
    
    // Modern API
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [width]);

  return isMobile;
}
