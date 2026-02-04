export interface ScrollEntry {
  position: number;
  timestamp: number;
  progress: number; // 0-100
}

interface ScrollPositions {
  [slug: string]: ScrollEntry;
}

const STORAGE_KEY = "blog-scroll-positions";

/**
 * Safely get stored scroll positions from localStorage
 */
const getStoredPositions = (): ScrollPositions => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

/**
 * Safely save scroll positions to localStorage
 */
const setStoredPositions = (positions: ScrollPositions): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
  } catch {
    // Silent fail if localStorage is unavailable
  }
};

/**
 * Save scroll position for a blog post
 */
export const saveScrollPosition = (
  slug: string,
  position: number,
  progress: number
): void => {
  const positions = getStoredPositions();
  positions[slug] = {
    position,
    timestamp: Date.now(),
    progress,
  };
  setStoredPositions(positions);
};

/**
 * Get saved scroll position for a blog post
 */
export const getScrollPosition = (slug: string): ScrollEntry | null => {
  const positions = getStoredPositions();
  return positions[slug] || null;
};

/**
 * Clear scroll position for a blog post
 */
export const clearScrollPosition = (slug: string): void => {
  const positions = getStoredPositions();
  delete positions[slug];
  setStoredPositions(positions);
};

/**
 * Remove scroll position entries older than maxAgeDays
 */
export const cleanupOldEntries = (maxAgeDays: number = 30): void => {
  const positions = getStoredPositions();
  const maxAge = maxAgeDays * 24 * 60 * 60 * 1000; // Convert days to milliseconds
  const now = Date.now();

  const cleaned: ScrollPositions = {};
  for (const slug in positions) {
    if (Object.prototype.hasOwnProperty.call(positions, slug)) {
      const entry = positions[slug];
      if (now - entry.timestamp < maxAge) {
        cleaned[slug] = entry;
      }
    }
  }

  setStoredPositions(cleaned);
};
