/**
 * Attempts to copy the provided text to the clipboard.
 * Returns a Promise that resolves to true if successful, false otherwise.
 * 
 * This function:
 * 1) Tries `navigator.clipboard.writeText`.
 * 2) Falls back to a hidden <textarea> + `document.execCommand('copy')` for older browsers.
 * 3) Logs useful errors and warnings.
 * 
 * @param text - The text snippet to copy.
 */
export async function copySnippetToClipboard(text: string): Promise<boolean> {
    if (!text) {
      console.warn("No text was provided to copy.");
      return false;
    }
  
    // 1) Attempt the modern asynchronous Clipboard API
    if (navigator?.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (err) {
        console.warn(
          "Clipboard API failed, falling back to legacy method.",
          err
        );
      }
    } else {
      console.warn(
        "navigator.clipboard.writeText is not available, falling back to legacy method."
      );
    }
  
    // 2) Fallback: create a hidden <textarea> and use document.execCommand("copy")
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
  
      // Avoid scrolling to the bottom on iOS
      textArea.setAttribute("readonly", "");
      textArea.style.position = "absolute";
      textArea.style.left = "-9999px";
  
      document.body.appendChild(textArea);
  
      // Save current selection to restore afterward
      const selection = document.getSelection();
      const originalRange = selection && selection.rangeCount > 0
        ? selection.getRangeAt(0)
        : null;
  
      textArea.select();
      const successful = document.execCommand("copy");
  
      // Restore the original selection
      if (originalRange && selection) {
        selection.removeAllRanges();
        selection.addRange(originalRange);
      }
  
      document.body.removeChild(textArea);
  
      return successful;
    } catch (err) {
      console.error("Fallback copy to clipboard method failed.", err);
      return false;
    }
  }
  