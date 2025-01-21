/**
 * Retrieves the value of a specified query parameter from the current URL.
 *
 * @param {string} parameterName - The name of the query parameter to retrieve.
 * @returns {string | null} The value of the query parameter, or null if not found.
 *
 * @example
 * // If the URL is "https://example.com?user=alice"
 * const user = getQueryParam("user");
 * console.log(user); // "alice"
 */
export function getQueryParam(parameterName: string): string | null {
    // Guard against server-side rendering or non-browser environments
    if (typeof window === 'undefined') {
      return null;
    }
  
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(parameterName);
  }
  
  /**
   * Resets the browser's URL to remove any query parameters (and optionally the hash),
   * without triggering a page reload.
   *
   * @example
   * // If the URL is "https://example.com?user=alice#section1"
   * resetURL();
   * // Resulting URL: "https://example.com"
   */
  export function resetURL(): void {
    // Guard against server-side rendering or non-browser environments
    if (typeof window === 'undefined') {
      return;
    }
  
    // Further guard if history API is not available
    if (!window.history || typeof window.history.replaceState !== 'function') {
      return;
    }
  
    // Replace the current URL with the pathname only (this removes query and hash)
    window.history.replaceState({}, document.title, window.location.pathname);
  }
  