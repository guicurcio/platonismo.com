import { useEffect, useRef } from 'react';

/**
 * A React hook that debounces the window resize event and calls the provided callback after the
 * specified delay. Useful to prevent excessive re-renders on continuously resizing the window.
 *
 * @param callback - The function to execute after the debounce delay.
 * @param delay - The debounce delay in milliseconds. Defaults to 300.
 */
export function useDebouncedWindowResize(
  callback: () => void,
  delay: number = 300
): void {
  // Store the callback in a ref to ensure we always have the latest callback,
  // without re-registering the event listener on every render.
  const callbackRef = useRef(callback);

  // Keep ref updated whenever callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    // Early return in non-browser environments (e.g., SSR)
    if (typeof window === 'undefined') return;

    let resizeTimeout: ReturnType<typeof setTimeout> | null = null;

    const handleResize = () => {
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
      resizeTimeout = setTimeout(() => {
        // Execute the latest callback
        callbackRef.current();
      }, delay);
    };

    // Attach the event listener
    window.addEventListener('resize', handleResize);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
    };
  }, [delay]);
}
