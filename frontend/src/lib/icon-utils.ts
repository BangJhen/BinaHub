/**
 * Icon utility — fetch & cache SVG icons from Tabler Icons
 * Tabler Icons: https://tabler-icons.io/
 * CDN: https://cdn.jsdelivr.net/npm/@tabler/icons@latest/tabler-icons/icons/
 * 
 * Icon names: https://tabler-icons.io/
 */

// Tabler Icons CDN
const TABLER_ICONS_CDN = "https://cdn.jsdelivr.net/npm/@tabler/icons@latest/tabler-icons/icons";
const iconCache = new Map<string, string>();

export type IconSize = "16" | "20" | "24" | "32" | "48";

/**
 * Fetch SVG icon from Tabler Icons CDN
 * @param name - Icon name (e.g., "bookmark", "heart", "star")
 * @param size - Icon size: 16, 20, 24, 32, 48 (default: 24)
 */
export async function getIcon(
  name: string,
  size: IconSize = "24"
): Promise<string> {
  const cacheKey = `${name}-${size}`;

  // Return from cache if available
  if (iconCache.has(cacheKey)) {
    return iconCache.get(cacheKey)!;
  }

  try {
    // Tabler Icons path: /{name}.svg
    const url = `${TABLER_ICONS_CDN}/${name}.svg`;
    const response = await fetch(url);

    if (!response.ok) {
      console.warn(`Icon not found: ${name} at ${url}`);
      return ""; // Return empty string if icon not found
    }

    let svg = await response.text();
    
    // Resize SVG if needed (Tabler icons are 24x24 by default)
    if (size !== "24") {
      svg = svg.replace(/width="24"/, `width="${size}"`).replace(/height="24"/, `height="${size}"`);
    }
    
    iconCache.set(cacheKey, svg);
    return svg;
  } catch (error) {
    console.error(`Failed to fetch icon ${name}:`, error);
    return "";
  }
}

/**
 * Get icon URL directly (for img src or background-image)
 */
export function getIconUrl(
  name: string,
  size: IconSize = "24"
): string {
  return `${TABLER_ICONS_CDN}/${name}.svg`;
}

/**
 * Available Tabler Icons (common ones for job matching app)
 * Full list: https://tabler-icons.io/
 */
export const ICONS = {
  // Bookmarks & saves
  bookmark: "bookmark",
  bookmarkFilled: "bookmark-filled",
  
  // Actions
  heart: "heart",
  heartFilled: "heart-filled",
  star: "star",
  starFilled: "star-filled",
  check: "check",
  x: "x",
  trash: "trash",
  
  // Navigation
  search: "search",
  filter: "filter",
  sort: "sort-ascending",
  
  // Info
  info: "info-circle",
  warning: "alert-triangle",
  error: "circle-x",
  
  // Location & work
  mapPin: "map-pin",
  briefcase: "briefcase",
  building: "building",
  
  // Money
  coin: "coin",
  
  // Time
  clock: "clock",
  calendar: "calendar",
  
  // Sparkle
  sparkles: "sparkles",
  target: "target",
} as const;


