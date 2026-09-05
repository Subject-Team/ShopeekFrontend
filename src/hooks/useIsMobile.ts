import { useState, useEffect } from 'react';

/**
 * Tracks whether the viewport is narrower than the given breakpoint (px),
 * updating on window resize. Initial value is computed synchronously from
 * `window.innerWidth` so first render matches the current viewport.
 */
export const useIsMobile = (breakpoint: number): boolean => {
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < breakpoint);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  return isMobile;
};
