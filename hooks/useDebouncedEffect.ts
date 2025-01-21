import { useEffect, useState, useRef, DependencyList } from "react";

/**
 * A custom React hook that executes a callback function after a specified delay,
 * resetting the timer whenever the provided dependencies change.
 *
 * @param callback - The function to execute after the delay.
 * @param delay - The debouncing delay in milliseconds.
 * @param deps - The dependency list; effect is re-triggered when these change.
 * @returns A boolean indicating whether the debounced callback is currently waiting to fire.
 *
 * @example
 * const isWaiting = useDebouncedEffect(
 *   () => {
 *     // This function runs only after "searchTerm" hasn't changed for 500ms
 *     performSearch(searchTerm);
 *   },
 *   500,
 *   [searchTerm]
 * );
 *
 * // Optionally display a loading spinner or indicator
 * if (isWaiting) {
 *   return <Spinner />;
 * }
 */
export function useDebouncedEffect(
  callback: () => void,
  delay: number,
  deps: DependencyList
): boolean {
  const [isWaiting, setIsWaiting] = useState(false);

  // A ref to store the latest callback to avoid triggering effect 
  // due to inline function re-creations each render (optional but recommended).
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    // Defensive: if delay is invalid, skip debouncing
    if (typeof delay !== "number" || delay <= 0) {
      callbackRef.current();
      return;
    }

    setIsWaiting(true);

    const handler = setTimeout(() => {
      // Execute the latest callback from ref
      callbackRef.current();

      setIsWaiting(false);
    }, delay);

    // Cleanup: clear the timeout if dependencies change or component unmounts
    return () => clearTimeout(handler);
    // Include 'delay' if you want to re-debounce on delay changes
  }, [delay, ...deps]);

  return isWaiting;
}
