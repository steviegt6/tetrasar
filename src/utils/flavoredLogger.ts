/**
 * Log a generic message with no categorization.
 * @param message The message to log (formatted: "[TETRA.ASAR]: message")
 */
export function log(message: string) {
  console.log("[TETRA.ASAR]: " + message);
}

/**
 * Logs underneath a category.
 * @param category The category.
 * @param message The message to log (formatted: [TETRA.ASAR]: [CATEGORY]: message)
 */
export function logCat(category: string, message: string) {
  log("[" + category + "]: " + message);
}
